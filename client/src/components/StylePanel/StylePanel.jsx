import {
  BACKGROUND_COLORS,
  FILL_STYLES,
  ROUGHNESS_LEVELS,
  STROKE_COLORS,
  STROKE_WIDTHS,
} from "../../utils/constants";
import "./StylePanel.scss";

const ROUGHNESS_PATHS = {
  0: "M3 12h18",
  1: "M3 12q4.5-3 9 0t9 0",
  2: "M3 12q3-6 6 0t6 0t6 0",
};

const LAYER_BUTTONS = [
  { action: "sendToBack", label: "Send to back", symbol: "⤓" },
  { action: "sendBackward", label: "Send backward", symbol: "↓" },
  { action: "bringForward", label: "Bring forward", symbol: "↑" },
  { action: "bringToFront", label: "Bring to front", symbol: "⤒" },
];

function Section({ title, children }) {
  return (
    <section className="style-panel__section">
      <h3 className="style-panel__title">{title}</h3>
      <div className="style-panel__row">{children}</div>
    </section>
  );
}

function ColorSwatches({ colors, value, label, onChange }) {
  return colors.map((color) => (
    <button
      key={color}
      className={`style-panel__swatch ${color === "transparent" ? "is-transparent" : ""} ${
        value === color ? "is-active" : ""
      }`}
      style={{ background: color === "transparent" ? undefined : color }}
      onClick={() => onChange(color)}
      aria-label={`${label} ${color}`}
      aria-pressed={value === color}
    />
  ));
}

function OptionButton({ isActive, label, onClick, children }) {
  return (
    <button
      className={`style-panel__option ${isActive ? "is-active" : ""}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
    >
      {children}
    </button>
  );
}

export default function StylePanel({ style, controls, onChange, onLayerChange }) {
  return (
    <aside className="style-panel" aria-label="Style">
      <Section title="Stroke">
        <ColorSwatches
          colors={STROKE_COLORS}
          value={style.strokeColor}
          label="Stroke"
          onChange={(strokeColor) => onChange({ strokeColor })}
        />
      </Section>

      {controls.showBackground && (
        <>
          <Section title="Background">
            <ColorSwatches
              colors={BACKGROUND_COLORS}
              value={style.backgroundColor}
              label="Background"
              onChange={(backgroundColor) => onChange({ backgroundColor })}
            />
          </Section>

          <Section title="Fill">
            {FILL_STYLES.map((fillStyle) => (
              <OptionButton
                key={fillStyle}
                label={fillStyle}
                isActive={style.fillStyle === fillStyle}
                onClick={() => onChange({ fillStyle })}
              >
                {fillStyle === "hachure" ? "///" : "▮"}
              </OptionButton>
            ))}
          </Section>
        </>
      )}

      {controls.showStrokeWidth && (
        <Section title="Stroke width">
          {STROKE_WIDTHS.map((strokeWidth) => (
            <OptionButton
              key={strokeWidth}
              label={`Width ${strokeWidth}`}
              isActive={style.strokeWidth === strokeWidth}
              onClick={() => onChange({ strokeWidth })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M4 12h16"
                  stroke="currentColor"
                  strokeWidth={strokeWidth + 0.5}
                  strokeLinecap="round"
                />
              </svg>
            </OptionButton>
          ))}
        </Section>
      )}

      {controls.showRoughness && (
        <Section title="Sloppiness">
          {ROUGHNESS_LEVELS.map((roughness) => (
            <OptionButton
              key={roughness}
              label={`Sloppiness ${roughness}`}
              isActive={style.roughness === roughness}
              onClick={() => onChange({ roughness })}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d={ROUGHNESS_PATHS[roughness]}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </OptionButton>
          ))}
        </Section>
      )}

      <section className="style-panel__section">
        <h3 className="style-panel__title">Opacity</h3>
        <input
          className="style-panel__slider"
          type="range"
          min="0"
          max="100"
          step="10"
          value={style.opacity}
          onChange={(event) => onChange({ opacity: Number(event.target.value) })}
          aria-label="Opacity"
        />
      </section>

      {controls.showLayers && (
        <Section title="Layers">
          {LAYER_BUTTONS.map(({ action, label, symbol }) => (
            <OptionButton
              key={action}
              label={label}
              isActive={false}
              onClick={() => onLayerChange(action)}
            >
              {symbol}
            </OptionButton>
          ))}
        </Section>
      )}
    </aside>
  );
}
