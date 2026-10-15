import { HANDLE_SIZE, MARQUEE_FILL, SELECTION_COLOR } from "../utils/constants";
import { getHandlePositions, getSelectionBounds } from "../utils/hitTest";

// Everything here is divided by zoom so handles and lines keep the same size on screen.
function renderHandles(context, selectionBounds, zoom) {
  const positions = Object.values(getHandlePositions(selectionBounds));
  const size = HANDLE_SIZE / zoom;

  context.fillStyle = "#ffffff";
  context.strokeStyle = SELECTION_COLOR;
  context.lineWidth = 1.5 / zoom;

  positions.forEach(({ x, y }) => {
    context.fillRect(x - size / 2, y - size / 2, size, size);
    context.strokeRect(x - size / 2, y - size / 2, size, size);
  });
}

export function renderSelection(context, selectedElements, marquee, zoom) {
  context.save();

  context.strokeStyle = SELECTION_COLOR;
  context.lineWidth = 1.5 / zoom;
  context.setLineDash([6 / zoom, 4 / zoom]);
  selectedElements.forEach((element) => {
    const { x, y, width, height } = getSelectionBounds(element, zoom);
    context.strokeRect(x, y, width, height);
  });
  context.setLineDash([]);

  if (selectedElements.length === 1) {
    renderHandles(context, getSelectionBounds(selectedElements[0], zoom), zoom);
  }

  if (marquee) {
    context.fillStyle = MARQUEE_FILL;
    context.fillRect(marquee.x, marquee.y, marquee.width, marquee.height);
    context.strokeRect(marquee.x, marquee.y, marquee.width, marquee.height);
  }

  context.restore();
}
