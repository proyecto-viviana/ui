import { hexToOklch } from "@/utils/color";
import { FONT_DISPLAY } from "./primitives";

export interface ColorKnobProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// One color control: swatch/native picker + validated hex input + OKLCH readout.
// Extracted from ThemeCreator so both the legacy creator pattern and the new
// Theme Studio share a single knob. Chrome rides the auto-theming --docs-* tokens.
export function ColorKnob(props: ColorKnobProps) {
  const oklch = () => hexToOklch(props.value);

  return (
    <div class="flex flex-col gap-1.5">
      <label
        style={{
          "font-family": FONT_DISPLAY,
          "font-size": "12px",
          "font-weight": "600",
          "letter-spacing": "0.02em",
          color: "var(--docs-text)",
        }}
      >
        {props.label}
      </label>
      <div class="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${props.label} color picker`}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          class="h-10 w-10 shrink-0 cursor-pointer bg-transparent p-0"
          style={{ border: "1px solid var(--docs-border)", "border-radius": "8px" }}
        />
        <div class="flex flex-col gap-0.5">
          <input
            type="text"
            aria-label={`${props.label} hex value`}
            value={props.value}
            onInput={(e) => {
              const val = e.currentTarget.value.trim();
              if (HEX_RE.test(val)) props.onChange(val);
            }}
            class="w-24 px-2 py-1 text-xs"
            style={{
              border: "1px solid var(--docs-border)",
              "border-radius": "8px",
              background: "var(--docs-bg)",
              color: "var(--docs-text)",
              "font-family": "'JetBrains Mono', ui-monospace, monospace",
            }}
          />
          <span
            style={{
              color: "var(--docs-text-secondary)",
              "font-family": "'JetBrains Mono', ui-monospace, monospace",
              "font-size": "10px",
            }}
          >
            {(() => {
              const o = oklch();
              return `L:${o.l.toFixed(2)} C:${o.c.toFixed(2)} H:${o.h.toFixed(0)}`;
            })()}
          </span>
        </div>
      </div>
      {props.hint ? (
        <span class="text-[11px] leading-tight" style={{ color: "var(--docs-text-secondary)", opacity: 0.8 }}>
          {props.hint}
        </span>
      ) : null}
    </div>
  );
}
