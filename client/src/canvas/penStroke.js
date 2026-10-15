// Smooths the pen path by curving through the midpoints between recorded points.
export function addPenStroke(context, points, offsetX, offsetY) {
  const shifted = points.map((point) => ({ x: point.x + offsetX, y: point.y + offsetY }));
  const first = shifted[0];

  context.moveTo(first.x, first.y);

  if (shifted.length < 3) {
    const last = shifted[shifted.length - 1];
    context.lineTo(last.x, last.y);
    return;
  }

  for (let index = 1; index < shifted.length - 1; index++) {
    const current = shifted[index];
    const next = shifted[index + 1];
    context.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2
    );
  }

  const last = shifted[shifted.length - 1];
  context.lineTo(last.x, last.y);
}
