import { TEXT_LINE_HEIGHT, TOOLS } from "../utils/constants";
import { normalizeBounds } from "../utils/geometry";
import { getFont } from "../utils/text";
import { addPenStroke } from "./penStroke";
import { hasFill, renderFill } from "./renderFill";
import { createSeededRandom } from "./seededRandom";
import {
  addSketchArrow,
  addSketchDiamond,
  addSketchEllipse,
  addSketchLine,
  addSketchRectangle,
} from "./sketch";

function renderText(context, element) {
  context.save();
  context.font = getFont(element.fontSize);
  context.fillStyle = element.strokeColor;
  context.textBaseline = "top";

  element.text.split("\n").forEach((line, index) => {
    const lineY = element.y + index * element.fontSize * TEXT_LINE_HEIGHT;
    context.fillText(line, element.x, lineY);
  });

  context.restore();
}

function addElementPath(context, element, random) {
  const { type, roughness } = element;

  switch (type) {
    case TOOLS.RECTANGLE:
      addSketchRectangle(context, normalizeBounds(element), random, roughness);
      break;
    case TOOLS.DIAMOND:
      addSketchDiamond(context, normalizeBounds(element), random, roughness);
      break;
    case TOOLS.ELLIPSE:
      addSketchEllipse(context, normalizeBounds(element), random, roughness);
      break;
    case TOOLS.ARROW:
      addSketchArrow(context, element, random, roughness);
      break;
    case TOOLS.LINE:
      addSketchLine(
        context,
        element.x,
        element.y,
        element.x + element.width,
        element.y + element.height,
        random,
        roughness
      );
      break;
    case TOOLS.PEN:
      addPenStroke(context, element.points, element.x, element.y);
      break;
  }
}

export function renderElement(context, element) {
  if (element.type === TOOLS.TEXT) {
    renderText(context, element);
    return;
  }

  if (hasFill(element)) renderFill(context, element);

  context.save();
  context.strokeStyle = element.strokeColor;
  context.lineWidth = element.strokeWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

  addElementPath(context, element, createSeededRandom(element.seed));

  context.stroke();
  context.restore();
}
