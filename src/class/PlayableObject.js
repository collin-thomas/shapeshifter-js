import { GameObject } from "./GameObject";

export class PlayableObject extends GameObject {
  constructor(x, y, size, color, speed) {
    super(x, y, size, color, speed);
  }
}
