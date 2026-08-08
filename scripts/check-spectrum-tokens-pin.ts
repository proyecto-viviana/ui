/**
 * guard:spectrum-tokens-pin — keep our `@adobe/spectrum-tokens` on the exact
 * version the pinned upstream S2 builds against.
 *
 * solid-spectrum imports the token JSON at runtime
 * (packages/solid-spectrum/src/style/tokens.ts), while upstream S2 bakes it in
 * at build time from an exact devDependency. A floating range here let our
 * tokens drift five minor releases ahead of the oracle before anyone noticed
 * (357 used token values differed) — colors silently diverge from the pin with
 * every install. This guard compares three declarations:
 *   - our spec in packages/solid-spectrum/package.json (must be exact, no ^/~);
 *   - the version actually installed for solid-spectrum (skipped with a note
 *     when node_modules is absent — an install gap, not drift);
 *   - the vendored oracle's devDependency in
 *     react-spectrum/packages/@react-spectrum/s2/package.json.
 * Exit 1 on any mismatch or a non-exact spec; exit 0 otherwise. Run it
 * standalone anytime: `vp run guard:spectrum-tokens-pin`.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PKG = "@adobe/spectrum-tokens";

function readJson(p: string): any {
  return JSON.parse(readFileSync(p, "utf8"));
}

/** Exact `major.minor.patch` only — ranges and pre-releases fail the guard. */
function isExact(spec: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(spec);
}

console.log("Spectrum tokens pin check");

const ourManifest = path.join(ROOT, "packages", "solid-spectrum", "package.json");
const ourSpec: string | undefined = readJson(ourManifest).dependencies?.[PKG];

let failed = false;

if (!ourSpec) {
  console.log(`- solid-spectrum no longer declares ${PKG} — update or delete this guard.`);
  failed = true;
} else if (!isExact(ourSpec)) {
  console.log(
    `- solid-spectrum declares ${PKG}@${ourSpec} — must be an exact version so installs cannot drift from the oracle.`,
  );
  failed = true;
} else {
  console.log(`- solid-spectrum declares ${PKG}@${ourSpec} (exact) ✓`);
}

const installedManifest = path.join(
  ROOT,
  "packages",
  "solid-spectrum",
  "node_modules",
  PKG,
  "package.json",
);
if (!existsSync(installedManifest)) {
  console.log(`- installed copy not found (run \`vp install\`) — skipped.`);
} else {
  const installed: string = readJson(installedManifest).version;
  if (ourSpec && installed !== ourSpec) {
    console.log(`- installed ${installed} ≠ declared ${ourSpec} — run \`vp install\`.`);
    failed = true;
  } else {
    console.log(`- installed ${installed} matches ✓`);
  }
}

const vendoredManifest = path.join(
  ROOT,
  "react-spectrum",
  "packages",
  "@react-spectrum",
  "s2",
  "package.json",
);
if (!existsSync(vendoredManifest)) {
  console.log("- vendored ./react-spectrum tree not materialized — oracle comparison cannot run.");
  failed = true;
} else {
  const vendored: string | undefined = readJson(vendoredManifest).devDependencies?.[PKG];
  if (!vendored) {
    console.log(
      `- pinned S2 no longer declares ${PKG} as a devDependency — re-derive what the oracle builds against and update this guard.`,
    );
    failed = true;
  } else if (ourSpec && vendored !== ourSpec) {
    console.log(
      `- pinned S2 builds against ${PKG}@${vendored}, ours is ${ourSpec} — align ours to the oracle (and re-check token values).`,
    );
    failed = true;
  } else {
    console.log(`- pinned S2 devDependency ${vendored} matches ✓`);
  }
}

if (failed) {
  console.log("");
  console.log(
    "Token versions and evidence must match the pinned oracle exactly; token values feed the",
  );
  console.log("style macro at build time, so drift here diverges rendered colors from S2.");
  process.exit(1);
}

console.log("\n✓ spectrum-tokens matches the pinned upstream S2.");
process.exit(0);
