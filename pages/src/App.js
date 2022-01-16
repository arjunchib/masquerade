import { Component, createRef } from "react";

const host = process.env.REACT_APP_WORKERS_HOST;
const isSecure = window.location.protocol === "https:";

class App extends Component {
  roomId;
  websocket;

  constructor(props) {
    super(props);
    this.roomId = createRef();
  }

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
  }

  componentWillUnmount() {
    this.websocket?.close();
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.newRoom()}>New Room</button>
        <input type="text" placeholder="Room ID" ref={this.roomId}></input>
        <button onClick={() => this.joinRoom(this.roomId.current.value)}>
          Join Room
        </button>
        <button
          onClick={() => {
            this.websocket?.send("ping");
          }}
        >
          Ping
        </button>
      </div>
    );
  }
}

export default App;
