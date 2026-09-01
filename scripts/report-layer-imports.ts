/// <reference types="node" />

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const styledPackages = ["packages/solid-spectrum", "packages/viviana-ui", "packages/kumo"] as const;
const lowerPackages = [
  "@proyecto-viviana/solid-stately",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solidaria-components",
] as const;

interface Reference {
  file: string;
  line: number;
  module: string;
  name: string;
  kind: "runtime-import" | "type-import" | "runtime-reexport" | "type-reexport";
}

function walk(directory: string, files: string[] = []): string[] {
  for (const entry of readdirSync(directory)) {
    if (entry === "dist" || entry === "node_modules") continue;
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) {
      walk(absolute, files);
    } else if (/\.[cm]?[jt]sx?$/.test(entry)) {
      files.push(absolute);
    }
  }
  return files;
}

function lowerModule(specifier: string): string | null {
  return (
    lowerPackages.find(
      (candidate) => specifier === candidate || specifier.startsWith(`${candidate}/`),
    ) ?? null
  );
}

function lineOf(source: ts.SourceFile, node: ts.Node): number {
  return source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
}

function collectFile(file: string): Reference[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const references: Reference[] = [];

  const add = (node: ts.Node, module: string, name: string, kind: Reference["kind"]) => {
    references.push({
      file: path.relative(root, file).split(path.sep).join("/"),
      line: lineOf(source, node),
      module,
      name,
      kind,
    });
  };

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      const module = lowerModule(statement.moduleSpecifier.text);
      if (!module) continue;
      const clause = statement.importClause;
      if (!clause) {
        add(statement, module, "<side-effect>", "runtime-import");
        continue;
      }

      if (clause.name) {
        add(clause.name, module, "default", clause.isTypeOnly ? "type-import" : "runtime-import");
      }

      if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
        add(
          clause.namedBindings,
          module,
          "*",
          clause.isTypeOnly ? "type-import" : "runtime-import",
        );
      } else if (clause.namedBindings) {
        for (const element of clause.namedBindings.elements) {
          add(
            element,
            module,
            element.propertyName?.text ?? element.name.text,
            clause.isTypeOnly || element.isTypeOnly ? "type-import" : "runtime-import",
          );
        }
      }
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const module = lowerModule(statement.moduleSpecifier.text);
      if (!module) continue;
      const kind = statement.isTypeOnly ? "type-reexport" : "runtime-reexport";
      if (!statement.exportClause) {
        add(statement, module, "*", kind);
      } else if (ts.isNamespaceExport(statement.exportClause)) {
        add(statement.exportClause, module, "*", kind);
      } else {
        for (const element of statement.exportClause.elements) {
          add(
            element,
            module,
            element.propertyName?.text ?? element.name.text,
            statement.isTypeOnly || element.isTypeOnly ? "type-reexport" : "runtime-reexport",
          );
        }
      }
    }
  }

  return references;
}

for (const packageDirectory of styledPackages) {
  const sourceDirectory = path.join(root, packageDirectory, "src");
  const references = walk(sourceDirectory).flatMap(collectFile);
  const runtimeImports = references.filter((reference) => reference.kind === "runtime-import");
  const runtimeFiles = new Set(runtimeImports.map((reference) => reference.file));
  const runtimeSymbols = new Set(
    runtimeImports.map((reference) => `${reference.module}:${reference.name}`),
  );
  const typeImports = references.filter((reference) => reference.kind === "type-import");
  const reexports = references.filter((reference) => reference.kind.endsWith("reexport"));

  console.log(`\n${packageDirectory}`);
  console.log(
    `  runtime imports: ${runtimeImports.length} bindings in ${runtimeFiles.size} files (${runtimeSymbols.size} unique module/symbol pairs)`,
  );
  console.log(`  type imports: ${typeImports.length}; reexports: ${reexports.length}`);

  const byModule = new Map<string, Reference[]>();
  for (const reference of runtimeImports) {
    const list = byModule.get(reference.module) ?? [];
    list.push(reference);
    byModule.set(reference.module, list);
  }
  for (const [module, moduleReferences] of [...byModule].sort(([a], [b]) => a.localeCompare(b))) {
    const names = [...new Set(moduleReferences.map((reference) => reference.name))].sort();
    console.log(`  ${module} (${moduleReferences.length}): ${names.join(", ")}`);
  }
}

console.log(
  "\nThis is an inventory, not a boundary verdict. Runtime imports include legitimate composition and helpers as well as potential behavior ownership; inspect each symbol against the headless component contract before classifying it.",
);
