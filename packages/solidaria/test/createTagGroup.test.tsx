/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { flush, For } from "solid-js";
import { createListState, type Key, type SelectionMode } from "@proyecto-viviana/solid-stately";
import { createTagGroup, createTag } from "../src/tag";
import { I18nProvider } from "../src/i18n";
import { setInteractionModality } from "../src/interactions/createInteractionModality";

interface Item {
  id: string;
  name: string;
}

const sampleItems: Item[] = [
  { id: "1", name: "Alpha" },
  { id: "2", name: "Beta" },
  { id: "3", name: "Gamma" },
];

function HookTag(props: { item: Item; state: ReturnType<typeof createListState<Item>> }) {
  let ref: HTMLDivElement | undefined;

  const tagAria = createTag(
    {
      get key() {
        return props.item.id;
      },
      get textValue() {
        return props.item.name;
      },
    },
    props.state,
    () => ref ?? null,
  );

  return (
    <div ref={ref} {...tagAria.rowProps}>
      <span {...tagAria.gridCellProps}>{props.item.name}</span>
    </div>
  );
}

function HookTagList(props: {
  items?: Item[];
  selectionMode?: SelectionMode;
  defaultSelectedKeys?: Iterable<Key>;
  disabledKeys?: Iterable<Key>;
  onRemove?: (keys: Set<Key>) => void;
}) {
  const items = () => props.items ?? sampleItems;

  const state = createListState({
    get items() {
      return items();
    },
    getKey: (item) => item.id,
    get selectionMode() {
      return props.selectionMode ?? "none";
    },
    get defaultSelectedKeys() {
      return props.defaultSelectedKeys;
    },
    get disabledKeys() {
      return props.disabledKeys;
    },
  });

  const tagGroupAria = createTagGroup(
    {
      "aria-label": "Hook tags",
      get onRemove() {
        return props.onRemove;
      },
    },
    state,
  );

  return (
    <div {...tagGroupAria.gridProps}>
      <For each={items()}>{(item) => <HookTag item={item} state={state} />}</For>
    </div>
  );
}

