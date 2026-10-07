/**
 * guard:s2-cleanups — a tracked effect that collects cleanups in `_s2Cleanups`
 * must not leave the effect by a bare `return`.
 *
 * `createTrackedEffect`'s cleanup is the effect's return value, so the array is
 * only ever run by the `return () => { for (const c of _s2Cleanups) c(); }` at
 * the end of the branch that filled it. A plain `return` taken after a
 * `_s2Cleanups.push(...)` strands whatever that push registered — an animation
 * frame, a ResizeObserver, an event listener — for the life of the page. That
 * is what `Virtualizer.tsx` did before #555 item 8.
 *
 * The rule, per function body that declares `_s2Cleanups`: walk its statements
 * in source order, ignoring nested function bodies; a `_s2Cleanups.push(...)`
 * arms the body, a `return` whose expression mentions `_s2Cleanups` is the
 * runner and disarms it, and any other `return` taken while armed is a
 * stranded cleanup. A body that is still armed when the walk finishes has
 * fallen off the end without a runner, and that is a strand too. A body may
 * fill and run the array more than once, which Virtualizer does, so this is a
 * state machine and not "is there a return anywhere between the first push
 * and the last runner".
 *
 * A `throw` is a known gap. The walk is source order, not a control-flow
 * graph, so a throw on the way to a later runner is not an exit and is not
 * reported on its own.
 *
 * Expected answer on a clean tree: zero.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["packages"];
const CLEANUPS = "_s2Cleanups";

export interface StrandedReturn {
  /** 1-based line of the `return`, or of the body's end when it falls off. */
  line: number;
  /** 1-based line of the `_s2Cleanups.push(...)` it strands. */
  pushLine: number;
  /** The body ended still armed, with no bare `return` already reported for this stretch. */
  fallsOff?: true;
}

function mentionsCleanups(node: ts.Node, source: ts.SourceFile): boolean {
  return node.getText(source).includes(CLEANUPS);
}

function isCleanupsPush(node: ts.Node, source: ts.SourceFile): boolean {
  if (!ts.isCallExpression(node)) return false;
  const callee = node.expression;
  return (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    callee.expression.text === CLEANUPS &&
    callee.name.text === "push" &&
    mentionsCleanups(callee, source)
  );
}

function isFunctionLike(node: ts.Node): boolean {
  return (
    ts.isArrowFunction(node) ||
    ts.isFunctionExpression(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isGetAccessor(node) ||
    ts.isSetAccessor(node)
  );
}

/**
 * Every `return` that leaves a `_s2Cleanups` body with cleanups pushed and not
 * run, in source order.
 */
function parseSource(sourceText: string, fileName: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

/** Function bodies that declare `_s2Cleanups`, in source order. */
export function cleanupBodies(sourceText: string, fileName = "input.tsx"): number {
  const source = parseSource(sourceText, fileName);
  const owners: ts.Node[] = [];
  const findOwners = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === CLEANUPS
    ) {
      let owner: ts.Node | undefined = node.parent;
      while (owner && !isFunctionLike(owner)) owner = owner.parent;
      if (owner && !owners.includes(owner)) owners.push(owner);
    }
    ts.forEachChild(node, findOwners);
  };
  findOwners(source);
  return owners.length;
}

export function findStrandedCleanupReturns(
  sourceText: string,
  fileName = "input.tsx",
): StrandedReturn[] {
  const source = parseSource(sourceText, fileName);
  const stranded: StrandedReturn[] = [];

  const lineOf = (node: ts.Node): number =>
    source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

  const owners: ts.Node[] = [];
  const findOwners = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === CLEANUPS
    ) {
      let owner: ts.Node | undefined = node.parent;
      while (owner && !isFunctionLike(owner)) owner = owner.parent;
      if (owner && !owners.includes(owner)) owners.push(owner);
    }
    ts.forEachChild(node, findOwners);
  };
  findOwners(source);

  for (const owner of owners) {
    const body = (owner as ts.FunctionLikeDeclaration).body;
    if (!body) continue;

    let armedAt: number | null = null;
    let reportedWhileArmed = false;
    const walk = (node: ts.Node): void => {
      // A nested function is a different call, not a path out of this body.
      if (node !== body && isFunctionLike(node)) return;

      if (isCleanupsPush(node, source)) {
        armedAt ??= lineOf(node);
      } else if (ts.isReturnStatement(node)) {
        if (node.expression && mentionsCleanups(node.expression, source)) {
          armedAt = null; // the runner
          reportedWhileArmed = false;
        } else if (armedAt != null) {
          stranded.push({ line: lineOf(node), pushLine: armedAt });
          reportedWhileArmed = true;
        }
        return;
      }
      ts.forEachChild(node, walk);
    };
    walk(body);
    if (armedAt != null && !reportedWhileArmed) {
      const end = Math.max(0, body.getEnd() - 1);
      stranded.push({
        line: source.getLineAndCharacterOfPosition(end).line + 1,
        pushLine: armedAt,
        fallsOff: true,
      });
    }
  }

  return stranded.sort((a, b) => a.line - b.line);
}

function walkSources(directory: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === "dist") continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkSources(absolute));
    else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      files.push(absolute);
    }
  }
  return files;
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

function main(): void {
  const files = SOURCE_ROOTS.flatMap((root) => {
    const absolute = path.join(ROOT, root);
    return statSync(absolute).isDirectory() ? walkSources(absolute) : [];
  });

  let bodies = 0;
  const failures: string[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (!text.includes(CLEANUPS)) continue;
    bodies += cleanupBodies(text, file);
    const relative = path.relative(ROOT, file).split(path.sep).join("/");
    for (const site of findStrandedCleanupReturns(text, file)) {
      const how = site.fallsOff ? "ends" : "returns";
      failures.push(
        `- ${relative}:${site.line} ${how} without running ${CLEANUPS}, ` +
          `stranding the cleanup pushed at line ${site.pushLine}`,
      );
    }
  }

  assert.deepEqual(
    failures,
    [],
    `A tracked effect's cleanup is its return value. Return the runner ` +
      `\`() => { for (const c of ${CLEANUPS}) c(); }\`, not a bare \`return\`:\n${failures.join("\n")}`,
  );

  process.stdout.write(
    `guard:s2-cleanups — PASS: ${bodies} ${CLEANUPS} bodies, no stranded cleanup.\n`,
  );
}

if (isExecutedDirectly()) main();
