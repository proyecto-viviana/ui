/**
 * Shared fixtures for the Tree hydration regression.
 *
 * Both halves (SSR and hydrate) must render *identical* trees — see
 * fixtures/collections.tsx for why one definition is load-bearing.
 *
 * The shape mirrors the showcase collections panel demo that surfaced the
 * failure: a dynamic-items Tree with one expanded branch. The styled Tree used
 * to build BOTH return branches eagerly — `const collection = (<JSX/>)` plus a
 * `framed` wrapper div embedding it — and return one of them. On the client,
 * JSX consts are real DOM nodes: `collection` claims the server-rendered
 * nodes, then constructing the unused detached `framed` div MOVES them into
 * it, so the returned branch hydrates empty. SSR output is strings (nothing
 * moves), so only the live page loses the subtree — silently: no mismatch
 * warning, no throw, no error boundary. Hence two fixtures, one per branch.
 */
import type { JSX } from "solid-js";
import { Provider, Text, Tree, TreeItem, TreeItemContent } from "../../src";

export const TREE_ITEMS = [
  {
    id: "projects",
    textValue: "Projects",
    children: [
      { id: "brief", textValue: "Project brief" },
      { id: "report", textValue: "Quarterly report" },
    ],
  },
  { id: "archive", textValue: "Archive" },
];

type TreeItemData = (typeof TREE_ITEMS)[number];

function renderRow(item: TreeItemData): JSX.Element {
  return (
    <TreeItem id={String(item.id)} textValue={item.textValue}>
      <TreeItemContent>
        <Text slot="label">{item.textValue}</Text>
      </TreeItemContent>
    </TreeItem>
  );
}

/** Bare branch: no label/description, the styled Tree returns the collection directly. */
export function TreeFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tree aria-label="Files" items={TREE_ITEMS} defaultExpandedKeys={["projects"]}>
        {renderRow}
      </Tree>
    </Provider>
  );
}

/** Framed branch: a label makes the styled Tree wrap the collection in the framed div. */
export function TreeLabeledFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tree
        aria-label="Files"
        label="Files"
        items={TREE_ITEMS}
        defaultExpandedKeys={["projects"]}
      >
        {renderRow}
      </Tree>
    </Provider>
  );
}
