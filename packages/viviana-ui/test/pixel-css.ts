/* The style macro emits opaque atom classes, so the only honest way to read a
 * component's paint back is through the stylesheet this build wrote. Shared by the
 * PixelMeter and TerminalLog suites. */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");

export const sheet: string = readFileSync(sheetPath, "utf8");

const REDUCED_MOTION = "@media (prefers-reduced-motion:reduce){";

/** Every top-level `@media (prefers-reduced-motion: reduce)` block's body. */
export const reducedMotionBlocks: string[] = (() => {
  const blocks: string[] = [];
  let index = 0;
  while ((index = sheet.indexOf(REDUCED_MOTION, index)) !== -1) {
    const open = index + REDUCED_MOTION.length - 1;
    let depth = 0;
    let cursor = open;
    for (; cursor < sheet.length; cursor++) {
      if (sheet[cursor] === "{") depth++;
      else if (sheet[cursor] === "}" && --depth === 0) break;
    }
    blocks.push(sheet.slice(open + 1, cursor));
    index = cursor;
  }
  return blocks;
})();

function atomsOf(element: Element): string[] {
  return element.className.split(/\s+/).filter(Boolean);
}

function declarationsIn(source: string, element: Element): string {
  return atomsOf(element)
    .map((atom) => {
      const rule = new RegExp(`\\.${atom.replace(/[-.]/g, "\\$&")}\\{([^}]*)\\}`).exec(source);
      return rule?.[1] ?? "";
    })
    .filter(Boolean)
    .join(";");
}

/* Reduced-motion overrides are separate atom classes that only exist inside the
 * media blocks, so the base lookup must not see them — otherwise a component whose
 * motion IS gated reads back as `animation-name:none` unconditionally. */
const baseSheet = reducedMotionBlocks.reduce((acc, block) => acc.split(block).join(""), sheet);

/** The declarations this element's atoms carry outside any media query. */
export function declarationsFor(element: Element): string {
  return declarationsIn(baseSheet, element);
}

/** The declarations this element's atoms carry under reduced motion. */
export function reducedMotionDeclarationsFor(element: Element): string {
  return reducedMotionBlocks.map((block) => declarationsIn(block, element)).join(";");
}
