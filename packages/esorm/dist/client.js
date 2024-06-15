// src/query.ts
var EsormQueryBuilder = {
  where: (column, operator, value) => {
    const condition = {
      operator,
      column,
      value
    };
    return condition;
  },
  and: (...conditions) => ({ operator: "and", conditions }),
  or: (...conditions) => ({ operator: "or", conditions })
};

// src/client.ts
import { makeAutoObservable, runInAction, untracked } from "mobx";
import { createEffect, onCleanup } from "solid-js";

// src/batch.ts
var createBatchOperationRecord = () => {
  const operation = {
    types: {}
  };
  return operation;
};
var checkDoesBatchOperationRecordHaveChanges = (operation) => {
  return Object.keys(operation.types).length > 0;
};

// src/client.ts
var EsormClient = () => {
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
    }
  });
  const req = async (body) => {
    const response = await fetch("/api/entity", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  };
  const cache = makeAutoObservable({
    entities: /* @__PURE__ */ new Map(),
    queries: {},
    updateEntities: (type, entities) => {
      entities.forEach((entity) => {
        const key = `${type}|${entity._id}`;
        cache.entities.set(key, entity);
      });
    }
  });
  const manager = {
    operationsCommitting: createBatchOperationRecord(),
    // Operations that are local that are being committed
    operationsLocal: createBatchOperationRecord()
    // Operations that are local that are not yet being committed
  };
  const update = async () => {
    if (checkDoesBatchOperationRecordHaveChanges(manager.operationsLocal)) {
      console.log("Pushing Updates...", manager.operationsLocal);
      manager.operationsCommitting = manager.operationsLocal;
      manager.operationsLocal = createBatchOperationRecord();
      await req({
        action: "apply-operation",
        operations: manager.operationsCommitting
      });
    }
    setTimeout(update, 1e3);
  };
  update();
  const getOrCreateQuery = (options) => {
    const query = options.query(EsormQueryBuilder);
    const key = deterministicStringify({
      ...options,
      query
    });
    const create = () => {
      console.log("Creating Query", key);
      const state = makeAutoObservable({
        key,
        count: 1,
        isLoading: true,
        isError: false,
        get data() {
          const r = [...cache.entities].filter(([key2, value]) => {
            if (!key2.startsWith(options.type))
              return false;
            return query ? checkEntityPassesQuery(query, value) : true;
          }).map(([key2, value]) => value);
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
        success: (data) => {
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
        }
      });
      untracked(() => state.start());
      return state;
    };
    runInAction(() => {
      if (cache.queries[key] === void 0) {
        cache.queries[key] = create();
      } else {
        cache.queries[key].count++;
      }
    });
    return cache.queries[key];
  };
  const client = {
    createOne: async (type, data) => {
      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-one",
          type,
          data
        })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    },
    getMany: async (options) => {
      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-many",
          type: options.type,
          query: options.query?.(EsormQueryBuilder),
          sort: options.sort
        })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      } else {
        throw new Error(response.statusText);
      }
    },
    /** For use with SolidJS */
    createQuery: (getOptions) => {
      const state = makeAutoObservable({
        get query() {
          console.log("GETTING");
          const options = getOptions();
          return getOrCreateQuery(options);
        }
      });
      createEffect(() => {
        const query = state.query;
        onCleanup(() => query.dispose());
      });
      return state;
    },
    createEntityValue: (type, value) => {
      cache.updateEntities(type, [value]);
      s(manager.operationsLocal.types, type, (x) => x ?? {});
      s(manager.operationsLocal.types[type], value._id, () => ({ action: "create", data: value }));
    },
    setEntityValue: (type, target, key, value) => {
      runInAction(() => {
        target[key] = value;
      });
      s(manager.operationsLocal.types, type, (x) => x ?? {});
      s(manager.operationsLocal.types[type], target._id, (x) => x ?? { action: "update", data: {} });
      s(manager.operationsLocal.types[type][target._id].data, key, () => value);
    }
  };
  return client;
};
var s = (target, key, setter) => {
  const t = target[key];
  target[key] = setter(t);
};
var checkEntityPassesQuery = (query, entity) => {
  if (query.operator === "and")
    return query.conditions.every((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "or")
    return query.conditions.some((condition) => checkEntityPassesQuery(condition, entity));
  if (query.operator === "=")
    return entity[query.column] === query.value;
  if (query.operator === "!=")
    return entity[query.column] !== query.value;
  if (query.operator === "in")
    return query.value.includes(entity[query.column]);
  return false;
};
var createSocket = (options) => {
  let ws = null;
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
    if (ws.readyState === ws.CLOSED)
      reconnect();
    setTimeout(loop, 5e3);
  };
  reconnect();
  loop();
};
var deterministicStringify = (input) => {
  const deterministicReplacer = (_, v) => typeof v !== "object" || v === null || Array.isArray(v) ? v : Object.fromEntries(Object.entries(v).sort(([ka], [kb]) => ka < kb ? -1 : ka > kb ? 1 : 0));
  return JSON.stringify(input, deterministicReplacer);
};
export {
  EsormClient
};
//# sourceMappingURL=client.js.map