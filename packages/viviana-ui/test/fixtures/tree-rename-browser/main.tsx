import { render } from "@solidjs/web";
import { Provider, Text, TreeView, TreeViewItem, TreeViewItemContent } from "../../../src";
import "../../../src/theme.css";

const ITEMS = [
  { id: "layer", textValue: "Layer" },
  { id: "mask", textValue: "Mask" },
  { id: "branch", textValue: "Branch", children: [{ id: "child", textValue: "Child" }] },
];
const calls: Array<[string, string]> = [];
const enabled = new URLSearchParams(location.search).get("rename") !== "off";
const root = document.getElementById("root")!;
const dispose = render(
  () => (
    <Provider background="base" colorScheme="dark">
      <TreeView
        aria-label="Layers"
        items={ITEMS}
        onRename={enabled ? (key, name) => calls.push([String(key), name]) : undefined}
      >
        {(item) => (
          <TreeViewItem id={String(item.id)} textValue={item.textValue}>
            <TreeViewItemContent>
              <Text slot="label">{item.textValue}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    </Provider>
  ),
  root,
);

// Test-only lifecycle access; no product state manipulation or compensating focus.
const proof = { calls, dispose };
Object.assign(window, { treeRenameProof: proof });
declare global {
  interface Window {
    treeRenameProof: typeof proof;
    treeRenameRejections: string[];
  }
}
