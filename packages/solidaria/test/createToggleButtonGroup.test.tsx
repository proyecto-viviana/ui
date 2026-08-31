import { describe, it, expect } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { createToggleButtonGroup, createToggleButtonGroupItem } from "../src";
import { createToggleGroupState } from "@proyecto-viviana/solid-stately";

function TestToggleGroup(props: {
  selectionMode?: "single" | "multiple";
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  const state = createToggleGroupState(() => ({
    selectionMode: props.selectionMode,
    isDisabled: props.isDisabled,
  }));

  const { groupProps } = createToggleButtonGroup(
    {
      selectionMode: props.selectionMode,
      isDisabled: props.isDisabled,
      orientation: props.orientation,
      "aria-label": "Formatting",
    },
    state,
  );

  const left = createToggleButtonGroupItem({ id: "left", "aria-label": "Left" }, state);
  const center = createToggleButtonGroupItem({ id: "center", "aria-label": "Center" }, state);

  return (
    <div {...groupProps}>
      <button {...left.buttonProps}>Left</button>
      <button {...center.buttonProps}>Center</button>
    </div>
  );
}

describe("createToggleButtonGroup", () => {
  it("uses radiogroup semantics in single mode", async () => {
    const user = setupUser();
    render(() => <TestToggleGroup selectionMode="single" />);

    const group = screen.getByRole("radiogroup", { name: "Formatting" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-orientation", "horizontal");

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[0]).not.toHaveAttribute("aria-pressed");

    await user.click(radios[0]);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");
  });

  it("uses toolbar semantics in multiple mode", async () => {
    const user = setupUser();
    render(() => <TestToggleGroup selectionMode="multiple" />);

    const group = screen.getByRole("toolbar", { name: "Formatting" });
    expect(group).toBeInTheDocument();
    expect(group).toHaveAttribute("aria-orientation", "horizontal");

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await user.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("adds aria-disabled to group when disabled", () => {
    render(() => <TestToggleGroup selectionMode="multiple" isDisabled />);
    const group = screen.getByRole("toolbar", { name: "Formatting" });
    expect(group).toHaveAttribute("aria-disabled", "true");
  });

  it("supports arrow-key navigation via toolbar behavior", () => {
    render(() => <TestToggleGroup selectionMode="multiple" orientation="horizontal" />);

    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);
  });
});
