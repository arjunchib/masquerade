function handleWebSocket(request) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  new HeartBeatManager({}, server);
  server.addEventListener("message", (event) => {
    console.log(event.data);
    server.send("PONG");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
export { GameRoom } from "./GameRoom";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    let path = url.pathname.slice(1).split("/");

    switch (path[0]) {
      case ".functions":
        return handleApiRequest(path.slice(1), request, env);
      default:
        return new Response("Not Found", { status: 404 });
    }
  },
};

export class HeartBeatManager {
  constructor(
    game,
    webSocket,
    checkMilliseconds = 3000,
    timeoutMilliseconds = 30000
  ) {
    this.game = game;
    this.webSocket = webSocket;
    this.checkMilliseconds = checkMilliseconds;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.heartBeatLastReceivedTime = new Date().getTime();

    this.checkIntervalID = setInterval(
      () => this.heartBeatCheck(),
      checkMilliseconds
    );

    this.webSocket.addEventListener("message", (event) => {
      try {
        let message = JSON.parse(event.data);
        if (message["type"] === "PING") {
          this.heartBeatReceived();
        }
      } catch (e) {}
    });

    this.webSocket.addEventListener("close", (event) =>
      clearInterval(this.checkIntervalID)
    );
  }

  heartBeatReceived() {
    console.log(`Heartbeat received from ${this.webSocket}`);
    this.heartBeatLastReceivedTime = new Date().getTime();
    // this.game.markPlayerAlive();
  }

  heartBeatCheck() {
    let now = new Date().getTime();
    if (now - this.heartBeatLastReceivedTime > this.timeoutMilliseconds) {
      // this.game.markPlayerDead();
      console.log(`${this.webSocket} is dead`);
    }
  }
}

async function handleApiRequest(path, request, env) {
  switch (path[0]) {
    case "room": {
      if (!path[1]) {
        if (request.method === "POST") {
          let id = env.rooms.newUniqueId();
          return new Response(id.toString(), {
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        } else {
          return new Response("Method not allowed", { status: 405 });
        }
      }
      let name = path[1];
      let id;
      if (name.match(/^[0-9a-f]{64}$/)) {
        id = env.rooms.idFromString(name);
      } else if (name.length <= 32) {
        id = env.rooms.idFromName(name);
      } else {
        return new Response("Name too long", { status: 404 });
      }
      let roomObject = env.rooms.get(id);
      let newUrl = new URL(request.url);
      newUrl.pathname = "/" + path.slice(2).join("/");
      return roomObject.fetch(newUrl, request);
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
