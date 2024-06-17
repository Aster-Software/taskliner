import { z } from "zod";
import { EsormQuery, EsormQueryBuilder } from "../common/query";
import { makeAutoObservable, observe, runInAction } from "mobx";
import { createEffect, onCleanup } from "solid-js";
import { ClientQueryModule as ClientQueryModule } from "./client-query";
import { deterministicStringify } from "../common/utils";
import { ClientSocketModule } from "./client-socket";
import { ClientOperationsModule } from "./client-operations";
import { ClientApiDriver } from "./client-api-driver";
import { set } from "./client-utils";
import { EsormSchemaDefinition } from "../common/schema";

export const EsormClient = <R extends { _SCHEMATYPE: EsormSchemaDefinition }>(clientOptions: EsormClientOptions) => {
  type SchemaType = R["_SCHEMATYPE"];
  type BaseType = { _id: string };
  type EntityType<K extends keyof SchemaType> = BaseType &
    Partial<{ [P in keyof SchemaType[K]["properties"]]: z.infer<SchemaType[K]["properties"][P]["schema"]> }>;
  type FinalType = { [Key in keyof SchemaType]: EntityType<Key> };

  const apiDriver = new ClientApiDriver({ clientOptions });
  const operationsModule = new ClientOperationsModule({ apiDriver });
  const queryModule = new ClientQueryModule<FinalType>({ apiDriver });
  const socketModule = new ClientSocketModule({
    url: "/ws",
    operationsModule,
    queryModule,
  });

  callbackPerObject({
    target: queryModule.queries,
    getKey: (x) => x.key,
    onCallback: () => {},
    onCleanup: () => {},
  });

  const client = {
    apiDriver,
    operationsModule,
    queryModule,
    socketModule,

    /** For use with SolidJS */
    createQuery: <Key extends keyof FinalType & string>(
      getOptions: () => {
        type: Key;
        query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
        sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
        limit?: number;
        offset?: number;
      },
    ) => {
      const state = makeAutoObservable({
        get query() {
          console.log("GETTING");

          const options = getOptions();

          return queryModule.getOrCreateQuery(options);
        },
      });

      createEffect(() => {
        const query = state.query;

        onCleanup(() => query.dispose());
      });

      return state;
    },

    createEntityValue: <Key extends keyof SchemaType & string>(type: Key, value: EntityType<Key>) => {
      queryModule.updateEntities(type, [value]);

      set(operationsModule.operationsLocal.types, type, (x) => x ?? {});
      set(operationsModule.operationsLocal.types[type], value._id, () => ({ action: "create", data: value }));
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

      set(operationsModule.operationsLocal.types, type, (x) => x ?? {});
      set(operationsModule.operationsLocal.types[type], target._id, (x) => x ?? { action: "update", data: {} });
      set(operationsModule.operationsLocal.types[type][target._id].data, key, () => value);
    },
  };

  return client;
};

const createSelfCleaningCache = () => {
  const cache = {} as Record<string, any>;
  const counts = {} as Record<string, number>;

  return {
    getOrCreate: <T>(scope: any, init: () => T): T => {
      const key = deterministicStringify(scope);

      cache[key] = cache[key] ?? init();
      counts[key] = (counts[key] ?? 0) + 1;

      return cache[key];
    },
    cleanup: (scope: any) => {
      const key = deterministicStringify(scope);

      counts[key] = Math.max(0, (counts[key] ?? 0) - 1);

      if ((counts[key] ?? 0) <= 0) {
        delete cache[key];
        delete counts[key];
      }
    },
  };
};

const callbackPerObject = <T>(options: { target: Record<string, T>; getKey: (o: T) => string; onCallback: (o: T) => void; onCleanup: (o: T) => void }) => {
  const cache = new Set<string>();

  observe(options.target, (changes) => {
    console.log({ changes });
  });
};

export type EsormClientOptions = {};
