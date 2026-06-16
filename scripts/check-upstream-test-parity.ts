/**
 * guard:upstream-test-parity — a mechanical oracle that diffs the *contract
 * vocabulary* asserted by our component tests against the vendored upstream
 * React Aria Components + React Spectrum S2 test suites (the executable spec).
 *
 * For each component it extracts, from BOTH sides, the set of:
 *   - ARIA roles queried/asserted (getByRole, role=, toHaveAttribute('role'))
 *   - accessible names asserted ({ name: ... }, getByLabelText, aria-label)
 *   - aria-* attributes referenced (incl. Testing-Library state options:
 *     { selected }, { expanded }, … → aria-selected, aria-expanded)
 *   - keyboard keys exercised (fireEvent.keyDown key:, user.keyboard('{…}'))
 *
 * …then reports, per component:
 *   - WE-ONLY  roles/aria/keys  → prime suspects: we assert a shape upstream
 *     never asserts (e.g. the Toast `listbox`/`Dismiss` divergence class).
 *   - UPSTREAM-ONLY             → coverage gaps: upstream asserts a shape our
 *     tests never touch.
 *
 * This is a discovery/triage aid, not (yet) a blocking floor: it always exits 0
 * and ranks suspects so a human can reconcile each against the authoritative
 * upstream source. Names are reported but never scored (they are example-
 * specific); roles dominate the suspect score because a role our test asserts
 * that upstream never does is almost always a genuine wrong-shape bug.
 *
 * Upstream oracle = the gitignored ./react-spectrum tree, pinned via
 * scripts/upstream-pin.json. Re-materialize / bump it per the playbook at
 * .claude/current/upstream-sync.md.
 */

