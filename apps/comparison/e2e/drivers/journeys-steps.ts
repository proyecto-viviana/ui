import type { Locator, Page } from "@playwright/test";
import { overlayRootLocator } from "./journeys-observe";
import type { PanelContext, TargetResolver } from "./scenario";

/**
 * Real-input steps for D13 journeys. Coordinates are viewport-relative, matching
 * `events.ts`: raw `page.mouse` so a disabled target still receives the press.
 * Click/hover/tap scroll the target into view first (the Solid panel sits below
 * the fold). Seed journeys observe overlay tracking after `scrollPage` via
 * settle/keyboard steps, not a follow-up click.
 *
 * Touch (`touchDown` / `touchUp` / `tapAt`) uses CDP `Input.dispatchTouchEvent`
 * and requires Playwright `hasTouch: true`. `registerJourneyDriver` and
 * `registerJourneyFuzz` already call `test.use({ hasTouch: true })`; a journey
 * run outside those registrars must set it or the CDP touch events are dropped.
 *
 * `clock(ms)` calls `page.clock.fastForward(ms)`. Playwright's clock must be
 * installed before navigation (`page.clock.install()`), which
 * `registerJourneyDriver` does when the journey `class` is `"timing"` (and
 * whenever a `clock` step is present). Fake timers then own page `setTimeout`
 * / `Date`; `settle(ms)` still uses real `waitForTimeout`.
 *
 * Fixture protocol (driver half; the fixture half is the #245/#246 fixture
 * prerequisite, added to both stacks in the same change — this step fails
 * loudly until they exist, it never passes by omission):
 *
 * - The fixture root exposes `data-comparison-controls` (JSON of current
 *   control values).
 * - The page exposes
 *   `window.__comparisonSetControl(stack: "react" | "solid", name: string,
 *   value: unknown): Promise<void>` that resolves after re-render.
 * - `control(name, value)` calls that hook for the driven panel's stack, then
 *   waits for `data-islands-mounted="true"` again.
 * - `submit` / `reset` click `[data-comparison-submit]` /
 *   `[data-comparison-reset]` in the driven panel.
 * - Missing hook or missing buttons throw a message that names the missing
 *   fixture protocol.
 */

export type MouseButton = "left" | "right" | "middle";
export type Modifier = "Alt" | "Control" | "Meta" | "Shift";

interface StepBase {
  label: string;
  /** Stable name for fuzz serialization; omitted from the observation diff. */
  targetId?: string;
}

export type Step =
  | (StepBase & {
      type: "click";
      target: TargetResolver;
      button?: MouseButton;
      modifiers?: readonly Modifier[];
    })
  | (StepBase & { type: "dblclick"; target: TargetResolver })
  | (StepBase & { type: "hover"; target: TargetResolver })
  | (StepBase & { type: "moveTo"; x: number; y: number })
  | (StepBase & { type: "hoverOut" })
  | (StepBase & { type: "mouseDown"; x: number; y: number })
  | (StepBase & { type: "mouseUp"; x: number; y: number })
  | (StepBase & { type: "wheel"; dx: number; dy: number; target?: TargetResolver })
  | (StepBase & {
      type: "drag";
      from: TargetResolver;
      to: TargetResolver;
      fromId?: string;
      toId?: string;
    })
  | (StepBase & { type: "press"; key: string })
  | (StepBase & { type: "type"; text: string })
  | (StepBase & { type: "tap"; target: TargetResolver })
  | (StepBase & { type: "resize"; width: number; height: number })
  | (StepBase & { type: "scrollPage"; y: number })
  | (StepBase & { type: "clock"; ms: number })
  | (StepBase & { type: "settle"; ms: number })
  | (StepBase & { type: "clickOutside" })
  | (StepBase & { type: "focus"; target: TargetResolver })
  | (StepBase & { type: "keyDown"; key: string; repeat?: number })
  | (StepBase & { type: "keyUp"; key: string })
  | (StepBase & { type: "touchDown"; target: TargetResolver })
  | (StepBase & { type: "touchUp"; target: TargetResolver })
  | (StepBase & { type: "tapAt"; target: TargetResolver; xFraction: number; yFraction: number })
  | (StepBase & { type: "dispatch"; target: TargetResolver; eventType: string })
  | (StepBase & { type: "control"; name: string; value: unknown })
  | (StepBase & { type: "submit" })
  | (StepBase & { type: "reset" })
  | (StepBase & { type: "selectOption"; name: string });

