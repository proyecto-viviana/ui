#!/usr/bin/env node

/**
 * Fails when the built comparison app references a style-macro atom class that
 * no stylesheet in the same build defines.
 *
 * The S2 style macro mints one class per (property, value) pair — a hash plus
 * the `17` postfix from `packages/solid-spectrum/src/style/style-macro.ts` —
 * and emits the matching CSS rule into whichever build ran the macro. Only the
 * modules a build compiles itself get their rules into that build's
 * stylesheets. A module graph that resolves the public subpaths to the prebuilt
 * `dist/<Name>.jsx` ships class lists whose CSS lives only in the package's
 * own `dist/styles.css`, a file this app never loads. Every dist-resolved S2
 * field root then rendered `grid-template-areas: none` (`C1xyRcb17`, 15
 * chunks, 65 orphan atoms in all), which took 600 of the 732 certified failures
 * in the 2026-09-07 sharded run (ticket #489).
 *
 * The invariant is structural: every atom the shipped JS or prerendered HTML
 * can put on an element must have a rule in the shipped CSS. This reads only
 * `apps/comparison/dist`, so it runs right after `comparison:build` in the
 * Certification Gates `comparison-build` job, before any shard spends a browser
 * on a build that cannot pass D1.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.resolve(repoRoot, "apps/comparison/dist");

// Mirrors POSTFIX in packages/solid-spectrum/src/style/style-macro.ts.
const POSTFIX = "17";
const ATOM_BODY = "[-_A-Za-z][-_A-Za-z0-9]*";
const atomToken = new RegExp(`^${ATOM_BODY}${POSTFIX}$`);
const staticToken = /^-macro-static-[-_A-Za-z0-9]+$/;
const cssAtomSelector = new RegExp(`\\.(${ATOM_BODY}${POSTFIX})(?![-_A-Za-z0-9])`, "g");
const jsStringLiteral = /"((?:[^"\\\n]|\\.)*)"|'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g;
const htmlStyleBlock = /<style[^>]*>([\s\S]*?)<\/style>/g;
const htmlScriptBlock = /<script[^>]*>([\s\S]*?)<\/script>/g;
const htmlClassAttribute = /\sclass="([^"]*)"/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const defined = new Set();
const referenced = new Map();
let referencingFiles = 0;

function collectDefined(css) {
  for (const match of css.matchAll(cssAtomSelector)) {
    defined.add(match[1]);
  }
}

// A class list is a whitespace-separated run of macro tokens with at least one
// atom in it. Anything else (prose, ids, paths) is not a class list and is
// ignored, so a plain string that happens to end in `17` cannot fail the guard.
function collectClassList(text, file) {
  const tokens = text.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return false;
  }
  if (!tokens.every((token) => atomToken.test(token) || staticToken.test(token))) {
    return false;
  }
  let sawAtom = false;
  for (const token of tokens) {
    if (!atomToken.test(token)) {
      continue;
    }
    sawAtom = true;
    let files = referenced.get(token);
    if (!files) {
      files = new Set();
      referenced.set(token, files);
    }
    files.add(path.relative(repoRoot, file));
  }
  return sawAtom;
}

function collectReferencedFromScript(js, file) {
  let sawAny = false;
  for (const match of js.matchAll(jsStringLiteral)) {
    const literal = match[1] ?? match[2] ?? match[3] ?? "";
    if (collectClassList(literal, file)) {
      sawAny = true;
    }
  }
  return sawAny;
}

if (!existsSync(distRoot)) {
  console.error(
    `comparison atom css: ${path.relative(repoRoot, distRoot)} is missing; run \`vp run comparison:build\` first.`,
  );
  process.exit(1);
}

const files = walk(distRoot);
const cssFiles = files.filter((file) => file.endsWith(".css"));
const scriptFiles = files.filter((file) => /\.(m?js)$/.test(file));
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of cssFiles) {
  collectDefined(readFileSync(file, "utf8"));
}
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  for (const match of html.matchAll(htmlStyleBlock)) {
    collectDefined(match[1]);
  }
}

for (const file of scriptFiles) {
  if (collectReferencedFromScript(readFileSync(file, "utf8"), file)) {
    referencingFiles += 1;
  }
}
for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  let sawAny = false;
  for (const match of html.matchAll(htmlScriptBlock)) {
    if (collectReferencedFromScript(match[1], file)) {
      sawAny = true;
    }
  }
  for (const match of html.matchAll(htmlClassAttribute)) {
    if (collectClassList(match[1], file)) {
      sawAny = true;
    }
  }
  if (sawAny) {
    referencingFiles += 1;
  }
}

if (defined.size === 0 || referenced.size === 0) {
  console.error(
    `comparison atom css: found ${defined.size} defined and ${referenced.size} referenced atoms in ${path.relative(repoRoot, distRoot)}; the build is not a comparison-app dist.`,
  );
  process.exit(1);
}

const unknown = [...referenced.entries()]
  .filter(([token]) => !defined.has(token))
  .sort(([a], [b]) => a.localeCompare(b));

if (unknown.length > 0) {
  console.error(
    `comparison atom css: ${unknown.length} atom class(es) referenced by the built app have no CSS rule in the same build. The S2 graph was compiled twice (package dist vs app src); see apps/comparison/astro.config.mjs solid-spectrum subpath aliases.`,
  );
  for (const [token, fileSet] of unknown.slice(0, 25)) {
    const sample = [...fileSet].slice(0, 3).join(", ");
    console.error(`  ${token}  (${fileSet.size} file(s): ${sample}${fileSet.size > 3 ? ", …" : ""})`);
  }
  if (unknown.length > 25) {
    console.error(`  … ${unknown.length - 25} more`);
  }
  process.exit(1);
}

console.log(
  `comparison atom css: ok — ${referenced.size} referenced atoms across ${referencingFiles} files all defined (${defined.size} atoms in ${cssFiles.length} stylesheets + ${htmlFiles.length} pages).`,
);
