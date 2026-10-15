import { ERASER_FADED_OPACITY } from "../utils/constants";
import { renderElement } from "./renderElement";
import { renderEraserTrail } from "./renderEraserTrail";
import { renderGrid } from "./renderGrid";
import { renderSelection } from "./renderSelection";

export function renderScene(context, width, height, scene) {
  const {
    elements,
    draftElement,
    selectedElements,
    marquee,
    hiddenElementId,
    fadedElementIds,
    eraserTrail,
  } = scene;

  renderGrid(context, width, height);

  elements
    .filter((element) => element.id !== hiddenElementId)
    .forEach((element) => {
      const isFaded = fadedElementIds.includes(element.id);
      const elementOpacity = (element.opacity ?? 100) / 100;
      context.globalAlpha = elementOpacity * (isFaded ? ERASER_FADED_OPACITY : 1);
      renderElement(context, element);
    });
  context.globalAlpha = 1;

  if (draftElement) renderElement(context, draftElement);
  renderSelection(context, selectedElements, marquee);
  renderEraserTrail(context, eraserTrail, performance.now());
}
