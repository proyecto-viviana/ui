import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  argvTargetsAxeSpec,
  assertAxeRunRequested,
  axeTestIgnore,
} from "../../e2e/require-run-axe.ts";

describe("RUN_AXE fail-closed", () => {
  it("treats a named axe spec, including a line suffix, as a request to run it", () => {
    expect(argvTargetsAxeSpec(["e2e/playground-axe.spec.ts"])).toBe(true);
    expect(argvTargetsAxeSpec(["e2e/contrast.spec.ts:40"])).toBe(true);
    expect(argvTargetsAxeSpec(["e2e/route-sweep.spec.ts", "--reporter=line"])).toBe(false);
  });

  it("fails when an axe spec is named and RUN_AXE is missing", () => {
    expect(() => assertAxeRunRequested(["e2e/playground-axe.spec.ts"], {})).toThrow(/RUN_AXE=1/);
    expect(() => assertAxeRunRequested(["e2e/contrast.spec.ts"], { RUN_AXE: "0" })).toThrow(
      /must not skip/,
    );
  });

  it("allows an axe spec when RUN_AXE=1 and ignores the env for other files", () => {
    expect(() =>
      assertAxeRunRequested(["e2e/playground-axe.spec.ts"], { RUN_AXE: "1" }),
    ).not.toThrow();
    expect(() => assertAxeRunRequested(["e2e/seo.spec.ts"], {})).not.toThrow();
  });

  it("omits the axe specs from an unfiltered run unless RUN_AXE=1", () => {
    const ignored = axeTestIgnore({}) ?? [];
    const matches = (file: string) => ignored.some((pattern) => pattern.test(file));
    expect(matches("/repo/apps/web/e2e/playground-axe.spec.ts")).toBe(true);
    expect(matches("/repo/apps/web/e2e/contrast.spec.ts")).toBe(true);
    expect(matches("/repo/apps/web/e2e/seo.spec.ts")).toBe(false);
    expect(axeTestIgnore({ RUN_AXE: "1" })).toBeUndefined();
  });

  it("keeps the axe specs from skipping themselves", () => {
    for (const file of ["e2e/playground-axe.spec.ts", "e2e/contrast.spec.ts"]) {
      const source = readFileSync(path.join(import.meta.dirname, "../../", file), "utf8");
      expect(source).not.toContain("test.skip");
      expect(source).toContain('process.env.RUN_AXE !== "1"');
    }
  });
});
