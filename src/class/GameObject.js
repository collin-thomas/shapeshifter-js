export class GameObject {
  constructor(x, y, size, color, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.speed = speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
