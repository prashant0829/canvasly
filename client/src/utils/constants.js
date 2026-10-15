export const TOOLS = {
  HAND: "hand",
  SELECT: "select",
  RECTANGLE: "rectangle",
  DIAMOND: "diamond",
  ELLIPSE: "ellipse",
  ARROW: "arrow",
  LINE: "line",
  PEN: "pen",
  TEXT: "text",
  ERASER: "eraser",
};

export const DRAWING_TOOLS = [
  TOOLS.RECTANGLE,
  TOOLS.DIAMOND,
  TOOLS.ELLIPSE,
  TOOLS.ARROW,
  TOOLS.LINE,
  TOOLS.PEN,
];

export const DEFAULT_ELEMENT_STYLE = {
  strokeColor: "#1f1f2b",
  backgroundColor: "transparent",
  fillStyle: "hachure",
  strokeWidth: 2,
  roughness: 1,
  opacity: 100,
};

export const STROKE_COLORS = ["#1f1f2b", "#e03131", "#2f9e44", "#1971c2", "#f08c00"];
export const BACKGROUND_COLORS = ["transparent", "#ffc9c9", "#b2f2bb", "#a5d8ff", "#ffec99"];
export const STROKE_WIDTHS = [1, 2, 4];
export const ROUGHNESS_LEVELS = [0, 1, 2];
export const FILL_STYLES = ["hachure", "solid"];

export const CLOSED_SHAPE_TOOLS = [TOOLS.RECTANGLE, TOOLS.DIAMOND, TOOLS.ELLIPSE];
export const ROUGH_TOOLS = [...CLOSED_SHAPE_TOOLS, TOOLS.ARROW, TOOLS.LINE];
export const STYLE_PANEL_TOOLS = [...DRAWING_TOOLS, TOOLS.TEXT];
export const THEME_STORAGE_KEY = "canvasly-theme";

export const MIN_SHAPE_SIZE = 4;

export const TOOL_LIST = [
  { id: TOOLS.HAND, label: "Hand (pan)", shortcut: "h" },
  { id: TOOLS.SELECT, label: "Select", shortcut: "1" },
  { id: TOOLS.RECTANGLE, label: "Rectangle", shortcut: "2" },
  { id: TOOLS.DIAMOND, label: "Diamond", shortcut: "3" },
  { id: TOOLS.ELLIPSE, label: "Ellipse", shortcut: "4" },
  { id: TOOLS.ARROW, label: "Arrow", shortcut: "5" },
  { id: TOOLS.LINE, label: "Line", shortcut: "6" },
  { id: TOOLS.PEN, label: "Pen", shortcut: "7" },
  { id: TOOLS.TEXT, label: "Text", shortcut: "8" },
  { id: TOOLS.ERASER, label: "Eraser", shortcut: "9" },
];

export const GRID_SIZE = 28;
export const GRID_DOT_RADIUS = 1.1;
export const GRID_DOT_COLOR = "#d9d6d0";
export const CANVAS_BACKGROUND = "#faf9f7";

export const SELECTION_COLOR = "#6d5efc";
export const MARQUEE_FILL = "rgba(109, 94, 252, 0.08)";
export const SELECTION_PADDING = 8;
export const HANDLE_SIZE = 8;
export const HANDLE_HIT_RADIUS = 10;
export const HIT_TOLERANCE = 8;

export const RESIZE_HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

export const HANDLE_CURSORS = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

export const INTERACTIONS = {
  MOVE: "move",
  RESIZE: "resize",
  MARQUEE: "marquee",
  ERASE: "erase",
  PAN: "pan",
};

export const FONT_FAMILY = '"Excalifont", "Caveat", "Comic Sans MS", cursive';
export const DEFAULT_FONT_SIZE = 20;
export const MIN_FONT_SIZE = 8;
export const TEXT_LINE_HEIGHT = 1.25;

export const ARROW_HEAD_LENGTH = 18;
export const ARROW_HEAD_ANGLE = Math.PI / 6;

export const MIN_POINT_DISTANCE = 2;

export const ERASER_TRAIL_LIFETIME_MS = 350;
export const ERASER_FADED_OPACITY = 0.2;
export const ERASER_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26'>" +
    "<circle cx='13' cy='13' r='10' fill='rgba(255,255,255,0.4)' stroke='#1f1f2b' stroke-width='1.6'/>" +
    "</svg>"
)}") 13 13, crosshair`;

export const DEFAULT_VIEWPORT = { offsetX: 0, offsetY: 0, zoom: 1 };
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 1.2;
export const WHEEL_ZOOM_SENSITIVITY = 0.01;
export const MIN_GRID_SPACING = 14;

export const MAX_HISTORY_SIZE = 100;
export const COALESCE_INTERVAL_MS = 800;
export const PASTE_OFFSET = 20;
export const NUDGE_STEP = 1;
export const NUDGE_STEP_LARGE = 10;
