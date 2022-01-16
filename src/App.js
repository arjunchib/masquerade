import React from "react";
import "./App.css";

class App extends React.Component {
  websocket;

  componentDidMount() {
    this.websocket = new WebSocket("ws://127.0.0.1:8788/new/");
    this.websocket?.addEventListener("message", (event) => {
      console.log("Message received from server");
      console.log(event.data);
    });
    this.heartBeatIntervalId = setInterval(() => this.websocket?.send('{"type": "PING"}'), 3000)
  }

  componentWillUnmount() {
    this.websocket?.close();
    clearInterval(this.heartBeatIntervalId)
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.websocket?.send("PING")}>Ping</button>
      </div>
    );
  }
}

export default App;
