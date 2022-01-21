const host = process.env.REACT_APP_WORKERS_HOST;
const isSecure = window.location.protocol === "https:";

class _WebSocketManager {
  websocket;
  heartbeatIntervalId;

  async newRoom() {
    const proto = isSecure ? "https:" : "http:";
    const res = await fetch(`${proto}//${host}/.functions/room`, {
      method: "POST",
    });
    this.joinRoom(await res.text());
  }

  async joinRoom(id) {
    this.websocket?.close();
    const proto = isSecure ? "wss:" : "ws:";
    this.websocket = new WebSocket(
      `${proto}//${host}/.functions/room/${id}/websocket`
    );
    this.websocket?.addEventListener("message", (event) => {
      console.log("Message received from server");
      console.log(event.data);
    });
    this.heartbeatIntervalId = setInterval(
      () => this.websocket?.send(JSON.stringify({ type: "PING" })),
      3000
    );
  }

  send(msg) {
    this.websocket?.send(msg);
  }

  close() {
    this.websocket?.close();
    clearInterval(this.heartBeatIntervalId);
  }
}

export const WebSocketManager = new _WebSocketManager();
