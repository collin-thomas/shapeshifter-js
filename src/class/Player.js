import { GameObject } from "./GameObject";
import { sendState } from "../websocket";

export class Player extends GameObject {
  constructor(x, y, size, color, speed) {
    super(x, y, size, color, speed);
    this.lastDirection = null;
    this.previous = null;
  }

  updatePosition(keysPressed, canvas, blocks) {
    let newX = this.x;
    let newY = this.y;

    if (keysPressed["ArrowLeft"]) {
      newX -= this.speed;
      this.lastDirection = "left";
    }
    if (keysPressed["ArrowRight"]) {
      newX += this.speed;
      this.lastDirection = "right";
    }
    if (keysPressed["ArrowUp"]) {
      newY -= this.speed;
      this.lastDirection = "up";
    }
    if (keysPressed["ArrowDown"]) {
      newY += this.speed;
      this.lastDirection = "down";
    }

    // Don't do anything if nothing has happened.
    if (newX === this.x && newY === this.y) return;

    // Don't update position if there is a collision
    if (this.isCollision(newX, newY, blocks)) return;

    // Don't update if out of bounds
    if (
      !(
        newX >= 0 &&
        newY >= 0 &&
        newX <= canvas.width - this.size &&
        newY <= canvas.height - this.size
      )
    )
      return;

    // Update position
    this.x = newX;
    this.y = newY;

    // Send update to server
    sendState(this);
  }

  isCollision(newX, newY, blocks) {
    for (let block of blocks) {
      if (
        newX < block.x + block.size &&
        newX + this.size > block.x &&
        newY < block.y + block.size &&
        newY + this.size > block.y
      ) {
        return true;
      }
    }
    return false;
  }

  handleSpaceBar(playableObject, canvas) {
    let adjacentBlock = playableObject.find(
      (b) =>
        Math.abs(b.x - this.x) <= this.size &&
        Math.abs(b.y - this.y) <= this.size
    );

    if (adjacentBlock && !this.previous) {
      this.previous = { ...this }; // Clone current state
      Object.assign(this, adjacentBlock);
      playableObject.splice(playableObject.indexOf(adjacentBlock), 1);
    } else if (
      this.previous &&
      !adjacentBlock &&
      this.playerAbleToEject(canvas, playableObject)
    ) {
      playableObject.push(
        new GameObject(this.x, this.y, this.size, this.color, this.speed)
      );
      this.color = this.previous.color;
      this.previous = null;
      this.setLastDirectionSpacing();
    }
    // Send update to server
    sendState(this);
  }

  playerAbleToEject(canvas, blocks) {
    let eNewX = this.x;
    let eNewY = this.y;
    let c = false;

    switch (this.lastDirection) {
      case "left":
        c = this.isCollision(this.x - 30, this.y, blocks);
        eNewX -= 30;
        break;
      case "right":
        c = this.isCollision(this.x + 30, this.y, blocks);
        eNewX += 30;
        break;
      case "up":
        c = this.isCollision(this.x, this.y - 30, blocks);
        eNewY -= 30;
        break;
      case "down":
        c = this.isCollision(this.x, this.y + 30, blocks);
        eNewY += 30;
        break;
    }

    return (
      !c &&
      eNewX >= 0 &&
      eNewY >= 0 &&
      eNewX <= canvas.width - this.size &&
      eNewY <= canvas.height - this.size
    );
  }

  setLastDirectionSpacing() {
    switch (this.lastDirection) {
      case "left":
        this.x -= this.size;
        break;
      case "right":
        this.x += this.size;
        break;
      case "up":
        this.y -= this.size;
        break;
      case "down":
        this.y += this.size;
        break;
    }
  }
}
