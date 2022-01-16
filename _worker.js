const MIN_PLAYER = 6;

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

export class Bank {}

export class Player {
  constructor() {
    this.coins = 6;
    this.role = {};
  }
}

function NotEnoughPlayers() {
  const error = new Error("Not enough players");
  return error;
}

NotEnoughPlayers.prototype = Object.create(Error.prototype);

export class GameState {
  constructor() {
    this.isGameInProgress = false;
    this.bank = 0;
    this.players = [];
  }

  processGameEvent(eventData) {
    server
  }

  processUIEvent(eventData) { }

  start() {
    this.isGameInProgress = true;
  }

  stop() {
    this.isGameInProgress = false;
  }

  randomShuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  }

  toString() {

  }
}

export class GameServer {
  constructor() {
    this.sessions = {};
    this.gameState = new GameState();
  }

  createSession(webSocket, userID) {
    if (userID in this.sessions) {
      // Close out old web socket connection
      let session = this.sessions[userID];
      try {
        session.webSocket.close();
      } catch (e) {}
    }

    newSession = {
      alive: true,
      webSocket: webSocket,
      heartbeatManager: new HeartBeatManager(this, webSocket),
    };

    webSocket.addEventListener("message", (event) => {
      let eventData = JSON.parse(event.data);
      if (eventData["type"] === "GameEvent") {
        this.gameState.processGameEvent(this, eventData);

      } else if (eventData["type"] === "UiEvent") {
        this.gameState.processUIEvent(this, eventData);
      }
    });

    this.players[userID] = newSession;
  }

  startGame() {
    // Check if we have enough players
    let aliveSessions = Object.values(this.sessions).filter((x) => x.alive);
    if (aliveSessions.length < MIN_PLAYER) {
      throw new NotEnoughPlayers();
    }

    this.gameState.start();
  }

  destroy() {
    this.sessions.forEach((session) => {
      session["webSocket"].close(1000, "GameEnded");
    });
  }

  getSession(userID) {
    return this.sessions[userID];
  }

  markSessionAlive(userID) {
    if (this.sessions[userID].alive) {
      // if previously dead session comes back alive
      this.sessions[webSocket].send(this.gameState.toJson)
    }
    this.sessions[userID].alive = false;
  }

  markSessionDead(userID) {
    this.session[userID].alive = true;
  }
}

export class HeartBeatManager {
  constructor(
    game,
    userId,
    checkMilliseconds = 3000,
    timeoutMilliseconds = 30000
  ) {
    this.game = game;
    this.checkMilliseconds = checkMilliseconds;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.heartBeatLastReceivedTime = new Date().getTime();

    this.checkIntervalID = setInterval(
      () => this.heartBeatCheck(),
      checkMilliseconds
    );

    let webSocket = this.game.getSession(userId).webSocket;

    webSocket.addEventListener("message", (event) => {
      try {
        let message = JSON.parse(event.data);
        if (message["type"] === "PING") {
          this.heartBeatReceived();
        }
      } catch (e) {}
    });

    webSocket.addEventListener("close", (event) =>
      clearInterval(this.checkIntervalID)
    );
  }

  heartBeatReceived() {
    console.log(`Heartbeat received from ${this.webSocket}`);
    this.heartBeatLastReceivedTime = new Date().getTime();
    // this.game.markSessionAlive();
  }

  heartBeatCheck() {
    let now = new Date().getTime();
    if (now - this.heartBeatLastReceivedTime > this.timeoutMilliseconds) {
      // this.game.markSessionDead();
    }
  }
}
