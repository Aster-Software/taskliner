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
var Esorm = async (params) => {
  const client = await createClient(params.mongodb_url);
  const db = client.db(params.mongodb_db);
  const session = await client.startSession();
  const result = {
    start: () => {
      const app = new Hono();
      app.post(`/api/entity`, async (c) => {
        const body = await c.req.json();
        console.log("REQ", body);
        const data = await (async () => {
          if (body.action === "get-many")
            return await result.getMany(body);
          if (body.action === "create-one")
            return await result.createEntity(body.type, body.data);
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
      console.log(inspect(filter, { showHidden: false, depth: null, colors: true }));
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
    _SCHEMATYPE: void 0
  };
  return result;
};
var EsormTypes = {
  string: { schema: z.string() },
  number: { schema: z.number() },
  boolean: { schema: z.boolean() }
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
import { makeAutoObservable, runInAction } from "mobx";
import { createEffect, onCleanup } from "solid-js";
var EsormClient = () => {
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
  const cache = {
    operationsCommitting: [],
    // Operations that are local that are being committed
    operationsLocal: []
    // Operations that are local that are not yet being committed
  };
  const update = async () => {
    if (cache.operationsLocal.length) {
      console.log("Pushing Updates...");
      cache.operationsCommitting = cache.operationsLocal;
      cache.operationsLocal = [];
      await req({
        operation: "operations",
        operations: cache.operationsCommitting
      });
    }
    setTimeout(update, 1e3);
  };
  update();
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
      var _a;
      const response = await fetch("/api/entity", {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-many",
          type: options.type,
          query: (_a = options.query) == null ? void 0 : _a.call(options, EsormQueryBuilder),
          sort: options.sort,
          limit: options.limit,
          offset: options.offset
        })
      });
      if (response.ok) {
        const json = await response.json();
        return json.data;
      }
    },
    createQuery: (options) => {
      const state = makeAutoObservable({
        isLoading: true,
        isError: false,
        data: [],
        success: (data) => {
          console.log("QUERY SUCCESS");
          state.isLoading = false;
          state.isError = false;
          state.data = data;
        },
        error: () => {
          state.isLoading = false;
          state.isError = true;
        }
      });
      createEffect(async () => {
        let isCurrent = true;
        onCleanup(() => isCurrent = false);
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
    setEntityValue: (type, target, key, value) => {
      runInAction(() => {
        target[key] = value;
      });
      cache.operationsLocal.push({
        operation: "update",
        type,
        id: target._id,
        column: key,
        value
      });
    }
  };
  return client;
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