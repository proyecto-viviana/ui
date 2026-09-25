/**
 * guard:injected-style-nonce — every dynamically created style element
 * in packages/ * /src must set a CSP nonce before appending to the DOM.
 *
 * Upstream React Aria / Spectrum S2 attaches `style.nonce = getNonce(ownerDoc)`
 * so strict-CSP pages do not drop rules that eliminate touch delays, provide
 * focus rings, or contain overscroll (#594).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["packages"];

export interface UnnoncedStyleSite {
  line: number;
  variableName?: string;
}

function walkSources(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === "test") {
        continue;
      }
      files.push(...walkSources(full));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(full);
    }
  }
  return files;
}

export function findUnnoncedStyleInjections(
  sourceText: string,
  fileName = "source.tsx",
): UnnoncedStyleSite[] {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const unnonced: UnnoncedStyleSite[] = [];

  function isStyleCreateElement(node: ts.CallExpression): boolean {
    const callee = node.expression;
    let methodName = "";
    if (ts.isIdentifier(callee)) {
      methodName = callee.text;
    } else if (ts.isPropertyAccessExpression(callee)) {
      methodName = callee.name.text;
    }
    if (methodName !== "createElement") return false;
    if (node.arguments.length === 0) return false;
    const firstArg = node.arguments[0];
    return ts.isStringLiteral(firstArg) && firstArg.text === "style";
  }

  function getEnclosingScope(node: ts.Node): ts.Node {
    let curr = node.parent;
    while (curr) {
      if (
        ts.isFunctionDeclaration(curr) ||
        ts.isArrowFunction(curr) ||
        ts.isFunctionExpression(curr) ||
        ts.isMethodDeclaration(curr) ||
        ts.isSourceFile(curr)
      ) {
        return curr;
      }
      curr = curr.parent;
    }
    return source;
  }

  function scopeSetsNonce(scope: ts.Node, varName?: string): boolean {
    let setsNonce = false;
    function visit(n: ts.Node): void {
      if (setsNonce) return;
      if (
        ts.isBinaryExpression(n) &&
        n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(n.left) &&
        n.left.name.text === "nonce"
      ) {
        if (!varName || n.left.expression.getText(source) === varName) {
          setsNonce = true;
          return;
        }
      }
      ts.forEachChild(n, visit);
    }
    visit(scope);
    return setsNonce;
  }

  function visit(node: ts.Node): void {
    if (ts.isCallExpression(node) && isStyleCreateElement(node)) {
      let varName: string | undefined;
      const parent = node.parent;
      if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
        varName = parent.name.text;
      } else if (
        ts.isBinaryExpression(parent) &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isIdentifier(parent.left)
      ) {
        varName = parent.left.text;
      }

      const scope = getEnclosingScope(node);
      if (!scopeSetsNonce(scope, varName)) {
        const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
        unnonced.push({ line: line + 1, variableName: varName });
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return unnonced;
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return pathToFileURL(path.resolve(entry)).href === import.meta.url;
  } catch {
    return false;
  }
}

export function main(): void {
  const files = SOURCE_ROOTS.flatMap((root) => {
    const srcDir = path.join(ROOT, root);
    return statSync(srcDir).isDirectory() ? walkSources(srcDir) : [];
  }).filter((f) => f.includes("/src/"));

  let styleSites = 0;
  const failures: string[] = [];

  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (!text.includes('createElement("style")') && !text.includes("createElement('style')")) {
      continue;
    }
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    const unnonced = findUnnoncedStyleInjections(text, file);
    // count total createElement("style") sites
    const matches = text.match(/createElement\(\s*["']style["']\s*\)/g);
    styleSites += matches ? matches.length : 0;

    for (const { line, variableName } of unnonced) {
      failures.push(
        `- ${relative}:${line} creates <style>${variableName ? ` (${variableName})` : ""} without setting .nonce`,
      );
    }
  }

  assert.deepEqual(
    failures,
    [],
    `Dynamic style elements must set a CSP nonce before mounting:\n${failures.join("\n")}`,
  );

  process.stdout.write(
    `guard:injected-style-nonce — PASS: ${styleSites} <style> injection sites verified, all nonced.\n`,
  );
}

if (isExecutedDirectly()) main();
