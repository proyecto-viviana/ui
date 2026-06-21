/**
 * Rendered-list tests for createSelectableList / createSelectableCollection
 * (spine keystone 2), driven over keystone 1's SelectionManager.
 *
 * Mirrors @react-aria/selection's useSelectableCollection contract: arrow keys
 * move the manager's focusedKey in collection order (entering at the first item
 * from nothing), Home/End jump to the ends, replace-behavior selects on focus,
 * Ctrl+A selects all, Escape clears selection, typeahead focuses by text, and
 * the container carries a roving tabIndex plus a data-collection id shared with
 * its items.
 */

import { describe, it, expect, afterEach } from "vitest";
import { createListState, type ListState, type ListStateProps } from "../../solid-stately/src";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  createSelectableList,
  type SelectableListAria,
} from "../src/selection/createSelectableList";

interface Item {
  key: string;
  label: string;
}

const items: Item[] = [
  { key: "a", label: "Apple" },
  { key: "b", label: "Banana" },
  { key: "c", label: "Cherry" },
  { key: "d", label: "Date" },
];

afterEach(() => {
  cleanup();
});

/** Render a <ul> wired with listProps and <li> items carrying data-key/data-collection. */
function renderList(stateProps: Partial<ListStateProps<Item>> = {}) {
  let state!: ListState<Item>;
  let api!: SelectableListAria;
  let container!: HTMLUListElement;
  render(() => {
    state = createListState<Item>({
      items,
      getKey: (item) => item.key,
      ...stateProps,
    });
    api = createSelectableList<Item>({
      selectionManager: state.selectionManager,
      ref: () => container,
    });
    const listProps = api.listProps as Record<string, unknown>;
    const collectionId = listProps["data-collection"] as string;
    return (
      <ul ref={container} {...api.listProps}>
        {items.map((item) => (
          <li data-key={item.key} data-collection={collectionId}>
            {item.label}
          </li>
        ))}
      </ul>
    );
  });
  return {
    get state() {
      return state;
    },
    get manager() {
      return state.selectionManager;
    },
    get listProps() {
      return api.listProps as Record<string, unknown>;
    },
    container,
  };
}

describe("createSelectableList — keyboard navigation", () => {
  it("enters at the first key, then moves down and up in collection order", () => {
    const { manager, container } = renderList();

    fireEvent.keyDown(container, { key: "ArrowDown" });
    expect(manager.focusedKey).toBe("a");

    fireEvent.keyDown(container, { key: "ArrowDown" });
    expect(manager.focusedKey).toBe("b");

    fireEvent.keyDown(container, { key: "ArrowUp" });
    expect(manager.focusedKey).toBe("a");
  });

  it("jumps to the first and last keys with Home and End", () => {
    const { manager, container } = renderList();

    fireEvent.keyDown(container, { key: "ArrowDown" });
    fireEvent.keyDown(container, { key: "End" });
    expect(manager.focusedKey).toBe("d");

    fireEvent.keyDown(container, { key: "Home" });
    expect(manager.focusedKey).toBe("a");
  });

  it("skips disabled keys while navigating", () => {
    const { manager, container } = renderList({ disabledKeys: ["b"] });

    fireEvent.keyDown(container, { key: "ArrowDown" }); // → a
    fireEvent.keyDown(container, { key: "ArrowDown" }); // skips b → c
    expect(manager.focusedKey).toBe("c");
  });
});

describe("createSelectableList — selection on focus (replace behavior)", () => {
  it("selects the focused item as it moves", () => {
    const { manager, container } = renderList({
      selectionMode: "multiple",
      selectionBehavior: "replace",
    });

    fireEvent.keyDown(container, { key: "ArrowDown" }); // focus + select 'a'
    expect(manager.focusedKey).toBe("a");
    expect(manager.isSelected("a")).toBe(true);

    fireEvent.keyDown(container, { key: "ArrowDown" }); // focus + select 'b', replacing 'a'
    expect(manager.isSelected("b")).toBe(true);
    expect(manager.isSelected("a")).toBe(false);
  });
});

describe("createSelectableList — selection shortcuts", () => {
  it("selects all with Ctrl+A in multiple mode", () => {
    const { manager, container } = renderList({ selectionMode: "multiple" });

    fireEvent.keyDown(container, { key: "a", ctrlKey: true, metaKey: true });
    expect(manager.isSelectAll).toBe(true);
  });

  it("clears selection with Escape", () => {
    const { manager, container } = renderList({
      selectionMode: "multiple",
      defaultSelectedKeys: ["b"],
    });
    expect(manager.isSelected("b")).toBe(true);

    fireEvent.keyDown(container, { key: "Escape" });
    expect(manager.isSelected("b")).toBe(false);
  });
});

describe("createSelectableList — typeahead", () => {
  // Each renderList builds its own type-select buffer; a single keystroke is one
  // search. Two different letters fired synchronously on one list would
  // accumulate into a combined query (matching upstream useTypeSelect, whose
  // 500ms reset timer can't fire between synchronous events), so we use a fresh
  // list per character.
  it("focuses an item whose text starts with 'c'", () => {
    const { manager, container } = renderList();
    fireEvent.keyDown(container, { key: "c" });
    expect(manager.focusedKey).toBe("c");
  });

  it("focuses an item whose text starts with 'b'", () => {
    const { manager, container } = renderList();
    fireEvent.keyDown(container, { key: "b" });
    expect(manager.focusedKey).toBe("b");
  });
});

describe("createSelectableList — collection props", () => {
  it("exposes a roving tabIndex that flips once an item is focused", () => {
    const harness = renderList();
    expect(harness.listProps.tabIndex).toBe(0);

    fireEvent.keyDown(harness.container, { key: "ArrowDown" });
    expect(harness.listProps.tabIndex).toBe(-1);
  });

  it("shares one data-collection id between the container and its items", () => {
    const { container } = renderList();
    const id = container.dataset.collection;
    expect(id).toBeTruthy();
    const item = container.querySelector('[data-key="b"]') as HTMLElement;
    expect(item.dataset.collection).toBe(id);
  });
});
