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
 * Our component key is the component that test renders: the outermost imported
 * component in the render tree. Provider and Context wrappers are transparent.
 * Upstream stays keyed by filename. A printed suspect names the file each
 * value came from. Baseline keys stay component|category|value.
 * A role queried for a fixture the same render mounts is not filed on the host.
 * A raw or imported form owns role form, a raw textarea owns role textbox, and
 * an imported Dialog, ContextualHelp, or ContextualHelpTrigger owns role dialog.
 * The host keeps the role when the host is that owner.
 *
 * …then reports, per component:
 *   - WE-ONLY  roles/aria/keys  → prime suspects: we assert a shape upstream
 *     never asserts (e.g. the Toast `listbox`/`Dismiss` divergence class).
 *   - UPSTREAM-ONLY             → coverage gaps: upstream asserts a shape our
 *     tests never touch.
 *
 * This is a discovery/triage aid with a blocking regression floor. The current
 * vocabulary debt is baselined as individual component/category/value facts;
 * remaining we-only / unmatched facts may only shrink. A new unmatched upstream
 * fact exits non-zero. Regenerating the baseline (`--write-baseline`) may not
 * increase counts unless `--allow-growth <ticket>` records the new facts.
 * Names are reported but never scored (they are
 * example-specific); roles dominate the suspect score because a role our test
 * asserts that upstream never does is almost always a genuine wrong-shape bug.
 *
 * Upstream oracle = the gitignored ./react-spectrum tree, pinned via
 * scripts/upstream-pin.json. Re-materialize / bump it per the playbook at
 * .claude/current/upstream-sync.md.
 */

import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts", "upstream-test-parity-baseline.json");
const WRITE_BASELINE = process.argv.includes("--write-baseline");

function parseAllowGrowthTicket(argv: string[]): number | null {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--allow-growth") {
      const next = argv[i + 1];
      if (!next || next.startsWith("-") || !/^\d+$/.test(next)) {
        console.error("FAIL: --allow-growth requires a ticket id (e.g. --allow-growth 228).");
        process.exit(1);
      }
      return Number(next);
    }
    if (arg.startsWith("--allow-growth=")) {
      const raw = arg.slice("--allow-growth=".length);
      if (!/^\d+$/.test(raw)) {
        console.error("FAIL: --allow-growth requires a ticket id (e.g. --allow-growth=228).");
        process.exit(1);
      }
      return Number(raw);
    }
  }
  return null;
}

const ALLOW_GROWTH_TICKET = parseAllowGrowthTicket(process.argv);

interface Floor {
  suspects: string[];
  coverageGaps: string[];
  upstreamOnly: string[];
}

interface GrowthEntry {
  ticket: number;
  at: string;
  added: Floor;
  reasons?: Record<string, string>;
}

interface BaselineFile extends Floor {
  description?: string;
  growthLog?: GrowthEntry[];
}

function floorCounts(floor: Floor): {
  suspects: number;
  coverageGaps: number;
  upstreamOnly: number;
} {
  return {
    suspects: floor.suspects.length,
    coverageGaps: floor.coverageGaps.length,
    upstreamOnly: floor.upstreamOnly.length,
  };
}

function formatDelta(label: string, from: number, to: number): string {
  const delta = to - from;
  const sign = delta > 0 ? `+${delta}` : String(delta);
  return `${label} ${from} → ${to} (Δ${sign})`;
}

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

/** Canonical component key aliases.
 *
 * Genuine cross-suite name folding (kept). S2 renames a RAC primitive, or the
 * upstream filename names a scenario rather than a symbol. Upstream is still
 * filename-attributed, so these folds are what let the two suites meet:
 *   alertdialog, standarddialog → dialog
 *   tableview, editabletableview → table
 *   treeview → tree
 *   picker → select
 *   listview → gridlist
 *   treeble → tree
 *     (Treeble.test.js renders <Table>, and packages/ has no Treeble symbol.)
 *
 * Solid's `Switch` keyword forced ToggleSwitch / SwitchField / SwitchButton.
 * Those are the Switch suite, so they fold onto `switch`. TabSwitch is a
 * SegmentedControl wrapper and must not fold onto `switch`.
 *
 * Removed filename-fold workarounds. Render attribution files each suite under
 * the component it renders, so putting these back would undo that:
 *   togglebuttongroup → togglebutton
 *   checkboxgroup → checkbox
 */
