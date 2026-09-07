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
 * 1. A per-entry ceiling, measured against built `dist/`. Starting at each
 *    budgeted entry's `exports` target, it follows static `import`/`export …
 *    from` specifiers, resolving workspace bare specifiers through the
 *    imported package's own `exports` map, and counts the distinct modules
 *    reached. Re-adding a root-barrel import to a budgeted entry's graph puts
 *    it back over its ceiling.
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

// Workspace package name → directory. A specifier that resolves here is a
// module the consumer pays for; anything else (solid-js, a real dependency) is
// out of scope for this budget.
const WORKSPACE: Record<string, string> = {
  "@proyecto-viviana/solid-stately": "packages/solid-stately",
  "@proyecto-viviana/solidaria": "packages/solidaria",
  "@proyecto-viviana/solidaria-components": "packages/solidaria-components",
  "@proyecto-viviana/kumo": "packages/kumo",
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

function exportTarget(dir: string, subpath: string): string | null {
  const exports = manifestOf(dir).exports as Record<string, unknown> | undefined;
  const condition = exports?.[subpath];
  const target =
    typeof condition === "string"
      ? condition
      : ((condition as Record<string, string> | undefined)?.import ??
        (condition as Record<string, string> | undefined)?.default);
  // The `import` condition is what a bundler takes; `solid` points at the same
  // graph in .jsx form, so either measures the same module count.
  return typeof target === "string" ? path.join(ROOT, dir, target.replace(/^\.\//, "")) : null;
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
// missing `from` from swallowing the rest of the file.
const FROM_SPECIFIER = /^\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']/gm;
const SIDE_EFFECT_SPECIFIER = /^\s*import\s*["']([^"']+)["']/gm;

function specifiersOf(code: string): string[] {
  const found = new Set<string>();
  for (const match of code.matchAll(FROM_SPECIFIER)) found.add(match[1]!);
  for (const match of code.matchAll(SIDE_EFFECT_SPECIFIER)) found.add(match[1]!);
  return [...found];
}

function resolveRelative(from: string, specifier: string): string | null {
  const base = path.resolve(path.dirname(from), specifier);
  for (const candidate of [base, `${base}.js`, path.join(base, "index.js")]) {
    if (candidate.endsWith(".js") && existsSync(candidate)) return candidate;
  }
  return null;
}

function reachableModules(entryFile: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entryFile];
  while (queue.length > 0) {
    const file = queue.pop()!;
    if (seen.has(file) || !existsSync(file)) continue;
    seen.add(file);
    for (const specifier of specifiersOf(readFileSync(file, "utf8"))) {
      const target = specifier.startsWith(".")
        ? resolveRelative(file, specifier)
        : resolveWorkspace(specifier);
      if (target) queue.push(target);
    }
  }
  return seen;
}

function measure(entry: { package: string; entry: string }) {
  const dir = WORKSPACE[entry.package];
  if (!dir) throw new Error(`${entry.package} is not a workspace package.`);
  const entryFile = exportTarget(dir, entry.entry);
  if (!entryFile) throw new Error(`${entry.package} does not export ${entry.entry}.`);
  if (!existsSync(entryFile)) return null; // not built
  const modules = reachableModules(entryFile);
  let solidaria = 0;
  for (const file of modules) {
    if (path.relative(ROOT, file).split(path.sep).slice(0, 2).join("/") === WORKSPACE[ROOT_BARREL])
      solidaria++;
  }
  return { total: modules.size, solidaria };
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
    if (!measured) throw new Error(`${entry.package} ${entry.entry} is not built.`);
    return { ...entry, maxModules: measured.total, maxSolidariaModules: measured.solidaria };
  });
  const budget: Budget = {
    description:
      existing?.description ??
      "Per-entry module ceilings for the published packages, plus the frozen solidaria root-barrel inventory.",
    unit:
      existing?.unit ??
      "Distinct dist modules reachable from an entry's `exports` target by static import/export specifiers, workspace packages resolved through their own `exports` maps.",
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
const failures: string[] = [];
const improvements: string[] = [];
let measuredEntries = 0;

for (const entry of budget.entries) {
  const measured = measure(entry);
  if (!measured) continue;
  measuredEntries++;
  const label = `${entry.package} ${entry.entry}`;
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

if (measuredEntries === 0) {
  console.error(
    `No budgeted entry resolved to a built file — build the packages first (vp run build).`,
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
