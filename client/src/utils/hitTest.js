import {
  CLOSED_SHAPE_TOOLS,
  HANDLE_HIT_RADIUS,
  HIT_TOLERANCE,
  RESIZE_HANDLES,
  SELECTION_PADDING,
  TOOLS,
} from "./constants";
import { distanceToSegment, normalizeBounds } from "./geometry";

function getOutlineSegments(element) {
  const { x, y, width, height } = normalizeBounds(element);
  const right = x + width;
  const bottom = y + height;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  switch (element.type) {
    case TOOLS.RECTANGLE: {
      const corners = [
        { x, y },
        { x: right, y },
        { x: right, y: bottom },
        { x, y: bottom },
      ];
      return corners.map((corner, index) => [corner, corners[(index + 1) % 4]]);
    }
    case TOOLS.DIAMOND: {
      const points = [
        { x: centerX, y },
        { x: right, y: centerY },
        { x: centerX, y: bottom },
        { x, y: centerY },
      ];
      return points.map((point, index) => [point, points[(index + 1) % 4]]);
    }
    case TOOLS.LINE:
    case TOOLS.ARROW:
      return [
        [
          { x: element.x, y: element.y },
          { x: element.x + element.width, y: element.y + element.height },
        ],
      ];
    case TOOLS.PEN:
      return element.points.slice(1).map((point, index) => [
        { x: element.x + element.points[index].x, y: element.y + element.points[index].y },
        { x: element.x + point.x, y: element.y + point.y },
      ]);
    default:
      return [];
  }
}

function isPointInsideBounds(element, point) {
  const { x, y, width, height } = normalizeBounds(element);
  return (
    point.x >= x - HIT_TOLERANCE &&
    point.x <= x + width + HIT_TOLERANCE &&
    point.y >= y - HIT_TOLERANCE &&
    point.y <= y + height + HIT_TOLERANCE
  );
}

function isPointOnEllipse(element, point) {
  const bounds = normalizeBounds(element);
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;
  if (radiusX === 0 || radiusY === 0) return false;

  const offsetX = (point.x - (bounds.x + radiusX)) / radiusX;
  const offsetY = (point.y - (bounds.y + radiusY)) / radiusY;
  const distanceFromCenter = Math.hypot(offsetX, offsetY);

  return Math.abs(distanceFromCenter - 1) * Math.min(radiusX, radiusY) <= HIT_TOLERANCE;
}

function isFilled(element) {
  return CLOSED_SHAPE_TOOLS.includes(element.type) && element.backgroundColor !== "transparent";
}

function isPointInsideClosedShape(element, point) {
  const bounds = normalizeBounds(element);
  const radiusX = bounds.width / 2;
  const radiusY = bounds.height / 2;
  if (radiusX === 0 || radiusY === 0) return false;

  const offsetX = Math.abs(point.x - (bounds.x + radiusX)) / radiusX;
  const offsetY = Math.abs(point.y - (bounds.y + radiusY)) / radiusY;

  if (element.type === TOOLS.ELLIPSE) return Math.hypot(offsetX, offsetY) <= 1;
  if (element.type === TOOLS.DIAMOND) return offsetX + offsetY <= 1;
  return offsetX <= 1 && offsetY <= 1;
}

export function isPointOnElement(element, point) {
  if (element.type === TOOLS.TEXT) return isPointInsideBounds(element, point);
  if (isFilled(element) && isPointInsideClosedShape(element, point)) return true;
  if (element.type === TOOLS.ELLIPSE) return isPointOnEllipse(element, point);

  return getOutlineSegments(element).some(
    ([start, end]) => distanceToSegment(point, start, end) <= HIT_TOLERANCE
  );
}

// Last element in the array is drawn on top, so we check from the end.
export function getElementAtPoint(elements, point) {
  for (let index = elements.length - 1; index >= 0; index--) {
    if (isPointOnElement(elements[index], point)) return elements[index];
  }
  return null;
}

export function getSelectionBounds(element) {
  const bounds = normalizeBounds(element);
  return {
    x: bounds.x - SELECTION_PADDING,
    y: bounds.y - SELECTION_PADDING,
    width: bounds.width + SELECTION_PADDING * 2,
    height: bounds.height + SELECTION_PADDING * 2,
  };
}

export function getHandlePositions(selectionBounds) {
  const { x, y, width, height } = selectionBounds;
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  return {
    nw: { x, y },
    n: { x: centerX, y },
    ne: { x: x + width, y },
    e: { x: x + width, y: centerY },
    se: { x: x + width, y: y + height },
    s: { x: centerX, y: y + height },
    sw: { x, y: y + height },
    w: { x, y: centerY },
  };
}

export function getResizeHandleAtPoint(element, point) {
  const positions = getHandlePositions(getSelectionBounds(element));

  return (
    RESIZE_HANDLES.find((handle) => {
      const position = positions[handle];
      return Math.hypot(point.x - position.x, point.y - position.y) <= HANDLE_HIT_RADIUS;
    }) ?? null
  );
}
