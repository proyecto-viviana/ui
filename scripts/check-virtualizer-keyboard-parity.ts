/**
 * Guard: virtualizer / tree keyboard-walk parity against the pinned oracle.
 *
 * RAC Virtualizer.tsx does not own the keyboard walk — it delegates to layout.
 * The walk lives in DropTargetKeyboardNavigation.ts (drop-position cycle,
 * nested last-child / parent climb) and useDroppableCollection.ts (page-key
 * primary-then-opposite fallback). This guard diffs those oracle facts against
 * the local Virtualizer, ListDropTargetDelegate, and Tree keyboard delegates
 * so a rewrite that keeps identifiers but changes the walk fails (#205).
 */

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  extractClampedScanFallback,
  extractDropPositionAssignments,
  extractDropPositionCases,
  extractNamedFunctionBody,
  extractPageKeyFallback,
  jsonEqual,
  sliceBracedFrom,
  stringifyContract,
} from "./keyboard-parity-oracle";

interface CheckResult {
  target: string;
  ok: boolean;
  detail: string;
}

const UPSTREAM_CORE = "react-spectrum/packages/react-aria/src/dnd/useDroppableCollection.ts";
const UPSTREAM_NAV = "react-spectrum/packages/react-aria/src/dnd/DropTargetKeyboardNavigation.ts";
const VIRTUALIZER = "packages/solidaria-components/src/Virtualizer.tsx";
const TREE = "packages/solidaria-components/src/Tree.tsx";
const LIST_DELEGATE = "packages/solidaria-components/src/ListDropTargetDelegate.ts";
const TESTS = "packages/solidaria-components/test/Virtualizer.test.tsx";

function format(results: CheckResult[]): string {
  return results
    .map((result) => `${result.ok ? "✓" : "✗"} ${result.target}: ${result.detail}`)
    .join("\n");
}

