/**
 * Tests for createNumberField hook.
 * Based on @react-aria/numberfield useNumberField tests.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createNumberField } from "../src/numberfield/createNumberField";
import { createNumberFieldState } from "@proyecto-viviana/solid-stately";
import { Show } from "solid-js";

// Test component that uses createNumberField
function TestNumberField(props: {
  defaultValue?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  "aria-label"?: string;
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
    onChange: props.onChange,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
  });

  const {
    labelProps,
    groupProps,
    inputProps,
    incrementButtonProps,
    decrementButtonProps,
    descriptionProps,
    errorMessageProps,
  } = createNumberField(
    () => ({
      "aria-label": props["aria-label"],
      label: props.label,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      isRequired: props.isRequired,
      isInvalid: props.isInvalid,
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
    <div {...groupProps} data-testid="group">
      <Show when={props.label}>
        <label {...labelProps}>{props.label}</label>
      </Show>
      <button {...decrementButtonProps} data-testid="decrement">
        -
      </button>
      <input {...inputProps} ref={(el) => (inputRef = el)} data-testid="input" />
      <button {...incrementButtonProps} data-testid="increment">
        +
      </button>
      <Show when={props.description}>
        <div {...descriptionProps} data-testid="description">
          {props.description}
        </div>
      </Show>
      <Show when={props.isInvalid && props.errorMessage}>
        <div {...errorMessageProps} data-testid="error">
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
      expect(input).toHaveAttribute("aria-roledescription", "number field");
    });

    it("has aria-required when required", () => {
      render(() => <TestNumberField aria-label="Amount" isRequired />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
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

    it("PageUp sets to maximum value", () => {
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

      expect(onChange).toHaveBeenCalledWith(100);
    });

    it("PageDown sets to minimum value", () => {
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

      expect(onChange).toHaveBeenCalledWith(0);
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

    it("has decimal inputmode", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("inputmode", "decimal");
    });

    it("disables autocomplete", () => {
      render(() => <TestNumberField aria-label="Amount" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("autocomplete", "off");
    });

    it("supports name attribute", () => {
      render(() => <TestNumberField aria-label="Amount" name="quantity" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("name", "quantity");
    });

    it("supports form attribute", () => {
      render(() => <TestNumberField aria-label="Amount" name="quantity" form="checkout-form" />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("form", "checkout-form");
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
});
