import { useEffect, useRef, useState } from "react";
import { renderScene } from "../../canvas/renderScene";
import { DRAWING_TOOLS, MIN_SHAPE_SIZE } from "../../utils/constants";
import { createElement } from "../../utils/elements";
import "./Canvas.scss";

function getViewportSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

export default function Canvas({ activeTool, elements, onElementAdded }) {
  const canvasRef = useRef(null);
  const [viewportSize, setViewportSize] = useState(getViewportSize);
  const [draftElement, setDraftElement] = useState(null);

  const isDrawingTool = DRAWING_TOOLS.includes(activeTool);

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

    renderScene(context, width, height, elements, draftElement);
  }, [viewportSize, elements, draftElement]);

  function getPointerPosition(event) {
    const bounds = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function handlePointerDown(event) {
    if (!isDrawingTool) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const { x, y } = getPointerPosition(event);
    setDraftElement(createElement(activeTool, x, y));
  }

  function handlePointerMove(event) {
    if (!draftElement) return;

    const { x, y } = getPointerPosition(event);
    setDraftElement({
      ...draftElement,
      width: x - draftElement.x,
      height: y - draftElement.y,
    });
  }

  function handlePointerUp() {
    if (!draftElement) return;

    const size = Math.hypot(draftElement.width, draftElement.height);
    if (size >= MIN_SHAPE_SIZE) onElementAdded(draftElement);
    setDraftElement(null);
  }

  return (
    <canvas
      ref={canvasRef}
      className={`canvas ${isDrawingTool ? "canvas--drawing" : ""}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}
