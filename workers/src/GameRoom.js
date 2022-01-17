import { HeartBeatManager } from "./HeartbeatManager";

export class GameRoom {
  constructor(controller, env) {
    this.sessions = {};
    this.controller = controller;
    this.env = env;
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

    this.sessions[userID] = newSession;
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
