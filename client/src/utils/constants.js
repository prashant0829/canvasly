export const TOOLS = {
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
  strokeWidth: 2,
  roughness: 1,
};

export const MIN_SHAPE_SIZE = 4;

export const TOOL_LIST = [
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
