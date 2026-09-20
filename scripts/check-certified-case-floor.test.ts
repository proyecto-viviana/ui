import { describe, expect, it } from "vite-plus/test";

// prettier-ignore
// @ts-expect-error — plain-JS guard, no types
import { countCasesByFile, diffCaseFloor, parseListingStdout } from "./check-certified-case-floor.mjs";

const report = {
  suites: [
    {
      file: "certified/accordion.certified.spec.ts",
      specs: [{ title: "a" }],
      suites: [
        {
          file: "drivers/focus.ts",
          specs: [{ title: "b" }, { title: "c" }],
          suites: [{ file: "drivers/ax.ts", specs: [{ title: "d" }] }],
        },
      ],
    },
    { file: "certified/button.certified.spec.ts", specs: [{ title: "e" }], suites: [] },
  ],
};

describe("countCasesByFile", () => {
  it("counts nested cases against the spec file, not the driver that declares them", () => {
    expect(countCasesByFile(report)).toEqual({
      "certified/accordion.certified.spec.ts": 4,
      "certified/button.certified.spec.ts": 1,
    });
  });

  it("counts nothing for an empty report", () => {
    expect(countCasesByFile({ suites: [] })).toEqual({});
  });
});

describe("diffCaseFloor", () => {
  const floor = { "a.spec.ts": 4, "b.spec.ts": 1 };

  it("passes counts that match the floor exactly", () => {
    expect(diffCaseFloor({ "a.spec.ts": 4, "b.spec.ts": 1 }, floor)).toEqual({
      missing: [],
      shrunk: [],
      grown: [],
      added: [],
    });
  });

  it("fails a spec file that no longer discovers anything", () => {
    const diff = diffCaseFloor({ "a.spec.ts": 4 }, floor);
    expect(diff.missing).toEqual([{ file: "b.spec.ts", expected: 1 }]);
    expect(diff.shrunk).toEqual([]);
  });

  it("fails a spec file that lost a case", () => {
    const diff = diffCaseFloor({ "a.spec.ts": 3, "b.spec.ts": 1 }, floor);
    expect(diff.shrunk).toEqual([{ file: "a.spec.ts", expected: 4, found: 3 }]);
  });

  it("reports growth without failing", () => {
    const diff = diffCaseFloor({ "a.spec.ts": 5, "b.spec.ts": 1 }, floor);
    expect(diff.grown).toEqual([{ file: "a.spec.ts", expected: 4, found: 5 }]);
    expect(diff.missing).toEqual([]);
    expect(diff.shrunk).toEqual([]);
  });

  it("reports a spec file the floor does not know yet", () => {
    const diff = diffCaseFloor({ "a.spec.ts": 4, "b.spec.ts": 1, "c.spec.ts": 2 }, floor);
    expect(diff.added).toEqual([{ file: "c.spec.ts", found: 2 }]);
    expect(diff.missing).toEqual([]);
  });

  it("does not let growth elsewhere hide a loss", () => {
    const diff = diffCaseFloor({ "a.spec.ts": 40, "b.spec.ts": 0 }, floor);
    expect(diff.shrunk).toEqual([{ file: "b.spec.ts", expected: 1, found: 0 }]);
    expect(diff.grown).toEqual([{ file: "a.spec.ts", expected: 4, found: 40 }]);
  });
});

describe("parseListingStdout", () => {
  it("skips the pnpm banner that precedes the report", () => {
    expect(parseListingStdout('Scope: all 12 workspace projects\n{"suites":[]}\n')).toEqual({
      suites: [],
    });
  });

  it("throws when nothing on stdout is a report", () => {
    expect(() => parseListingStdout("Scope: all 12 workspace projects\n")).toThrow(
      /printed no JSON report/,
    );
  });
});
