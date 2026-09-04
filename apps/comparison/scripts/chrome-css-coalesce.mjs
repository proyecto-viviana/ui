import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const COMPARISON_CHROME_CSS_ID = "virtual:comparison-chrome.css";
export const COMPARISON_CHROME_CSS_FILE = "comparison-chrome.css";

export const MACRO_CSS_IMPORT_PATTERN = /import\s+["'](macro-[a-f0-9]+\.css)["'];?/g;

const CHROME_MACRO_PATH = "/components/solid/chrome/";
const ASTRO_CONFIG = "astro.config.mjs";
const CHROME_STYLES = "src/components/solid/chrome/styles.ts";
const SMUGGLE_IMPORT =
  /from\s+["'][^"']*(Calendar|calendar|TableView|tableview|\/styled\/)[^"']*["']/;

export function stripViteRequestSuffix(id) {
  return String(id).split(/[?#]/, 1)[0];
}

export function normalizeModulePath(id) {
  return stripViteRequestSuffix(id).replaceAll("\\", "/");
}

export function isComparisonChromeMacroModule(id) {
  return normalizeModulePath(id).includes(CHROME_MACRO_PATH);
}

export function isComparisonChromeCssId(id) {
  const fileName = normalizeModulePath(id).split("/").pop();
  return id === COMPARISON_CHROME_CSS_ID || fileName === COMPARISON_CHROME_CSS_FILE;
}

export function coalesceChromeMacroCssImports(code) {
  const cssIds = [];
  MACRO_CSS_IMPORT_PATTERN.lastIndex = 0;
  const rewritten = String(code).replace(MACRO_CSS_IMPORT_PATTERN, (_match, cssId) => {
    cssIds.push(cssId);
    return "";
  });
  if (cssIds.length === 0) {
    return { code: String(code), cssIds };
  }
  return {
    code: `import ${JSON.stringify(COMPARISON_CHROME_CSS_ID)};\n${rewritten}`,
    cssIds,
  };
}

export function orderedUniqueIds(idsByFile) {
  const ids = [];
  const seen = new Set();
  for (const fileIds of idsByFile.values()) {
    for (const cssId of fileIds) {
      if (seen.has(cssId)) continue;
      seen.add(cssId);
      ids.push(cssId);
    }
  }
  return ids;
}

export function concatenateCachedCss(ids, cache) {
  const parts = [];
  const seen = new Set();
  for (const cssId of ids) {
    if (seen.has(cssId)) continue;
    seen.add(cssId);
    const css = cache.get(cssId);
    if (css) parts.push(css);
  }
  return parts.join("\n");
}

export function contributingPathsAreChromeOnly(paths) {
  return paths.every((filePath) => isComparisonChromeMacroModule(filePath));
}

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

export function evaluateChromeCssCoalesceSource(file, source) {
  const problems = [];
  const usesVirtualSheet =
    source.includes(COMPARISON_CHROME_CSS_ID) || source.includes("COMPARISON_CHROME_CSS_ID");
  const gatesChrome =
    source.includes("isComparisonChromeMacroModule") || source.includes(CHROME_MACRO_PATH);
  const coalescesImports =
    source.includes("coalesceChromeMacroCssImports") || source.includes("MACRO_CSS_IMPORT_PATTERN");

  if (!usesVirtualSheet) {
    problems.push({
      kind: "missing-chrome-sheet",
      file,
      detail: `expected ${COMPARISON_CHROME_CSS_ID} so chrome macros share one sheet`,
    });
  }
  if (!gatesChrome) {
    problems.push({
      kind: "ungated-coalesce",
      file,
      detail: "chrome CSS coalesce must be gated to comparison chrome modules (anti-smuggle)",
    });
  }
  if (!coalescesImports) {
    problems.push({
      kind: "missing-coalesce",
      file,
      detail: "comparisonS2Macros must rewrite chrome macro CSS imports onto the virtual sheet",
    });
  }
  if (/cssCodeSplit\s*:\s*false/.test(source)) {
    problems.push({
      kind: "css-code-split-off",
      file,
      detail: "cssCodeSplit: false would merge fixture CSS into chrome; keep code splitting",
    });
  }
  const inlineLimit = source.match(/assetsInlineLimit\s*:\s*(\d+)/);
  if (inlineLimit && inlineLimit[1] !== "0") {
    problems.push({
      kind: "inline-limit-raised",
      file,
      detail: "raising assetsInlineLimit inlines CSS back into HTML; keep 0",
    });
  }
  return problems;
}

export function evaluateChromeStylesSource(file, source) {
  const problems = [];
  if (
    !/from\s+["']@proyecto-viviana\/solid-spectrum\/style["']\s+with\s*\{[^}]*type:\s*["']macro["']/.test(
      source,
    )
  ) {
    problems.push({
      kind: "handwritten-chrome-css",
      file,
      detail: "chrome styles must keep using the S2 style macro (ADR 0001); do not hand-author S2",
    });
  }
  if (SMUGGLE_IMPORT.test(source)) {
    problems.push({
      kind: "calendar-smuggle",
      file,
      detail: "chrome styles must not import Calendar/TableView/fixture modules",
    });
  }
  return problems;
}

export function evaluateComparisonMacroAuthors(comparisonRoot) {
  const problems = [];
  const srcRoot = join(comparisonRoot, "src");
  const stack = [srcRoot];
  while (stack.length > 0) {
    const dir = stack.pop();
    if (!existsSync(dir)) continue;
    let names;
    try {
      names = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      const abs = join(dir, name);
      const relative = abs.slice(comparisonRoot.length + 1).replaceAll("\\", "/");
      if (name === "node_modules" || name === "dist") continue;
      let directory = false;
      try {
        directory = statSync(abs).isDirectory();
      } catch {
        continue;
      }
      if (directory) {
        stack.push(abs);
        continue;
      }
      if (!/\.(ts|tsx|js|jsx|mjs)$/.test(name)) continue;
      if (relative === CHROME_STYLES) continue;
      const source = readFileSync(abs, "utf8");
      if (/with[\s\n]*\{\s*type:[\s\n]*["']macro["'][\s\n]*\}/.test(source)) {
        problems.push({
          kind: "macro-outside-chrome",
          file: relative,
          detail:
            "reachable comparison style() macros must live in chrome/styles.ts so coalesce stays chrome-only",
        });
      }
    }
  }
  return problems;
}

export async function measureChromeMacroCssDrop(comparisonRoot) {
  const macros = (await import("unplugin-parcel-macros")).default;
  const filePath = join(comparisonRoot, CHROME_STYLES);
  const plugin = macros.raw();
  const result = await plugin.transform.call(
    { addWatchFile() {} },
    readFileSync(filePath, "utf8"),
    filePath,
  );
  const transformed = typeof result === "string" ? result : String(result?.code ?? "");
  const before = [...transformed.matchAll(/import\s+["']macro-[a-f0-9]+\.css["']/g)];
  const coalesced = coalesceChromeMacroCssImports(transformed);
  const after = [...coalesced.code.matchAll(/import\s+["']([^"']+\.css)["']/g)].map(
    (match) => match[1],
  );
  const problems = [];
  if (before.length < 70) {
    problems.push({
      kind: "missing-coalesce",
      file: CHROME_STYLES,
      detail: `expected chrome/styles.ts to emit ≥70 macro CSS imports, got ${before.length}`,
    });
  }
  if (coalesced.cssIds.length !== before.length) {
    problems.push({
      kind: "missing-coalesce",
      file: CHROME_STYLES,
      detail: `coalesce dropped ids (${coalesced.cssIds.length} vs ${before.length} imports)`,
    });
  }
  if (after.length !== 1 || after[0] !== COMPARISON_CHROME_CSS_ID) {
    problems.push({
      kind: "missing-chrome-sheet",
      file: CHROME_STYLES,
      detail: `expected a single ${COMPARISON_CHROME_CSS_ID} import, got ${JSON.stringify(after)}`,
    });
  }
  if (!isComparisonChromeMacroModule(filePath)) {
    problems.push({
      kind: "ungated-coalesce",
      file: CHROME_STYLES,
      detail: "chrome/styles.ts must be classified as a chrome macro module",
    });
  }
  return { before: before.length, after, problems };
}

export function evaluateChromeCssCoalesce(comparisonRoot) {
  const problems = [];
  const astroAbs = join(comparisonRoot, ASTRO_CONFIG);
  const chromeAbs = join(comparisonRoot, CHROME_STYLES);
  if (!existsSync(astroAbs)) {
    problems.push({
      kind: "missing-chrome-sheet",
      file: ASTRO_CONFIG,
      detail: `file is missing: ${astroAbs}`,
    });
  } else {
    problems.push(...evaluateChromeCssCoalesceSource(ASTRO_CONFIG, readFileSync(astroAbs, "utf8")));
  }
  if (!existsSync(chromeAbs)) {
    problems.push({
      kind: "handwritten-chrome-css",
      file: CHROME_STYLES,
      detail: `file is missing: ${chromeAbs}`,
    });
  } else {
    problems.push(...evaluateChromeStylesSource(CHROME_STYLES, readFileSync(chromeAbs, "utf8")));
  }
  problems.push(...evaluateComparisonMacroAuthors(comparisonRoot));
  return problems;
}

function isCli() {
  const entry = process.argv[1];
  if (entry == null) return false;
  return fileURLToPath(import.meta.url) === resolve(entry);
}

if (isCli()) {
  const root = comparisonRootFrom(import.meta.url);
  const problems = evaluateChromeCssCoalesce(root);
  const measured = await measureChromeMacroCssDrop(root);
  problems.push(...measured.problems);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`${problem.kind}: ${problem.file}: ${problem.detail}`);
    }
    process.exit(1);
  }
  console.log(
    `chrome css coalesce: ok (${measured.before} macro CSS → 1 ${COMPARISON_CHROME_CSS_ID})`,
  );
}
