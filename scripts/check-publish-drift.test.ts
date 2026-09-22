import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { type AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

const GUARD = join(import.meta.dirname, "check-publish-drift.mjs");

let root: string;

/**
 * What the registry serves, per package name: its dist-tags, or `{ body }` for
 * the answers a dist-tag map cannot express — a packument with no `dist-tags`
 * at all, or one with no versions. `null` is a 404, a name the registry has
 * never heard of.
 *
 * The guard reads the registry, so these contracts hand it one they control
 * through `npm_config_registry`, npm's own variable. The runs below are async
 * for that reason: `execFileSync` would block this process's event loop and the
 * server would never answer.
 */
type Served = Record<string, string> | { body: unknown } | null;

let served: Record<string, Served>;
let registryUrl: string;
let server: Server;

function git(...args: string[]): void {
  execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

/** The published-file list the five real manifests carry, minus the ones this fixture has no use for. */
const FILES = ["dist", "src", "LICENSE", "NOTICE"];

function writeManifest(exports: Record<string, string>, version = "1.0.0"): void {
  writeFileSync(
    join(root, "packages", "a", "package.json"),
    `${JSON.stringify({ name: "@scope/a", version, files: FILES, exports }, null, 2)}\n`,
  );
}

/** What `changeset version` writes: the new version and its CHANGELOG entry. */
function bumpTo(version: string): void {
  writeManifest({ ".": "./src/index.ts" }, version);
  writeFileSync(join(root, "packages", "a", "CHANGELOG.md"), `# @scope/a\n\n## ${version}\n`);
}

function changeset(id: string, bump = "minor"): void {
  writeFileSync(join(root, ".changeset", `${id}.md`), `---\n"@scope/a": ${bump}\n---\n\nwork\n`);
}

/** `changeset pre enter <tag>`: the release tag moves off `latest`. */
function preEnter(tag: string, consumed: string[] = []): void {
  writeFileSync(
    join(root, ".changeset", "pre.json"),
    JSON.stringify({ mode: "pre", tag, initialVersions: {}, changesets: consumed }),
  );
}

function runGuard(
  registry = registryUrl,
  args: string[] = [],
): Promise<{ status: number | null; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [GUARD, ...args], {
      cwd: root,
      env: { ...process.env, npm_config_registry: registry },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (status) => resolve({ status, output }));
  });
}

