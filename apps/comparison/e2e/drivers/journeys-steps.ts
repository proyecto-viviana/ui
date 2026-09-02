import type { Locator } from "@playwright/test";
import type { PanelContext, TargetResolver } from "./scenario";

/**
 * Real-input steps for D13 journeys. Coordinates are viewport-relative, matching
 * `events.ts`: raw `page.mouse` so a disabled target still receives the press.
 * Click/hover/tap scroll the target into view first (the Solid panel sits below
 * the fold). Seed journeys observe overlay tracking after `scrollPage` via
 * settle/keyboard steps, not a follow-up click.
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
  | (StepBase & { type: "clickOutside" });

export async function centerOf(target: Locator): Promise<{ x: number; y: number }> {
  // Same fold handling as `events.ts`: the Solid panel sits below React, so a
  // page-y below the viewport would make raw `mouse.click` miss. Seed journeys
  // never click after `scrollPage`; fuzz clicks that `scrollIntoView` are the
  // user scrolling to the control.
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) {
    throw new Error("Journey target has no bounding box");
  }
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

export async function performStep(ctx: PanelContext, step: Step): Promise<void> {
  const { page } = ctx;
  switch (step.type) {
    case "click": {
      const { x, y } = await centerOf(step.target(ctx));
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
      const { x, y } = await centerOf(step.target(ctx));
      await page.mouse.dblclick(x, y);
      return;
    }
    case "hover": {
      const { x, y } = await centerOf(step.target(ctx));
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
        const { x, y } = await centerOf(step.target(ctx));
        await page.mouse.move(x, y);
      }
      await page.mouse.wheel(step.dx, step.dy);
      return;
    }
    case "drag": {
      const from = await centerOf(step.from(ctx));
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      const to = await centerOf(step.to(ctx));
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
      const { x, y } = await centerOf(step.target(ctx));
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
      await page.clock.fastForward(step.ms);
      return;
    case "settle":
      await page.waitForTimeout(step.ms);
      return;
    case "clickOutside":
      await page.mouse.click(4, 4);
      return;
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
      out.key = step.key;
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
    default:
      break;
  }
  return out;
}
