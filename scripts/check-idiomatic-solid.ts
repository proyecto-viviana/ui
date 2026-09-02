/**
 * guard:idiomatic-solid — flag the Solid reactivity anti-patterns that have
 * repeatedly bitten this port.
 *
 * 1. Destructuring a component/hook's reactive `props` object.
 *    In SolidJS a component/hook body runs ONCE (unlike React, which re-runs
 *    every render), so `const { x } = props` reads `x` a single time and FREEZES
 *    it — any later reactive change to that prop is lost. The idiomatic
 *    replacements are: read `props.x` directly at each use site, or for a
 *    forwarded rest, `splitProps(props, [...])` (reactive rest proxy) plus
 *    `mergeProps(...)` instead of an eager object spread.
 *
 * 2. Rendering Solid's `children()` helper (often imported as `resolveChildren`)
 *    as visible JSX. `children()` memos the *resolved* child nodes. Mixed text
 *    such as `count: {n()}` becomes a text-node snapshot that stays at the
 *    server value after hydration (#135 Button; #168 / #169 still open).
 *
 *    Heuristic (kept deliberately simple): a `const ident = children(() => …)` /
 *    `resolveChildren(() => …)` binding is flagged when `ident`, or a one-hop
 *    alias `const x = ident()` / `const x = () => ident()`, appears inside a
 *    JSX `{…}` expression or in a `return ident` / `return ident()`. Bindings
 *    whose identifier is used only with `.toArray()`, `.length`, or a `typeof`
 *    probe are allowed. False positives and the still-open #168 / #169 sites
 *    live in `scripts/idiomatic-solid-children-baseline.json`. The baseline
 *    ratchets both ways: a new site fails, and a baselined site that disappears
 *    fails until its entry is removed (same shape as `guard:layer-boundary`).
 *    Sites are keyed by `file:ident#ordinal` (the n-th binding of that name in
 *    the file), never by line, so unrelated edits above a site do not trip it;
 *    `line` in the baseline is informational.
 *
 * This guard scans the hand-written Solid source. It excludes:
 *   - test/spec/story files, and
 *   - generated files (the `Auto-generated from vendored React Spectrum` icon
 *     set, ~420 files).
 * A small ALLOWLIST records reviewed-benign *destructure* exceptions (each with
 * a rationale); a genuinely new reactive-props destructure is what check 1
 * catches.
 *
 * Exit 1 listing offenders; exit 0 when clean; exit 0 with a note when none of
 * the source roots exist (an environmental gap — never cry wolf). Run standalone
 * anytime: `vp run guard:idiomatic-solid`.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = process.cwd();
const CHILDREN_BASELINE_PATH = path.join(ROOT, "scripts", "idiomatic-solid-children-baseline.json");

/** Hand-written Solid source roots (ports and styled component packages). */
const SRC_ROOTS = [
  "packages/solidaria/src",
  "packages/solidaria-components/src",
  "packages/kumo/src",
  "packages/solid-spectrum/src",
  "packages/solid-stately/src",
  "packages/viviana-ui/src",
];

/**
 * Files whose header carries this marker are machine-generated (the icon set:
 * `s2wf-icons/` + `ui-icons/`, all `Auto-generated from … @react-spectrum/s2 …`).
 * Every icon that destructures props is generated — no hand-written `/icon/`
 * file does — so the marker fully and safely excludes them.
 */
const GENERATED_MARKER = "Auto-generated";

const IS_TEST = /\.(test|spec|stories)\.[tj]sx?$|(^|\/)(__tests__|test)\//;

/**
 * `const { … } = props` / `let { … } = props`, single- or multi-line (the class
 * body `[^}]` matches newlines, so a wrapped destructure is caught too). Nested
 * braces inside the pattern (e.g. an inner `= {}` default) are the one form this
 * heuristic does not span — vanishingly rare and acceptable for a guard.
 */
const PROPS_DESTRUCTURE = /\b(?:const|let)\s*\{[^}]*\}\s*=\s*props\b/g;

/**
 * `const ident = children(() =>` / `resolveChildren(() =>`. Requires the
 * helper-call-plus-arrow shape so a local `children(item)` mapper is not a hit.
 * The longer name is first so `resolveChildren` is not split into a false
 * `children` match. `=>` is matched via a character class so a regex literal
 * does not terminate at `/`.
 */
const CHILDREN_BINDING =
  /\b(?:const|let)\s+(\w+)\s*=\s*(?:resolveChildren|children)\s*\(\s*\([^)]*\)\s*=>/g;

export interface ChildrenSnapshotSite {
  ident: string;
  /** n-th flagged binding of this ident in the file (0-based); part of the key. */
  ordinal: number;
  /** Informational only — not part of the baseline key. */
  line: number;
}

