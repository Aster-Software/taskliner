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
import { createId } from "@paralleldrive/cuid2";
import { WebSocketServer } from "ws";
var Esorm = async (params) => {
  const client = await createClient(params.mongodb_url);
  const db = client.db(params.mongodb_db);
  const session = await client.startSession();
  const psm = createPubSubManager();
  db.watch([], { fullDocument: "updateLookup" }).on("change", (e) => {
    console.log(e);
    const ee = e;
    const payload = { db: ee.ns.db, collection: ee.ns.coll, document: ee.fullDocument };
    if (e.operationType === "create")
      psm.emit("entity-create", payload);
    if (e.operationType === "update")
      psm.emit("entity-update", payload);
    if (e.operationType === "delete")
      psm.emit("entity-delete", payload);
  });
  const result = {
    start: () => {
      const app = new Hono();
      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();
        console.log("REQ");
        log(body);
        const data = await (async () => {
          if (body.action === "get-many")
            return await result.getMany(body);
          if (body.action === "create-one")
            return await result.createEntity(body.type, body.data);
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
      const wss = new WebSocketServer(
        {
          port: 8080
        },
        () => {
          console.log("Websocket server started on port 8080");
        }
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
    createEntity: async (type, obj) => {
      await result.apply_operation({
        operation: "create",
        type,
        id: createId(),
        data: obj
      });
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
      return await db.collection(query.type).find(filter).toArray();
    },
    apply_operation: async (operation) => {
      if (operation.operation === "create") {
        await db.collection(operation.type).insertOne({ ...operation.data, _id: operation.id });
      }
      if (operation.operation === "update") {
        await db.collection(operation.type).updateOne(
          { _id: operation.id },
          {
            $set: { [operation.column]: operation.value }
          }
        );
      }
      if (operation.operation === "delete") {
        await db.collection(operation.type).deleteOne({ _id: operation.id });
      }
    },
    apply_operations: async (operations) => {
      await session.withTransaction(async () => {
        for (const operation of operations) {
          await result.apply_operation(operation);
        }
      });
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
var createPubSubManager = () => {
  const subscriptions = create2DSet();
  return {
    emit: (e, args) => {
      subscriptions.values(e).forEach((fn) => fn(args));
    },
    subscribe: (e, callback) => {
      const obj = [e, callback];
      subscriptions.add(e, obj);
      return () => subscriptions.delete(e, obj);
    }
  };
};
var create2DSet = () => {
  const map = {};
  return {
    values: (scope) => [...map[scope] ?? []],
    add: (scope, obj) => {
      if (map[scope] === void 0)
        map[scope] = /* @__PURE__ */ new Set();
      map[scope].add(obj);
    },
    delete: (scope, obj) => {
      if (map[scope] === void 0)
        map[scope] = /* @__PURE__ */ new Set();
      map[scope].delete(obj);
    }
  };
};

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