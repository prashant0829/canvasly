import { ERASER_TRAIL_LIFETIME_MS } from "../utils/constants";

const TRAIL_MAX_WIDTH = 9;
const TRAIL_MIN_WIDTH = 2;
const TRAIL_MAX_ALPHA = 0.28;

// Each piece of the trail fades and thins as it ages, so it looks like it melts away behind the pointer.
export function renderEraserTrail(context, trailPoints, now, zoom = 1) {
  if (trailPoints.length < 2) return;

  context.save();
  context.lineCap = "round";

  for (let index = 1; index < trailPoints.length; index++) {
    const start = trailPoints[index - 1];
    const end = trailPoints[index];
    const freshness = Math.max(0, 1 - (now - end.time) / ERASER_TRAIL_LIFETIME_MS);

    context.strokeStyle = `rgba(31, 31, 43, ${TRAIL_MAX_ALPHA * freshness})`;
    context.lineWidth =
      (TRAIL_MIN_WIDTH + (TRAIL_MAX_WIDTH - TRAIL_MIN_WIDTH) * freshness) / zoom;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  context.restore();
}
