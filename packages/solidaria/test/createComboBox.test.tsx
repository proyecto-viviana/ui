import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createComboBox } from "../src/combobox";
import { createComboBoxState } from "@proyecto-viviana/solid-stately";
import * as liveAnnouncer from "../src/live-announcer";
import * as platform from "../src/utils/platform";
import * as domUtils from "../src/utils/dom";

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

describe("createComboBox", () => {
  describe("input props", () => {
    it("should provide correct ARIA attributes for input", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(comboBox.inputProps.role).toBe("combobox");
        expect(comboBox.inputProps.type).toBe("text");
        expect(comboBox.inputProps["aria-haspopup"]).toBeUndefined();
        expect(comboBox.inputProps["aria-expanded"]).toBe(false);
        expect(comboBox.inputProps["aria-autocomplete"]).toBe("list");
        expect(comboBox.inputProps.autoComplete).toBe("off");
        dispose();
      });
    });

    it("should update aria-expanded when open", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["aria-expanded"]).toBe(false);

        state.open();
        expect(comboBox.inputProps["aria-expanded"]).toBe(true);

        state.close();
        expect(comboBox.inputProps["aria-expanded"]).toBe(false);
        dispose();
      });
    });

    it("should provide aria-controls when open", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["aria-controls"]).toBeUndefined();

        state.open();
        expect(comboBox.inputProps["aria-controls"]).toBe(comboBox.listBoxProps.id);
        dispose();
      });
    });

    it("should compose aria-describedby from description and invalid error", async () => {
      // RAC `useField.ts:51-60`: ids exist only when the slot is in the DOM
      // (`useSlotId`). A createRoot snapshot without rendering the slots cannot
      // hold describedby.
      function Harness() {
        let inputRef: HTMLInputElement | null = null;
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });
        const comboBox = createComboBox(
          {
            description: "Pick a fruit",
            errorMessage: "Required",
            isInvalid: true,
          },
          state,
          () => inputRef,
        );
        return (
          <div>
            <input {...comboBox.inputProps} ref={(el) => (inputRef = el)} data-testid="input" />
            <span {...comboBox.descriptionProps}>Pick a fruit</span>
            <span {...comboBox.errorMessageProps}>Required</span>
          </div>
        );
      }

      render(() => <Harness />);

      await waitFor(() => {
        const describedBy = screen.getByTestId("input").getAttribute("aria-describedby") ?? "";
        const ids = describedBy.split(" ");
        expect(ids.map((id) => document.getElementById(id)?.textContent).join(" ")).toBe(
          "Pick a fruit Required",
        );
      });
      expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    });

    it("should set aria-disabled when disabled", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isDisabled: true,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["aria-disabled"]).toBe(true);
        expect(comboBox.inputProps.disabled).toBe(true);
        dispose();
      });
    });

    it("should set readOnly when read-only", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isReadOnly: true,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps.readOnly).toBe(true);
        dispose();
      });
    });

    it("should bind input value to state", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps.value).toBe("");

        state.setInputValue("App");
        expect(comboBox.inputProps.value).toBe("App");
        dispose();
      });
    });

    it("should provide aria-activedescendant when focused key exists", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["aria-activedescendant"]).toBeUndefined();

        state.open();
        expect(comboBox.inputProps["aria-activedescendant"]).toBeUndefined();

        state.setFocusedKey("2");
        expect(comboBox.inputProps["aria-activedescendant"]).toBe(
          `${comboBox.listBoxProps.id}-option-2`,
        );
        dispose();
      });
    });
  });

  describe("button props", () => {
    it("should provide correct attributes for button", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.buttonProps.type).toBe("button");
        expect(comboBox.buttonProps.tabIndex).toBe(-1);
        expect(comboBox.buttonProps["aria-haspopup"]).toBe("listbox");
        expect(comboBox.buttonProps["aria-label"]).toBe("Show suggestions");
        dispose();
      });
    });

    it("combobox input does not carry aria-haspopup", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });
        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);
        expect(comboBox.inputProps["aria-haspopup"]).toBeUndefined();
        expect(comboBox.buttonProps["aria-haspopup"]).toBe("listbox");
        dispose();
      });
    });
  });

  describe("listbox props", () => {
    it("should provide correct attributes for listbox", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.listBoxProps.role).toBe("listbox");
        // Upstream names the listbox via useLabels: aria-label "Suggestions"
        // folded with the field label id (props['aria-labelledby'] ||
        // labelProps.id), NOT the input id (useComboBox.ts:326-330). With no
        // field label provided here, labelProps.id is undefined, so the listbox
        // carries only its "Suggestions" self-label.
        expect(comboBox.listBoxProps["aria-label"]).toBe("Suggestions");
        expect(comboBox.listBoxProps["aria-labelledby"]).toBeUndefined();
        // Virtual focus: the popover listbox is never a tab stop, so
        // useComboBox's listBoxProps never set tabIndex — it flows undefined
        // from useSelectableCollection (createComboBox no longer hardcodes -1).
        expect(comboBox.listBoxProps.tabIndex).toBeUndefined();
        dispose();
      });
    });
  });

  describe("label props", () => {
    it("should provide label props", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(comboBox.labelProps.id).toBeDefined();
        expect(comboBox.inputProps.id).toBeDefined();
        dispose();
      });
    });
  });

  describe("state accessors", () => {
    it("should expose isFocused", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.isFocused()).toBe(false);

        state.setFocused(true);
        expect(comboBox.isFocused()).toBe(true);
        dispose();
      });
    });

    it("should expose isOpen", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.isOpen()).toBe(false);

        state.open();
        expect(comboBox.isOpen()).toBe(true);
        dispose();
      });
    });

    it("should expose selectedItem", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          defaultSelectedKey: "2",
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.selectedItem()?.textValue).toBe("Banana");
        dispose();
      });
    });
  });

  describe("data attributes", () => {
    it("should set data-open when open", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["data-open"]).toBeUndefined();

        state.open();
        expect(comboBox.inputProps["data-open"]).toBe(true);
        dispose();
      });
    });

    it("should set data-disabled when disabled", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isDisabled: true,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["data-disabled"]).toBe(true);
        dispose();
      });
    });

    it("should set data-readonly when read-only", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isReadOnly: true,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["data-readonly"]).toBe(true);
        dispose();
      });
    });
  });

  describe("description and error props", () => {
    it("descriptionProps.id is undefined when no description is rendered", async () => {
      let comboBox!: ReturnType<typeof createComboBox>;
      function Harness() {
        let inputRef: HTMLInputElement | null = null;
        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });
        comboBox = createComboBox({}, state, () => inputRef);
        return <input {...comboBox.inputProps} ref={(el) => (inputRef = el)} data-testid="input" />;
      }

      render(() => <Harness />);

      await waitFor(() => {
        expect(comboBox.descriptionProps.id).toBeUndefined();
        expect(comboBox.errorMessageProps.id).toBeUndefined();
        expect(screen.getByTestId("input")).not.toHaveAttribute("aria-describedby");
      });
    });
  });

  describe("placeholder", () => {
    it("should pass placeholder to input props", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox(
          { placeholder: "Select a fruit..." },
          state,
          () => inputRef,
        );

        expect(comboBox.inputProps.placeholder).toBe("Select a fruit...");
        dispose();
      });
    });
  });

  describe("name", () => {
    it("should pass name to input props", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ name: "fruit-select" }, state, () => inputRef);

        expect(comboBox.inputProps.name).toBe("fruit-select");
        dispose();
      });
    });
  });

  describe("autoComplete option", () => {
    it("should default aria-autocomplete to list", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({}, state, () => inputRef);

        expect(comboBox.inputProps["aria-autocomplete"]).toBe("list");
        dispose();
      });
    });

    it("should allow custom aria-autocomplete", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ autoComplete: "both" }, state, () => inputRef);

        expect(comboBox.inputProps["aria-autocomplete"]).toBe("both");
        dispose();
      });
    });
  });

  describe("required", () => {
    it("should set aria-required when required", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ isRequired: true }, state, () => inputRef);

        expect(comboBox.inputProps["aria-required"]).toBe(true);
        dispose();
      });
    });
  });

  describe("accessibility warnings", () => {
    it("should warn when no label is provided in development", () => {
      // Mock console.warn
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        // Create combobox without label, aria-label, or aria-labelledby
        createComboBox({}, state, () => inputRef);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("ComboBox requires a label"));
        dispose();
      });

      warnSpy.mockRestore();
    });

    it("should not warn when aria-label is provided", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        createComboBox({ "aria-label": "Select fruit" }, state, () => inputRef);

        expect(warnSpy).not.toHaveBeenCalled();
        dispose();
      });

      warnSpy.mockRestore();
    });

    it("should not warn when aria-labelledby is provided", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        createComboBox({ "aria-labelledby": "my-label-id" }, state, () => inputRef);

        expect(warnSpy).not.toHaveBeenCalled();
        dispose();
      });

      warnSpy.mockRestore();
    });

    it("should not warn when label prop is provided", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(warnSpy).not.toHaveBeenCalled();
        dispose();
      });

      warnSpy.mockRestore();
    });
  });

  describe("VoiceOver announcements", () => {
    let announceSpy: ReturnType<typeof vi.spyOn>;
    let isAppleDeviceSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      // Mark as test environment
      (globalThis as Record<string, unknown>).IS_SOLIDARIA_TEST = true;

      announceSpy = vi.spyOn(liveAnnouncer, "announce").mockImplementation(() => {});
      isAppleDeviceSpy = vi.spyOn(platform, "isAppleDevice");
    });

    afterEach(() => {
      announceSpy.mockRestore();
      isAppleDeviceSpy.mockRestore();
      delete (globalThis as Record<string, unknown>).IS_SOLIDARIA_TEST;
    });

    it("should not announce on non-Apple devices", () => {
      isAppleDeviceSpy.mockReturnValue(false);

      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        createComboBox({ label: "Fruit" }, state, () => inputRef);

        // Open the combobox and set focused key
        state.open();
        state.setFocusedKey("1");

        // announcements should not happen on non-Apple (checked synchronously)
        expect(announceSpy).not.toHaveBeenCalled();
        dispose();
      });
    });
  });

  describe("blur handling (P1.1)", () => {
    it("should not blur when focus moves to button", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        let buttonRef: HTMLElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox(
          { label: "Fruit" },
          state,
          () => inputRef,
          () => buttonRef,
        );

        // Set initial focused state
        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        // Create a mock button element
        buttonRef = document.createElement("button");

        // Simulate blur with relatedTarget as button
        const onBlur = comboBox.inputProps.onBlur as (e: FocusEvent) => void;
        const blurEvent = new FocusEvent("blur", {
          relatedTarget: buttonRef,
        });

        onBlur(blurEvent);

        // Should still be focused because blur went to button
        expect(state.isFocused()).toBe(true);
        dispose();
      });
    });

    it("should not blur when focus moves into listbox", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        let buttonRef: HTMLElement | null = null;
        let listBoxRef: HTMLElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox(
          { label: "Fruit" },
          state,
          () => inputRef,
          () => buttonRef,
          () => listBoxRef,
        );

        // Set initial focused state
        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        // Create mock listbox with a child option
        listBoxRef = document.createElement("ul");
        const option = document.createElement("li");
        listBoxRef.appendChild(option);

        // Simulate blur with relatedTarget inside listbox
        const onBlur = comboBox.inputProps.onBlur as (e: FocusEvent) => void;
        const blurEvent = new FocusEvent("blur", {
          relatedTarget: option,
        });

        onBlur(blurEvent);

        // Should still be focused because blur went into listbox
        expect(state.isFocused()).toBe(true);
        dispose();
      });
    });

    it("should blur when focus moves outside", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        let buttonRef: HTMLElement | null = null;
        let listBoxRef: HTMLElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox(
          { label: "Fruit" },
          state,
          () => inputRef,
          () => buttonRef,
          () => listBoxRef,
        );

        // Set initial focused state
        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        // Create mock elements
        buttonRef = document.createElement("button");
        listBoxRef = document.createElement("ul");
        const outsideElement = document.createElement("div");

        // Simulate blur with relatedTarget outside
        const onBlur = comboBox.inputProps.onBlur as (e: FocusEvent) => void;
        const blurEvent = new FocusEvent("blur", {
          relatedTarget: outsideElement,
        });

        onBlur(blurEvent);

        // Should be blurred because focus went outside
        expect(state.isFocused()).toBe(false);
        dispose();
      });
    });

    it("should call onBlur callback when blurring outside", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        const onBlurCallback = vi.fn();

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox(
          { label: "Fruit", onBlur: onBlurCallback },
          state,
          () => inputRef,
        );

        state.setFocused(true);

        const outsideElement = document.createElement("div");
        const onBlur = comboBox.inputProps.onBlur as (e: FocusEvent) => void;
        const blurEvent = new FocusEvent("blur", {
          relatedTarget: outsideElement,
        });

        onBlur(blurEvent);

        expect(onBlurCallback).toHaveBeenCalledWith(blurEvent);
        dispose();
      });
    });
  });

  describe("touch event handling for iPad VoiceOver (P1.2)", () => {
    it("should provide onTouchEnd handler in inputProps", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(comboBox.inputProps.onTouchEnd).toBeDefined();
        expect(typeof comboBox.inputProps.onTouchEnd).toBe("function");
        dispose();
      });
    });

    it("should not handle touch when disabled", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isDisabled: true,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        // Initially closed
        expect(state.isOpen()).toBe(false);

        // Create mock element for center-tap simulation
        const mockElement = document.createElement("input");
        mockElement.getBoundingClientRect = () => ({
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          width: 100,
          height: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        // Simulate touch at center
        const onTouchEnd = comboBox.inputProps.onTouchEnd as (e: TouchEvent) => void;
        const touchEvent = {
          target: mockElement,
          timeStamp: 1000,
          changedTouches: [
            {
              clientX: Math.ceil(0 + 0.5 * 100), // centerX
              clientY: Math.ceil(0 + 0.5 * 50), // centerY
            },
          ],
          preventDefault: vi.fn(),
        } as unknown as TouchEvent;

        onTouchEnd(touchEvent);

        // Should not open when disabled
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("should not handle touch when readOnly", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
          isReadOnly: true,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(state.isOpen()).toBe(false);

        const mockElement = document.createElement("input");
        mockElement.getBoundingClientRect = () => ({
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          width: 100,
          height: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        const onTouchEnd = comboBox.inputProps.onTouchEnd as (e: TouchEvent) => void;
        const touchEvent = {
          target: mockElement,
          timeStamp: 1000,
          changedTouches: [
            {
              clientX: Math.ceil(0 + 0.5 * 100),
              clientY: Math.ceil(0 + 0.5 * 50),
            },
          ],
          preventDefault: vi.fn(),
        } as unknown as TouchEvent;

        onTouchEnd(touchEvent);

        // Should not open when readOnly
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("should toggle when touch is at center (VoiceOver virtual click)", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = document.createElement("input");

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        expect(state.isOpen()).toBe(false);

        // Create mock element for center-tap simulation
        const mockElement = document.createElement("input");
        mockElement.getBoundingClientRect = () => ({
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          width: 100,
          height: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        const onTouchEnd = comboBox.inputProps.onTouchEnd as (e: TouchEvent) => void;
        const preventDefault = vi.fn();

        // Touch at exact center (VoiceOver behavior)
        const touchEvent = {
          target: mockElement,
          timeStamp: 1000,
          changedTouches: [
            {
              clientX: Math.ceil(0 + 0.5 * 100), // 50
              clientY: Math.ceil(0 + 0.5 * 50), // 25
            },
          ],
          preventDefault,
        } as unknown as TouchEvent;

        onTouchEnd(touchEvent);

        // Should toggle open and call preventDefault
        expect(state.isOpen()).toBe(true);
        expect(preventDefault).toHaveBeenCalled();
        dispose();
      });
    });

    it("should debounce rapid consecutive touch events", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = document.createElement("input");

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const comboBox = createComboBox({ label: "Fruit" }, state, () => inputRef);

        const mockElement = document.createElement("input");
        mockElement.getBoundingClientRect = () => ({
          left: 0,
          top: 0,
          right: 100,
          bottom: 50,
          width: 100,
          height: 50,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        });

        const onTouchEnd = comboBox.inputProps.onTouchEnd as (e: TouchEvent) => void;

        // First touch at center
        const firstTouchEvent = {
          target: mockElement,
          timeStamp: 1000,
          changedTouches: [
            {
              clientX: Math.ceil(0 + 0.5 * 100),
              clientY: Math.ceil(0 + 0.5 * 50),
            },
          ],
          preventDefault: vi.fn(),
        } as unknown as TouchEvent;

        onTouchEnd(firstTouchEvent);
        expect(state.isOpen()).toBe(true);

        // Second touch within 500ms (should be debounced)
        const secondTouchEvent = {
          target: mockElement,
          timeStamp: 1200, // 200ms later
          changedTouches: [
            {
              clientX: Math.ceil(0 + 0.5 * 100),
              clientY: Math.ceil(0 + 0.5 * 50),
            },
          ],
          preventDefault: vi.fn(),
        } as unknown as TouchEvent;

        onTouchEnd(secondTouchEvent);

        // Should still be open (debounced, not toggled back)
        expect(state.isOpen()).toBe(true);
        expect(secondTouchEvent.preventDefault).toHaveBeenCalled();
        dispose();
      });
    });
  });

  describe("link support in ComboBox items (P1.3)", () => {
    it("should navigate to link on Enter when focused item has href", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        let listBoxRef: HTMLElement | null = null;

        // Items with href property
        const linkItems = [
          { id: "1", name: "Google", href: "https://google.com" },
          { id: "2", name: "GitHub", href: "https://github.com" },
          { id: "3", name: "Regular Item" },
        ];

        const state = createComboBoxState({
          items: linkItems,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        // Mock openLink
        const openLinkSpy = vi.spyOn(domUtils, "openLink").mockImplementation(() => {});

        const comboBox = createComboBox(
          { label: "Sites" },
          state,
          () => inputRef,
          undefined,
          () => listBoxRef,
        );

        // Create mock listbox with anchor element
        listBoxRef = document.createElement("ul");
        const linkOption = document.createElement("a") as HTMLAnchorElement;
        linkOption.setAttribute("data-key", "1");
        linkOption.href = "https://google.com";
        listBoxRef.appendChild(linkOption);

        // Open and focus the link item
        state.open();
        state.setFocusedKey("1");

        // Simulate Enter key
        const onKeyDown = comboBox.inputProps.onKeyDown as (e: KeyboardEvent) => void;
        const enterEvent = {
          key: "Enter",
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;

        onKeyDown(enterEvent);

        // Should call openLink and close the combobox
        expect(openLinkSpy).toHaveBeenCalledWith(linkOption, enterEvent);
        expect(state.isOpen()).toBe(false);

        openLinkSpy.mockRestore();
        dispose();
      });
    });

    it("should commit selection on Enter when focused item has no href", () => {
      createRoot((dispose) => {
        let inputRef: HTMLInputElement | null = null;
        let listBoxRef: HTMLElement | null = null;

        // Regular items without href
        const regularItems = [
          { id: "1", name: "Apple" },
          { id: "2", name: "Banana" },
        ];

        const state = createComboBoxState({
          items: regularItems,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });

        const openLinkSpy = vi.spyOn(domUtils, "openLink").mockImplementation(() => {});

        const comboBox = createComboBox(
          { label: "Fruit" },
          state,
          () => inputRef,
          undefined,
          () => listBoxRef,
        );

        listBoxRef = document.createElement("ul");

        // Open and focus a regular item
        state.open();
        state.setFocusedKey("1");

        const onKeyDown = comboBox.inputProps.onKeyDown as (e: KeyboardEvent) => void;
        const enterEvent = {
          key: "Enter",
          preventDefault: vi.fn(),
        } as unknown as KeyboardEvent;

        onKeyDown(enterEvent);

        // Should NOT call openLink
        expect(openLinkSpy).not.toHaveBeenCalled();
        // Should call state.commit() which selects the focused key
        expect(state.selectedKey()).toBe("1");

        openLinkSpy.mockRestore();
        dispose();
      });
    });
  });

  describe("blur", () => {
    it("does not commit when relatedTarget is a descendant of the trigger button", () => {
      createRoot((dispose) => {
        const button = document.createElement("button");
        const icon = document.createElement("span");
        button.appendChild(icon);
        document.body.appendChild(button);

        const state = createComboBoxState({
          items,
          getKey: (item) => item.id,
          getTextValue: (item) => item.name,
        });
        state.open();
        state.setFocused(true);

        const comboBox = createComboBox(
          {},
          state,
          () => null,
          () => button,
          () => null,
        );

        const onBlur = comboBox.inputProps.onBlur as (e: FocusEvent) => void;
        onBlur({ relatedTarget: icon } as FocusEvent);

        expect(state.isOpen()).toBe(true);
        expect(state.isFocused()).toBe(true);

        button.remove();
        dispose();
      });
    });
  });
});
