import { ARROW_HEAD_ANGLE, ARROW_HEAD_LENGTH } from "../utils/constants";

const LINE_PASSES = 2;
const MAX_CORNER_RADIUS = 32;
const CORNER_RADIUS_RATIO = 0.25;
const ELLIPSE_POINT_COUNT = 16;
const ELLIPSE_OVERLAP_POINTS = 3;

function randomOffset(random, amount) {
  return (random() * 2 - 1) * amount;
}

// Each stroke is drawn LINE_PASSES times with tiny differences, like going over a line with a pen.
export function addSketchLine(context, x1, y1, x2, y2, random, roughness) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  if (length === 0) return;

  const endpointJitter = Math.min(roughness * 0.6, length * 0.1);
  const maxBow = Math.min(roughness * length * 0.008, 2.5);
  const normalX = -(y2 - y1) / length;
  const normalY = (x2 - x1) / length;

  for (let pass = 0; pass < LINE_PASSES; pass++) {
    const bowDirection = pass % 2 === 0 ? 1 : -1;
    const bow = bowDirection * maxBow * (0.4 + random() * 0.6);
    const controlX = (x1 + x2) / 2 + normalX * bow;
    const controlY = (y1 + y2) / 2 + normalY * bow;

    context.moveTo(
      x1 + randomOffset(random, endpointJitter),
      y1 + randomOffset(random, endpointJitter)
    );
    context.quadraticCurveTo(
      controlX,
      controlY,
      x2 + randomOffset(random, endpointJitter),
      y2 + randomOffset(random, endpointJitter)
    );
  }
}

export function pointAlong(from, to, distance) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  if (length === 0) return from;
  return {
    x: from.x + ((to.x - from.x) / length) * distance,
    y: from.y + ((to.y - from.y) / length) * distance,
  };
}

export function getCornerRadius({ width, height }) {
  return Math.min(MAX_CORNER_RADIUS, CORNER_RADIUS_RATIO * Math.min(width, height));
}

// Straight sketchy edges, joined at each vertex by a small curve (the rounded corner).
function addRoundedPolygon(context, vertices, cornerRadius, random, roughness) {
  const count = vertices.length;
  const nextIndex = (index) => (index + 1) % count;
  const previousIndex = (index) => (index - 1 + count) % count;
  const edgeLength = (index) => {
    const from = vertices[index];
    const to = vertices[nextIndex(index)];
    return Math.hypot(to.x - from.x, to.y - from.y);
  };

  const radii = vertices.map((_, index) =>
    Math.min(cornerRadius, edgeLength(previousIndex(index)) / 2, edgeLength(index) / 2)
  );

  vertices.forEach((vertex, index) => {
    const next = vertices[nextIndex(index)];
    const previous = vertices[previousIndex(index)];

    const edgeStart = pointAlong(vertex, next, radii[index]);
    const edgeEnd = pointAlong(next, vertex, radii[nextIndex(index)]);
    addSketchLine(context, edgeStart.x, edgeStart.y, edgeEnd.x, edgeEnd.y, random, roughness);

    const cornerStart = pointAlong(vertex, previous, radii[index]);
    const cornerJitter = Math.min(roughness * 0.6, radii[index] * 0.1);
    for (let pass = 0; pass < LINE_PASSES; pass++) {
      context.moveTo(
        cornerStart.x + randomOffset(random, cornerJitter),
        cornerStart.y + randomOffset(random, cornerJitter)
      );
      context.quadraticCurveTo(
        vertex.x + randomOffset(random, cornerJitter),
        vertex.y + randomOffset(random, cornerJitter),
        edgeStart.x + randomOffset(random, cornerJitter),
        edgeStart.y + randomOffset(random, cornerJitter)
      );
    }
  });
}

export function addSketchRectangle(context, bounds, random, roughness) {
  const { x, y, width, height } = bounds;
  const vertices = [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ];

  addRoundedPolygon(context, vertices, getCornerRadius(bounds), random, roughness);
}

export function addSketchDiamond(context, bounds, random, roughness) {
  const { x, y, width, height } = bounds;
  const vertices = [
    { x: x + width / 2, y },
    { x: x + width, y: y + height / 2 },
    { x: x + width / 2, y: y + height },
    { x, y: y + height / 2 },
  ];

  addRoundedPolygon(context, vertices, getCornerRadius(bounds), random, roughness);
}

function addSmoothCurve(context, points) {
  const first = points[0];
  const second = points[1];
  context.moveTo((first.x + second.x) / 2, (first.y + second.y) / 2);

  for (let index = 1; index < points.length - 1; index++) {
    const current = points[index];
    const next = points[index + 1];
    context.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2
    );
  }
}

// Going slightly past a full circle makes the start and end overlap, like a real pen loop.
export function addSketchEllipse(context, bounds, random, roughness) {
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;
  if (radiusX === 0 || radiusY === 0) return;

  const centerX = bounds.x + radiusX;
  const centerY = bounds.y + radiusY;
  const jitter = Math.min(roughness * 0.8, Math.min(radiusX, radiusY) * 0.05);

  for (let pass = 0; pass < LINE_PASSES; pass++) {
    const startAngle = random() * Math.PI * 2;
    const points = [];

    for (let index = 0; index < ELLIPSE_POINT_COUNT + ELLIPSE_OVERLAP_POINTS; index++) {
      const angle = startAngle + (index / ELLIPSE_POINT_COUNT) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * (radiusX + randomOffset(random, jitter)),
        y: centerY + Math.sin(angle) * (radiusY + randomOffset(random, jitter)),
      });
    }

    addSmoothCurve(context, points);
  }
}

// The head is two short sketchy lines swept back from the tip.
export function addSketchArrow(context, element, random, roughness) {
  const endX = element.x + element.width;
  const endY = element.y + element.height;
  const length = Math.hypot(element.width, element.height);

  addSketchLine(context, element.x, element.y, endX, endY, random, roughness);
  if (length === 0) return;

  const angle = Math.atan2(element.height, element.width);
  const headLength = Math.min(ARROW_HEAD_LENGTH, length / 2);

  [-1, 1].forEach((side) => {
    const headAngle = angle + Math.PI + side * ARROW_HEAD_ANGLE;
    addSketchLine(
      context,
      endX,
      endY,
      endX + Math.cos(headAngle) * headLength,
      endY + Math.sin(headAngle) * headLength,
      random,
      roughness
    );
  });
}