const ALIASES: Record<string, string> = {
  alertdialog: "dialog",
  standarddialog: "dialog",
  tableview: "table",
  editabletableview: "table",
  treeview: "tree",
  treeble: "tree",
  picker: "select",
  listview: "gridlist",
  toggleswitch: "switch",
  switchfield: "switch",
  switchbutton: "switch",
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
  "alert",
  "alertdialog",
  "application",
  "article",
  "banner",
  "blockquote",
  "button",
  "caption",
  "cell",
  "checkbox",
  "code",
  "columnheader",
  "combobox",
  "complementary",
  "contentinfo",
  "definition",
  "deletion",
  "dialog",
  "directory",
  "document",
  "emphasis",
  "feed",
  "figure",
  "form",
  "generic",
  "grid",
  "gridcell",
  "group",
  "heading",
  "img",
  "insertion",
  "link",
  "list",
  "listbox",
  "listitem",
  "log",
  "main",
  "marquee",
  "math",
  "menu",
  "menubar",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "meter",
  "navigation",
  "none",
  "note",
  "option",
  "paragraph",
  "presentation",
  "progressbar",
  "radio",
  "radiogroup",
  "region",
  "row",
  "rowgroup",
  "rowheader",
  "scrollbar",
  "search",
  "searchbox",
  "separator",
  "slider",
  "spinbutton",
  "status",
  "strong",
  "subscript",
  "superscript",
  "switch",
  "tab",
  "table",
  "tablist",
  "tabpanel",
  "term",
  "textbox",
  "timer",
  "toolbar",
  "tooltip",
  "tree",
  "treegrid",
  "treeitem",
]);
const ARIA_ATTRS = new Set([
  "aria-activedescendant",
  "aria-atomic",
  "aria-autocomplete",
  "aria-busy",
  "aria-checked",
  "aria-colcount",
  "aria-colindex",
  "aria-colindextext",
  "aria-colspan",
  "aria-controls",
  "aria-current",
  "aria-describedby",
  "aria-description",
  "aria-details",
  "aria-disabled",
  "aria-errormessage",
  "aria-expanded",
  "aria-flowto",
  "aria-haspopup",
  "aria-hidden",
  "aria-invalid",
  "aria-keyshortcuts",
  "aria-label",
  "aria-labelledby",
  "aria-level",
  "aria-live",
  "aria-modal",
  "aria-multiline",
  "aria-multiselectable",
  "aria-orientation",
  "aria-owns",
  "aria-placeholder",
  "aria-posinset",
  "aria-pressed",
  "aria-readonly",
  "aria-relevant",
  "aria-required",
  "aria-roledescription",
  "aria-rowcount",
  "aria-rowindex",
  "aria-rowindextext",
  "aria-rowspan",
  "aria-selected",
  "aria-setsize",
  "aria-sort",
  "aria-valuemax",
  "aria-valuemin",
  "aria-valuenow",
  "aria-valuetext",
]);
const KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "enter",
  "escape",
  "esc",
  "space",
  "spacebar",
  "tab",
  "home",
  "end",
  "pageup",
  "pagedown",
  "backspace",
  "delete",
  "del",
  "insert",
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
  // Infer the entry type from the call: `Awaited<ReturnType<typeof readdir>>`
  // resolves to the Buffer-flavored `Dirent` under newer @types/node (so
  // `e.name` is typed as a buffer, not a string). A read failure (e.g. a
  // missing dir) is treated as empty.
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => null);
  if (entries === null) return [];
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

const isOurTest = (f: string) =>
  f.endsWith(".test.tsx") &&
  !/\.(ssr|hydrate)\.test\.tsx$/.test(f) &&
  !f.includes(`${path.sep}packages${path.sep}kumo${path.sep}`) &&
  !f.includes(`${path.sep}packages${path.sep}geist${path.sep}`);
const isUpstreamTest = (f: string) =>
  /\.(test\.jsx?|test\.tsx|test-util\.tsx)$/.test(f) && !/\.ssr\./.test(f);

interface Origins {
  roles: Map<string, Set<string>>;
  names: Map<string, Set<string>>;
  aria: Map<string, Set<string>>;
  keys: Map<string, Set<string>>;
}

interface Side {
  vocab: Vocab;
  files: string[];
  origins: Origins;
}

function emptyOrigins(): Origins {
  return { roles: new Map(), names: new Map(), aria: new Map(), keys: new Map() };
}

function emptySide(): Side {
  return { vocab: emptyVocab(), files: [], origins: emptyOrigins() };
}

function addOrigins(side: Side, file: string, vocab: Vocab): void {
  const pairs: [keyof Vocab, keyof Origins][] = [
    ["roles", "roles"],
    ["names", "names"],
    ["aria", "aria"],
    ["keys", "keys"],
  ];
  for (const [vocabKey, originKey] of pairs) {
    for (const value of vocab[vocabKey]) {
      let files = side.origins[originKey].get(value);
      if (!files) {
        files = new Set();
        side.origins[originKey].set(value, files);
      }
      files.add(file);
    }
  }
}

function contribute(byKey: Map<string, Side>, key: string, file: string, vocab: Vocab): void {
  let side = byKey.get(key);
  if (!side) {
    side = emptySide();
    byKey.set(key, side);
  }
  if (!side.files.includes(file)) side.files.push(file);
  mergeInto(side.vocab, vocab);
  addOrigins(side, file, vocab);
}

