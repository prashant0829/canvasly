import { useEffect, useMemo, useRef, useState } from "react";
import { renderScene } from "../../canvas/renderScene";
import {
  DRAWING_TOOLS,
  HANDLE_CURSORS,
  INTERACTIONS,
  MIN_SHAPE_SIZE,
  TOOLS,
} from "../../utils/constants";
import { createElement, moveElement, resizeElement } from "../../utils/elements";
import { boundsIntersect, normalizeBounds } from "../../utils/geometry";
import { getElementAtPoint, getResizeHandleAtPoint } from "../../utils/hitTest";
import "./Canvas.scss";

function getViewportSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function Canvas({
  activeTool,
  elements,
  selectedIds,
  onElementAdded,
  onElementsChange,
  onSelectionChange,
}) {
  const canvasRef = useRef(null);
  const interactionRef = useRef(null);
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const [draftElement, setDraftElement] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [hoverCursor, setHoverCursor] = useState("default");

  const isDrawingTool = DRAWING_TOOLS.includes(activeTool);
  const isSelectTool = activeTool === TOOLS.SELECT;

  const selectedElements = useMemo(
    () => elements.filter((element) => selectedIds.includes(element.id)),
    [elements, selectedIds]
  );

  useEffect(() => {
    function handleResize() {
      setViewportSize(getViewportSize());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;
    const { width, height } = viewportSize;

    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    renderScene(context, width, height, {
      elements,
      draftElement,
      selectedElements,
      marquee,
    });
  }, [viewportSize, elements, draftElement, selectedElements, marquee]);

  function getPointerPosition(event) {
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function startSelectInteraction(point, isShiftPressed) {
    if (selectedElements.length === 1) {
      const handle = getResizeHandleAtPoint(selectedElements[0], point);
      if (handle) {
        interactionRef.current = {
          type: INTERACTIONS.RESIZE,
          handle,
          startElement: selectedElements[0],
        };
        return;
      }
    }

    const hitElement = getElementAtPoint(elements, point);

    if (hitElement) {
      let nextSelectedIds = selectedIds;

      if (isShiftPressed) {
        nextSelectedIds = selectedIds.includes(hitElement.id)
          ? selectedIds.filter((id) => id !== hitElement.id)
          : [...selectedIds, hitElement.id];
        onSelectionChange(nextSelectedIds);
        if (!nextSelectedIds.includes(hitElement.id)) return;
      } else if (!selectedIds.includes(hitElement.id)) {
        nextSelectedIds = [hitElement.id];
        onSelectionChange(nextSelectedIds);
      }

      interactionRef.current = {
        type: INTERACTIONS.MOVE,
        startPoint: point,
        startElements: elements.filter((element) => nextSelectedIds.includes(element.id)),
      };
      return;
    }

    if (!isShiftPressed) onSelectionChange([]);
    interactionRef.current = { type: INTERACTIONS.MARQUEE, startPoint: point };
  }

  function updateHoverCursor(point) {
    if (!isSelectTool) return;

    if (selectedElements.length === 1) {
      const handle = getResizeHandleAtPoint(selectedElements[0], point);
      if (handle) {
        setHoverCursor(HANDLE_CURSORS[handle]);
        return;
      }
    }

    setHoverCursor(getElementAtPoint(elements, point) ? "move" : "default");
  }

  function handlePointerDown(event) {
    if (!isDrawingTool && !isSelectTool) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const point = getPointerPosition(event);

    if (isDrawingTool) {
      setDraftElement(createElement(activeTool, point.x, point.y));
      return;
    }

    startSelectInteraction(point, event.shiftKey);
  }

  function continueInteraction(interaction, point) {
    switch (interaction.type) {
      case INTERACTIONS.MOVE: {
        const deltaX = point.x - interaction.startPoint.x;
        const deltaY = point.y - interaction.startPoint.y;

        onElementsChange(
          elements.map((element) => {
            const startElement = interaction.startElements.find(
              (candidate) => candidate.id === element.id
            );
            return startElement ? moveElement(startElement, deltaX, deltaY) : element;
          })
        );
        break;
      }

      case INTERACTIONS.RESIZE:
        onElementsChange(
          elements.map((element) =>
            element.id === interaction.startElement.id
              ? resizeElement(interaction.startElement, interaction.handle, point)
              : element
          )
        );
        break;

      case INTERACTIONS.MARQUEE: {
        const { startPoint } = interaction;
        const box = normalizeBounds({
          x: startPoint.x,
          y: startPoint.y,
          width: point.x - startPoint.x,
          height: point.y - startPoint.y,
        });

        setMarquee(box);
        onSelectionChange(
          elements
            .filter((element) => boundsIntersect(normalizeBounds(element), box))
            .map((element) => element.id)
        );
        break;
      }
    }
  }

  function handlePointerMove(event) {
    const point = getPointerPosition(event);

    if (draftElement) {
      setDraftElement({
        ...draftElement,
        width: point.x - draftElement.x,
        height: point.y - draftElement.y,
      });
      return;
    }

    if (interactionRef.current) {
      continueInteraction(interactionRef.current, point);
      return;
    }

    updateHoverCursor(point);
  }

  function handlePointerUp() {
    if (draftElement) {
      const size = Math.hypot(draftElement.width, draftElement.height);
      if (size >= MIN_SHAPE_SIZE) onElementAdded(draftElement);
      setDraftElement(null);
    }

    interactionRef.current = null;
    setMarquee(null);
  }

  const cursor = isDrawingTool ? "crosshair" : isSelectTool ? hoverCursor : "default";

  return (
    <canvas
      ref={canvasRef}
      className="canvas"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
