import { useEffect, useState } from "react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import Welcome from "../components/Welcome/Welcome";
import Brand from "../components/Brand/Brand";
import { TOOL_LIST, TOOLS } from "../utils/constants";
import "./App.scss";

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  function changeTool(tool) {
    setActiveTool(tool);
    if (tool !== TOOLS.SELECT) setSelectedIds([]);
  }

  // Like Excalidraw: the new shape is selected and the tool returns to Select.
  function addElement(element) {
    setElements((currentElements) => [...currentElements, element]);
    setSelectedIds([element.id]);
    setActiveTool(TOOLS.SELECT);
  }

  function deleteSelectedElements() {
    setElements((currentElements) =>
      currentElements.filter((element) => !selectedIds.includes(element.id))
    );
    setSelectedIds([]);
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelectedElements();
        return;
      }

      if (event.key === "Escape") {
        setSelectedIds([]);
        return;
      }

      const matchedTool = TOOL_LIST.find((tool) => tool.shortcut === event.key);
      if (matchedTool) changeTool(matchedTool.id);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds]);

  return (
    <div className="app">
      <Canvas
        activeTool={activeTool}
        elements={elements}
        selectedIds={selectedIds}
        onElementAdded={addElement}
        onElementsChange={setElements}
        onSelectionChange={setSelectedIds}
      />
      <Toolbar activeTool={activeTool} onToolChange={changeTool} />
      {elements.length === 0 && <Welcome />}
      <Brand />
    </div>
  );
}