/** Upstream stays filename-attributed. The file list on each value is what the suspect prints. */
async function collect(roots: string[], keep: (f: string) => boolean): Promise<Map<string, Side>> {
  const byKey = new Map<string, Side>();
  for (const root of roots) {
    for (const file of await walk(path.join(ROOT, root))) {
      if (!keep(file)) continue;
      const key = canon(path.basename(file));
      const rel = path.relative(ROOT, file);
      contribute(byKey, key, rel, extract(await readFile(file, "utf8")));
    }
  }
  return byKey;
}

// ---------------------------------------------------------------------------
// Our suites: attribute by the component each test renders
// ---------------------------------------------------------------------------

type FnLike = ts.ArrowFunction | ts.FunctionExpression;

interface LocalFn {
  node: ts.Node;
  pos: number;
  parentFn: ts.Node | null;
}

interface AttrCtx {
  imports: Map<string, string>;
  locals: Map<string, LocalFn[]>;
}

const TEST_CALLS = new Set(["it", "test", "fit", "xit", "xtest"]);
const RENDER_CALLS = new Set(["render", "renderToString", "renderToStaticMarkup"]);

function isFunctionNode(node: ts.Node): boolean {
  return (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  );
}

function isTransparentName(name: string): boolean {
  return name.endsWith("Provider") || name.endsWith("Context");
}

function isComponentModule(spec: string): boolean {
  return spec.startsWith(".") || spec.startsWith("@proyecto-viviana/");
}

/** PascalCase value imports. `import { ToggleSwitch as Switch }` keys the local name to canon(ToggleSwitch). */
function importMap(sf: ts.SourceFile): Map<string, string> {
  const map = new Map<string, string>();
  for (const stmt of sf.statements) {
    if (!ts.isImportDeclaration(stmt) || stmt.importClause?.isTypeOnly) continue;
    if (!ts.isStringLiteral(stmt.moduleSpecifier) || !isComponentModule(stmt.moduleSpecifier.text))
      continue;
    const clause = stmt.importClause;
    if (!clause) continue;
    if (clause.name && /^[A-Z]/.test(clause.name.text))
      map.set(clause.name.text, canon(clause.name.text));
    const bindings = clause.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const el of bindings.elements) {
      if (el.isTypeOnly) continue;
      const local = el.name.text;
      const original = el.propertyName?.text ?? local;
      if (!/^[A-Z]/.test(local) || !/^[A-Z]/.test(original)) continue;
      map.set(local, canon(original));
    }
  }
  return map;
}

function nearestFunction(node: ts.Node | undefined): ts.Node | null {
  let current = node;
  while (current) {
    if (isFunctionNode(current)) return current;
    current = current.parent;
  }
  return null;
}

function indexLocals(sf: ts.SourceFile): Map<string, LocalFn[]> {
  const map = new Map<string, LocalFn[]>();
  const add = (name: string, node: ts.Node): void => {
    const list = map.get(name) ?? [];
    list.push({ node, pos: node.pos, parentFn: nearestFunction(node.parent) });
    map.set(name, list);
  };
  const walk = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node) && node.name) add(node.name.text, node);
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))
    ) {
      add(node.name.text, node.initializer);
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return map;
}

function resolveLocal(name: string, at: ts.Node, locals: Map<string, LocalFn[]>): ts.Node | null {
  const candidates = locals.get(name);
  if (!candidates) return null;
  let best: LocalFn | null = null;
  for (const candidate of candidates) {
    if (candidate.parentFn && (at.pos < candidate.parentFn.pos || at.end > candidate.parentFn.end))
      continue;
    if (!best || candidate.pos > best.pos) best = candidate;
  }
  return best?.node ?? null;
}

function rootCalleeName(expr: ts.Expression): string | null {
  let node: ts.Node = expr;
  while (
    ts.isCallExpression(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    node = node.expression;
  }
  return ts.isIdentifier(node) ? node.text : null;
}

function lastFunctionArg(call: ts.CallExpression): FnLike | null {
  for (let i = call.arguments.length - 1; i >= 0; i--) {
    const arg = call.arguments[i];
    if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) return arg;
  }
  return null;
}

function returnExprs(fn: ts.Node): ts.Expression[] {
  if (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)) {
    if (!ts.isBlock(fn.body)) return [fn.body];
    return returnsInBody(fn.body);
  }
  if (ts.isFunctionDeclaration(fn) && fn.body) return returnsInBody(fn.body);
  return [];
}

function returnsInBody(body: ts.Block): ts.Expression[] {
  const out: ts.Expression[] = [];
  const walk = (node: ts.Node): void => {
    if (node !== body && isFunctionNode(node)) return;
    if (ts.isReturnStatement(node) && node.expression) out.push(node.expression);
    ts.forEachChild(node, walk);
  };
  walk(body);
  return out;
}

