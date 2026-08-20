/**
 * guard:idiomatic-solid — flag the one Solid reactivity anti-pattern that has
 * repeatedly bitten this port: destructuring a component/hook's reactive `props`
 * object.
 *
 * In SolidJS a component/hook body runs ONCE (unlike React, which re-runs every
 * render), so `const { x } = props` reads `x` a single time and FREEZES it — any
 * later reactive change to that prop is lost. The whole port has been fixed one
 * site at a time during the recertification march (object-rest froze getters in
 * ActionGroup/TimeField/TreeView; a destructured `get` prop froze a keyboard
 * delegate; …). The idiomatic replacements are:
 *   - read `props.x` directly at each use site, or
 *   - for a forwarded rest, `splitProps(props, [...])` (reactive rest proxy)
 *     plus `mergeProps(...)` instead of an eager object spread.
 *
 * This guard scans the hand-written Solid source and fails on any
 * `const { … } = props` / `let { … } = props`. It excludes:
 *   - test/spec/story files, and
 *   - generated files (the `Auto-generated from vendored React Spectrum` icon
 *     set, ~420 files, all uniform `const { class, ...rest } = props` on a
 *     static SVG whose props never change — benign and machine-owned).
 * A small ALLOWLIST records reviewed-benign exceptions (each with a rationale);
 * a genuinely new reactive-props destructure is what this catches.
 *
 * Exit 1 listing offenders; exit 0 when clean; exit 0 with a note when none of
 * the source roots exist (an environmental gap — never cry wolf). Run standalone
 * anytime: `vp run guard:idiomatic-solid`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

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

console.log("Idiomatic-Solid check — reactive `props` must not be destructured");

const roots = SRC_ROOTS.map((r) => path.join(ROOT, r)).filter(existsSync);
if (roots.length === 0) {
  console.log("- no Solid source roots present (nothing to scan) — skipping.");
  process.exit(0);
}

const files: string[] = [];
for (const root of roots) walk(root, files);

type Offender = { file: string; line: number; code: string };
const offenders: Offender[] = [];
let allowed = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  if (text.includes(GENERATED_MARKER)) continue;
  PROPS_DESTRUCTURE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PROPS_DESTRUCTURE.exec(text)) !== null) {
    const idx = m.index;
    // Skip matches that live inside a comment: the fixes for this anti-pattern
    // routinely cite the very `{ … } = props` they replaced. Line comment = a
    // `//` earlier on the same line; block comment = an unclosed `/*` before it.
    // (A stringized `//`/`/*` could in theory mask a real same-line offender, but
    // a props-destructure never trails a string literal on one line in practice.)
    const lineStart = text.lastIndexOf("\n", idx) + 1;
    if (text.slice(lineStart, idx).includes("//")) continue;
    if (text.lastIndexOf("/*", idx) > text.lastIndexOf("*/", idx)) continue;
    const line = text.slice(0, idx).split("\n").length;
    const code = m[0].replace(/\s+/g, " ").trim();
    if (isAllowlisted(file, code)) {
      allowed++;
      continue;
    }
    offenders.push({ file: file.replace(`${ROOT}/`, ""), line, code });
  }
}

console.log(
  `- scanned ${files.length} hand-written Solid files` +
    (allowed ? ` (${allowed} reviewed-benign allowlisted)` : ""),
);

if (offenders.length > 0) {
  console.error(
    `\nguard:idiomatic-solid — FAIL: ${offenders.length} reactive-props destructure(s) found.\n` +
      "In SolidJS this freezes the prop at call time (the body runs once). Read\n" +
      "`props.x` directly, or use splitProps/mergeProps for a forwarded rest.\n",
  );
  for (const o of offenders) console.error(`  ${o.file}:${o.line}: ${o.code}`);
  console.error(
    "\nIf a site is genuinely benign (destructuring a stable reference whose\n" +
      "fields are read reactively afterward), add it to ALLOWLIST with a reason.",
  );
  process.exit(1);
}

console.log(
  "guard:idiomatic-solid — PASS: no reactive-props destructures in hand-written Solid source.",
);
process.exit(0);
