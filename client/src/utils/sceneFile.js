import {
  DEFAULT_ELEMENT_STYLE,
  SCENE_FILE_TYPE,
  SCENE_FILE_VERSION,
} from "./constants";

export function serializeScene(elements) {
  return JSON.stringify(
    { type: SCENE_FILE_TYPE, version: SCENE_FILE_VERSION, elements },
    null,
    2
  );
}

function isValidElement(element) {
  return (
    element &&
    typeof element.id === "string" &&
    typeof element.type === "string" &&
    Number.isFinite(element.x) &&
    Number.isFinite(element.y)
  );
}

// Throws an Error with a readable message when the file isn't a Canvasly board.
export function parseScene(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }

  if (data?.type !== SCENE_FILE_TYPE || !Array.isArray(data.elements)) {
    throw new Error("This file is not a Canvasly board.");
  }

  return data.elements
    .filter(isValidElement)
    .map((element) => ({ ...DEFAULT_ELEMENT_STYLE, width: 0, height: 0, ...element }));
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function getDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