/** Render calls in this function only. Nested helpers are followed separately, so a render inside an uncalled closure is not a subject. */
function findRenderArgs(root: ts.Node): ts.Expression[] {
  const args: ts.Expression[] = [];
  const walk = (node: ts.Node): void => {
    if (node !== root && isFunctionNode(node)) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      RENDER_CALLS.has(node.expression.text)
    ) {
      const arg = node.arguments[0];
      if (arg) args.push(arg);
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(root);
  return args;
}

function collectHelpers(
  root: ts.Node,
  locals: Map<string, LocalFn[]>,
  depth: number,
  seen: Set<ts.Node>,
): ts.Node[] {
  if (depth <= 0) return [];
  const found: ts.Node[] = [];
  const walk = (node: ts.Node): void => {
    if (node !== root && isFunctionNode(node)) return;
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const fn = resolveLocal(node.expression.text, node, locals);
      if (fn && !seen.has(fn)) {
        seen.add(fn);
        found.push(fn);
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(root);
  const nested: ts.Node[] = [];
  for (const fn of found) nested.push(...collectHelpers(fn, locals, depth - 1, seen));
  return [...found, ...nested];
}

function leftmostIdentifier(node: ts.Node): ts.Identifier | null {
  let current = node;
  while (ts.isPropertyAccessExpression(current)) current = current.expression;
  return ts.isIdentifier(current) ? current : null;
}

function childList(node: ts.JsxElement | ts.JsxFragment | ts.JsxSelfClosingElement): ts.JsxChild[] {
  if (ts.isJsxSelfClosingElement(node)) return [];
  return [...node.children];
}

function jsxAttributes(node: ts.JsxElement | ts.JsxSelfClosingElement): ts.JsxAttributeLike[] {
  const open = ts.isJsxElement(node) ? node.openingElement : node;
  return [...open.attributes.properties];
}

function walkExpr(expr: ts.Expression, found: string[], ctx: AttrCtx, seen: Set<ts.Node>): void {
  if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr)) {
    visitJsx(expr, found, ctx, seen);
    return;
  }
  if (ts.isJsxFragment(expr)) {
    visitChildren(childList(expr), found, ctx, seen);
    return;
  }
  if (
    ts.isParenthesizedExpression(expr) ||
    ts.isAsExpression(expr) ||
    ts.isTypeAssertionExpression(expr) ||
    ts.isSatisfiesExpression(expr) ||
    ts.isNonNullExpression(expr)
  ) {
    walkExpr(expr.expression, found, ctx, seen);
    return;
  }
  if (ts.isConditionalExpression(expr)) {
    walkExpr(expr.whenTrue, found, ctx, seen);
    walkExpr(expr.whenFalse, found, ctx, seen);
    return;
  }
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (
      op === ts.SyntaxKind.AmpersandAmpersandToken ||
      op === ts.SyntaxKind.QuestionQuestionToken
    ) {
      walkExpr(expr.right, found, ctx, seen);
      return;
    }
    if (op === ts.SyntaxKind.BarBarToken) {
      walkExpr(expr.left, found, ctx, seen);
      walkExpr(expr.right, found, ctx, seen);
      return;
    }
  }
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) {
    for (const ret of returnExprs(expr)) walkExpr(ret, found, ctx, seen);
    return;
  }
  if (ts.isCallExpression(expr)) {
    for (const arg of expr.arguments) walkExpr(arg, found, ctx, seen);
    return;
  }
  if (ts.isArrayLiteralExpression(expr)) {
    for (const el of expr.elements) {
      if (ts.isSpreadElement(el)) walkExpr(el.expression, found, ctx, seen);
      else if (ts.isExpression(el)) walkExpr(el, found, ctx, seen);
    }
    return;
  }
  if (ts.isIdentifier(expr)) visitComponentName(expr.text, expr, null, found, ctx, seen);
}

function visitChildren(
  children: readonly ts.JsxChild[],
  found: string[],
  ctx: AttrCtx,
  seen: Set<ts.Node>,
): void {
  for (const child of children) {
    if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child))
      visitJsx(child, found, ctx, seen);
    else if (ts.isJsxFragment(child)) visitChildren(childList(child), found, ctx, seen);
    else if (ts.isJsxExpression(child) && child.expression)
      walkExpr(child.expression, found, ctx, seen);
  }
}

function visitAttributes(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  found: string[],
  ctx: AttrCtx,
  seen: Set<ts.Node>,
): void {
  for (const attr of jsxAttributes(node)) {
    if (!ts.isJsxAttribute(attr) || !attr.initializer || !ts.isJsxExpression(attr.initializer))
      continue;
    if (attr.initializer.expression) walkExpr(attr.initializer.expression, found, ctx, seen);
  }
}

function descendJsx(
  node: ts.JsxElement | ts.JsxSelfClosingElement | ts.JsxFragment,
  found: string[],
  ctx: AttrCtx,
  seen: Set<ts.Node>,
): void {
  visitChildren(childList(node), found, ctx, seen);
  if (!ts.isJsxFragment(node)) visitAttributes(node, found, ctx, seen);
}

