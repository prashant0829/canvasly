import { MAX_ZOOM, MIN_ZOOM } from "./constants";

// screen position = scene position * zoom + offset
export function screenToScene(screenPoint, viewport) {
  return {
    x: (screenPoint.x - viewport.offsetX) / viewport.zoom,
    y: (screenPoint.y - viewport.offsetY) / viewport.zoom,
  };
}

export function sceneToScreen(scenePoint, viewport) {
  return {
    x: scenePoint.x * viewport.zoom + viewport.offsetX,
    y: scenePoint.y * viewport.zoom + viewport.offsetY,
  };
}

// Zooms while keeping the scene point under `anchor` (a screen position) where it is.
export function zoomViewportAt(viewport, anchor, nextZoom) {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
  const ratio = zoom / viewport.zoom;

  return {
    zoom,
    offsetX: anchor.x - (anchor.x - viewport.offsetX) * ratio,
    offsetY: anchor.y - (anchor.y - viewport.offsetY) * ratio,
  };
}
