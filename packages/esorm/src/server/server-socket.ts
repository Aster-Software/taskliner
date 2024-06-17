import { WebSocketServer } from "ws";
import { EsormQuery } from "../common/query";
import { create2DRecord, deterministicStringify } from "../common/utils";
import { createBatchOperationRecord } from "../common/batch";
import { Db } from "mongodb";
import { ServerWatcherModule } from "./server-watcher";
import { EsormSchemaDefinition } from "../common/schema";
import { EsormOptions } from "./server";
import { EsormServerApi } from "./server-api";
import { authorizeEntityForPermission } from "./server-authorization";

export class ServerSocketModule<T extends EsormSchemaDefinition, XSession> {
  options: ServerSocketModuleOptions<T, XSession>;
  wss: WebSocketServer;

  constructor(options: ServerSocketModuleOptions<T, XSession>) {
    this.options = options;

    this.wss = new WebSocketServer(
      {
        port: 8080,
      },
      () => {
        console.log("Websocket server started on port 8080");
      },
    );

    this.wss.on("connection", async (ws, req) => {
      const getAuthorization = async (r: typeof req) => {
        const cookies = req.headers.cookie.split(";").map((x) => x.trim());
        const token = (cookies.find((x) => x.startsWith("__session=")) ?? "").slice(10);
        const session = await options.esormOptions.authenticate(token);
        const authorization = await options.esormOptions.authorize(session, this.options.api);

        return authorization;
      };

      const state = {
        subscriptions: create2DRecord<EsormQuery>(),
        updates: createBatchOperationRecord(),
        disposers: [] as (() => void)[],
        authorization: await getAuthorization(req),
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
              data: payload.document,
            },
          };

          send("patch", patch);
        }
      });

      ws.on("message", async (data, req) => {
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
}

type ServerSocketModuleOptions<T extends EsormSchemaDefinition, XSession> = {
  db: Db;
  api: EsormServerApi<T>;
  watcher: ServerWatcherModule;

  esormOptions: EsormOptions<T, XSession>;
};