/** Overlay-scoped resolvers. Targets are roles/names/data attributes, never ids. */
export const overlay = {
  root(): TargetResolver {
    return ({ page }) => overlayRootLocator(page).first();
  },
  option(name: string): TargetResolver {
    return ({ page }) => page.getByRole("listbox").getByRole("option", { name, exact: true });
  },
  listbox(): TargetResolver {
    return ({ page }) => page.getByRole("listbox").first();
  },
  section(n: number): TargetResolver {
    return ({ page }) => page.getByRole("listbox").getByRole("group").nth(n);
  },
  dialogBackdrop(): TargetResolver {
    return ({ page }) => page.locator("[data-testid='underlay']");
  },
};

/**
 * Panel-scoped resolvers. Sentinels fail clearly when the fixture has not
 * rendered `[data-comparison-sentinel]`.
 */
export const targets = {
  before(): TargetResolver {
    return ({ canvas }) => canvas.locator('[data-comparison-sentinel="before"]');
  },
  after(): TargetResolver {
    return ({ canvas }) => canvas.locator('[data-comparison-sentinel="after"]');
  },
  field(): TargetResolver {
    return ({ canvas }) =>
      canvas
        .getByRole("group")
        .or(canvas.locator("button[aria-haspopup='listbox']").locator("xpath=ancestor::div[1]"))
        .first();
  },
  label(): TargetResolver {
    return ({ canvas }) => canvas.locator("label").first();
  },
  helpButton(): TargetResolver {
    return ({ canvas }) =>
      canvas
        .getByRole("button", { name: /help|information/i })
        .or(canvas.locator("button[aria-haspopup='dialog']"));
  },
  section(n: number): TargetResolver {
    return overlay.section(n);
  },
  dialogBackdrop(): TargetResolver {
    return overlay.dialogBackdrop();
  },
};

const MISSING_SET_CONTROL =
  "Journey control() requires the fixture protocol window.__comparisonSetControl(stack, name, value); it is not implemented on this page.";
const MISSING_SUBMIT =
  "Journey submit requires the fixture protocol [data-comparison-submit]; it is not present in this panel.";
const MISSING_RESET =
  "Journey reset requires the fixture protocol [data-comparison-reset]; it is not present in this panel.";
const MISSING_TOUCH =
  "Journey touchDown/touchUp/tapAt require Playwright hasTouch: true so CDP Input.dispatchTouchEvent is delivered. registerJourneyDriver and registerJourneyFuzz already call test.use({ hasTouch: true }).";

export async function centerOf(
  target: Locator,
  description?: string,
): Promise<{ x: number; y: number }> {
  // Same fold handling as `events.ts`: the Solid panel sits below React, so a
  // page-y below the viewport would make raw `mouse.click` miss. Seed journeys
  // never click after `scrollPage`; fuzz clicks that `scrollIntoView` are the
  // user scrolling to the control.
  if ((await target.count()) === 0) {
    throw new Error(
      description ? `Journey target ${description} is absent` : "Journey target is absent",
    );
  }
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error(
      description
        ? `Journey target ${description} has no bounding box`
        : "Journey target has no bounding box",
    );
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function requireTouch(page: Page): Promise<void> {
  const maxTouchPoints = await page.evaluate(() => navigator.maxTouchPoints);
  if (maxTouchPoints < 1) {
    throw new Error(MISSING_TOUCH);
  }
}

async function dispatchTouch(
  page: Page,
  type: "touchStart" | "touchEnd",
  point: { x: number; y: number } | null,
): Promise<void> {
  await requireTouch(page);
  const session = await page.context().newCDPSession(page);
  try {
    await session.send("Input.dispatchTouchEvent", {
      type,
      touchPoints: point ? [{ x: point.x, y: point.y }] : [],
    });
  } finally {
    await session.detach();
  }
}

async function pointInTarget(
  target: Locator,
  xFraction: number,
  yFraction: number,
  description?: string,
): Promise<{ x: number; y: number }> {
  if ((await target.count()) === 0) {
    throw new Error(
      description ? `Journey target ${description} is absent` : "Journey target is absent",
    );
  }
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error(
      description
        ? `Journey target ${description} has no bounding box`
        : "Journey target has no bounding box",
    );
  }
  return { x: box.x + box.width * xFraction, y: box.y + box.height * yFraction };
}

