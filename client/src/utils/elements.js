import { DEFAULT_ELEMENT_STYLE, SELECTION_PADDING } from "./constants";
import { normalizeBounds } from "./geometry";

export function createElement(type, x, y) {
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

export function moveElement(startElement, deltaX, deltaY) {
  return { ...startElement, x: startElement.x + deltaX, y: startElement.y + deltaY };
}

// The handle name says which edges follow the pointer (n = top, e = right, s = bottom, w = left).
export function resizeElement(startElement, handle, pointer) {
  const bounds = normalizeBounds(startElement);
  let left = bounds.x;
  let right = bounds.x + bounds.width;
  let top = bounds.y;
  let bottom = bounds.y + bounds.height;

  if (handle.includes("w")) left = pointer.x + SELECTION_PADDING;
  if (handle.includes("e")) right = pointer.x - SELECTION_PADDING;
  if (handle.includes("n")) top = pointer.y + SELECTION_PADDING;
  if (handle.includes("s")) bottom = pointer.y - SELECTION_PADDING;

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
