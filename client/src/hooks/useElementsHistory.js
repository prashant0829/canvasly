import { useRef, useState } from "react";
import { MAX_HISTORY_SIZE } from "../utils/constants";

// Undo/redo by keeping old copies (snapshots) of the elements array.
// Call checkpoint() right BEFORE a change so the current state can be restored.
export function useElementsHistory() {
  const [elements, setElements] = useState([]);
  const elementsRef = useRef(elements);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);

  elementsRef.current = elements;

  function checkpoint() {
    undoStackRef.current.push(elementsRef.current);
    if (undoStackRef.current.length > MAX_HISTORY_SIZE) undoStackRef.current.shift();
    redoStackRef.current = [];
  }

  function undo() {
    if (undoStackRef.current.length === 0) return null;

    const previous = undoStackRef.current.pop();
    redoStackRef.current.push(elementsRef.current);
    setElements(previous);
    return previous;
  }

  function redo() {
    if (redoStackRef.current.length === 0) return null;

    const next = redoStackRef.current.pop();
    undoStackRef.current.push(elementsRef.current);
    setElements(next);
    return next;
  }

  return {
    elements,
    setElements,
    checkpoint,
    undo,
    redo,
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
  };
}
