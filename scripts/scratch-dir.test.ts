import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  realpathSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
// @ts-expect-error — plain-JS helper, no types
import { scratchDir } from "./scratch-dir.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const tmp = realpathSync(tmpdir());
const check = (value: string, repo = repoRoot) =>
  scratchDir("VIVIANA_X", "viviana-ui-packs-chain", { repoRoot: repo, env: { VIVIANA_X: value } });

describe("scratchDir", () => {
  it("accepts a directory under the temp directory, and defaults there", () => {
    expect(check(join(tmp, "viviana-ui-packs-chain"))).toBe(join(tmp, "viviana-ui-packs-chain"));
    expect(check(join(tmp, "viviana-ui-pack-stage-run"))).toBe(
      join(tmp, "viviana-ui-pack-stage-run"),
    );
    expect(scratchDir("VIVIANA_X", "viviana-ui-consume-smoke", { repoRoot, env: {} })).toBe(
      join(tmp, "viviana-ui-consume-smoke"),
    );
  });

  it("refuses a temp path whose last segment these scripts do not own", () => {
    expect(() => check(join(tmp, "Documents"))).toThrow(
      /its name is not one of viviana-ui-packs-chain, viviana-ui-consume-smoke, viviana-ui-pack-stage-\*/,
    );
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

it("refuses an unrelated directory when TMPDIR is widened to hold it", () => {
  const childTmp = mkdtempSync(join(tmp, "scratch-dir-wide-"));
  const home = join(childTmp, "home");
  const documents = join(home, "Documents");
  const repo = join(childTmp, "repo");
  mkdirSync(documents, { recursive: true });
  mkdirSync(join(repo, "scripts"), { recursive: true });
  for (const file of ["consume-pack-smoke.mjs", "scratch-dir.mjs"]) {
    copyFileSync(join(import.meta.dirname, file), join(repo, "scripts", file));
  }
  writeFileSync(join(documents, "sentinel"), "");

  const run = spawnSync("node", [join(repo, "scripts", "consume-pack-smoke.mjs")], {
    encoding: "utf8",
    env: { ...process.env, TMPDIR: home, VIVIANA_CONSUMER_DIR: documents },
  });

  expect(run.status).not.toBe(0);
  expect(run.stderr).toContain("VIVIANA_CONSUMER_DIR=" + documents);
  expect(run.stderr).toContain("its name is not one of");
  expect(existsSync(join(documents, "sentinel"))).toBe(true);
});

describe("pack-local-chain stage lifetime", () => {
  const stageDirs = (root: string) =>
    readdirSync(root).filter((name) => name.startsWith("viviana-ui-pack-stage-"));

  const sandbox = () => {
    const childTmp = mkdtempSync(join(tmp, "scratch-dir-stage-"));
    const repo = join(childTmp, "repo");
    mkdirSync(join(repo, "scripts"), { recursive: true });
    for (const file of ["pack-local-chain.mjs", "scratch-dir.mjs"]) {
      copyFileSync(join(import.meta.dirname, file), join(repo, "scripts", file));
    }
    writeFileSync(join(repo, "sentinel"), "");
    return { childTmp, repo };
  };

  it("deletes the ephemeral stage when the run stops", () => {
    const { childTmp, repo } = sandbox();
    const run = spawnSync("node", [join(repo, "scripts", "pack-local-chain.mjs")], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: childTmp },
    });

    expect(run.status).not.toBe(0);
    expect(stageDirs(childTmp)).toEqual([]);
    expect(existsSync(join(repo, "sentinel"))).toBe(true);
  });

  it("keeps the ephemeral stage when --keep-stage is set", () => {
    const { childTmp, repo } = sandbox();
    const run = spawnSync("node", [join(repo, "scripts", "pack-local-chain.mjs"), "--keep-stage"], {
      encoding: "utf8",
      env: { ...process.env, TMPDIR: childTmp },
    });

    expect(run.status).not.toBe(0);
    expect(run.stdout).toContain("Stage directory:");
    expect(stageDirs(childTmp)).toHaveLength(1);
    expect(existsSync(join(repo, "sentinel"))).toBe(true);
  });
});
