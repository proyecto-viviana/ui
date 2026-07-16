import { createEffect, createMemo, createSignal, For } from "solid-js";
import { ColorKnob } from "./ColorKnob";
import { FONT_DISPLAY } from "./primitives";
import { type TokenMap } from "@/utils/themeBase";
import {
  buildThemeTokens,
  DEFAULT_INPUTS,
  FAMILIES,
  FAMILY_META,
  type Family,
  type ThemeInputs,
} from "@/utils/themeGen";

export interface ThemeResult {
  inputs: ThemeInputs;
  dark: TokenMap;
  light: TokenMap;
}

export interface ThemeStudioProps {
  onChange: (result: ThemeResult) => void;
}

/**
 * The editor half of the Theme Studio: one color knob per token family. It owns
 * the knob inputs, recolors the full contract for both schemes on every change,
 * and lifts the result so the route can feed the live gallery and the copy panel.
 * The preview scheme (dark/light) lives up on the route's device frame, not here.
 * It is site chrome — the preview theme never touches it.
 */
export function ThemeStudio(props: ThemeStudioProps) {
  const [inputs, setInputs] = createSignal<ThemeInputs>({ ...DEFAULT_INPUTS });

  const dark = createMemo(() => buildThemeTokens(inputs(), "dark"));
  const light = createMemo(() => buildThemeTokens(inputs(), "light"));

  createEffect(() => {
    props.onChange({ inputs: inputs(), dark: dark(), light: light() });
  });

  const setFamily = (fam: Family, hex: string) => setInputs((prev) => ({ ...prev, [fam]: hex }));
  const reset = () => setInputs({ ...DEFAULT_INPUTS });
  const isDefault = createMemo(() =>
    FAMILIES.every((f) => inputs()[f].toLowerCase() === DEFAULT_INPUTS[f].toLowerCase()),
  );

  return (
    <div class="flex flex-col gap-5">
      <div class="pv-knobs">
        <For each={FAMILIES}>
          {(fam) => (
            <ColorKnob
              label={FAMILY_META[fam].label}
              hint={FAMILY_META[fam].hint}
              value={inputs()[fam]}
              onChange={(hex) => setFamily(fam, hex)}
            />
          )}
        </For>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-3 pt-4"
        style={{ "border-top": "1px solid var(--docs-border)" }}
      >
        <span
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "11px",
            "letter-spacing": "0.02em",
            color: "var(--docs-text-secondary)",
          }}
        >
          Starts from a Spectrum preset.
        </span>

        <button
          type="button"
          onClick={reset}
          disabled={isDefault()}
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "11px",
            "font-weight": "600",
            "letter-spacing": "0.06em",
            "text-transform": "uppercase",
            padding: "6px 16px",
            border: "1px solid var(--docs-border)",
            "border-radius": "999px",
            background: "transparent",
            color: "var(--docs-text-secondary)",
            cursor: isDefault() ? "not-allowed" : "pointer",
            opacity: isDefault() ? "0.4" : "1",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isDefault()) {
              e.currentTarget.style.borderColor = "var(--docs-accent)";
              e.currentTarget.style.color = "var(--docs-text)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--docs-border)";
            e.currentTarget.style.color = "var(--docs-text-secondary)";
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
