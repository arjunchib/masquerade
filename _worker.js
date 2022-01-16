const MIN_PLAYER = 6;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    let path = url.pathname.slice(1).split("/");

    if (!path[0]) {
      return env.ASSETS.fetch(request);
    }

    switch (path[0]) {
      case ".functions":
        return handleApiRequest(path.slice(1), request, env);
      default:
        return env.ASSETS.fetch(request);
    }
  },
};

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

export class GameRoom {
  constructor(controller, env) {
    this.storage = controller.storage;
    this.env = env
    this.sessions = {};
    this.gameState = {};
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
    webSocket.addEventListener("message", (event) => {
      console.log(event.data);
      webSocket.send("PONG");
    });
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
      try {
        let eventData = JSON.parse(event.data);
        if (eventData["type"] === "GameEvent") {
          this.gameState.processGameEvent(this, eventData);
  
        } else if (eventData["type"] === "UiEvent") {
          this.gameState.processUIEvent(this, eventData);
        }
      } catch(e) {}
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
      session.webSocket.close(1000, "Game ended");
    });
  }

  getSession(userID) {
    return this.sessions[userID];
  }

  markSessionAlive(userID) {
    if (!this.sessions[userID].alive) {
      // if previously dead session comes back alive
      this.sessions[webSocket].send(this.gameState)
    }
    this.sessions[userID].alive = true;
  }

  markSessionDead(userID) {
    this.session[userID].alive = false;
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
