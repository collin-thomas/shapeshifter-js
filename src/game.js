import { OtherPlayer } from "./class/OtherPlayer";
import { PlayableObject } from "./class/PlayableObject";
import { Player } from "./class/Player";
import { ws } from "./websocket";

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

  const localState = {};
  localState.otherPlayers = gameStateFromSever.players
    .filter((otherPlayer) => otherPlayer.id !== player.id)
    .map((player) => new OtherPlayer(player));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    player.draw(ctx);
    playableObjects.forEach((playableObject) => playableObject.draw(ctx));
    localState.otherPlayers.forEach((otherPlayer) => otherPlayer.draw(ctx));
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
    draw();
    requestAnimationFrame(gameLoop);
  }

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "sync-clients") {
      console.log(msg);

      localState.otherPlayers = msg.players
        .filter((otherPlayer) => otherPlayer.id !== player.id)
        .map((player) => new OtherPlayer(player));
    }
  });

  gameLoop();
}
