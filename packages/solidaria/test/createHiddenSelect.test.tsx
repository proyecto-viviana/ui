/**
 * Tests for createHiddenSelect with form integration.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, cleanup, fireEvent, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createHiddenSelect, HiddenSelect } from "../src/select/createHiddenSelect";
import type { SelectState, Key, Collection, CollectionNode } from "@proyecto-viviana/solid-stately";

afterEach(() => {
  cleanup();
});

// Mock collection for testing
function createMockCollection<T>(
  items: { key: Key; value: T; textValue: string }[],
): Collection<T> {
  const keyMap = new Map<Key, CollectionNode<T>>();
  const nodes: CollectionNode<T>[] = items.map((item, index) => {
    const node: CollectionNode<T> = {
      key: item.key,
      value: item.value,
      type: "item",
      textValue: item.textValue,
      index,
    };
    keyMap.set(item.key, node);
    return node;
  });

  return {
    size: items.length,
    getItem(key: Key) {
      return keyMap.get(key);
    },
    getFirstKey() {
      return items[0]?.key ?? null;
    },
    getLastKey() {
      return items[items.length - 1]?.key ?? null;
    },
    getKeyBefore(key: Key) {
      const index = items.findIndex((item) => item.key === key);
      return index > 0 ? items[index - 1].key : null;
    },
    getKeyAfter(key: Key) {
      const index = items.findIndex((item) => item.key === key);
      return index >= 0 && index < items.length - 1 ? items[index + 1].key : null;
    },
    [Symbol.iterator]() {
      return nodes[Symbol.iterator]();
    },
  };
}

// Mock state for testing
function createMockState<T>({
  items,
  selectedKey: initialSelectedKey = null,
  isDisabled = false,
}: {
  items: { key: Key; value: T; textValue: string }[];
  selectedKey?: Key | null;
  isDisabled?: boolean;
}): SelectState<T> {
  const [selectedKey, setSelectedKey] = createSignal<Key | null>(initialSelectedKey);
  const collection = () => createMockCollection(items);

  return {
    collection,
    isDisabled,
    selectedKey,
    setSelectedKey,
    selectedItem: () => {
      const key = selectedKey();
      return key != null ? collection().getItem(key) : undefined;
    },
    isOpen: () => false,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    setOpen: vi.fn(),
    focusStrategy: () => "first",
    setFocusStrategy: vi.fn(),
    isFocused: () => false,
    setFocused: vi.fn(),
    disabledKeys: () => new Set(),
    isKeyDisabled: () => false,
  };
}

describe("createHiddenSelect", () => {
  const testItems = [
    { key: "cat", value: { id: "cat" }, textValue: "Cat" },
    { key: "dog", value: { id: "dog" }, textValue: "Dog" },
    { key: "bird", value: { id: "bird" }, textValue: "Bird" },
  ];

  describe("basic props", () => {
    it("should return container, select, and input props", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.containerProps).toBeDefined();
      expect(result.selectProps).toBeDefined();
      expect(result.inputProps).toBeDefined();
    });

    it("should set name attribute on select", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.selectProps.name).toBe("pet");
    });

    it("should set disabled attribute when disabled", () => {
      const state = createMockState({ items: testItems, isDisabled: true });
      const result = createHiddenSelect({ state, name: "pet", isDisabled: true });

      expect(result.selectProps.disabled).toBe(true);
    });

    it("should set form attribute", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({ state, name: "pet", form: "my-form" });

      expect(result.selectProps.form).toBe("my-form");
    });

    it("should set tabIndex to -1 for hidden select", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.selectProps.tabIndex).toBe(-1);
    });
  });

  describe("form validation", () => {
    it("should set required attribute when isRequired and validationBehavior is native", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({
        state,
        name: "pet",
        isRequired: true,
        validationBehavior: "native",
      });

      expect(result.selectProps.required).toBe(true);
    });

    it("should not set required attribute when validationBehavior is aria", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({
        state,
        name: "pet",
        isRequired: true,
        validationBehavior: "aria",
      });

      expect(result.selectProps.required).toBe(false);
    });

    it("should not set required attribute when isRequired is false", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({
        state,
        name: "pet",
        isRequired: false,
        validationBehavior: "native",
      });

      expect(result.selectProps.required).toBe(false);
    });
  });

  describe("selected value", () => {
    it("should set value from selected key", () => {
      const state = createMockState({ items: testItems, selectedKey: "dog" });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.selectProps.value).toBe("dog");
    });

    it("should set empty value when no selection", () => {
      const state = createMockState({ items: testItems, selectedKey: null });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.selectProps.value).toBe("");
    });
  });

  describe("form reset", () => {
    it("should reset selection when form is reset", () => {
      const state = createMockState({ items: testItems, selectedKey: "dog" });

      render(() => {
        const { selectProps } = createHiddenSelect({ state, name: "pet" });

        return (
          <form data-testid="form">
            <select {...selectProps}>
              <option value="">Select...</option>
              <option value="cat">Cat</option>
              <option value="dog">Dog</option>
              <option value="bird">Bird</option>
            </select>
          </form>
        );
      });

      // Change selection
      state.setSelectedKey("bird");
      expect(state.selectedKey()).toBe("bird");

      // Reset form
      const form = screen.getByTestId("form") as HTMLFormElement;
      fireEvent.reset(form);

      // Should reset to first key
      expect(state.selectedKey()).toBe("cat");
    });
  });

  describe("input props for form submission", () => {
    it("should set hidden type by default", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.inputProps.type).toBe("hidden");
    });

    it("should use text type with display:none for native validation when required", () => {
      const state = createMockState({ items: testItems });
      const result = createHiddenSelect({
        state,
        name: "pet",
        isRequired: true,
        validationBehavior: "native",
      });

      expect(result.inputProps.type).toBe("text");
      expect(result.inputProps.style).toEqual({ display: "none" });
      expect(result.inputProps.required).toBe(true);
    });

    it("should set value from selected key on input", () => {
      const state = createMockState({ items: testItems, selectedKey: "cat" });
      const result = createHiddenSelect({ state, name: "pet" });

      expect(result.inputProps.value).toBe("cat");
    });
  });
});

describe("HiddenSelect component", () => {
  const testItems = [
    { key: "cat", value: { id: "cat" }, textValue: "Cat" },
    { key: "dog", value: { id: "dog" }, textValue: "Dog" },
    { key: "bird", value: { id: "bird" }, textValue: "Bird" },
  ];

  it("should render a hidden select with options", () => {
    const state = createMockState({ items: testItems, selectedKey: "dog" });

    render(() => <HiddenSelect state={state} label="Pet" name="pet" />);

    const select = document.querySelector("select") as HTMLSelectElement;
    expect(select).toBeDefined();
    expect(select.name).toBe("pet");

    // Options should include empty + 3 items
    expect(select.options.length).toBe(4);
  });

  it("should pass isRequired to hidden select", () => {
    const state = createMockState({ items: testItems });

    render(() => (
      <HiddenSelect
        state={state}
        label="Pet"
        name="pet"
        isRequired={true}
        validationBehavior="native"
      />
    ));

    const select = document.querySelector("select") as HTMLSelectElement;
    expect(select.required).toBe(true);
  });

  it("should be wrapped in aria-hidden container", () => {
    const state = createMockState({ items: testItems });

    render(() => <HiddenSelect state={state} label="Pet" name="pet" />);

    const container = document.querySelector('[aria-hidden="true"]');
    expect(container).toBeDefined();
  });
});
