import { describe, it, expect, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { createSwitch, createToggleState } from "../src";
import { createPointerEvent, setupUser } from "@proyecto-viviana/solidaria-test-utils";

// Test component that uses createSwitch
function TestSwitch(props: {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  onPressChange?: (isPressed: boolean) => void;
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
      onPressChange: props.onPressChange,
      "aria-label": props["aria-label"],
      children: props.children,
    }),
    state,
    () => inputRef,
  );

  const getInputProps = () => switchAria.inputProps;

  return (
    <label {...switchAria.labelProps}>
      <input ref={(el) => (inputRef = el)} {...getInputProps()} />
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

  describe("label press", () => {
    it("reports onPressChange while the label is pressed", () => {
      const onPressChange = vi.fn();
      render(() => <TestSwitch aria-label="Notify" onPressChange={onPressChange} />);

      const label = screen.getByRole("switch").closest("label")!;
      fireEvent(label, createPointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));

      expect(onPressChange).toHaveBeenCalledWith(true);

      fireEvent(label, createPointerEvent("pointerup", { pointerId: 1, pointerType: "mouse" }));
      fireEvent.click(label);

      expect(onPressChange.mock.calls).toEqual([[true], [false]]);
    });

    it("reports one press change when Space activates the input", async () => {
      const user = setupUser();
      const onPressChange = vi.fn();
      render(() => <TestSwitch aria-label="Notify" onPressChange={onPressChange} />);

      const switchEl = screen.getByRole("switch");
      switchEl.focus();
      await user.keyboard(" ");

      expect(onPressChange.mock.calls).toEqual([[true], [false]]);
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

  describe("controlled DOM restoration", () => {
    it("keeps native checked false when controlled onChange refuses the click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isSelected={false} onChange={onChange} />);
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(switchEl);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(false);
    });

    it("keeps native checked true when controlled onChange refuses the click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isSelected={true} onChange={onChange} />);
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(switchEl);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
      expect(switchEl.checked).toBe(true);
    });

    it("keeps native checked false when Space is refused", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <TestSwitch aria-label="Test switch" isSelected={false} onChange={onChange} />);
      const switchEl = screen.getByRole("switch") as HTMLInputElement;
      switchEl.focus();

      await user.keyboard(" ");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(false);
    });

    it("keeps native checked false when a label click is refused", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => (
        <TestSwitch aria-label="Test switch" isSelected={false} onChange={onChange}>
          Notify
        </TestSwitch>
      ));
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(screen.getByText("Notify"));

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(false);
    });

    it("keeps an accepted controlled click and a later external update on the input", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      const [selected, setSelected] = createSignal(false);
      render(() => (
        <TestSwitch
          aria-label="Test switch"
          isSelected={selected()}
          onChange={(next) => {
            onChange(next);
            setSelected(next);
          }}
        />
      ));
      const switchEl = screen.getByRole("switch") as HTMLInputElement;

      await user.click(switchEl);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(switchEl.checked).toBe(true);

      setSelected(false);
      flush();
      expect(switchEl.checked).toBe(false);
    });
  });
});
