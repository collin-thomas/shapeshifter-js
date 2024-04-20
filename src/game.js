import { OtherPlayer } from "./class/OtherPlayer";
import { PlayableObject } from "./class/PlayableObject";
import { Player } from "./class/Player";

export function loadGame(gameStateFromSever) {
  console.log(gameStateFromSever);
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 500;
  canvas.height = 500;

  const keysPressed = {};

  const player = new Player(gameStateFromSever.newPlayer);
  const playableObjects = gameStateFromSever.playableObjects.map(
    (data) => new PlayableObject(data)
  );
  const otherPlayers = gameStateFromSever.players
    .filter((otherPlayer) => otherPlayer.id !== player.id)
    .map((player) => new OtherPlayer(player));

  function initGameState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    playableObjects.forEach((playableObject) => playableObject.draw(ctx));
    otherPlayers.forEach((otherPlayer) => otherPlayer.draw(ctx));
  }

  document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
    if (event.key === " ") {
      player.handleSpaceBar(playableObjects, canvas);
      event.preventDefault();
    }
  });

  document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
  });

  function gameLoop() {
    player.updatePosition(keysPressed, canvas, playableObjects);
    initGameState();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
}
