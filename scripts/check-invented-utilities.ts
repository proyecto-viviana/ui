/**
 * guard:invented-utilities — a static gate that fails if the library's component
 * source reintroduces the invented, pre-Spectrum-2 utility vocabulary: an ad-hoc
 * Tailwind-style palette (`bg-primary`, `text-on-color`, `bg-bg-300`,
 * `border-accent-200`, `bg-danger-400`, `text-success-500`, …) that predates the
 * move to the S2 style macro.
 *
 * Why this is a blocking floor, not a lint nicety:
 *   The styling source of truth is the S2 `style()` macro over S2 design tokens
 *   (docs/adr/0001-s2-styling-source-of-truth.md). The macro compiles its CSS into
 *   the package's shipped `styles.css` bundle, so installed consumers get it with
 *   no build-time backfill. The invented utilities, by contrast, only ever rendered
 *   under an app-level Tailwind pass and ship *no* backing CSS from the package —
 *   any that survive in library source are dead classes that silently drop their
 *   styling for anyone who installs the package. This guard keeps that vocabulary
 *   from creeping back in.
 *
 * Scope: the three library source trees only (the shipped-package boundary).
 *   - Comments (incl. JSDoc `@example` blocks) are stripped before scanning, so the
 *     gate reflects real class usage, not prose that happens to name a token.
 *   - Standard Tailwind color scales (blue-/red-/gray-/green-/amber-) are NOT
 *     flagged: they appear only inside headless JSDoc examples that teach consumers
 *     how to style the unstyled primitives, and are not shipped styling.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

/** Shipped-package source trees. Apps are out of scope (not published). */
const LIBRARY_SRC_ROOTS = [
  "packages/solid-spectrum/src",
  "packages/viviana-ui/src",
  "packages/solidaria-components/src",
];

const SCAN_EXTENSIONS = new Set([".ts", ".tsx"]);
const SKIP_DIRS = new Set(["node_modules", "dist", "__snapshots__"]);

// A hyphenated `<prefix>-<family>` utility token can only appear inside a string
// or comment in TS/TSX (it is not a valid identifier), so a raw regex scan of the
// non-comment source is safe. The invented families are the Viviana semantic
// palette; standard Tailwind scales are intentionally excluded (see header).
const UTILITY_PREFIXES = [
  "bg",
  "text",
  "border",
  "ring",
  "from",
  "via",
  "to",
  "fill",
  "stroke",
  "divide",
  "outline",
  "shadow",
];
const INVENTED_FAMILIES = ["primary", "accent", "bg", "on-color", "danger", "success", "warning"];
const INVENTED_RE = new RegExp(
  `\\b(?:${UTILITY_PREFIXES.join("|")})-(?:${INVENTED_FAMILIES.join("|")})(?:[-/][a-z0-9]+)*\\b`,
  "g",
);

/** Blank out comments while preserving line count (block comments span lines). */
function stripComments(src: string): string {
  const noBlock = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return noBlock.replace(/\/\/[^\n]*/g, "");
}

async function walk(dir: string): Promise<string[]> {
  // Infer the element type from the withFileTypes call itself — annotating with
  // `Awaited<ReturnType<typeof readdir>>` picks readdir's default overload, whose
  // Dirent<Buffer> name would then be typed as a buffer, not a string. An absent
  // tree resolves to an empty list and is skipped.
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const out: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

interface Hit {
  file: string;
  line: number;
  token: string;
  text: string;
}

const hits: Hit[] = [];

for (const rootRel of LIBRARY_SRC_ROOTS) {
  const files = await walk(path.join(ROOT, rootRel));
  for (const file of files) {
    const source = stripComments(await readFile(file, "utf8"));
    source.split("\n").forEach((text, index) => {
      for (const match of text.matchAll(INVENTED_RE)) {
        hits.push({
          file: path.relative(ROOT, file),
          line: index + 1,
          token: match[0],
          text: text.trim(),
        });
      }
    });
  }
}

if (hits.length > 0) {
  console.error(
    `guard:invented-utilities — found ${hits.length} invented utility token(s) in library source:\n`,
  );
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.token}`);
    console.error(`      ${hit.text}`);
  }
  console.error(
    "\nLibrary components must express styling through the S2 style() macro over S2 design",
  );
  console.error(
    "tokens (docs/adr/0001-s2-styling-source-of-truth.md), not an invented utility palette:",
  );
  console.error(
    "those classes ship no CSS in the package bundle and silently lose their styling for",
  );
  console.error("installed consumers.");
  process.exit(1);
}

console.log(
  `OK: no invented utility tokens in library source (scanned ${LIBRARY_SRC_ROOTS.length} src trees).`,
);
