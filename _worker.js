function handleWebSocket(request) {
  const upgradeHeader = request.headers.get("Upgrade");
  if (!upgradeHeader || upgradeHeader !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  new HeartBeatManager({}, server)
  server.addEventListener("message", (event) => {
    console.log(event.data);
    server.send("PONG");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/new/")) {
      return handleWebSocket(request);
    }
    // Serve the static assets.
    // Without this, the Worker will error and no assets will be served.
    return env.ASSETS.fetch(request);
  },
};

export class HeartBeatManager {
  constructor(game, webSocket, checkMilliseconds = 3000, timeoutMilliseconds = 30000) {
    this.game = game;
    this.checkMilliseconds = checkMilliseconds;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.checkIntervalID = setInterval(
      () => this.heartBeatCheck(),
      checkMilliseconds
    );
    this.heartBeatLastReceivedTime = new Date().getTime();

    this.webSocket = webSocket

    this.webSocket.addEventListener("message", (event) => {
      try {
        let message = JSON.parse(event.data);
        if (message["type"] === "PING") {
          this.heartBeatReceived();
        }
      } catch(e) { }
    });

    this.webSocket.addEventListener("close", (event) => clearInterval(this.checkIntervalID));
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
      console.log(`${this.webSocket} is dead`)
    }
  }
}
