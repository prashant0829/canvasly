import { DEFAULT_ELEMENT_STYLE } from "./constants";

export function createElement(type, x, y) {
  return {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    width: 0,
    height: 0,
    seed: Math.floor(Math.random() * 2 ** 31),
    ...DEFAULT_ELEMENT_STYLE,
  };
}
