import "./ViewControls.scss";

const GRID_PATH = "M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01";

export default function ViewControls({
  zoom,
  showGrid,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleGrid,
}) {
  return (
    <div className="view-controls">
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
