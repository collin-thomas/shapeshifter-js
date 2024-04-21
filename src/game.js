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

  const _ = {};

  _.player = new Player(gameStateFromSever.newPlayer);

  _.playableObjects = gameStateFromSever.playableObjects.map(
    (data) => new PlayableObject(data)
  );

  _.otherPlayers = gameStateFromSever.players
    .filter((otherPlayer) => otherPlayer.id !== _.player.id)
    .map((p) => new OtherPlayer(p));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    _.player.draw(ctx);
    _.playableObjects.forEach((playableObject) => {
      playableObject.draw(ctx);
    });
    _.otherPlayers.forEach((otherPlayer) => otherPlayer.draw(ctx));
  }

  document.addEventListener("keydown", (event) => {
    keysPressed[event.key] = true;
    if (event.key === " ") {
      console.log(_.playableObjects.length);
      _.player.handleSpaceBar(_.playableObjects, canvas);
      console.log(_.playableObjects.length);
      event.preventDefault();
    }
  });

  document.addEventListener("keyup", (event) => {
    keysPressed[event.key] = false;
  });

  function gameLoop() {
    _.player.updatePosition(keysPressed, canvas, _.playableObjects);
    draw();
    requestAnimationFrame(gameLoop);
  }

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "sync-clients") {
      console.log(msg);

      _.otherPlayers = msg.players
        .filter((otherPlayer) => otherPlayer.id !== _.player.id)
        .map((p) => new OtherPlayer(p));

      _.playableObjects = msg.playableObjects.map((p) => new PlayableObject(p));
    }
  });

  gameLoop();
}
