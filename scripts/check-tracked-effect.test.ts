/**
 * A guard that has never gone red is a claim, not a proof. The planted source
 * is the red run: one real call counts, and a file the baseline does not list
 * fails. Nothing in packages/<package>/src is planted.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";
import {
  countTrackedEffectCalls,
  diffTrackedEffectCounts,
  scanTrackedEffectCounts,
} from "./check-tracked-effect";

const PLANTED = `
// createTrackedEffect(() => leftover comment)
const sample = "createTrackedEffect(() => not a call)";
createTrackedEffect(() => {
  ref();
});
`;

describe("countTrackedEffectCalls", () => {
  it("counts one real call and ignores a comment and a string", () => {
    expect(countTrackedEffectCalls(PLANTED)).toBe(1);
  });

  it("counts a property-access call", () => {
    expect(countTrackedEffectCalls("ns.createTrackedEffect(() => {\n  x();\n});\n")).toBe(1);
  });
});

describe("diffTrackedEffectCounts", () => {
  it("fails a planted file the baseline does not list", () => {
    expect(diffTrackedEffectCounts({ "packages/new/src/New.tsx": 1 }, {})).toEqual([
      "+ packages/new/src/New.tsx has 1 createTrackedEffect call and is not in the baseline",
    ]);
  });

  it("fails when a baselined file loses every call", () => {
    expect(diffTrackedEffectCounts({}, { "packages/old/src/Old.tsx": 2 })).toEqual([
      "- packages/old/src/Old.tsx has no createTrackedEffect calls; baseline still lists 2",
    ]);
  });

  it("fails when a file grows past its baseline", () => {
    expect(
      diffTrackedEffectCounts({ "packages/old/src/Old.tsx": 3 }, { "packages/old/src/Old.tsx": 1 }),
    ).toEqual(["+ packages/old/src/Old.tsx has 3 createTrackedEffect calls; baseline allows 1"]);
  });

  it("fails when a file drops below its baseline", () => {
    expect(
      diffTrackedEffectCounts({ "packages/old/src/Old.tsx": 1 }, { "packages/old/src/Old.tsx": 3 }),
    ).toEqual([
      "- packages/old/src/Old.tsx has 1 createTrackedEffect call; baseline still lists 3",
    ]);
  });
});

describe("tracked-effect baseline", () => {
  it("matches the calls still under packages/<package>/src", () => {
    const baseline = JSON.parse(readFileSync("scripts/tracked-effect-baseline.json", "utf8")) as {
      files: Record<string, number>;
    };
    expect(diffTrackedEffectCounts(scanTrackedEffectCounts(), baseline.files)).toEqual([]);
  });
});
