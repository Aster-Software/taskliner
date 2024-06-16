// src/mongo.ts
import { MongoClient, ServerApiVersion } from "mongodb";
var createClient = async (url) => {
  const client = new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true
    }
  });
  await client.connect();
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
  return client;
};

// src/v2.ts
import { z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { inspect } from "util";

// src/utils.ts
var deterministicStringify = (input) => {
  const deterministicReplacer = (_, v) => typeof v !== "object" || v === null || Array.isArray(v) ? v : Object.fromEntries(Object.entries(v).sort(([ka], [kb]) => ka < kb ? -1 : ka > kb ? 1 : 0));
  return JSON.stringify(input, deterministicReplacer);
};
var create2DRecord = () => {
  const map = {};
  return {
    values: (scope) => Object.values(map[scope]),
    add: (scope, key, obj) => {
      if (map[scope] === void 0)
        map[scope] = {};
      map[scope][key] = obj;
    },
    delete: (scope, key) => {
      if (map[scope] === void 0)
        map[scope] = {};
      delete map[scope][key];
    }
  };
};

// src/server/server-socket.ts
import { WebSocketServer } from "ws";

// src/batch.ts
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

// src/server/server-socket.ts
var ServerSocketModule = class {
  options;
  wss;
  constructor(options) {
    this.options = options;
    this.wss = new WebSocketServer(
      {
        port: 8080
      },
      () => {
        console.log("Websocket server started on port 8080");
      }
    );
    this.wss.on("connection", (ws) => {
      const state = {
        subscriptions: create2DRecord(),
        updates: createBatchOperationRecord(),
        disposers: []
      };
      const send = (action, data) => {
        const json = JSON.stringify({ action, data });
        ws.send(json);
      };
      const dispose = this.options.watcher.subscribe((action, payload) => {
        const patch = createBatchOperationRecord();
        patch.types[payload.collection] = {
          [payload.document._id]: {
            action,
            data: payload.document
          }
        };
        send("patch", patch);
      });
      ws.on("message", (data) => {
        const json = JSON.parse(data.toString());
        console.log("MESSAGE", json);
        if (json.action === "subscribe") {
          const key = deterministicStringify(json.data.query);
          console.log("WS: Subscribe", key);
          state.subscriptions.add(json.data.type, key, json.data.query);
        }
        if (json.action === "unsubscribe") {
          const key = deterministicStringify(json.data.query);
          console.log("WS: Unsubscribe", key);
          state.subscriptions.delete(json.data.type, key);
        }
      });
      ws.on("close", () => {
        dispose();
      });
      ws.on("error", console.error);
      ws.send(JSON.stringify({ type: "Hello World" }));
    });
  }
};

// src/server/server-watcher.ts
var ServerWatcherModule = class {
  options;
  listeners = /* @__PURE__ */ new Set();
  constructor(options) {
    this.options = options;
    this.options.db.watch([], { fullDocument: "updateLookup" }).on("change", (e) => {
      console.log(e);
      const ee = e;
      const payload = { db: ee.ns.db, collection: ee.ns.coll, document: ee.fullDocument };
      if (e.operationType === "create")
        this.listeners.forEach((l) => l("create", payload));
      if (e.operationType === "update")
        this.listeners.forEach((l) => l("update", payload));
      if (e.operationType === "delete")
        this.listeners.forEach((l) => l("delete", payload));
    });
  }
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
};

// src/v2.ts
var Esorm = async (params) => {
  const client = await createClient(params.mongodb_url);
  const session = await client.startSession();
  const db = client.db(params.mongodb_db);
  const result = {
    start: () => {
      const app = new Hono();
      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();
        console.log("REQ");
        log(body);
        const user = await params.authenticate();
        const data = await (async () => {
          if (body.action === "get-many")
            return await result.getManyWithAuthorization(body, user);
          if (body.action === "apply-operation")
            return await result.applyBatchOperation(body.operations);
        })();
        return c.json({ data });
      });
      app.routes.forEach((route) => {
        console.log("API ROUTE: ", route.method, route.path);
      });
      serve(
        {
          fetch: app.fetch,
          port: params.port
        },
        () => console.log(`ESORM server is running on port ${params.port}`)
      );
      const watcher = new ServerWatcherModule({ db });
      const socketModule = new ServerSocketModule({ db, watcher });
    },
    createEntity: async (type, obj) => {
    },
    getOne: async (type, id) => {
      return await db.collection(type).findOne({ _id: id });
    },
    getMany: async (query) => {
      const serialize = (target, condition) => {
        if (condition === void 0)
          return target;
        if (condition.operator === "and")
          target["$and"] = condition.conditions.map((x) => serialize({}, x));
        else if (condition.operator === "or")
          target["$or"] = condition.conditions.map((x) => serialize({}, x));
        else if (condition.operator === "=")
          target[condition.column] = { $eq: condition.value };
        else if (condition.operator === "!=")
          target[condition.column] = { $not: { $eq: condition.value } };
        else if (condition.operator === "in")
          target[condition.column] = { $in: condition.value };
        return target;
      };
      const filter = serialize({}, query.query);
      log(filter);
      const items = await db.collection(query.type).find(filter).limit(1e4).toArray();
      return items;
    },
    getManyWithAuthorization: async (query, user) => {
      const itemsRaw = await result.getMany(query);
      const itemsFiltered = itemsRaw.filter((x) => params.authorize[query.type](x, user));
      return itemsFiltered;
    },
    applyBatchOperation: async (operation) => {
      console.log("Applying Operations...");
      for (const type in operation.types) {
        const t = operation.types[type];
        for (const [id, entry] of Object.entries(t)) {
          if (entry.action === "create") {
            await db.collection(type).insertOne({ ...entry.data, _id: id });
          }
          if (entry.action === "update") {
            await db.collection(type).updateOne({ _id: id }, { $set: entry.data });
          }
          if (entry.action === "delete") {
            await db.collection(type).deleteOne({ _id: id });
          }
        }
      }
    },
    _SCHEMATYPE: void 0
  };
  return result;
};
var EsormTypes = {
  string: { schema: z.string() },
  number: { schema: z.number() },
  boolean: { schema: z.boolean() }
};
var log = (x) => console.log(inspect(x, { showHidden: false, depth: null, colors: true }));

// src/client.ts
import { makeAutoObservable as makeAutoObservable4, observe as observe2, runInAction as runInAction3 } from "mobx";
import { createEffect, onCleanup } from "solid-js";

// src/client/client-query.ts
import { makeAutoObservable, runInAction, untracked } from "mobx";

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
  constructor() {
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

// src/client.ts
var EsormClient = () => {
  const apiDriver = new ClientApiDriver();
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

// src/index.ts
console.log("Hello ESORM");
var TestFunction = () => {
  console.log("ESORM TEST");
};
console.log("Arg 0", process.argv[0]);
console.log("Arg 1", process.argv[1]);
console.log("Arg 2", process.argv[2]);
export {
  Esorm,
  EsormClient,
  EsormTypes,
  TestFunction
};
//# sourceMappingURL=index.js.map