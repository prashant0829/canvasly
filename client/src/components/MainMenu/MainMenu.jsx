import { useEffect, useRef, useState } from "react";
import "./MainMenu.scss";

const MENU_ICON_PATH = "M4 7h16M4 12h16M4 17h16";

export default function MainMenu({
  hasElements,
  onOpen,
  onSave,
  onExportPng,
  onExportSvg,
  onClear,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event) {
      if (!menuRef.current.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function run(action) {
    setIsOpen(false);
    action();
  }

  const items = [
    { label: "Open…", hint: "Ctrl/⌘ O", action: onOpen },
    { label: "Save to file", hint: "Ctrl/⌘ S", action: onSave, needsElements: true },
    { label: "Export as PNG", action: onExportPng, needsElements: true },
    { label: "Export as SVG", action: onExportSvg, needsElements: true },
    { label: "Clear canvas", action: onClear, needsElements: true, isDanger: true },
  ];

  return (
    <div className="main-menu" ref={menuRef}>
      <button
        className="main-menu__trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d={MENU_ICON_PATH} />
        </svg>
      </button>

      {isOpen && (
        <div className="main-menu__list" role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`main-menu__item ${item.isDanger ? "is-danger" : ""}`}
              role="menuitem"
              disabled={item.needsElements && !hasElements}
              onClick={() => run(item.action)}
            >
              <span>{item.label}</span>
              {item.hint && <span className="main-menu__hint">{item.hint}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
