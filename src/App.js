import { Component, createRef } from "react";

class App extends Component {
  roomId;
  websocket;

  constructor(props) {
    super(props);
    this.roomId = createRef();
  }

  async newRoom() {
    const res = await fetch("/.functions/room", { method: "POST" });
    this.joinRoom(await res.text());
  }

  async joinRoom(id) {
    this.websocket?.close();
    console.log(process.env.CF_PAGES);
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.websocket = new WebSocket(
      `${proto}//${window.location.host}/.functions/room/${id}/websocket`
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
