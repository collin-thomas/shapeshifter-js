import { loadGame } from "./game";
import { waitForNewPlayerData, waitForWebSocketOpen } from "./websocket";

async function init() {
  await waitForWebSocketOpen();

  const gameStateFromSever = await waitForNewPlayerData();

  loadGame(gameStateFromSever);
}

init();
