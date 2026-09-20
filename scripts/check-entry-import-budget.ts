/**
 * Entry import budget: how much of the workspace a consumer pulls in when it
 * imports one published entry point.
 *
 * `@proyecto-viviana/ui`'s Provider imported six symbols from the
 * `@proyecto-viviana/solidaria` root barrel, so an app that rendered only a
 * Provider resolved 90 solidaria modules — the entire primitive surface —
 * before it rendered a single primitive. Narrowing those specifiers to
 * `solidaria/i18n` and `solidaria/overlays` dropped the entry to 17. Nothing
 * measured that, so nothing stopped it coming back on the next refactor.
 *
 * The guard has two halves:
 *
 * 1. A per-entry ceiling, measured against `src/`. Starting at each budgeted
 *    entry's `exports` target, mapped back to the source file it is emitted
 *    from, it follows static `import`/`export … from` specifiers, resolving
 *    workspace bare specifiers through the imported package's own `exports`
 *    map, and counts the distinct source modules reached. Re-adding a
 *    root-barrel import to a budgeted entry's graph puts it back over its
 *    ceiling.
 *
 *    It counted emitted `dist/` chunks until #566. A chunk is rolldown's unit,
 *    not a consumer's: the bundler folds a single-importer module into its
 *    caller and splits it out again when the module gains imports of its own,
 *    so a ceiling moved when the bundler or the JSX plugin moved and the first
 *    answer to a ceiling that moved on its own is to raise it. Source
 *    reachability answers the question the guard is asking — what does
 *    importing this entry pull in — and nothing else can move it.
 *
 *    Type-only imports and build-time macro imports are excluded: neither
 *    survives into what a consumer loads, and `dist/` excluded both by
 *    construction. See `specifiersOf`.
 * 2. A frozen inventory of the source files that still import the solidaria
 *    root barrel. It may only shrink. This half needs no build, and it covers
 *    the entries that have no ceiling yet.
 *
 * Regenerate both with `--write-baseline` after an intentional change.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BUDGET_PATH = path.join(ROOT, "scripts", "entry-import-budget.json");
const WRITE_BASELINE = process.argv.includes("--write-baseline");
// Reporting mode: print each budgeted entry's module list, taken from the same
// traversal the ceiling is measured with, so a drift can be diffed rather than
// reasoned about. Reports and exits 0; it checks nothing.
const PRINT_MODULES = process.argv.includes("--print-modules");

// Workspace package name → directory. A specifier that resolves here is a
// module the consumer pays for; anything else (solid-js, a real dependency) is
// out of scope for this budget.
const WORKSPACE: Record<string, string> = {
  "@proyecto-viviana/solid-stately": "packages/solid-stately",
  "@proyecto-viviana/solidaria": "packages/solidaria",
  "@proyecto-viviana/solidaria-components": "packages/solidaria-components",
  "@proyecto-viviana/kumo": "packages/kumo",
  "@proyecto-viviana/geist": "packages/geist",
  "@proyecto-viviana/solid-spectrum": "packages/solid-spectrum",
  "@proyecto-viviana/ui": "packages/viviana-ui",
};

const ROOT_BARREL = "@proyecto-viviana/solidaria";
const ROOT_BARREL_SPECIFIER = new RegExp(`from\\s*["']${ROOT_BARREL}["']`);
const SOURCE_TREES = Object.values(WORKSPACE).map((dir) => path.join(dir, "src"));

// Entries whose ceiling this guard holds. Each names the package by its
// published name and the subpath a consumer writes.
type BudgetEntry = {
  package: string;
  entry: string;
  maxModules: number;
  maxSolidariaModules: number;
};

type Budget = {
  description: string;
  unit: string;
  entries: BudgetEntry[];
  rootBarrelInventory: { description: string; maxCount: number; paths: string[] };
};

const manifests = new Map<string, Record<string, unknown>>();

function manifestOf(dir: string): Record<string, unknown> {
  let cached = manifests.get(dir);
  if (!cached) {
    cached = JSON.parse(readFileSync(path.join(ROOT, dir, "package.json"), "utf8"));
    manifests.set(dir, cached!);
  }
  return cached!;
}

const SOURCE_EXTENSIONS = [".ts", ".tsx"];

// A directory import and an extensionless file import are the same specifier in
// TypeScript, so both shapes are tried for every resolution in this file.
function sourceFileAt(base: string): string | null {
  for (const extension of SOURCE_EXTENSIONS) {
    if (existsSync(base + extension)) return base + extension;
  }
  for (const extension of SOURCE_EXTENSIONS) {
    const candidate = path.join(base, `index${extension}`);
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

// Every `exports` condition in this repository points into `dist/`; there is no
// source condition to lean on. So the mapping back is mechanical: strip the
// `dist/` prefix and the emitted extension, and look for that path under `src/`
// as a file or a directory with an index. It is the one place the guard turns a
// published target into a source file — both the budgeted entries and the
// workspace bare specifiers go through here.
function sourceOfTarget(dir: string, target: string): string | null {
  const emitted = target
    .replace(/^\.\//, "")
    .replace(/^dist\//, "")
    .replace(/\.d\.ts$/, "")
    .replace(/\.(js|jsx|mjs)$/, "");
  return sourceFileAt(path.join(ROOT, dir, "src", emitted));
}

// The published targets of a subpath, in the order the source mapping should
// try them. `types` is tsc's output and mirrors `src/` one file to one file;
// the runtime condition is the bundler's, and a bundler may rename an entry —
// solid-stately emits `src/flags/flags.ts` as `dist/private/flags/flags.js`,
// and only its `types` condition still spells the source path. So try the
// declaration first and the runtime target second. `solid` points at the same
// graph as `import` in .jsx form, so either maps back to the same module.
function publishedTargets(dir: string, subpath: string): string[] {
  const exports = manifestOf(dir).exports as Record<string, unknown> | undefined;
  const condition = exports?.[subpath];
  if (typeof condition === "string") return [condition];
  const conditions = condition as Record<string, string> | undefined;
  return [conditions?.types, conditions?.import, conditions?.default].filter(
    (target): target is string => typeof target === "string",
  );
}

// What the manifest publishes, for error messages.
function publishedTarget(dir: string, subpath: string): string | null {
  const targets = publishedTargets(dir, subpath);
  return targets.length > 0 ? targets.at(-1)! : null;
}

function exportTarget(dir: string, subpath: string): string | null {
  for (const target of publishedTargets(dir, subpath)) {
    const source = sourceOfTarget(dir, target);
    if (source) return source;
  }
  return null;
}

function isWorkspaceSpecifier(specifier: string): boolean {
  return Object.keys(WORKSPACE).some(
    (name) => specifier === name || specifier.startsWith(`${name}/`),
  );
}

function resolveWorkspace(specifier: string): string | null {
  for (const [name, dir] of Object.entries(WORKSPACE)) {
    if (specifier !== name && !specifier.startsWith(`${name}/`)) continue;
    const subpath = specifier === name ? "." : `./${specifier.slice(name.length + 1)}`;
    return exportTarget(dir, subpath);
  }
  return null;
}

// An import clause never contains a `;`, so bounding the match on one keeps a
// missing `from` from swallowing the rest of the file. Group 1 is the clause
// between the keyword and `from`, group 2 the specifier, group 3 whatever
// trails it on the same line — the import attribute, when there is one.
const FROM_SPECIFIER = /^\s*(?:import|export)\b([^;]*?)\bfrom\s*["']([^"']+)["']([^;\n]*)/gm;
const SIDE_EFFECT_SPECIFIER = /^\s*import\s*["']([^"']+)["']([^;\n]*)/gm;

// What a consumer pays for is what survives into the module it loads, which is
// the sentence the ceiling exists to keep true. Two kinds of specifier do not
// survive, and `dist/` excluded both by construction — the first by erasure,
// the second because the macro runs at build time and is replaced by its
// result. Counting either against a source graph would measure something no
// consumer loads.
//
// Erased: `import type … from`, `export type … from`, and a clause whose every
// brace binding is `type`-qualified. An unmarked binding that happens to name a
// type is indistinguishable from a value without a type checker, so it counts;
// the number is a ceiling on what a consumer may pay, and that errs upward.
function isTypeOnly(clause: string): boolean {
  if (/^\s*type\b/.test(clause)) return true;
  const open = clause.indexOf("{");
  if (open === -1) return false;
  // A default or namespace binding sits outside the braces and is a value.
  if (clause.slice(0, open).replace(/[\s,]/g, "").length > 0) return false;
  const bindings = clause
    .slice(open + 1, clause.lastIndexOf("}"))
    .split(",")
    .map((binding) => binding.trim())
    .filter(Boolean);
  return bindings.length > 0 && bindings.every((binding) => /^type\b/.test(binding));
}

// Build-time: `… from "../style" with { type: "macro" }`. The style macro is
// evaluated during the build and emits CSS; none of its module graph reaches
// the consumer.
function isMacroImport(attributes: string): boolean {
  return /\bwith\s*\{[^}]*\btype\s*:\s*["']macro["']/.test(attributes);
}

function specifiersOf(code: string): string[] {
  const found = new Set<string>();
  for (const match of code.matchAll(FROM_SPECIFIER)) {
    if (isTypeOnly(match[1]!) || isMacroImport(match[3]!)) continue;
    found.add(match[2]!);
  }
  for (const match of code.matchAll(SIDE_EFFECT_SPECIFIER)) {
    if (isMacroImport(match[2]!)) continue;
    found.add(match[1]!);
  }
  return [...found];
}

// A specifier that names a file this guard does not walk — a JSON translation
// bundle, a stylesheet, an asset. `dist/` never counted these either: the old
// traversal took `.js` siblings only.
const NON_SOURCE_SPECIFIER = /\.(json|css|svg|png|jpe?g|webp|woff2?|txt|md)$/;

function resolveRelative(from: string, specifier: string): string | null {
  // TypeScript lets a source specifier carry the emitted extension
  // (`./createHiddenSelect.jsx`); the file on disk is the `.tsx` beside it.
  const withoutEmittedExtension = specifier.replace(/\.(js|jsx)$/, "");
  return sourceFileAt(path.resolve(path.dirname(from), withoutEmittedExtension));
}

// `reachedFrom` records the module and specifier that first pulled each file
// in, which is what names the import behind a ceiling. It is written on every
// traversal and read only by `--print-modules`.
const reachedFrom = new Map<string, { parent: string; specifier: string }>();

// A specifier that names a workspace module and resolves to nothing is the same
// hole as an entry that will not resolve: it silently removes everything behind
// it from the count. Collected per traversal and reported as a failure.
const unresolvedSpecifiers: string[] = [];

function reachableModules(entryFile: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entryFile];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    for (const specifier of specifiersOf(readFileSync(file, "utf8"))) {
      const relativeSpecifier = specifier.startsWith(".");
      // A bare specifier outside the workspace is a real dependency, out of
      // scope for this budget; only workspace ones are expected to resolve.
      if (!relativeSpecifier && !isWorkspaceSpecifier(specifier)) continue;
      const target = relativeSpecifier
        ? resolveRelative(file, specifier)
        : resolveWorkspace(specifier);
      if (!target) {
        if (!NON_SOURCE_SPECIFIER.test(specifier))
          unresolvedSpecifiers.push(`${relative(file)} "${specifier}"`);
        continue;
      }
      if (!reachedFrom.has(target)) reachedFrom.set(target, { parent: file, specifier });
      queue.push(target);
    }
  }
  return seen;
}

function measure(entry: { package: string; entry: string }) {
  const dir = WORKSPACE[entry.package];
  if (!dir) throw new Error(`${entry.package} is not a workspace package.`);
  if (publishedTargets(dir, entry.entry).length === 0)
    throw new Error(`${entry.package} does not export ${entry.entry}.`);
  const entryFile = exportTarget(dir, entry.entry);
  if (!entryFile) return null; // the published target maps to no source file
  reachedFrom.clear();
  unresolvedSpecifiers.length = 0;
  const modules = reachableModules(entryFile);
  let solidaria = 0;
  for (const file of modules) {
    if (path.relative(ROOT, file).split(path.sep).slice(0, 2).join("/") === WORKSPACE[ROOT_BARREL])
      solidaria++;
  }
  return { total: modules.size, solidaria, modules, unresolved: [...unresolvedSpecifiers] };
}

function relative(file: string): string {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function sourceFiles(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory)) {
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) files.push(...sourceFiles(absolute));
    else if (/\.tsx?$/.test(entry)) files.push(absolute);
  }
  return files;
}

const rootBarrelImporters = SOURCE_TREES.flatMap((tree) => sourceFiles(path.join(ROOT, tree)))
  .filter((file) => ROOT_BARREL_SPECIFIER.test(readFileSync(file, "utf8")))
  .map((file) => path.relative(ROOT, file).split(path.sep).join("/"))
  .sort();

if (WRITE_BASELINE) {
  const existing: Budget | null = existsSync(BUDGET_PATH)
    ? JSON.parse(readFileSync(BUDGET_PATH, "utf8"))
    : null;
  const entries = (existing?.entries ?? []).map((entry) => {
    const measured = measure(entry);
    if (!measured)
      throw new Error(
        `${entry.package} ${entry.entry} resolves to no source file; fix the exports map before re-freezing.`,
      );
    if (measured.unresolved.length > 0)
      throw new Error(
        `${entry.package} ${entry.entry} has unresolved specifiers; fix them before re-freezing:\n  ${measured.unresolved.join("\n  ")}`,
      );
    return { ...entry, maxModules: measured.total, maxSolidariaModules: measured.solidaria };
  });
  const budget: Budget = {
    description:
      existing?.description ??
      "Per-entry module ceilings for the published packages, plus the frozen solidaria root-barrel inventory.",
    unit:
      existing?.unit ??
      "Distinct source modules reachable from the source file an entry's `exports` target is emitted from, by static import/export specifiers, workspace packages resolved through their own `exports` maps. Type-only and build-time macro imports are not counted; neither reaches a consumer.",
    entries,
    rootBarrelInventory: {
      description: `Frozen inventory of source files importing the ${ROOT_BARREL} root barrel. Removing entries is allowed; adding one fails.`,
      maxCount: rootBarrelImporters.length,
      paths: rootBarrelImporters,
    },
  };
  writeFileSync(BUDGET_PATH, `${JSON.stringify(budget, null, 2)}\n`);
  console.log(
    `Wrote ${entries.length} entry ceiling(s) and a ${rootBarrelImporters.length}-file root-barrel inventory to ${path.relative(ROOT, BUDGET_PATH)}.`,
  );
  process.exit(0);
}

if (!existsSync(BUDGET_PATH)) {
  console.error(
    `Missing ${path.relative(ROOT, BUDGET_PATH)}; create it intentionally with --write-baseline.`,
  );
  process.exit(1);
}

const budget: Budget = JSON.parse(readFileSync(BUDGET_PATH, "utf8"));

if (PRINT_MODULES) {
  for (const entry of budget.entries) {
    const measured = measure(entry);
    console.log(`\n${entry.package} ${entry.entry}`);
    if (!measured) {
      console.log("  does not resolve to a source file");
      continue;
    }
    for (const line of measured.unresolved) console.log(`  unresolved: ${line}`);
    console.log(
      `  ${measured.total} modules (${measured.solidaria} solidaria), ceiling ${entry.maxModules}/${entry.maxSolidariaModules}`,
    );
    for (const file of [...measured.modules].map(relative).sort()) {
      const source = reachedFrom.get(path.join(ROOT, file));
      console.log(
        source ? `    ${file}  <- ${relative(source.parent)} "${source.specifier}"` : `    ${file}`,
      );
    }
  }
  process.exit(0);
}

const failures: string[] = [];
const improvements: string[] = [];
let measuredEntries = 0;

const unresolvedEntries: string[] = [];

for (const entry of budget.entries) {
  const measured = measure(entry);
  const label = `${entry.package} ${entry.entry}`;
  // An entry that resolves to nothing is the ceiling nobody measured. Skipping
  // it meant a renamed `exports` target or a moved source file read as a pass
  // on everything it silently removed. It was a half-built `dist/` before #566
  // and it is an unmappable target now; the hole is the same, so it fails.
  if (!measured) {
    unresolvedEntries.push(
      `${label} (exports ${publishedTarget(WORKSPACE[entry.package]!, entry.entry)})`,
    );
    continue;
  }
  for (const line of measured.unresolved) unresolvedEntries.push(`${label}: ${line}`);
  measuredEntries++;
  if (measured.total > entry.maxModules)
    failures.push(`${label}: ${measured.total} modules, ceiling ${entry.maxModules}`);
  else if (measured.solidaria > entry.maxSolidariaModules)
    failures.push(
      `${label}: ${measured.solidaria} solidaria modules, ceiling ${entry.maxSolidariaModules}`,
    );
  else if (measured.total < entry.maxModules || measured.solidaria < entry.maxSolidariaModules)
    improvements.push(
      `${label}: ${measured.total} modules (${measured.solidaria} solidaria), ceiling ${entry.maxModules}/${entry.maxSolidariaModules}`,
    );
}

if (unresolvedEntries.length > 0) {
  console.error(
    `\nentry import budget FAILED: ${unresolvedEntries.length} budgeted target(s) resolve to no source file:`,
  );
  for (const label of unresolvedEntries) console.error(`  ${label}`);
  console.error(
    `\nAn unresolvable target removes everything behind it from the count, so it fails\n` +
      `rather than skipping. Fix the exports map or the specifier. If an entry is gone\n` +
      `for good, drop its line from scripts/entry-import-budget.json in the commit that\n` +
      `removes it.`,
  );
  process.exit(1);
}

const additions = rootBarrelImporters.filter(
  (file) => !budget.rootBarrelInventory.paths.includes(file),
);
const removals = budget.rootBarrelInventory.paths.filter(
  (file) => !rootBarrelImporters.includes(file),
);

console.log("entry import budget");
console.log(`- entries measured: ${measuredEntries}/${budget.entries.length}`);
console.log(
  `- root-barrel importers: ${rootBarrelImporters.length} (ceiling ${budget.rootBarrelInventory.maxCount})`,
);

// A narrowed file is the point of the exercise — say so, and keep the inventory
// honest by requiring the baseline to be rewritten once it shrinks.
if (removals.length > 0) {
  console.log(`- narrowed off the root barrel since the baseline: ${removals.length}`);
  for (const file of removals) console.log(`    ${file}`);
  console.log("  Re-freeze with: vp run guard:entry-import-budget -- --write-baseline");
}

if (improvements.length > 0) {
  console.log("- entries now under their ceiling (lower it with --write-baseline):");
  for (const line of improvements) console.log(`    ${line}`);
}

if (additions.length > 0) {
  failures.push(
    `${additions.length} new file(s) import the ${ROOT_BARREL} root barrel:\n${additions
      .map((file) => `    ${file}`)
      .join("\n")}`,
  );
}

if (failures.length > 0) {
  console.error(`\nentry import budget FAILED:`);
  for (const failure of failures) console.error(`  ${failure}`);
  console.error(
    `\nImport the narrow subpath the symbol lives in (${ROOT_BARREL}/i18n, /overlays, /progress, …)\n` +
      `rather than the root barrel, or raise the ceiling deliberately with --write-baseline.`,
  );
  process.exit(1);
}

console.log(`entry import budget OK.`);
