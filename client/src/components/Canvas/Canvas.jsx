import { useEffect, useMemo, useRef, useState } from "react";
import { renderScene } from "../../canvas/renderScene";
import {
  DEFAULT_FONT_SIZE,
  DRAWING_TOOLS,
  ERASER_CURSOR,
  ERASER_TRAIL_LIFETIME_MS,
  HANDLE_CURSORS,
  INTERACTIONS,
  MIN_SHAPE_SIZE,
  TOOLS,
  WHEEL_ZOOM_SENSITIVITY,
} from "../../utils/constants";
import {
  createElement,
  createTextElement,
  extendDraftElement,
  finalizePenElement,
  moveElement,
  resizeElement,
} from "../../utils/elements";
import { boundsIntersect, normalizeBounds } from "../../utils/geometry";
import {
  getElementAtPoint,
  getResizeHandleAtPoint,
  isPointOnElement,
} from "../../utils/hitTest";
import { getFont, measureText } from "../../utils/text";
import { screenToScene, zoomViewportAt } from "../../utils/viewport";
import TextEditor from "../TextEditor/TextEditor";
import "./Canvas.scss";

const ERASER_SAMPLE_SPACING = 4;

function getViewportSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function Canvas({
  activeTool,
  currentStyle,
  theme,
  viewport,
  showGrid,
  onViewportChange,
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
  const [textEditor, setTextEditor] = useState(null);
  const [isFontLoaded, setIsFontLoaded] = useState(false);
  const [pendingEraseIds, setPendingEraseIds] = useState([]);
  const [eraserTrail, setEraserTrail] = useState([]);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const pendingEraseIdsRef = useRef(new Set());

  const isDrawingTool = DRAWING_TOOLS.includes(activeTool);
  const isSelectTool = activeTool === TOOLS.SELECT;
  const isEraserTool = activeTool === TOOLS.ERASER;
  const isTextTool = activeTool === TOOLS.TEXT;
  const isHandTool = activeTool === TOOLS.HAND;
  const { zoom } = viewport;

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

  // Holding Space turns any tool into the hand tool, like in Excalidraw.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== "Space" || event.target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      setIsSpaceDown(true);
    }

    function handleKeyUp(event) {
      if (event.code !== "Space") return;
      setIsSpaceDown(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Wheel scrolls the board; Ctrl/Cmd + wheel (also trackpad pinch) zooms at the pointer.
  useEffect(() => {
    const canvas = canvasRef.current;

    function handleWheel(event) {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        const bounds = canvas.getBoundingClientRect();
        const anchor = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        const zoomFactor = Math.exp(-event.deltaY * WHEEL_ZOOM_SENSITIVITY);

        onViewportChange((current) =>
          zoomViewportAt(current, anchor, current.zoom * zoomFactor)
        );
        return;
      }

      onViewportChange((current) => ({
        ...current,
        offsetX: current.offsetX - event.deltaX,
        offsetY: current.offsetY - event.deltaY,
      }));
    }

    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [onViewportChange]);

  // Canvas text can't draw a web font until it has loaded, so redraw once it is ready.
  useEffect(() => {
    document.fonts.load(getFont(DEFAULT_FONT_SIZE), "Aa").then(() => setIsFontLoaded(true));
  }, []);

  // Keep redrawing while the trail has points, so it can fade out smoothly.
  useEffect(() => {
    if (eraserTrail.length === 0) return;

    const now = performance.now();
    const frameId = requestAnimationFrame(() => {
      setEraserTrail((points) =>
        points.filter((point) => now - point.time < ERASER_TRAIL_LIFETIME_MS)
      );
    });
    return () => cancelAnimationFrame(frameId);
  }, [eraserTrail]);

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
      hiddenElementId: textEditor?.elementId ?? null,
      fadedElementIds: pendingEraseIds,
      eraserTrail,
      viewport,
      showGrid,
    });
  }, [
    viewport,
    showGrid,
    viewportSize,
    elements,
    draftElement,
    selectedElements,
    marquee,
    textEditor,
    isFontLoaded,
    pendingEraseIds,
    eraserTrail,
  ]);

  function getScreenPosition(event) {
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  // Shapes live in scene coordinates, so every pointer position is converted before use.
  function getPointerPosition(event) {
    return screenToScene(getScreenPosition(event), viewport);
  }

  function openNewTextEditor(point) {
    setTextEditor({
      elementId: null,
      x: point.x,
      y: point.y,
      text: "",
      fontSize: DEFAULT_FONT_SIZE,
      color: currentStyle.strokeColor,
    });
  }

  function openExistingTextEditor(element) {
    setTextEditor({
      elementId: element.id,
      x: element.x,
      y: element.y,
      text: element.text,
      fontSize: element.fontSize,
      color: element.strokeColor,
    });
  }

  function commitText(text) {
    const editor = textEditor;
    setTextEditor(null);

    if (editor.elementId) {
      const isEmpty = text.trim() === "";
      onElementsChange((currentElements) =>
        isEmpty
          ? currentElements.filter((element) => element.id !== editor.elementId)
          : currentElements.map((element) =>
              element.id === editor.elementId
                ? { ...element, text, ...measureText(text, element.fontSize) }
                : element
            )
      );
      return;
    }

    if (text.trim() !== "") {
      onElementAdded(createTextElement(editor.x, editor.y, text, currentStyle));
    }
  }

  // Shapes the eraser touches fade out now and are only deleted when the pointer is released.
  function eraseAlong(from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / ERASER_SAMPLE_SPACING));
    const pendingIds = pendingEraseIdsRef.current;
    let hasNewHit = false;

    for (let step = 0; step <= steps; step++) {
      const point = {
        x: from.x + ((to.x - from.x) * step) / steps,
        y: from.y + ((to.y - from.y) * step) / steps,
      };

      elements.forEach((element) => {
        if (!pendingIds.has(element.id) && isPointOnElement(element, point, zoom)) {
          pendingIds.add(element.id);
          hasNewHit = true;
        }
      });
    }

    if (hasNewHit) setPendingEraseIds([...pendingIds]);
    setEraserTrail((points) => [...points, { x: to.x, y: to.y, time: performance.now() }]);
  }

  function finishErasing() {
    const idsToDelete = pendingEraseIdsRef.current;

    if (idsToDelete.size > 0) {
      onElementsChange((currentElements) =>
        currentElements.filter((element) => !idsToDelete.has(element.id))
      );
    }

    pendingEraseIdsRef.current = new Set();
    setPendingEraseIds([]);
  }

  function startSelectInteraction(point, isShiftPressed) {
    if (selectedElements.length === 1) {
      const handle = getResizeHandleAtPoint(selectedElements[0], point, zoom);
      if (handle) {
        interactionRef.current = {
          type: INTERACTIONS.RESIZE,
          handle,
          startElement: selectedElements[0],
        };
        return;
      }
    }

    const hitElement = getElementAtPoint(elements, point, zoom);

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
      const handle = getResizeHandleAtPoint(selectedElements[0], point, zoom);
      if (handle) {
        setHoverCursor(HANDLE_CURSORS[handle]);
        return;
      }
    }

    setHoverCursor(getElementAtPoint(elements, point, zoom) ? "move" : "default");
  }

  function handlePointerDown(event) {
    // Clicking the canvas blurs the text editor, which commits it.
    if (textEditor) return;

    const point = getPointerPosition(event);

    const shouldPan = isHandTool || isSpaceDown || event.button === 1;
    if (shouldPan) {
      event.currentTarget.setPointerCapture(event.pointerId);
      interactionRef.current = {
        type: INTERACTIONS.PAN,
        startScreen: getScreenPosition(event),
        startViewport: viewport,
      };
      setIsPanning(true);
      return;
    }

    if (isTextTool) {
      openNewTextEditor(point);
      return;
    }

    if (!isDrawingTool && !isSelectTool && !isEraserTool) return;
    event.currentTarget.setPointerCapture(event.pointerId);

    if (isDrawingTool) {
      setDraftElement(createElement(activeTool, point.x, point.y, currentStyle));
      return;
    }

    if (isEraserTool) {
      interactionRef.current = { type: INTERACTIONS.ERASE, lastPoint: point };
      eraseAlong(point, point);
      return;
    }

    startSelectInteraction(point, event.shiftKey);
  }

  function continueInteraction(interaction, point, screenPoint) {
    switch (interaction.type) {
      case INTERACTIONS.PAN:
        onViewportChange({
          ...interaction.startViewport,
          offsetX:
            interaction.startViewport.offsetX + screenPoint.x - interaction.startScreen.x,
          offsetY:
            interaction.startViewport.offsetY + screenPoint.y - interaction.startScreen.y,
        });
        break;

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
              ? resizeElement(interaction.startElement, interaction.handle, point, zoom)
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

      case INTERACTIONS.ERASE:
        eraseAlong(interaction.lastPoint, point);
        interaction.lastPoint = point;
        break;
    }
  }

  function handlePointerMove(event) {
    const point = getPointerPosition(event);

    if (draftElement) {
      setDraftElement(extendDraftElement(draftElement, point));
      return;
    }

    if (interactionRef.current) {
      continueInteraction(interactionRef.current, point, getScreenPosition(event));
      return;
    }

    updateHoverCursor(point);
  }

  function handlePointerUp() {
    if (draftElement) {
      const finishedElement =
        draftElement.type === TOOLS.PEN ? finalizePenElement(draftElement) : draftElement;
      const size = Math.hypot(finishedElement.width, finishedElement.height);

      if (size >= MIN_SHAPE_SIZE) onElementAdded(finishedElement);
      setDraftElement(null);
    }

    if (interactionRef.current?.type === INTERACTIONS.ERASE) finishErasing();

    interactionRef.current = null;
    setIsPanning(false);
    setMarquee(null);
  }

  function handleDoubleClick(event) {
    if (!isSelectTool || textEditor) return;

    const point = getPointerPosition(event);
    const hitElement = getElementAtPoint(elements, point, zoom);

    if (!hitElement) openNewTextEditor(point);
    else if (hitElement.type === TOOLS.TEXT) openExistingTextEditor(hitElement);
  }

  function getCursor() {
    if (isPanning) return "grabbing";
    if (isHandTool || isSpaceDown) return "grab";
    if (isEraserTool) return ERASER_CURSOR;
    if (isDrawingTool) return "crosshair";
    if (isTextTool) return "text";
    if (isSelectTool) return hoverCursor;
    return "default";
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`canvas ${theme === "dark" ? "canvas--dark" : ""}`}
        style={{ cursor: getCursor() }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />
      {textEditor && (
        <TextEditor
          key={textEditor.elementId ?? "new"}
          x={textEditor.x * zoom + viewport.offsetX}
          y={textEditor.y * zoom + viewport.offsetY}
          initialText={textEditor.text}
          fontSize={textEditor.fontSize * zoom}
          color={textEditor.color}
          isDark={theme === "dark"}
          onCommit={commitText}
        />
      )}
    </>
  );
}
