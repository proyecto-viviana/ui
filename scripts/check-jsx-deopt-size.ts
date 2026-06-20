/**
 * Guard against the Solid-compiler "code generator deoptimised … exceeds 500KB"
 * regression.
 *
 * vite-plugin-solid Babel-compiles each emitted `.jsx` module in the consuming
 * app. Babel's `compact: "auto"` flips to compact (and logs the deopt warning)
 * once a single file's source exceeds 500,000 bytes. UC-05 split the two lower
 * packages' `.` barrels into per-primitive entries precisely so no published
 * `.jsx` is that large — the `dist/index.jsx` barrels are thin re-exports and the
 * real code lives in per-primitive/chunk modules, each well under the threshold.
 *
 * This guard keeps it that way: it fails if a published package emits a *new*
 * `.jsx` over the limit (which would reintroduce the warning for any consumer,
 * even one importing a single component). A short `KNOWN_LARGE` allowlist carries
 * the two pre-existing `solid-spectrum` files tracked as UC-07 — reported on every
 * run so the debt stays visible, and the guard fails if one of them is ever fixed
 * but left in the list.
 */

import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

// Babel's `compact: "auto"` deopt trigger: source length over 500_000 bytes.
const DEOPT_LIMIT = 500_000;

// Published packages whose `.jsx` (the `solid` condition) a consumer compiles.
const PACKAGES = [
  "packages/solid-stately",
  "packages/solidaria",
  "packages/solidaria-components",
  "packages/solid-spectrum",
  "packages/viviana-ui",
];

// Known-large `.jsx` that still exceed the limit, tracked as a follow-up rather
// than failing the build today. UC-05 split the two lower packages' barrels; the
// solid-spectrum barrel re-exports 79 targets but only ~35 are build entries, so
// the ~45 non-entry re-exports still inline into `dist/index.jsx` — and
// `dist/style/index.jsx` is the (JSX-free) S2 style macro module, which should be
// served via the `.js` condition instead of recompiled. Both are out of UC-05's
// approved "two lower packages" scope; see ui-client-contract.md UC-07. The guard
// reports them so the debt stays visible, but only *new* offenders fail the build.
const KNOWN_LARGE = new Set([
  "packages/solid-spectrum/dist/index.jsx",
  "packages/solid-spectrum/dist/style/index.jsx",
]);

function readDirSafe(dir: string) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return []; // package not built yet — nothing to check
  }
}

function jsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readDirSafe(dir)) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...jsxFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".jsx")) out.push(full);
  }
  return out;
}

const offenders: { file: string; bytes: number }[] = [];
const knownLarge: { file: string; bytes: number }[] = [];
let scanned = 0;
let largestBytes = 0;
let largestFile = "";

for (const pkg of PACKAGES) {
  for (const file of jsxFiles(join(pkg, "dist"))) {
    const { size } = statSync(file);
    scanned++;
    const normalized = file.split("\\").join("/");
    if (size > largestBytes && !KNOWN_LARGE.has(normalized)) {
      largestBytes = size;
      largestFile = file;
    }
    if (size > DEOPT_LIMIT) {
      if (KNOWN_LARGE.has(normalized)) knownLarge.push({ file: normalized, bytes: size });
      else offenders.push({ file, bytes: size });
    }
  }
}

const kb = (bytes: number) => `${(bytes / 1000).toFixed(1)} KB`;

if (scanned === 0) {
  console.error("No dist .jsx files found — build the packages first (vp run pack:local-chain).");
  process.exit(1);
}

// Surface the tracked exceptions so the debt stays visible (non-fatal).
if (knownLarge.length > 0) {
  console.warn(
    `jsx deopt-size guard: ${knownLarge.length} known-large file(s) over ${kb(DEOPT_LIMIT)} (tracked, see UC-07):`,
  );
  for (const { file, bytes } of knownLarge.sort((a, b) => b.bytes - a.bytes)) {
    console.warn(`  ${kb(bytes).padStart(10)}  ${file}`);
  }
}

// A file that fell below the limit no longer needs its exception — keep the list honest.
const resolved = [...KNOWN_LARGE].filter((f) => !knownLarge.some((k) => k.file === f));
if (resolved.length > 0) {
  console.error(
    `jsx deopt-size guard FAILED: these are now under ${kb(DEOPT_LIMIT)} — remove them from KNOWN_LARGE:`,
  );
  for (const file of resolved) console.error(`  ${file}`);
  process.exit(1);
}

if (offenders.length > 0) {
  console.error(
    `jsx deopt-size guard FAILED: ${offenders.length} new file(s) exceed ${kb(DEOPT_LIMIT)}.`,
  );
  console.error(
    "These trip Babel's compact-mode deopt in vite-plugin-solid for every consumer.\n" +
      "Re-split the offending package's build into smaller per-primitive entries (see UC-05).\n",
  );
  for (const { file, bytes } of offenders.sort((a, b) => b.bytes - a.bytes)) {
    console.error(`  ${kb(bytes).padStart(10)}  ${file}`);
  }
  process.exit(1);
}

console.log(
  `jsx deopt-size guard OK: ${scanned} .jsx scanned, all under ${kb(DEOPT_LIMIT)} (excl. ${knownLarge.length} tracked).`,
);
console.log(`Largest non-exempt: ${kb(largestBytes)}  ${largestFile}`);
