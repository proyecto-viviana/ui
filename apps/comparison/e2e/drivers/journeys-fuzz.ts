import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "@playwright/test";
import {
  compareJourneyObservations,
  overlay,
  runJourneyOnPanel,
  writeMinimizedJourney,
  type Journey,
} from "./journeys";
import { serializeStep, type Step } from "./journeys-steps";
import {
  driverCases,
  type DriverScenario,
  type PanelFramework,
  type TargetResolver,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Seeded D13 fuzz: generate a step sequence from a component alphabet, run the
 * same collect/diff as named journeys, and on failure delta-debug minimize
 * (ddmin) bounded by `budgetMs`. Gated on `JOURNEY_FUZZ=1` so the certified
 * suite never registers these tests.
 */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function int(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export type StepGenerator = (rng: Rng) => Step;

export function overlayJourneyAlphabet(
  resolvers: {
    trigger: TargetResolver;
    input?: TargetResolver;
    optionNames: readonly string[];
  },
  options: { withFixtureProtocol?: boolean } = {},
): StepGenerator[] {
  const optionOf = (name: string): TargetResolver => overlay.option(name);
  const listbox = overlay.listbox();
  const keys = [
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    "PageUp",
    "PageDown",
    "Escape",
    "Enter",
    "Space",
    "Tab",
    "Shift+Tab",
    "Backspace",
  ] as const;
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const viewports = [
    { width: 900, height: 600 },
    { width: 1280, height: 800 },
  ] as const;

  const generators: StepGenerator[] = [
    (_rng) => ({
      type: "click",
      target: resolvers.trigger,
      label: "click trigger",
      targetId: "trigger",
    }),
    (_rng) => ({ type: "clickOutside", label: "click outside" }),
    (rng) => {
      const key = pick(rng, keys);
      return { type: "press", key, label: `press ${key}` };
    },
    (rng) => {
      const n = int(rng, 1, 3);
      let text = "";
      for (let i = 0; i < n; i++) {
        text += letters[int(rng, 0, letters.length - 1)];
      }
      return { type: "type", text, label: `type ${text}` };
    },
    (rng) => {
      const name = pick(rng, resolvers.optionNames);
      return {
        type: "hover",
        target: optionOf(name),
        label: `hover option ${name}`,
        targetId: `option:${name}`,
      };
    },
    (rng) => {
      const name = pick(rng, resolvers.optionNames);
      return {
        type: "click",
        target: optionOf(name),
        label: `click option ${name}`,
        targetId: `option:${name}`,
      };
    },
    (rng) => ({
      type: "wheel",
      dx: 0,
      dy: int(rng, 40, 240),
      target: listbox,
      label: "wheel on list",
      targetId: "listbox",
    }),
    (rng) => {
      const y = int(rng, 0, 400);
      return { type: "scrollPage", y, label: `scrollPage(${y})` };
    },
    (rng) => {
      const size = pick(rng, viewports);
      return {
        type: "resize",
        width: size.width,
        height: size.height,
        label: `resize ${size.width}x${size.height}`,
      };
    },
    (rng) => {
      const ms = int(rng, 0, 600);
      return { type: "clock", ms, label: `clock ${ms}ms` };
    },
    (_rng) => ({
      type: "focus",
      target: resolvers.trigger,
      label: "focus trigger",
      targetId: "trigger",
    }),
    (rng) => {
      const key = pick(rng, keys);
      const repeat = int(rng, 0, 3);
      return {
        type: "keyDown",
        key,
        ...(repeat > 0 ? { repeat } : {}),
        label: `keyDown ${key}`,
      };
    },
    (rng) => {
      const key = pick(rng, keys);
      return { type: "keyUp", key, label: `keyUp ${key}` };
    },
    (_rng) => ({
      type: "touchDown",
      target: resolvers.trigger,
      label: "touchDown trigger",
      targetId: "trigger",
    }),
    (_rng) => ({
      type: "touchUp",
      target: resolvers.trigger,
      label: "touchUp trigger",
      targetId: "trigger",
    }),
    (rng) => ({
      type: "tapAt",
      target: resolvers.trigger,
      xFraction: rng(),
      yFraction: rng(),
      label: "tapAt trigger",
      targetId: "trigger",
    }),
    (_rng) => ({
      type: "dispatch",
      target: listbox,
      eventType: "scroll",
      label: "dispatch scroll",
      targetId: "listbox",
    }),
    (rng) => {
      const name = pick(rng, resolvers.optionNames);
      return { type: "selectOption", name, label: `selectOption ${name}` };
    },
  ];

  if (resolvers.input) {
    const input = resolvers.input;
    generators.push((_rng) => ({
      type: "click",
      target: input,
      label: "click input",
      targetId: "input",
    }));
    generators.push((_rng) => ({
      type: "focus",
      target: input,
      label: "focus input",
      targetId: "input",
    }));
  }

  if (options.withFixtureProtocol) {
    generators.push(
      (rng) => {
        const name = pick(rng, ["isDisabled", "isReadOnly", "isRequired"] as const);
        const value = pick(rng, [true, false]);
        return { type: "control", name, value, label: `control ${name}` };
      },
      (_rng) => ({ type: "submit", label: "submit" }),
      (_rng) => ({ type: "reset", label: "reset" }),
    );
  }

  return generators;
}

export function generateJourneySteps(
  alphabet: readonly StepGenerator[],
  seed: number,
  maxSteps: number,
): { steps: Step[]; serialized: ReturnType<typeof serializeStep>[] } {
  const rng = mulberry32(seed);
  const count = 1 + int(rng, 0, Math.max(0, maxSteps - 1));
  const steps: Step[] = [];
  for (let i = 0; i < count; i++) {
    steps.push(pick(rng, alphabet)(rng));
  }
  return { steps, serialized: steps.map(serializeStep) };
}

export interface JourneyFuzzOptions {
  seed?: number;
  budgetMs?: number;
  maxSteps?: number;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

async function journeyFails(
  page: import("@playwright/test").Page,
  scenario: DriverScenario,
  journey: Journey,
): Promise<boolean> {
  const caseDef = driverCases(scenario)[0]!;
  const panels: Partial<Record<PanelFramework, Awaited<ReturnType<typeof runJourneyOnPanel>>>> = {};
  try {
    await forEachScenarioPanel(page, scenario, caseDef, "light", async (ctx) => {
      panels[ctx.framework] = await runJourneyOnPanel(ctx, scenario, journey, {
        catchStepErrors: true,
      });
    });
    if (!panels.react || !panels.solid) {
      return true;
    }
    await compareJourneyObservations(page, journey, panels.react, panels.solid);
    return false;
  } catch {
    return true;
  }
}

async function ddmin(
  page: import("@playwright/test").Page,
  scenario: DriverScenario,
  steps: Step[],
  deadline: number,
  n = 2,
): Promise<Step[]> {
  if (Date.now() >= deadline || steps.length <= 1) {
    return steps;
  }

  const subsetSize = Math.max(1, Math.floor(steps.length / n));
  const subsets: Step[][] = [];
  for (let i = 0; i < steps.length; i += subsetSize) {
    subsets.push(steps.slice(i, i + subsetSize));
  }

  for (const subset of subsets) {
    if (Date.now() >= deadline) {
      return steps;
    }
    if (subset.length === 0) {
      continue;
    }
    const probe: Journey = { id: "fuzz-ddmin", label: "ddmin", steps: subset };
    if (await journeyFails(page, scenario, probe)) {
      return ddmin(page, scenario, subset, deadline, 2);
    }
  }

  for (const subset of subsets) {
    if (Date.now() >= deadline) {
      return steps;
    }
    const complement = steps.filter((step) => !subset.includes(step));
    if (complement.length === 0 || complement.length === steps.length) {
      continue;
    }
    const probe: Journey = { id: "fuzz-ddmin", label: "ddmin", steps: complement };
    if (await journeyFails(page, scenario, probe)) {
      return ddmin(page, scenario, complement, deadline, Math.max(n - 1, 2));
    }
  }

  if (n < steps.length) {
    return ddmin(page, scenario, steps, deadline, Math.min(steps.length, n * 2));
  }
  return steps;
}

export function registerJourneyFuzz(
  scenario: DriverScenario,
  alphabet: readonly StepGenerator[],
  options: JourneyFuzzOptions = {},
) {
  if (process.env.JOURNEY_FUZZ !== "1") {
    return;
  }

  const seed = options.seed ?? envInt("JOURNEY_SEED", 1);
  const budgetMs = options.budgetMs ?? envInt("JOURNEY_BUDGET_MS", 120_000);
  const maxSteps = options.maxSteps ?? envInt("JOURNEY_MAX_STEPS", 12);

  test.describe("D13 fuzz", () => {
    test.use({ hasTouch: true });

    test(`${scenario.title} · seed ${seed}`, async ({ page }) => {
      test.setTimeout(Math.max(budgetMs + 60_000, 180_000));
      const generated = generateJourneySteps(alphabet, seed, maxSteps);
      // Printed so a second run with the same seed can diff the sequence.
      console.log(
        `D13 fuzz generated ${scenario.slug} seed=${seed} steps=${JSON.stringify(generated.serialized)}`,
      );

      await page.clock.install();
      const deadline = Date.now() + budgetMs;
      const journey: Journey = {
        id: `fuzz-${scenario.slug}-${seed}`,
        label: `fuzz seed ${seed}`,
        steps: generated.steps,
      };

      const failed = await journeyFails(page, scenario, journey);
      if (!failed) {
        return;
      }

      const minimized = await ddmin(page, scenario, generated.steps, deadline);
      const payload = {
        component: scenario.slug,
        seed,
        originalLength: generated.steps.length,
        minimizedLength: minimized.length,
        original: generated.serialized,
        minimized: minimized.map(serializeStep),
      };
      const filePath = await writeMinimizedJourney(`${scenario.slug}-${seed}.json`, payload);

      const draft = [
        `# D13 fuzz minimized journey`,
        ``,
        `- component: ${scenario.slug}`,
        `- seed: ${seed}`,
        `- original steps: ${generated.steps.length}`,
        `- minimized steps: ${minimized.length}`,
        `- file: ${filePath}`,
        ``,
        "```json",
        JSON.stringify(payload.minimized, null, 2),
        "```",
        ``,
      ].join("\n");
      const draftDir = path.join(process.cwd(), "output");
      await mkdir(draftDir, { recursive: true });
      await writeFile(path.join(draftDir, `d13-journey-fuzz-${scenario.slug}-${seed}.md`), draft);

      expect(
        minimized.map(serializeStep),
        `${scenario.slug} seed ${seed} minimized failing journey (${minimized.length} steps, wrote ${filePath})`,
      ).toEqual([]);
    });
  });
}