/** Record an imported component, or step through a wrapper / local helper. `callSite` is the JSX element whose children are the fallback. */
function visitComponentName(
  name: string,
  at: ts.Node,
  callSite: ts.JsxElement | ts.JsxSelfClosingElement | null,
  found: string[],
  ctx: AttrCtx,
  seen: Set<ts.Node>,
): void {
  const descend = (): void => {
    if (callSite) descendJsx(callSite, found, ctx, seen);
  };
  if (/^[a-z]/.test(name) || isTransparentName(name)) {
    descend();
    return;
  }
  const imported = ctx.imports.get(name);
  if (imported) {
    found.push(imported);
    return;
  }
  const fn = resolveLocal(name, at, ctx.locals);
  if (fn) {
    if (seen.has(fn)) return;
    seen.add(fn);
    const before = found.length;
    for (const ret of returnExprs(fn)) walkExpr(ret, found, ctx, seen);
    if (found.length === before) descend();
    return;
  }
  descend();
}

function visitJsx(
  node: ts.JsxElement | ts.JsxSelfClosingElement,
  found: string[],
  ctx: AttrCtx,
  seen: Set<ts.Node>,
): void {
  const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
  if (ts.isIdentifier(tag)) {
    visitComponentName(tag.text, node, node, found, ctx, seen);
    return;
  }
  if (ts.isPropertyAccessExpression(tag)) {
    if (isTransparentName(tag.name.text)) {
      descendJsx(node, found, ctx, seen);
      return;
    }
    const left = leftmostIdentifier(tag);
    if (left && ctx.imports.has(left.text) && !isTransparentName(left.text)) {
      found.push(ctx.imports.get(left.text)!);
      return;
    }
    descendJsx(node, found, ctx, seen);
    return;
  }
  descendJsx(node, found, ctx, seen);
}

function subjectsFromRenderArg(arg: ts.Expression, ctx: AttrCtx): string[] {
  const found: string[] = [];
  walkExpr(arg, found, ctx, new Set());
  return found;
}

function hasVocab(vocab: Vocab): boolean {
  return vocab.roles.size + vocab.names.size + vocab.aria.size + vocab.keys.size > 0;
}

/** One outermost subject wins. Sibling subjects (two controls under one provider) keep the filename so vocab is not copied onto both. No subject with no vocab registers nothing. */
function attributeKey(subjects: string[], filenameKey: string, vocab: Vocab): string | null {
  const unique = [...new Set(subjects)];
  if (unique.length === 1) return unique[0];
  if (unique.length > 1) return filenameKey;
  return hasVocab(vocab) ? filenameKey : null;
}

function hooksInDescribe(describeCb: FnLike): FnLike[] {
  const hooks: FnLike[] = [];
  const body = describeCb.body;
  const walk = (node: ts.Node): void => {
    if (node !== body && isFunctionNode(node)) return;
    if (ts.isCallExpression(node)) {
      const name = rootCalleeName(node.expression);
      if (name === "describe" || TEST_CALLS.has(name ?? "")) return;
      if (name === "beforeEach" || name === "beforeAll") {
        const hook = lastFunctionArg(node);
        if (hook) hooks.push(hook);
        return;
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(body);
  return hooks;
}

function ancestorHooks(testCall: ts.Node): FnLike[] {
  const hooks: FnLike[] = [];
  let parent: ts.Node | undefined = testCall.parent;
  while (parent) {
    if (ts.isCallExpression(parent) && rootCalleeName(parent.expression) === "describe") {
      const cb = lastFunctionArg(parent);
      if (cb) hooks.push(...hooksInDescribe(cb));
    }
    parent = parent.parent;
  }
  return hooks;
}

function collectTestCalls(sf: ts.SourceFile): { call: ts.CallExpression; cb: FnLike }[] {
  const tests: { call: ts.CallExpression; cb: FnLike }[] = [];
  const walk = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && TEST_CALLS.has(rootCalleeName(node.expression) ?? "")) {
      const cb = lastFunctionArg(node);
      if (cb) tests.push({ call: node, cb });
      return;
    }
    ts.forEachChild(node, walk);
  };
  walk(sf);
  return tests;
}

/** Regex literals are patterns, not assertions. `normalizeIds` lists aria-*
 * names in one shared snapshot normalizer; folding that source onto every
 * caller would file those names under each rendered component. String
 * assertions (`toHaveAttribute("aria-checked")`) and name regexes stay. */
function vocabText(sf: ts.SourceFile, node: ts.Node): string {
  const text = node.getText(sf);
  const start = node.getStart(sf);
  const blanks: { pos: number; end: number }[] = [];
  const walk = (n: ts.Node): void => {
    if (ts.isRegularExpressionLiteral(n) && n.getText(sf).includes("aria-")) {
      blanks.push({ pos: n.getStart(sf) - start, end: n.getEnd() - start });
    }
    ts.forEachChild(n, walk);
  };
  walk(node);
  if (blanks.length === 0) return text;
  let out = "";
  let cursor = 0;
  for (const span of blanks) {
    out += text.slice(cursor, span.pos) + '""';
    cursor = span.end;
  }
  return out + text.slice(cursor);
}

interface RenderMarks {
  intrinsics: Set<string>;
  imported: Set<string>;
}

function noteJsxTag(tag: ts.JsxTagNameExpression, ctx: AttrCtx, marks: RenderMarks): void {
  if (ts.isIdentifier(tag)) {
    if (/^[a-z]/.test(tag.text)) {
      marks.intrinsics.add(tag.text);
      return;
    }
    const imported = ctx.imports.get(tag.text);
    if (imported) marks.imported.add(imported);
    return;
  }
  if (ts.isPropertyAccessExpression(tag)) {
    const left = leftmostIdentifier(tag);
    if (left) {
      const imported = ctx.imports.get(left.text);
      if (imported) marks.imported.add(imported);
    }
  }
}

/** Every tag in the render tree, including tags inside the outermost component. Local helpers are followed; the subject walk still stops at the outermost import. */
function collectRenderMarks(
  node: ts.Node,
  ctx: AttrCtx,
  marks: RenderMarks,
  seen: Set<ts.Node>,
): void {
  if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
    const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
    noteJsxTag(tag, ctx, marks);
    if (ts.isIdentifier(tag) && /^[A-Z]/.test(tag.text) && !ctx.imports.has(tag.text)) {
      const fn = resolveLocal(tag.text, node, ctx.locals);
      if (fn && !seen.has(fn)) {
        seen.add(fn);
        collectRenderMarks(fn, ctx, marks, seen);
      }
    }
  } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const fn = resolveLocal(node.expression.text, node, ctx.locals);
    if (fn && !seen.has(fn)) {
      seen.add(fn);
      collectRenderMarks(fn, ctx, marks, seen);
    }
  }
  ts.forEachChild(node, (child) => collectRenderMarks(child, ctx, marks, seen));
}

