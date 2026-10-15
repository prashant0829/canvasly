import { useEffect, useRef, useState } from "react";
import { exportToPngBlob, exportToSvgString } from "../export/exportScene";
import Brand from "../components/Brand/Brand";
import Canvas from "../components/Canvas/Canvas";
import MainMenu from "../components/MainMenu/MainMenu";
import StylePanel from "../components/StylePanel/StylePanel";
import ThemeToggle from "../components/ThemeToggle/ThemeToggle";
import Toolbar from "../components/Toolbar/Toolbar";
import ViewControls from "../components/ViewControls/ViewControls";
import Welcome from "../components/Welcome/Welcome";
import { useElementsHistory } from "../hooks/useElementsHistory";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import {
  AUTOSAVE_DELAY_MS,
  CLOSED_SHAPE_TOOLS,
  COALESCE_INTERVAL_MS,
  DEFAULT_ELEMENT_STYLE,
  DEFAULT_VIEWPORT,
  NUDGE_STEP,
  NUDGE_STEP_LARGE,
  PASTE_OFFSET,
  ROUGH_TOOLS,
  SCENE_FILE_EXTENSION,
  STYLE_PANEL_TOOLS,
  THEME_STORAGE_KEY,
  TOOLS,
  ZOOM_STEP,
} from "../utils/constants";
import { duplicateElements, moveElement } from "../utils/elements";
import { bringForward, bringToFront, sendBackward, sendToBack } from "../utils/layers";
import { downloadBlob, getDateStamp, parseScene, serializeScene } from "../utils/sceneFile";
import { loadSavedElements, saveElements } from "../utils/storage";
import { zoomViewportAt } from "../utils/viewport";
import "./App.scss";

const LAYER_ACTIONS = {
  bringToFront,
  bringForward,
  sendBackward,
  sendToBack,
};

