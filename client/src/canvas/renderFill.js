import { CLOSED_SHAPE_TOOLS, TOOLS } from "../utils/constants";
import { normalizeBounds } from "../utils/geometry";
import { createSeededRandom } from "./seededRandom";
import { getCornerRadius, pointAlong } from "./sketch";

const HATCH_GAP = 9;
const HATCH_SLOPE = 1.15;

export function hasFill(element) {
  return CLOSED_SHAPE_TOOLS.includes(element.type) && element.backgroundColor !== "transparent";
}

function addRoundedDiamondPath(context, bounds, radius) {
  const { x, y, width, height } = bounds;
  const vertices = [
    { x: x + width / 2, y },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y: y + height },
    { x, y: y + height / 2 },
  ];

  vertices.forEach((vertex, index) => {
    const previous = vertices[(index + vertices.length - 1) % vertices.length];
    const next = vertices[(index + 1) % vertices.length];
    const start = pointAlong(vertex, previous, radius);
    const end = pointAlong(vertex, next, radius);

    if (index === 0) context.moveTo(start.x, start.y);
    else context.lineTo(start.x, start.y);
    context.quadraticCurveTo(vertex.x, vertex.y, end.x, end.y);
  });
  context.closePath();
}

function addShapePath(context, element) {
  const bounds = normalizeBounds(element);
  const radius = getCornerRadius(bounds);

  context.beginPath();
  if (element.type === TOOLS.ELLIPSE) {
    context.ellipse(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      bounds.width / 2,
      bounds.height / 2,
      0,
      0,
      Math.PI * 2
    );
  } else if (element.type === TOOLS.DIAMOND) {
    addRoundedDiamondPath(context, bounds, Math.min(radius, bounds.width / 4, bounds.height / 4));
  } else {
    context.roundRect(bounds.x, bounds.y, bounds.width, bounds.height, radius);
  }
}

// Hachure = diagonal pen lines, clipped to the shape, with a little wobble like a real marker.
function drawHachure(context, element, bounds) {
  const random = createSeededRandom(element.seed + 1);
  const slopeShift = bounds.height * HATCH_SLOPE;

  context.strokeStyle = element.backgroundColor;
  context.lineWidth = Math.max(1, element.strokeWidth * 0.75);
  context.lineCap = "round";
  context.beginPath();

  for (let offset = -slopeShift; offset < bounds.width; offset += HATCH_GAP) {
    const startX = bounds.x + offset + (random() - 0.5) * 2;
    const bottom = bounds.y + bounds.height;
    context.moveTo(startX, bottom + 2);
    context.lineTo(startX + slopeShift + 4, bounds.y - 2);
  }

  context.stroke();
}

export function renderFill(context, element) {
  const bounds = normalizeBounds(element);

  context.save();
  addShapePath(context, element);
  context.clip();

  if (element.fillStyle === "solid") {
    context.fillStyle = element.backgroundColor;
    context.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
  } else {
    drawHachure(context, element, bounds);
  }

  context.restore();
}
