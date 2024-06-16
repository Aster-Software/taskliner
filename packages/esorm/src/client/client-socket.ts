import { makeAutoObservable, observe } from "mobx";
import { BaseSchema } from "./client-utils";
import { EsormQuery } from "../query";
import { ClientQueryModule } from "./client-query";
import { EsormBatchOperation } from "../batch";
import { ClientOperationsModule } from "./client-operations";

export class ClientSocketModule<Schema extends BaseSchema> {
  options: ClientSocketOptions<Schema>;
  ws: WebSocket;

  constructor(options: ClientSocketOptions<Schema>) {
    this.options = options;

    observe(options.queryModule.queries, (changes) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        if (changes.type === "add") this.subscribeToQuery(changes.newValue.query);
        if (changes.type === "remove") this.unsubscribeFromQuery(changes.oldValue.query);
      }
    });

    this.reconnect();
    this.loop();

    makeAutoObservable(this);
  }

  loop() {
    if (this.ws.readyState === WebSocket.CLOSED) this.reconnect();

    setTimeout(() => this.loop(), 5000);
  }

  reconnect() {
    console.log("WS: Reconnecting");

    this.ws = new WebSocket(this.options.url);

    this.ws.addEventListener("open", () => {
      console.log("WS: Connected");

      // Send a test message
      this.send("test", "Hello World");

      // Subscribe to all currently mounted queries
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
        const data = json.data as EsormBatchOperation;

        this.options.queryModule.applyOperation(data);
        this.options.queryModule.applyOperation(this.options.operationsModule.operationsCommitting);
        this.options.queryModule.applyOperation(this.options.operationsModule.operationsLocal);
      }
    });
  }

  send = (action: string, data: any) => {
    const json = JSON.stringify({
      action,
      data,
    });

    this.ws.send(json);
  };

  subscribeToQuery = (query: EsormQuery) => this.send("subscribe", { query });
  unsubscribeFromQuery = (query: EsormQuery) => this.send("unsubscribe", { query });
}

type ClientSocketOptions<Schema extends BaseSchema> = {
  url: string;
  operationsModule: ClientOperationsModule<Schema>;
  queryModule: ClientQueryModule<Schema>;
};
