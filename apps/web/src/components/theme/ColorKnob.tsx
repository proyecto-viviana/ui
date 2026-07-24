import { createEffect, createSignal, Show } from "solid-js";
// Same sourcing rule as ThemeCreator: everything but the OS colour picker comes from
// the design system, because nothing in the library replaces `<input type="color">`.
import { Flex, Text, TextField, typeRoles } from "@proyecto-viviana/ui";

export interface ColorKnobProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (hex: string) => void;
}

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const pickerStyle = {
  width: "36px",
  height: "36px",
  padding: "0",
  "flex-shrink": "0",
  cursor: "pointer",
  background: "transparent",
  border: "1px solid var(--docs-border)",
  "border-radius": "var(--radius-md)",
} as const;

// One color control: a swatch/native picker paired with a validated hex input.
// The OKLCH L/C/H readout that used to sit under the hex was engine-facing noise
// for a design surface — dropped so the knob reads as a clean, product-grade
// control.
export function ColorKnob(props: ColorKnobProps) {
  // The hex field keeps its own draft so a half-typed value survives the keystroke;
  // binding it straight to the colour would revert every character that does not yet
  // spell a complete `#rrggbb`.
  const [draft, setDraft] = createSignal(props.value);
  createEffect(() => setDraft(props.value));

  return (
    <Flex direction="column" gap={1.5}>
      <Text styles={typeRoles.label}>{props.label}</Text>
      <Flex alignItems="center" gap={2}>
        <input
          type="color"
          style={pickerStyle}
          aria-label={`${props.label} color picker`}
          value={props.value}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
        <TextField
          size="S"
          UNSAFE_style={{ width: "100%", "min-width": "0" }}
          aria-label={`${props.label} hex value`}
          value={draft()}
          onChange={(value: string) => {
            setDraft(value);
            const val = value.trim();
            if (HEX_RE.test(val)) props.onChange(val);
          }}
        />
      </Flex>
      <Show when={props.hint}>
        <Text styles={typeRoles.meta}>{props.hint}</Text>
      </Show>
    </Flex>
  );
}
