import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import { parseParityReportOptions } from "../../scripts/report-component-parity-options";

const here = dirname(fileURLToPath(import.meta.url));
const comparisonRoot = resolve(here, "../..");
const repoRoot = resolve(comparisonRoot, "../..");

describe("component parity report options", () => {
  it("makes full-strict mode strict without a second flag", () => {
    expect(parseParityReportOptions(["--strict-full"])).toEqual({
      strict: true,
      strictFull: true,
      slugFilter: undefined,
    });
  });

  it("returns a failure for the current full backlog", () => {
    const result = spawnSync(
      resolve(repoRoot, "node_modules/.bin/tsx"),
      ["scripts/report-component-parity.ts", "--strict-full"],
      { cwd: comparisonRoot, encoding: "utf8" },
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stdout).toContain("[gap] Components that do not meet the full acceptance model");
    expect(result.stdout).toContain("STALE certified-suite postcard");
    expect(result.stdout).toContain("0f1e1198963c46eb3294744475e269a7c0041eb6");
    expect(result.stdout).toContain("HEAD certified-suite subset (not a postcard; complete=false)");
    expect(result.stdout).toContain("15ca6d4cd685289daa9666485b58fbb059f1c300");
  });
});
