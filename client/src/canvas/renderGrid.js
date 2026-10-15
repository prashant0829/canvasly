import {
  CANVAS_BACKGROUND,
  GRID_DOT_COLOR,
  GRID_DOT_RADIUS,
  GRID_SIZE,
} from "../utils/constants";

export function renderGrid(context, width, height) {
  context.fillStyle = CANVAS_BACKGROUND;
  context.fillRect(0, 0, width, height);

  context.fillStyle = GRID_DOT_COLOR;
  for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
    for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
      context.beginPath();
      context.arc(x, y, GRID_DOT_RADIUS, 0, Math.PI * 2);
      context.fill();
    }
  }
}
