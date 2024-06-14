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
export {
  EsormClient
};
//# sourceMappingURL=client.js.map