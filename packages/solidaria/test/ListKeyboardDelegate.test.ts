/**
 * Unit tests for ListKeyboardDelegate (spine keystone 2).
 *
 * Mirrors the navigation contract of @react-aria/selection's
 * `ListKeyboardDelegate`: first/last/next/previous resolution, disabled
 * skipping, typeahead search via a collator, and the orientation-dependent
 * presence of the horizontal getKeyLeftOf/getKeyRightOf methods.
 *
 * These are pure-logic assertions over a built collection — no DOM is rendered.
 * For a vertical stack the delegate's row navigation falls back to
 * next/previous when the item elements can't be measured (getItemElement returns
 * null), which is exactly the no-DOM case here.
 */

import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { createListState, type ListStateProps } from "../../solid-stately/src";
import {
  ListKeyboardDelegate,
  type ListKeyboardDelegateOptions,
} from "../src/selection/ListKeyboardDelegate";

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

const collator = new Intl.Collator("en-US", { usage: "search", sensitivity: "base" });

/** Build a collection + delegate inside a disposable root for pure assertions. */
function withDelegate(
  delegateOptions: Partial<ListKeyboardDelegateOptions<Item>>,
  stateProps: Partial<ListStateProps<Item>>,
  fn: (delegate: ListKeyboardDelegate<Item>) => void,
): void {
  createRoot((dispose) => {
    const state = createListState<Item>({
      items,
      getKey: (item) => item.key,
      ...stateProps,
    });
    const delegate = new ListKeyboardDelegate<Item>({
      collection: state.collection(),
      ref: () => null,
      collator,
      ...delegateOptions,
    });
    fn(delegate);
    dispose();
  });
}

describe("ListKeyboardDelegate — vertical stack navigation", () => {
  it("resolves first and last keys", () => {
    withDelegate({}, {}, (delegate) => {
      expect(delegate.getFirstKey()).toBe("a");
      expect(delegate.getLastKey()).toBe("d");
    });
  });

  it("moves below and above in collection order", () => {
    withDelegate({}, {}, (delegate) => {
      expect(delegate.getKeyBelow("a")).toBe("b");
      expect(delegate.getKeyBelow("b")).toBe("c");
      expect(delegate.getKeyAbove("c")).toBe("b");
      expect(delegate.getKeyAbove("b")).toBe("a");
    });
  });

  it("returns null past the ends", () => {
    withDelegate({}, {}, (delegate) => {
      expect(delegate.getKeyBelow("d")).toBeNull();
      expect(delegate.getKeyAbove("a")).toBeNull();
    });
  });

  it("does not expose horizontal navigation for a vertical stack", () => {
    withDelegate({}, {}, (delegate) => {
      // Upstream deletes these so the selectable-collection handler no-ops Left/Right.
      expect(delegate.getKeyLeftOf).toBeUndefined();
      expect(delegate.getKeyRightOf).toBeUndefined();
    });
  });
});

describe("ListKeyboardDelegate — disabled skipping", () => {
  it("skips keys in disabledKeys (disabledBehavior 'all')", () => {
    withDelegate({ disabledKeys: new Set(["b"]) }, {}, (delegate) => {
      expect(delegate.getKeyBelow("a")).toBe("c");
      expect(delegate.getKeyAbove("c")).toBe("a");
    });
  });

  it("skips a disabled last item when resolving getLastKey", () => {
    withDelegate({ disabledKeys: new Set(["d"]) }, {}, (delegate) => {
      expect(delegate.getLastKey()).toBe("c");
    });
  });

  it("does not skip disabled keys when disabledBehavior is 'selection'", () => {
    withDelegate({ disabledKeys: new Set(["b"]), disabledBehavior: "selection" }, {}, (delegate) => {
      // 'selection' means disabled-for-selection only; navigation still lands on it.
      expect(delegate.getKeyBelow("a")).toBe("b");
    });
  });
});

describe("ListKeyboardDelegate — typeahead search", () => {
  it("matches the first item whose text starts with the search string", () => {
    withDelegate({}, {}, (delegate) => {
      expect(delegate.getKeyForSearch("ch")).toBe("c");
      expect(delegate.getKeyForSearch("ba")).toBe("b");
      expect(delegate.getKeyForSearch("a")).toBe("a");
    });
  });

  it("searches from a given key forward", () => {
    withDelegate({}, {}, (delegate) => {
      // From 'b' onward there is no later item starting with 'a'.
      expect(delegate.getKeyForSearch("a", "b")).toBeNull();
    });
  });

  it("returns null without a collator", () => {
    withDelegate({ collator: undefined }, {}, (delegate) => {
      expect(delegate.getKeyForSearch("a")).toBeNull();
    });
  });
});

describe("ListKeyboardDelegate — horizontal orientation", () => {
  it("exposes left/right navigation and walks in collection order (ltr)", () => {
    withDelegate({ orientation: "horizontal", direction: "ltr" }, {}, (delegate) => {
      expect(typeof delegate.getKeyRightOf).toBe("function");
      expect(typeof delegate.getKeyLeftOf).toBe("function");
      expect(delegate.getKeyRightOf!("a")).toBe("b");
      expect(delegate.getKeyLeftOf!("b")).toBe("a");
    });
  });

  it("flips left/right in rtl", () => {
    withDelegate({ orientation: "horizontal", direction: "rtl" }, {}, (delegate) => {
      // In rtl, 'right' moves toward the start of the collection.
      expect(delegate.getKeyRightOf!("b")).toBe("a");
      expect(delegate.getKeyLeftOf!("a")).toBe("b");
    });
  });
});
