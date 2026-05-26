/**
 * Tests for createSelect and createHiddenSelect.
 */

import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { render, fireEvent } from "@solidjs/testing-library";
import { createSelect, createHiddenSelect, HiddenSelect } from "../src/select";
import { createSelectState } from "@proyecto-viviana/solid-stately";

describe("createSelect", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  const createTestState = (overrides = {}) => {
    return createSelectState({
      items,
      getKey: (item) => item.key,
      getTextValue: (item) => item.label,
      ...overrides,
    });
  };

  describe("triggerProps", () => {
    it("does not force an explicit ARIA role on the native button trigger", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { triggerProps } = createSelect({}, state);

        expect(triggerProps.role).toBeUndefined();
        dispose();
      });
    });

    it('returns aria-haspopup="listbox"', () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { triggerProps } = createSelect({}, state);

        expect(triggerProps["aria-haspopup"]).toBe("listbox");
        dispose();
      });
    });

    it("sets aria-expanded based on isOpen state", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { triggerProps } = createSelect({}, state);

        expect(triggerProps["aria-expanded"]).toBe(false);

        state.open();
        const afterOpen = createSelect({}, state).triggerProps;
        expect(afterOpen["aria-expanded"]).toBe(true);
        dispose();
      });
    });

    it("sets aria-controls when open", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { triggerProps } = createSelect({ id: "test" }, state);

        expect(triggerProps["aria-controls"]).toBeUndefined();

        state.open();
        const afterOpen = createSelect({ id: "test" }, state).triggerProps;
        expect(afterOpen["aria-controls"]).toBeDefined();
        dispose();
      });
    });

    it("sets aria-disabled when disabled", () => {
      createRoot((dispose) => {
        const state = createTestState({ isDisabled: true });
        const { triggerProps } = createSelect({ isDisabled: true }, state);

        expect(triggerProps["aria-disabled"]).toBe(true);
        dispose();
      });
    });

    it("sets aria-required when required", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { triggerProps } = createSelect({ isRequired: true }, state);

        expect(triggerProps["aria-required"]).toBe(true);
        dispose();
      });
    });

    it("sets data-open when open", () => {
      createRoot((dispose) => {
        const state = createTestState({ defaultOpen: true });
        const { triggerProps } = createSelect({}, state);

        expect(triggerProps["data-open"]).toBe(true);
        dispose();
      });
    });
  });

  describe("menuProps", () => {
    it('returns role="listbox"', () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { menuProps } = createSelect({}, state);

        expect(menuProps.role).toBe("listbox");
        dispose();
      });
    });

    it("sets tabIndex to -1", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { menuProps } = createSelect({}, state);

        expect(menuProps.tabIndex).toBe(-1);
        dispose();
      });
    });

    it("sets aria-multiselectable in multiple selection mode", () => {
      createRoot((dispose) => {
        const state = createTestState({ selectionMode: "multiple" });
        const { menuProps } = createSelect({}, state);

        expect(menuProps["aria-multiselectable"]).toBe(true);
        dispose();
      });
    });
  });

  describe("labelProps", () => {
    it("returns labelProps for associated label", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { labelProps } = createSelect({ label: "Test Label" }, state);

        expect(labelProps).toBeDefined();
        dispose();
      });
    });
  });

  describe("isOpen accessor", () => {
    it("reflects state.isOpen", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { isOpen } = createSelect({}, state);

        expect(isOpen()).toBe(false);

        state.open();
        expect(isOpen()).toBe(true);

        state.close();
        expect(isOpen()).toBe(false);
        dispose();
      });
    });
  });

  describe("selectedItem accessor", () => {
    it("returns null when no selection", () => {
      createRoot((dispose) => {
        const state = createTestState();
        const { selectedItem } = createSelect({}, state);

        expect(selectedItem()).toBeNull();
        dispose();
      });
    });

    it("returns the selected item when one is selected", () => {
      createRoot((dispose) => {
        const state = createTestState({ defaultSelectedKey: "b" });
        const { selectedItem } = createSelect({}, state);

        expect(selectedItem()?.value).toEqual({ key: "b", label: "Banana" });
        dispose();
      });
    });
  });

  describe("keyboard navigation", () => {
    it("opens on Enter key", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState();
        const { triggerProps, isOpen } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {isOpen() ? "Open" : "Closed"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Closed");

      fireEvent.keyDown(trigger, { key: "Enter" });
      expect(trigger.textContent).toBe("Open");

      unmount();
    });

    it("opens on Space key", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState();
        const { triggerProps, isOpen } = createSelect({}, state);

        return <button {...triggerProps}>{isOpen() ? "Open" : "Closed"}</button>;
      });

      const trigger = getByRole("button");
      fireEvent.keyDown(trigger, { key: " " });
      expect(trigger.textContent).toBe("Open");

      unmount();
    });

    it("opens on ArrowDown key", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState();
        const { triggerProps, isOpen } = createSelect({}, state);

        return <button {...triggerProps}>{isOpen() ? "Open" : "Closed"}</button>;
      });

      const trigger = getByRole("button");
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(trigger.textContent).toBe("Open");

      unmount();
    });

    it("closes on Escape key", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({ defaultOpen: true });
        const { triggerProps, isOpen } = createSelect({}, state);

        return <button {...triggerProps}>{isOpen() ? "Open" : "Closed"}</button>;
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Open");

      fireEvent.keyDown(trigger, { key: "Escape" });
      expect(trigger.textContent).toBe("Closed");

      unmount();
    });

    it("selects next option on ArrowRight when closed", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({ defaultSelectedKey: "a" });
        const { triggerProps, selectedItem } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Apple");

      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      expect(trigger.textContent).toBe("Banana");

      unmount();
    });

    it("selects previous option on ArrowLeft when closed", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({ defaultSelectedKey: "c" });
        const { triggerProps, selectedItem } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Cherry");

      fireEvent.keyDown(trigger, { key: "ArrowLeft" });
      expect(trigger.textContent).toBe("Banana");

      unmount();
    });

    it("selects first option on Home when closed", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({ defaultSelectedKey: "c" });
        const { triggerProps, selectedItem } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Cherry");

      fireEvent.keyDown(trigger, { key: "Home" });
      expect(trigger.textContent).toBe("Apple");

      unmount();
    });

    it("selects last option on End when closed", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({ defaultSelectedKey: "a" });
        const { triggerProps, selectedItem } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Apple");

      fireEvent.keyDown(trigger, { key: "End" });
      expect(trigger.textContent).toBe("Cherry");

      unmount();
    });

    it("skips disabled items when navigating with ArrowRight", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({
          defaultSelectedKey: "a",
          disabledKeys: ["b"],
        });
        const { triggerProps, selectedItem } = createSelect({}, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      expect(trigger.textContent).toBe("Apple");

      // ArrowRight should skip 'b' (Banana is disabled) and go to 'c'
      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      expect(trigger.textContent).toBe("Cherry");

      unmount();
    });

    it("skips disabled first item on ArrowRight when no item is selected", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({
          disabledKeys: ["a"],
        });
        const { triggerProps, selectedItem } = createSelect({ "aria-label": "Select" }, state);

        return <button {...triggerProps}>{selectedItem()?.value?.label || "None"}</button>;
      });

      const trigger = getByRole("button");
      fireEvent.keyDown(trigger, { key: "ArrowRight" });
      expect(trigger.textContent).toBe("Banana");

      unmount();
    });

    it("focuses first enabled item when opening with ArrowDown", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState({
          disabledKeys: ["a"],
        });
        const { triggerProps, isOpen } = createSelect({ "aria-label": "Select" }, state);

        return (
          <button {...triggerProps}>{isOpen() ? `open:${state.focusedKey()}` : "closed"}</button>
        );
      });

      const trigger = getByRole("button");
      fireEvent.keyDown(trigger, { key: "ArrowDown" });
      expect(trigger.textContent).toBe("open:b");

      unmount();
    });

    it("does not type-select when disabled", () => {
      const { getByRole, unmount } = render(() => {
        const state = createTestState();
        const { triggerProps, selectedItem } = createSelect({ isDisabled: true }, state);

        return (
          <button {...triggerProps} data-testid="trigger">
            {selectedItem()?.value?.label || "None"}
          </button>
        );
      });

      const trigger = getByRole("button");
      fireEvent.keyDown(trigger, { key: "c" });
      expect(trigger.textContent).toBe("None");

      unmount();
    });
  });

  describe("focus handling", () => {
    it("tracks focus state", () => {
      const onFocusChange = vi.fn();

      const { getByRole, unmount } = render(() => {
        const state = createTestState();
        const { triggerProps } = createSelect({ onFocusChange }, state);

        return <button {...triggerProps}>Trigger</button>;
      });

      const trigger = getByRole("button");

      fireEvent.focus(trigger);
      expect(onFocusChange).toHaveBeenCalledWith(true);

      fireEvent.blur(trigger);
      expect(onFocusChange).toHaveBeenCalledWith(false);

      unmount();
    });
  });
});

