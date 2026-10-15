import { renderElement } from "./renderElement";
import { renderGrid } from "./renderGrid";

export function renderScene(context, width, height, elements, draftElement) {
  renderGrid(context, width, height);
  elements.forEach((element) => renderElement(context, element));
  if (draftElement) renderElement(context, draftElement);
}
