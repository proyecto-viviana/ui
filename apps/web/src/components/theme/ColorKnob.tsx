import { FONT_DISPLAY } from "./primitives";

export interface ColorKnobProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// One color control: a swatch/native picker paired with a validated hex input.
// The OKLCH L/C/H readout that used to sit under the hex was engine-facing noise
// for a design surface — dropped so the knob reads as a clean, product-grade
// control. Chrome rides the auto-theming --docs-* tokens.
export function ColorKnob(props: ColorKnobProps) {
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
          class="h-9 w-9 shrink-0 cursor-pointer bg-transparent p-0"
          style={{ border: "1px solid var(--docs-border)", "border-radius": "8px" }}
        />
        <input
          type="text"
          aria-label={`${props.label} hex value`}
          value={props.value}
          onInput={(e) => {
            const val = e.currentTarget.value.trim();
            if (HEX_RE.test(val)) props.onChange(val);
          }}
          class="w-full min-w-0 px-2 py-1.5 text-xs"
          style={{
            border: "1px solid var(--docs-border)",
            "border-radius": "8px",
            background: "var(--docs-bg)",
            color: "var(--docs-text)",
            "font-family": "'JetBrains Mono', ui-monospace, monospace",
          }}
        />
      </div>
      {props.hint ? (
        <span class="text-[11px] leading-tight" style={{ color: "var(--docs-text-secondary)", opacity: 0.8 }}>
          {props.hint}
        </span>
      ) : null}
    </div>
  );
}
