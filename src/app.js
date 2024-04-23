import { loadGame } from "./game";
import { waitForNewPlayerData, waitForWebSocketOpen } from "./websocket";

async function init() {
  try {
    await waitForWebSocketOpen();

    const gameStateFromSever = await waitForNewPlayerData();

    loadGame(gameStateFromSever);
  } catch (error) {
    console.error("init error", error);
    const msgEL = document.getElementById("msg");
    msgEL.innerText =
      "Something went wrong. It is possible you tried to open a second tab with an active game.";
  }
}

init();
