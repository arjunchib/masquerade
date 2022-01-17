import { useContext } from "react";
import { GameContext } from "../GameContext";

export function Game() {
  let game = useContext(GameContext);

  return <div className="game">{game.testValue}</div>;
}
