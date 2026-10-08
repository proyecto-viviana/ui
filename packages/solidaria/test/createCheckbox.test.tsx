import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { createCheckbox, createToggleState } from "../src";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

function TestCheckbox(props: { isIndeterminate?: boolean; "aria-label"?: string }) {
  let inputRef: HTMLInputElement | null = null;
  const state = createToggleState(() => ({}));
  const checkbox = createCheckbox(
    () => ({
      isIndeterminate: props.isIndeterminate,
      "aria-label": props["aria-label"],
    }),
    state,
    () => inputRef,
  );

  return (
    <label {...checkbox.labelProps}>
      <input ref={(el) => (inputRef = el)} {...checkbox.inputProps} />
    </label>
  );
}

describe("createCheckbox", () => {
  it("sets indeterminate from props and updates when the prop changes", () => {
    const [indeterminate, setIndeterminate] = createSignal(true);
    render(() => <TestCheckbox aria-label="Select all" isIndeterminate={indeterminate()} />);
    flush();
    const input = screen.getByRole("checkbox") as HTMLInputElement;
    expect(input.indeterminate).toBe(true);

    setIndeterminate(false);
    flush();
    expect(input.indeterminate).toBe(false);
  });

  describe("controlled DOM restoration", () => {
    function ControlledCheckbox(props: {
      isSelected?: boolean;
      onChange?: (isSelected: boolean) => void;
      children?: string;
    }) {
      let inputRef: HTMLInputElement | null = null;
      const state = createToggleState(() => ({
        isSelected: props.isSelected,
        onChange: props.onChange,
      }));
      const checkbox = createCheckbox(
        () => ({
          "aria-label": "Select row",
          children: props.children,
        }),
        state,
        () => inputRef,
      );
      const getInputProps = () => checkbox.inputProps;

      return (
        <label {...checkbox.labelProps}>
          <input ref={(el) => (inputRef = el)} {...getInputProps()} />
          {props.children}
        </label>
      );
    }

    it("keeps native checked false when controlled onChange refuses the click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <ControlledCheckbox isSelected={false} onChange={onChange} />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;

      await user.click(input);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(input.checked).toBe(false);
    });

    it("keeps native checked true when controlled onChange refuses the click", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <ControlledCheckbox isSelected={true} onChange={onChange} />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;

      await user.click(input);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(false);
      expect(input.checked).toBe(true);
    });

    it("keeps native checked false when Space is refused", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      render(() => <ControlledCheckbox isSelected={false} onChange={onChange} />);
      const input = screen.getByRole("checkbox") as HTMLInputElement;
      input.focus();

      await user.keyboard(" ");

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(input.checked).toBe(false);
    });

    it("keeps an accepted controlled click and a later external update on the input", async () => {
      const user = setupUser();
      const onChange = vi.fn();
      const [selected, setSelected] = createSignal(false);
      render(() => (
        <ControlledCheckbox
          isSelected={selected()}
          onChange={(next) => {
            onChange(next);
            setSelected(next);
          }}
        >
          Select row
        </ControlledCheckbox>
      ));
      const input = screen.getByRole("checkbox") as HTMLInputElement;

      await user.click(screen.getByText("Select row"));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(true);
      expect(input.checked).toBe(true);

      setSelected(false);
      flush();
      expect(input.checked).toBe(false);
    });
  });
});
