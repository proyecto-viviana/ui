/** @vitest-environment jsdom */
import { createSignal, flush } from "solid-js";
import { cleanup, render, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { TreeView, TreeViewItem, type TreeProps, type Key } from "../src/TreeView";

const items = [
  { id: "parent", textValue: "Parent", children: [{ id: "child", textValue: "Child" }] },
  { id: "other", textValue: "Other" },
];

describe("TreeView controlled public entry point", () => {
  afterEach(cleanup);

  it("forwards controlled focus, expansion, delegation and disabled type-ahead", async () => {
    const user = setupUser();
    const [focusedKey, setFocusedKey] = createSignal<Key | null>("parent");
    const [expandedKeys, setExpandedKeys] = createSignal<Set<Key>>(new Set());
    const [disallowTypeAhead, setDisallowTypeAhead] = createSignal(false);
    const onFocusChange = vi.fn();
    const onExpandedChange = vi.fn();
    const getKeyBelow = vi.fn(() => "other");
    const getKeyForSearch = vi.fn(() => "parent");
    const props: Omit<TreeProps<object>, "children"> = {
      items,
      "aria-label": "Layers",
      get focusedKey() {
        return focusedKey();
      },
      onFocusChange,
      get expandedKeys() {
        return expandedKeys();
      },
      onExpandedChange,
      keyboardDelegate: { getKeyBelow, getKeyForSearch },
      get disallowTypeAhead() {
        return disallowTypeAhead();
      },
    };
    const view = render(() => (
      <TreeView {...props}>
        {(item) => (
          <TreeViewItem id={item.id!} textValue={item.textValue}>
            {item.textValue}
          </TreeViewItem>
        )}
      </TreeView>
    ));
    const row = (name: string) => view.getByRole("row", { name });
    row("Parent").focus();
    await user.keyboard("{ArrowDown}");
    expect(getKeyBelow).toHaveBeenCalledWith("parent");
    expect(onFocusChange).toHaveBeenLastCalledWith("other");
    expect(document.activeElement).toBe(row("Parent"));
    setFocusedKey("other");
    flush();
    await waitFor(() => expect(document.activeElement).toBe(row("Other")));
    await user.keyboard("z");
    expect(getKeyForSearch).toHaveBeenCalledWith("z", "other");
    expect(onFocusChange).toHaveBeenLastCalledWith("parent");
    expect(document.activeElement).toBe(row("Other"));
    setDisallowTypeAhead(true);
    flush();
    getKeyForSearch.mockClear();
    await user.keyboard("p");
    expect(getKeyForSearch).not.toHaveBeenCalled();
    const expand = row("Parent").querySelector<HTMLButtonElement>(
      "[data-rsp-slot='expand-button']",
    )!;
    await user.click(expand);
    expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(["parent"]));
    expect(row("Parent")).toHaveAttribute("aria-expanded", "false");
    setExpandedKeys(new Set(["parent"]));
    flush();
    await waitFor(() => expect(row("Child")).toBeInTheDocument());
    expect(row("Parent")).toHaveAttribute("aria-expanded", "true");
  });
});
