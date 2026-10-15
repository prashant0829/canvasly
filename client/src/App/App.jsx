import { useEffect, useState } from "react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import Welcome from "../components/Welcome/Welcome";
import Brand from "../components/Brand/Brand";
import { TOOL_LIST, TOOLS } from "../utils/constants";
import "./App.scss";

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.RECTANGLE);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    function handleKeyDown(event) {
      const matchedTool = TOOL_LIST.find((tool) => tool.shortcut === event.key);
      if (matchedTool) setActiveTool(matchedTool.id);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function addElement(element) {
    setElements((currentElements) => [...currentElements, element]);
  }

  return (
    <div className="app">
      <Canvas
        activeTool={activeTool}
        elements={elements}
        onElementAdded={addElement}
      />
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
      {elements.length === 0 && <Welcome />}
      <Brand />
    </div>
  );
}
