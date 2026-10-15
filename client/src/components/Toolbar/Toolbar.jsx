import { TOOL_LIST } from "../../utils/constants";
import ToolIcon from "../ToolIcon/ToolIcon";
import "./Toolbar.scss";

export default function Toolbar({ activeTool, onToolChange }) {
  return (
    <nav className="toolbar" aria-label="Drawing tools">
      {TOOL_LIST.map((tool) => (
        <button
          key={tool.id}
          className={`toolbar__button ${activeTool === tool.id ? "is-active" : ""}`}
          onClick={() => onToolChange(tool.id)}
          title={`${tool.label} (${tool.shortcut})`}
          aria-label={tool.label}
          aria-pressed={activeTool === tool.id}
        >
          <ToolIcon tool={tool.id} />
          <span className="toolbar__shortcut">{tool.shortcut}</span>
        </button>
      ))}
    </nav>
  );
}
