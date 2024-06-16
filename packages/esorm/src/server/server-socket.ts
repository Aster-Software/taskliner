import { WebSocketServer } from "ws";
import { EsormQuery } from "../query";
import { create2DRecord, create2DSet, deterministicStringify } from "../utils";
import { createBatchOperationRecord } from "../batch";
import { Db } from "mongodb";
import { ServerWatcherModule } from "./server-watcher";

export class ServerSocketModule {
  options: ServerSocketModuleOptions;
  wss: WebSocketServer;

  constructor(options: ServerSocketModuleOptions) {
    this.options = options;

    this.wss = new WebSocketServer(
      {
        port: 8080,
      },
      () => {
        console.log("Websocket server started on port 8080");
      },
    );

    this.wss.on("connection", (ws) => {
      const state = {
        subscriptions: create2DRecord<EsormQuery>(),
        updates: createBatchOperationRecord(),
        disposers: [] as (() => void)[],
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
            data: payload.document,
          },
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
}

type ServerSocketModuleOptions = {
  db: Db;
  watcher: ServerWatcherModule;
};
