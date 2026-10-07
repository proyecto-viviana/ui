/**
 * Predicts whether Vite Plus would hand a file to its cold dependency scan.
 *
 * `computeEntries` runs only while dependency optimization is enabled and
 * `noDiscovery` is off. With no `optimizeDeps.entries` and no rollup input,
 * the pattern is every HTML file. The ignore list is `build.outDir`,
 * `node_modules`, `__tests__`, and `coverage`. `.gitignore` is not read.
 * This module globs the one path it is asked about and never walks the tree.
 */
import { createRequire } from "node:module";
import { realpathSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, extname, isAbsolute, join, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");

const requireFromVite = createRequire(realpathSync(join(ROOT, "node_modules/vite/package.json")));
const picomatch = requireFromVite("picomatch");
const { glob } = requireFromVite("tinyglobby");

const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;
const HTML_TYPES_RE = /\.(?:html|vue|svelte|astro|imba)$/;

export const PACKAGE_TEST_CONFIGS = [
  "vitest.config.ts",
  "vitest.hydrate.config.ts",
  "vitest.ssr.config.ts",
  "apps/comparison/vitest.config.ts",
  "apps/comparison/vitest.solid-ssr.config.ts",
  "apps/comparison/vitest.solid-hydrate.config.ts",
  "apps/web/vitest.config.ts",
];

export const VENDOR_DIR = join(ROOT, "scripts/fixtures/vite-plus-discovery/vendor");
export const IGNORED_DIR = join(ROOT, "dist/vite-plus-discovery-ignored");

/** Pre-fix vmThreads client: discovery on, entries unset, Vitest's renamed outDir. */
export const UNBOUNDED_SCAN = {
  optimizeDeps: {
    noDiscovery: false,
    include: [],
  },
  build: {
    outDir: "dummy-non-existing-folder",
  },
  input: null,
};

function toPosix(value) {
  return value.split("\\").join("/");
}

function isScannable(id, extensions) {
  return (
    JS_TYPES_RE.test(id) || HTML_TYPES_RE.test(id) || extensions?.includes(extname(id)) || false
  );
}

/** True when Vite never calls `scanImports` for this optimizer config. */
function scanNotEntered(optimizeDeps) {
  if (optimizeDeps.disabled === true || optimizeDeps.disabled === "dev") return true;
  // A set `noDiscovery` skips the crawl. A non-empty include with it uses the
  // explicit optimizer, which does not call `computeEntries`.
  if (optimizeDeps.noDiscovery) return true;
  return false;
}

function patternMatches(pattern, relativePath) {
  return picomatch(pattern, { dot: false })(relativePath);
}

function environmentList(viteConfig) {
  const environments = viteConfig.environments ?? {};
  if (environments instanceof Map) return [...environments.entries()];
  return Object.entries(environments);
}

let resolveConfigPromise;
function loadResolveConfig() {
  if (!resolveConfigPromise) {
    const vitestNode = requireFromVite.resolve("vitest/node");
    resolveConfigPromise = import(pathToFileURL(vitestNode).href).then((mod) => mod.resolveConfig);
  }
  return resolveConfigPromise;
}

/** Resolve a Vite Plus test config without replacing the config file's root. */
export async function loadVitePlusTestConfig(configPath) {
  const resolveConfig = await loadResolveConfig();
  const abs = isAbsolute(configPath) ? configPath : join(ROOT, configPath);
  return resolveConfig({ config: abs });
}

/**
 * True when this environment's cold scan would return `absoluteFile`.
 * `root` is the Vite root. The environment object is the resolved environment
 * (`optimizeDeps`, `build`, `input`), which has no root of its own.
 */
export async function coldScanReads(environment, root, absoluteFile) {
  const optimizeDeps = environment.optimizeDeps ?? {};
  if (scanNotEntered(optimizeDeps)) return false;

  const rel = toPosix(relative(root, absoluteFile));
  if (rel === "" || rel === ".." || rel.startsWith("../") || isAbsolute(rel)) return false;
  if (!isScannable(absoluteFile, optimizeDeps.extensions)) return false;

  const input = environment.input ?? environment.build?.rolldownOptions?.input ?? null;
  let patterns;
  let entriesExplicit;
  if (optimizeDeps.entries != null) {
    patterns = Array.isArray(optimizeDeps.entries) ? optimizeDeps.entries : [optimizeDeps.entries];
    entriesExplicit = true;
  } else if (input != null) {
    throw new Error(
      "cold scan has a rolldown input and no optimizeDeps.entries; refusing to guess the read set",
    );
  } else {
    patterns = ["**/*.html"];
    entriesExplicit = false;
  }

  const matching = patterns.filter((pattern) => patternMatches(String(pattern), rel));
  if (matching.length === 0) return false;

  const outDir = environment.build?.outDir ?? "dist";
  const baseIgnore = [`**/${outDir}/**`];
  if (!entriesExplicit) baseIgnore.push("**/__tests__/**", "**/coverage/**");

  for (const pattern of matching) {
    const ignore = String(pattern).includes("node_modules")
      ? baseIgnore
      : [...baseIgnore, "**/node_modules/**"];
    if (ignore.some((rule) => patternMatches(rule, rel))) continue;
    const hits = await glob(rel, {
      absolute: true,
      cwd: root,
      ignore,
      dot: false,
    });
    if (hits.some((hit) => toPosix(hit) === toPosix(absoluteFile))) return true;
  }
  return false;
}

/** True when Vitest would collect `absoluteFile` from the resolved include/exclude. */
export function testCollectionMatches(vitestConfig, absoluteFile) {
  const root = vitestConfig.root ?? vitestConfig.dir ?? ROOT;
  const include = vitestConfig.include ?? [];
  const exclude = vitestConfig.exclude ?? [];
  const rel = toPosix(relative(root, absoluteFile));
  const matches = (pattern) => {
    const raw = String(pattern);
    if (isAbsolute(raw)) return picomatch(toPosix(raw), { dot: true })(toPosix(absoluteFile));
    if (rel === ".." || rel.startsWith("../")) return false;
    return picomatch(toPosix(raw), { dot: false })(rel);
  };
  return include.some(matches) && !exclude.some(matches);
}

/** Problems that mean a package-test config can still read or collect `fixtures`. */
export async function hermeticDiscoveryProblems(configPaths, fixtures) {
  const problems = [];
  for (const configPath of configPaths) {
    const { viteConfig, vitestConfig } = await loadVitePlusTestConfig(configPath);
    const root = viteConfig.root;
    for (const [name, environment] of environmentList(viteConfig)) {
      const optimizeDeps = environment.optimizeDeps ?? {};
      const include = optimizeDeps.include ?? [];
      if (optimizeDeps.noDiscovery !== true || include.length !== 0) {
        problems.push(
          `${configPath} ${name}: noDiscovery ${String(optimizeDeps.noDiscovery)}, include ${JSON.stringify(include)}`,
        );
      }
      for (const fixture of fixtures) {
        if (await coldScanReads(environment, root, fixture)) {
          problems.push(`${configPath} ${name} reads ${toPosix(relative(ROOT, fixture))}`);
        }
      }
    }
    for (const fixture of fixtures) {
      if (testCollectionMatches(vitestConfig, fixture)) {
        problems.push(`${configPath} collects ${toPosix(relative(ROOT, fixture))}`);
      }
    }
  }
  return problems;
}