export interface ChildrenBaseline {
  version: number;
  generated: string;
  description: string;
  sites: Array<{
    file: string;
    ident: string;
    ordinal: number;
    line: number;
    ticket: number;
  }>;
}

/**
 * Reviewed-benign exceptions: a destructure of a stable *reference* (e.g. a
 * state/context object whose FIELDS are read reactively afterward) is not a
 * reactivity bug. Match by file suffix + a trimmed code snippet so line drift
 * doesn't matter. Keep this list short and justified — prefer fixing.
 */
const ALLOWLIST: Array<{ file: string; snippet: string; why: string }> = [
  // Stable-reference destructures: `state`/`ctx` are created once and passed via
  // `<Show keyed>`; every field/method is read reactively through the object, so
  // capturing the reference is correct (not a frozen value). CP9.83 review.
  {
    file: "solidaria-components/src/RadioGroup.tsx",
    snippet: "const { state } = props",
    why: "state is a stable createRadioGroupState reference; fields read reactively via its getters/methods",
  },
  {
    file: "solidaria-components/src/RadioGroup.tsx",
    snippet: "const { ctx, state } = props",
    why: "ctx + state are stable references; fields read reactively via their getters/methods",
  },
  {
    file: "solidaria-components/src/Switch.tsx",
    snippet: "const { ctx } = props",
    why: "ctx is a stable reference passed via <Show keyed>; fields read reactively via its methods",
  },
  {
    file: "solidaria-components/src/Checkbox.tsx",
    snippet: "const { ctx } = props",
    why: "ctx is a stable reference passed via <Show keyed>; fields read reactively via its methods",
  },
  // Destructure INSIDE a createEffect callback: it re-executes on every effect
  // run, and reading props.x there establishes a tracked dependency — so the
  // effect re-runs (and re-attaches listeners) when isDisabled/ref change. This
  // is the correct idiom, not the run-once-top-level freeze the guard targets.
  {
    file: "solidaria/src/overlays/createInteractOutside.ts",
    snippet: "onInteractOutsideStart, isDisabled } = props",
    why: "destructure is inside createEffect → re-tracks props.isDisabled/ref each run (Menu/Select pass live getters)",
  },
  // Init-only / static-caller destructures where the value cannot be reactive by
  // construction and every call site passes a plain literal.
  {
    file: "solidaria/src/interactions/createFocusRing.ts",
    snippet: "isTextInput = false, autoFocus = false, within = false } = props",
    why: "autoFocus seeds initial state once; within picks createFocus-vs-createFocusWithin at setup and all callers pass a static literal",
  },
  {
    file: "solidaria/src/interactions/createMove.ts",
    snippet: "onMoveStart, onMove, onMoveEnd } = props",
    why: "move callbacks are invoke-only (never compared for identity); no callers in-repo — low-severity reference capture",
  },
  {
    file: "solidaria-components/src/utils.tsx",
    snippet: 'class: className, style, defaultClassName = "" } = props',
    why: "useRenderProps: all 131 call sites pass plain class/style values; shape deliberately avoids the getter pattern (SSR note at :106)",
  },
  {
    file: "solidaria/src/interactions/createLongPress.ts",
    snippet: "onLongPressStart, onLongPressEnd, onLongPress",
    why: "upstream-faithful useLongPress destructure; callbacks invoke-only, threshold/isDisabled effectively static — low-severity",
  },
  {
    file: "solidaria/src/autocomplete/createAutocomplete.ts",
    snippet: "collectionId: collectionIdProp",
    why: "setup-time config snapshot mirroring useAutocomplete: refs + disableVirtualFocus→createSignal init + collectionId→createId, captured once by design",
  },
];

function isAllowlisted(file: string, code: string): boolean {
  const rel = file.replace(`${ROOT}/`, "");
  return ALLOWLIST.some((a) => rel.endsWith(a.file) && code.includes(a.snippet));
}

function walk(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (/\.[tj]sx?$/.test(entry) && !IS_TEST.test(full)) {
      out.push(full);
    }
  }
}

function isInsideComment(text: string, idx: number): boolean {
  const lineStart = text.lastIndexOf("\n", idx) + 1;
  if (text.slice(lineStart, idx).includes("//")) return true;
  if (text.lastIndexOf("/*", idx) > text.lastIndexOf("*/", idx)) return true;
  return false;
}

function skipMatchingParen(text: string, openIdx: number): number {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return openIdx;
}

function nextSameIdentBinding(text: string, ident: string, from: number): number {
  const re = new RegExp(
    String.raw`\b(?:const|let)\s+${ident}\s*=\s*(?:resolveChildren|children)\s*\(\s*\([^)]*\)\s*=>`,
    "g",
  );
  re.lastIndex = from;
  const m = re.exec(text);
  return m ? m.index : text.length;
}

