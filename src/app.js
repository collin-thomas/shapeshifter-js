import { GameObject } from "./class/GameObject";
import { Player } from "./class/Player";
import { waitForWebSocketOpen } from "./websocket";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let keysPressed = {};

let player = new Player(50, 50, 30, "blue", 2);
let blocks = [
  new GameObject(150, 70, 30, "red", 2),
  new GameObject(230, 150, 30, "green", 2),
  new GameObject(230, 200, 30, "yellow", 2),
  new GameObject(50, 300, 30, "pink", 2),
  new GameObject(400, 40, 30, "black", 2),
];

function initGameState() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
  blocks.forEach((block) => block.draw(ctx));
}

document.addEventListener("keydown", (event) => {
  keysPressed[event.key] = true;
  if (event.key === " ") {
    player.handleSpaceBar(blocks, canvas);
    event.preventDefault();
  }
});

document.addEventListener("keyup", (event) => {
  keysPressed[event.key] = false;
});

function gameLoop() {
  player.updatePosition(keysPressed, canvas, blocks);
  initGameState();
  requestAnimationFrame(gameLoop);
}

async function init() {
  await waitForWebSocketOpen();
  gameLoop();
}

init();