describe("createHiddenSelect", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  it("returns containerProps with aria-hidden", () => {
    createRoot((dispose) => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
      });

      const { containerProps } = createHiddenSelect({ state });

      expect(containerProps["aria-hidden"]).toBe(true);
      dispose();
    });
  });

  it("returns selectProps with name attribute", () => {
    createRoot((dispose) => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
      });

      const { selectProps } = createHiddenSelect({ state, name: "fruit" });

      expect(selectProps.name).toBe("fruit");
      dispose();
    });
  });

  it("returns selectProps with tabIndex -1", () => {
    createRoot((dispose) => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
      });

      const { selectProps } = createHiddenSelect({ state });

      expect(selectProps.tabIndex).toBe(-1);
      dispose();
    });
  });

  it("returns inputProps for form submission", () => {
    createRoot((dispose) => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
        defaultSelectedKey: "b",
      });

      const { inputProps } = createHiddenSelect({ state, name: "fruit" });

      expect(inputProps.type).toBe("hidden");
      expect(inputProps.name).toBe("fruit");
      expect(inputProps.value).toBe("b");
      dispose();
    });
  });

  it("reflects selected value in selectProps", () => {
    createRoot((dispose) => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
        defaultSelectedKey: "c",
      });

      const { selectProps } = createHiddenSelect({ state });

      expect(selectProps.value).toBe("c");
      dispose();
    });
  });
});

describe("HiddenSelect component", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  it("renders a hidden select element", () => {
    const { container, unmount } = render(() => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
        getTextValue: (item) => item.label,
      });

      return <HiddenSelect state={state} name="fruit" />;
    });

    const select = container.querySelector("select");
    expect(select).toBeTruthy();
    expect(select?.getAttribute("name")).toBe("fruit");

    unmount();
  });

  it("renders options for each item", () => {
    const { container, unmount } = render(() => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
        getTextValue: (item) => item.label,
      });

      return <HiddenSelect state={state} />;
    });

    const options = container.querySelectorAll("option");
    // +1 for the empty placeholder option
    expect(options.length).toBe(4);

    unmount();
  });

  it("has aria-hidden on container", () => {
    const { container, unmount } = render(() => {
      const state = createSelectState({
        items,
        getKey: (item) => item.key,
      });

      return <HiddenSelect state={state} />;
    });

    const div = container.querySelector('[aria-hidden="true"]');
    expect(div).toBeTruthy();

    unmount();
  });
});
