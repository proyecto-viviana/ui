/**
 * guard:layer-boundary — freeze the solid-spectrum ↔ viviana-ui dual-tree
 * inventory so new Spectrum forks into the flagship package fail hard.
 *
 * Ticket #2 (parity gates must exit non-zero). Ticket #1 owns reconciling the
 * identical-copy backlog; this gate only enforces a hard edge on *new* drift:
 *
 *   - A baselined-identical path whose content now differs → FAIL (new fork of
 *     Spectrum authority into viviana-ui).
 *   - A path present in both trees that is not in the baseline → FAIL
 *     (unbaselined dual copy / dual path).
 *
 * Improvements are allowed without rewriting the baseline:
 *   - identical → single-tree (path removed from one side)
 *   - diverged → identical (re-synced, still dual — note only)
 *   - diverged content change (intentional branding) — not tracked here
 *
 * Usage:
 *   vp exec tsx scripts/check-layer-boundary.ts
 *   vp exec tsx scripts/check-layer-boundary.ts --write-baseline
 *   vp exec tsx scripts/check-layer-boundary.ts --report
 */

import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SPECTRUM_SRC = path.join(ROOT, "packages", "solid-spectrum", "src");
const UI_SRC = path.join(ROOT, "packages", "viviana-ui", "src");
const BASELINE_PATH = path.join(ROOT, "scripts", "layer-boundary-baseline.json");

const writeBaseline = process.argv.includes("--write-baseline");
const reportOnly = process.argv.includes("--report");

const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".css", ".js", ".jsx"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "__snapshots__"]);

interface Baseline {
  version: number;
  generated: string;
  description: string;
  roots: { spectrum: string; ui: string };
  counts: { shared: number; identical: number; diverged: number };
  identical: string[];
  diverged: string[];
}

function walkRelHashes(srcRoot: string): Map<string, string> {
  const out = new Map<string, string>();

  function visit(dir: string): void {
    for (const entry of readdirSync(dir)) {
      const abs = path.join(dir, entry);
      const st = statSync(abs);
      if (st.isDirectory()) {
        if (SKIP_DIRS.has(entry)) continue;
        visit(abs);
        continue;
      }
      if (!SCAN_EXTENSIONS.has(path.extname(entry))) continue;
      const rel = path.relative(srcRoot, abs).split(path.sep).join("/");
      const hash = createHash("sha256").update(readFileSync(abs)).digest("hex");
      out.set(rel, hash);
    }
  }

  if (!existsSync(srcRoot)) {
    throw new Error(`Missing source root: ${srcRoot}`);
  }
  visit(srcRoot);
  return out;
}

function inventory() {
  const spectrum = walkRelHashes(SPECTRUM_SRC);
  const ui = walkRelHashes(UI_SRC);
  const shared = [...spectrum.keys()].filter((p) => ui.has(p)).sort();
  const identical: string[] = [];
  const diverged: string[] = [];
  for (const p of shared) {
    if (spectrum.get(p) === ui.get(p)) identical.push(p);
    else diverged.push(p);
  }
  return {
    spectrum,
    ui,
    shared,
    identical,
    diverged,
    spectrumOnly: [...spectrum.keys()].filter((p) => !ui.has(p)).sort(),
    uiOnly: [...ui.keys()].filter((p) => !spectrum.has(p)).sort(),
  };
}

function buildBaseline(inv: ReturnType<typeof inventory>): Baseline {
  return {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    description:
      "Frozen dual-tree inventory for packages/solid-spectrum/src vs packages/viviana-ui/src. Ticket #2: fail on new forks of previously-identical Spectrum authority into viviana-ui, and on unbaselined dual paths. Ticket #1 owns reconciling the identical-copy backlog.",
    roots: {
      spectrum: "packages/solid-spectrum/src",
      ui: "packages/viviana-ui/src",
    },
    counts: {
      shared: inv.shared.length,
      identical: inv.identical.length,
      diverged: inv.diverged.length,
    },
    identical: inv.identical,
    diverged: inv.diverged,
  };
}

const inv = inventory();

