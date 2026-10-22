/** @vitest-environment jsdom */
import { createSignal, flush } from "solid-js";
import { cleanup, render, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Button } from "@proyecto-viviana/solidaria-components";
import { TreeView, TreeViewItem, type TreeProps, type Key } from "../src/TreeView";

const items = [
  { id: "parent", textValue: "Parent", children: [{ id: "child", textValue: "Child" }] },
  { id: "other", textValue: "Other" },
];

describe("TreeView controlled public entry point", () => {
  afterEach(cleanup);

  it.each(["pointer", "keyboard"] as const)(
    "keeps rows and their controls mounted across controlled %s focus",
    async (input) => {
      const user = setupUser();
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(
        input === "pointer" ? null : "parent",
      );
      const onPress = vi.fn();
      const getFirstKey = vi.fn(() => "parent");
      const view = render(() => (
        <TreeView
          items={items}
          aria-label="Layers"
          focusedKey={focusedKey()}
          onFocusChange={setFocusedKey}
          keyboardDelegate={{ getFirstKey, getKeyBelow: () => "other" }}
        >
          {(item) => (
            <TreeViewItem id={item.id!} textValue={item.textValue}>
              {item.textValue}
              <Button
                ref={(button) =>
                  button.addEventListener("pointerdown", () =>
                    button.closest<HTMLElement>("[role=row]")!.focus(),
                  )
                }
                onPress={onPress}
              >
                Add keyframe
              </Button>
            </TreeViewItem>
          )}
        </TreeView>
      ));
      const rows = view.getAllByRole("row");
      const buttons = view.getAllByRole("button", { name: "Add keyframe" });
      if (input === "pointer") {
        await user.pointer({ target: buttons[1], keys: "[MouseLeft>]" });
      } else {
        rows[0].focus();
        await user.keyboard("{ArrowDown}");
      }
      flush();
      expect(focusedKey()).toBe("other");
      rows.forEach((row, index) => expect(view.getAllByRole("row")[index]).toBe(row));
      buttons.forEach((button, index) =>
        expect(view.getAllByRole("button", { name: "Add keyframe" })[index]).toBe(button),
      );
      // Delegates are queries. Reading the first key during pointer focus must
      // not reset controlled focus to that key.
      expect(getFirstKey()).toBe("parent");
      flush();
      expect(focusedKey()).toBe("other");
      expect(rows[1].contains(document.activeElement)).toBe(true);
      if (input === "pointer") {
        await user.pointer({ target: buttons[1], keys: "[/MouseLeft]" });
        expect(onPress).toHaveBeenCalledTimes(1);
      }
    },
  );

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
