import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { scratchDir } from "./scratch-dir.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const tmp = realpathSync(tmpdir());
const check = (value: string, repo = repoRoot) =>
  scratchDir("VIVIANA_X", "fallback", { repoRoot: repo, env: { VIVIANA_X: value } });

describe("scratchDir", () => {
  it("accepts a directory under the temp directory, and defaults there", () => {
    expect(check(join(tmp, "packs"))).toBe(join(tmp, "packs"));
    expect(scratchDir("VIVIANA_X", "fallback", { repoRoot, env: {} })).toBe(join(tmp, "fallback"));
  });

  it("refuses the repository root and anything holding it", () => {
    expect(() => check(repoRoot)).toThrow(/refused/);
    expect(() => check(resolve(repoRoot, ".."))).toThrow(/refused/);
    expect(() => check("/")).toThrow(/refused/);
  });

  it("refuses the temp directory itself and a `..` walk out of it", () => {
    expect(() => check(tmp)).toThrow(/not inside the temp directory/);
    expect(() => check(join(tmp, "a", "..", ".."))).toThrow(/not inside the temp directory/);
  });

  it("refuses a repository that lives under the temp directory, and paths inside it", () => {
    const repo = mkdtempSync(join(tmp, "scratch-dir-repo-"));
    expect(() => check(repo, repo)).toThrow(/contains the repository/);
    expect(() => check(join(repo, "packs"), repo)).toThrow(/inside the repository/);
  });

  it("follows a symlink under the temp directory to where it really points", () => {
    const link = join(mkdtempSync(join(tmp, "scratch-dir-link-")), "out");
    symlinkSync(repoRoot, link);
    expect(() => check(link)).toThrow(/refused/);
  });
});

// Each script is copied into a throwaway repository that sits inside a
// throwaway TMPDIR, then pointed at that repository's root. A refusal that
// regressed could only delete the copy.
describe.each([
  ["VIVIANA_PACK_OUT", "pack-local-chain.mjs"],
  ["VIVIANA_PACK_STAGE", "pack-local-chain.mjs"],
  ["VIVIANA_CONSUMER_DIR", "consume-pack-smoke.mjs"],
])("%s", (variable, script) => {
  it(`refuses the repository root before ${script} deletes anything`, () => {
    const childTmp = mkdtempSync(join(tmp, "scratch-dir-sandbox-"));
    const repo = join(childTmp, "repo");
    mkdirSync(join(repo, "scripts"), { recursive: true });
    for (const file of [script, "scratch-dir.mjs"]) {
      copyFileSync(join(import.meta.dirname, file), join(repo, "scripts", file));
    }
    writeFileSync(join(repo, "sentinel"), "");

    const run = spawnSync("node", [join(repo, "scripts", script)], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: childTmp, [variable]: repo },
    });

    expect(run.status).not.toBe(0);
    expect(run.stderr).toContain(`${variable}=${repo} refused: it contains the repository`);
    expect(existsSync(join(repo, "sentinel"))).toBe(true);
  });
});
