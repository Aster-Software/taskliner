import { ObjectId } from "mongodb";
import { createClient as createMongoDBClient } from "./mongo";
import { util, z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { EsormQuery, EsormQueryOptions } from "./query";
import { inspect } from "util";
import { createId } from "@paralleldrive/cuid2";
import { EsormOperation } from "./operation";

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

  type CollectionKey = keyof T & string;

  type SchemaType = T;
  type EntityType<K extends keyof SchemaType> = Partial<{ [P in keyof SchemaType[K]["properties"]]: z.infer<SchemaType[K]["properties"][P]["schema"]> }>;
  type FinalType = { [Key in keyof SchemaType]: EntityType<Key> };

  const result = {
    start: () => {
      const app = new Hono();

      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();

        console.log("REQ", body);

        const data = await (async () => {
          if (body.action === "get-many") return await result.getMany(body);
          if (body.action === "create-one") return await result.createEntity(body.type, body.data);
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

      console.log(inspect(filter, { showHidden: false, depth: null, colors: true }));

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

    _SCHEMATYPE: undefined as T,
  };

  return result;
};

export const EsormTypes = {
  string: { schema: z.string() },
  number: { schema: z.number() },
  boolean: { schema: z.boolean() },
};
