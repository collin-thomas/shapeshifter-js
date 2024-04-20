import { GameObject } from "./GameObject";

export class OtherPlayer extends GameObject {
  constructor({ id, x, y, size, color, speed }) {
    super({ id, x, y, size, color, speed });
  }
}