function identAppearsInJsxOrReturn(text: string, ident: string): boolean {
  const jsx = new RegExp(String.raw`\{[\s]*\b${ident}\b(?!\s*:)`);
  const ret = new RegExp(String.raw`\breturn\s+\b${ident}\b`);
  if (jsx.test(text) || ret.test(text)) return true;
  // Component return that uses ident in a ternary / wrapped expression
  // (`return cond ? <span/> : content()`), not only `return ident()`.
  const returnIdx = text.search(/\breturn\b/);
  if (returnIdx < 0) return false;
  return new RegExp(String.raw`\b${ident}\b`).test(text.slice(returnIdx));
}

function oneHopAliases(text: string, ident: string): string[] {
  const re = new RegExp(
    String.raw`\b(?:const|let)\s+(\w+)\s*=\s*(?:\(\s*\)\s*=>\s*)?${ident}\s*\(\s*\)`,
    "g",
  );
  const aliases: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (isInsideComment(text, m.index)) continue;
    aliases.push(m[1]);
  }
  return aliases;
}

function identUsesAreStructuralOnly(text: string, ident: string): boolean {
  const re = new RegExp(String.raw`\b${ident}\b`, "g");
  let m: RegExpExecArray | null;
  let sawUse = false;
  while ((m = re.exec(text)) !== null) {
    if (isInsideComment(text, m.index)) continue;
    sawUse = true;
    const after = text.slice(m.index + ident.length);
    if (/^\s*\.toArray\b/.test(after) || /^\s*\.length\b/.test(after)) continue;
    const before = text.slice(Math.max(0, m.index - 8), m.index);
    if (/\btypeof\s+$/.test(before)) continue;
    return false;
  }
  return sawUse;
}

/**
 * Find `children()` / `resolveChildren()` bindings whose result is rendered as
 * JSX content or returned from the surrounding function. Structural-only uses
 * (`.toArray()`, `.length`, `typeof`) are not returned.
 */
export function findRenderedChildrenSnapshots(source: string): ChildrenSnapshotSite[] {
  const sites: ChildrenSnapshotSite[] = [];
  CHILDREN_BINDING.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CHILDREN_BINDING.exec(source)) !== null) {
    if (isInsideComment(source, m.index)) continue;
    const ident = m[1];
    const callOpen = /(?:resolveChildren|children)\s*\(/.exec(m[0]);
    const openParen =
      m.index + (callOpen ? callOpen.index + callOpen[0].length - 1 : m[0].length - 1);
    const afterCall = skipMatchingParen(source, openParen);
    const windowEnd = nextSameIdentBinding(source, ident, afterCall);
    const window = source.slice(afterCall, windowEnd);

    if (identUsesAreStructuralOnly(window, ident)) continue;

    const aliases = oneHopAliases(window, ident);
    const rendered =
      identAppearsInJsxOrReturn(window, ident) ||
      aliases.some((alias) => identAppearsInJsxOrReturn(window, alias));
    if (!rendered) continue;

    const line = source.slice(0, m.index).split("\n").length;
    const ordinal = sites.filter((s) => s.ident === ident).length;
    sites.push({ ident, ordinal, line });
  }
  return sites;
}

/**
 * Ticket that owns removing a known snapshot-rendered `children()` site.
 * #168 / #169 are the styled-wrapper closeouts; remaining inspection wrappers
 * and extra collection copies sit on #192 until a dedicated closeout exists.
 */
export function ticketForChildrenSite(file: string): number {
  const n = file.replace(/\\/g, "/");
  if (n.includes("/selectboxgroup/")) return 169;
  if (
    /\/(ActionButton|ToggleButton|LinkButton)\.tsx$/.test(n) ||
    n.includes("/badge/") ||
    n.includes("/radio/") ||
    n.includes("/segmentedcontrol/") ||
    n.includes("/tag-group/")
  ) {
    return 168;
  }
  return 192;
}

function siteKey(file: string, ident: string, ordinal: number): string {
  return `${file}:${ident}#${ordinal}`;
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(path.resolve(entry)).href === import.meta.url;
  } catch {
    return false;
  }
}

