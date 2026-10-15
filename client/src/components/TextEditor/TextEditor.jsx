import { useEffect, useRef, useState } from "react";
import { TEXT_LINE_HEIGHT } from "../../utils/constants";
import { getFont, measureText } from "../../utils/text";
import "./TextEditor.scss";

const EXTRA_WIDTH = 12;

export default function TextEditor({ x, y, initialText, fontSize, color, isDark, onCommit }) {
  const textareaRef = useRef(null);
  const hasCommittedRef = useRef(false);
  const [text, setText] = useState(initialText);

  const size = measureText(text || " ", fontSize);

  // Focus after the click that opened the editor has finished, or the click steals focus back.
  useEffect(() => {
    const timeoutId = setTimeout(() => textareaRef.current?.focus(), 0);
    return () => clearTimeout(timeoutId);
  }, []);

  function commit() {
    if (hasCommittedRef.current) return;
    hasCommittedRef.current = true;
    onCommit(text);
  }

  function handleKeyDown(event) {
    const isSubmitShortcut = event.key === "Enter" && (event.metaKey || event.ctrlKey);
    if (event.key === "Escape" || isSubmitShortcut) {
      event.preventDefault();
      commit();
    }
  }

  return (
    <textarea
      ref={textareaRef}
      className={`text-editor ${isDark ? "text-editor--dark" : ""}`}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      style={{
        left: x,
        top: y,
        width: size.width + EXTRA_WIDTH,
        height: size.height,
        color,
        font: getFont(fontSize),
        lineHeight: TEXT_LINE_HEIGHT,
      }}
    />
  );
}
