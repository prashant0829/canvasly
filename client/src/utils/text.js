import { FONT_FAMILY, TEXT_LINE_HEIGHT } from "./constants";

let measureContext = null;

function getMeasureContext() {
  if (!measureContext) {
    measureContext = document.createElement("canvas").getContext("2d");
  }
  return measureContext;
}

export function getFont(fontSize) {
  return `${fontSize}px ${FONT_FAMILY}`;
}

export function measureText(text, fontSize) {
  const context = getMeasureContext();
  context.font = getFont(fontSize);

  const lines = text.split("\n");
  const width = Math.max(...lines.map((line) => context.measureText(line).width));

  return { width, height: lines.length * fontSize * TEXT_LINE_HEIGHT };
}
