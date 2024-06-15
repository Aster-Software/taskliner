import { z } from "zod";
import { EsormSchemaDefinition } from "./v2";
import { EsormQuery, EsormQueryBuilder } from "./query";
import { makeAutoObservable, reaction, runInAction, untracked } from "mobx";
import { createEffect, createMemo, onCleanup, untrack } from "solid-js";
import { createStore } from "solid-js/store";
import { checkDoesBatchOperationRecordHaveChanges, createBatchOperationRecord } from "./batch";

export const EsormClient = <R extends { _SCHEMATYPE: EsormSchemaDefinition }>() => {
  type SchemaType = R["_SCHEMATYPE"];
  type BaseType = { _id: string };
  type EntityType<K extends keyof SchemaType> = BaseType &
    Partial<{ [P in keyof SchemaType[K]["properties"]]: z.infer<SchemaType[K]["properties"][P]["schema"]> }>;
  type FinalType = { [Key in keyof SchemaType]: EntityType<Key> };

  createSocket({
    url: "/ws",
    onConnect: (ws) => {
      ws.addEventListener("open", () => {
        ws.send(JSON.stringify({ action: "subscribe", data: "Hello World" }));

        ws.addEventListener("message", (e) => {
          const json = JSON.parse(e.data);

          console.log("WS: Message", json);
        });
      });
    },
  });

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

  const cache = makeAutoObservable({
    entities: new Map<string, any>(),
    queries: {} as Record<string, any>,

    updateEntities: <K extends keyof FinalType & string>(type: K, entities: EntityType<K>[]) => {
      entities.forEach((entity) => {
        const key = `${type}|${entity._id}`;

        cache.entities.set(key, entity);
      });
    },
  });

  const manager = {
    operationsCommitting: createBatchOperationRecord(), // Operations that are local that are being committed
    operationsLocal: createBatchOperationRecord(), // Operations that are local that are not yet being committed
  };

  const update = async () => {
    if (checkDoesBatchOperationRecordHaveChanges(manager.operationsLocal)) {
      console.log("Pushing Updates...", manager.operationsLocal);

      manager.operationsCommitting = manager.operationsLocal;
      manager.operationsLocal = createBatchOperationRecord();

      await req({
        action: "apply-operation",
        operations: manager.operationsCommitting,
      });
    }

    setTimeout(update, 1000);
  };

  update();

  const getOrCreateQuery = <Key extends keyof FinalType & string>(options: {
    type: Key;
    query?: (qb: typeof EsormQueryBuilder) => EsormQuery;
    sort?: string | [string, "asc" | "desc"] | [string, "asc" | "desc"][];
    limit?: number;
    offset?: number;
  }) => {
    const query = options.query(EsormQueryBuilder);
    const key = deterministicStringify({
      ...options,
      query,
    });

    const create = () => {
      console.log("Creating Query", key);

      const state = makeAutoObservable({
        key,

        count: 1,

        isLoading: true,
        isError: false,

        get data() {
          const r: EntityType<Key>[] = [...cache.entities]
            .filter(([key, value]) => {
              if (!key.startsWith(options.type)) return false;

              return query ? checkEntityPassesQuery(query, value) : true;
            })
            .map(([key, value]) => value);

          return r;
        },

        start: async () => {
          runInAction(() => {
            state.isLoading = true;
            state.isError = false;
          });

          const result = await client.getMany(options);

          state.success(result);

          cache.updateEntities(options.type, result);
        },
        success: (data: EntityType<Key>[]) => {
          console.log("QUERY SUCCESS");

          state.isLoading = false;
          state.isError = false;
        },
        error: () => {
          state.isLoading = false;
          state.isError = true;
        },
        dispose: () => {
          console.log("DISPOSING QUERY (?)");

          cache.queries[key].count--;

          if (cache.queries[key].count === 0) {
            console.log("EMPTY QUERY. REMOVING...");

            delete cache.queries[key];
          }
        },
      });

      untracked(() => state.start());

      return state;
    };

    runInAction(() => {
      if (cache.queries[key] === undefined) {
        cache.queries[key] = create();
      } else {
        cache.queries[key].count++;
      }
    });

    return cache.queries[key] as ReturnType<typeof create>;
  };

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
    }) => {
      // TODO: This method should basically create a query, read the data, and then unsubscribe from the query right away.
      // This way, this function uses the exact same logic as other queries, but does not hold onto the subscription longer than necessary.
      // The user should be warned that using esorm this way is not recommended.

      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-many",
          type: options.type,
          query: options.query?.(EsormQueryBuilder),
          sort: options.sort,
        }),
      });

      if (response.ok) {
        const json = await response.json();

        return (json as any).data as FinalType[Key][];
      } else {
        throw new Error(response.statusText);
      }
    },

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

          return getOrCreateQuery(options);
        },
      });

      createEffect(() => {
        const query = state.query;

        onCleanup(() => query.dispose());
      });

      return state;
    },

    createEntityValue: <Key extends keyof SchemaType & string>(type: Key, value: EntityType<Key>) => {
      cache.updateEntities(type, [value]);

      s(manager.operationsLocal.types, type, (x) => x ?? {});
      s(manager.operationsLocal.types[type], value._id, () => ({ action: "create", data: value }));
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

      s(manager.operationsLocal.types, type, (x) => x ?? {});
      s(manager.operationsLocal.types[type], target._id, (x) => x ?? { action: "update", data: {} });
      s(manager.operationsLocal.types[type][target._id].data, key, () => value);
    },
  };

  return client;
};

const s = (target, key, setter) => {
  const t = target[key];

  target[key] = setter(t);
};

const checkEntityPassesQuery = (query: EsormQuery, entity: any) => {
  if (query.operator === "and") return query.conditions.every((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "or") return query.conditions.some((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "=") return entity[query.column] === query.value;
  if (query.operator === "!=") return entity[query.column] !== query.value;
  if (query.operator === "in") return query.value.includes(entity[query.column]);

  return false;
};

const createSocket = (options: { url: string; onConnect: (ws: WebSocket) => void }) => {
  let ws = null as WebSocket;

  const reconnect = () => {
    console.log("WS: Reconnecting");

    ws = new WebSocket(options.url);

    options.onConnect(ws);

    ws.addEventListener("open", () => {
      console.log("WS: Connected");
    });

    ws.addEventListener("close", () => {
      console.log("WS: Closed");
    });
  };

  const loop = () => {
    if (ws.readyState === ws.CLOSED) reconnect();

    setTimeout(loop, 5000);
  };

  reconnect();
  loop();
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

const deterministicStringify = (input: any) => {
  const deterministicReplacer = (_, v) =>
    typeof v !== "object" || v === null || Array.isArray(v) ? v : Object.fromEntries(Object.entries(v).sort(([ka], [kb]) => (ka < kb ? -1 : ka > kb ? 1 : 0)));

  return JSON.stringify(input, deterministicReplacer);
};
