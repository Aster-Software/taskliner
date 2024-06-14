import { z } from "zod";
import { EsormSchemaDefinition } from "./v2";
import { EsormQuery, EsormQueryBuilder } from "./query";
import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, onCleanup } from "solid-js";
import { EsormOperation } from "./operation";

export const EsormClient = <R extends { _SCHEMATYPE: EsormSchemaDefinition }>() => {
  type SchemaType = R["_SCHEMATYPE"];
  type BaseType = { _id: string };
  type EntityType<K extends keyof SchemaType> = BaseType &
    Partial<{ [P in keyof SchemaType[K]["properties"]]: z.infer<SchemaType[K]["properties"][P]["schema"]> }>;
  type FinalType = { [Key in keyof SchemaType]: EntityType<Key> };

  const req = async (body: any) => {
    const response = await fetch("/api/entity", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = await response.json();

      return (json as any).data as unknown;
    }
  };

  const cache = {
    operationsCommitting: [] as EsormOperation[], // Operations that are local that are being committed
    operationsLocal: [] as EsormOperation[], // Operations that are local that are not yet being committed
  };

  const update = async () => {
    if (cache.operationsLocal.length) {
      console.log("Pushing Updates...");

      cache.operationsCommitting = cache.operationsLocal;
      cache.operationsLocal = [];

      await req({
        operation: "operations",
        operations: cache.operationsCommitting,
      });
    }

    setTimeout(update, 1000);
  };

  update();

  const client = {
    createOne: async <Key extends keyof SchemaType>(type: Key, data: EntityType<Key>) => {
      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-one",
          type,
          data,
        }),
      });

      if (response.ok) {
        const json = await response.json();

        return (json as any).data as FinalType[Key][];
      }
    },
    getMany: async <Key extends keyof FinalType>(options: {
      type: Key;
      query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
      sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
      limit?: number;
      offset?: number;
    }) => {
      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-many",
          type: options.type,
          query: options.query?.(EsormQueryBuilder),
          sort: options.sort,
          limit: options.limit,
          offset: options.offset,
        }),
      });

      if (response.ok) {
        const json = await response.json();

        return (json as any).data as FinalType[Key][];
      }
    },

    createQuery: <Key extends keyof FinalType>(
      options: () => {
        type: Key;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
        limit?: number;
        offset?: number;
      },
    ) => {
      const state = makeAutoObservable({
        isLoading: true,
        isError: false,
        data: [] as EntityType<Key>[],

        success: (data: EntityType<Key>[]) => {
          console.log("QUERY SUCCESS");

          state.isLoading = false;
          state.isError = false;
          state.data = data;
        },
        error: () => {
          state.isLoading = false;
          state.isError = true;
        },
      });

      createEffect(async () => {
        let isCurrent = true;

        onCleanup(() => (isCurrent = false));

        const o = options();

        const result = await client.getMany(o);

        if (o.limit) {
          state.success(result.slice(0, o.limit));
        } else {
          state.success(result);
        }
      });

      return state;
    },

    setEntityValue: <Key extends keyof SchemaType & string, K extends keyof EntityType<Key> & string>(
      type: Key,
      target: EntityType<Key>,
      key: K,
      value: EntityType<Key>[K] | undefined,
    ) => {
      runInAction(() => {
        target[key] = value;
      });

      cache.operationsLocal.push({
        operation: "update",
        type,
        id: target._id,
        column: key,
        value,
      });
    },
  };

  return client;
};

type EsormBatchOperation = {
  create: Record<string, any>;
  update: Record<string, any>;
  delete: Record<string, any>;
};
