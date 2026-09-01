/**
 * guard:spectrum-tokens-pin — keep `@adobe/spectrum-tokens` on the exact
 * version the pinned upstream S2 builds against.
 *
 * Both styled packages import the token JSON at runtime
 * (`packages/solid-spectrum/src/style/tokens.ts` and
 * `packages/viviana-ui/src/style/tokens.ts`), while upstream S2 bakes it in
 * at build time from an exact devDependency. A floating range here let our
 * tokens drift five minor releases ahead of the oracle before anyone noticed
 * (357 used token values differed) — colors silently diverge from the pin with
 * every install. Owner 2026-09-01 (#143): both packages pin the S2 oracle;
 * Viviana theming lives in `viviana-tokens.css`. This guard compares:
 *   - each package's spec (must be exact, no ^/~);
 *   - the version actually installed for that package (skipped with a note
 *     when node_modules is absent — an install gap, not drift);
 *   - the vendored oracle's devDependency in
 *     react-spectrum/packages/@react-spectrum/s2/package.json.
 * Both packages must match each other and the oracle. Exit 1 on any mismatch
 * or a non-exact spec; exit 0 otherwise. Run it standalone anytime:
 * `vp run guard:spectrum-tokens-pin`.
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PKG = "@adobe/spectrum-tokens";
const STYLED_PACKAGES = [
  { label: "solid-spectrum", dir: "solid-spectrum" },
  { label: "viviana-ui", dir: "viviana-ui" },
] as const;

function readJson(p: string): any {
  return JSON.parse(readFileSync(p, "utf8"));
}

/** Exact `major.minor.patch` only — ranges and pre-releases fail the guard. */
function isExact(spec: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(spec);
}

console.log("Spectrum tokens pin check");

let failed = false;
const specs: Record<string, string | undefined> = {};

for (const { label, dir } of STYLED_PACKAGES) {
  const ourManifest = path.join(ROOT, "packages", dir, "package.json");
  const ourSpec: string | undefined = readJson(ourManifest).dependencies?.[PKG];
  specs[label] = ourSpec;

  if (!ourSpec) {
    console.log(`- ${label} no longer declares ${PKG} — update or delete this guard.`);
    failed = true;
  } else if (!isExact(ourSpec)) {
    console.log(
      `- ${label} declares ${PKG}@${ourSpec} — must be an exact version so installs cannot drift from the oracle.`,
    );
    failed = true;
  } else {
    console.log(`- ${label} declares ${PKG}@${ourSpec} (exact) ✓`);
  }

  const installedManifest = path.join(ROOT, "packages", dir, "node_modules", PKG, "package.json");
  if (!existsSync(installedManifest)) {
    console.log(`- ${label} installed copy not found (run \`vp install\`) — skipped.`);
  } else {
    const installed: string = readJson(installedManifest).version;
    if (ourSpec && installed !== ourSpec) {
      console.log(`- ${label} installed ${installed} ≠ declared ${ourSpec} — run \`vp install\`.`);
      failed = true;
    } else {
      console.log(`- ${label} installed ${installed} matches ✓`);
    }
  }
}

const spectrumSpec = specs["solid-spectrum"];
const uiSpec = specs["viviana-ui"];
if (spectrumSpec && uiSpec && spectrumSpec !== uiSpec) {
  console.log(
    `- styled packages disagree: solid-spectrum ${spectrumSpec} vs viviana-ui ${uiSpec} — both must match the S2 oracle.`,
  );
  failed = true;
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
  } else {
    for (const { label } of STYLED_PACKAGES) {
      const ourSpec = specs[label];
      if (ourSpec && vendored !== ourSpec) {
        console.log(
          `- pinned S2 builds against ${PKG}@${vendored}, ${label} is ${ourSpec} — align ours to the oracle (and re-check token values).`,
        );
        failed = true;
      } else if (ourSpec) {
        console.log(`- ${label} matches pinned S2 devDependency ${vendored} ✓`);
      }
    }
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

console.log("\n✓ spectrum-tokens matches the pinned upstream S2 on both styled packages.");
process.exit(0);
