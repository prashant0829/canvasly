import { renderElement } from "../canvas/renderElement";
import {
  CANVAS_BACKGROUND,
  EXPORT_PADDING,
  EXPORT_SCALE,
  FONT_FAMILY,
  TOOLS,
} from "../utils/constants";
import { normalizeBounds } from "../utils/geometry";
import fontUrl from "../assets/fonts/Excalifont-Latin.woff2?url";
import { createSvgContext } from "./svgContext";

// The box that contains every shape, plus some breathing room around it.
function getSceneBounds(elements, padding) {
  const boxes = elements.map((element) => normalizeBounds(element));
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));

  return {
    x: left - padding,
    y: top - padding,
    width: right - left + padding * 2,
    height: bottom - top + padding * 2,
  };
}

function drawElements(context, elements) {
  elements.forEach((element) => {
    context.globalAlpha = (element.opacity ?? 100) / 100;
    renderElement(context, element);
  });
  context.globalAlpha = 1;
}

export function exportToPngBlob(elements, { scale = EXPORT_SCALE, padding = EXPORT_PADDING } = {}) {
  const bounds = getSceneBounds(elements, padding);
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(bounds.width * scale);
  canvas.height = Math.ceil(bounds.height * scale);

  const context = canvas.getContext("2d");
  context.fillStyle = CANVAS_BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(scale, scale);
  context.translate(-bounds.x, -bounds.y);
  drawElements(context, elements);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

// Embeds the font inside the SVG so text looks right on computers that don't have Excalifont.
async function getFontFaceCss() {
  const response = await fetch(fontUrl);
  const bytes = new Uint8Array(await response.arrayBuffer());

  let binary = "";
  for (let index = 0; index < bytes.length; index += 8192) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 8192));
  }

  return (
    `@font-face{font-family:"Excalifont";font-weight:400;` +
    `src:url(data:font/woff2;base64,${btoa(binary)}) format("woff2");}`
  );
}

export async function exportToSvgString(elements, { padding = EXPORT_PADDING } = {}) {
  const bounds = getSceneBounds(elements, padding);
  const svgContext = createSvgContext(FONT_FAMILY.replace(/"/g, ""));
  drawElements(svgContext, elements);

  const hasText = elements.some((element) => element.type === TOOLS.TEXT);
  const style = hasText ? `<style>${await getFontFaceCss()}</style>` : "";
  const { x, y, width, height } = bounds;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(width)}" height="${Math.ceil(height)}" ` +
    `viewBox="${x} ${y} ${width} ${height}">${style}` +
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${CANVAS_BACKGROUND}"/>` +
    `${svgContext.toMarkup()}</svg>`
  );
}
