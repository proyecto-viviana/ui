/**
 * Tests for createNumberField hook.
 * Based on @react-aria/numberfield useNumberField tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createNumberField } from "../src/numberfield/createNumberField";
import { createNumberFieldState } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "../src/i18n";
import { Show } from "solid-js";

// Test component that uses createNumberField
function TestNumberField(props: {
  defaultValue?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  formatOptions?: Intl.NumberFormatOptions;
  onChange?: (value: number) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  validationBehavior?: "aria" | "native";
  commitBehavior?: "snap" | "validate";
  "aria-label"?: string;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  name?: string;
  form?: string;
  autoFocus?: boolean;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  onPaste?: (e: ClipboardEvent) => void;
  onCopy?: (e: ClipboardEvent) => void;
  onCut?: (e: ClipboardEvent) => void;
}) {
  let inputRef: HTMLInputElement | undefined;

  const state = createNumberFieldState({
    defaultValue: props.defaultValue,
    value: props.value,
    minValue: props.minValue,
    maxValue: props.maxValue,
    step: props.step ?? 1,
    formatOptions: props.formatOptions,
    onChange: props.onChange,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isInvalid: props.isInvalid,
    validationBehavior: props.validationBehavior,
    commitBehavior: props.commitBehavior,
    name: props.name,
  });

  // JSX has to read these getters. Destructuring once freezes `value`.
  const field = createNumberField(
    () => ({
      "aria-label": props["aria-label"],
      decrementAriaLabel: props.decrementAriaLabel,
      incrementAriaLabel: props.incrementAriaLabel,
      label: props.label,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      isInvalid: props.isInvalid,
      validationBehavior: props.validationBehavior,
      commitBehavior: props.commitBehavior,
      formatOptions: props.formatOptions,
      description: props.description,
      errorMessage: props.errorMessage,
      name: props.name,
      form: props.form,
      autoFocus: props.autoFocus,
      onFocus: props.onFocus as any,
      onBlur: props.onBlur as any,
      onFocusChange: props.onFocusChange,
      onKeyDown: props.onKeyDown as any,
      onKeyUp: props.onKeyUp as any,
      onPaste: props.onPaste as any,
      onCopy: props.onCopy as any,
      onCut: props.onCut as any,
    }),
    state,
    () => inputRef ?? null,
  );

  return (
    <div {...field.groupProps} data-testid="group">
      <Show when={props.label}>
        <label {...field.labelProps}>{props.label}</label>
      </Show>
      <button {...field.decrementButtonProps} data-testid="decrement">
        -
      </button>
      <input {...field.inputProps} ref={(el) => (inputRef = el)} data-testid="input" />
      <button {...field.incrementButtonProps} data-testid="increment">
        +
      </button>
      <Show when={props.description}>
        <div {...field.descriptionProps} data-testid="description">
          {props.description}
        </div>
      </Show>
      <Show when={props.isInvalid && props.errorMessage}>
        <div {...field.errorMessageProps} data-testid="error">
          {props.errorMessage}
        </div>
      </Show>
    </div>
  );
}

describe("createNumberField", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("renders properly", () => {
    it("renders the input as a textbox inside a group", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      // Upstream useNumberField overrides the spinbutton role for VoiceOver: the
      // input is a textbox, the field wrapper carries role=group.
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
      expect(screen.getByRole("group")).toContainElement(input);
    });

    it("renders with default value", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={50} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("50");
    });

    it("renders increment and decrement buttons", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const increment = screen.getByTestId("increment");
      const decrement = screen.getByTestId("decrement");

      expect(increment).toBeInTheDocument();
      expect(decrement).toBeInTheDocument();
      expect(increment).toHaveAttribute("type", "button");
      expect(decrement).toHaveAttribute("type", "button");
    });

    it("renders with label", () => {
      render(() => <TestNumberField label="Quantity" />);

      expect(screen.getByText("Quantity")).toBeInTheDocument();
      const input = screen.getByRole("textbox");
      expect(input).toHaveAccessibleName("Quantity");
    });

    it("supports aria-label", () => {
      render(() => <TestNumberField aria-label="Custom amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Custom amount");
    });

    it("supports description", () => {
      render(() => (
        <TestNumberField aria-label="Amount" description="Enter a value between 1 and 100" />
      ));

      const description = screen.getByTestId("description");
      expect(description).toHaveTextContent("Enter a value between 1 and 100");

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-describedby", expect.stringContaining(description.id));
    });

    it("supports error message when invalid", () => {
      render(() => (
        <TestNumberField aria-label="Amount" isInvalid errorMessage="Value is out of range" />
      ));

      const error = screen.getByTestId("error");
      expect(error).toHaveTextContent("Value is out of range");

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", expect.stringContaining(error.id));
    });
  });

  describe("ARIA attributes", () => {
    it("reflects the value via the input value, not aria-valuenow", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={25} />);

      // Upstream drops aria-value* with the spinbutton role; the value is
      // announced through the textbox's own value instead.
      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("25");
      expect(input).not.toHaveAttribute("aria-valuenow");
    });

    it("does not expose aria-valuemin/max on the textbox", () => {
      render(() => <TestNumberField aria-label="Amount" minValue={0} maxValue={100} />);

      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-valuemin");
      expect(input).not.toHaveAttribute("aria-valuemax");
    });

    it("exposes aria-roledescription in place of the spinbutton role", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      // Upstream's stringFormatter.format('numberField') en-US value is the
      // capitalised "Number field" (react-aria i18n/en-US) — byte-match it.
      expect(input).toHaveAttribute("aria-roledescription", "Number field");
    });

    it("omits aria-required when required and validation is native", () => {
      render(() => <TestNumberField aria-label="Amount" isRequired />);

      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("sets aria-required when required and validation is aria", () => {
      render(() => <TestNumberField aria-label="Amount" isRequired validationBehavior="aria" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
      // jest-dom toBeRequired() is true when aria-required="true"; native required is the sibling omit.
      expect(input).not.toHaveAttribute("required");
    });

    it("has aria-invalid when invalid", () => {
      render(() => <TestNumberField aria-label="Amount" isInvalid />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("sets aria-invalid on the group when invalid", () => {
      render(() => <TestNumberField aria-label="Amount" isInvalid />);

      const group = screen.getByTestId("group");
      expect(group).toHaveAttribute("aria-invalid", "true");
    });

    it("increment button has aria-label", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const increment = screen.getByTestId("increment");
      expect(increment).toHaveAttribute("aria-label", "Increase Amount");
    });

    it("decrement button has aria-label", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const decrement = screen.getByTestId("decrement");
      expect(decrement).toHaveAttribute("aria-label", "Decrease Amount");
    });

    it("buttons reference input via aria-controls", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      const increment = screen.getByTestId("increment");
      const decrement = screen.getByTestId("decrement");

      expect(increment).toHaveAttribute("aria-controls", input.id);
      expect(decrement).toHaveAttribute("aria-controls", input.id);
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowUp increments value", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(onChange).toHaveBeenCalledWith(11);
    });

    it("ArrowDown decrements value", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} />);

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(onChange).toHaveBeenCalledWith(9);
    });

    it("Home key sets to minimum value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={50}
          minValue={0}
          maxValue={100}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "Home" });

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it("End key sets to maximum value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={50}
          minValue={0}
          maxValue={100}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "End" });

      expect(onChange).toHaveBeenCalledWith(100);
    });

    it("PageUp increments by one step", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={50}
          minValue={0}
          maxValue={100}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "PageUp" });

      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("PageDown decrements by one step", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={50}
          minValue={0}
          maxValue={100}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "PageDown" });

      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("does not respond to keyboard when disabled", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} isDisabled />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("does not respond to keyboard when read-only", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} isReadOnly />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("button interactions", () => {
    it("clicking increment button increases value", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} />);

      const increment = screen.getByTestId("increment");
      fireEvent.click(increment);

      expect(onChange).toHaveBeenCalledWith(11);
    });

    it("clicking decrement button decreases value", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={10} onChange={onChange} />);

      const decrement = screen.getByTestId("decrement");
      fireEvent.click(decrement);

      expect(onChange).toHaveBeenCalledWith(9);
    });

    it("increment button is disabled at max value", () => {
      render(() => (
        <TestNumberField aria-label="Amount" defaultValue={100} minValue={0} maxValue={100} />
      ));

      const increment = screen.getByTestId("increment");
      expect(increment).toBeDisabled();
    });

    it("decrement button is disabled at min value", () => {
      render(() => (
        <TestNumberField aria-label="Amount" defaultValue={0} minValue={0} maxValue={100} />
      ));

      const decrement = screen.getByTestId("decrement");
      expect(decrement).toBeDisabled();
    });

    it("buttons are disabled when field is disabled", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={50} isDisabled />);

      const increment = screen.getByTestId("increment");
      const decrement = screen.getByTestId("decrement");

      expect(increment).toBeDisabled();
      expect(decrement).toBeDisabled();
    });

    it("buttons have tabIndex -1", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const increment = screen.getByTestId("increment");
      const decrement = screen.getByTestId("decrement");

      expect(increment).toHaveAttribute("tabindex", "-1");
      expect(decrement).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("value constraints", () => {
    it("respects step value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField aria-label="Amount" defaultValue={10} step={5} onChange={onChange} />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(onChange).toHaveBeenCalledWith(15);
    });

    it("clamps to minimum value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={5}
          minValue={0}
          step={10}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowDown" });

      expect(onChange).toHaveBeenCalledWith(0);
    });

    it("clamps to maximum value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={95}
          maxValue={100}
          step={10}
          onChange={onChange}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.keyDown(input, { key: "ArrowUp" });

      expect(onChange).toHaveBeenCalledWith(100);
    });
  });

  describe("input handling", () => {
    it("has text input type", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("type", "text");
    });

    it("uses numeric inputmode on desktop", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("inputmode", "numeric");
    });

    it("disables autocomplete", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("autocomplete", "off");
    });

    it("keeps name off the formatted field", () => {
      render(() => <TestNumberField aria-label="Amount" name="quantity" />);

      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("name");
    });

    it("keeps form off the formatted field", () => {
      render(() => <TestNumberField aria-label="Amount" name="quantity" form="checkout-form" />);

      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("form");
    });

    it("forwards focus and keyboard handlers", () => {
      const onFocus = vi.fn();
      const onBlur = vi.fn();
      const onFocusChange = vi.fn();
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          onFocus={onFocus}
          onBlur={onBlur}
          onFocusChange={onFocusChange}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
      ));

      const input = screen.getByRole("textbox");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "A" });
      fireEvent.keyUp(input, { key: "A" });
      fireEvent.blur(input);

      expect(onFocus).toHaveBeenCalled();
      expect(onBlur).toHaveBeenCalled();
      expect(onFocusChange).toHaveBeenCalledWith(true);
      expect(onFocusChange).toHaveBeenCalledWith(false);
      expect(onKeyDown).toHaveBeenCalled();
      expect(onKeyUp).toHaveBeenCalled();
    });

    // useFormattedTextField preventDefault's a beforeinput whose next value
    // fails validate, so the character never enters the field or the undo stack.
    // Undo, redo, and Enter are allowed through. A composition that ends invalid
    // is restored to the value from compositionstart.
    function beforeInput(el: HTMLInputElement, inputType: string, data: string | null = null) {
      const event = new InputEvent("beforeinput", {
        inputType,
        data,
        bubbles: true,
        cancelable: true,
      });
      el.dispatchEvent(event);
      return event;
    }

    it("rejects an invalid character on beforeinput", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={12} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.setSelectionRange(input.value.length, input.value.length);
      const rejected = beforeInput(input, "insertText", "a");

      expect(rejected.defaultPrevented).toBe(true);
      expect(input).toHaveValue("12");
    });

    it("lets a valid digit through beforeinput", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={12} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.setSelectionRange(input.value.length, input.value.length);
      const allowed = beforeInput(input, "insertText", "3");

      expect(allowed.defaultPrevented).toBe(false);
    });

    it("allows undo, redo, and enter on beforeinput", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={12} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      for (const inputType of ["historyUndo", "historyRedo", "insertLineBreak"]) {
        const event = beforeInput(input, inputType);
        expect(event.defaultPrevented).toBe(false);
      }
    });

    it("restores the field when a composition ends on an invalid value", () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={12} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      fireEvent.compositionStart(input);
      input.value = "12x";
      fireEvent.compositionEnd(input);

      expect(input).toHaveValue("12");
    });
  });

  describe("disabled state", () => {
    it("input is disabled when isDisabled is true", () => {
      render(() => <TestNumberField aria-label="Amount" isDisabled />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("group has aria-disabled when field is disabled", () => {
      render(() => <TestNumberField aria-label="Amount" isDisabled />);

      const group = screen.getByTestId("group");
      expect(group).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("read-only state", () => {
    it("input is read-only when isReadOnly is true", () => {
      render(() => <TestNumberField aria-label="Amount" isReadOnly />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });
  });

  describe("wheel and stepper repeat", () => {
    it("increments a focused input on wheel deltaY > 0", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={5} onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      const parentHeard = vi.fn();
      input.parentElement!.addEventListener("wheel", parentHeard);
      fireEvent.wheel(input, { deltaY: 120, deltaX: 0 });

      expect(onChange).toHaveBeenCalledWith(6);
      expect(parentHeard).not.toHaveBeenCalled();
    });

    it("decrements a focused input on wheel deltaY < 0", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={5} onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      fireEvent.wheel(input, { deltaY: -120, deltaX: 0 });

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("does not step a focused input on a mostly horizontal wheel, and stops the scroll", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={5} onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      const parentHeard = vi.fn();
      input.parentElement!.addEventListener("wheel", parentHeard);
      const scrolled = fireEvent.wheel(input, { deltaX: 120, deltaY: 40 });

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue("5");
      expect(scrolled).toBe(false);
      expect(parentHeard).not.toHaveBeenCalled();
    });

    it("ignores a pinch-zoom wheel on a focused input", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" defaultValue={5} onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      const scrolled = fireEvent.wheel(input, { deltaY: 120, deltaX: 0, ctrlKey: true });

      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue("5");
      expect(scrolled).toBe(true);
    });

    it("repeats increment while the mouse stepper is held", () => {
      vi.useFakeTimers();
      const onChange = vi.fn();
      let pressStart: ((e: { pointerType: string }) => void) | undefined;
      let pressUp: ((e: { pointerType: string }) => void) | undefined;

      function Capture() {
        const state = createNumberFieldState({ defaultValue: 5, onChange, step: 1 });
        const aria = createNumberField(
          () => ({ "aria-label": "Amount" }),
          state,
          () => null,
        );
        pressStart = aria.incrementButtonProps.onPressStart as typeof pressStart;
        pressUp = aria.incrementButtonProps.onPressUp as typeof pressUp;
        return <input {...aria.inputProps} />;
      }

      render(() => <Capture />);
      pressStart?.({ pointerType: "mouse" });
      expect(onChange).toHaveBeenCalledWith(6);
      vi.advanceTimersByTime(400);
      expect(onChange).toHaveBeenCalledWith(7);
      vi.advanceTimersByTime(400);
      expect(onChange.mock.calls.at(-1)?.[0]).toBeGreaterThanOrEqual(13);
      pressUp?.({ pointerType: "mouse" });
      vi.useRealTimers();
    });
  });

  describe("paste", () => {
    function clipboard(text: string): DataTransfer {
      return {
        items: [{ kind: "string", type: "text/plain" }] as unknown as DataTransferItemList,
        types: ["text/plain"],
        files: [] as unknown as FileList,
        dropEffect: "copy",
        effectAllowed: "copy",
        getData: (type: string) => (type === "text/plain" ? text : ""),
        setData: () => {},
        clearData: () => {},
        setDragImage: () => {},
      } as unknown as DataTransfer;
    }

    function selectAll(input: HTMLInputElement) {
      input.focus();
      input.setSelectionRange(0, input.value.length);
    }

    it("commits a full-selection paste immediately", () => {
      const onChange = vi.fn();
      const onPaste = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={5}
          onChange={onChange}
          onPaste={onPaste}
        />
      ));

      const input = screen.getByRole("textbox") as HTMLInputElement;
      selectAll(input);
      const pasted = fireEvent.paste(input, { clipboardData: clipboard("  12  ") });

      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(pasted).toBe(false);
      expect(onChange).toHaveBeenCalledWith(12);
      expect(input).toHaveValue("12");
    });

    it("commits a paste that replaces an empty field", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      selectAll(input);
      fireEvent.paste(input, { clipboardData: clipboard("12") });

      expect(onChange).toHaveBeenCalledWith(12);
      expect(input).toHaveValue("12");
    });

    it("leaves a partial selection for the browser", () => {
      const onChange = vi.fn();
      const onPaste = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={50}
          onChange={onChange}
          onPaste={onPaste}
        />
      ));

      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      input.setSelectionRange(1, 1);
      const pasted = fireEvent.paste(input, { clipboardData: clipboard("9") });

      expect(onPaste).toHaveBeenCalledTimes(1);
      expect(pasted).toBe(true);
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue("50");
    });

    it("keeps the controlled value on screen when the paste is not accepted", () => {
      const onChange = vi.fn();
      render(() => <TestNumberField aria-label="Amount" value={200} onChange={onChange} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      selectAll(input);
      fireEvent.paste(input, { clipboardData: clipboard("1024") });

      expect(onChange).toHaveBeenCalledWith(1024);
      expect(input).toHaveValue("200");
    });

    it("formats a currency paste without waiting for enter", () => {
      const onChange = vi.fn();
      render(() => (
        <TestNumberField
          aria-label="Amount"
          defaultValue={200}
          onChange={onChange}
          formatOptions={{ style: "currency", currency: "USD" }}
        />
      ));

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input).toHaveValue("$200.00");
      selectAll(input);
      fireEvent.paste(input, { clipboardData: clipboard("1,024") });

      expect(onChange).toHaveBeenCalledWith(1024);
      expect(input).toHaveValue("$1,024.00");
    });
  });

  describe("native vs aria required", () => {
    it("omits aria-required when validation is native", () => {
      render(() => <TestNumberField aria-label="Amount" isRequired />);
      const input = screen.getByRole("textbox");
      expect(input).toBeRequired();
      expect(input).not.toHaveAttribute("aria-required");
    });

    it("sets aria-required when validation is aria", () => {
      render(() => <TestNumberField aria-label="Amount" isRequired validationBehavior="aria" />);
      const input = screen.getByRole("textbox");
      expect(input.hasAttribute("required")).toBe(false);
      expect(input).toHaveAttribute("aria-required", "true");
    });
  });

  describe("live announcement", () => {
    it("announces the new value assertively when it changes while focused", async () => {
      render(() => <TestNumberField aria-label="Amount" defaultValue={5} />);
      const input = screen.getByRole("textbox");
      input.focus();
      fireEvent.keyDown(input, { key: "ArrowUp" });
      await waitFor(() => {
        const live = document.querySelector('[aria-live="assertive"]');
        expect(live?.textContent).toContain("6");
      });
    });
  });

  describe("native custom validity", () => {
    it("sets customError when isInvalid", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

      render(() => (
        <form aria-label="Amount form" onSubmit={onSubmit}>
          <TestNumberField aria-label="Amount" isInvalid defaultValue={5} />
          <button type="submit">Submit</button>
        </form>
      ));

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await waitFor(() => {
        expect(input.validity.customError).toBe(true);
        expect(input.checkValidity()).toBe(false);
        expect(input.validationMessage).toBe("Invalid value.");
      });

      (screen.getByRole("form", { name: "Amount form" }) as HTMLFormElement).requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("skips custom validity when disabled", async () => {
      render(() => <TestNumberField aria-label="Amount" isInvalid isDisabled defaultValue={5} />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      await waitFor(() => {
        expect(input.validity.customError).toBe(false);
        expect(input.checkValidity()).toBe(true);
      });
    });

    it("sets customError for a value over max when commitBehavior is validate", async () => {
      const onSubmit = vi.fn((event: SubmitEvent) => event.preventDefault());

      render(() => (
        <form aria-label="Amount form" onSubmit={onSubmit}>
          <TestNumberField
            aria-label="Amount"
            minValue={0}
            maxValue={10}
            defaultValue={15}
            commitBehavior="validate"
            step={1}
          />
          <button type="submit">Submit</button>
        </form>
      ));

      const input = screen.getByRole("textbox") as HTMLInputElement;
      await waitFor(() => {
        expect(input.checkValidity()).toBe(false);
        expect(input.validity.customError).toBe(true);
      });

      (screen.getByRole("form", { name: "Amount form" }) as HTMLFormElement).requestSubmit();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe("localization and RTL contracts", () => {
    it.each([
      {
        locale: "ar-AE",
        dir: "rtl",
        roledescription: "حقل رقمي",
        incNoLabel: "زيادة",
        decNoLabel: "خفض",
        incWithLabel: "زيادة المبلغ",
        decWithLabel: "خفض المبلغ",
      },
      {
        locale: "de-DE",
        dir: "ltr",
        roledescription: "Nummernfeld",
        incNoLabel: "erhöhen",
        decNoLabel: "verringern",
        incWithLabel: "Menge erhöhen",
        decWithLabel: "Menge verringern",
      },
      {
        locale: "ja-JP",
        dir: "ltr",
        roledescription: "数値フィールド",
        incNoLabel: "を拡大",
        decNoLabel: "を縮小",
        incWithLabel: "数量を拡大",
        decWithLabel: "数量を縮小",
      },
      {
        locale: "he-IL",
        dir: "rtl",
        roledescription: "שדה מספר",
        incNoLabel: "הגדל",
        decNoLabel: "הקטן",
        incWithLabel: "הגדל סכום",
        decWithLabel: "הקטן סכום",
      },
    ])(
      "localizes role description and stepper labels for $locale ($dir)",
      ({ locale, roledescription, incNoLabel, decNoLabel, incWithLabel, decWithLabel }) => {
        // Without visible/aria label (e.g. slotted label or bare field)
        const { unmount } = render(() => (
          <I18nProvider locale={locale}>
            <TestNumberField />
          </I18nProvider>
        ));

        let input = screen.getByRole("textbox");
        let inc = screen.getByTestId("increment");
        let dec = screen.getByTestId("decrement");

        expect(input).toHaveAttribute("aria-roledescription", roledescription);
        expect(inc).toHaveAttribute("aria-label", incNoLabel);
        expect(dec).toHaveAttribute("aria-label", decNoLabel);

        unmount();

        // With explicit aria-label
        render(() => (
          <I18nProvider locale={locale}>
            <TestNumberField
              aria-label={
                locale === "ar-AE"
                  ? "المبلغ"
                  : locale === "de-DE"
                    ? "Menge"
                    : locale === "ja-JP"
                      ? "数量"
                      : "סכום"
              }
            />
          </I18nProvider>
        ));

        input = screen.getByRole("textbox");
        inc = screen.getByTestId("increment");
        dec = screen.getByTestId("decrement");

        expect(input).toHaveAttribute("aria-roledescription", roledescription);
        expect(inc).toHaveAttribute("aria-label", incWithLabel);
        expect(dec).toHaveAttribute("aria-label", decWithLabel);
      },
    );

    it("allows overriding stepper labels with incrementAriaLabel and decrementAriaLabel", () => {
      render(() => (
        <I18nProvider locale="de-DE">
          <TestNumberField
            aria-label="Menge"
            incrementAriaLabel="Schritt aufwärts"
            decrementAriaLabel="Schritt abwärts"
          />
        </I18nProvider>
      ));

      expect(screen.getByTestId("increment")).toHaveAttribute("aria-label", "Schritt aufwärts");
      expect(screen.getByTestId("decrement")).toHaveAttribute("aria-label", "Schritt abwärts");
    });
  });
});