async function fixtureButton(
  ctx: PanelContext,
  attr: "data-comparison-submit" | "data-comparison-reset",
) {
  const inCanvas = ctx.canvas.locator(`[${attr}]`);
  if ((await inCanvas.count()) > 0) {
    return inCanvas.first();
  }
  const panel = ctx.canvas.locator("xpath=ancestor::*[contains(@class,'s2-framework-panel')][1]");
  const inPanel = panel.locator(`[${attr}]`);
  if ((await inPanel.count()) > 0) {
    return inPanel.first();
  }
  throw new Error(attr === "data-comparison-submit" ? MISSING_SUBMIT : MISSING_RESET);
}

export async function performStep(ctx: PanelContext, step: Step): Promise<void> {
  const { page } = ctx;
  switch (step.type) {
    case "click": {
      const { x, y } = await centerOf(step.target(ctx), step.targetId);
      for (const modifier of step.modifiers ?? []) {
        await page.keyboard.down(modifier);
      }
      await page.mouse.click(x, y, { button: step.button ?? "left" });
      for (const modifier of [...(step.modifiers ?? [])].reverse()) {
        await page.keyboard.up(modifier);
      }
      return;
    }
    case "dblclick": {
      const { x, y } = await centerOf(step.target(ctx), step.targetId);
      await page.mouse.dblclick(x, y);
      return;
    }
    case "hover": {
      const { x, y } = await centerOf(step.target(ctx), step.targetId);
      await page.mouse.move(x, y);
      return;
    }
    case "moveTo":
      await page.mouse.move(step.x, step.y);
      return;
    case "hoverOut":
      await page.mouse.move(4, 4);
      return;
    case "mouseDown":
      await page.mouse.move(step.x, step.y);
      await page.mouse.down();
      return;
    case "mouseUp":
      await page.mouse.move(step.x, step.y);
      await page.mouse.up();
      return;
    case "wheel": {
      if (step.target) {
        const { x, y } = await centerOf(step.target(ctx), step.targetId);
        await page.mouse.move(x, y);
      }
      await page.mouse.wheel(step.dx, step.dy);
      return;
    }
    case "drag": {
      const from = await centerOf(step.from(ctx), step.fromId);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      const to = await centerOf(step.to(ctx), step.toId);
      await page.mouse.move(to.x, to.y);
      await page.mouse.up();
      return;
    }
    case "press":
      await page.keyboard.press(step.key);
      return;
    case "type":
      await page.keyboard.type(step.text);
      return;
    case "tap": {
      const { x, y } = await centerOf(step.target(ctx), step.targetId);
      await page.touchscreen.tap(x, y);
      return;
    }
    case "resize":
      await page.setViewportSize({ width: step.width, height: step.height });
      return;
    case "scrollPage":
      await page.evaluate((y) => window.scrollTo(0, y), step.y);
      return;
    case "clock":
      // Requires `page.clock.install()` before navigation (journey class `timing`).
      await page.clock.fastForward(step.ms);
      return;
    case "settle":
      await page.waitForTimeout(step.ms);
      return;
    case "clickOutside":
      await page.mouse.click(4, 4);
      return;
    case "focus": {
      const target = step.target(ctx);
      if ((await target.count()) === 0) {
        throw new Error(
          step.targetId === "before" || step.targetId === "after"
            ? `Fixture sentinel [data-comparison-sentinel="${step.targetId}"] is absent`
            : `Journey focus target${step.targetId ? ` ${step.targetId}` : ""} is absent`,
        );
      }
      await target.focus();
      return;
    }
    case "keyDown": {
      await page.keyboard.down(step.key);
      const extra = step.repeat ?? 0;
      for (let i = 0; i < extra; i++) {
        await page.evaluate((key) => {
          const dest = document.activeElement ?? document.body;
          dest.dispatchEvent(
            new KeyboardEvent("keydown", {
              key,
              bubbles: true,
              cancelable: true,
              repeat: true,
            }),
          );
        }, step.key);
      }
      return;
    }
    case "keyUp":
      await page.keyboard.up(step.key);
      return;
    case "touchDown": {
      const point = await centerOf(step.target(ctx), step.targetId);
      await dispatchTouch(page, "touchStart", point);
      return;
    }
    case "touchUp": {
      const point = await centerOf(step.target(ctx), step.targetId);
      await dispatchTouch(page, "touchEnd", point);
      return;
    }
    case "tapAt": {
      const point = await pointInTarget(
        step.target(ctx),
        step.xFraction,
        step.yFraction,
        step.targetId,
      );
      await dispatchTouch(page, "touchStart", point);
      await dispatchTouch(page, "touchEnd", null);
      return;
    }
    case "dispatch": {
      const target = step.target(ctx);
      if ((await target.count()) === 0) {
        throw new Error(
          `Journey dispatch target${step.targetId ? ` ${step.targetId}` : ""} is absent`,
        );
      }
      await target.evaluate((el, eventType) => {
        el.dispatchEvent(new Event(eventType, { bubbles: true }));
      }, step.eventType);
      return;
    }
    case "control": {
      const available = await page.evaluate(
        () =>
          typeof (window as unknown as { __comparisonSetControl?: unknown })
            .__comparisonSetControl === "function",
      );
      if (!available) {
        throw new Error(MISSING_SET_CONTROL);
      }
      await page.evaluate(
        async ({ stack, name, value }) => {
          const hook = (
            window as unknown as {
              __comparisonSetControl: (
                stack: "react" | "solid",
                name: string,
                value: unknown,
              ) => Promise<void>;
            }
          ).__comparisonSetControl;
          await hook(stack, name, value);
        },
        { stack: ctx.framework, name: step.name, value: step.value },
      );
      await page.waitForFunction(() => {
        const mount = document.querySelector(".js-component-example-section-mount");
        return mount?.getAttribute("data-islands-mounted") === "true";
      });
      return;
    }
    case "submit": {
      await (await fixtureButton(ctx, "data-comparison-submit")).click();
      return;
    }
    case "reset": {
      await (await fixtureButton(ctx, "data-comparison-reset")).click();
      return;
    }
    case "selectOption": {
      const option = overlay.option(step.name)(ctx);
      const { x, y } = await centerOf(option, `option:${step.name}`);
      await page.mouse.click(x, y);
      return;
    }
  }
}

