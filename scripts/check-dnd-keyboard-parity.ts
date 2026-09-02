/**
 * Guard: non-virtualized DnD keyboard-walk parity against the pinned oracle.
 *
 * Reads the keyboard walk from
 * `react-spectrum/packages/react-aria/src/dnd/useDroppableCollection.ts` and
 * `DropTargetKeyboardNavigation.ts`, then diffs the local port. Identifier
 * presence alone is not enough: reordering the walk while keeping the tokens
 * must fail (#205).
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  extractDelegateMethodOrder,
  extractDropPositionAssignments,
  extractHostOnKeyDownAfterSwitch,
  extractIncludeDisabledCalls,
  extractNamedFunctionBody,
  extractNavigateDirectionWalk,
  extractOnKeyDownCases,
  extractPageKeyFallback,
  jsonEqual,
  stringifyContract,
} from "./keyboard-parity-oracle";

interface CheckResult {
  target: string;
  ok: boolean;
  detail: string;
}

const UPSTREAM_CORE = "react-spectrum/packages/react-aria/src/dnd/useDroppableCollection.ts";
const UPSTREAM_NAV = "react-spectrum/packages/react-aria/src/dnd/DropTargetKeyboardNavigation.ts";
const LOCAL_CORE = "packages/solidaria/src/dnd/createDroppableCollection.ts";
const LOCAL_NAV = "packages/solidaria/src/dnd/DropTargetKeyboardNavigation.ts";

const COMPONENT_PATHS = [
  "packages/solidaria-components/src/ListBox.tsx",
  "packages/solidaria-components/src/Menu.tsx",
  "packages/solidaria-components/src/GridList.tsx",
  "packages/solidaria-components/src/Table.tsx",
  "packages/solidaria-components/src/Tree.tsx",
] as const;

function format(results: CheckResult[]): string {
  return results
    .map((result) => `${result.ok ? "✓" : "✗"} ${result.target}: ${result.detail}`)
    .join("\n");
}

function hasPattern(source: string, pattern: RegExp): boolean {
  return pattern.test(source);
}

function walkContract(coreSource: string, navSource: string) {
  const nextBody = extractNamedFunctionBody(navSource, "nextDropTarget") ?? "";
  const prevBody = extractNamedFunctionBody(navSource, "previousDropTarget") ?? "";
  return {
    onKeyDownCases: extractOnKeyDownCases(coreSource),
    hostOnKeyDownAfterSwitch: extractHostOnKeyDownAfterSwitch(coreSource),
    directions: extractNavigateDirectionWalk(navSource),
    nextDropPositions: extractDropPositionAssignments(nextBody),
    prevDropPositions: extractDropPositionAssignments(prevBody),
    nextDelegateMethods: extractDelegateMethodOrder(nextBody),
    prevDelegateMethods: extractDelegateMethodOrder(prevBody),
    nextIncludeDisabled: extractIncludeDisabledCalls(nextBody),
    prevIncludeDisabled: extractIncludeDisabledCalls(prevBody),
    pageDownFallback: extractPageKeyFallback(coreSource, "PageDown"),
    pageUpFallback: extractPageKeyFallback(coreSource, "PageUp"),
  };
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(entry) === path.resolve(new URL(import.meta.url).pathname);
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const results: CheckResult[] = [];

  if (!existsSync(UPSTREAM_CORE) || !existsSync(UPSTREAM_NAV)) {
    console.log("DnD keyboard-walk guard");
    console.error(`FAIL: pinned oracle missing (${UPSTREAM_CORE} / ${UPSTREAM_NAV}).`);
    process.exit(1);
  }

  const [upstreamCore, upstreamNav, localCore, localNav, ...componentSources] = await Promise.all([
    readFile(UPSTREAM_CORE, "utf8"),
    readFile(UPSTREAM_NAV, "utf8"),
    readFile(LOCAL_CORE, "utf8"),
    readFile(LOCAL_NAV, "utf8"),
    ...COMPONENT_PATHS.map((filePath) => readFile(filePath, "utf8")),
  ]);

  const expected = walkContract(upstreamCore, upstreamNav);
  const actual = walkContract(localCore, localNav);
  const walkOk = jsonEqual(expected, actual);

  results.push({
    target: `${LOCAL_CORE} + ${LOCAL_NAV}`,
    ok: walkOk,
    detail: walkOk
      ? "keyboard walk matches pinned useDroppableCollection + DropTargetKeyboardNavigation"
      : "keyboard walk DIFFERS from the pinned oracle (reordering tokens is not enough)",
  });

  if (!walkOk) {
    console.log("expected walk:");
    console.log(stringifyContract(expected));
    console.log("local walk:");
    console.log(stringifyContract(actual));
  }

  const oracleUsesHorizontal =
    expected.nextDelegateMethods.includes("getKeyLeftOf") ||
    expected.nextDelegateMethods.includes("getKeyRightOf") ||
    expected.prevDelegateMethods.includes("getKeyLeftOf") ||
    expected.prevDelegateMethods.includes("getKeyRightOf");

  const oracleOptionNames = ["keyboardDelegate", "onKeyDown"];
  results.push({
    target: LOCAL_CORE,
    ok: oracleOptionNames.every((name) => hasPattern(localCore, new RegExp(`${name}\\s*\\?:`))),
    detail: `declares oracle DroppableCollectionOptions (${oracleOptionNames.join(", ")})`,
  });

  for (let i = 0; i < COMPONENT_PATHS.length; i += 1) {
    const filePath = COMPONENT_PATHS[i];
    const source = componentSources[i];
    const hasUseDroppableCollectionCall = hasPattern(source, /useDroppableCollection\s*\(/);
    const hasKeyboardDelegateOption = hasPattern(source, /keyboardDelegate\s*:/);
    const needsHorizontal = filePath.endsWith("GridList.tsx") || filePath.endsWith("Table.tsx");
    const hasHorizontalMethods = needsHorizontal
      ? hasPattern(source, /getKeyLeftOf\s*:/) && hasPattern(source, /getKeyRightOf\s*:/)
      : true;

    results.push({
      target: filePath,
      ok:
        hasUseDroppableCollectionCall &&
        hasKeyboardDelegateOption &&
        hasHorizontalMethods &&
        (!needsHorizontal || oracleUsesHorizontal),
      detail: needsHorizontal
        ? "passes keyboardDelegate with horizontal key delegates required by the oracle walk"
        : "passes keyboardDelegate into useDroppableCollection options",
    });
  }

  console.log("DnD keyboard-walk guard (pinned oracle)");
  console.log(`- oracle: ${UPSTREAM_CORE}`);
  console.log(`- oracle: ${UPSTREAM_NAV}`);
  console.log(format(results));

  const failed = results.filter((result) => !result.ok);
  if (failed.length > 0) {
    console.log("");
    console.log(`Failed checks: ${failed.length}`);
    process.exit(1);
  }
}

if (isExecutedDirectly()) {
  await main();
}
