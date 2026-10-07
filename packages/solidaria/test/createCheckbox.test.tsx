import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { createCheckbox, createToggleState } from "../src";

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
});
