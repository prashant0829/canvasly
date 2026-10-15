import { HANDLE_SIZE, MARQUEE_FILL, SELECTION_COLOR } from "../utils/constants";
import { getHandlePositions, getSelectionBounds } from "../utils/hitTest";

function renderHandles(context, selectionBounds) {
  const positions = Object.values(getHandlePositions(selectionBounds));

  context.fillStyle = "#ffffff";
  context.strokeStyle = SELECTION_COLOR;
  context.lineWidth = 1.5;

  positions.forEach(({ x, y }) => {
    context.fillRect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    context.strokeRect(x - HANDLE_SIZE / 2, y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
  });
}

export function renderSelection(context, selectedElements, marquee) {
  context.save();

  context.strokeStyle = SELECTION_COLOR;
  context.lineWidth = 1.5;
  context.setLineDash([6, 4]);
  selectedElements.forEach((element) => {
    const { x, y, width, height } = getSelectionBounds(element);
    context.strokeRect(x, y, width, height);
  });
  context.setLineDash([]);

  if (selectedElements.length === 1) {
    renderHandles(context, getSelectionBounds(selectedElements[0]));
  }

  if (marquee) {
    context.fillStyle = MARQUEE_FILL;
    context.fillRect(marquee.x, marquee.y, marquee.width, marquee.height);
    context.strokeRect(marquee.x, marquee.y, marquee.width, marquee.height);
  }

  context.restore();
}
