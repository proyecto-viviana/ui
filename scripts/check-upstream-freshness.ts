/**
 * guard:upstream-freshness — warn when Adobe has shipped a React Aria Components
 * or React Spectrum S2 release newer than our pinned oracle.
 *
 * The pin (scripts/upstream-pin.json) and the vendored ./react-spectrum tree are
 * deliberately fixed at one release so parity work has a stable target — but
 * nothing tells us when that target goes stale. A new Adobe release can land and
 * sit unnoticed for weeks. This guard asks GitHub for the latest RAC + S2 tags
 * and compares them to the pin:
 *   - exit 0, "up to date" when the pin == latest, or when the remote is
 *     unreachable (never cry wolf on a CI/network blip);
 *   - exit 1, "behind" when a newer release exists — naming the gap and pointing
 *     at the absorb playbook (.claude/current/upstream-sync.md).
 *
 * It runs report-only in certification-gates.yml (continue-on-error), so "behind"
 * surfaces as a ❌ cell — a visible nudge, not a blocked build. Run it standalone
 * anytime: `vp run guard:upstream-freshness`.
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPO = "https://github.com/adobe/react-spectrum";
/** The two packages we mirror; Adobe tags both on one release-train commit. */
const PACKAGES = ["react-aria-components", "@react-spectrum/s2"] as const;

interface Pin {
  release: string;
  tags: Record<string, string>;
}

const pin: Pin = JSON.parse(
  readFileSync(path.join(ROOT, "scripts", "upstream-pin.json"), "utf8"),
);

type SemVer = [number, number, number];

/** Parse a strict `major.minor.patch`; null for pre-releases / non-semver. */
function parse(v: string): SemVer | null {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

function cmp(a: SemVer, b: SemVer): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

/** Highest stable tag for `pkg` in the `git ls-remote` output, or null. */
function latestTag(remoteLines: string[], pkg: string): string | null {
  const prefix = `refs/tags/${pkg}@`;
  let best: { v: SemVer; raw: string } | null = null;
  for (const line of remoteLines) {
    const ref = line.split("\t")[1];
    // Skip peeled annotated-tag refs (`…^{}`) and anything off-prefix.
    if (!ref || !ref.startsWith(prefix) || ref.endsWith("^{}")) continue;
    const raw = ref.slice(prefix.length);
    const v = parse(raw);
    if (!v) continue; // pre-release / non-semver — ignore
    if (!best || cmp(v, best.v) > 0) best = { v, raw };
  }
  return best?.raw ?? null;
}

let remote: string;
try {
  remote = execSync(`git ls-remote --tags ${REPO}`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 30_000,
  });
} catch {
  console.log("Upstream freshness check");
  console.log(
    "- could not reach the Adobe remote (offline?) — skipping, treated as up to date.",
  );
  process.exit(0);
}

const lines = remote.split("\n");
console.log("Upstream freshness check");
console.log(`- pinned release: ${pin.release}`);

let behind = false;
for (const pkg of PACKAGES) {
  const pinned = pin.tags[pkg];
  const newest = latestTag(lines, pkg);
  const pinnedV = pinned ? parse(pinned) : null;
  const newestV = newest ? parse(newest) : null;
  if (!newest || !newestV || !pinnedV) {
    console.log(`- ${pkg}: pinned ${pinned ?? "?"} — latest unknown (skipped)`);
    continue;
  }
  if (cmp(newestV, pinnedV) > 0) {
    behind = true;
    console.log(`- ${pkg}: pinned ${pinned}  →  ⚠ NEWER AVAILABLE: ${newest}`);
  } else {
    console.log(`- ${pkg}: pinned ${pinned} — up to date (latest ${newest})`);
  }
}

if (behind) {
  console.log("");
  console.log("A newer upstream release exists. Absorb it via the playbook:");
  console.log(
    '  .claude/current/upstream-sync.md  →  "Absorbing a new upstream release"',
  );
  process.exit(1);
}

console.log("\n✓ pin is current with the latest Adobe release.");
process.exit(0);