function omitFixtureRoles(vocab: Vocab, marks: RenderMarks, subject: string): void {
  if (subject !== "form" && (marks.intrinsics.has("form") || marks.imported.has("form"))) {
    vocab.roles.delete("form");
  }
  if (subject !== "textarea" && marks.intrinsics.has("textarea")) {
    vocab.roles.delete("textbox");
  }
  const ownsDialog =
    marks.imported.has("dialog") ||
    marks.imported.has("contextualhelp") ||
    marks.imported.has("contextualhelptrigger");
  if (ownsDialog && subject !== "dialog" && subject !== "contextualhelp") {
    vocab.roles.delete("dialog");
  }
}

function attributeFile(
  sf: ts.SourceFile,
  rel: string,
  filenameKey: string,
  byKey: Map<string, Side>,
): void {
  const ctx: AttrCtx = { imports: importMap(sf), locals: indexLocals(sf) };
  for (const { call, cb } of collectTestCalls(sf)) {
    const helpers = collectHelpers(cb, ctx.locals, 2, new Set());
    let renderArgs = findRenderArgs(cb);
    const vocabParts = [vocabText(sf, call)];
    if (renderArgs.length === 0) {
      for (const helper of helpers) renderArgs.push(...findRenderArgs(helper));
    }
    for (const helper of helpers) vocabParts.push(vocabText(sf, helper));
    if (renderArgs.length === 0) {
      for (const hook of ancestorHooks(call)) {
        vocabParts.push(vocabText(sf, hook));
        renderArgs.push(...findRenderArgs(hook));
        for (const helper of collectHelpers(hook, ctx.locals, 2, new Set())) {
          vocabParts.push(vocabText(sf, helper));
          renderArgs.push(...findRenderArgs(helper));
        }
      }
    }
    const vocab = extract(vocabParts.join("\n"));
    const subjects: string[] = [];
    for (const arg of renderArgs) subjects.push(...subjectsFromRenderArg(arg, ctx));
    const key = attributeKey(subjects, filenameKey, vocab);
    if (!key) continue;
    const marks: RenderMarks = { intrinsics: new Set(), imported: new Set() };
    const seenMarks = new Set<ts.Node>();
    for (const arg of renderArgs) collectRenderMarks(arg, ctx, marks, seenMarks);
    omitFixtureRoles(vocab, marks, key);
    contribute(byKey, key, rel, vocab);
  }
}

