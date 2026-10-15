import {
  CANVAS_BACKGROUND,
  GRID_DOT_COLOR,
  GRID_DOT_RADIUS,
  GRID_SIZE,
  MIN_GRID_SPACING,
} from "../utils/constants";

// Drawn in screen space so the dots stay the same size; they just slide and re-space with pan and zoom.
export function renderGrid(context, width, height, viewport, showGrid) {
  context.fillStyle = CANVAS_BACKGROUND;
  context.fillRect(0, 0, width, height);
  if (!showGrid) return;

  let spacing = GRID_SIZE * viewport.zoom;
  while (spacing < MIN_GRID_SPACING) spacing *= 2;

  const startX = ((viewport.offsetX % spacing) + spacing) % spacing;
  const startY = ((viewport.offsetY % spacing) + spacing) % spacing;

  context.fillStyle = GRID_DOT_COLOR;
  for (let x = startX; x < width; x += spacing) {
    for (let y = startY; y < height; y += spacing) {
      context.beginPath();
      context.arc(x, y, GRID_DOT_RADIUS, 0, Math.PI * 2);
      context.fill();
    }
  }
}
