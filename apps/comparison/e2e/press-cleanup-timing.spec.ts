import { expect, test, type Page } from "@playwright/test";
import {
  frameworkPanel,
  scrollLocatorIntoView,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";

type GestureTarget = "label" | "input";
type GestureMode = "timeout" | "click";
type PhaseName = "down" | "up" | "click" | "hold" | "settled" | "after";

type PressPhase = {
  name: PhaseName;
  pressed: boolean;
  checked: boolean;
  labelSelected: boolean;
  comparison: string | null;
  labelUserSelect: string;
  inputUserSelect: string;
  at: number;
};

type StyleSnapshot = {
  labelStyle: string | null;
  inputStyle: string | null;
  labelUserSelect: string;
  inputUserSelect: string;
  labelComputed: string;
  inputComputed: string;
};

type ClickHit = {
  where: string;
  phase: "capture" | "bubble";
  target: string;
  button: number;
  detail: number;
  pointerType: string;
  trusted: boolean;
  defaultPrevented: boolean;
  pressed: boolean;
  checked: boolean;
  labelUserSelect: string;
  inputUserSelect: string;
  at: number;
};

type PressTrace = {
  before: StyleSnapshot;
  clicks: ClickHit[];
  phases: PressPhase[];
};

const stacks: FrameworkName[] = ["React Spectrum stack", "Solidaria stack"];

const phaseNames: Record<GestureMode, PhaseName[]> = {
  timeout: ["down", "up", "hold", "settled", "after"],
  click: ["down", "up", "click", "hold", "settled", "after"],
};

const pressedPhaseNames: Record<GestureMode, PhaseName[]> = {
  timeout: ["down", "up", "hold"],
  click: ["down", "up"],
};

const donePhaseNames: Record<GestureMode, PhaseName[]> = {
  timeout: ["settled", "after"],
  click: ["click", "hold", "settled", "after"],
};

async function tracePressCleanup(
  element: HTMLElement,
  options: { target: GestureTarget; mode: GestureMode },
): Promise<PressTrace> {
  const input = element.querySelector('input[type="checkbox"]');
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("missing checkbox input");
  }
  const label = input.closest("label");
  if (!(label instanceof HTMLLabelElement)) {
    throw new Error("missing press label");
  }

  const target = options.target === "label" ? label : input;
  const rect = label.getBoundingClientRect();
  const clientX = rect.left + rect.width / 2;
  const clientY = rect.top + rect.height / 2;
  const started = performance.now();

  const pointer = (type: "pointerdown" | "pointerup") =>
    // PointerEvent defaults width and height to 0. Both press implementations
    // treat that as a virtual click and skip the pointerup 80ms branch.
    new PointerEvent(type, {
      bubbles: true,
      cancelable: true,
      composed: true,
      pointerId: 1,
      pointerType: "mouse",
      isPrimary: true,
      button: 0,
      buttons: type === "pointerdown" ? 1 : 0,
      width: 1,
      height: 1,
      pressure: 0.5,
      clientX,
      clientY,
    });

  const styleOf = (node: HTMLElement): string | null => {
    const style = node.getAttribute("style");
    if (style == null) {
      return null;
    }
    return style.length > 240 ? `${style.slice(0, 240)}…` : style;
  };

  const styles = (): StyleSnapshot => ({
    labelStyle: styleOf(label),
    inputStyle: styleOf(input),
    labelUserSelect: label.style.userSelect,
    inputUserSelect: input.style.userSelect,
    labelComputed: getComputedStyle(label).userSelect,
    inputComputed: getComputedStyle(input).userSelect,
  });

  const snap = (name: PhaseName): PressPhase => {
    const host =
      element.hasAttribute("data-comparison-checked") ||
      element.hasAttribute("data-comparison-selected")
        ? element
        : element.parentElement;
    return {
      name,
      pressed: label.hasAttribute("data-pressed"),
      checked: input.checked,
      labelSelected: label.hasAttribute("data-selected"),
      comparison:
        host?.getAttribute("data-comparison-checked") ??
        host?.getAttribute("data-comparison-selected") ??
        null,
      labelUserSelect: label.style.userSelect,
      inputUserSelect: input.style.userSelect,
      at: Math.round(performance.now() - started),
    };
  };

  const before = styles();
  const clicks: ClickHit[] = [];
  const cleanups: Array<() => void> = [];
  const describe = (node: EventTarget | null): string => {
    if (node === input) return "input";
    if (node === label) return "label";
    if (node instanceof Element) return node.tagName.toLowerCase();
    return "other";
  };
  const record = (where: string, phase: "capture" | "bubble") => (event: Event) => {
    const mouse = event as MouseEvent;
    const pointerEvent = event as PointerEvent;
    clicks.push({
      where,
      phase,
      target: describe(event.target),
      button: mouse.button,
      detail: mouse.detail,
      pointerType: pointerEvent.pointerType ?? "",
      trusted: event.isTrusted,
      defaultPrevented: event.defaultPrevented,
      pressed: label.hasAttribute("data-pressed"),
      checked: input.checked,
      labelUserSelect: label.style.userSelect,
      inputUserSelect: input.style.userSelect,
      at: Math.round(performance.now() - started),
    });
  };
  const bind = (node: EventTarget, where: string) => {
    for (const phase of ["capture", "bubble"] as const) {
      const handler = record(where, phase);
      node.addEventListener("click", handler, phase === "capture");
      cleanups.push(() => node.removeEventListener("click", handler, phase === "capture"));
    }
  };
  bind(input, "input");
  bind(label, "label");
  bind(document, "document");

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  const phases: PressPhase[] = [];

  try {
    target.dispatchEvent(pointer("pointerdown"));
    await wait(0);
    phases.push(snap("down"));

    target.dispatchEvent(pointer("pointerup"));
    await wait(0);
    phases.push(snap("up"));

    if (options.mode === "click") {
      target.click();
      await wait(0);
      phases.push(snap("click"));
    }

    await wait(45);
    phases.push(snap("hold"));
    await wait(120);
    phases.push(snap("settled"));
    await wait(80);
    phases.push(snap("after"));
  } finally {
    for (const cleanup of cleanups) {
      cleanup();
    }
  }

  return { before, clicks, phases };
}

