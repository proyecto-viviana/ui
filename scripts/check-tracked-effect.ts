/**
 * guard:tracked-effect — remaining createTrackedEffect calls under packages/<package>/src.
 *
 * Ticket #554. The primitive is deprecated. Each call is converted on its own,
 * because createEffect(compute, effect) and onSettled subscribe at different
 * times. This ratchet is keyed by file and count, not by line: a new call
 * fails, and a baselined file whose count drops fails until this baseline is
 * updated. Comments and string literals are not calls.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts/tracked-effect-baseline.json");
const NAME = "createTrackedEffect";

export interface TrackedEffectBaseline {
  version: number;
  generated: string;
  description: string;
  files: Record<string, number>;
}

function isTrackedEffectCallee(node: ts.Expression): boolean {
  if (ts.isIdentifier(node)) return node.text === NAME;
  if (ts.isPropertyAccessExpression(node)) return node.name.text === NAME;
  return false;
}

/** Executed createTrackedEffect calls. A comment or a string literal counts as zero. */
export function countTrackedEffectCalls(sourceText: string, fileName = "input.tsx"): number {
  if (!sourceText.includes(NAME)) return 0;
  const source = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.ESNext,
    true,
    fileName.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  let count = 0;
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) && isTrackedEffectCallee(node.expression)) count += 1;
    ts.forEachChild(node, visit);
  };
  visit(source);
  return count;
}

function callsWord(count: number): string {
  return count === 1 ? "call" : "calls";
}

/**
 * Failures when `have` drifts from `allowed`. A file absent from a map has
 * count 0. Messages use "call" only when the counted number is 1.
 */
export function diffTrackedEffectCounts(
  have: Record<string, number>,
  allowed: Record<string, number>,
): string[] {
  const files = [...new Set([...Object.keys(have), ...Object.keys(allowed)])].sort();
  const failures: string[] = [];
  for (const file of files) {
    const got = have[file] ?? 0;
    const want = allowed[file] ?? 0;
    if (got === want) continue;
    if (want === 0) {
      failures.push(
        `+ ${file} has ${got} createTrackedEffect ${callsWord(got)} and is not in the baseline`,
      );
    } else if (got === 0) {
      failures.push(
        `- ${file} has no createTrackedEffect calls; this record no longer matches the tree (baseline still lists ${want})`,
      );
    } else if (got > want) {
      failures.push(
        `+ ${file} has ${got} createTrackedEffect ${callsWord(got)}; baseline allows ${want}`,
      );
    } else {
      failures.push(
        `- ${file} has ${got} createTrackedEffect ${callsWord(got)}; this record no longer matches the tree (baseline still lists ${want})`,
      );
    }
  }
  return failures;
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

function packageSourceDirs(root: string): string[] {
  const packages = path.join(root, "packages");
  const dirs: string[] = [];
  for (const entry of readdirSync(packages, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const source = path.join(packages, entry.name, "src");
    try {
      if (statSync(source).isDirectory()) dirs.push(source);
    } catch {
      // A package with no src is outside this guard.
    }
  }
  return dirs;
}

/** File → call count for packages/<package>/src. Zero-count files are omitted. */
export function scanTrackedEffectCounts(root = ROOT): Record<string, number> {
  const counts = new Map<string, number>();
  for (const directory of packageSourceDirs(root)) {
    for (const file of walkSources(directory)) {
      const text = readFileSync(file, "utf8");
      const count = countTrackedEffectCalls(text, file);
      if (count === 0) continue;
      const relative = path.relative(root, file).split(path.sep).join("/");
      counts.set(relative, count);
    }
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));
}

export function trackedEffectBaselineDocument(
  files: Record<string, number>,
  generated = "2026-10-07",
): TrackedEffectBaseline {
  return {
    version: 1,
    generated,
    description:
      "Remaining createTrackedEffect calls under packages/<package>/src. Ticket #554. A new call fails. A baselined file whose count drops fails until this file is updated. Keyed by file, not line.",
    files,
  };
}

function loadBaseline(): TrackedEffectBaseline {
  const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as TrackedEffectBaseline;
  if (baseline.version !== 1 || baseline.files == null) {
    throw new Error(`${path.relative(ROOT, BASELINE_PATH)} must be version 1 with a files map`);
  }
  return baseline;
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
  const files = scanTrackedEffectCounts();
  if (process.argv.includes("--print")) {
    process.stdout.write(`${JSON.stringify(trackedEffectBaselineDocument(files), null, 2)}\n`);
    return;
  }
  const baseline = loadBaseline();
  const failures = diffTrackedEffectCounts(files, baseline.files);
  assert.deepEqual(
    failures,
    [],
    `createTrackedEffect calls drifted from scripts/tracked-effect-baseline.json:\n${failures.join("\n")}`,
  );
  const calls = Object.values(files).reduce((sum, count) => sum + count, 0);
  process.stdout.write(
    `guard:tracked-effect — PASS: ${calls} calls in ${Object.keys(files).length} files match the baseline.\n`,
  );
}

if (isExecutedDirectly()) main();
