import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Page } from "@playwright/test";
import { installOracle, startEventRecording } from "./dom-oracle";
import {
  collectStepObservation,
  emptyObservation,
  overlayMotionPhase,
  type CollectedPanel,
  type OverlayGeometry,
  type StepObservation,
} from "./journeys-observe";
import { performStep, serializeStep, type Step } from "./journeys-steps";
import {
  driverCases,
  type DriverScenario,
  type PanelContext,
  type PanelFramework,
  type TargetResolver,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";
import { diffScreenshots, exactPairDiff } from "../visual-diff";

export type { Step, SerializedStep, MouseButton, Modifier } from "./journeys-steps";
export type {
  StepObservation,
  DomNodeSnapshot,
  OverlayGeometry,
  ListObservation,
  InputObservation,
  FocusObservation,
  EventObservation,
  EventsObservation,
  CallbackObservation,
  AxObservation,
  DocumentObservation,
  PixelObservation,
  OverlayMotionPhase,
} from "./journeys-observe";
export { overlayRootLocator, overlayMotionPhase } from "./journeys-observe";
export { serializeStep, performStep, overlay, targets } from "./journeys-steps";

/**
 * RAC state `data-*` attributes compared in every D13 DOM snapshot.
 *
 * Source (pinned react-aria-components 1.21.0):
 * - ComboBox.tsx:367-372, 455 — `data-focused`, `data-open`, `data-disabled`,
 *   `data-readonly`, `data-invalid`, `data-required`, `data-placeholder`
 * - Select.tsx:282-287, 419 — `data-focused`, `data-focus-visible`, `data-open`,
 *   `data-disabled`, `data-invalid`, `data-required`, `data-placeholder`
 * - Popover.tsx:348-351 — `data-trigger`, `data-placement`, `data-entering`,
 *   `data-exiting`
 * - ListBox.tsx:411-416, 628-640 — `data-drop-target`, `data-empty`,
 *   `data-focused`, `data-focus-visible`, `data-layout`, `data-orientation`,
 *   `data-allows-dragging`, `data-selected`, `data-hovered`, `data-pressed`,
 *   `data-dragging`, `data-selection-mode`
 *
 * Composed RAC surfaces those four files render:
 * - Input.tsx:32-57 (ComboBox input) — hovered/focused/focus-visible/disabled/invalid
 * - Button.tsx:41-71 (chevron / Select trigger) — plus `data-pending`
 * - Group.tsx:32-57 (ComboBox field group) — plus `data-focus-within`
 * - Collection.tsx:57-117 (ListBox item render props) — hovered/pressed/selected/…
 *
 * Excluded:
 * - `data-key` — collection keys are an implementation identity; RAC ListBoxItem
 *   does not emit `data-key` (ListBox.tsx:616-640), but a port that does would
 *   compare unequal even when the option's role/name/aria-selected match.
 * - `id`, `for`, `data-hk` — generated ids and Solid hydration keys.
 * - `data-rac` (utils.tsx:278, useRenderProps) — a framework identity marker on
 *   every RAC host, not user-observable state; a port that emitted it would be
 *   claiming to be React Aria Components, so it is neither required nor compared.
 */
export const RAC_STATE_DATA_ATTRIBUTES = [
  "data-focused",
  "data-focus-visible",
  "data-focus-within",
  "data-hovered",
  "data-pressed",
  "data-selected",
  "data-disabled",
  "data-open",
  "data-placement",
  "data-trigger",
  "data-entering",
  "data-exiting",
  "data-invalid",
  "data-required",
  "data-readonly",
  "data-empty",
  "data-placeholder",
  "data-dragging",
  "data-drop-target",
  "data-allows-dragging",
  "data-selection-mode",
  "data-layout",
  "data-orientation",
  "data-pending",
] as const;

export type JourneyClass = "default" | "motion" | "timing" | "ua:apple" | "unit-only";

export interface Journey {
  id: string;
  label: string;
  /** Defaults to `"default"`. `"unit-only"` is ledger-only and not registrable. */
  class?: JourneyClass;
  setup?: (ctx: PanelContext) => Promise<void>;
  steps: Step[];
}

const postStepSettleMs = 220;

function journeyClass(journey: Journey): JourneyClass {
  return journey.class ?? "default";
}

function journeyNeedsClock(journey: Journey): boolean {
  return journeyClass(journey) === "timing" || journey.steps.some((step) => step.type === "clock");
}

/**
 * `unit-only` journeys are inventory ledger rows, not Playwright tests.
 * `registerJourneyDriver` must throw rather than register them.
 */
export function assertJourneysRegistrable(journeys: readonly Journey[]): void {
  const blocked = journeys.filter((journey) => journeyClass(journey) === "unit-only");
  if (blocked.length > 0) {
    throw new Error(
      `unit-only journeys cannot be registered as Playwright tests (ledger only): ${blocked
        .map((journey) => journey.id)
        .join(", ")}`,
    );
  }
}

function overlayForCompare(entries: OverlayGeometry[], exactOpacity: boolean) {
  return entries.map((entry) => {
    const phase = overlayMotionPhase(entry);
    if (exactOpacity) {
      return { ...entry, phase };
    }
    return {
      dx: entry.dx,
      dy: entry.dy,
      placement: entry.placement,
      widthDelta: entry.widthDelta,
      insideViewport: entry.insideViewport,
      visibility: entry.visibility,
      transform: entry.transform,
      pointerEvents: entry.pointerEvents,
      zIndex: entry.zIndex,
      dataEntering: entry.dataEntering,
      dataExiting: entry.dataExiting,
      phase,
    };
  });
}
const observationFields = [
  "error",
  "dom",
  "form",
  "input",
  "focus",
  "overlay",
  "list",
  "events",
  "ax",
  "document",
  "pixel",
] as const satisfies readonly (keyof StepObservation)[];

export async function runJourneyOnPanel(
  ctx: PanelContext,
  scenario: DriverScenario,
  journey: Journey,
  options: { catchStepErrors?: boolean } = {},
): Promise<CollectedPanel> {
  const trigger = scenario.target(ctx);
  await installOracle(ctx.page, ctx.canvas);
  await journey.setup?.(ctx);

  const observations: StepObservation[] = [];
  const pixels: Array<Buffer | null> = [];

  for (let i = 0; i < journey.steps.length; i++) {
    const step = journey.steps[i]!;
    await startEventRecording(ctx.page);
    let error: string | null = null;
    try {
      await performStep(ctx, step);
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
      if (!options.catchStepErrors) {
        throw caught;
      }
    }
    if (step.type !== "settle") {
      await ctx.page.waitForTimeout(postStepSettleMs);
    }
    if (error) {
      observations.push(emptyObservation(i, step.label, error));
      pixels.push(null);
      if (options.catchStepErrors) {
        break;
      }
    } else {
      const collected = await collectStepObservation(
        ctx,
        trigger,
        i,
        step.label,
        null,
        RAC_STATE_DATA_ATTRIBUTES,
      );
      observations.push(collected.observation);
      pixels.push(collected.png);
    }
  }

  return { observations, pixels };
}

export async function compareJourneyObservations(
  page: Page,
  journey: Journey,
  react: CollectedPanel,
  solid: CollectedPanel,
): Promise<void> {
  const prefix = (index: number, label: string, field: string) =>
    `${journey.id} step ${index} (${label}) field ${field}`;

  expect(solid.observations.length, `${journey.id} observation count`).toEqual(
    react.observations.length,
  );

  const n = Math.min(react.observations.length, solid.observations.length);
  for (let i = 0; i < n; i++) {
    const reactObs = react.observations[i]!;
    const solidObs = solid.observations[i]!;
    const label = reactObs.step.label;
    for (const field of observationFields) {
      if (field === "overlay" && journeyClass(journey) === "motion") {
        const exactOpacity = journey.steps[i]?.type === "settle";
        expect(overlayForCompare(solidObs.overlay, exactOpacity), prefix(i, label, field)).toEqual(
          overlayForCompare(reactObs.overlay, exactOpacity),
        );
        continue;
      }
      if (field === "pixel") {
        expect(solidObs.pixel, prefix(i, label, "pixel")).toEqual(reactObs.pixel);
        const reactPng = react.pixels[i];
        const solidPng = solid.pixels[i];
        expect(solidPng != null, prefix(i, label, "pixel buffer")).toEqual(reactPng != null);
        if (reactPng && solidPng) {
          const diff = await diffScreenshots(
            page,
            reactPng,
            solidPng,
            exactPairDiff.pixelThreshold,
          );
          expect(diff.widthDelta, `${prefix(i, label, "pixel")} width delta`).toBeLessThanOrEqual(
            exactPairDiff.maxDimensionDelta,
          );
          expect(diff.heightDelta, `${prefix(i, label, "pixel")} height delta`).toBeLessThanOrEqual(
            exactPairDiff.maxDimensionDelta,
          );
          expect(
            diff.mismatchRatio,
            `${prefix(i, label, "pixel")} screenshot mismatch ratio ${diff.mismatchRatio} (${diff.mismatchedPixels}/${diff.totalPixels} pixels, bounds ${JSON.stringify(diff.mismatchBounds)})`,
          ).toBeLessThanOrEqual(exactPairDiff.maxMismatchRatio);
        }
        continue;
      }
      expect(solidObs[field], prefix(i, label, field)).toEqual(reactObs[field]);
    }
  }
}

export function registerJourneyDriver(scenario: DriverScenario, journeys: readonly Journey[]) {
  assertJourneysRegistrable(journeys);

  test.describe(`D13 journeys — ${scenario.title}`, () => {
    test.use({ hasTouch: true });

    for (const journey of journeys) {
      test(`D13 journey — ${journey.id}`, async ({ page }) => {
        test.setTimeout(180_000);
        const caseDef = driverCases(scenario)[0]!;
        if (journeyNeedsClock(journey)) {
          await page.clock.install();
        }
        if (journeyClass(journey) === "ua:apple") {
          await page.addInitScript(() => {
            Object.defineProperty(navigator, "platform", {
              configurable: true,
              get() {
                return "MacIntel";
              },
            });
          });
        }

        const panels: Partial<Record<PanelFramework, CollectedPanel>> = {};
        await forEachScenarioPanel(page, scenario, caseDef, "light", async (ctx) => {
          panels[ctx.framework] = await runJourneyOnPanel(ctx, scenario, journey);
        });

        const react = panels.react;
        const solid = panels.solid;
        expect(react, `${journey.id} missing React panel`).toBeTruthy();
        expect(solid, `${journey.id} missing Solid panel`).toBeTruthy();

        await test.info().attach(`${journey.id} · react`, {
          body: Buffer.from(JSON.stringify(react!.observations, null, 2)),
          contentType: "application/json",
        });
        await test.info().attach(`${journey.id} · solid`, {
          body: Buffer.from(JSON.stringify(solid!.observations, null, 2)),
          contentType: "application/json",
        });

        await compareJourneyObservations(page, journey, react!, solid!);
      });
    }
  });
}

/** Seed (a): click trigger → ArrowDown ×2 → Enter → reopen → scroll → settle → Escape → Tab. */
export function seedOpenReopenScrollJourney(trigger: TargetResolver): Journey {
  return {
    id: "open-arrow-enter-reopen-scroll-escape",
    label: "Open, arrow, enter, reopen, scroll, escape",
    steps: [
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
      { type: "press", key: "ArrowDown", label: "ArrowDown" },
      { type: "press", key: "ArrowDown", label: "ArrowDown" },
      { type: "press", key: "Enter", label: "Enter" },
      {
        type: "click",
        target: trigger,
        label: "click trigger (reopen)",
        targetId: "trigger",
      },
      { type: "scrollPage", y: 200, label: "scrollPage(200)" },
      { type: "settle", ms: 220, label: "settle" },
      { type: "press", key: "Escape", label: "Escape" },
      { type: "press", key: "Tab", label: "Tab" },
    ],
  };
}

/**
 * Seed (b): Tab to trigger → ArrowDown (opens) → End → Home → type first
 * letters of an option → Enter → Escape.
 */
export function seedKeyboardOnlyJourney(optionPrefix = "St"): Journey {
  return {
    id: "keyboard-only",
    label: "Keyboard-only open, typeahead, commit",
    setup: async (ctx) => {
      await ctx.canvas.evaluate((el) => {
        const node = el as HTMLElement;
        node.tabIndex = -1;
        node.focus();
      });
    },
    steps: [
      { type: "press", key: "Tab", label: "Tab to trigger" },
      { type: "press", key: "ArrowDown", label: "ArrowDown (opens)" },
      { type: "press", key: "End", label: "End" },
      { type: "press", key: "Home", label: "Home" },
      { type: "type", text: optionPrefix, label: `type ${optionPrefix}` },
      { type: "press", key: "Enter", label: "Enter" },
      { type: "press", key: "Escape", label: "Escape" },
    ],
  };
}

export function minimizedJourneysDir(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), "../journeys/minimized");
}

export async function writeMinimizedJourney(fileName: string, body: unknown): Promise<string> {
  const dir = minimizedJourneysDir();
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, fileName);
  await writeFile(filePath, `${JSON.stringify(body, null, 2)}\n`);
  return filePath;
}