const ARROW_KEY_DIRECTIONS = {
  arrowup: { x: 0, y: -1 },
  arrowdown: { x: 0, y: 1 },
  arrowleft: { x: -1, y: 0 },
  arrowright: { x: 1, y: 0 },
};

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
  const { elements, setElements, checkpoint, undo, redo, canUndo, canRedo } =
    useElementsHistory(loadSavedElements);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_ELEMENT_STYLE);
  const [theme, setTheme] = useState(getInitialTheme);
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [showGrid, setShowGrid] = useState(true);

  const clipboardRef = useRef([]);
  const pasteCountRef = useRef(0);
  const lastCoalescedCheckpointRef = useRef(0);
  const fileInputRef = useRef(null);

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
    showLayers: selectedElements.length > 0,
  };

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // not being able to remember the theme is fine
    }
  }, [theme]);

  // Remember the board in the browser; wait a moment so a drag saves once, not 60 times.
  useEffect(() => {
    const timeoutId = setTimeout(() => saveElements(elements), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeoutId);
  }, [elements]);

  // A burst of changes (dragging a slider, holding an arrow key) becomes one undo step.
  function checkpointCoalesced() {
    const now = Date.now();
    if (now - lastCoalescedCheckpointRef.current > COALESCE_INTERVAL_MS) checkpoint();
    lastCoalescedCheckpointRef.current = now;
  }

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
    checkpoint();
    setElements((currentElements) => [...currentElements, element]);
    setSelectedIds([element.id]);
    setActiveTool(TOOLS.SELECT);
  }

  function deleteSelectedElements() {
    if (selectedIds.length === 0) return;

    checkpoint();
    setElements((currentElements) =>
      currentElements.filter((element) => !selectedIds.includes(element.id))
    );
    setSelectedIds([]);
  }

  // A style change applies to the selected shapes and becomes the default for new ones.
  function updateStyle(stylePatch) {
    setCurrentStyle((style) => ({ ...style, ...stylePatch }));
    if (selectedIds.length === 0) return;

    checkpointCoalesced();
    setElements((currentElements) =>
      currentElements.map((element) =>
        selectedIds.includes(element.id) ? { ...element, ...stylePatch } : element
      )
    );
  }

  function applyHistoryResult(restoredElements) {
    if (!restoredElements) return;
    setSelectedIds((ids) =>
      ids.filter((id) => restoredElements.some((element) => element.id === id))
    );
  }

  function copySelection() {
    if (selectedElements.length === 0) return;
    clipboardRef.current = selectedElements;
    pasteCountRef.current = 0;
  }

  function addCopies(sourceElements, offset) {
    const copies = duplicateElements(sourceElements, offset);

    checkpoint();
    setElements((currentElements) => [...currentElements, ...copies]);
    setSelectedIds(copies.map((element) => element.id));
    setActiveTool(TOOLS.SELECT);
  }

  function pasteClipboard() {
    if (clipboardRef.current.length === 0) return;

    pasteCountRef.current += 1;
    addCopies(clipboardRef.current, PASTE_OFFSET * pasteCountRef.current);
  }

  function duplicateSelection() {
    if (selectedElements.length === 0) return;
    addCopies(selectedElements, PASTE_OFFSET);
  }

  function cutSelection() {
    copySelection();
    deleteSelectedElements();
  }

  function selectAll() {
    setActiveTool(TOOLS.SELECT);
    setSelectedIds(elements.map((element) => element.id));
  }

  function nudgeSelection(key, event) {
    if (selectedIds.length === 0) return;

    const direction = ARROW_KEY_DIRECTIONS[key];
    const step = event.shiftKey ? NUDGE_STEP_LARGE : NUDGE_STEP;

    checkpointCoalesced();
    setElements((currentElements) =>
      currentElements.map((element) =>
        selectedIds.includes(element.id)
          ? moveElement(element, direction.x * step, direction.y * step)
          : element
      )
    );
  }

  function changeLayer(layerAction) {
    if (selectedIds.length === 0) return;

    checkpoint();
    setElements((currentElements) =>
      LAYER_ACTIONS[layerAction](currentElements, selectedIds)
    );
  }

  function openFilePicker() {
    fileInputRef.current.click();
  }

  async function loadFile(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;

    try {
      const loadedElements = parseScene(await file.text());
      checkpoint();
      setElements(loadedElements);
      setSelectedIds([]);
    } catch (error) {
      window.alert(error.message);
    }
  }

  function saveToFile() {
    if (elements.length === 0) return;

    const blob = new Blob([serializeScene(elements)], { type: "application/json" });
    downloadBlob(blob, `canvasly-${getDateStamp()}${SCENE_FILE_EXTENSION}`);
  }

  async function exportPng() {
    if (elements.length === 0) return;
    downloadBlob(await exportToPngBlob(elements), `canvasly-${getDateStamp()}.png`);
  }

  async function exportSvg() {
    if (elements.length === 0) return;

    const markup = await exportToSvgString(elements);
    downloadBlob(new Blob([markup], { type: "image/svg+xml" }), `canvasly-${getDateStamp()}.svg`);
  }

  function clearCanvas() {
    if (elements.length === 0) return;

    checkpoint();
    setElements([]);
    setSelectedIds([]);
  }

  const undoChange = () => applyHistoryResult(undo());
  const redoChange = () => applyHistoryResult(redo());
  const zoomIn = () => zoomTo((zoom) => zoom * ZOOM_STEP);
  const zoomOut = () => zoomTo((zoom) => zoom / ZOOM_STEP);
  const resetZoom = () => zoomTo(() => 1);

  useKeyboardShortcuts({
    undo: undoChange,
    redo: redoChange,
    copy: copySelection,
    cut: cutSelection,
    paste: pasteClipboard,
    duplicate: duplicateSelection,
    selectAll,
    delete: deleteSelectedElements,
    clearSelection: () => setSelectedIds([]),
    nudge: nudgeSelection,
    bringToFront: () => changeLayer("bringToFront"),
    sendToBack: () => changeLayer("sendToBack"),
    bringForward: () => changeLayer("bringForward"),
    sendBackward: () => changeLayer("sendBackward"),
    zoomIn,
    zoomOut,
    resetZoom,
    save: saveToFile,
    open: openFilePicker,
    selectTool: changeTool,
  });

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
        onCheckpoint={checkpoint}
      />
      <Toolbar activeTool={activeTool} onToolChange={changeTool} />
      <MainMenu
        hasElements={elements.length > 0}
        onOpen={openFilePicker}
        onSave={saveToFile}
        onExportPng={exportPng}
        onExportSvg={exportSvg}
        onClear={clearCanvas}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={`${SCENE_FILE_EXTENSION},application/json`}
        onChange={loadFile}
        hidden
      />
      {isStylePanelVisible && (
        <StylePanel
          style={panelStyle}
          controls={panelControls}
          onChange={updateStyle}
          onLayerChange={changeLayer}
        />
      )}
      <ThemeToggle
        theme={theme}
        onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      />
      <ViewControls
        zoom={viewport.zoom}
        showGrid={showGrid}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undoChange}
        onRedo={redoChange}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onToggleGrid={() => setShowGrid((current) => !current)}
      />
      {elements.length === 0 && <Welcome />}
      <Brand />
    </div>
  );
}
