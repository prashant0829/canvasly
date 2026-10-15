import { TOOLS } from "../utils/constants";
import { normalizeBounds } from "../utils/geometry";
import { createSeededRandom } from "./seededRandom";
import {
  addSketchDiamond,
  addSketchEllipse,
  addSketchLine,
  addSketchRectangle,
} from "./sketch";

export function renderElement(context, element) {
  const { type, strokeColor, strokeWidth, roughness, seed } = element;
  const random = createSeededRandom(seed);

  context.save();
  context.strokeStyle = strokeColor;
  context.lineWidth = strokeWidth;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();

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
  }

  context.stroke();
  context.restore();
}
