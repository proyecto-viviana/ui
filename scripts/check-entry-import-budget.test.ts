import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";

const GUARD = join(import.meta.dirname, "check-entry-import-budget.ts");

// The guard walks every workspace package's `src`, so a fixture root has to
// carry all of them, however empty.
const WORKSPACE_PACKAGES: Record<string, string> = {
  "solid-stately": "@proyecto-viviana/solid-stately",
  solidaria: "@proyecto-viviana/solidaria",
  "solidaria-components": "@proyecto-viviana/solidaria-components",
  kumo: "@proyecto-viviana/kumo",
  geist: "@proyecto-viviana/geist",
  "solid-spectrum": "@proyecto-viviana/solid-spectrum",
  "viviana-ui": "@proyecto-viviana/ui",
};

let root: string;

// Every `exports` target in this repository points into `dist/`, and the guard
// maps that target back to the source file it is emitted from: strip `dist/`
// and the extension, look under `src/`. So a fixture publishes `dist/` targets
// and writes no `dist/` at all — the unit is the source graph, and a build
// changes nothing about it (#566). This fixture is what the ceiling measures.
function writePackage(dir: string, exports: Record<string, string>): void {
  mkdirSync(join(root, "packages", dir, "src"), { recursive: true });
  writeFileSync(
    join(root, "packages", dir, "package.json"),
    JSON.stringify({ name: WORKSPACE_PACKAGES[dir], exports }),
  );
}

function writeSource(dir: string, file: string, code: string): void {
  const absolute = join(root, "packages", dir, "src", file);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, code);
}

function removeSource(dir: string, file: string): void {
  rmSync(join(root, "packages", dir, "src", file), { force: true });
}

function writeBudget(
  entries: { package: string; entry: string; maxModules: number; maxSolidariaModules: number }[],
): void {
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(
    join(root, "scripts", "entry-import-budget.json"),
    JSON.stringify({
      description: "fixture",
      unit: "fixture",
      entries,
      rootBarrelInventory: { description: "fixture", maxCount: 0, paths: [] },
    }),
  );
}

function runGuard(): { status: number; output: string } {
  try {
    return {
      status: 0,
      output: execFileSync("node", ["--experimental-strip-types", GUARD], {
        cwd: root,
        encoding: "utf8",
      }),
    };
  } catch (error) {
    const failure = error as { status: number; stdout: string; stderr: string };
    return { status: failure.status, output: `${failure.stdout}${failure.stderr}` };
  }
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "entry-budget-"));
  for (const dir of Object.keys(WORKSPACE_PACKAGES)) {
    writePackage(dir, { "./Provider": "./dist/Provider.js" });
    writeSource(dir, "Provider.ts", "export const provider = 1;\n");
  }
  // A narrow subpath for the budgeted entry to reach across the workspace with:
  // the guard resolves a workspace bare specifier through the imported
  // package's own `exports` map, so `solidaria/i18n` costs one solidaria
  // module, which is the distinction the two ceilings exist to hold.
  writePackage("solidaria", {
    "./Provider": "./dist/Provider.js",
    "./i18n": "./dist/i18n.js",
  });
  writeSource("solidaria", "i18n.ts", "export const locale = 1;\n");
  writeSource(
    "viviana-ui",
    "Provider.ts",
    'import { context } from "./context";\n' +
      'import { locale } from "@proyecto-viviana/solidaria/i18n";\n' +
      "export const provider = [context, locale];\n",
  );
  writeSource("viviana-ui", "context.ts", "export const context = 1;\n");
  // Exactly the graphs above: ui ./Provider reaches Provider, context and
  // solidaria's i18n; solid-spectrum ./Provider reaches only itself.
  writeBudget([
    { package: "@proyecto-viviana/ui", entry: "./Provider", maxModules: 3, maxSolidariaModules: 1 },
    {
      package: "@proyecto-viviana/solid-spectrum",
      entry: "./Provider",
      maxModules: 1,
      maxSolidariaModules: 0,
    },
  ]);
});

describe("check-entry-import-budget", () => {
  it("passes when every budgeted entry's source graph is within its ceiling", () => {
    const { status, output } = runGuard();
    expect(status).toBe(0);
    expect(output).toContain("entries measured: 2/2");
    expect(output).toContain("entry import budget OK.");
  });

  it("fails a budgeted entry whose source graph outgrows its ceiling", () => {
    writeSource("viviana-ui", "extra.ts", "export const extra = 1;\n");
    writeSource(
      "viviana-ui",
      "Provider.ts",
      'import { context } from "./context";\n' +
        'import { extra } from "./extra";\n' +
        'import { locale } from "@proyecto-viviana/solidaria/i18n";\n' +
        "export const provider = [context, extra, locale];\n",
    );
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("entry import budget FAILED");
    expect(output).toContain("@proyecto-viviana/ui ./Provider: 4 modules, ceiling 3");
  });

  it("fails a budgeted entry whose published target maps to no source file, instead of skipping it", () => {
    removeSource("viviana-ui", "Provider.ts");
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("budgeted target(s) resolve to no source file");
    expect(output).toContain("@proyecto-viviana/ui ./Provider (exports ./dist/Provider.js)");
    expect(output).toContain("Fix the exports map or the specifier");
    // An unresolvable target removes everything behind it from the count, so it
    // may never read as a pass on the entries it silently drops.
    expect(output).not.toContain("entry import budget OK.");
    expect(output).not.toContain("entries measured");
  });
});
