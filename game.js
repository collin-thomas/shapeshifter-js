const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let lastDirection;
let keysPressed = {};

let player = {
  x: 50,
  y: 50,
  size: 30,
  color: "blue",
  speed: 2,
};

let blocks = [
  { x: 150, y: 70, size: 30, color: "red", speed: 2 },
  { x: 230, y: 150, size: 30, color: "green", speed: 2 },
  { x: 230, y: 200, size: 30, color: "yellow", speed: 2 },
  { x: 50, y: 300, size: 30, color: "pink", speed: 2 },
  { x: 400, y: 40, size: 30, color: "black", speed: 2 },
  // Add more blocks as needed
];

function drawBlock(block) {
  ctx.fillStyle = block.color;
  ctx.fillRect(block.x, block.y, block.size, block.size);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBlock(player);
  blocks.forEach(drawBlock);
}

function isCollision(newX, newY) {
  for (let block of blocks) {
    if (
      newX < block.x + block.size &&
      newX + player.size > block.x &&
      newY < block.y + block.size &&
      newY + player.size > block.y
    ) {
      return true;
    }
  }
  return false;
}

function setLastDirectionSpacing() {
  switch (lastDirection) {
    case "left":
      player.x -= player.size;
      break;
    case "right":
      player.x += player.size;
      break;
    case "up":
      player.y -= player.size;
      break;
    case "down":
      player.y += player.size;
      break;
    default:
      break;
  }
}

function playerAbleToEject() {
  // Calculate potential position for the previous block based on last direction
  let c;
  let eNewX = player.x;
  let eNewY = player.y;
  switch (lastDirection) {
    case "left":
      c = isCollision(player.x - 30, player.y);
      eNewX -= 30;
      break;
    case "right":
      c = isCollision(player.x + 30, player.y);
      eNewX += 30;
      break;
    case "up":
      c = isCollision(player.x, player.y - 30);
      eNewY -= 30;
      break;
    case "down":
      c = isCollision(player.x, player.y + 30);
      eNewY -= 30;
      break;
  }
  return (
    !c &&
    eNewX >= 0 &&
    eNewY >= 0 &&
    eNewX <= canvas.width - player.size &&
    eNewY <= canvas.height - player.size
  );
}

function updatePlayerPosition() {
  let newX = player.x;
  let newY = player.y;

  if (keysPressed["ArrowLeft"]) {
    newX -= player.speed;
    lastDirection = "left";
  }
  if (keysPressed["ArrowRight"]) {
    newX += player.speed;
    lastDirection = "right";
  }
  if (keysPressed["ArrowUp"]) {
    newY -= player.speed;
    lastDirection = "up";
  }
  if (keysPressed["ArrowDown"]) {
    newY += player.speed;
    lastDirection = "down";
  }

  if (
    !isCollision(newX, newY) &&
    newX >= 0 &&
    newY >= 0 &&
    newX <= canvas.width - player.size &&
    newY <= canvas.height - player.size
  ) {
    player.x = newX;
    player.y = newY;
  }
}

function handleSpaceBar() {
  let adjacentBlock = blocks.find(
    (b) =>
      Math.abs(b.x - player.x) <= player.size &&
      Math.abs(b.y - player.y) <= player.size
  );
  if (adjacentBlock && !player.previous) {
    player = { ...adjacentBlock, previous: player };
    blocks.splice(blocks.indexOf(adjacentBlock), 1);
  }
  if (player.previous && !adjacentBlock && playerAbleToEject()) {
    blocks.push({ ...player });
    player.color = player.previous.color;
    delete player.previous;
    setLastDirectionSpacing();
  }
  return; // Prevent movement when swapping colors
}

function handleKeydown(event) {
  keysPressed[event.key] = true;
  if (event.key === " ") {
    handleSpaceBar();
    event.preventDefault(); // Prevent scrolling with space bar
  }
}

function handleKeyup(event) {
  keysPressed[event.key] = false;
}

document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);

function gameLoop() {
  updatePlayerPosition();
  draw();
  requestAnimationFrame(gameLoop);
}

// requestAnimationFrame() method tells the browser you wish to perform an animation.
// It requests the browser to call a user-supplied callback function before the next repaint.
requestAnimationFrame(gameLoop);
