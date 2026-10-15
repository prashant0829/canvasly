import { useEffect, useState } from "react";
import Brand from "../components/Brand/Brand";
import Canvas from "../components/Canvas/Canvas";
import StylePanel from "../components/StylePanel/StylePanel";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Toolbar from "../components/Toolbar/Toolbar";
import ViewControls from "../components/ViewControls/ViewControls";
import Welcome from "../components/Welcome/Welcome";
import {
  CLOSED_SHAPE_TOOLS,
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_VIEWPORT,
  ROUGH_TOOLS,
  STYLE_PANEL_TOOLS,
  THEME_STORAGE_KEY,
  TOOL_LIST,
  TOOLS,
  ZOOM_STEP,
} from "../utils/constants";
import { zoomViewportAt } from "../utils/viewport";
import "./App.scss";

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) return savedTheme;
  } catch {
    // storage can be blocked; fall back to the system preference
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS.SELECT);
  const [elements, setElements] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_ELEMENT_STYLE);
  const [theme, setTheme] = useState(getInitialTheme);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [showGrid, setShowGrid] = useState(true);

  const selectedElements = elements.filter((element) => selectedIds.includes(element.id));
  const targetTypes = selectedElements.length
    ? selectedElements.map((element) => element.type)
    : [activeTool];

  const isStylePanelVisible = selectedElements.length > 0 || STYLE_PANEL_TOOLS.includes(activeTool);
  const panelStyle = selectedElements[0] ?? currentStyle;
  const panelControls = {
    showBackground: targetTypes.some((type) => CLOSED_SHAPE_TOOLS.includes(type)),
    showStrokeWidth: targetTypes.some((type) => type !== TOOLS.TEXT),
    showRoughness: targetTypes.some((type) => ROUGH_TOOLS.includes(type)),
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // not being able to remember the theme is fine
    }
  }, [theme]);

  // Buttons and keys zoom around the middle of the screen; the wheel zooms at the pointer.
  function zoomTo(getNextZoom) {
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    setViewport((current) => zoomViewportAt(current, center, getNextZoom(current.zoom)));
  }

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

  // A style change applies to the selected shapes and becomes the default for new ones.
  function updateStyle(stylePatch) {
    setCurrentStyle((style) => ({ ...style, ...stylePatch }));
    setElements((currentElements) =>
      currentElements.map((element) =>
        selectedIds.includes(element.id) ? { ...element, ...stylePatch } : element
      )
    );
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target instanceof HTMLTextAreaElement) return;
      if (event.metaKey || event.ctrlKey) return;

      if (event.key === "+" || event.key === "=") {
        zoomTo((zoom) => zoom * ZOOM_STEP);
        return;
      }

      if (event.key === "-") {
        zoomTo((zoom) => zoom / ZOOM_STEP);
        return;
      }

      if (event.key === "0") {
        zoomTo(() => 1);
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelectedElements();
        return;
      }

      if (event.key === "Escape") {
        setSelectedIds([]);
        return;
      }

      const matchedTool = TOOL_LIST.find((tool) => tool.shortcut === event.key.toLowerCase());
      if (matchedTool) changeTool(matchedTool.id);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIds]);

  return (
    <div className="app">
      <Canvas
        activeTool={activeTool}
        currentStyle={currentStyle}
        theme={theme}
        viewport={viewport}
        showGrid={showGrid}
        onViewportChange={setViewport}
        elements={elements}
        selectedIds={selectedIds}
        onElementAdded={addElement}
        onElementsChange={setElements}
        onSelectionChange={setSelectedIds}
      />
      <Toolbar activeTool={activeTool} onToolChange={changeTool} />
      {isStylePanelVisible && (
        <StylePanel style={panelStyle} controls={panelControls} onChange={updateStyle} />
      )}
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      <ViewControls
        zoom={viewport.zoom}
        showGrid={showGrid}
        onZoomIn={() => zoomTo((zoom) => zoom * ZOOM_STEP)}
        onZoomOut={() => zoomTo((zoom) => zoom / ZOOM_STEP)}
        onResetZoom={() => zoomTo(() => 1)}
        onToggleGrid={() => setShowGrid((current) => !current)}
      />
      {elements.length === 0 && <Welcome />}
      <Brand />
    </div>
  );
}
