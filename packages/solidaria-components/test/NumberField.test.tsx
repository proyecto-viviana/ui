/**
 * NumberField tests - Port of React Aria's NumberField.test.tsx
 *
 * Tests for NumberField component functionality including:
 * - Rendering
 * - Increment/decrement buttons
 * - Keyboard interactions
 * - Min/max constraints
 * - Disabled/readonly states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import {
  NumberField,
  NumberFieldLabel,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementButton,
  NumberFieldDecrementButton,
} from "../src/NumberField";
import {
  setupUser,
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Helper component for testing - NumberField uses render props pattern
function TestNumberField(props: { fieldProps?: Partial<Parameters<typeof NumberField>[0]> }) {
  return (
    <NumberField aria-label="Test Number" {...props.fieldProps}>
      {() => (
        <NumberFieldGroup>
          <NumberFieldDecrementButton>-</NumberFieldDecrementButton>
          <NumberFieldInput />
          <NumberFieldIncrementButton>+</NumberFieldIncrementButton>
        </NumberFieldGroup>
      )}
    </NumberField>
  );
}

describe("NumberField", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestNumberField />);

      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toBeInTheDocument();
    });

    it("should render the input as a textbox inside a group", () => {
      render(() => <TestNumberField />);

      // Upstream useNumberField overrides the spinbutton role: the input is a
      // plain textbox, with role=group on the wrapping field.
      const input = screen.getByRole("textbox");
      expect(input).toBeInTheDocument();
      expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
      expect(screen.getByRole("group")).toContainElement(input);
    });

    it("should render increment and decrement buttons", () => {
      render(() => <TestNumberField />);

      // Buttons have aria-labels like "Increase Test Number" and "Decrease Test Number"
      expect(screen.getByRole("button", { name: /increase/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /decrease/i })).toBeInTheDocument();
    });

    it("should render with label", () => {
      render(() => (
        <NumberField aria-label="Quantity">
          {() => (
            <>
              <NumberFieldLabel>Quantity</NumberFieldLabel>
              <NumberFieldGroup>
                <NumberFieldInput />
              </NumberFieldGroup>
            </>
          )}
        </NumberField>
      ));

      expect(screen.getByText("Quantity")).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => <TestNumberField fieldProps={{ class: "my-number-field" }} />);

      const field = document.querySelector(".my-number-field");
      expect(field).toBeInTheDocument();
    });
  });

  // ============================================
  // VALUE DISPLAY
  // ============================================

  describe("value display", () => {
    it("should display defaultValue", () => {
      render(() => <TestNumberField fieldProps={{ defaultValue: 5 }} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("5");
    });

    it("should display controlled value", () => {
      render(() => <TestNumberField fieldProps={{ value: 10 }} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("10");
    });
  });

  // ============================================
  // INCREMENT/DECREMENT BUTTONS
  // ============================================

  describe("increment/decrement buttons", () => {
    it("should increment on increment button click", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 5, onChange }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      await user.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(6);
    });

    it("should decrement on decrement button click", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 5, onChange }} />);

      const decrementButton = screen.getByRole("button", { name: /decrease/i });
      await user.click(decrementButton);

      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("should respect step value", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 5, step: 5, onChange }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      await user.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it("should return focus to input after increment button click", async () => {
      render(() => <TestNumberField fieldProps={{ defaultValue: 5 }} />);

      const input = screen.getByRole("textbox");
      const incrementButton = screen.getByRole("button", { name: /increase/i });
      input.focus();
      expect(input).toHaveFocus();

      await user.click(incrementButton);

      expect(screen.getByRole("textbox")).toHaveFocus();
    });

    it("should disable increment button at maxValue", () => {
      render(() => <TestNumberField fieldProps={{ value: 10, maxValue: 10 }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      expect(incrementButton).toHaveAttribute("data-disabled");
    });

    it("should disable decrement button at minValue", () => {
      render(() => <TestNumberField fieldProps={{ value: 0, minValue: 0 }} />);

      const decrementButton = screen.getByRole("button", { name: /decrease/i });
      expect(decrementButton).toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // KEYBOARD INTERACTIONS
  // ============================================

  describe("keyboard interactions", () => {
    it("should increment on Arrow Up", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 5, onChange }} />);

      const input = screen.getByRole("textbox");
      input.focus();
      fireEvent.keyDown(input, { key: "ArrowUp" });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(6);
      });
    });

    it("should decrement on Arrow Down", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 5, onChange }} />);

      const input = screen.getByRole("textbox");
      input.focus();
      fireEvent.keyDown(input, { key: "ArrowDown" });

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(4);
      });
    });

    it("should forward onKeyDown and onKeyUp from props", async () => {
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();
      render(() => <TestNumberField fieldProps={{ onKeyDown, onKeyUp }} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "1");

      expect(onKeyDown).toHaveBeenCalled();
      expect(onKeyUp).toHaveBeenCalled();
    });
  });

  // ============================================
  // MIN/MAX CONSTRAINTS
  // ============================================

  describe("min/max constraints", () => {
    it("should respect minValue", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ value: 0, minValue: 0, onChange }} />);

      const decrementButton = screen.getByRole("button", { name: /decrease/i });
      await user.click(decrementButton);

      // Should not call onChange since already at min
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should respect maxValue", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ value: 10, maxValue: 10, onChange }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      await user.click(incrementButton);

      // Should not call onChange since already at max
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should not expose spinbutton aria-value* on the textbox", () => {
      render(() => <TestNumberField fieldProps={{ minValue: 0, maxValue: 100 }} />);

      // Upstream drops aria-valuemin/max/now/text along with the spinbutton role
      // (they can't be focused with VoiceOver); the range still constrains the
      // value, it just isn't announced via aria-value*.
      const input = screen.getByRole("textbox");
      expect(input).not.toHaveAttribute("aria-valuemin");
      expect(input).not.toHaveAttribute("aria-valuemax");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", () => {
      render(() => <TestNumberField fieldProps={{ isDisabled: true }} />);

      const input = screen.getByRole("textbox");
      expect(input).toBeDisabled();
    });

    it("should disable all buttons when disabled", () => {
      render(() => <TestNumberField fieldProps={{ isDisabled: true }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      const decrementButton = screen.getByRole("button", { name: /decrease/i });

      expect(incrementButton).toHaveAttribute("data-disabled");
      expect(decrementButton).toHaveAttribute("data-disabled");
    });

    it("should have data-disabled attribute on field", () => {
      render(() => <TestNumberField fieldProps={{ isDisabled: true }} />);

      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly", () => {
      render(() => <TestNumberField fieldProps={{ isReadOnly: true }} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("readonly");
    });

    it("should have data-readonly attribute on field", () => {
      render(() => <TestNumberField fieldProps={{ isReadOnly: true }} />);

      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toHaveAttribute("data-readonly");
    });

    it("should expose isReadOnly in render props", () => {
      render(() => (
        <TestNumberField
          fieldProps={{
            isReadOnly: true,
            class: (renderProps) =>
              renderProps.isReadOnly ? "readonly-numberfield" : "editable-numberfield",
          }}
        />
      ));

      expect(document.querySelector(".readonly-numberfield")).toBeInTheDocument();
    });
  });

  // ============================================
  // REQUIRED STATE
  // ============================================

  describe("required state", () => {
    it("should support isRequired", () => {
      render(() => <TestNumberField fieldProps={{ isRequired: true }} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-required", "true");
    });

    it("should have data-required attribute on field", () => {
      render(() => <TestNumberField fieldProps={{ isRequired: true }} />);

      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toHaveAttribute("data-required");
    });
  });

  // ============================================
  // INVALID STATE
  // ============================================

  describe("invalid state", () => {
    it("should support isInvalid", () => {
      render(() => <TestNumberField fieldProps={{ isInvalid: true }} />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("should have data-invalid attribute on field", () => {
      render(() => <TestNumberField fieldProps={{ isInvalid: true }} />);

      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toHaveAttribute("data-invalid");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should expose aria-roledescription instead of the spinbutton role", () => {
      render(() => <TestNumberField />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-roledescription", "number field");
    });

    it("should reflect the value via the input value, not aria-valuenow", () => {
      render(() => <TestNumberField fieldProps={{ value: 5 }} />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input).toHaveValue("5");
      expect(input).not.toHaveAttribute("aria-valuenow");
    });

    it("should have aria-label when provided", () => {
      render(() => <TestNumberField />);

      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-label", "Test Number");
    });
  });

  // ============================================
  // CONTROLLED/UNCONTROLLED
  // ============================================

  describe("controlled/uncontrolled", () => {
    it("should fire onChange for uncontrolled field", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ defaultValue: 0, onChange }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      await user.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(1);
    });

    it("should fire onChange for controlled field", async () => {
      const onChange = vi.fn();
      render(() => <TestNumberField fieldProps={{ value: 0, onChange }} />);

      const incrementButton = screen.getByRole("button", { name: /increase/i });
      await user.click(incrementButton);

      expect(onChange).toHaveBeenCalledWith(1);
    });
  });

  describe("a11y validation", () => {
    it("axe: default", async () => {
      const { container } = render(() => <TestNumberField />);
      await assertNoA11yViolations(container);
    });

    it("axe: with value", async () => {
      const { container } = render(() => <TestNumberField fieldProps={{ defaultValue: 42 }} />);
      await assertNoA11yViolations(container);
    });

    it("axe: disabled", async () => {
      const { container } = render(() => <TestNumberField fieldProps={{ isDisabled: true }} />);
      await assertNoA11yViolations(container);
    });

    it("axe: invalid", async () => {
      const { container } = render(() => <TestNumberField fieldProps={{ isInvalid: true }} />);
      await assertNoA11yViolations(container);
    });

    it("axe: with min/max", async () => {
      const { container } = render(() => (
        <TestNumberField fieldProps={{ minValue: 0, maxValue: 100, defaultValue: 50 }} />
      ));
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs", () => {
      render(() => <TestNumberField fieldProps={{ defaultValue: 5 }} />);
      assertAriaIdIntegrity(document.body);
    });

    it("DOM: data-testid forwards", () => {
      render(() => <TestNumberField fieldProps={{ "data-testid": "qty" } as any} />);
      const field = document.querySelector(".solidaria-NumberField");
      expect(field).toHaveAttribute("data-testid", "qty");
    });
  });
});
