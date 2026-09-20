import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import { findConfigProblems, findScriptProblems } from "./check-gate-server-reuse.mjs";

const config = (reuse: string) =>
  ["export default defineConfig({", "  webServer: {", `    ${reuse}`, "  },", "});"].join("\n");

describe("findConfigProblems", () => {
  it("names a config whose reuse decision only reads CI", () => {
    const problems = findConfigProblems(
      "apps/web/playwright.config.ts",
      config("reuseExistingServer: !process.env.CI,"),
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("apps/web/playwright.config.ts:3");
    expect(problems[0]).toContain("VIVIANA_GATE");
  });

  it("accepts a config that refuses to reuse under the gate switch", () => {
    expect(
      findConfigProblems(
        "apps/web/playwright.config.ts",
        config("reuseExistingServer: !process.env.CI && !process.env.VIVIANA_GATE,"),
      ),
    ).toEqual([]);
  });

  it("names a config that starts a server and never decides at all", () => {
    expect(
      findConfigProblems(
        "apps/web/playwright.config.ts",
        "export default defineConfig({ webServer: { command: 'vp preview' } });",
      ),
    ).toHaveLength(1);
  });

  it("leaves a config that starts no server alone", () => {
    expect(
      findConfigProblems("apps/web/playwright.config.ts", "export default defineConfig({});"),
    ).toEqual([]);
  });
});

describe("findScriptProblems", () => {
  it("names a gate script that runs Playwright without the switch", () => {
    const problems = findScriptProblems("package.json", {
      "test:seo": "vp exec --filter @proyecto-viviana/web -- playwright test e2e/seo.spec.ts",
    });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("test:seo");
  });

  it("accepts a gate script that sets the switch", () => {
    expect(
      findScriptProblems("package.json", {
        "test:seo": "VIVIANA_GATE=1 vp exec --filter @proyecto-viviana/web -- playwright test",
      }),
    ).toEqual([]);
  });

  it("leaves a script that runs no browser alone", () => {
    expect(findScriptProblems("package.json", { "test:run": "vp test run" })).toEqual([]);
  });
});
