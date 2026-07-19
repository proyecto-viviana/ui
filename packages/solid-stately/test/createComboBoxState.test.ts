import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createComboBoxState, defaultContainsFilter } from "../src/combobox";

interface TestItem {
  id: string;
  name: string;
  disabled?: boolean;
}

const items: TestItem[] = [
  { id: "1", name: "Apple" },
  { id: "2", name: "Banana" },
  { id: "3", name: "Cherry" },
  { id: "4", name: "Date" },
  { id: "5", name: "Elderberry" },
];

describe("createComboBoxState", () => {
  describe("initial state", () => {
    it("should create state with default values", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        expect(state.isOpen()).toBe(false);
        expect(state.selectedKey()).toBe(null);
        expect(state.inputValue()).toBe("");
        expect(state.isFocused()).toBe(false);
        expect(state.collection().size).toBe(5);
        dispose();
      });
    });

    it("should respect defaultSelectedKey", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultSelectedKey: "2",
        });

        expect(state.selectedKey()).toBe("2");
        expect(state.selectedItem()?.textValue).toBe("Banana");
        dispose();
      });
    });

    it("should respect defaultInputValue", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultInputValue: "App",
        });

        expect(state.inputValue()).toBe("App");
        dispose();
      });
    });

    it("derives the input display from an item's name when no getTextValue is given", () => {
      // Regression: with items shaped `{ id, name }` and no getTextValue, the
      // collection's textValue fell through to `String(item)` → "[object Object]",
      // which surfaced verbatim in the input for a defaultSelectedKey.
      createRoot((dispose) => {
        const state = createComboBoxState<TestItem>({
          items,
          defaultSelectedKey: "2",
        });

        expect(state.selectedItem()?.textValue).toBe("Banana");
        expect(state.inputValue()).toBe("Banana");
        expect(state.inputValue()).not.toContain("[object Object]");
        dispose();
      });
    });

    it("never falls back to [object Object] for an object item with no text field", () => {
      createRoot((dispose) => {
        const state = createComboBoxState<{ id: string }>({
          items: [{ id: "alpha" }, { id: "beta" }],
          defaultSelectedKey: "beta",
        });

        // No recognizable text field → fall back to the key, not "[object Object]".
        expect(state.selectedItem()?.textValue).toBe("beta");
        expect(state.inputValue()).toBe("beta");
        dispose();
      });
    });

    it("should respect defaultOpen", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultOpen: true,
          allowsEmptyCollection: true,
        });

        expect(state.isOpen()).toBe(true);
        dispose();
      });
    });
  });

  describe("selection", () => {
    it("should update selectedKey when calling setSelectedKey", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        state.setSelectedKey("3");
        expect(state.selectedKey()).toBe("3");
        expect(state.selectedItem()?.textValue).toBe("Cherry");
        dispose();
      });
    });

    it("should call onSelectionChange callback", () => {
      createRoot((dispose) => {
        const onSelectionChange = vi.fn();
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          onSelectionChange,
        });

        state.setSelectedKey("4");
        expect(onSelectionChange).toHaveBeenCalledWith("4");
        dispose();
      });
    });

    it("should work with controlled selectedKey", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          selectedKey: "1",
        });

        expect(state.selectedKey()).toBe("1");

        // Calling setSelectedKey won't change the value in controlled mode
        // It just triggers the callback
        state.setSelectedKey("2");
        expect(state.selectedKey()).toBe("1"); // Still controlled value
        dispose();
      });
    });
  });

  describe("input value", () => {
    it("should update inputValue when calling setInputValue", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        state.setInputValue("test");
        expect(state.inputValue()).toBe("test");
        dispose();
      });
    });

    it("should call onInputChange callback", () => {
      createRoot((dispose) => {
        const onInputChange = vi.fn();
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          onInputChange,
        });

        state.setInputValue("hello");
        expect(onInputChange).toHaveBeenCalledWith("hello");
        dispose();
      });
    });

    it("should work with controlled inputValue", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          inputValue: "controlled",
        });

        expect(state.inputValue()).toBe("controlled");

        state.setInputValue("new value");
        expect(state.inputValue()).toBe("controlled"); // Still controlled value
        dispose();
      });
    });

    it("preserves typed input while a selection is active (does not clobber keystrokes)", () => {
      // Regression: the selection→input sync effect used to compare
      // `textValue !== inputValue()`, reading inputValue() reactively. In Solid
      // that subscribed the effect to the input signal, so every keystroke
      // re-ran it and reset the field back to the selected item's text — the
      // input was impossible to type in or delete from while anything was
      // selected. Editing must now stick; only a real selection change resyncs.
      //
      // The state is hoisted out of the createRoot callback on purpose: writes
      // made *inside* that callback are batched and their effects don't flush
      // until it returns, so the clobber would never run there. Mutating from
      // top level flushes each effect synchronously — the way the live input does.
      const [state, dispose] = createRoot((d) => {
        const s = createComboBoxState<TestItem>({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultSelectedKey: "2", // "Banana" is selected; input starts as "Banana"
        });
        return [s, d] as const;
      });

      expect(state.inputValue()).toBe("Banana");
      expect(state.selectedKey()).toBe("2");

      // Delete a character — must NOT snap back to "Banana".
      state.setInputValue("Banan");
      expect(state.inputValue()).toBe("Banan");
      expect(state.selectedKey()).toBe("2"); // selection is retained while editing

      // Type a fresh query — still sticks.
      state.setInputValue("Cher");
      expect(state.inputValue()).toBe("Cher");

      dispose();
    });

    it("still syncs the input when the selection genuinely changes", () => {
      // The flip side of the fix: an actual selection change must still update
      // the visible input text (untracking inputValue() must not disable this).
      const [state, dispose] = createRoot((d) => {
        const s = createComboBoxState<TestItem>({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultSelectedKey: "2",
        });
        return [s, d] as const;
      });

      expect(state.inputValue()).toBe("Banana");

      state.setSelectedKey("3");
      expect(state.selectedKey()).toBe("3");
      expect(state.inputValue()).toBe("Cherry");
      dispose();
    });
  });

  describe("filtering", () => {
    it("should filter collection based on input value", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultFilter: defaultContainsFilter,
        });

        // Initial: all items
        expect(state.collection().size).toBe(5);

        // Filter to 'a' matches Apple, Banana, Date (Elderberry has no 'a')
        state.setInputValue("a");
        expect(state.collection().size).toBe(3);

        // Filter to 'app' matches only Apple
        state.setInputValue("app");
        expect(state.collection().size).toBe(1);

        // Clear filter
        state.setInputValue("");
        expect(state.collection().size).toBe(5);
        dispose();
      });
    });

    it("should use custom filter function", () => {
      createRoot((dispose) => {
        // Starts-with filter
        const startsWithFilter = (textValue: string, inputValue: string) =>
          textValue.toLowerCase().startsWith(inputValue.toLowerCase());

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultFilter: startsWithFilter,
        });

        state.setInputValue("b");
        expect(state.collection().size).toBe(1); // Only Banana
        dispose();
      });
    });
  });

  describe("open/close", () => {
    it("should open and close menu", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        expect(state.isOpen()).toBe(false);
        state.open();
        expect(state.isOpen()).toBe(true);
        state.close();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("should toggle menu", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        state.toggle();
        expect(state.isOpen()).toBe(true);
        state.toggle();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("should not open when collection is empty and allowsEmptyCollection is false", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultFilter: defaultContainsFilter,
          allowsEmptyCollection: false,
        });

        // Filter to something that matches nothing
        state.setInputValue("xyz");
        expect(state.collection().size).toBe(0);

        state.open();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("should call onOpenChange callback", () => {
      createRoot((dispose) => {
        const onOpenChange = vi.fn();
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          onOpenChange,
        });

        state.open(null, "manual");
        expect(onOpenChange).toHaveBeenCalledWith(true, "manual");

        state.close();
        expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
        dispose();
      });
    });
  });

  describe("commit and revert", () => {
    it("should commit the focused key", () => {
      createRoot((dispose) => {
        const onSelectionChange = vi.fn();
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          onSelectionChange,
        });

        state.open();
        state.setFocusedKey("3");
        state.commit();

        expect(onSelectionChange).toHaveBeenCalledWith("3");
        dispose();
      });
    });

    it("should revert input to selected item text", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultSelectedKey: "2",
        });

        // Input should be set to selected item's text
        expect(state.inputValue()).toBe("Banana");

        // Change input
        state.setInputValue("test");
        expect(state.inputValue()).toBe("test");

        // Revert should restore to Banana
        state.revert();
        expect(state.inputValue()).toBe("Banana");
        dispose();
      });
    });
  });

  describe("focus handling", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        expect(state.isFocused()).toBe(false);
        state.setFocused(true);
        expect(state.isFocused()).toBe(true);
        state.setFocused(false);
        expect(state.isFocused()).toBe(false);
        dispose();
      });
    });

    it("should open on focus when menuTrigger is focus", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          menuTrigger: "focus",
        });

        state.setFocused(true);
        expect(state.isOpen()).toBe(true);
        dispose();
      });
    });

    it("should not open on focus when menuTrigger is manual", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          menuTrigger: "manual",
        });

        state.setFocused(true);
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });
  });

  describe("disabled state", () => {
    it("should respect isDisabled prop", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isDisabled: true,
        });

        expect(state.isDisabled).toBe(true);
        dispose();
      });
    });

    it("should respect isReadOnly prop", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isReadOnly: true,
        });

        expect(state.isReadOnly).toBe(true);
        dispose();
      });
    });

    it("should identify disabled keys", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          disabledKeys: ["2", "4"],
        });

        expect(state.isKeyDisabled("1")).toBe(false);
        expect(state.isKeyDisabled("2")).toBe(true);
        expect(state.isKeyDisabled("3")).toBe(false);
        expect(state.isKeyDisabled("4")).toBe(true);
        dispose();
      });
    });
  });

  describe("allowsCustomValue", () => {
    it("should allow custom value when allowsCustomValue is true", () => {
      createRoot((dispose) => {
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          allowsCustomValue: true,
        });

        state.setInputValue("Custom Value");
        state.commit();

        // With allowsCustomValue, the custom input is kept and selection is cleared
        expect(state.inputValue()).toBe("Custom Value");
        expect(state.selectedKey()).toBe(null);
        dispose();
      });
    });
  });
});

describe("defaultContainsFilter", () => {
  it("should be case-insensitive", () => {
    expect(defaultContainsFilter("Apple", "app")).toBe(true);
    expect(defaultContainsFilter("Apple", "APP")).toBe(true);
    expect(defaultContainsFilter("apple", "APP")).toBe(true);
  });

  it("should match substring anywhere", () => {
    expect(defaultContainsFilter("Apple", "ppl")).toBe(true);
    expect(defaultContainsFilter("Apple", "le")).toBe(true);
    expect(defaultContainsFilter("Apple", "A")).toBe(true);
  });

  it("should not match non-matching strings", () => {
    expect(defaultContainsFilter("Apple", "xyz")).toBe(false);
    expect(defaultContainsFilter("Apple", "ban")).toBe(false);
  });
});
