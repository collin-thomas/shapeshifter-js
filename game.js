const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

let player = {
  x: 50,
  y: 50,
  size: 30,
  color: "blue",
};

let blocks = [
  { x: 150, y: 70, size: 30, color: "red" },
  { x: 230, y: 150, size: 30, color: "green" },
  // Add more blocks as needed
];

let lastDirection;

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
  switch (lastDirection) {
    case "left":
      return !isCollision(player.x - 30, player.y);
    case "right":
      return !isCollision(player.x + 30, player.y);
    case "up":
      return !isCollision(player.x, player.y - 30);
    case "down":
      return !isCollision(player.x, player.y + 30);
  }
}

document.addEventListener("keydown", function (event) {
  let newX = player.x;
  let newY = player.y;

  switch (event.key) {
    case "ArrowLeft":
      newX -= 10;
      lastDirection = "left";
      break;
    case "ArrowRight":
      newX += 10;
      lastDirection = "right";
      break;
    case "ArrowUp":
      newY -= 10;
      lastDirection = "up";
      break;
    case "ArrowDown":
      newY += 10;
      lastDirection = "down";
      break;
    case " ":
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

  // Check for collision with other blocks and canvas boundaries
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
});

setInterval(draw, 10);