import { readdir, readFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/** Upstream executable spec (the oracle), at the pinned release. */
const UPSTREAM_TEST_ROOTS = [
  "react-spectrum/packages/react-aria-components/test",
  "react-spectrum/packages/@react-spectrum/s2/test",
];

/** Our component test suites. */
const OUR_TEST_ROOT = "packages";

/** S2-vs-RAC component renames + family aliases → one shared canonical key.
 *
 * Two flavors: (1) S2 renames a RAC primitive (Picker→Select, ListView→GridList);
 * (2) upstream splits a component into Base + Group across two test files while our
 * single suite covers both — fold the Group test in so the combined vocabulary
 * matches (e.g. S2 ToggleButtonGroup's `radio` role belongs to our ToggleButton
 * test). Without (2) the oracle false-flags correct behavior as a we-only role. */
const ALIASES: Record<string, string> = {
  tableview: "table",
  editabletableview: "table",
  treeview: "tree",
  treeble: "tree",
  picker: "select",
  listview: "gridlist",
  togglebuttongroup: "togglebutton",
  checkboxgroup: "checkbox",
};

// ---------------------------------------------------------------------------
// Vocabulary extraction
// ---------------------------------------------------------------------------

interface Vocab {
  roles: Set<string>;
  names: Set<string>;
  aria: Set<string>;
  keys: Set<string>;
}

const emptyVocab = (): Vocab => ({
  roles: new Set(),
  names: new Set(),
  aria: new Set(),
  keys: new Set(),
});

const VOCAB_KEYS = ["roles", "names", "aria", "keys"] as const;

function mergeInto(into: Vocab, from: Vocab): void {
  for (const k of VOCAB_KEYS) for (const v of from[k]) into[k].add(v);
}

const MODIFIERS = new Set(["shift", "control", "ctrl", "alt", "meta", "command", "option"]);

// Allowlists keep the diff honest: only genuine WAI-ARIA roles/attributes and
// real keyboard keys count, so test-fixture data (`{ role: 'Manager' }`), the
// substring of `react-aria-components`, and stray object keys never masquerade
// as contract divergences.
const ARIA_ROLES = new Set([
  "alert", "alertdialog", "application", "article", "banner", "blockquote", "button", "caption",
  "cell", "checkbox", "code", "columnheader", "combobox", "complementary", "contentinfo",
  "definition", "deletion", "dialog", "directory", "document", "emphasis", "feed", "figure",
  "form", "generic", "grid", "gridcell", "group", "heading", "img", "insertion", "link", "list",
  "listbox", "listitem", "log", "main", "marquee", "math", "menu", "menubar", "menuitem",
  "menuitemcheckbox", "menuitemradio", "meter", "navigation", "none", "note", "option",
  "paragraph", "presentation", "progressbar", "radio", "radiogroup", "region", "row", "rowgroup",
  "rowheader", "scrollbar", "search", "searchbox", "separator", "slider", "spinbutton", "status",
  "strong", "subscript", "superscript", "switch", "tab", "table", "tablist", "tabpanel", "term",
  "textbox", "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem",
]);
const ARIA_ATTRS = new Set([
  "aria-activedescendant", "aria-atomic", "aria-autocomplete", "aria-busy", "aria-checked",
  "aria-colcount", "aria-colindex", "aria-colindextext", "aria-colspan", "aria-controls",
  "aria-current", "aria-describedby", "aria-description", "aria-details", "aria-disabled",
  "aria-errormessage", "aria-expanded", "aria-flowto", "aria-haspopup", "aria-hidden",
  "aria-invalid", "aria-keyshortcuts", "aria-label", "aria-labelledby", "aria-level", "aria-live",
  "aria-modal", "aria-multiline", "aria-multiselectable", "aria-orientation", "aria-owns",
  "aria-placeholder", "aria-posinset", "aria-pressed", "aria-readonly", "aria-relevant",
  "aria-required", "aria-roledescription", "aria-rowcount", "aria-rowindex", "aria-rowindextext",
  "aria-rowspan", "aria-selected", "aria-setsize", "aria-sort", "aria-valuemax", "aria-valuemin",
  "aria-valuenow", "aria-valuetext",
]);
const KEYS = new Set([
  "arrowup", "arrowdown", "arrowleft", "arrowright", "enter", "escape", "esc", "space", "spacebar",
  "tab", "home", "end", "pageup", "pagedown", "backspace", "delete", "del", "insert",
]);

/** Testing-Library `getByRole(role, { state })` options → the aria-* they assert. */
const TL_STATE_TO_ARIA: Record<string, string> = {
  expanded: "aria-expanded",
  selected: "aria-selected",
  checked: "aria-checked",
  pressed: "aria-pressed",
  current: "aria-current",
  level: "aria-level",
  busy: "aria-busy",
};

const RX = {
  // Hard role assertions only. `queryByRole` is an ambiguous presence/absence
  // probe (often `expect(queryByRole(...)).not.toBeInTheDocument()`), and a bare
  // `role="x"` is usually a candidate inside a querySelector string (e.g.
  // `'[role="status"], [role="log"]'`) or JSX scaffolding — both enumerate
  // possibilities rather than assert the component's actual shape.
  role: [
    /\b(?:get|find)(?:All)?ByRole\(\s*['"`]([a-zA-Z]+)['"`]/g,
    /toHaveAttribute\(\s*['"`]role['"`]\s*,\s*['"`]([a-zA-Z]+)['"`]/g,
  ],
  name: [
    /\bname:\s*['"`]([^'"`]+)['"`]/g,
    /\bname:\s*\/([^/\n]+)\//g,
    /getByLabelText\(\s*['"`]([^'"`]+)['"`]/g,
    /\baria-label=['"`]([^'"`]+)['"`]/g,
  ],
  aria: [/\baria-[a-z]+(?:-[a-z]+)*/g],
  tlState: /\b(expanded|selected|checked|pressed|current|level|busy):\s*(?:true|false|['"\d/])/g,
  keyOpt: [/\bkey:\s*['"`]([^'"`]+)['"`]/g],
  keyboard: [/\.keyboard\(\s*['"`]([^'"`]+)['"`]/g],
};

function normName(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

function addKeys(vocab: Vocab, raw: string): void {
  const toks = raw.match(/[A-Za-z][A-Za-z0-9]+/g) ?? [];
  for (const t of toks) {
    const k = t.toLowerCase();
    if (!MODIFIERS.has(k) && KEYS.has(k)) vocab.keys.add(k);
  }
}

function extract(src: string): Vocab {
  const vocab = emptyVocab();
  let m: RegExpExecArray | null;
  for (const rx of RX.role)
    while ((m = rx.exec(src))) {
      const role = m[1].toLowerCase();
      if (ARIA_ROLES.has(role)) vocab.roles.add(role);
    }
  for (const rx of RX.name)
    while ((m = rx.exec(src))) {
      const n = normName(m[1]);
      if (n) vocab.names.add(n);
    }
  for (const rx of RX.aria)
    while ((m = rx.exec(src))) {
      const attr = m[0].toLowerCase();
      if (ARIA_ATTRS.has(attr)) vocab.aria.add(attr);
    }
  while ((m = RX.tlState.exec(src))) vocab.aria.add(TL_STATE_TO_ARIA[m[1]]);
  for (const rx of RX.keyOpt) while ((m = rx.exec(src))) addKeys(vocab, m[1]);
  for (const rx of RX.keyboard) while ((m = rx.exec(src))) addKeys(vocab, m[1]);
  return vocab;
}

// ---------------------------------------------------------------------------
// File discovery + canonical component key
// ---------------------------------------------------------------------------

async function walk(dir: string): Promise<string[]> {
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Strip ext + .test/.spec/.browser/.ssr/.hydrate qualifiers + Aria* prefix, then alias. */
function canon(basename: string): string {
  let n = basename.toLowerCase().replace(/\.(tsx?|jsx?)$/, "");
  for (;;) {
    const stripped = n.replace(/\.(test-util|test|spec|browser|ssr|hydrate)$/, "");
    if (stripped === n) break;
    n = stripped;
  }
  n = n.replace(/^aria/, "");
  return ALIASES[n] ?? n;
}

const isOurTest = (f: string) => /\.test\.tsx$/.test(f) && !/\.(ssr|hydrate)\.test\.tsx$/.test(f);
const isUpstreamTest = (f: string) =>
  /\.(test\.jsx?|test\.tsx|test-util\.tsx)$/.test(f) && !/\.ssr\./.test(f);

interface Side {
  vocab: Vocab;
  files: string[];
}

async function collect(
  roots: string[],
  keep: (f: string) => boolean,
): Promise<Map<string, Side>> {
  const byKey = new Map<string, Side>();
  for (const root of roots) {
    for (const file of await walk(path.join(ROOT, root))) {
      if (!keep(path.basename(file))) continue;
      const key = canon(path.basename(file));
      const rel = path.relative(ROOT, file);
      let side = byKey.get(key);
      if (!side) {
        side = { vocab: emptyVocab(), files: [] };
        byKey.set(key, side);
      }
      side.files.push(rel);
      mergeInto(side.vocab, extract(await readFile(file, "utf8")));
    }
  }
  return byKey;
}

// ---------------------------------------------------------------------------
// Diff + rank
// ---------------------------------------------------------------------------

const diff = (a: Set<string>, b: Set<string>) => [...a].filter((x) => !b.has(x)).sort();

/** Names are fuzzy (regex fragment vs literal): a name is "covered" by a
 * substring match either direction, so we don't flag `/Close/` against `Close`. */
function nameDiff(ours: Set<string>, theirs: Set<string>): string[] {
  const them = [...theirs];
  return [...ours]
    .filter((n) => !them.some((t) => t.includes(n) || n.includes(t)))
    .sort();
}

interface Row {
  key: string;
  score: number;
  ours: Side;
  upstream: Side;
  weRoles: string[];
  weAria: string[];
  weKeys: string[];
  weNames: string[];
  upRoles: string[];
  upAria: string[];
  upKeys: string[];
}

function fmt(values: string[]): string {
  return values.length ? values.join(", ") : "—";
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

const pin = JSON.parse(readFileSync(path.join(ROOT, "scripts", "upstream-pin.json"), "utf8"));
const vendored = (rel: string): string | null => {
  try {
    return JSON.parse(readFileSync(path.join(ROOT, rel), "utf8")).version;
  } catch {
    return null;
  }
};

const [ours, upstream] = await Promise.all([
  collect([OUR_TEST_ROOT], isOurTest),
  collect(UPSTREAM_TEST_ROOTS, isUpstreamTest),
]);

const rows: Row[] = [];
const ourOnly: string[] = [];
for (const [key, side] of ours) {
  const up = upstream.get(key);
  if (!up) {
    ourOnly.push(key);
    continue;
  }
  const weRoles = diff(side.vocab.roles, up.vocab.roles);
  const weAria = diff(side.vocab.aria, up.vocab.aria);
  const weKeys = diff(side.vocab.keys, up.vocab.keys);
  const weNames = nameDiff(side.vocab.names, up.vocab.names);
  rows.push({
    key,
    ours: side,
    upstream: up,
    // Roles dominate: a role our test queries that upstream never queries is
    // almost always a wrong semantic shape (Toast `listbox`, TagGroup `listbox`).
    // A diverging aria-* / key is usually just broader coverage on our side, so
    // it only nudges the rank.
    score: weRoles.length * 10 + weAria.length * 2 + weKeys.length,
    weRoles,
    weAria,
    weKeys,
    weNames,
    upRoles: diff(up.vocab.roles, side.vocab.roles),
    upAria: diff(up.vocab.aria, side.vocab.aria),
    upKeys: diff(up.vocab.keys, side.vocab.keys),
  });
}
const upstreamOnly = [...upstream.keys()].filter((k) => !ours.has(k)).sort();

rows.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));

// ---- report ----
const sVer = vendored("react-spectrum/packages/@react-spectrum/s2/package.json");
const rVer = vendored("react-spectrum/packages/react-aria-components/package.json");
const drift =
  sVer !== pin.tags["@react-spectrum/s2"] || rVer !== pin.tags["react-aria-components"];

console.log("Upstream test-parity oracle");
console.log(`- pinned release: ${pin.release} (s2 ${pin.tags["@react-spectrum/s2"]}, rac ${pin.tags["react-aria-components"]})`);
console.log(`- vendored tree:  s2 ${sVer ?? "?"}, rac ${rVer ?? "?"}`);
if (drift) {
  console.log("  ⚠ DRIFT: vendored ./react-spectrum does not match the pin — re-materialize it (see .claude/current/upstream-sync.md).");
}
console.log(`- matched components: ${rows.length}  |  ours-without-upstream: ${ourOnly.length}  |  upstream-without-ours: ${upstreamOnly.length}`);

const suspects = rows.filter((r) => r.score > 0);
const roleSuspects = suspects.filter((r) => r.weRoles.length);
console.log(`\n══ RANKED SUSPECTS — our tests assert a shape upstream never asserts (${suspects.length}) ══`);
console.log(`   ${roleSuspects.length} have a ROLE divergence (the high-signal "wrong shape" bucket); the rest are aria/key-only (usually broader coverage).`);
for (const r of suspects) {
  console.log(`\n● ${r.key}  [score ${r.score}]`);
  console.log(`  ours:     ${r.ours.files.join(", ")}`);
  console.log(`  upstream: ${r.upstream.files.join(", ")}`);
  if (r.weRoles.length || r.upRoles.length)
    console.log(`  ROLES  we-only {${fmt(r.weRoles)}}   ‖   upstream-only {${fmt(r.upRoles)}}`);
  if (r.weAria.length || r.upAria.length)
    console.log(`  ARIA   we-only {${fmt(r.weAria)}}   ‖   upstream-only {${fmt(r.upAria)}}`);
  if (r.weKeys.length) console.log(`  KEYS   we-only {${fmt(r.weKeys)}}`);
  if (r.weNames.length)
    console.log(`  names  we-only: ${fmt(r.weNames.slice(0, 10))}${r.weNames.length > 10 ? ` (+${r.weNames.length - 10})` : ""}`);
}

const gaps = rows
  .filter((r) => r.score === 0 && (r.upRoles.length || r.upAria.length || r.upKeys.length))
  .map((r) => ({ ...r, gap: r.upRoles.length * 5 + r.upAria.length * 2 + r.upKeys.length }))
  .sort((a, b) => b.gap - a.gap);
console.log(`\n══ COVERAGE GAPS — clean on suspects; upstream asserts shapes we don't (${gaps.length}) ══`);
for (const r of gaps.slice(0, 20)) {
  const parts = [
    r.upRoles.length ? `roles: ${fmt(r.upRoles)}` : "",
    r.upAria.length ? `aria: ${fmt(r.upAria)}` : "",
    r.upKeys.length ? `keys: ${fmt(r.upKeys.slice(0, 10))}` : "",
  ].filter(Boolean);
  console.log(`  ${r.key.padEnd(16)} ${parts.join("  |  ")}`);
}
if (gaps.length > 20) console.log(`  …and ${gaps.length - 20} more`);

console.log(`\n══ UNMATCHED ══`);
console.log(`  ours, no upstream oracle (bespoke / S2-only / internal): ${ourOnly.sort().join(", ") || "—"}`);
console.log(`  upstream, no port-level test of ours:                    ${upstreamOnly.join(", ") || "—"}`);

console.log(`\nReport-only (exit 0). Reconcile each suspect against the authoritative upstream source before changing a test.`);
