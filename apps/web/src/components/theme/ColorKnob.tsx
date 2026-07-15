import { hexToOklch } from "@/utils/color";

export interface ColorKnobProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

// One color control: swatch/native picker + validated hex input + OKLCH readout.
// Extracted from ThemeCreator so both the legacy creator pattern and the new
// Theme Studio share a single knob.
export function ColorKnob(props: ColorKnobProps) {
  const oklch = () => hexToOklch(props.value);

  return (
    <div class="flex flex-col gap-1.5">
      <label class="text-sm font-medium text-primary-200">{props.label}</label>
      <div class="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${props.label} color picker`}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
          class="h-10 w-10 shrink-0 cursor-pointer rounded border border-primary-700/50 bg-transparent"
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
            class="w-24 rounded border border-primary-700/50 bg-bg-300 px-2 py-0.5 font-mono text-xs text-primary-100"
          />
          <span class="font-mono text-[10px] text-primary-400">
            {(() => {
              const o = oklch();
              return `L:${o.l.toFixed(2)} C:${o.c.toFixed(2)} H:${o.h.toFixed(0)}`;
            })()}
          </span>
        </div>
      </div>
      {props.hint ? <span class="text-[11px] leading-tight text-primary-500">{props.hint}</span> : null}
    </div>
  );
}
