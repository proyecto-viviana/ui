import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export type FixtureSplitProblemKind =
  | "static-registry-import"
  | "cross-slug-fixture-import"
  | "cross-slug-component-import";

export interface FixtureSplitProblem {
  kind: FixtureSplitProblemKind;
  file: string;
  detail: string;
}

const REGISTRY_FILES = [
  "src/components/react/fixtures/styled.js",
  "src/components/solid/fixtures/styled.tsx",
] as const;

const FIXTURE_DIRS = [
  { dir: "src/components/react/fixtures/styled", ext: ".js" },
  { dir: "src/components/solid/fixtures/styled", ext: ".tsx" },
] as const;

const DESIGN_SYSTEM_SPECIFIERS = [
  "@react-spectrum/s2",
  "@proyecto-viviana/solid-spectrum",
] as const;

const COMPOSITION_SLUGS = new Set([
  "actionbar",
  "actionbutton",
  "actionbuttongroup",
  "actionmenu",
  "avatar",
  "button",
  "buttongroup",
  "card",
  "checkbox",
  "colorarea",
  "colorswatch",
  "contextualhelp",
  "dialog",
  "divider",
  "form",
  "illustratedmessage",
  "image",
  "link",
  "listview",
  "menu",
  "popover",
  "progressbar",
  "progresscircle",
  "provider",
  "skeleton",
  "statuslight",
  "switch",
  "tabs",
  "textfield",
  "togglebutton",
  "tooltip",
]);

const STATIC_REGISTRY_IMPORT_RE = /^import\s.+\sfrom\s+["']\.\.?\/styled\//m;

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

export function parseSource(filename: string, source: string): ts.SourceFile {
  return ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JS,
  );
}

function importSpecifiers(sourceFile: ts.SourceFile): string[] {
  const specs: string[] = [];
  for (const stmt of sourceFile.statements) {
    if (ts.isImportDeclaration(stmt) && ts.isStringLiteral(stmt.moduleSpecifier)) {
      specs.push(stmt.moduleSpecifier.text);
    }
  }
  return specs;
}

function namedBindingsFrom(sourceFile: ts.SourceFile, specifier: string): string[] {
  const names: string[] = [];
  for (const stmt of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(stmt) ||
      !ts.isStringLiteral(stmt.moduleSpecifier) ||
      stmt.moduleSpecifier.text !== specifier
    ) {
      continue;
    }
    const bindings = stmt.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        names.push(el.propertyName?.text ?? el.name.text);
      }
    }
  }
  return names;
}

function pascalToSlug(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase()
    .replace(/-/g, "");
}

function slugFromFixturePath(filePath: string): string | null {
  const match = filePath.match(/[/\\]styled[/\\]([^/\\]+)\.(?:js|tsx)$/);
  return match ? match[1] : null;
}

function slugFromDesignSystemSpecifier(spec: string): string | null {
  for (const prefix of DESIGN_SYSTEM_SPECIFIERS) {
    if (spec === prefix) return null;
    if (spec.startsWith(`${prefix}/`)) {
      return pascalToSlug(spec.slice(prefix.length + 1));
    }
  }
  return null;
}

export function evaluateRegistrySource(file: string, source: string): FixtureSplitProblem[] {
  const problems: FixtureSplitProblem[] = [];
  if (STATIC_REGISTRY_IMPORT_RE.test(source)) {
    problems.push({
      kind: "static-registry-import",
      file,
      detail: "registry statically imports a per-slug fixture module; use dynamic import()",
    });
  }
  const sourceFile = parseSource(file, source);
  for (const spec of importSpecifiers(sourceFile)) {
    if (/(^|\/)styled\//.test(spec) && !spec.includes("styled-shared")) {
      problems.push({
        kind: "static-registry-import",
        file,
        detail: `static import of fixture module "${spec}"`,
      });
    }
  }
  return problems;
}

export function evaluateFixtureModuleSource(
  file: string,
  source: string,
  knownSlugs: ReadonlySet<string>,
): FixtureSplitProblem[] {
  const slug = slugFromFixturePath(file);
  if (slug == null) return [];
  const problems: FixtureSplitProblem[] = [];
  const sourceFile = parseSource(file, source);

  for (const spec of importSpecifiers(sourceFile)) {
    const other = spec.match(/^\.\/([^/.]+)(?:\.(?:js|tsx))?$/);
    if (other && other[1] !== slug && knownSlugs.has(other[1])) {
      problems.push({
        kind: "cross-slug-fixture-import",
        file,
        detail: `fixture "${slug}" imports sibling fixture "${other[1]}"`,
      });
    }

    const subpathSlug = slugFromDesignSystemSpecifier(spec);
    if (
      subpathSlug != null &&
      subpathSlug !== slug &&
      knownSlugs.has(subpathSlug) &&
      !COMPOSITION_SLUGS.has(subpathSlug)
    ) {
      problems.push({
        kind: "cross-slug-component-import",
        file,
        detail: `fixture "${slug}" imports component module "${spec}" (slug "${subpathSlug}")`,
      });
    }
  }

  for (const specifier of DESIGN_SYSTEM_SPECIFIERS) {
    for (const name of namedBindingsFrom(sourceFile, specifier)) {
      const importedSlug = pascalToSlug(name);
      if (
        importedSlug !== slug &&
        knownSlugs.has(importedSlug) &&
        !COMPOSITION_SLUGS.has(importedSlug)
      ) {
        problems.push({
          kind: "cross-slug-component-import",
          file,
          detail: `fixture "${slug}" imports ${name} (slug "${importedSlug}")`,
        });
      }
    }
  }

  return problems;
}

export function evaluateFixtureRegistries(comparisonRoot: string): FixtureSplitProblem[] {
  const problems: FixtureSplitProblem[] = [];
  const knownSlugs = new Set<string>();

  for (const { dir, ext } of FIXTURE_DIRS) {
    const abs = join(comparisonRoot, dir);
    if (!existsSync(abs)) continue;
    for (const filename of readdirSync(abs)) {
      if (filename.endsWith(ext)) {
        knownSlugs.add(filename.slice(0, -ext.length));
      }
    }
  }

  for (const relative of REGISTRY_FILES) {
    const abs = join(comparisonRoot, relative);
    if (!existsSync(abs)) {
      problems.push({
        kind: "static-registry-import",
        file: relative,
        detail: `registry file is missing: ${abs}`,
      });
      continue;
    }
    problems.push(...evaluateRegistrySource(relative, readFileSync(abs, "utf8")));
  }

  for (const { dir, ext } of FIXTURE_DIRS) {
    const abs = join(comparisonRoot, dir);
    if (!existsSync(abs)) continue;
    for (const filename of readdirSync(abs)) {
      if (!filename.endsWith(ext)) continue;
      const relative = `${dir}/${filename}`;
      problems.push(
        ...evaluateFixtureModuleSource(
          relative,
          readFileSync(join(comparisonRoot, relative), "utf8"),
          knownSlugs,
        ),
      );
    }
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
  const problems = evaluateFixtureRegistries(root);
  if (problems.length > 0) {
    for (const problem of problems) {
      console.error(`${problem.kind}: ${problem.file}: ${problem.detail}`);
    }
    process.exit(1);
  }
  console.log("fixture registry split: ok");
}
