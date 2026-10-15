import { useEffect, useRef } from "react";
import { getShortcutAction } from "../utils/shortcuts";

// `actions` can change every render; the ref lets one listener always call the latest ones.
export function useKeyboardShortcuts(actions) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.target instanceof HTMLTextAreaElement) return;

      const shortcut = getShortcutAction(event);
      const action = shortcut && actionsRef.current[shortcut.name];
      if (!action) return;

      event.preventDefault();
      action(shortcut.value, event);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
