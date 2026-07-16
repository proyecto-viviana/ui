import { createEffect, createMemo, createSignal, For } from "solid-js";
import { ColorKnob } from "./ColorKnob";
import { BLUE, FONT_DISPLAY, PINK } from "./primitives";
import { type TokenMap } from "@/utils/themeBase";
import {
  buildThemeTokens,
  DEFAULT_INPUTS,
  FAMILIES,
  FAMILY_META,
  type Family,
  type Scheme,
  type ThemeInputs,
} from "@/utils/themeGen";

export interface ThemeResult {
  inputs: ThemeInputs;
  scheme: Scheme;
  dark: TokenMap;
  light: TokenMap;
}

export interface ThemeStudioProps {
  onChange: (result: ThemeResult) => void;
}

/**
 * The editor half of the Theme Studio: one color knob per token family plus a
 * preview-scheme toggle. It owns the knob inputs, recolors the full contract for
 * both schemes on every change, and lifts the result so the route can feed the
 * live gallery and the copy panel. It is site chrome — the preview theme never
 * touches it.
 */
export function ThemeStudio(props: ThemeStudioProps) {
  const [inputs, setInputs] = createSignal<ThemeInputs>({ ...DEFAULT_INPUTS });
  const [scheme, setScheme] = createSignal<Scheme>("dark");

  const dark = createMemo(() => buildThemeTokens(inputs(), "dark"));
  const light = createMemo(() => buildThemeTokens(inputs(), "light"));

  createEffect(() => {
    props.onChange({ inputs: inputs(), scheme: scheme(), dark: dark(), light: light() });
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
        <div class="flex items-center gap-3">
          <span
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "11px",
              "font-weight": "600",
              "letter-spacing": "0.1em",
              "text-transform": "uppercase",
              color: "var(--docs-text-secondary)",
            }}
          >
            Preview scheme
          </span>
          <div style={{ display: "inline-flex", border: `2px solid var(--docs-border)` }}>
            <For each={["dark", "light"] as Scheme[]}>
              {(s) => (
                <button
                  type="button"
                  onClick={() => setScheme(s)}
                  style={{
                    "font-family": FONT_DISPLAY,
                    "font-size": "11px",
                    "font-weight": "600",
                    "letter-spacing": "0.04em",
                    "text-transform": "capitalize",
                    padding: "5px 14px",
                    cursor: "pointer",
                    border: "none",
                    color: scheme() === s ? "#141414" : "var(--docs-text-secondary)",
                    background: scheme() === s ? BLUE : "transparent",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                >
                  {s}
                </button>
              )}
            </For>
          </div>
        </div>

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
            padding: "5px 12px",
            border: "2px solid var(--docs-border)",
            background: "transparent",
            color: "var(--docs-text-secondary)",
            cursor: isDefault() ? "not-allowed" : "pointer",
            opacity: isDefault() ? "0.4" : "1",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isDefault()) {
              e.currentTarget.style.borderColor = PINK;
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