export type SerializedStep = {
  type: Step["type"];
  label: string;
  targetId?: string;
  fromId?: string;
  toId?: string;
  button?: MouseButton;
  modifiers?: readonly Modifier[];
  x?: number;
  y?: number;
  dx?: number;
  dy?: number;
  key?: string;
  text?: string;
  width?: number;
  height?: number;
  ms?: number;
  repeat?: number;
  eventType?: string;
  name?: string;
  value?: unknown;
  xFraction?: number;
  yFraction?: number;
};

export function serializeStep(step: Step): SerializedStep {
  const out: SerializedStep = { type: step.type, label: step.label };
  if (step.targetId) {
    out.targetId = step.targetId;
  }
  switch (step.type) {
    case "click":
      if (step.button) {
        out.button = step.button;
      }
      if (step.modifiers) {
        out.modifiers = step.modifiers;
      }
      break;
    case "moveTo":
    case "mouseDown":
    case "mouseUp":
      out.x = step.x;
      out.y = step.y;
      break;
    case "wheel":
      out.dx = step.dx;
      out.dy = step.dy;
      out.targetId = step.targetId;
      break;
    case "drag":
      out.fromId = step.fromId;
      out.toId = step.toId;
      break;
    case "press":
    case "keyDown":
    case "keyUp":
      out.key = step.key;
      if (step.type === "keyDown" && step.repeat != null) {
        out.repeat = step.repeat;
      }
      break;
    case "type":
      out.text = step.text;
      break;
    case "resize":
      out.width = step.width;
      out.height = step.height;
      break;
    case "scrollPage":
      out.y = step.y;
      break;
    case "clock":
    case "settle":
      out.ms = step.ms;
      break;
    case "dispatch":
      out.eventType = step.eventType;
      break;
    case "control":
      out.name = step.name;
      out.value = step.value;
      break;
    case "selectOption":
      out.name = step.name;
      break;
    case "tapAt":
      out.xFraction = step.xFraction;
      out.yFraction = step.yFraction;
      break;
    default:
      break;
  }
  return out;
}
