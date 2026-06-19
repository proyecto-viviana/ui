/**
 * Tests for createTypeSelect
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@solidjs/testing-library";
import { createTypeSelect } from "../src/selection/createTypeSelect";
import { createSignal } from "solid-js";
import type { Collection, CollectionNode, Key } from "@proyecto-viviana/solid-stately";

// Helper to create a mock collection
function createMockCollection<T extends { key: Key; label: string }>(items: T[]): Collection<T> {
  const nodes: CollectionNode<T>[] = items.map((item, index) => ({
    type: "item" as const,
    key: item.key,
    value: item,
    textValue: item.label,
    rendered: item.label,
    level: 0,
    index,
    parentKey: null,
    hasChildNodes: false,
    childNodes: [],
  }));

  return {
    size: items.length,
    getKeys: () => items.map((i) => i.key),
    getItem: (key: Key) => nodes.find((n) => n.key === key) ?? null,
    at: (index: number) => nodes[index] ?? null,
    getKeyBefore: (key: Key) => {
      const index = items.findIndex((i) => i.key === key);
      return index > 0 ? items[index - 1].key : null;
    },
    getKeyAfter: (key: Key) => {
      const index = items.findIndex((i) => i.key === key);
      return index < items.length - 1 ? items[index + 1].key : null;
    },
    getFirstKey: () => items[0]?.key ?? null,
    getLastKey: () => items[items.length - 1]?.key ?? null,
    getChildren: () => [],
    getTextValue: (key: Key) => items.find((i) => i.key === key)?.label ?? "",
    [Symbol.iterator]: () => nodes[Symbol.iterator](),
  };
}

describe("createTypeSelect", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
    { key: "d", label: "Date" },
    { key: "e", label: "Elderberry" },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it("focuses item that starts with typed character", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'b' should focus Banana
    fireEvent.keyDown(container, { key: "b" });

    expect(onFocusedKeyChange).toHaveBeenCalledWith("b");
  });

  it("accumulates characters for multi-character search", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      // Items where multi-char typing is needed to distinguish
      const itemsWithSimilar = [
        { key: "ch", label: "Cherry" },
        { key: "choc", label: "Chocolate" },
        { key: "ci", label: "Citrus" },
      ];
      const collection = createMockCollection(itemsWithSimilar);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'c' should focus Cherry (first match)
    fireEvent.keyDown(container, { key: "c" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("ch");

    // Type 'h' (search is now "ch"): Cherry still matches the prefix, so focus
    // stays on it rather than advancing — the search starts *at* the focused
    // item, mirroring upstream ListKeyboardDelegate.getKeyForSearch.
    fireEvent.keyDown(container, { key: "h" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("ch");

    // Type 'o' (search is now "cho"): Cherry no longer matches, so the search
    // advances to Chocolate.
    fireEvent.keyDown(container, { key: "o" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("choc");

    // Type 'c' (search is now "choc"): Chocolate still matches, so it stays put.
    fireEvent.keyDown(container, { key: "c" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("choc");
  });

  it("clears search after timeout", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'a' should focus Apple
    fireEvent.keyDown(container, { key: "a" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("a");

    // Advance past the debounce timeout (1 second)
    vi.advanceTimersByTime(1100);

    // Type 'b' should start a new search, focusing Banana
    fireEvent.keyDown(container, { key: "b" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("b");
  });

  it("stays on the focused item when it still matches the search", async () => {
    // Upstream getKeyForSearch starts *at* the focused key (inclusive), so
    // typing a character the current item already matches keeps focus on it
    // instead of advancing to a later match.
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const itemsWithDupes = [
        { key: "1", label: "Alpha" },
        { key: "2", label: "Beta" },
        { key: "3", label: "Gamma" },
        { key: "4", label: "Alpha Two" },
      ];
      const collection = createMockCollection(itemsWithDupes);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>("1"); // Start at first Alpha

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'a' while focused on the first Alpha: it still matches, so focus
    // stays on it rather than jumping to "Alpha Two".
    fireEvent.keyDown(container, { key: "a" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("1");
  });

  it("wraps to an earlier item when nothing at or after the focus matches", async () => {
    // When no item at or after the focused key matches, the search retries from
    // the top of the collection (upstream useTypeSelect's second getKeyForSearch).
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const wrapItems = [
        { key: "1", label: "Apricot" },
        { key: "2", label: "Banana" },
        { key: "3", label: "Cherry" },
      ];
      const collection = createMockCollection(wrapItems);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>("3"); // Cherry

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'b' while focused on Cherry: nothing at or after Cherry matches, so
    // the search wraps from the top and lands on Banana.
    fireEvent.keyDown(container, { key: "b" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("2");
  });

  it("skips disabled items", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
        isKeyDisabled: (key) => key === "b", // Banana is disabled
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'b' should NOT focus Banana (it's disabled)
    fireEvent.keyDown(container, { key: "b" });
    // No call should have been made since no match found
    expect(onFocusedKeyChange).not.toHaveBeenCalled();
  });

  it("ignores Ctrl and Meta combinations but allows Alt", async () => {
    // Upstream useTypeSelect guards only ctrlKey/metaKey. AltGr (right Alt)
    // produces printable characters on many keyboard layouts, so altKey is
    // allowed through to the search.
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Ctrl+A should not trigger type-to-select
    fireEvent.keyDown(container, { key: "a", ctrlKey: true });
    expect(onFocusedKeyChange).not.toHaveBeenCalled();

    // Meta+C should not trigger type-to-select
    fireEvent.keyDown(container, { key: "c", metaKey: true });
    expect(onFocusedKeyChange).not.toHaveBeenCalled();

    // Alt+B *should* trigger type-to-select (AltGr emits characters)
    fireEvent.keyDown(container, { key: "b", altKey: true });
    expect(onFocusedKeyChange).toHaveBeenCalledWith("b");
  });

  it("ignores initial space character", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange,
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Initial space should be ignored (common action key)
    fireEvent.keyDown(container, { key: " " });
    expect(onFocusedKeyChange).not.toHaveBeenCalled();
  });

  it("adds a space to an active search and suppresses its default action", async () => {
    // Mirrors upstream "supports the space character in a search": once a search
    // is in progress, Space is appended to the buffer and its default action is
    // prevented so the collection doesn't treat it as a selection toggle.
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const spaceItems = [
        { key: "foo", label: "Foo" },
        { key: "foobar", label: "Foo Bar" },
      ];
      const collection = createMockCollection(spaceItems);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Build the search "foo" → Foo (both items match the prefix; the first wins)
    fireEvent.keyDown(container, { key: "f" });
    fireEvent.keyDown(container, { key: "o" });
    fireEvent.keyDown(container, { key: "o" });
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("foo");

    // Space continues the search ("foo ") → Foo Bar, and its default is prevented.
    const spaceEvent = new KeyboardEvent("keydown", {
      key: " ",
      bubbles: true,
      cancelable: true,
    });
    container.dispatchEvent(spaceEvent);
    expect(onFocusedKeyChange).toHaveBeenLastCalledWith("foobar");
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it("is disabled when isDisabled is true", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange,
        isDisabled: true,
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Type 'a' should not trigger anything when disabled
    fireEvent.keyDown(container, { key: "a" });
    expect(onFocusedKeyChange).not.toHaveBeenCalled();
  });

  it("calls onTypeSelect callback", async () => {
    const onTypeSelect = vi.fn();
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
        onTypeSelect,
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    fireEvent.keyDown(container, { key: "c" });

    expect(onTypeSelect).toHaveBeenCalledWith("c");
    expect(onFocusedKeyChange).toHaveBeenCalledWith("c");
  });

  it("is case-insensitive", async () => {
    const onFocusedKeyChange = vi.fn();

    const { getByTestId } = render(() => {
      const collection = createMockCollection(items);
      const [focusedKey, setFocusedKey] = createSignal<Key | null>(null);

      const { typeSelectProps } = createTypeSelect({
        collection: () => collection,
        focusedKey,
        onFocusedKeyChange: (key) => {
          setFocusedKey(key);
          onFocusedKeyChange(key);
        },
      });

      return (
        <div {...typeSelectProps} data-testid="container" tabIndex={0}>
          Content
        </div>
      );
    });

    const container = getByTestId("container");
    container.focus();

    // Uppercase 'B' should still match 'Banana'
    fireEvent.keyDown(container, { key: "B" });
    expect(onFocusedKeyChange).toHaveBeenCalledWith("b");
  });
});
