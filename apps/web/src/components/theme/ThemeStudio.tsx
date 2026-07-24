import { createEffect, createMemo, createSignal, For } from "solid-js";
import { ActionButton, Flex, Text, typeRoles } from "@proyecto-viviana/ui";
import { ColorKnob } from "./ColorKnob";
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
    <Flex direction="column" gap={5}>
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

      <Flex
        wrap
        alignItems="center"
        justifyContent="between"
        gap={3}
        style={{ "padding-top": "16px", "border-top": "1px solid var(--docs-border)" }}
      >
        <Text styles={typeRoles.meta}>Starts from a Spectrum preset.</Text>
        <ActionButton size="S" isDisabled={isDefault()} onPress={reset}>
          Reset
        </ActionButton>
      </Flex>
    </Flex>
  );
}
