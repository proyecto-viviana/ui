import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const LAYOUTS = ["src/layouts/DocsPageLayout.astro", "src/layouts/MarketingLayout.astro"];
export const ASTRO_CONFIG = "astro.config.mjs";
export const SIDEBAR = "src/components/solid/DocsSidebar.tsx";
export const SIDEBAR_FALLBACK = "src/components/DocsSidebarFallback.astro";
export const EXAMPLE_MOUNT = "src/scripts/component-example-section-mount.tsx";
export const EXAMPLE_MOUNT_HELPER = "src/scripts/mount-on-astro-page.ts";
export const EXAMPLE_MOUNT_ASTRO = "src/components/ComponentExampleSectionMount.astro";

export function comparisonRootFrom(moduleUrl) {
  let dir = dirname(fileURLToPath(moduleUrl));
  for (let i = 0; i < 8; i++) {
    if (existsSync(join(dir, "playwright.config.ts")) && existsSync(join(dir, "src"))) {
      return dir;
    }
    dir = join(dir, "..");
  }
  throw new Error(`could not locate comparison app root from ${moduleUrl}`);
}

function readRelative(comparisonRoot, relative) {
  const abs = join(comparisonRoot, relative);
  if (!existsSync(abs)) {
    return null;
  }
  return readFileSync(abs, "utf8");
}

export function evaluateLayoutSource(file, source) {
  const problems = [];
  if (!/from\s+["']astro:transitions["']/.test(source) || !/<ClientRouter\b/.test(source)) {
    problems.push({
      kind: "missing-client-router",
      file,
      detail: "layout must import ClientRouter from astro:transitions and render <ClientRouter />",
    });
  }
  return problems;
}

export function evaluatePrefetchSource(file, source) {
  const problems = [];
  const prefetchBlock = source.match(/\bprefetch\s*:\s*\{([\s\S]*?)\}/);
  if (prefetchBlock == null) {
    problems.push({
      kind: "prefetch-all",
      file,
      detail: 'astro.config must set prefetch: { prefetchAll: false, defaultStrategy: "hover" }',
    });
    return problems;
  }
  const block = prefetchBlock[1];
  if (!/prefetchAll\s*:\s*false\b/.test(block) || /prefetchAll\s*:\s*true\b/.test(block)) {
    problems.push({
      kind: "prefetch-all",
      file,
      detail: "ClientRouter default prefetchAll: true is forbidden; set prefetchAll: false",
    });
  }
  if (!/defaultStrategy\s*:\s*["']hover["']/.test(block)) {
    problems.push({
      kind: "prefetch-all",
      file,
      detail: 'prefetch.defaultStrategy must be "hover"',
    });
  }
  return problems;
}

export function evaluateSidebarPrefetchSource(file, source) {
  const problems = [];
  if (!/data-astro-prefetch["']?\s*[:=]\s*["']hover["']/.test(source)) {
    problems.push({
      kind: "missing-hover-prefetch",
      file,
      detail: 'sidebar component links must set data-astro-prefetch="hover"',
    });
  }
  return problems;
}

export function evaluateExampleRemountSource(file, source, helperSource = "") {
  const problems = [];
  const listensDirectly = /astro:after-swap/.test(source);
  const usesHelper = /mountOnAstroPage\s*\(/.test(source) && /astro:after-swap/.test(helperSource);
  if (!listensDirectly && !usesHelper) {
    problems.push({
      kind: "stale-example-persist",
      file,
      detail: "example section must remount on astro:after-swap",
    });
  }
  if (!/islandsMounted/.test(source) || !/delete\s+\w+\.dataset\.islandsMounted/.test(source)) {
    problems.push({
      kind: "stale-example-persist",
      file,
      detail: "example remount must clear data-islands-mounted so the attribute toggles",
    });
  }
  return problems;
}

export function evaluateExampleAnimateSource(file, source) {
  const problems = [];
  if (
    !/data-astro-transition-animate=["']none["']/.test(source) &&
    !/transition:animate=["']none["']/.test(source)
  ) {
    problems.push({
      kind: "missing-client-router",
      file,
      detail: 'example mount must set data-astro-transition-animate="none"',
    });
  }
  if (/transition:persist/.test(source)) {
    problems.push({
      kind: "stale-example-persist",
      file,
      detail: "do not persist the example section across ClientRouter swaps",
    });
  }
  return problems;
}

export function evaluateClientRouter(comparisonRoot) {
  const problems = [];
  for (const relative of LAYOUTS) {
    const source = readRelative(comparisonRoot, relative);
    if (source == null) {
      problems.push({
        kind: "missing-client-router",
        file: relative,
        detail: `file is missing: ${join(comparisonRoot, relative)}`,
      });
      continue;
    }
    problems.push(...evaluateLayoutSource(relative, source));
  }

  const astroSource = readRelative(comparisonRoot, ASTRO_CONFIG);
  if (astroSource == null) {
    problems.push({
      kind: "prefetch-all",
      file: ASTRO_CONFIG,
      detail: `file is missing: ${join(comparisonRoot, ASTRO_CONFIG)}`,
    });
  } else {
    problems.push(...evaluatePrefetchSource(ASTRO_CONFIG, astroSource));
  }

  for (const relative of [SIDEBAR, SIDEBAR_FALLBACK]) {
    const source = readRelative(comparisonRoot, relative);
    if (source == null) {
      problems.push({
        kind: "missing-hover-prefetch",
        file: relative,
        detail: `file is missing: ${join(comparisonRoot, relative)}`,
      });
      continue;
    }
    problems.push(...evaluateSidebarPrefetchSource(relative, source));
  }

  const exampleMount = readRelative(comparisonRoot, EXAMPLE_MOUNT);
  const helperSource = readRelative(comparisonRoot, EXAMPLE_MOUNT_HELPER) ?? "";
  if (exampleMount == null) {
    problems.push({
      kind: "stale-example-persist",
      file: EXAMPLE_MOUNT,
      detail: `file is missing: ${join(comparisonRoot, EXAMPLE_MOUNT)}`,
    });
  } else {
    problems.push(...evaluateExampleRemountSource(EXAMPLE_MOUNT, exampleMount, helperSource));
  }

  const exampleAstro = readRelative(comparisonRoot, EXAMPLE_MOUNT_ASTRO);
  if (exampleAstro == null) {
    problems.push({
      kind: "stale-example-persist",
      file: EXAMPLE_MOUNT_ASTRO,
      detail: `file is missing: ${join(comparisonRoot, EXAMPLE_MOUNT_ASTRO)}`,
    });
  } else {
    problems.push(...evaluateExampleAnimateSource(EXAMPLE_MOUNT_ASTRO, exampleAstro));
  }

  return problems;
}

function isCli() {
  const entry = process.argv[1];
  if (entry == null) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (isCli()) {
  const root = comparisonRootFrom(import.meta.url);
  const problems = evaluateClientRouter(root);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`${problem.kind}: ${problem.file}: ${problem.detail}`);
    }
    process.exit(1);
  }
  console.log("client router: ok (ClientRouter, prefetchAll: false, hover, example remount)");
}