function expectPressCleanup(
  trace: PressTrace,
  framework: FrameworkName,
  target: GestureTarget,
  mode: GestureMode,
) {
  const detail = `${framework} ${target} ${mode}\n${JSON.stringify(trace)}`;
  const phases = trace.phases;
  expect(
    phases.map((phase) => phase.name),
    detail,
  ).toEqual(phaseNames[mode]);

  const start = phases[0];
  if (start == null) {
    throw new Error(detail);
  }
  const pressed = new Set(pressedPhaseNames[mode]);
  const done = new Set(donePhaseNames[mode]);
  const nextChecked = !start.checked;
  const labelBase = trace.before.labelUserSelect;
  const inputBase = trace.before.inputUserSelect;

  for (const phase of phases) {
    if (pressed.has(phase.name)) {
      expect(phase.pressed, detail).toBe(true);
      expect(phase.checked, detail).toBe(start.checked);
      expect(phase.labelSelected, detail).toBe(start.checked);
      expect(phase.comparison, detail).toBe(String(start.checked));
      expect(phase.labelUserSelect, detail).toBe(target === "label" ? "none" : labelBase);
      expect(phase.inputUserSelect, detail).toBe(target === "input" ? "none" : inputBase);
    } else if (done.has(phase.name)) {
      expect(phase.pressed, detail).toBe(false);
      expect(phase.checked, detail).toBe(nextChecked);
      expect(phase.labelSelected, detail).toBe(nextChecked);
      expect(phase.comparison, detail).toBe(String(nextChecked));
      expect(phase.labelUserSelect, detail).toBe(labelBase);
      expect(phase.inputUserSelect, detail).toBe(inputBase);
    }
  }
}

async function openExample(page: Page, href: string) {
  await pinComparisonTheme(page, "dark");
  await page.goto(href);
  await waitForComparisonRouteReady(page, ["react", "solid"], { paintBudgetMs: 0 });
  await clearPointer(page);
  return styledSection(page);
}

async function proveControl(page: Page, href: string, rootName: "checkbox" | "switch") {
  const section = await openExample(page, href);
  const failures: string[] = [];

  for (const framework of stacks) {
    const panel = await frameworkPanel(section, framework);
    const root = panel.locator(`[data-comparison-control-root="${rootName}"]`).first();
    await scrollLocatorIntoView(root);
    let stackFailed = false;

    for (const mode of ["timeout", "click"] as const) {
      if (stackFailed) {
        break;
      }
      for (const target of ["label", "input"] as const) {
        try {
          const trace = await root.evaluate(tracePressCleanup, { target, mode });
          expectPressCleanup(trace, framework, target, mode);
        } catch (error) {
          stackFailed = true;
          failures.push(error instanceof Error ? error.message : String(error));
          break;
        }
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join("\n\n"));
  }
}

test.describe("press cleanup timing", () => {
  test("Checkbox label and input stay pressed through pointerup, then clean up once", async ({
    page,
  }) => {
    await proveControl(page, "/components/checkbox/", "checkbox");
  });

  test("Switch label and input stay pressed through pointerup, then clean up once", async ({
    page,
  }) => {
    await proveControl(page, "/components/switch/", "switch");
  });
});
