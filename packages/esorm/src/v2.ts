import { createClient as createMongoDBClient } from "./mongo";
import { z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { EsormQuery, EsormQueryOptions } from "./query";
import { inspect } from "util";
import { EsormBatchOperation } from "./batch";
import { create2DSet } from "./utils";
import { ServerSocketModule } from "./server/server-socket";
import { ServerWatcherModule } from "./server/server-watcher";
import { EntityType, EsormSchemaDefinition } from "./common/schema";

export const Esorm = async <T extends EsormSchemaDefinition, XUser>(params: {
  port: number;
  mongodb_db: string;
  mongodb_url: string;
  schema: T;
  authenticate: () => Promise<XUser>;
  authorize: { [Key in keyof T]: (x: EntityType<T[Key]["properties"]>, user: XUser) => boolean };
}) => {
  const client = await createMongoDBClient(params.mongodb_url);
  const session = await client.startSession();
  const db = client.db(params.mongodb_db);

  type TKey = keyof T & string;

  const result = {
    start: () => {
      const app = new Hono();

      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();

        console.log("REQ");

        log(body);

        const user = await params.authenticate();

        const data = await (async () => {
          if (body.action === "get-many") return await result.getManyWithAuthorization(body, user);
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

      const watcher = new ServerWatcherModule({ db });
      const socketModule = new ServerSocketModule({ db, watcher });
    },

    createEntity: async <K extends TKey>(type: K, obj: EntityType<T[K]["properties"]>) => {
      //   await result.apply_operation({
      //     operation: "create",
      //     type,
      //     id: createId(),
      //     data: obj,
      //   });
    },
    getOne: async (type: TKey, id: string) => {
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

      const items = await db.collection(query.type).find(filter).limit(10000).toArray();

      return items;
    },

    getManyWithAuthorization: async (query: EsormQueryOptions, user: XUser) => {
      const itemsRaw = await result.getMany(query);
      const itemsFiltered = itemsRaw.filter((x) => params.authorize[query.type](x as any, user));

      return itemsFiltered;
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