function main(): void {
  const writeBaseline = process.argv.includes("--write-baseline");

  console.log("Idiomatic-Solid check — reactive `props` must not be destructured");
  console.log("                  — `children()` must not snapshot rendered content");

  const roots = SRC_ROOTS.map((r) => path.join(ROOT, r)).filter(existsSync);
  if (roots.length === 0) {
    console.log("- no Solid source roots present (nothing to scan) — skipping.");
    process.exit(0);
  }

  const files: string[] = [];
  for (const root of roots) walk(root, files);

  type DestructureOffender = { file: string; line: number; code: string };
  const destructureOffenders: DestructureOffender[] = [];
  let allowed = 0;

  type LocatedChildrenSite = ChildrenSnapshotSite & { file: string };
  const childrenSites: LocatedChildrenSite[] = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (text.includes(GENERATED_MARKER)) continue;
    const rel = file.replace(`${ROOT}/`, "").replace(/\\/g, "/");

    PROPS_DESTRUCTURE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = PROPS_DESTRUCTURE.exec(text)) !== null) {
      const idx = m.index;
      if (isInsideComment(text, idx)) continue;
      const line = text.slice(0, idx).split("\n").length;
      const code = m[0].replace(/\s+/g, " ").trim();
      if (isAllowlisted(file, code)) {
        allowed++;
        continue;
      }
      destructureOffenders.push({ file: rel, line, code });
    }

    for (const site of findRenderedChildrenSnapshots(text)) {
      childrenSites.push({ file: rel, ...site });
    }
  }

  console.log(
    `- scanned ${files.length} hand-written Solid files` +
      (allowed ? ` (${allowed} reviewed-benign destructure(s) allowlisted)` : ""),
  );

  let failed = false;

  if (destructureOffenders.length > 0) {
    failed = true;
    console.error(
      `\nguard:idiomatic-solid — FAIL: ${destructureOffenders.length} reactive-props destructure(s) found.\n` +
        "In SolidJS this freezes the prop at call time (the body runs once). Read\n" +
        "`props.x` directly, or use splitProps/mergeProps for a forwarded rest.\n",
    );
    for (const o of destructureOffenders) console.error(`  ${o.file}:${o.line}: ${o.code}`);
    console.error(
      "\nIf a site is genuinely benign (destructuring a stable reference whose\n" +
        "fields are read reactively afterward), add it to ALLOWLIST with a reason.",
    );
  }

  if (writeBaseline) {
    const baseline: ChildrenBaseline = {
      version: 1,
      generated: new Date().toISOString().slice(0, 10),
      description:
        "Frozen children() snapshot-rendered sites. Ticket #192. New sites fail; a baselined site that disappears fails until removed. #168 / #169 own the styled-wrapper fixes.",
      sites: childrenSites.map((s) => ({
        file: s.file,
        ident: s.ident,
        ordinal: s.ordinal,
        line: s.line,
        ticket: ticketForChildrenSite(s.file),
      })),
    };
    writeFileSync(CHILDREN_BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
    console.log(
      `Wrote children-snapshot baseline → ${path.relative(ROOT, CHILDREN_BASELINE_PATH)} (${baseline.sites.length} sites)`,
    );
    process.exit(failed ? 1 : 0);
  }

  if (!existsSync(CHILDREN_BASELINE_PATH)) {
    failed = true;
    console.error(
      `\nguard:idiomatic-solid — FAIL: missing children-snapshot baseline at ${path.relative(ROOT, CHILDREN_BASELINE_PATH)}.`,
    );
  } else {
    const baseline = JSON.parse(readFileSync(CHILDREN_BASELINE_PATH, "utf8")) as ChildrenBaseline;
    const baseKeys = new Set(baseline.sites.map((s) => siteKey(s.file, s.ident, s.ordinal)));
    const currentKeys = new Set(childrenSites.map((s) => siteKey(s.file, s.ident, s.ordinal)));

    const newSites = childrenSites.filter(
      (s) => !baseKeys.has(siteKey(s.file, s.ident, s.ordinal)),
    );
    const staleSites = baseline.sites.filter(
      (s) => !currentKeys.has(siteKey(s.file, s.ident, s.ordinal)),
    );

    console.log(`- frozen children-snapshot baseline: ${baseline.sites.length} sites`);
    for (const s of baseline.sites) {
      console.log(`  ${s.file}:${s.line} ${s.ident} (#${s.ticket})`);
    }

    if (newSites.length > 0) {
      failed = true;
      console.error(
        `\nguard:idiomatic-solid — FAIL: ${newSites.length} new children() snapshot-rendered site(s) not in the baseline:`,
      );
      for (const s of newSites) {
        console.error(`  ${s.file}:${s.line} ${s.ident} — add to the baseline with a ticket id`);
      }
    }

    if (staleSites.length > 0) {
      failed = true;
      console.error(
        `\nguard:idiomatic-solid — FAIL: ${staleSites.length} baselined site(s) no longer render a children() snapshot (fixed) — remove them from the baseline:`,
      );
      for (const s of staleSites) {
        console.error(`  ${s.file} ${s.ident}#${s.ordinal} (#${s.ticket})`);
      }
    }
  }

  if (failed) process.exit(1);

  console.log(
    "guard:idiomatic-solid — PASS: no reactive-props destructures; children-snapshot baseline holds.",
  );
  process.exit(0);
}

if (isExecutedDirectly()) {
  main();
}
