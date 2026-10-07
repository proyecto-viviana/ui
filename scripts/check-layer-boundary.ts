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
 * Ticket #577: a stale row fails as a stale record. `--write-baseline` never
 * grows reasonExempt (the pre-2026-09-20 diverged set with no reason).
 *   - A path that enters diverged needs a recorded reason first.
 *   - diverged → identical (re-synced) fails: this record no longer matches
 *     the tree. Hashes prove identity, so `--write-baseline` may drop it.
 *   - A baselined path that leaves the shared set fails the same way.
 *     `--write-baseline` needs a departures acknowledgement first.
 *   - A reason that names a path no longer diverged fails the same way.
 *   - Diverged content change (intentional branding) is not tracked here.
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
  /**
   * Why a diverged path diverged, keyed by path. A ratchet that can move with no
   * recorded reason becomes unreadable the first time it moves (#573), so the
   * reason lives beside the list it explains rather than in the commit that moved
   * it. Paths frozen before 2026-09-20 predate the rule and carry none; every
   * move after it does, and `--write-baseline` refuses to make one without it.
   */
  reasons?: Record<string, string>;
  /**
   * Diverged paths frozen before 2026-09-20 that have no reason. A normal run
   * treats them as grandfathered. `--write-baseline` never grows this list.
   * An entry that is no longer diverged is a stale record (#577).
   */
  reasonExempt?: string[];
  /**
   * Acknowledgement that a baselined path left the shared set. `--write-baseline`
   * consumes it. A lift with no acknowledgement is a stale record (#577).
   */
  departures?: Record<string, string>;
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

const DESCRIPTION =
  "Frozen dual-tree inventory for packages/solid-spectrum/src vs packages/viviana-ui/src. Ticket #2: fail on new forks of previously-identical Spectrum authority into viviana-ui, and on unbaselined dual paths. Ticket #1 owns reconciling the identical-copy backlog. Ticket #577: reasonExempt is the pre-2026-09-20 diverged set that has no reason, and --write-baseline never grows it. A re-synced or lifted row is a stale record. A path that enters diverged needs a reason first. A path that leaves the shared set needs a departures acknowledgement first.";

function hasReason(reasons: Record<string, string>, rel: string): boolean {
  return Boolean(reasons[rel]?.trim());
}

function buildBaseline(
  inv: ReturnType<typeof inventory>,
  reasons: Record<string, string>,
  reasonExempt: string[],
  departures: Record<string, string>,
): Baseline {
  const diverged = new Set(inv.diverged);
  const shared = new Set(inv.shared);
  const kept = Object.fromEntries(
    Object.entries(reasons).filter(([p, reason]) => diverged.has(p) && reason.trim()),
  );
  const keptExempt = reasonExempt.filter((p) => diverged.has(p) && !hasReason(reasons, p));
  const keptDepartures = Object.fromEntries(
    Object.entries(departures).filter(([p, reason]) => shared.has(p) && reason.trim()),
  );
  return {
    version: 1,
    generated: new Date().toISOString().slice(0, 10),
    description: DESCRIPTION,
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
    ...(Object.keys(kept).length > 0 ? { reasons: kept } : {}),
    ...(keptExempt.length > 0 ? { reasonExempt: keptExempt } : {}),
    ...(Object.keys(keptDepartures).length > 0 ? { departures: keptDepartures } : {}),
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
  const previous: Baseline | null = existsSync(BASELINE_PATH)
    ? (JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as Baseline)
    : null;
  const carriedReasons = previous?.reasons ?? {};
  if (previous) {
    const previousDiverged = new Set(previous.diverged);
    const previousExempt = new Set(previous.reasonExempt ?? []);
    const entered = inv.diverged
      .filter((p) => !previousDiverged.has(p))
      .filter((p) => !hasReason(carriedReasons, p) && !previousExempt.has(p))
      .sort();
    if (entered.length > 0) {
      console.error(
        `Refusing to re-bless ${entered.length} path(s) that entered diverged with no recorded reason:`,
      );
      for (const p of entered) console.error(`  - ${p}`);
      console.error(
        '  Add each to "reasons" in the baseline first — what diverged and which commit did it — then re-run.',
      );
      process.exit(1);
    }
    const previousShared = new Set([...previous.identical, ...previous.diverged]);
    const previousDepartures = previous.departures ?? {};
    const liftedNow = [...previousShared].filter((p) => !inv.shared.includes(p)).sort();
    const unacked = liftedNow.filter((p) => !previousDepartures[p]?.trim());
    if (unacked.length > 0) {
      console.error(
        `Refusing to drop ${unacked.length} path(s) that left the shared set with no departures acknowledgement:`,
      );
      for (const p of unacked) console.error(`  - ${p}`);
      console.error(
        '  Add each to "departures" in the baseline first — why it left — then re-run.',
      );
      process.exit(1);
    }
  }
  const nextExempt = (previous?.reasonExempt ?? []).filter(
    (p) => inv.diverged.includes(p) && !hasReason(carriedReasons, p),
  );
  const next = buildBaseline(inv, carriedReasons, nextExempt, previous?.departures ?? {});
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

if (reSynced.length > 0) {
  failed = true;
  console.log(
    `FAIL: this record no longer matches the tree: ${reSynced.length} baselined-diverged path(s) re-synced to identical:`,
  );
  for (const p of reSynced) console.log(`  - ${p}`);
  console.log("");
}

if (lifted.length > 0) {
  failed = true;
  console.log(
    `FAIL: this record no longer matches the tree: ${lifted.length} baselined path(s) left the shared set:`,
  );
  for (const p of lifted) console.log(`  - ${p}`);
  console.log("");
}

const recordedReasons = baseline.reasons ?? {};
const strayReasons = Object.keys(recordedReasons)
  .filter((p) => !baseDiverged.has(p) || !recordedReasons[p]?.trim())
  .sort();

if (strayReasons.length > 0) {
  failed = true;
  console.log(
    `FAIL: this record no longer matches the tree: ${strayReasons.length} recorded divergence reason(s) name a path that is not baselined as diverged, or are empty:`,
  );
  for (const p of strayReasons) console.log(`  - ${p}`);
  console.log(
    "  A reason outlives its path only by being wrong; delete it when the path re-syncs.",
  );
  console.log("");
}

const reasonExempt = baseline.reasonExempt ?? [];
const staleExempt = reasonExempt
  .filter((p) => !baseDiverged.has(p) || !currentDiverged.has(p))
  .sort();
if (staleExempt.length > 0) {
  failed = true;
  console.log(
    `FAIL: this record no longer matches the tree: ${staleExempt.length} reasonExempt path(s) are no longer a diverged row:`,
  );
  for (const p of staleExempt) console.log(`  - ${p}`);
  console.log("");
}

const unexplainedFrozen = [...baseDiverged]
  .filter(
    (p) => currentDiverged.has(p) && !hasReason(recordedReasons, p) && !reasonExempt.includes(p),
  )
  .sort();
if (unexplainedFrozen.length > 0) {
  failed = true;
  console.log(
    `FAIL: ${unexplainedFrozen.length} diverged path(s) have no recorded reason and are not in reasonExempt:`,
  );
  for (const p of unexplainedFrozen) console.log(`  - ${p}`);
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
