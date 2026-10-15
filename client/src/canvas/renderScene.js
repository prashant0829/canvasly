import { renderElement } from "./renderElement";
import { renderGrid } from "./renderGrid";
import { renderSelection } from "./renderSelection";

export function renderScene(context, width, height, scene) {
  const { elements, draftElement, selectedElements, marquee } = scene;

  renderGrid(context, width, height);
  elements.forEach((element) => renderElement(context, element));
  if (draftElement) renderElement(context, draftElement);
  renderSelection(context, selectedElements, marquee);
}
