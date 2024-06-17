import { createClient as createMongoDBClient } from "./mongo";
import { z } from "zod";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { getCookie } from "hono/cookie";
import { inspect } from "util";
import { create2DSet } from "../common/utils";
import { ServerSocketModule } from "./server-socket";
import { ServerWatcherModule } from "./server-watcher";
import { EsormSchemaDefinition } from "../common/schema";
import { EsormServerApi } from "./server-api";
import { Authorization } from "./server-authorization";

export const Esorm = async <T extends EsormSchemaDefinition, XSession>(esormOptions: EsormOptions<T, XSession>) => {
  const client = await createMongoDBClient(esormOptions.mongodb_url);
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
        const session = await esormOptions.authenticate(token);
        const authorization = await esormOptions.authorize(session, api);

        const data = await (async () => {
          if (body.action === "get-many") return await api.getManyWithAuthorization(body, authorization);
          if (body.action === "apply-operation") return await api.applyBatchOperationWithAuthorization(body.operations, authorization);
        })();

        return c.json({ data });
      });

      app.routes.forEach((route) => {
        console.log("API ROUTE: ", route.method, route.path);
      });

      serve(
        {
          fetch: app.fetch,
          port: esormOptions.port,
        },
        () => console.log(`ESORM server is running on port ${esormOptions.port}`),
      );

      const watcher = new ServerWatcherModule({ db });
      const socketModule = new ServerSocketModule({ db, watcher, esormOptions, api });
    },

    _SCHEMATYPE: undefined as T,
  };

  return result;
};

export const EsormTypes = {
  string: { schema: z.string() },
  number: { schema: z.number() },
  boolean: { schema: z.boolean() },
};

const log = (x) => console.log(inspect(x, { showHidden: false, depth: null, colors: true }));

const createPubSubManager = <T extends Record<string, any>>() => {
  const subscriptions = create2DSet();

  return {
    emit: <Key extends keyof T & string>(e: Key, args: T[Key]) => {
      subscriptions.values(e).forEach((fn) => fn(args));
    },
    subscribe: <Key extends keyof T & string>(e: Key, callback: (args: T[Key]) => {}) => {
      const obj = [e, callback];

      subscriptions.add(e, obj);

      return () => subscriptions.delete(e, obj);
    },
  };
};

export type EsormOptions<T extends EsormSchemaDefinition, XSession> = {
  port: number;
  mongodb_db: string;
  mongodb_url: string;
  schema: T;
  authenticate: (token: string) => Promise<XSession>;
  authorize: (session: XSession, api: EsormServerApi<T>) => Promise<Authorization<T>>;
};
