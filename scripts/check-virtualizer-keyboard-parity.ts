/**
 * Guard: virtualizer keyboard delegate parity invariants.
 *
 * Ensures keyboard and page navigation fallback semantics remain wired:
 * - opposite-direction fallback scan for keyboard navigation
 * - opposite-direction fallback scan for page navigation
 * - regression coverage for both paths in Virtualizer tests
 */

import { readFile } from "node:fs/promises";

interface CheckResult {
  target: string;
  ok: boolean;
  detail: string;
}

function has(source: string, pattern: RegExp): boolean {
  return pattern.test(source);
}

function format(results: CheckResult[]): string {
  return results.map((r) => `${r.ok ? "✓" : "✗"} ${r.target}: ${r.detail}`).join("\n");
}

const virtualizerPath = "packages/solidaria-components/src/Virtualizer.tsx";
const treePath = "packages/solidaria-components/src/Tree.tsx";
const testsPath = "packages/solidaria-components/test/Virtualizer.test.tsx";

const [virtualizerSource, treeSource, testsSource] = await Promise.all([
  readFile(virtualizerPath, "utf8"),
  readFile(treePath, "utf8"),
  readFile(testsPath, "utf8"),
]);

const results: CheckResult[] = [
  {
    target: virtualizerPath,
    ok:
      has(virtualizerSource, /getKeyboardNavigationTarget\s*=\s*\(/) &&
      has(virtualizerSource, /const\s+oppositeDirection:\s*["']next["']\s*\|\s*["']previous["']/) &&
      has(
        virtualizerSource,
        /scanFromIndex\(clampedStart\s*-\s*delta,\s*-delta,\s*oppositeDirection\)/,
      ),
    detail: "keyboard navigation delegate includes opposite-direction fallback scan",
  },
  {
    target: virtualizerPath,
    ok:
      has(virtualizerSource, /getKeyboardPageNavigationTarget\s*=\s*\(/) &&
      has(
        virtualizerSource,
        /const\s+primaryTarget\s*=\s*scanFromIndex\(clampedStart,\s*delta\)/,
      ) &&
      has(
        virtualizerSource,
        /const\s+oppositeTarget\s*=\s*scanFromIndex\(clampedStart\s*-\s*delta,\s*-delta\)/,
      ),
    detail: "page navigation delegate includes opposite-direction fallback scan",
  },
  {
    target: testsPath,
    ok:
      has(
        testsSource,
        /keyboard delegate falls back to opposite direction when forward scan has no valid targets/,
      ) &&
      has(
        testsSource,
        /keyboard page delegate falls back to opposite direction when forward scan has no valid targets/,
      ),
    detail: "regression tests cover opposite-direction fallback for keyboard + page delegates",
  },
  {
    target: treePath,
    ok:
      has(treeSource, /getKeyboardNavigationTarget/) &&
      has(treeSource, /isExpanded/) &&
      has(treeSource, /getFirstChildItemKey/) &&
      has(treeSource, /getDeepestLastChild/),
    detail: "tree drop target delegate includes tree-aware keyboard DnD navigation",
  },
  {
    target: testsPath,
    ok:
      has(testsSource, /tree keyboard DnD navigates into expanded children/) &&
      has(testsSource, /tree keyboard DnD traverses up to parent sibling/) &&
      has(
        testsSource,
        /tree keyboard DnD previous from child goes to deepest last expanded descendant/,
      ),
    detail: "regression tests cover tree branch-boundary wrapping edge cases",
  },
  {
    target: testsPath,
    ok: has(testsSource, /grid keyboard DnD wraps to boundary targets at collection edges/),
    detail: "regression tests cover grid boundary wrapping edge cases",
  },
];

console.log("Virtualizer keyboard parity guard");
console.log(format(results));

if (results.some((r) => !r.ok)) {
  console.log("");
  console.log("One or more virtualizer keyboard parity checks failed.");
  process.exit(1);
}