beforeAll(async () => {
  server = createServer((request, response) => {
    const name = decodeURIComponent(request.url ?? "").replace(/^\//, "");
    const entry = served[name];
    if (!entry) {
      response.writeHead(404, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Not found" }));
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    if ("body" in entry) {
      response.end(JSON.stringify(entry.body));
      return;
    }
    const versions = Object.fromEntries(Object.values(entry).map((v) => [v, { name, version: v }]));
    response.end(JSON.stringify({ name, "dist-tags": entry, versions }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  registryUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => {
  server.close();
});

beforeEach(() => {
  // The published state the fixture starts from: the registry serves exactly
  // the version the tree carries.
  served = { "@scope/a": { latest: "1.0.0" } };
  root = mkdtempSync(join(tmpdir(), "publish-drift-"));
  mkdirSync(join(root, "packages", "a", "src"), { recursive: true });
  mkdirSync(join(root, ".changeset"), { recursive: true });
  writeFileSync(join(root, ".changeset", "config.json"), JSON.stringify({ ignore: [] }));
  writeManifest({ ".": "./src/index.ts" });
  writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 1;\n");
  // Shipped beside `src`: README.md whatever `files` says, NOTICE because the
  // manifest names it.
  writeFileSync(join(root, "packages", "a", "README.md"), "# @scope/a\n");
  writeFileSync(join(root, "packages", "a", "NOTICE"), "notice\n");
  // `changeset version` writes CHANGELOG.md; its last commit is the last bump.
  writeFileSync(join(root, "packages", "a", "CHANGELOG.md"), "# @scope/a\n\n## 1.0.0\n");
  git("init", "-q", ".");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  git("add", "-A");
  git("commit", "-qm", "release 1.0.0");
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("check-publish-drift", () => {
  it("passes a tree with nothing unreleased", async () => {
    expect((await runGuard()).status).toBe(0);
  });

  it("fails a new exports subpath that no changeset publishes", async () => {
    writeManifest({ ".": "./src/index.ts", "./extra": "./src/extra.ts" });
    git("add", "-A");
    git("commit", "-qm", "new subpath");
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/package.json");
  });

  it("passes that same subpath once a changeset names the package", async () => {
    writeManifest({ ".": "./src/index.ts", "./extra": "./src/extra.ts" });
    changeset("extra");
    git("add", "-A");
    git("commit", "-qm", "new subpath with changeset");
    expect((await runGuard()).status).toBe(0);
  });

  it("still fails an unreleased source change", async () => {
    writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 2;\n");
    git("add", "-A");
    git("commit", "-qm", "source change");
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/src/index.ts");
  });

  // #598 review: the diff walked `src` and the manifest under a comment saying
  // `files` was `["dist", "src"]`. It is not, for any of the five — and npm
  // ships README.md whatever `files` says.
  it("fails a README rewritten after the bump, which npm ships whatever `files` says", async () => {
    writeFileSync(join(root, "packages", "a", "README.md"), "# @scope/a\n\nrewritten\n");
    git("add", "-A");
    git("commit", "-qm", "rewrite the README");
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/README.md");
  });

  it("fails a change to a file the manifest's own `files` ships", async () => {
    writeFileSync(join(root, "packages", "a", "NOTICE"), "notice, revised\n");
    git("add", "-A");
    git("commit", "-qm", "revise the NOTICE");
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/NOTICE");
  });

  it("ignores a change no tarball carries", async () => {
    mkdirSync(join(root, "packages", "a", "test"), { recursive: true });
    writeFileSync(join(root, "packages", "a", "test", "a.test.ts"), "// a test\n");
    git("add", "-A");
    git("commit", "-qm", "a test");
    expect((await runGuard()).status).toBe(0);
  });

  // #598: the boundary. Before it, the diff started after the last CHANGELOG
  // commit — the bump itself — so a bump whose publish never ran read as clean.
  it("fails a bump the registry never received once a changeset is stacked on it", async () => {
    bumpTo("1.1.0");
    git("add", "-A");
    git("commit", "-qm", "version packages");
    changeset("queued");
    git("add", "-A");
    git("commit", "-qm", "more work, queued");

    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("@scope/a@1.1.0");
    expect(output).toContain("the registry serves 1.0.0 under `latest`");
    // The files the published tarball does not carry, measured from the commit
    // that set the published version — not from the unpublished bump.
    expect(output).toContain("packages/a/package.json");
  });

  it("accepts that same tree once the registry serves the bumped version", async () => {
    bumpTo("1.1.0");
    git("add", "-A");
    git("commit", "-qm", "version packages");
    changeset("queued");
    git("add", "-A");
    git("commit", "-qm", "more work, queued");

    served["@scope/a"] = { latest: "1.1.0" };
    const { status, output } = await runGuard();
    expect(status).toBe(0);
    expect(output).toContain("No publish drift");
  });

  // The narrowing #598 asked for: a pending changeset answers "will this reach
  // npm", not "was the version in the tree ever published". Before it, this
  // skip swallowed every releasable package at once.
  it("does not let a changeset excuse the unpublished bump it sits on", async () => {
    bumpTo("1.1.0");
    git("add", "-A");
    git("commit", "-qm", "version packages");
    writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 2;\n");
    changeset("covers-the-source-change");
    git("add", "-A");
    git("commit", "-qm", "source change with changeset");

    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("a pending changeset is queued on top of that bump");
  });

  // The release job publishes from exactly this commit: version bumped,
  // changesets consumed, nothing stacked. Failing it would make the publish
  // this guard exists to protect impossible.
  it("accepts a bump still in flight, with nothing stacked on it", async () => {
    bumpTo("1.1.0");
    git("add", "-A");
    git("commit", "-qm", "version packages");

    const { status, output } = await runGuard();
    expect(status).toBe(0);
    expect(output).toContain("No publish drift");
  });

  // #598 second review: in `release.yml` this guard runs before
  // `changesets/action`, whose version stage consumes exactly these changesets
  // into the next bump. Refusing there refuses the remedy — measured on `main`
  // at 25820f92, where the step failed all five packages on this state and the
  // version PR that clears it could never be written.
  it("defers that same tree to the version stage, which is what consumes the changeset", async () => {
    bumpTo("1.1.0");
    git("add", "-A");
    git("commit", "-qm", "version packages");
    writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 2;\n");
    changeset("covers-the-source-change");
    git("add", "-A");
    git("commit", "-qm", "source change with changeset");

    const { status, output } = await runGuard(registryUrl, ["--version-stage"]);
    expect(status).toBe(0);
    expect(output).toContain("deferred to the version stage");
  });

  it("defers nothing else in the version stage: a change no changeset publishes still fails", async () => {
    writeManifest({ ".": "./src/index.ts", "./extra": "./src/extra.ts" });
    git("add", "-A");
    git("commit", "-qm", "new subpath");
    const { status, output } = await runGuard(registryUrl, ["--version-stage"]);
    expect(status).toBe(1);
    expect(output).toContain("packages/a/package.json");
  });

  it("defers nothing else in the version stage: a tree behind the registry still fails", async () => {
    served["@scope/a"] = { latest: "2.0.0" };
    const { status, output } = await runGuard(registryUrl, ["--version-stage"]);
    expect(status).toBe(1);
    expect(output).toContain("not the tree that was released");
  });

  it("reads the prerelease tag, and ignores changesets the prerelease consumed", async () => {
    preEnter("rc", ["queued"]);
    changeset("queued");
    bumpTo("1.1.0-rc.0");
    git("add", "-A");
    git("commit", "-qm", "enter rc and version");

    // `latest` deliberately stays on the last stable during a prerelease.
    served["@scope/a"] = { latest: "1.0.0", rc: "1.1.0-rc.0" };
    const { status, output } = await runGuard();
    expect(status).toBe(0);
    expect(output).toContain("No publish drift");
  });

  // #598 review: `changeset pre enter rc` moves the tag to one npm serves for
  // no package that has never had a prerelease. Reading only that tag turned
  // the unpublished-bump check off for every package at once — on exactly the
  // skew this guard was opened for.
  it("falls back to `latest` when the registry serves nothing under the prerelease tag", async () => {
    preEnter("rc");
    bumpTo("1.1.0-rc.0");
    git("add", "-A");
    git("commit", "-qm", "enter rc and version");
    writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 2;\n");
    changeset("queued");
    git("add", "-A");
    git("commit", "-qm", "more work, queued");

    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("@scope/a@1.1.0-rc.0");
    expect(output).toContain("the registry serves 1.0.0 under `latest`");
    expect(output).toContain("no `rc` release yet");
  });

  // #598 review: equality is not direction. A tree behind the registry is
  // exactly the sentence this guard headlines, and it used to read as clean.
  it("fails a tree behind what the registry serves", async () => {
    served["@scope/a"] = { latest: "2.0.0" };
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("the registry serves 2.0.0 under `latest`, ahead of the 1.0.0");
    expect(output).toContain("not the tree that was released");
  });

  it("does not diagnose a tree behind the registry as an unpublished bump", async () => {
    changeset("queued");
    git("add", "-A");
    git("commit", "-qm", "more work, queued");

    served["@scope/a"] = { latest: "2.0.0" };
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("not the tree that was released");
    expect(output).not.toContain("Publish the bump before stacking more on it");
  });

  it("says so when neither version can be ordered", async () => {
    served["@scope/a"] = { latest: "nightly" };
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("cannot be ordered as semver");
  });

  it("says so when the registry has no version of the package at all", async () => {
    served["@scope/a"] = null;
    const { status, output } = await runGuard();
    expect(status).toBe(0);
    expect(output).toContain("no published version");
  });

  it("takes an empty packument as never published", async () => {
    served["@scope/a"] = { body: { name: "@scope/a", "dist-tags": {}, versions: {} } };
    const { status, output } = await runGuard();
    expect(status).toBe(0);
    expect(output).toContain("no published version");
  });

  it("refuses to answer when the registry cannot be read", async () => {
    // Port 1 on loopback: nothing listens, so the read fails rather than 404s.
    const { status, output } = await runGuard("http://127.0.0.1:1");
    expect(status).toBe(1);
    expect(output).toContain("registry could not be read");
  });

  // #598 review: a proxy that answers 404-as-200, or a packument served without
  // dist-tags, is an answer this guard cannot use — not a package that was
  // never published.
  it("refuses a 200 that carries no dist-tags", async () => {
    bumpTo("9.9.9");
    git("add", "-A");
    git("commit", "-qm", "version packages");
    changeset("queued");
    git("add", "-A");
    git("commit", "-qm", "more work, queued");

    served["@scope/a"] = { body: { name: "@scope/a" } };
    const { status, output } = await runGuard();
    expect(status).toBe(1);
    expect(output).toContain("registry could not be read");
    expect(output).toContain("dist-tags");
  });
});