async function collectOurs(roots: string[]): Promise<Map<string, Side>> {
  const byKey = new Map<string, Side>();
  for (const root of roots) {
    for (const file of await walk(path.join(ROOT, root))) {
      if (!isOurTest(file)) continue;
      const rel = path.relative(ROOT, file);
      const text = await readFile(file, "utf8");
      const sf = ts.createSourceFile(rel, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      attributeFile(sf, rel, canon(path.basename(file)), byKey);
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
  return [...ours].filter((n) => !them.some((t) => t.includes(n) || n.includes(t))).sort();
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

function printValueFiles(values: string[], origins: Map<string, Set<string>>): void {
  for (const value of values) {
    const files = [...(origins.get(value) ?? [])].sort();
    console.log(`    ${value} ← ${files.length ? files.join(", ") : "(no file)"}`);
  }
}

function facts(key: string, category: string, values: string[]): string[] {
  return values.map((value) => `${key}|${category}|${value}`);
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
  collectOurs([OUR_TEST_ROOT]),
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
const drift = sVer !== pin.tags["@react-spectrum/s2"] || rVer !== pin.tags["react-aria-components"];

console.log("Upstream test-parity oracle");
console.log(
  `- pinned release: ${pin.release} (s2 ${pin.tags["@react-spectrum/s2"]}, rac ${pin.tags["react-aria-components"]})`,
);
console.log(`- vendored tree:  s2 ${sVer ?? "?"}, rac ${rVer ?? "?"}`);
if (drift) {
  console.log(
    "  ⚠ DRIFT: vendored ./react-spectrum does not match the pin — re-materialize it (see .claude/current/upstream-sync.md).",
  );
}
console.log(
  `- matched components: ${rows.length}  |  ours-without-upstream: ${ourOnly.length}  |  upstream-without-ours: ${upstreamOnly.length}`,
);
console.log(
  "- attribution: ours by rendered component; upstream by filename; each suspect value names its source file",
);

const suspects = rows.filter((r) => r.score > 0);
const roleSuspects = suspects.filter((r) => r.weRoles.length);
console.log(
  `\n══ RANKED SUSPECTS — our tests assert a shape upstream never asserts (${suspects.length}) ══`,
);
console.log(
  `   ${roleSuspects.length} have a ROLE divergence (the high-signal "wrong shape" bucket); the rest are aria/key-only (usually broader coverage).`,
);
for (const r of suspects) {
  console.log(`\n● ${r.key}  [score ${r.score}]`);
  console.log(`  ours:     ${r.ours.files.join(", ")}`);
  console.log(`  upstream: ${r.upstream.files.join(", ")}`);
  if (r.weRoles.length || r.upRoles.length)
    console.log(`  ROLES  we-only {${fmt(r.weRoles)}}   ‖   upstream-only {${fmt(r.upRoles)}}`);
  printValueFiles(r.weRoles, r.ours.origins.roles);
  if (r.weAria.length || r.upAria.length)
    console.log(`  ARIA   we-only {${fmt(r.weAria)}}   ‖   upstream-only {${fmt(r.upAria)}}`);
  printValueFiles(r.weAria, r.ours.origins.aria);
  if (r.weKeys.length) console.log(`  KEYS   we-only {${fmt(r.weKeys)}}`);
  printValueFiles(r.weKeys, r.ours.origins.keys);
  if (r.weNames.length)
    console.log(
      `  names  we-only: ${fmt(r.weNames.slice(0, 10))}${r.weNames.length > 10 ? ` (+${r.weNames.length - 10})` : ""}`,
    );
}

const gaps = rows
  .filter((r) => r.score === 0 && (r.upRoles.length || r.upAria.length || r.upKeys.length))
  .map((r) => ({ ...r, gap: r.upRoles.length * 5 + r.upAria.length * 2 + r.upKeys.length }))
  .sort((a, b) => b.gap - a.gap);
console.log(
  `\n══ COVERAGE GAPS — clean on suspects; upstream asserts shapes we don't (${gaps.length}) ══`,
);
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
console.log(
  `  ours, no upstream oracle (bespoke / S2-only / internal): ${ourOnly.sort().join(", ") || "—"}`,
);
console.log(
  `  upstream, no port-level test of ours:                    ${upstreamOnly.join(", ") || "—"}`,
);

const currentFloor = {
  suspects: rows
    .flatMap((r) => [
      ...facts(r.key, "role", r.weRoles),
      ...facts(r.key, "aria", r.weAria),
      ...facts(r.key, "key", r.weKeys),
    ])
    .sort(),
  coverageGaps: gaps
    .flatMap((r) => [
      ...facts(r.key, "role", r.upRoles),
      ...facts(r.key, "aria", r.upAria),
      ...facts(r.key, "key", r.upKeys),
    ])
    .sort(),
  upstreamOnly: upstreamOnly.slice().sort(),
};

const BASELINE_DESCRIPTION =
  "Frozen vocabulary findings at the pinned upstream oracle. Our facts are attributed by the rendered component; printed suspects name the source file. Remaining we-only / unmatched facts may only shrink. A new unmatched upstream fact fails. --write-baseline may not increase counts unless --allow-growth <ticket> records the new facts in growthLog.";

function additionsAgainst(baseline: Floor, current: Floor): Floor {
  return {
    suspects: current.suspects.filter((fact) => !baseline.suspects.includes(fact)),
    coverageGaps: current.coverageGaps.filter((fact) => !baseline.coverageGaps.includes(fact)),
    upstreamOnly: current.upstreamOnly.filter((key) => !baseline.upstreamOnly.includes(key)),
  };
}

function floorGrew(baseline: Floor, current: Floor): boolean {
  const from = floorCounts(baseline);
  const to = floorCounts(current);
  return (
    to.suspects > from.suspects ||
    to.coverageGaps > from.coverageGaps ||
    to.upstreamOnly > from.upstreamOnly
  );
}

function printCountDelta(baseline: Floor | null, current: Floor): void {
  if (!baseline) {
    console.log(
      `\ncount delta: no baseline yet; current ${formatDelta("suspects", 0, current.suspects.length)}, ${formatDelta("coverageGaps", 0, current.coverageGaps.length)}, ${formatDelta("upstreamOnly", 0, current.upstreamOnly.length)}`,
    );
    return;
  }
  const from = floorCounts(baseline);
  const to = floorCounts(current);
  console.log(
    `\ncount delta vs baseline: ${formatDelta("suspects", from.suspects, to.suspects)}, ${formatDelta("coverageGaps", from.coverageGaps, to.coverageGaps)}, ${formatDelta("upstreamOnly", from.upstreamOnly, to.upstreamOnly)}`,
  );
}

const existingBaseline = existsSync(BASELINE_PATH)
  ? (JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as BaselineFile)
  : null;

printCountDelta(existingBaseline, currentFloor);

if (WRITE_BASELINE) {
  if (
    existingBaseline &&
    floorGrew(existingBaseline, currentFloor) &&
    ALLOW_GROWTH_TICKET == null
  ) {
    const added = additionsAgainst(existingBaseline, currentFloor);
    console.error("");
    console.error(
      "FAIL: --write-baseline would grow the ratchet. Pass --allow-growth <ticket> to record the new facts.",
    );
    if (added.suspects.length > 0) {
      console.error("New suspect facts:");
      for (const fact of added.suspects) console.error(`  - ${fact}`);
    }
    if (added.coverageGaps.length > 0) {
      console.error("New coverage-gap facts:");
      for (const fact of added.coverageGaps) console.error(`  - ${fact}`);
    }
    if (added.upstreamOnly.length > 0) {
      console.error("New unmatched upstream suites:");
      for (const key of added.upstreamOnly) console.error(`  - ${key}`);
    }
    process.exit(1);
  }

  const growthLog = [...(existingBaseline?.growthLog ?? [])];
  if (existingBaseline && ALLOW_GROWTH_TICKET != null) {
    const added = additionsAgainst(existingBaseline, currentFloor);
    if (
      added.suspects.length > 0 ||
      added.coverageGaps.length > 0 ||
      added.upstreamOnly.length > 0
    ) {
      growthLog.push({
        ticket: ALLOW_GROWTH_TICKET,
        at: new Date().toISOString().slice(0, 10),
        added,
      });
    }
  }

  writeFileSync(
    BASELINE_PATH,
    `${JSON.stringify(
      {
        description: BASELINE_DESCRIPTION,
        ...currentFloor,
        ...(growthLog.length > 0 ? { growthLog } : {}),
      },
      null,
      2,
    )}\n`,
  );
  console.log(`\nWrote regression floor → ${path.relative(ROOT, BASELINE_PATH)}`);
  process.exit(0);
}

if (!existingBaseline) {
  console.error(
    `\nFAIL: missing ${path.relative(ROOT, BASELINE_PATH)}. Create it intentionally with --write-baseline.`,
  );
  process.exit(1);
}

const additions = additionsAgainst(existingBaseline, currentFloor);

if (
  drift ||
  additions.suspects.length > 0 ||
  additions.coverageGaps.length > 0 ||
  additions.upstreamOnly.length > 0
) {
  console.error("");
  if (drift) console.error("FAIL: the vendored oracle does not match scripts/upstream-pin.json.");
  if (additions.suspects.length > 0) {
    console.error("New suspect facts:");
    for (const fact of additions.suspects) console.error(`  - ${fact}`);
  }
  if (additions.coverageGaps.length > 0) {
    console.error("New coverage-gap facts:");
    for (const fact of additions.coverageGaps) console.error(`  - ${fact}`);
  }
  if (additions.upstreamOnly.length > 0) {
    console.error("New upstream suites without a port-level test:");
    for (const key of additions.upstreamOnly) console.error(`  - ${key}`);
  }
  process.exit(1);
}

console.log(
  `\nPASS: no findings were added beyond ${path.relative(ROOT, BASELINE_PATH)} (ratchet is one-way: remaining we-only / unmatched facts may only shrink). Reconcile baselined suspects against authoritative source before changing behavior.`,
);
