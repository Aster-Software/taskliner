import { createId } from "@paralleldrive/cuid2";
import { WebSocket, WebSocketServer } from "ws";

type WebsocketServerProtocol = {
  listeners: Record<string, (payload: any) => void>;
  emitters: Record<string, (payload: any) => void>;
};

export const createWebsocketServer = <T extends WebsocketServerProtocol>(options: {
  port: number;

  onConnection?: (ws: WebSocket) => void;
  onError?: (ws: WebSocket, e: Error) => void;

  protocol: {
    listeners: {};
    emitters: {};
  };
}) => {
  const wss = new WebSocketServer(
    {
      port: options.port,
    },
    () => console.log(`Websocket server started on port ${options.port}`),
  );

  wss.on("connection", (ws) => {
    const sessionID = createId();

    options.onConnection?.(ws);

    ws.on("error", console.error);
    ws.on("error", options.onError);

    ws.on("message", (data) => {
      console.log("received: %s", data);
    });

    ws.send("something");
  });
};

export const createWebsocketProtocol = (options: { createContext: () => {} }) => {};
