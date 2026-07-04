import { expect, test, type Locator } from "@playwright/test";
import {
  scenarioThemes,
  steadyStateCases,
  type DriverScenario,
  type GestureStateId,
  type PanelFramework,
} from "./scenario";
import { walkScenario, type WalkStepContext } from "./walk";

/**
 * Driver D1 — state-matrix computed-style pair diff (recertification.md
 * Phase 1). For every case × theme, walks both panels through the gesture
 * states and asserts the Solid target (and any named parts) resolves to the
 * exact same computed values as the React target for every property in the
 * allowlist. No thresholds, no normalization: the two stacks render in the
 * same browser on the same page, so equal styling means equal strings.
 */

/**
 * Properties compared per state. Longhand names only — getComputedStyle
 * shorthands (`border`, `transition`) serialize inconsistently, longhands
 * don't. Scenarios adjust via `styleProps.add` / `styleProps.remove`.
 */
export const defaultStyleAllowlist: readonly string[] = [
  "color",
  "background-color",
  "background-image",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "outline-color",
  "outline-style",
  "outline-width",
  "outline-offset",
  "box-shadow",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "column-gap",
  "row-gap",
  "width",
  "height",
  "display",
  "align-items",
  "justify-content",
  "opacity",
  "cursor",
  "transform",
  "will-change",
  "transition-property",
  "transition-duration",
  "transition-timing-function",
  "transition-delay",
];

export function resolveStyleAllowlist(scenario: DriverScenario): string[] {
  const removed = new Set(scenario.styleProps?.remove ?? []);
  const properties = defaultStyleAllowlist.filter((property) => !removed.has(property));
  for (const property of scenario.styleProps?.add ?? []) {
    if (!properties.includes(property)) {
      properties.push(property);
    }
  }
  return properties;
}

export async function captureComputedStyles(
  target: Locator,
  properties: readonly string[],
): Promise<Record<string, string>> {
  return target.evaluate((element, props) => {
    const computed = getComputedStyle(element);
    const captured: Record<string, string> = {};
    for (const property of props) {
      captured[property] = computed.getPropertyValue(property);
    }
    return captured;
  }, properties as string[]);
}

type PartStyles = Record<string, Record<string, string>>;
type PanelCaptures = Map<GestureStateId, PartStyles>;

async function capturePartStyles(
  step: WalkStepContext,
  properties: readonly string[],
): Promise<PartStyles> {
  const parts: PartStyles = {
    target: await captureComputedStyles(step.target, properties),
  };
  for (const [name, resolvePart] of Object.entries(step.scenario.parts ?? {})) {
    parts[name] = await captureComputedStyles(resolvePart(step), properties);
  }
  return parts;
}

export function registerStateMatrixDriver(scenario: DriverScenario) {
  const properties = resolveStyleAllowlist(scenario);

  test.describe(`D1 state matrix — ${scenario.title}`, () => {
    for (const caseDef of steadyStateCases(scenario)) {
      for (const theme of scenarioThemes(scenario, caseDef)) {
        test(`${caseDef.id} · ${theme}`, async ({ page }) => {
          test.setTimeout(120_000);

          const captures: Record<PanelFramework, PanelCaptures> = {
            react: new Map(),
            solid: new Map(),
          };

          await walkScenario(page, scenario, caseDef, theme, async (step) => {
            captures[step.framework].set(step.state, await capturePartStyles(step, properties));
          });

          for (const [state, reactParts] of captures.react) {
            const solidParts = captures.solid.get(state);
            expect(solidParts, `solid panel produced no capture for state "${state}"`).toBeTruthy();
            for (const [part, reactStyles] of Object.entries(reactParts)) {
              expect(
                solidParts![part],
                `${scenario.slug} · ${caseDef.id} · ${theme} · ${state} · ${part}`,
              ).toEqual(reactStyles);
            }
          }
        });
      }
    }
  });
}
