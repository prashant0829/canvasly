import { SCENE_STORAGE_KEY } from "./constants";

// Browser storage can be full, blocked or disabled, so every call is wrapped and failures are ignored.
export function loadSavedElements() {
  try {
    const savedText = localStorage.getItem(SCENE_STORAGE_KEY);
    if (!savedText) return [];

    const saved = JSON.parse(savedText);
    return Array.isArray(saved.elements) ? saved.elements : [];
  } catch {
    return [];
  }
}

export function saveElements(elements) {
  try {
    localStorage.setItem(SCENE_STORAGE_KEY, JSON.stringify({ elements }));
  } catch {
    // out of space or blocked; the board still works, it just won't be remembered
  }
}
