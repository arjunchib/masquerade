import { useContext, useRef } from "react";
import { GameContext } from "../GameContext";
import { WebSocketManager } from "../WebSocketManager";

export function InitGame() {
  let roomId = useRef();
  let game = useContext(GameContext);

  function test() {
    WebSocketManager.send(JSON.stringify({ type: "TEST" }));
  }

  return (
    <div className="init-game">
      <button onClick={() => WebSocketManager.newRoom()}>New Room</button>
      <input type="text" placeholder="Room ID" ref={roomId}></input>
      <button onClick={() => WebSocketManager.joinRoom(roomId.current.value)}>
        Join Room
      </button>
      <button onClick={() => test()}>Test</button>
    </div>
  );
}
