import { TOOLS } from "../../utils/constants";

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ICON_PATHS = {
  [TOOLS.SELECT]: <path d="M5 3l14 7-6 2-2 6L5 3z" />,
  [TOOLS.RECTANGLE]: <rect x="4" y="6" width="16" height="12" rx="2" />,
  [TOOLS.DIAMOND]: <path d="M12 3l9 9-9 9-9-9 9-9z" />,
  [TOOLS.ELLIPSE]: <ellipse cx="12" cy="12" rx="9" ry="6.5" />,
  [TOOLS.ARROW]: <path d="M5 19L19 5M10 5h9v9" />,
  [TOOLS.LINE]: <path d="M5 19L19 5" />,
  [TOOLS.PEN]: <path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1zM14 7l3 3" />,
  [TOOLS.TEXT]: <path d="M5 6V4h14v2M12 4v16M9 20h6" />,
  [TOOLS.ERASER]: <path d="M8 20h12M5 15l8-8a2 2 0 013 0l3 3a2 2 0 010 3l-6 6H9l-4-4z" />,
};

export default function ToolIcon({ tool }) {
  return <svg {...iconProps}>{ICON_PATHS[tool]}</svg>;
}
