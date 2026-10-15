import { useEffect, useState } from "react";
import Canvas from "../components/Canvas/Canvas";
import Toolbar from "../components/Toolbar/Toolbar";
import Welcome from "../components/Welcome/Welcome";
import Brand from "../components/Brand/Brand";
import { TOOL_LIST, TOOLS } from "../utils/constants";
import "./App.scss";

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);

  useEffect(() => {
    function handleKeyDown(event) {
      const matchedTool = TOOL_LIST.find((tool) => tool.shortcut === event.key);
      if (matchedTool) setActiveTool(matchedTool.id);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="app">
      <Canvas />
      <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <Welcome />
      <Brand />
    </div>
  );
}
