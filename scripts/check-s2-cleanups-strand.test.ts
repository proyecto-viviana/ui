/**
 * A guard that has never gone red is a claim, not a proof. These fixtures are
 * the shape `Virtualizer.tsx` had before #555 item 8 and the shape it has now.
 */
import { describe, expect, it } from "vite-plus/test";
import { findStrandedCleanupReturns } from "./check-s2-cleanups-strand";

const STRANDED = `
createTrackedEffect(() => {
  const _s2Cleanups: Array<() => void> = [];
  const node = el();
  if (!node) return;
  const frame = requestAnimationFrame(measure);
  _s2Cleanups.push(() => cancelAnimationFrame(frame));
  if (!virtualizer) return;
  return () => {
    for (const c of _s2Cleanups) c();
  };
});
`;

const RUNNER_PER_BRANCH = `
createTrackedEffect(() => {
  const _s2Cleanups: Array<() => void> = [];
  const node = el();
  if (!node) return;
  if (info != null) {
    const frame = requestAnimationFrame(measure);
    _s2Cleanups.push(() => cancelAnimationFrame(frame));
    return () => {
      for (const c of _s2Cleanups) c();
    };
  }
  const second = requestAnimationFrame(readBox);
  _s2Cleanups.push(() => cancelAnimationFrame(second));
  return () => {
    for (const c of _s2Cleanups) c();
  };
});
`;

const NESTED_RETURNS = `
createTrackedEffect(() => {
  const _s2Cleanups: Array<() => void> = [];
  const measure = () => {
    if (!isElementVisible(node)) return;
    virtualizer.updateItemSize(index, main);
  };
  _s2Cleanups.push(() => observer.disconnect());
  const later = function () {
    if (done) return;
  };
  return () => {
    for (const c of _s2Cleanups) c();
  };
});
`;

describe("findStrandedCleanupReturns", () => {
  it("flags a bare return taken after a push", () => {
    expect(findStrandedCleanupReturns(STRANDED)).toEqual([{ line: 8, pushLine: 7 }]);
  });

  it("does not flag the early return that precedes every push", () => {
    expect(findStrandedCleanupReturns(STRANDED).map((site) => site.line)).not.toContain(5);
  });

  it("allows a body that fills and runs the array once per branch", () => {
    expect(findStrandedCleanupReturns(RUNNER_PER_BRANCH)).toEqual([]);
  });

  it("ignores returns inside nested functions, which are other calls", () => {
    expect(findStrandedCleanupReturns(NESTED_RETURNS)).toEqual([]);
  });

  it("reads the real Virtualizer as clean", async () => {
    const { readFileSync } = await import("node:fs");
    const source = readFileSync("packages/solidaria-components/src/Virtualizer.tsx", "utf8");
    expect(findStrandedCleanupReturns(source, "Virtualizer.tsx")).toEqual([]);
  });
});
