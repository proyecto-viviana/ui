/**
 * Guard: non-virtualized DnD keyboard parity wiring.
 *
 * Ensures keyboard-drag navigation stays delegate-driven and wired in:
 * - solidaria createDroppableCollection core — the DragManager DropTarget's
 *   `onKeyDown(e, drag)` walks the `keyboardDelegate` and composes the host
 *   `onKeyDown`, mirroring upstream `react-aria/useDroppableCollection.ts`
 *   (option types at :50/:54, DropTarget `onKeyDown(e, drag)` at :588,
 *   host composition `localState.props.onKeyDown?.(e)` at :788). The CP9.57
 *   DragManager port replaced the pre-port self-contained
 *   `collectionProps.onKeyDown` engine + `resolveFallbackKeyboardTarget`, so
 *   this guard asserts the faithful singleton architecture, not the old engine.
 * - collection component call-sites that pass useDroppableCollection options
 */

import { readFile } from "node:fs/promises";

interface CheckResult {
  target: string;
  ok: boolean;
  detail: string;
}

function format(results: CheckResult[]): string {
  return results
    .map((result) => `${result.ok ? "✓" : "✗"} ${result.target}: ${result.detail}`)
    .join("\n");
}

function hasPattern(source: string, pattern: RegExp): boolean {
  return pattern.test(source);
}

const corePath = "packages/solidaria/src/dnd/createDroppableCollection.ts";
const componentPaths = [
  "packages/solidaria-components/src/ListBox.tsx",
  "packages/solidaria-components/src/Menu.tsx",
  "packages/solidaria-components/src/GridList.tsx",
  "packages/solidaria-components/src/Table.tsx",
  "packages/solidaria-components/src/Tree.tsx",
] as const;

const [coreSource, ...componentSources] = await Promise.all([
  readFile(corePath, "utf8"),
  ...componentPaths.map((path) => readFile(path, "utf8")),
]);

const results: CheckResult[] = [];

results.push({
  target: corePath,
  ok:
    // keyboardDelegate + onKeyDown droppable-collection option types
    // (mirrors react-aria/useDroppableCollection.ts :50/:54).
    hasPattern(coreSource, /keyboardDelegate\?:\s*KeyboardDelegateLike/) &&
    hasPattern(coreSource, /onKeyDown\?:\s*\(e:\s*KeyboardEvent\)\s*=>\s*void/) &&
    // DragManager DropTarget's onKeyDown(e, drag) walks the keyboardDelegate
    // (mirrors upstream DropTarget onKeyDown at :588).
    hasPattern(coreSource, /onKeyDown\s*\(\s*e\s*,\s*drag\s*\)/) &&
    hasPattern(coreSource, /keyboardDelegate\.getKeyBelow/) &&
    hasPattern(coreSource, /keyboardDelegate\.getKeyAbove/) &&
    // Host onKeyDown is composed at the end of the DropTarget handler
    // (mirrors upstream localState.props.onKeyDown?.(e) at :788).
    hasPattern(coreSource, /opts\.onKeyDown\?\.\(e\)/),
  detail:
    "declares keyboardDelegate + onKeyDown options and drives keyboard-drag " +
    "navigation through the DragManager DropTarget onKeyDown that walks the " +
    "keyboardDelegate and composes the host onKeyDown",
});

for (let i = 0; i < componentPaths.length; i += 1) {
  const path = componentPaths[i];
  const source = componentSources[i];
  const hasUseDroppableCollectionCall = hasPattern(source, /useDroppableCollection\s*\(/);
  const hasKeyboardDelegateOption = hasPattern(source, /keyboardDelegate\s*:/);
  const hasSsrDirectionGuards =
    hasPattern(source, /typeof\s+window\s*!==\s*['"]undefined['"]/) &&
    hasPattern(source, /typeof\s+document\s*!==\s*['"]undefined['"]/);
  const hasHorizontalMethods =
    path.endsWith("GridList.tsx") || path.endsWith("Table.tsx")
      ? hasPattern(source, /getKeyLeftOf\s*:/) && hasPattern(source, /getKeyRightOf\s*:/)
      : true;

  results.push({
    target: path,
    ok:
      hasUseDroppableCollectionCall &&
      hasKeyboardDelegateOption &&
      hasHorizontalMethods &&
      hasSsrDirectionGuards,
    detail:
      path.endsWith("GridList.tsx") || path.endsWith("Table.tsx")
        ? "passes keyboardDelegate with horizontal key delegates and SSR-safe direction guards"
        : "passes keyboardDelegate into useDroppableCollection options with SSR-safe direction guards",
  });
}

console.log("DnD keyboard parity guard");
console.log(format(results));

const failed = results.filter((result) => !result.ok);
if (failed.length > 0) {
  console.log("");
  console.log(`Failed checks: ${failed.length}`);
  process.exit(1);
}
