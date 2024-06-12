import { createId } from "@paralleldrive/cuid2";
import type { ColumnType, KyselyProps } from "kysely";
import { Kysely, KyselyConfig } from "kysely";

type EsormColumnType = "int4" | "int8" | "bool" | "float4" | "float8" | "text" | "jsonb";
type EsormColumn = { type: EsormColumnType; references?: string; onDelete?: "CASCADE" | "SET NULL" };
type EsormPropertiesDefinition = Record<string, EsormColumn>;
type EsormSchemaDefinition = Record<
  string,
  {
    relations: {};
    properties: EsormPropertiesDefinition;
  }
>;

export const Esorm = <T extends EsormSchemaDefinition>(schema: T, connection: Kysely<any>) => {
  type DB = {
    [Key in keyof T]: {
      id: string;
      created: number;
      updated: number;
      data: Generated<Json>;
    };
  };

  type Operation =
    | {
        operation: "delete";
        type: keyof DB & string;
        id: string;
      }
    | {
        operation: "create";
        type: keyof DB & string;
        id: string;
      }
    | {
        operation: "update";
        type: keyof DB & string;
        id: string;
        path: string[];
        value: any;
      };

  const db = connection as Kysely<DB>;

  const result = {
    db,
    schema,

    get: async <K extends keyof T & string>(type: K) => {
      return await db.selectFrom(type).selectAll().orderBy("created").execute();
    },
    create: async <K extends keyof T & string>(type: K, data: any) => {
      const record: any = {
        id: createId(),
        created: Date.now(),
        updated: Date.now(),
        data,
      };

      await db.insertInto(type).values([record]).execute();
    },

    /** Apply one operation */
    apply_operation: async (db: Kysely<DB>, operation: Operation) => {
      console.log("APPLY", operation);

      if (operation.operation === "create") {
        const record: any = {
          id: operation.id,
          created: Date.now(),
          updated: Date.now(),
          data: {},
        };

        await db.insertInto(operation.type).values([record]).execute();
      }

      if (operation.operation === "delete") {
        await db
          .deleteFrom(operation.type)
          .where("id", "=", operation.id as any)
          .executeTakeFirst();
      }

      if (operation.operation === "update") {
        if (operation.path.length === 0) return;

        const item: any = await db
          .selectFrom(operation.type)
          .where("id", "=", operation.id as any)
          .select("data")
          .executeTakeFirstOrThrow();

        let current = item.data;
        let p = operation.path.slice(1);
        let k = operation.path.at(-1);

        for (const key of p) {
          current = typeof current === "object" ? current[key] : undefined;
        }

        if (typeof current === "object") {
          current[k] = operation.value;
        }

        await db
          .updateTable(operation.type)
          .where("id", "=", operation.id as any)
          .set("data", item.data)
          .execute();
      }

      return;
    },

    /** Apply many operations */
    apply_operations: async (operations: Operation[]) => {
      await db.transaction().execute(async (db) => {
        for (const operation of operations) {
          await result.apply_operation(db, operation);
        }
      });
    },

    _type_db: undefined as DB,
    _type_schema: undefined as T,
  };

  return result;
};

export type EsormDatabaseType<T extends ReturnType<typeof Esorm<any>>> = T["_type_db"];
export type EsormSchemaType<T extends ReturnType<typeof Esorm<any>>> = T["_type_schema"];

// ---

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U> ? ColumnType<S, I | undefined, U> : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;
export type Json = JsonValue;
export type JsonArray = JsonValue[];
export type JsonObject = {
  [K in string]?: JsonValue;
};
export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;
