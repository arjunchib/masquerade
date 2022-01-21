import { useEffect } from "react";
import { Game } from "./components/Game";
import { InitGame } from "./components/InitGame";
import { GameContext } from "./GameContext";
import { WebSocketManager } from "./WebSocketManager";

export default function App() {
  let game = {
    testValue: 0,
  };

  useEffect(() => {
    return () => {
      WebSocketManager.close();
    };
  });

  return (
    <div className="App">
      <GameContext.Provider value={game}>
        <InitGame />
        <Game />
      </GameContext.Provider>
    </div>
  );
}
