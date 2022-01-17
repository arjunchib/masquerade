import { HeartBeatManager } from "./HeartbeatManager";

export class GameRoom {
  constructor(controller, env) {
    this.sessions = [];
  }

  async fetch(request) {
    let url = new URL(request.url);

    switch (url.pathname) {
      case "/websocket": {
        // The request is to `/api/room/<name>/websocket`. A client is trying to establish a new WebSocket session.
        if (request.headers.get("Upgrade") !== "websocket") {
          return new Response("expected websocket", { status: 400 });
        }
        // eslint-disable-next-line no-undef
        let pair = new WebSocketPair();
        await this.handleSession(pair[1]);
        return new Response(null, { status: 101, webSocket: pair[0] });
      }
      default:
        return new Response("Not found", { status: 404 });
    }
  }

  async handleSession(webSocket) {
    webSocket.accept();
    new HeartBeatManager({}, webSocket);
    webSocket.addEventListener("message", (event) => {
      let message = JSON.parse(event.data);
      if (message.type === "TEST") {
        console.log("TEST Received");
        webSocket.send("TEST ACK");
      }
    });
  }
}
