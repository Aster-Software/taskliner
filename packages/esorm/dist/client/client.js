// src/client/client.ts
import { makeAutoObservable as makeAutoObservable4, observe as observe2, runInAction as runInAction3 } from "mobx";
import { createEffect, onCleanup } from "solid-js";

// src/client/client-query.ts
import { makeAutoObservable, runInAction, untracked } from "mobx";

// src/common/query.ts
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

// src/common/utils.ts
var deterministicStringify = (input) => {
  const deterministicReplacer = (_, v) => typeof v !== "object" || v === null || Array.isArray(v) ? v : Object.fromEntries(Object.entries(v).sort(([ka], [kb]) => ka < kb ? -1 : ka > kb ? 1 : 0));
  return JSON.stringify(input, deterministicReplacer);
};

// src/client/client-query.ts
var ClientQueryModule = class {
  entities = /* @__PURE__ */ new Map();
  queries = {};
  options;
  constructor(options) {
    makeAutoObservable(this);
    this.options = options;
  }
  getMany = async (options) => {
    const result = await this.options.apiDriver.reqEntity({
      action: "get-many",
      type: options.type,
      query: options.query?.(EsormQueryBuilder),
      sort: options.sort
    });
    return result;
  };
  getOrCreateQuery = (options) => {
    const module = this;
    const query = options.query(EsormQueryBuilder);
    const key = deterministicStringify({
      ...options,
      query
    });
    const create = () => {
      console.log("Creating Query", key);
      const state = makeAutoObservable({
        key,
        query,
        count: 1,
        isLoading: true,
        isError: false,
        get data() {
          const r = [...module.entities].filter(([key2, value]) => {
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
          try {
            const result = await this.getMany(options);
            state.success(result);
            this.updateEntities(options.type, result);
          } catch (e) {
            state.error();
          }
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
          this.queries[key].count--;
          if (this.queries[key].count === 0) {
            console.log("EMPTY QUERY. REMOVING...");
            delete this.queries[key];
          }
        }
      });
      untracked(() => state.start());
      return state;
    };
    runInAction(() => {
      if (this.queries[key] === void 0) {
        this.queries[key] = create();
      } else {
        this.queries[key].count++;
      }
    });
    return this.queries[key];
  };
  updateEntities = (type, entities) => {
    entities.forEach((entity) => {
      const key = `${type}|${entity._id}`;
      this.entities.set(key, entity);
    });
  };
  applyOperation = (patch) => {
    Object.entries(patch.types).forEach(([type, record]) => {
      Object.entries(record).forEach(([id, entry]) => {
        const k = `${type}|${id}`;
        if (entry.action === "delete") {
          this.entities.delete(k);
        } else {
          const target = this.entities.get(k);
          if (target) {
            Object.entries(entry.data).forEach(([key, value]) => {
              console.log("SET", key, value);
              target[key] = value;
            });
          } else {
            console.log("CREATE", entry.data);
            this.entities.set(k, entry.data);
          }
        }
      });
    });
  };
};

// src/client/client-socket.ts
import { makeAutoObservable as makeAutoObservable2, observe } from "mobx";
var ClientSocketModule = class {
  options;
  ws;
  constructor(options) {
    this.options = options;
    observe(options.queryModule.queries, (changes) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        if (changes.type === "add")
          this.subscribeToQuery(changes.newValue.query);
        if (changes.type === "remove")
          this.unsubscribeFromQuery(changes.oldValue.query);
      }
    });
    this.reconnect();
    this.loop();
    makeAutoObservable2(this);
  }
  loop() {
    if (this.ws.readyState === WebSocket.CLOSED)
      this.reconnect();
    setTimeout(() => this.loop(), 5e3);
  }
  reconnect() {
    console.log("WS: Reconnecting");
    this.ws = new WebSocket(this.options.url);
    this.ws.addEventListener("open", () => {
      console.log("WS: Connected");
      this.send("test", "Hello World");
      Object.values(this.options.queryModule.queries).forEach((query) => {
        this.subscribeToQuery(query.query);
      });
    });
    this.ws.addEventListener("close", () => {
      console.log("WS: Closed");
    });
    this.ws.addEventListener("message", (e) => {
      const json = JSON.parse(e.data);
      console.log("WS: Message", json);
      if (json.action === "patch") {
        const data = json.data;
        this.options.queryModule.applyOperation(data);
        this.options.queryModule.applyOperation(this.options.operationsModule.operationsCommitting);
        this.options.queryModule.applyOperation(this.options.operationsModule.operationsLocal);
      }
    });
  }
  send = (action, data) => {
    const json = JSON.stringify({
      action,
      data
    });
    this.ws.send(json);
  };
  subscribeToQuery = (query) => this.send("subscribe", { query });
  unsubscribeFromQuery = (query) => this.send("unsubscribe", { query });
};

