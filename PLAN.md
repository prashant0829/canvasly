# Canvasly: build plan

A web whiteboard that looks and feels like Excalidraw. Plain JavaScript only (no TypeScript), functional style (no classes), built in small phases so every step is understandable.

## Stack
- Frontend: React + Vite (JS), SCSS (BEM naming), HTML `<canvas>`
- Hand-drawn shapes: our own sketchy renderer (no roughjs; we write it ourselves)
- Freehand pen: our own smoothing with canvas curves (no perfect-freehand)
- State: `zustand`
- Backend (phase 7+): Express + SQLite/Postgres
- Default font: handwritten (Virgil, Excalidraw's font, self-hosted; fallback Caveat from Google Fonts)

## Core idea
The board is an array of plain objects (the "scene"). The canvas is a picture of that array.
Draw = add object. Move = change object. Undo = restore an older copy. Save = store the array as JSON.

## Phases

| # | Phase | What you get | Concepts learned |
|---|---|---|---|
| 1 | Project + canvas | Vite app, full-screen canvas, toolbar shell, handwritten font loaded | React, canvas, resize, devicePixelRatio |
| 2 | Draw shapes | Rectangle, ellipse, diamond, line with rough hand-drawn style | Scene array, mouse events, own sketchy line renderer (seeded randomness) |
| 3 | Select + edit | Select, move, resize handles, delete, multi-select, hit testing | Geometry, hit tests, handles |
| 4 | Text + pen + arrows | Handwritten text tool, freehand pen, arrows (bound to shapes), eraser | Text editing on canvas, curve smoothing for the pen |
| 5 | Style + view | Stroke/fill colors, width, roughness, opacity, pan, zoom, grid, dark mode | Properties panel, viewport transform |
| 6 | History + shortcuts | Undo/redo, copy/paste, duplicate, layers order, keyboard shortcuts | Immutable snapshots, command pattern (functions) |
| 7 | Save + export | Auto-save to localStorage, export PNG/SVG/.canvasly JSON, import | Serialization, Blob, SVG writer |
| 8 | Backend + sharing | Express API, saved boards, shareable link | Routes/controllers/services/repositories |
| 9 | Live collaboration | WebSockets rooms, live cursors, synced edits | WebSockets, sync, conflicts |
| 10 | Polish | Image upload, shape library, frames, mobile touch, PWA | Touch events, perf |

## Folder layout (client)
Each component lives in its own folder, with its .jsx and .scss side by side.
```
canvasly/client/src/
  main.jsx
  App/                 App.jsx, App.scss
  components/
    Canvas/            Canvas.jsx, Canvas.scss
    Toolbar/           Toolbar.jsx, Toolbar.scss
    ToolIcon/          ToolIcon.jsx
    Welcome/           Welcome.jsx, Welcome.scss
    Brand/             Brand.jsx, Brand.scss
  styles/              _variables.scss, global.scss
  canvas/              renderGrid, hitTest, viewport (plain JS)
  tools/               rectangleTool, selectTool, ... (later)
  store/               sceneStore, historyStore (later)
  utils/               constants, geometry, export
```

## Working rules
- One phase at a time; finish and understand before the next.
- Constants/enums in one constants file; descriptive names; few comments.
- Never commit unasked.
