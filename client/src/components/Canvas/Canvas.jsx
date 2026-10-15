import { useEffect, useMemo, useRef, useState } from "react";
import { renderScene } from "../../canvas/renderScene";
import {
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_FONT_SIZE,
  DRAWING_TOOLS,
  HANDLE_CURSORS,
  INTERACTIONS,
  MIN_SHAPE_SIZE,
  TOOLS,
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
import TextEditor from "../TextEditor/TextEditor";
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
  const [textEditor, setTextEditor] = useState(null);
  const [isFontLoaded, setIsFontLoaded] = useState(false);

  const isDrawingTool = DRAWING_TOOLS.includes(activeTool);
  const isSelectTool = activeTool === TOOLS.SELECT;
  const isEraserTool = activeTool === TOOLS.ERASER;
  const isTextTool = activeTool === TOOLS.TEXT;

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

  // Canvas text can't draw a web font until it has loaded, so redraw once it is ready.
  useEffect(() => {
    document.fonts.load(getFont(DEFAULT_FONT_SIZE), "Aa").then(() => setIsFontLoaded(true));
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
      hiddenElementId: textEditor?.elementId ?? null,
    });
  }, [viewportSize, elements, draftElement, selectedElements, marquee, textEditor, isFontLoaded]);

  function getPointerPosition(event) {
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function openNewTextEditor(point) {
    setTextEditor({
      elementId: null,
      x: point.x,
      y: point.y,
      text: "",
      fontSize: DEFAULT_FONT_SIZE,
    });
  }

  function openExistingTextEditor(element) {
    setTextEditor({
      elementId: element.id,
      x: element.x,
      y: element.y,
      text: element.text,
      fontSize: element.fontSize,
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
      onElementAdded(createTextElement(editor.x, editor.y, text));
    }
  }

  function eraseAt(point) {
    onElementsChange((currentElements) =>
      currentElements.filter((element) => !isPointOnElement(element, point))
    );
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
    // Clicking the canvas blurs the text editor, which commits it.
    if (textEditor) return;

    const point = getPointerPosition(event);

    if (isTextTool) {
      openNewTextEditor(point);
      return;
    }

    if (!isDrawingTool && !isSelectTool && !isEraserTool) return;
    event.currentTarget.setPointerCapture(event.pointerId);

    if (isDrawingTool) {
      setDraftElement(createElement(activeTool, point.x, point.y));
      return;
    }

    if (isEraserTool) {
      interactionRef.current = { type: INTERACTIONS.ERASE };
      eraseAt(point);
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

      case INTERACTIONS.ERASE:
        eraseAt(point);
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
      continueInteraction(interactionRef.current, point);
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

    interactionRef.current = null;
    setMarquee(null);
  }

  function handleDoubleClick(event) {
    if (!isSelectTool || textEditor) return;

    const point = getPointerPosition(event);
    const hitElement = getElementAtPoint(elements, point);

    if (!hitElement) openNewTextEditor(point);
    else if (hitElement.type === TOOLS.TEXT) openExistingTextEditor(hitElement);
  }

  function getCursor() {
    if (isDrawingTool || isEraserTool) return "crosshair";
    if (isTextTool) return "text";
    if (isSelectTool) return hoverCursor;
    return "default";
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="canvas"
        style={{ cursor: getCursor() }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      />
      {textEditor && (
        <TextEditor
          key={textEditor.elementId ?? "new"}
          x={textEditor.x}
          y={textEditor.y}
          initialText={textEditor.text}
          fontSize={textEditor.fontSize}
          color={DEFAULT_ELEMENT_STYLE.strokeColor}
          onCommit={commitText}
        />
      )}
    </>
  );
}
