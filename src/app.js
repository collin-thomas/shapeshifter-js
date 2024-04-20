import { PlayableObject } from "./class/PlayableObject";
import { Player } from "./class/Player";
import { waitForWebSocketOpen } from "./websocket";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

const keysPressed = {};

const player = new Player(50, 50, 30, "blue", 2);
const playableObjects = [
  new PlayableObject(150, 70, 30, "red", 2),
  new PlayableObject(230, 150, 30, "green", 2),
  new PlayableObject(230, 200, 30, "yellow", 2),
  new PlayableObject(50, 300, 30, "pink", 2),
  new PlayableObject(400, 40, 30, "black", 2),
];

function initGameState() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
  playableObjects.forEach((playableObject) => playableObject.draw(ctx));
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

async function init() {
  await waitForWebSocketOpen();
  gameLoop();
}

init();