function has(source: string, pattern: RegExp): boolean {
  return pattern.test(source);
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
  if (!existsSync(UPSTREAM_CORE) || !existsSync(UPSTREAM_NAV)) {
    console.log("Virtualizer keyboard-walk guard");
    console.error(`FAIL: pinned oracle missing (${UPSTREAM_CORE} / ${UPSTREAM_NAV}).`);
    process.exit(1);
  }

  const [
    upstreamCore,
    upstreamNav,
    virtualizerSource,
    treeSource,
    listDelegateSource,
    testsSource,
  ] = await Promise.all([
    readFile(UPSTREAM_CORE, "utf8"),
    readFile(UPSTREAM_NAV, "utf8"),
    readFile(VIRTUALIZER, "utf8"),
    readFile(TREE, "utf8"),
    readFile(LIST_DELEGATE, "utf8"),
    readFile(TESTS, "utf8"),
  ]);

  const oracleNext = extractNamedFunctionBody(upstreamNav, "nextDropTarget") ?? "";
  const oraclePrev = extractNamedFunctionBody(upstreamNav, "previousDropTarget") ?? "";
  const oracle = {
    nextDropPositions: extractDropPositionAssignments(oracleNext),
    prevDropPositions: extractDropPositionAssignments(oraclePrev),
    pageDownFallback: extractPageKeyFallback(upstreamCore, "PageDown"),
    pageUpFallback: extractPageKeyFallback(upstreamCore, "PageUp"),
    nestedNextUsesLevel: /nextNode\.level\s*>=\s*targetNode\.level/.test(oracleNext),
    afterClimbsParent: /parentKey/.test(oracleNext) && /parentKey/.test(oraclePrev),
    previousUsesLastChild: /getLastChild\b/.test(oraclePrev) || /lastChild/.test(oraclePrev),
  };

  const keyboardNavBody =
    extractNamedFunctionBody(virtualizerSource, "getBaseKeyboardNavigationTarget") ??
    extractNamedFunctionBody(virtualizerSource, "getKeyboardNavigationTarget") ??
    "";
  const pageNavBody =
    extractNamedFunctionBody(virtualizerSource, "getKeyboardPageNavigationTarget") ?? "";
  const treeNavBody = extractNamedFunctionBody(treeSource, "getKeyboardNavigationTarget") ?? "";
  const listNavBody =
    extractNamedFunctionBody(listDelegateSource, "getKeyboardNavigationTarget") ?? "";

  const localKeyboardFallback = extractClampedScanFallback(keyboardNavBody);
  const localPageFallback = extractClampedScanFallback(pageNavBody);

  const treeNextBody =
    sliceBracedFrom(treeNavBody, /if\s*\(\s*dir\s*===\s*['"]next['"]\s*\)/) ?? "";
  const treeNextCases = extractDropPositionCases(treeNextBody);
  const treeAfterNext = treeNavBody.slice(treeNavBody.indexOf(treeNextBody) + treeNextBody.length);
  const treePrevCases = extractDropPositionCases(treeAfterNext);

  const results: CheckResult[] = [
    {
      target: VIRTUALIZER,
      ok: localKeyboardFallback === oracle.pageDownFallback,
      detail:
        localKeyboardFallback === oracle.pageDownFallback
          ? "keyboard navigation scan is primary-then-opposite, matching oracle PageDown fallback"
          : `keyboard navigation scan is ${localKeyboardFallback}; oracle PageDown fallback is ${oracle.pageDownFallback}`,
    },
    {
      target: VIRTUALIZER,
      ok: localPageFallback === oracle.pageDownFallback,
      detail:
        localPageFallback === oracle.pageDownFallback
          ? "page navigation scan is primary-then-opposite, matching oracle PageDown fallback"
          : `page navigation scan is ${localPageFallback}; oracle PageDown fallback is ${oracle.pageDownFallback}`,
    },
    {
      target: TREE,
      ok:
        jsonEqual(treeNextCases, ["before", "on", "after"]) &&
        treePrevCases.includes("after") &&
        treePrevCases.includes("on") &&
        treePrevCases.includes("before") &&
        oracle.nestedNextUsesLevel &&
        /nextNode\.level/.test(treeNavBody) &&
        oracle.afterClimbsParent &&
        /parentKey/.test(treeNavBody) &&
        oracle.previousUsesLastChild &&
        /getDeepestLastChild/.test(treeNavBody) &&
        /isExpanded/.test(treeNavBody) &&
        /getFirstChildItemKey/.test(treeNavBody),
      detail:
        "tree keyboard walk keeps oracle nested descent, parent climb, and last-child previous",
    },
    {
      target: LIST_DELEGATE,
      ok: (() => {
        const transition =
          extractNamedFunctionBody(listDelegateSource, "resolveTransitionTarget") ?? "";
        const nextBranch =
          sliceBracedFrom(transition, /if\s*\(\s*direction\s*===\s*['"]next['"]\s*\)/) ?? "";
        const literals = [...nextBranch.matchAll(/['"](before|on|after)['"]/g)].map((m) => m[1]);
        const walksBeforeOnAfter =
          literals.indexOf("before") >= 0 &&
          literals.indexOf("on") > literals.indexOf("before") &&
          literals.lastIndexOf("after") > literals.indexOf("on");
        return (
          walksBeforeOnAfter &&
          oracle.nextDropPositions.includes("before") &&
          oracle.nextDropPositions.includes("on") &&
          oracle.nextDropPositions.includes("after") &&
          listNavBody.includes("resolveTransitionTarget")
        );
      })(),
      detail:
        "list drop-target keyboard cycle still walks before → on → after from the oracle contract",
    },
    {
      target: TESTS,
      ok:
        has(
          testsSource,
          /keyboard delegate falls back to opposite direction when forward scan has no valid targets/,
        ) &&
        has(
          testsSource,
          /keyboard page delegate falls back to opposite direction when forward scan has no valid targets/,
        ),
      detail: "regression tests name opposite-direction fallback for keyboard + page delegates",
    },
    {
      target: TESTS,
      ok:
        has(testsSource, /tree keyboard DnD navigates into expanded children/) &&
        has(testsSource, /tree keyboard DnD traverses up to parent sibling/) &&
        has(
          testsSource,
          /tree keyboard DnD previous from child goes to deepest last expanded descendant/,
        ),
      detail: "regression tests name tree branch-boundary wrapping edge cases",
    },
    {
      target: TESTS,
      ok: has(testsSource, /grid keyboard DnD wraps to boundary targets at collection edges/),
      detail: "regression tests name grid boundary wrapping edge cases",
    },
  ];

  console.log("Virtualizer keyboard-walk guard (pinned oracle)");
  console.log(`- oracle: ${UPSTREAM_CORE}`);
  console.log(`- oracle: ${UPSTREAM_NAV}`);
  if (
    oracle.pageDownFallback !== "primary-then-opposite" ||
    oracle.pageUpFallback !== "primary-then-opposite"
  ) {
    console.log("oracle page-key fallback contract:");
    console.log(
      stringifyContract({
        pageDownFallback: oracle.pageDownFallback,
        pageUpFallback: oracle.pageUpFallback,
      }),
    );
  }
  console.log(format(results));

  if (results.some((result) => !result.ok)) {
    console.log("");
    console.log("One or more virtualizer keyboard-walk checks failed.");
    process.exit(1);
  }
}

if (isExecutedDirectly()) {
  await main();
}
