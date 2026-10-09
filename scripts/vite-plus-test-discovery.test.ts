/**
 * Ignored build output and a tracked vendor stand-in stay out of Vite Plus
 * test collection and out of the cold dependency scan. The unbounded control
 * is the pre-fix vmThreads client: discovery on, entries unset, outDir renamed
 * so `dist/` is not skipped.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";

import {
  IGNORED_DIR,
  ROOT,
  UNBOUNDED_SCAN,
  VENDOR_DIR,
  coldScanReads,
  // @ts-expect-error — plain-JS guard, no types
} from "./vite-plus-test-discovery.mjs";

const VENDOR_HTML = join(VENDOR_DIR, "page.html");
const VENDOR_JS = join(VENDOR_DIR, "widget.js");
const IGNORED_HTML = join(IGNORED_DIR, "page.html");
const IGNORED_JS = join(IGNORED_DIR, "widget.js");

function gitIgnores(path: string) {
  return spawnSync("git", ["check-ignore", "-q", "--", path], { cwd: ROOT }).status === 0;
}

beforeAll(() => {
  mkdirSync(IGNORED_DIR, { recursive: true });
  copyFileSync(VENDOR_HTML, IGNORED_HTML);
  copyFileSync(VENDOR_JS, IGNORED_JS);
});

afterAll(() => {
  rmSync(IGNORED_DIR, { recursive: true, force: true });
});

describe("Vite Plus cold test discovery", () => {
  it("keeps the vendor stand-in tracked and the dist twin ignored", () => {
    const gitignore = readFileSync(join(ROOT, ".gitignore"), "utf8");
    expect(gitignore).toMatch(/^dist\/$/m);
    expect(gitignore).toMatch(/^react-spectrum$/m);
    expect(gitIgnores("scripts/fixtures/vite-plus-discovery/vendor/page.html")).toBe(false);
    expect(gitIgnores("dist/vite-plus-discovery-ignored/page.html")).toBe(true);
    expect(readFileSync(VENDOR_HTML, "utf8")).toContain('src="./widget.js"');
    expect(readFileSync(VENDOR_JS, "utf8")).toContain("<section>out of scope</section>");
  });

  it("still reads both html pages when discovery is left unbounded", async () => {
    expect(await coldScanReads(UNBOUNDED_SCAN, ROOT, VENDOR_HTML)).toBe(true);
    expect(await coldScanReads(UNBOUNDED_SCAN, ROOT, IGNORED_HTML)).toBe(true);
    expect(await coldScanReads(UNBOUNDED_SCAN, ROOT, VENDOR_JS)).toBe(false);
    expect(await coldScanReads(UNBOUNDED_SCAN, ROOT, IGNORED_JS)).toBe(false);
  });

  it("reads only declared inputs from every package-test config", () => {
    // Resolving a Vite config from this worker bundles it with the running
    // Rolldown plugins and throws. A fresh process is the cold scan.
    const env = { ...process.env };
    for (const key of Object.keys(env)) {
      if (key.startsWith("VITEST")) delete env[key];
    }
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        [
          'import { join } from "node:path";',
          'import { IGNORED_DIR, PACKAGE_TEST_CONFIGS, VENDOR_DIR, hermeticDiscoveryProblems } from "./scripts/vite-plus-test-discovery.mjs";',
          'const fixtures = ["page.html", "widget.js"].flatMap((name) => [',
          "  join(VENDOR_DIR, name),",
          "  join(IGNORED_DIR, name),",
          "]);",
          "const problems = await hermeticDiscoveryProblems(PACKAGE_TEST_CONFIGS, fixtures);",
          'console.log("PROBLEMS " + JSON.stringify(problems));',
          "if (problems.length) process.exitCode = 1;",
        ].join("\n"),
      ],
      { cwd: ROOT, encoding: "utf8", env, timeout: 230_000 },
    );
    const line = result.stdout.split("\n").find((entry) => entry.startsWith("PROBLEMS "));
    expect(result.status, result.stderr).toBe(0);
    expect(line).toBe("PROBLEMS []");
  }, 240_000);
});