// src/client/client-operations.ts
import { makeAutoObservable as makeAutoObservable3, runInAction as runInAction2 } from "mobx";

// src/common/batch.ts
import merge from "merge";
var createBatchOperationRecord = () => {
  const operation = {
    types: {}
  };
  return operation;
};
var checkDoesBatchOperationRecordHaveChanges = (operation) => {
  return Object.keys(operation.types).length > 0;
};

// src/client/client-operations.ts
var ClientOperationsModule = class {
  operationsCommitting = createBatchOperationRecord();
  // Operations that are local that are being committed
  operationsLocal = createBatchOperationRecord();
  // Operations that are local that are not yet being committed
  options;
  constructor(options) {
    makeAutoObservable3(this);
    this.options = options;
    this.update();
  }
  update = async () => {
    if (checkDoesBatchOperationRecordHaveChanges(this.operationsLocal)) {
      console.log("Pushing Updates...", this.operationsLocal);
      runInAction2(() => {
        this.operationsCommitting = this.operationsLocal;
        this.operationsLocal = createBatchOperationRecord();
      });
      await this.options.apiDriver.reqEntity({
        action: "apply-operation",
        operations: this.operationsCommitting
      });
      runInAction2(() => {
        this.operationsCommitting = createBatchOperationRecord();
      });
    }
    setTimeout(() => this.update(), 1e3);
  };
};

// src/client/client-api-driver.ts
var ClientApiDriver = class {
  options;
  constructor(options) {
    this.options = options;
  }
  req = async (options) => {
    const response = await fetch(options.url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.body)
    });
    if (response.ok) {
      const json = await response.json();
      return json.data;
    }
  };
  reqEntity = async (body) => this.req({ url: "/api/entity", body });
};

// src/client/client-utils.ts
var set = (target, key, setter) => {
  const t = target[key];
  target[key] = setter(t);
};

// src/client/client.ts
var EsormClient = (clientOptions) => {
  const apiDriver = new ClientApiDriver({ clientOptions });
  const operationsModule = new ClientOperationsModule({ apiDriver });
  const queryModule = new ClientQueryModule({ apiDriver });
  const socketModule = new ClientSocketModule({
    url: "/ws",
    operationsModule,
    queryModule
  });
  callbackPerObject({
    target: queryModule.queries,
    getKey: (x) => x.key,
    onCallback: () => {
    },
    onCleanup: () => {
    }
  });
  const client = {
    apiDriver,
    operationsModule,
    queryModule,
    socketModule,
    /** For use with SolidJS */
    createQuery: (getOptions) => {
      const state = makeAutoObservable4({
        get query() {
          console.log("GETTING");
          const options = getOptions();
          return queryModule.getOrCreateQuery(options);
        }
      });
      createEffect(() => {
        const query = state.query;
        onCleanup(() => query.dispose());
      });
      return state;
    },
    createEntityValue: (type, value) => {
      queryModule.updateEntities(type, [value]);
      set(operationsModule.operationsLocal.types, type, (x) => x ?? {});
      set(operationsModule.operationsLocal.types[type], value._id, () => ({ action: "create", data: value }));
    },
    setEntityValue: (type, target, key, value) => {
      runInAction3(() => {
        target[key] = value;
      });
      set(operationsModule.operationsLocal.types, type, (x) => x ?? {});
      set(operationsModule.operationsLocal.types[type], target._id, (x) => x ?? { action: "update", data: {} });
      set(operationsModule.operationsLocal.types[type][target._id].data, key, () => value);
    }
  };
  return client;
};
var callbackPerObject = (options) => {
  const cache = /* @__PURE__ */ new Set();
  observe2(options.target, (changes) => {
    console.log({ changes });
  });
};
export {
  EsormClient
};
//# sourceMappingURL=client.js.map