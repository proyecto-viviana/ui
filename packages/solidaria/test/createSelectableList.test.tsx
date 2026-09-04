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

import { describe, it, expect, afterEach } from "vite-plus/test";
import { createListState, type ListState, type ListStateProps } from "../../solid-stately/src";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  createSelectableList,
  type CreateSelectableListOptions,
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

type ListOptions = Partial<Omit<CreateSelectableListOptions<Item>, "selectionManager" | "ref">>;

/** Render a <ul> wired with listProps and <li> items carrying data-key/data-collection. */
function renderList(
  stateProps: Partial<ListStateProps<Item>> = {},
  listOptions: ListOptions = {},
  onParentKeyDown?: () => void,
) {
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
      ...listOptions,
      selectionManager: state.selectionManager,
      ref: () => container,
    });
    const listProps = api.listProps as Record<string, unknown>;
    const collectionId = listProps["data-collection"] as string;
    return (
      <div onKeyDown={onParentKeyDown}>
        <ul ref={container} {...api.listProps}>
          {items.map((item) => (
            <li data-key={item.key} data-collection={collectionId}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
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

    fireEvent.keyDown(container, { key: "ArrowDown", repeat: true }); // → a
    fireEvent.keyDown(container, { key: "ArrowDown", repeat: true }); // skips b → c
    expect(manager.focusedKey).toBe("c");
  });

  it("accepts repeated PageDown and PageUp events", () => {
    const { manager, container } = renderList(
      {},
      {
        keyboardDelegate: {
          getKeyPageBelow: (key) => (key === "a" ? "c" : null),
          getKeyPageAbove: (key) => (key === "c" ? "a" : null),
        },
      },
    );
    manager.setFocusedKey("a");

    fireEvent.keyDown(container, { key: "PageDown", repeat: true });
    expect(manager.focusedKey).toBe("c");

    fireEvent.keyDown(container, { key: "PageUp", repeat: true });
    expect(manager.focusedKey).toBe("a");
  });

  it("rejects repeated Home and End events", () => {
    const { manager, container } = renderList();
    manager.setFocusedKey("b");

    fireEvent.keyDown(container, { key: "End", repeat: true });
    expect(manager.focusedKey).toBe("b");

    fireEvent.keyDown(container, { key: "End" });
    expect(manager.focusedKey).toBe("d");

    fireEvent.keyDown(container, { key: "Home", repeat: true });
    expect(manager.focusedKey).toBe("d");

    fireEvent.keyDown(container, { key: "Home" });
    expect(manager.focusedKey).toBe("a");
  });

  it("rejects composing navigation events", () => {
    const { manager, container } = renderList();

    fireEvent.keyDown(container, { key: "ArrowDown", isComposing: true });
    expect(manager.focusedKey).toBeNull();

    fireEvent.keyDown(container, { key: "ArrowDown" });
    expect(manager.focusedKey).toBe("a");
  });

  it("matches navigation modifiers exactly", () => {
    const { manager, container } = renderList();

    fireEvent.keyDown(container, { key: "ArrowDown", altKey: true });
    expect(manager.focusedKey).toBeNull();

    fireEvent.keyDown(container, { key: "ArrowDown", ctrlKey: true });
    expect(manager.focusedKey).toBe("a");
  });

  it("extends multiple selection with Shift+ArrowDown", () => {
    const { manager, container } = renderList({ selectionMode: "multiple" });
    manager.setFocusedKey("a");
    manager.replaceSelection("a");

    fireEvent.keyDown(container, { key: "ArrowDown", shiftKey: true });

    expect(manager.focusedKey).toBe("b");
    expect(manager.isSelected("a")).toBe(true);
    expect(manager.isSelected("b")).toBe(true);
  });

  it("prevents and stops handled movement but propagates an unavailable movement", () => {
    let bubbleCount = 0;
    const { manager, container } = renderList({}, {}, () => bubbleCount++);
    const handled = new window.KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(handled);
    expect(handled.defaultPrevented).toBe(true);
    expect(bubbleCount).toBe(0);

    manager.setFocusedKey("d");
    const unavailable = new window.KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(unavailable);
    expect(unavailable.defaultPrevented).toBe(false);
    expect(bubbleCount).toBe(1);
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

    fireEvent.keyDown(container, { key: "a", ctrlKey: true });
    expect(manager.isSelectAll).toBe(true);
  });

  it("rejects repeated select-all events", () => {
    const { manager, container } = renderList({ selectionMode: "multiple" });

    fireEvent.keyDown(container, { key: "a", ctrlKey: true, repeat: true });
    expect(manager.isSelectAll).toBe(false);
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

  it("rejects repeated and composing Escape events", () => {
    const { manager, container } = renderList({
      selectionMode: "multiple",
      defaultSelectedKeys: ["b"],
    });

    fireEvent.keyDown(container, { key: "Escape", repeat: true });
    expect(manager.isSelected("b")).toBe(true);

    fireEvent.keyDown(container, { key: "Escape", isComposing: true });
    expect(manager.isSelected("b")).toBe(true);
  });

  it("lets Tab and unlisted Alt+Tab events continue without prevention", () => {
    let bubbleCount = 0;
    const { container } = renderList({}, {}, () => bubbleCount++);
    for (const init of [
      { key: "Tab", repeat: true },
      { key: "Tab", altKey: true },
    ]) {
      const event = new window.KeyboardEvent("keydown", {
        ...init,
        bubbles: true,
        cancelable: true,
      });
      container.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    }
    expect(bubbleCount).toBe(2);
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

describe("createSelectableList — autoFocus with selectOnFocus", () => {
  it.each([
    { autoFocus: "first" as const, key: "a" },
    { autoFocus: "last" as const, key: "d" },
  ])(
    "selects the autofocused item when selectOnFocus with autoFocus=$autoFocus",
    ({ autoFocus, key }) => {
      const { manager } = renderList(
        { selectionMode: "single", selectionBehavior: "replace" },
        { autoFocus },
      );
      expect(manager.focusedKey).toBe(key);
      expect(manager.selectedKeys.has(key)).toBe(true);
    },
  );

  it("does not select the autofocused item when selectionMode is none", () => {
    const { manager } = renderList(
      { selectionMode: "none", selectionBehavior: "replace" },
      { autoFocus: "first" },
    );
    expect(manager.focusedKey).toBe("a");
    expect(manager.selectedKeys.size).toBe(0);
  });

  it("does not change an existing all selection when autofocusing", () => {
    const { manager } = renderList(
      {
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: "all",
      },
      { autoFocus: "first" },
    );
    expect(manager.focusedKey).toBe("a");
    expect(manager.selectedKeys.size).toBe(items.length);
  });
});
