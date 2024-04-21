import { GameObject } from "./GameObject";
import { sendState } from "../websocket";
import { PlayableObject } from "./PlayableObject";

export class Player extends GameObject {
  constructor({ id, x, y, size, color, speed }) {
    super({ id, x, y, size, color, speed });
    this.lastDirection = null;
    this.previous = null;
  }

  draw(ctx) {
    super.draw(ctx);
    // Calculate the center of the rectangle
    const centerX = this.x + 30 / 2;
    const centerY = this.y + 30 / 2;

    // Draw a rounded dot at the center of the rectangle
    ctx.fillStyle = "white"; // Red color for the dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2, true); // Circle radius 5
    ctx.fill();
  }

  updatePosition(keysPressed, canvas, playableObjects, otherPlayers) {
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
    if (this.isCollision(newX, newY, [...playableObjects, ...otherPlayers])) {
      return;
    }

    // Don't update if out of bounds
    if (
      !(
        newX >= 0 &&
        newY >= 0 &&
        newX <= canvas.width - this.size &&
        newY <= canvas.height - this.size
      )
    ) {
      return;
    }

    // Update position
    this.x = newX;
    this.y = newY;

    // Send update to server
    sendState({ player: this });
  }

  isCollision(newX, newY, playableObjects) {
    for (let playableObject of playableObjects) {
      if (
        newX < playableObject.x + playableObject.size &&
        newX + this.size > playableObject.x &&
        newY < playableObject.y + playableObject.size &&
        newY + this.size > playableObject.y
      ) {
        return true;
      }
    }
    return false;
  }

  handleSpaceBar(canvas, playableObjects, otherPlayers) {
    let adjacentBlock = playableObjects.find(
      (b) =>
        Math.abs(b.x - this.x) <= this.size &&
        Math.abs(b.y - this.y) <= this.size
    );

    if (adjacentBlock && !this.previous) {
      this.previous = { ...this }; // Clone current state
      const { id, ...adjacentBlockNoId } = adjacentBlock;
      Object.assign(this, adjacentBlockNoId);
      playableObjects.splice(playableObjects.indexOf(adjacentBlock), 1);
    } else if (
      this.previous &&
      !adjacentBlock &&
      this.playerAbleToEject(canvas, [...playableObjects, ...otherPlayers])
    ) {
      const restoredPlayableObject = new PlayableObject({
        id: this.id,
        x: this.x,
        y: this.y,
        size: this.size,
        color: this.color,
        speed: this.speed,
      });
      playableObjects.push(restoredPlayableObject);
      console.log({ restoredPlayableObject });
      this.color = this.previous.color;
      this.previous = null;
      this.setLastDirectionSpacing();
    }
    // Send update to server
    sendState({ player: this, playableObjects });
  }

  playerAbleToEject(canvas, playableObjects) {
    let eNewX = this.x;
    let eNewY = this.y;
    let c = false;

    switch (this.lastDirection) {
      case "left":
        c = this.isCollision(this.x - 30, this.y, playableObjects);
        eNewX -= 30;
        break;
      case "right":
        c = this.isCollision(this.x + 30, this.y, playableObjects);
        eNewX += 30;
        break;
      case "up":
        c = this.isCollision(this.x, this.y - 30, playableObjects);
        eNewY -= 30;
        break;
      case "down":
        c = this.isCollision(this.x, this.y + 30, playableObjects);
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
