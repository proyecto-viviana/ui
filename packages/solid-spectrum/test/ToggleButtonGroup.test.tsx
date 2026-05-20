import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ToggleButton, ToggleButtonGroup } from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("ToggleButtonGroup (solid-spectrum)", () => {
  it("renders single selection with radio semantics", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ToggleButtonGroup
        aria-label="Text alignment"
        selectionMode="single"
        defaultSelectedKeys={["left"]}
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="left">Left</ToggleButton>
        <ToggleButton id="right">Right</ToggleButton>
      </ToggleButtonGroup>
    ));

    const group = screen.getByRole("radiogroup", { name: "Text alignment" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).not.toHaveAttribute("data-density");

    const left = screen.getByRole("radio", { name: "Left" });
    const right = screen.getByRole("radio", { name: "Right" });
    expect(left).toHaveAttribute("aria-checked", "true");
    expect(right).toHaveAttribute("aria-checked", "false");

    await user.click(right);

    expect(left).toHaveAttribute("aria-checked", "false");
    expect(right).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["right"]));
  });

  it("supports multiple selection with toggle button semantics", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ToggleButtonGroup
        aria-label="Text style"
        selectionMode="multiple"
        defaultSelectedKeys={["bold"]}
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="bold">Bold</ToggleButton>
        <ToggleButton id="italic">Italic</ToggleButton>
      </ToggleButtonGroup>
    ));

    expect(screen.getByRole("toolbar", { name: "Text style" })).toBeInTheDocument();
    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");

    await user.click(italic);

    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "true");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["bold", "italic"]));
  });

  it("forwards disallowEmptySelection to grouped toggle state", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ToggleButtonGroup
        aria-label="Text alignment"
        selectionMode="single"
        disallowEmptySelection
        defaultSelectedKeys={["left"]}
        onSelectionChange={onSelectionChange}
      >
        <ToggleButton id="left">Left</ToggleButton>
        <ToggleButton id="right">Right</ToggleButton>
      </ToggleButtonGroup>
    ));

    const left = screen.getByRole("radio", { name: "Left" });
    expect(left).toHaveAttribute("aria-checked", "true");

    await user.click(left);

    expect(left).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).not.toHaveBeenCalledWith(new Set());
  });

  it("passes S2 group styling props and disabled state to child ToggleButtons", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => (
      <ToggleButtonGroup
        aria-label="Pinned columns"
        size="XL"
        density="compact"
        isQuiet
        isEmphasized
        isDisabled
      >
        <ToggleButton id="first" onPress={onPress}>
          First
        </ToggleButton>
      </ToggleButtonGroup>
    ));

    const group = screen.getByRole("radiogroup", { name: "Pinned columns" });
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).not.toHaveAttribute("data-density");
    expect(group).toHaveAttribute("data-disabled", "true");

    const button = screen.getByRole("radio", { name: "First" });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-quiet");
    expect(button).not.toHaveAttribute("data-emphasized");

    await user.click(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
