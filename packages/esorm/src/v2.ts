import { ObjectId } from "mongodb";
import { createClient as createMongoDBClient } from "./mongo";
import { set, util, z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { EsormQuery, EsormQueryOptions } from "./query";
import { inspect } from "util";
import { createId } from "@paralleldrive/cuid2";
import { EsormOperation } from "./operation";
import { EsormBatchOperation } from "./batch";
import { WebSocket, WebSocketServer } from "ws";

type EsormPropertyType = "string" | "number" | "boolean";
type EsormProperty = { schema: z.ZodTypeAny };
type EsormPropertiesDefinition = Record<string, EsormProperty>;

export type EsormSchemaDefinition = Record<
  string,
  {
    relations: {};
    properties: EsormPropertiesDefinition;
  }
>;

export const Esorm = async <T extends EsormSchemaDefinition>(params: { port: number; mongodb_db: string; mongodb_url: string; schema: T }) => {
  const client = await createMongoDBClient(params.mongodb_url);
  const db = client.db(params.mongodb_db);

  const session = await client.startSession();

  const psm = createPubSubManager<{
    "entity-create": { db: string; collection: string; document: any };
    "entity-update": { db: string; collection: string; document: any };
    "entity-delete": { db: string; collection: string; document: any };
  }>();

  db.watch([], { fullDocument: "updateLookup" }).on("change", (e) => {
    console.log(e);

    const ee = e as any; // Be free, little birdy (event)
    const payload = { db: ee.ns.db, collection: ee.ns.coll, document: ee.fullDocument };

    if (e.operationType === "create") psm.emit("entity-create", payload);
    if (e.operationType === "update") psm.emit("entity-update", payload);
    if (e.operationType === "delete") psm.emit("entity-delete", payload);
  });

  type CollectionKey = keyof T & string;

  type SchemaType = T;
  type EntityType<K extends keyof SchemaType> = Partial<{ [P in keyof SchemaType[K]["properties"]]: z.infer<SchemaType[K]["properties"][P]["schema"]> }>;
  type FinalType = { [Key in keyof SchemaType]: EntityType<Key> };

  const result = {
    start: () => {
      const app = new Hono();

      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();

        console.log("REQ");
        log(body);

        const data = await (async () => {
          if (body.action === "get-many") return await result.getMany(body);
          if (body.action === "create-one") return await result.createEntity(body.type, body.data);
          if (body.action === "apply-operation") return await result.applyBatchOperation(body.operations);
        })();

        return c.json({ data });
      });

      app.routes.forEach((route) => {
        console.log("API ROUTE: ", route.method, route.path);
      });

      serve(
        {
          fetch: app.fetch,
          port: params.port,
        },
        () => console.log(`ESORM server is running on port ${params.port}`),
      );

      // Websockets
      const wss = new WebSocketServer(
        {
          port: 8080,
        },
        () => {
          console.log("Websocket server started on port 8080");
        },
      );

      wss.on("connection", function connection(ws) {
        ws.on("error", console.error);

        ws.on("message", function message(data) {
          const json = JSON.parse(data.toString());

          console.log("MESSAGE", json);
        });

        ws.send(JSON.stringify({ type: "Hello World" }));
      });
    },

    createEntity: async <K extends keyof T & string>(type: K, obj: EntityType<K>) => {
      await result.apply_operation({
        operation: "create",
        type,
        id: createId(),
        data: obj,
      });
    },
    getOne: async (type: CollectionKey, id: string) => {
      return await db.collection(type).findOne({ _id: id as any });
    },
    getMany: async (query: EsormQueryOptions) => {
      const serialize = (target: any, condition?: EsormQuery) => {
        if (condition === undefined) return target;

        if (condition.operator === "and") target["$and"] = condition.conditions.map((x) => serialize({}, x));
        else if (condition.operator === "or") target["$or"] = condition.conditions.map((x) => serialize({}, x));
        else if (condition.operator === "=") target[condition.column] = { $eq: condition.value };
        else if (condition.operator === "!=") target[condition.column] = { $not: { $eq: condition.value } };
        else if (condition.operator === "in") target[condition.column] = { $in: condition.value };

        return target;
      };

      const filter = serialize({}, query.query);

      log(filter);

      return await db.collection(query.type).find(filter).toArray();
    },

    apply_operation: async (operation: EsormOperation) => {
      if (operation.operation === "create") {
        await db.collection(operation.type).insertOne({ ...operation.data, _id: operation.id as any });
      }

      if (operation.operation === "update") {
        await db.collection(operation.type).updateOne(
          { _id: operation.id as any },
          {
            $set: { [operation.column]: operation.value },
          },
        );
      }

      if (operation.operation === "delete") {
        await db.collection(operation.type).deleteOne({ _id: operation.id as any });
      }
    },
    apply_operations: async (operations: EsormOperation[]) => {
      // TODO: This can be massively optimized by batching operations into three builk insert, update, and delete operations.

      await session.withTransaction(async () => {
        for (const operation of operations) {
          await result.apply_operation(operation);
        }
      });
    },

    applyBatchOperation: async (operation: EsormBatchOperation) => {
      console.log("Applying Operations...");

      for (const type in operation.types) {
        const t = operation.types[type];

        for (const [id, entry] of Object.entries(t)) {
          if (entry.action === "create") {
            await db.collection(type).insertOne({ ...entry.data, _id: id as any });
          }

          if (entry.action === "update") {
            await db.collection(type).updateOne({ _id: id as any }, { $set: entry.data });
          }

          if (entry.action === "delete") {
            await db.collection(type).deleteOne({ _id: id as any });
          }
        }
      }
    },

    _SCHEMATYPE: undefined as T,
  };

  return result;
};

export const EsormTypes = {
  string: { schema: z.string() },
  number: { schema: z.number() },
  boolean: { schema: z.boolean() },
};

const log = (x) => console.log(inspect(x, { showHidden: false, depth: null, colors: true }));

const createPubSubManager = <T extends Record<string, any>>() => {
  const subscriptions = create2DSet();

  return {
    emit: <Key extends keyof T & string>(e: Key, args: T[Key]) => {
      subscriptions.values(e).forEach((fn) => fn(args));
    },
    subscribe: <Key extends keyof T & string>(e: Key, callback: (args: T[Key]) => {}) => {
      const obj = [e, callback];

      subscriptions.add(e, obj);

      return () => subscriptions.delete(e, obj);
    },
  };
};

const create2DSet = () => {
  const map = {} as Record<string, Set<any>>;

  return {
    values: (scope: string) => [...(map[scope] ?? [])],
    add: (scope: string, obj: any) => {
      if (map[scope] === undefined) map[scope] = new Set();

      map[scope].add(obj);
    },
    delete: (scope: string, obj: any) => {
      if (map[scope] === undefined) map[scope] = new Set();

      map[scope].delete(obj);
    },
  };
};