console.log("Layer boundary guard (solid-spectrum ↔ viviana-ui)");
console.log(`- spectrum: ${path.relative(ROOT, SPECTRUM_SRC)} (${inv.spectrum.size} files)`);
console.log(`- ui:       ${path.relative(ROOT, UI_SRC)} (${inv.ui.size} files)`);
console.log(
  `- shared:   ${inv.shared.length} (identical ${inv.identical.length}, diverged ${inv.diverged.length})`,
);
console.log(`- spectrum-only: ${inv.spectrumOnly.length}`);
console.log(`- ui-only:       ${inv.uiOnly.length}`);
console.log("");

if (writeBaseline) {
  const next = buildBaseline(inv);
  writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote baseline → ${path.relative(ROOT, BASELINE_PATH)}`);
  console.log(
    `  identical=${next.counts.identical} diverged=${next.counts.diverged} shared=${next.counts.shared}`,
  );
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(
    `Missing baseline at ${path.relative(ROOT, BASELINE_PATH)}. Run with --write-baseline first.`,
  );
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as Baseline;
const baseIdentical = new Set(baseline.identical);
const baseDiverged = new Set(baseline.diverged);
const baseKnown = new Set([...baseIdentical, ...baseDiverged]);
const currentShared = new Set(inv.shared);
const currentIdentical = new Set(inv.identical);
const currentDiverged = new Set(inv.diverged);

const newForks = [...baseIdentical].filter((p) => currentDiverged.has(p)).sort();
const unbaselinedDual = inv.shared.filter((p) => !baseKnown.has(p)).sort();
const stillIdentical = inv.identical.filter((p) => baseIdentical.has(p)).length;
const stillDiverged = inv.diverged.filter((p) => baseDiverged.has(p)).length;
const reSynced = [...baseDiverged].filter((p) => currentIdentical.has(p)).sort();
const lifted = [...baseKnown].filter((p) => !currentShared.has(p)).sort();

console.log("Against baseline:");
console.log(`- still identical (frozen dual copies): ${stillIdentical}`);
console.log(`- still diverged (frozen forks):        ${stillDiverged}`);
console.log(`- re-synced diverged → identical:       ${reSynced.length}`);
console.log(`- lifted (no longer dual-path):         ${lifted.length}`);
console.log(`- NEW forks (identical → diverged):     ${newForks.length}`);
console.log(`- unbaselined dual paths:               ${unbaselinedDual.length}`);
console.log("");

if (reSynced.length > 0) {
  console.log("Note: paths that re-synced to identical (progress or accidental re-copy):");
  for (const p of reSynced.slice(0, 20)) console.log(`  - ${p}`);
  if (reSynced.length > 20) console.log(`  - ... (${reSynced.length - 20} more)`);
  console.log("");
}

if (lifted.length > 0) {
  console.log("Note: baselined dual paths no longer shared (good for ticket #1):");
  for (const p of lifted.slice(0, 20)) console.log(`  - ${p}`);
  if (lifted.length > 20) console.log(`  - ... (${lifted.length - 20} more)`);
  console.log("");
}

let failed = false;

if (newForks.length > 0) {
  failed = true;
  console.log(
    `FAIL: ${newForks.length} baselined-identical path(s) now diverge — new Spectrum forks into viviana-ui:`,
  );
  for (const p of newForks) console.log(`  - ${p}`);
  console.log(
    "  solid-spectrum owns S2 behavior; viviana-ui should wrap/compose/theme, not fork. See ticket #1.",
  );
  console.log("");
}

if (unbaselinedDual.length > 0) {
  failed = true;
  console.log(
    `FAIL: ${unbaselinedDual.length} dual path(s) not in baseline (new dual-copy surface):`,
  );
  for (const p of unbaselinedDual) {
    const kind = currentIdentical.has(p) ? "identical" : "diverged";
    console.log(`  - ${p} (${kind})`);
  }
  console.log(
    "  Prefer importing from @proyecto-viviana/solid-spectrum, or re-run with --write-baseline only after intentional dual-path review.",
  );
  console.log("");
}

if (failed) {
  if (reportOnly) {
    console.log("Report-only mode: would fail (exit 1) without --report.");
    process.exit(0);
  }
  process.exit(1);
}

console.log(
  "PASS: no new Spectrum forks into viviana-ui; no unbaselined dual paths. " +
    `Frozen backlog remains: ${stillIdentical} identical copies + ${stillDiverged} diverged (ticket #1).`,
);
process.exit(0);
