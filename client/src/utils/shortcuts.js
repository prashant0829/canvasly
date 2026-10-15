import { TOOL_LIST } from "./constants";

const MODIFIER_SHORTCUTS = {
  c: "copy",
  x: "cut",
  v: "paste",
  d: "duplicate",
  s: "save",
  o: "open",
  a: "selectAll",
  y: "redo",
  "]": "bringToFront",
  "[": "sendToBack",
};

const PLAIN_SHORTCUTS = {
  delete: "delete",
  backspace: "delete",
  escape: "clearSelection",
  "]": "bringForward",
  "[": "sendBackward",
  "+": "zoomIn",
  "=": "zoomIn",
  "-": "zoomOut",
  0: "resetZoom",
  arrowup: "nudge",
  arrowdown: "nudge",
  arrowleft: "nudge",
  arrowright: "nudge",
};

// Turns a key press into { name, value } for the matching action, or null if it isn't a shortcut.
export function getShortcutAction(event) {
  const key = event.key.toLowerCase();
  const hasModifier = event.metaKey || event.ctrlKey;

  if (hasModifier) {
    if (key === "z") return { name: event.shiftKey ? "redo" : "undo" };
    const name = MODIFIER_SHORTCUTS[key];
    return name ? { name } : null;
  }

  const plainName = PLAIN_SHORTCUTS[key];
  if (plainName) return { name: plainName, value: key };

  const tool = TOOL_LIST.find((candidate) => candidate.shortcut === key);
  return tool ? { name: "selectTool", value: tool.id } : null;
}
