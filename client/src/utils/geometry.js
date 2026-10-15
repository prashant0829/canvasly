// Dragging up or left gives negative width/height; this turns it into a normal box.
export function normalizeBounds({ x, y, width, height }) {
  return {
    x: Math.min(x, x + width),
    y: Math.min(y, y + height),
    width: Math.abs(width),
    height: Math.abs(height),
  };
}
