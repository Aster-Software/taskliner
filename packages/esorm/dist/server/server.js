// src/server/mongo.ts
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
  console.log("Successfully connected to MongoDB");
  return client;
};

// src/server/server.ts
import { z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { inspect } from "util";

// src/common/utils.ts
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

// src/common/batch.ts
import merge from "merge";
var createBatchOperationRecord = () => {
  const operation = {
    types: {}
  };
  return operation;
};

// src/server/server-authorization.ts
var authorizeEntityForPermission = (action, entity, permissions) => {
  const p = Array.isArray(permissions) ? permissions : [permissions];
  return p.some((permission) => {
    const isCorrectAction = permission.action === "all" || permission.action === action;
    if (isCorrectAction === false)
      return false;
    const isCorrectScope = Object.entries(permission.scope).every(([key, value]) => entity[key] === value);
    return isCorrectScope;
  });
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
    this.wss.on("connection", async (ws, req) => {
      const getAuthorization = async (r) => {
        const cookies = req.headers.cookie.split(";").map((x) => x.trim());
        const token = (cookies.find((x) => x.startsWith("__session=")) ?? "").slice(10);
        const session = await options.esormOptions.authenticate(token);
        const authorization = await options.esormOptions.authorize(session, this.options.api);
        return authorization;
      };
      const state = {
        subscriptions: create2DRecord(),
        updates: createBatchOperationRecord(),
        disposers: [],
        authorization: await getAuthorization(req)
      };
      const send = (action, data) => {
        const json = JSON.stringify({ action, data });
        ws.send(json);
      };
      const dispose = this.options.watcher.subscribe(async (action, payload) => {
        const isAuthorized = authorizeEntityForPermission("read", payload.document, state.authorization[payload.collection]);
        if (isAuthorized) {
          const patch = createBatchOperationRecord();
          patch.types[payload.collection] = {
            [payload.document._id]: {
              action,
              data: payload.document
            }
          };
          send("patch", patch);
        }
      });
      ws.on("message", async (data, req2) => {
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

// src/server/server-api.ts
var EsormServerApi = class {
  options;
  constructor(options) {
    this.options = options;
  }
  getMany = async (query) => {
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
    const items = await this.options.db.collection(query.type).find(filter).limit(1e4).toArray();
    return items;
  };
  getManyWithAuthorization = async (query, authorization) => {
    const items = await this.getMany(query);
    const permissions = authorization[query.type];
    return items.filter((item) => authorizeEntityForPermission("read", item, permissions));
  };
  applyBatchOperation = async (operation) => {
    console.log("Applying Operations...");
    for (const type in operation.types) {
      const t = operation.types[type];
      for (const [id, entry] of Object.entries(t)) {
        if (entry.action === "create") {
          await this.options.db.collection(type).insertOne({ ...entry.data, _id: id });
        }
        if (entry.action === "update") {
          await this.options.db.collection(type).updateOne({ _id: id }, { $set: entry.data });
        }
        if (entry.action === "delete") {
          await this.options.db.collection(type).deleteOne({ _id: id });
        }
      }
    }
  };
  applyBatchOperationWithAuthorization = async (operation, authorization) => {
    console.log("Applying Operations...");
    for (const type in operation.types) {
      const t = operation.types[type];
      const permissionsRaw = authorization[type];
      const permissions = Array.isArray(permissionsRaw) ? permissionsRaw : [permissionsRaw];
      for (const [id, entry] of Object.entries(t)) {
        if (entry.action === "create") {
          const isAuthorized = authorizeEntityForPermission("create", entry.data, permissions);
          if (isAuthorized) {
            await this.options.db.collection(type).insertOne({ ...entry.data, _id: id });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }
        if (entry.action === "update") {
          const target = await this.options.db.collection(type).findOne({ _id: id });
          const isAuthorizedOriginal = authorizeEntityForPermission("update", target, permissions);
          const isAuthorizedUpdated = authorizeEntityForPermission("update", { ...target, ...entry.data }, permissions);
          if (isAuthorizedOriginal && isAuthorizedUpdated) {
            await this.options.db.collection(type).updateOne({ _id: id }, { $set: entry.data });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }
        if (entry.action === "delete") {
          const target = await this.options.db.collection(type).findOne({ _id: id });
          const isAuthorized = authorizeEntityForPermission("delete", target, permissions);
          if (isAuthorized) {
            await this.options.db.collection(type).deleteOne({ _id: id });
          } else {
            console.log("Unauthorized. Skipping Mutation.");
          }
        }
      }
    }
  };
};

// src/server/server.ts
var Esorm = async (esormOptions) => {
  const client = await createClient(esormOptions.mongodb_url);
  const session = await client.startSession();
  const db = client.db(esormOptions.mongodb_db);
  const api = new EsormServerApi({ db });
  const result = {
    db,
    api,
    start: () => {
      const app = new Hono();
      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();
        console.log("REQ");
        log(body);
        const token = getCookie(c, "__session") ?? "";
        const session2 = await esormOptions.authenticate(token);
        const authorization = await esormOptions.authorize(session2, api);
        const data = await (async () => {
          if (body.action === "get-many")
            return await api.getManyWithAuthorization(body, authorization);
          if (body.action === "apply-operation")
            return await api.applyBatchOperationWithAuthorization(body.operations, authorization);
        })();
        return c.json({ data });
      });
      app.routes.forEach((route) => {
        console.log("API ROUTE: ", route.method, route.path);
      });
      serve(
        {
          fetch: app.fetch,
          port: esormOptions.port
        },
        () => console.log(`ESORM server is running on port ${esormOptions.port}`)
      );
      const watcher = new ServerWatcherModule({ db });
      const socketModule = new ServerSocketModule({ db, watcher, esormOptions, api });
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
export {
  Esorm,
  EsormTypes
};
//# sourceMappingURL=server.js.map