import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { ProgressCircle } from "../src/progress";

/* The atoms are opaque hashes, so the only honest way to read the paint back is
 * through the stylesheet the macro emitted for this build. */
const packageRoot = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!packageRoot) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(packageRoot, "utf8");

function declarationsFor(element: Element): string {
  return element.className
    .split(/\s+/)
    .filter(Boolean)
    .map((atom) => {
      const rule = new RegExp(`\\.${atom.replace(/[-.]/g, "\\$&")}\\{([^}]*)\\}`).exec(sheet);
      return rule?.[1] ?? "";
    })
    .join(";");
}

function ring(container: HTMLElement): { wrapper: HTMLElement; blocks: HTMLElement[] } {
  const wrapper = container.querySelector<HTMLElement>('[role="progressbar"]');
  if (!wrapper) throw new Error("no progressbar rendered");
  return { wrapper, blocks: [...wrapper.querySelectorAll<HTMLElement>('[aria-hidden="true"]')] };
}

/* The two ring motions are mutually exclusive by design: a determinate ring chases its
 * leading edge, an indeterminate one spins because it has no leading edge. Wiring both
 * onto the same state beats one against the other; wiring neither leaves an
 * indeterminate ring frozen and fully lit, which reads as 100% done. */
describe("ProgressCircle motion", () => {
  it("spins the whole ring, in discrete steps, only when indeterminate", () => {
    const determinate = render(() => <ProgressCircle aria-label="Loading" value={40} />);
    const indeterminate = render(() => <ProgressCircle aria-label="Loading" isIndeterminate />);

    const spinning = declarationsFor(ring(indeterminate.container).wrapper);
    expect(spinning).toMatch(/animation-duration:\.9s/);
    expect(spinning).toMatch(/animation-timing-function:steps\(8/);
    expect(spinning).toMatch(/animation-iteration-count:infinite/);
    /* Steps, not a smooth turn: a linear spin is a different register entirely. */
    expect(spinning).not.toMatch(/animation-timing-function:(linear|ease|cubic-bezier)/);

    expect(declarationsFor(ring(determinate.container).wrapper)).not.toMatch(/animation-/);

    determinate.unmount();
    indeterminate.unmount();
  });

  it("stops the per-block blink while the ring spins", () => {
    const determinate = render(() => <ProgressCircle aria-label="Loading" value={100} />);
    const indeterminate = render(() => <ProgressCircle aria-label="Loading" isIndeterminate />);

    /* Both light every block; only the determinate one blinks them. */
    expect(declarationsFor(ring(determinate.container).blocks[0]!)).toMatch(
      /animation-name:(?!none)/,
    );
    expect(declarationsFor(ring(indeterminate.container).blocks[0]!)).toMatch(
      /animation-name:none/,
    );

    determinate.unmount();
    indeterminate.unmount();
  });

  it("keeps the stagger delay on lit blocks and off dark ones", () => {
    const { container, unmount } = render(() => <ProgressCircle aria-label="Loading" value={25} />);
    const { blocks } = ring(container);

    expect(blocks[0]?.style.animationDelay).toBe("0s");
    expect(blocks[3]?.style.animationDelay).toBe("0.48s");
    expect(blocks[15]?.style.animationDelay).toBe("");

    unmount();
  });
});
