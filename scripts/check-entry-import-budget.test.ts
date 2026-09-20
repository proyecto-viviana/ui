import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";

const GUARD = join(import.meta.dirname, "check-entry-import-budget.ts");

// The guard walks every workspace package's `src`, so a fixture root has to
// carry all of them, however empty.
const WORKSPACE_DIRS = [
  "solid-stately",
  "solidaria",
  "solidaria-components",
  "kumo",
  "geist",
  "solid-spectrum",
  "viviana-ui",
];

let root: string;

function writePackage(dir: string, name: string): void {
  mkdirSync(join(root, "packages", dir, "src"), { recursive: true });
  writeFileSync(
    join(root, "packages", dir, "package.json"),
    JSON.stringify({ name, exports: { "./Provider": "./dist/Provider.js" } }),
  );
}

function build(dir: string): void {
  mkdirSync(join(root, "packages", dir, "dist"), { recursive: true });
  writeFileSync(join(root, "packages", dir, "dist", "Provider.js"), "export const provider = 1;\n");
}

function unbuild(dir: string): void {
  rmSync(join(root, "packages", dir, "dist"), { force: true, recursive: true });
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
  for (const dir of WORKSPACE_DIRS) {
    writePackage(dir, `@proyecto-viviana/${dir === "viviana-ui" ? "ui" : dir}`);
    build(dir);
  }
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(
    join(root, "scripts", "entry-import-budget.json"),
    JSON.stringify({
      description: "fixture",
      unit: "fixture",
      entries: [
        {
          package: "@proyecto-viviana/ui",
          entry: "./Provider",
          maxModules: 9,
          maxSolidariaModules: 9,
        },
        {
          package: "@proyecto-viviana/solid-spectrum",
          entry: "./Provider",
          maxModules: 9,
          maxSolidariaModules: 9,
        },
      ],
      rootBarrelInventory: { description: "fixture", maxCount: 0, paths: [] },
    }),
  );
});

describe("check-entry-import-budget", () => {
  it("passes when every budgeted entry is built and under its ceiling", () => {
    const { status, output } = runGuard();
    expect(status).toBe(0);
    expect(output).toContain("entries measured: 2/2");
  });

  it("fails a budgeted entry that is not built, instead of skipping it", () => {
    unbuild("viviana-ui");
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("@proyecto-viviana/ui ./Provider");
    expect(output).toContain("not built");
  });

  it("still says to build first when nothing is built", () => {
    for (const dir of WORKSPACE_DIRS) unbuild(dir);
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("build the packages first");
  });
});
