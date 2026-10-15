import {
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_FONT_SIZE,
  MIN_FONT_SIZE,
  MIN_POINT_DISTANCE,
  SELECTION_PADDING,
  TOOLS,
} from "./constants";
import { normalizeBounds } from "./geometry";
import { measureText } from "./text";

function createBaseElement(type, x, y) {
  return {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    width: 0,
    height: 0,
    seed: Math.floor(Math.random() * 2 ** 31),
    ...DEFAULT_ELEMENT_STYLE,
  };
}

export function createElement(type, x, y) {
  const element = createBaseElement(type, x, y);
  if (type === TOOLS.PEN) element.points = [{ x: 0, y: 0 }];
  return element;
}

export function createTextElement(x, y, text) {
  return {
    ...createBaseElement(TOOLS.TEXT, x, y),
    text,
    fontSize: DEFAULT_FONT_SIZE,
    ...measureText(text, DEFAULT_FONT_SIZE),
  };
}

// While dragging: shapes grow their box, the pen collects points (relative to where it started).
export function extendDraftElement(draft, point) {
  if (draft.type !== TOOLS.PEN) {
    return { ...draft, width: point.x - draft.x, height: point.y - draft.y };
  }

  const nextPoint = { x: point.x - draft.x, y: point.y - draft.y };
  const lastPoint = draft.points[draft.points.length - 1];
  const distance = Math.hypot(nextPoint.x - lastPoint.x, nextPoint.y - lastPoint.y);
  if (distance < MIN_POINT_DISTANCE) return draft;

  return { ...draft, points: [...draft.points, nextPoint] };
}

// After drawing, move the pen's origin to its top-left so it has a normal box like other shapes.
export function finalizePenElement(draft) {
  const xs = draft.points.map((point) => point.x);
  const ys = draft.points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  return {
    ...draft,
    x: draft.x + minX,
    y: draft.y + minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
    points: draft.points.map((point) => ({ x: point.x - minX, y: point.y - minY })),
  };
}

export function moveElement(startElement, deltaX, deltaY) {
  return { ...startElement, x: startElement.x + deltaX, y: startElement.y + deltaY };
}

// The handle name says which edges follow the pointer (n = top, e = right, s = bottom, w = left).
function getResizedEdges(startElement, handle, pointer) {
  const bounds = normalizeBounds(startElement);
  let left = bounds.x;
  let right = bounds.x + bounds.width;
  let top = bounds.y;
  let bottom = bounds.y + bounds.height;

  if (handle.includes("w")) left = pointer.x + SELECTION_PADDING;
  if (handle.includes("e")) right = pointer.x - SELECTION_PADDING;
  if (handle.includes("n")) top = pointer.y + SELECTION_PADDING;
  if (handle.includes("s")) bottom = pointer.y - SELECTION_PADDING;

  return { left, right, top, bottom };
}

function resizeBox(startElement, { left, right, top, bottom }) {
  // Keep the original drawing direction so a line keeps pointing the same way.
  const isFlippedX = startElement.width < 0;
  const isFlippedY = startElement.height < 0;

  return {
    ...startElement,
    x: isFlippedX ? right : left,
    y: isFlippedY ? bottom : top,
    width: isFlippedX ? left - right : right - left,
    height: isFlippedY ? top - bottom : bottom - top,
  };
}

function resizePen(startElement, { left, right, top, bottom }) {
  const scaleX = startElement.width === 0 ? 1 : (right - left) / startElement.width;
  const scaleY = startElement.height === 0 ? 1 : (bottom - top) / startElement.height;

  const scalePoint = (point) => ({
    x: (scaleX >= 0 ? point.x : startElement.width - point.x) * Math.abs(scaleX),
    y: (scaleY >= 0 ? point.y : startElement.height - point.y) * Math.abs(scaleY),
  });

  return {
    ...startElement,
    x: Math.min(left, right),
    y: Math.min(top, bottom),
    width: Math.abs(right - left),
    height: Math.abs(bottom - top),
    points: startElement.points.map(scalePoint),
  };
}

// Text keeps its shape; dragging a handle just changes the font size.
function resizeText(startElement, handle, edges) {
  const { left, right, top, bottom } = edges;
  const bounds = normalizeBounds(startElement);
  const ratioX = Math.abs(right - left) / startElement.width;
  const ratioY = Math.abs(bottom - top) / startElement.height;
  const ratio = Math.abs(ratioX - 1) > Math.abs(ratioY - 1) ? ratioX : ratioY;

  const fontSize = Math.max(MIN_FONT_SIZE, startElement.fontSize * ratio);
  const factor = fontSize / startElement.fontSize;
  const width = startElement.width * factor;
  const height = startElement.height * factor;

  return {
    ...startElement,
    fontSize,
    width,
    height,
    x: handle.includes("w") ? bounds.x + bounds.width - width : bounds.x,
    y: handle.includes("n") ? bounds.y + bounds.height - height : bounds.y,
  };
}

export function resizeElement(startElement, handle, pointer) {
  const edges = getResizedEdges(startElement, handle, pointer);

  if (startElement.type === TOOLS.TEXT) return resizeText(startElement, handle, edges);
  if (startElement.type === TOOLS.PEN) return resizePen(startElement, edges);
  return resizeBox(startElement, edges);
}
