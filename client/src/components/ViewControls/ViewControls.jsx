import "./ViewControls.scss";

const GRID_PATH = "M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01";

const UNDO_PATH = "M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3";
const REDO_PATH = "M15 14l5-5-5-5M20 9H10a6 6 0 000 12h3";

function HistoryIcon({ path }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export default function ViewControls({
  zoom,
  showGrid,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleGrid,
}) {
  return (
    <div className="view-controls">
      <button
        className="view-controls__button"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
        title="Undo (Ctrl/Cmd+Z)"
      >
        <HistoryIcon path={UNDO_PATH} />
      </button>
      <button
        className="view-controls__button"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
        title="Redo (Ctrl/Cmd+Shift+Z)"
      >
        <HistoryIcon path={REDO_PATH} />
      </button>

      <span className="view-controls__divider" />

      <button className="view-controls__button" onClick={onZoomOut} aria-label="Zoom out" title="Zoom out (-)">
        −
      </button>
      <button
        className="view-controls__zoom"
        onClick={onResetZoom}
        aria-label="Reset zoom to 100%"
        title="Reset zoom (0)"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button className="view-controls__button" onClick={onZoomIn} aria-label="Zoom in" title="Zoom in (+)">
        +
      </button>

      <span className="view-controls__divider" />

      <button
        className={`view-controls__button ${showGrid ? "is-active" : ""}`}
        onClick={onToggleGrid}
        aria-label="Toggle grid"
        aria-pressed={showGrid}
        title="Toggle grid"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d={GRID_PATH} />
        </svg>
      </button>
    </div>
  );
}