describe("createTagGroup/createTag", () => {
  it("makes every enabled tag a tab stop when focus is not yet set", () => {
    // useTag (vendored useTag.ts:100-104): tabIndex = 0 when
    // `!isDisabled && (isItemFocused || focusedKey == null)`. So with nothing
    // focused, ALL enabled rows are tab stops (native tab order then lands on the
    // last row on Shift+Tab); only the disabled row is -1.
    render(() => <HookTagList disabledKeys={["1"]} />);

    const alpha = screen.getByRole("option", { name: "Alpha" });
    const beta = screen.getByRole("option", { name: "Beta" });
    const gamma = screen.getByRole("option", { name: "Gamma" });

    expect(alpha).toHaveAttribute("tabindex", "-1");
    expect(beta).toHaveAttribute("tabindex", "0");
    expect(gamma).toHaveAttribute("tabindex", "0");
  });

  it("does not use selection to pick a tab stop (unlike ListBox)", () => {
    // useTag's tabIndex ignores selection entirely — a selected key is NOT a
    // special initial tab stop. Every enabled tag stays a tab stop until a key
    // is focused.
    render(() => <HookTagList selectionMode="single" defaultSelectedKeys={["3"]} />);

    const alpha = screen.getByRole("option", { name: "Alpha" });
    const gamma = screen.getByRole("option", { name: "Gamma" });

    expect(alpha).toHaveAttribute("tabindex", "0");
    expect(gamma).toHaveAttribute("tabindex", "0");
  });

  it("supports Arrow/Home/End navigation and skips disabled tags", () => {
    render(() => <HookTagList disabledKeys={["2"]} />);

    const alpha = screen.getByRole("option", { name: "Alpha" });
    const gamma = screen.getByRole("option", { name: "Gamma" });

    alpha.focus();
    fireEvent.keyDown(alpha, { key: "ArrowRight" });
    expect(gamma).toHaveFocus();

    fireEvent.keyDown(gamma, { key: "Home" });
    expect(alpha).toHaveFocus();

    fireEvent.keyDown(alpha, { key: "End" });
    expect(gamma).toHaveFocus();
  });

  it("removes selected keys when delete is pressed on a selected tag", () => {
    const onRemove = vi.fn();
    render(() => (
      <HookTagList selectionMode="multiple" defaultSelectedKeys={["1", "2"]} onRemove={onRemove} />
    ));

    const alpha = screen.getByRole("option", { name: "Alpha" });
    fireEvent.keyDown(alpha, { key: "Delete" });

    expect(onRemove).toHaveBeenCalledTimes(1);
    const removedKeys = onRemove.mock.calls[0]?.[0] as Set<Key>;
    expect(Array.from(removedKeys).sort()).toEqual(["1", "2"]);
  });

  it("labels the remove button from I18nProvider, not the English literal", () => {
    function RemovableTag(props: { item: Item; state: ReturnType<typeof createListState<Item>> }) {
      let ref: HTMLDivElement | undefined;
      const tagAria = createTag(
        {
          get key() {
            return props.item.id;
          },
          get textValue() {
            return props.item.name;
          },
        },
        props.state,
        () => ref ?? null,
      );
      return (
        <div ref={ref} {...tagAria.rowProps}>
          <span {...tagAria.gridCellProps}>{props.item.name}</span>
          <button {...tagAria.removeButtonProps} data-testid="remove">
            x
          </button>
        </div>
      );
    }

    function RemovableList() {
      const state = createListState({
        items: sampleItems,
        getKey: (item) => item.id,
      });
      createTagGroup({ "aria-label": "Hook tags", onRemove: () => {} }, state);
      return <RemovableTag item={sampleItems[0]!} state={state} />;
    }

    render(() => (
      <I18nProvider locale="de-DE">
        <RemovableList />
      </I18nProvider>
    ));
    expect(screen.getByTestId("remove")).toHaveAttribute("aria-label", "Entfernen");
  });

  it("adds the tag catalog remove description on the row when removal is allowed", () => {
    // useTag.ts:96-104 and 131-134. The row carries removeDescription through
    // aria-describedby only when onRemove is set and the modality is keyboard
    // or virtual. A virtual modality on a touch device is treated as pointer.
    const descriptionOf = (name: string) => {
      flush();
      const row = screen.getByRole("option", { name });
      const id = row.getAttribute("aria-describedby");
      return id ? document.getElementById(id)?.textContent : null;
    };

    setInteractionModality("keyboard");
    render(() => <HookTagList onRemove={() => {}} />);
    expect(descriptionOf("Alpha")).toBe("Press Delete to remove tag.");
    cleanup();

    render(() => <HookTagList />);
    expect(descriptionOf("Alpha")).toBeNull();
    cleanup();

    setInteractionModality("pointer");
    render(() => <HookTagList onRemove={() => {}} />);
    expect(descriptionOf("Alpha")).toBeNull();
    cleanup();

    const touchDescriptor = Object.getOwnPropertyDescriptor(window, "ontouchstart");
    delete window.ontouchstart;
    try {
      setInteractionModality("virtual");
      render(() => <HookTagList onRemove={() => {}} />);
      expect(descriptionOf("Alpha")).toBe("Press Delete to remove tag.");
      cleanup();

      window.ontouchstart = null;
      render(() => <HookTagList onRemove={() => {}} />);
      expect(descriptionOf("Alpha")).toBeNull();
      cleanup();
    } finally {
      if (touchDescriptor) {
        Object.defineProperty(window, "ontouchstart", touchDescriptor);
      } else {
        delete window.ontouchstart;
      }
    }

    setInteractionModality("keyboard");
    render(() => (
      <I18nProvider locale="de-DE">
        <HookTagList onRemove={() => {}} />
      </I18nProvider>
    ));
    expect(descriptionOf("Alpha")).toBe("Auf „Löschen“ drücken, um das Tag zu entfernen.");
    cleanup();
  });
});
