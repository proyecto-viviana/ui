import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSwitch, createToggleState } from "../src";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// Test component that uses createSwitch
function TestSwitch(props: {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  "aria-label"?: string;
  children?: string;
}) {
  let inputRef: HTMLInputElement | null = null;

  const state = createToggleState(() => ({
    isSelected: props.isSelected,
    defaultSelected: props.defaultSelected,
    onChange: props.onChange,
  }));

  // Don't destructure - access the getter each time
  const switchAria = createSwitch(
    () => ({
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      "aria-label": props["aria-label"],
      children: props.children,
    }),
    state,
    () => inputRef,
  );

  // Create local accessor for checked state (same pattern as checkbox tests)
  const isChecked = () => state.isSelected();

  // Access inputProps once per render
  const getInputProps = () => switchAria.inputProps;

  return (
    <label {...switchAria.labelProps}>
      <input
        ref={(el) => (inputRef = el)}
        type="checkbox"
        role="switch"
        checked={isChecked()}
        disabled={getInputProps().disabled}
        tabIndex={getInputProps().tabIndex}
        aria-label={getInputProps()["aria-label"]}
        aria-readonly={getInputProps()["aria-readonly"]}
        onClick={getInputProps().onClick}
        onChange={getInputProps().onChange}
      />
      {props.children}
    </label>
  );
}

describe("createSwitch", () => {
  describe("accessibility", () => {
    it('has role="switch"', () => {
      render(() => <TestSwitch aria-label="Test switch" />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeInTheDocument();
    });

    it("has aria-checked matching selection state", () => {
      render(() => <TestSwitch aria-label="Test switch" defaultSelected />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });

    it("supports aria-label", () => {
      render(() => <TestSwitch aria-label="Toggle notifications" />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-label", "Toggle notifications");
    });
  });

  describe("uncontrolled mode", () => {
    it("toggles on click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" onChange={onChange} />);

      const switchEl = screen.getByRole("switch") as HTMLInputElement;
      expect(switchEl).not.toBeChecked();

      await user.click(switchEl);

      // Force a microtask tick to let SolidJS effects run
      await Promise.resolve();

      expect(switchEl).toBeChecked();
      expect(onChange).toHaveBeenCalledWith(true);

      await user.click(switchEl);

      // Force a microtask tick to let SolidJS effects run
      await Promise.resolve();

      expect(switchEl).not.toBeChecked();
      expect(onChange).toHaveBeenCalledWith(false);
    });

    it("respects defaultSelected", () => {
      render(() => <TestSwitch aria-label="Test switch" defaultSelected />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });
  });

  describe("controlled mode", () => {
    it("reflects controlled isSelected value", () => {
      render(() => <TestSwitch aria-label="Test switch" isSelected={true} />);
      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeChecked();
    });

    it("calls onChange but does not change internal state in controlled mode", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isSelected={false} onChange={onChange} />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).not.toBeChecked();

      await user.click(switchEl);
      expect(onChange).toHaveBeenCalledWith(true);
      // In controlled mode, the visual state depends on the parent updating isSelected
    });
  });

  describe("disabled state", () => {
    it("does not toggle when disabled", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isDisabled onChange={onChange} />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toBeDisabled();

      await user.click(switchEl);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("readonly state", () => {
    it("does not toggle when readonly", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isReadOnly onChange={onChange} />);

      const switchEl = screen.getByRole("switch");
      expect(switchEl).toHaveAttribute("aria-readonly", "true");

      await user.click(switchEl);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("keyboard interaction", () => {
    it("toggles on Space key", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" onChange={onChange} />);

      const switchEl = screen.getByRole("switch");
      switchEl.focus();

      await user.keyboard(" ");
      expect(onChange).toHaveBeenCalled();
    });
  });
});
