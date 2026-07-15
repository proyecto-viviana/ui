import { createEffect, createMemo, createSignal, For } from "solid-js";
import { ColorKnob } from "./ColorKnob";
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
      <div class="flex items-center justify-between">
        <h2 class="font-jost text-lg font-semibold text-primary-100">Create theme</h2>
        <button
          type="button"
          onClick={reset}
          disabled={isDefault()}
          class="rounded-md border border-primary-700/50 px-2.5 py-1 text-xs text-primary-300 transition hover:bg-bg-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      <div class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
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

      <div class="flex items-center gap-2 border-t border-primary-800/40 pt-4">
        <span class="text-xs font-medium uppercase tracking-wide text-primary-400">Preview scheme</span>
        <div class="inline-flex overflow-hidden rounded-md border border-primary-700/50">
          <For each={["dark", "light"] as Scheme[]}>
            {(s) => (
              <button
                type="button"
                onClick={() => setScheme(s)}
                class="px-3 py-1 text-xs capitalize transition"
                classList={{
                  "bg-primary-600 text-white": scheme() === s,
                  "text-primary-300 hover:bg-bg-300": scheme() !== s,
                }}
              >
                {s}
              </button>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
