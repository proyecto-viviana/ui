import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type DemoSplitProblemKind =
  | "static-demo-import"
  | "eager-all-slug-controls"
  | "missing-dynamic-demo-loader";

export interface DemoSplitProblem {
  kind: DemoSplitProblemKind;
  file: string;
  detail: string;
}

const CONTROLS_FILE = "src/data/component-controls.ts";
const LOADERS_FILE = "src/data/component-demo-loaders.ts";
const CATALOGUE_FILES = [
  "src/components/solid/IndexHero.tsx",
  "src/components/solid/CatalogueOverview.tsx",
  "src/components/IndexHeroFallback.astro",
  "src/pages/coverage.astro",
] as const;

const STATIC_DEMO_IMPORT = /^import\s+.*from\s+["']\.\/.*-demo["']/m;
const CONTROLS_IMPORT = /from\s+["']@comparison\/data\/component-controls["']/;
const DYNAMIC_DEMO_IMPORT = /\(\)\s*=>\s*import\(\s*["']\.\/(?:[\w-]+-demo)["']\s*\)/;

export function comparisonRootFrom(moduleUrl: string): string {
  let dir = dirname(fileURLToPath(moduleUrl));
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "playwright.config.ts")) && existsSync(join(dir, "src"))) {
      return dir;
    }
    dir = join(dir, "..");
  }
  throw new Error(`could not locate comparison app root from ${moduleUrl}`);
}

function readRelative(comparisonRoot: string, relative: string): string | null {
  const abs = join(comparisonRoot, relative);
  if (!existsSync(abs)) {
    return null;
  }
  return readFileSync(abs, "utf8");
}

export function evaluateDemoControlSource(file: string, source: string): DemoSplitProblem[] {
  const problems: DemoSplitProblem[] = [];
  if (STATIC_DEMO_IMPORT.test(source)) {
    problems.push({
      kind: "static-demo-import",
      file,
      detail: 'static `import … from "./…-demo"` is forbidden; use () => import("./…-demo")',
    });
  }
  return problems;
}

export function evaluateCatalogueSource(file: string, source: string): DemoSplitProblem[] {
  const problems: DemoSplitProblem[] = [];
  if (CONTROLS_IMPORT.test(source)) {
    problems.push({
      kind: "eager-all-slug-controls",
      file,
      detail:
        "catalogue/hero must not import component-controls; coverage.ts / comparison-manifest only",
    });
  }
  if (STATIC_DEMO_IMPORT.test(source) || /from\s+["']@comparison\/data\/.*-demo["']/.test(source)) {
    problems.push({
      kind: "static-demo-import",
      file,
      detail: "catalogue/hero must not import *-demo modules",
    });
  }
  return problems;
}

export function evaluateLoaderSource(file: string, source: string): DemoSplitProblem[] {
  const problems: DemoSplitProblem[] = [];
  if (STATIC_DEMO_IMPORT.test(source)) {
    problems.push({
      kind: "static-demo-import",
      file,
      detail: "demo loaders must not statically import *-demo modules",
    });
  }
  if (!DYNAMIC_DEMO_IMPORT.test(source)) {
    problems.push({
      kind: "missing-dynamic-demo-loader",
      file,
      detail: 'expected `() => import("./<slug>-demo")` loaders',
    });
  }
  return problems;
}

export function evaluateDemoControlSplit(comparisonRoot: string): DemoSplitProblem[] {
  const problems: DemoSplitProblem[] = [];

  for (const relative of [CONTROLS_FILE, LOADERS_FILE]) {
    const source = readRelative(comparisonRoot, relative);
    if (source == null) {
      problems.push({
        kind: "static-demo-import",
        file: relative,
        detail: `file is missing: ${join(comparisonRoot, relative)}`,
      });
      continue;
    }
    if (relative === LOADERS_FILE) {
      problems.push(...evaluateLoaderSource(relative, source));
    } else {
      problems.push(...evaluateDemoControlSource(relative, source));
    }
  }

  for (const relative of CATALOGUE_FILES) {
    const source = readRelative(comparisonRoot, relative);
    if (source == null) {
      problems.push({
        kind: "eager-all-slug-controls",
        file: relative,
        detail: `file is missing: ${join(comparisonRoot, relative)}`,
      });
      continue;
    }
    problems.push(...evaluateCatalogueSource(relative, source));
  }

  return problems;
}

function isCli(): boolean {
  const entry = process.argv[1];
  if (entry == null) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (isCli()) {
  const root = comparisonRootFrom(import.meta.url);
  const problems = evaluateDemoControlSplit(root);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`${problem.kind}: ${problem.file}: ${problem.detail}`);
    }
    process.exit(1);
  }
  console.log("demo control split: ok");
}
