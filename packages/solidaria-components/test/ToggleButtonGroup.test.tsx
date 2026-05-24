/**
 * Tests for solidaria-components ToggleButtonGroup
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { ToggleButton } from "../src/ToggleButton";
import { ToggleButtonGroup } from "../src/ToggleButtonGroup";

describe("ToggleButtonGroup", () => {
  it("renders single mode as radiogroup with default class", () => {
    render(() => (
      <ToggleButtonGroup
        id="alignment-group"
        aria-label="Text align"
        aria-describedby="alignment-help"
        aria-details="alignment-details"
      >
        {() => (
          <ToggleButton id="a" aria-label="A">
            A
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    ));

    const group = screen.getByRole("radiogroup", { name: "Text align" });
    expect(group).toHaveClass("solidaria-ToggleButtonGroup");
    expect(group).toHaveAttribute("id", "alignment-group");
    expect(group).toHaveAttribute("aria-describedby", "alignment-help");
    expect(group).toHaveAttribute("aria-details", "alignment-details");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
  });

  it("supports single selection mode with radio semantics", async () => {
    const user = setupUser();
    render(() => (
      <ToggleButtonGroup selectionMode="single" aria-label="Text align">
        {() => (
          <>
            <ToggleButton id="a" aria-label="A">
              A
            </ToggleButton>
            <ToggleButton id="b" aria-label="B">
              B
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[0]).not.toHaveAttribute("aria-pressed");

    await user.click(radios[0]);
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(radios[1]).toHaveAttribute("aria-checked", "false");

    await user.click(radios[1]);
    expect(radios[0]).toHaveAttribute("aria-checked", "false");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
  });

  it("supports multiple selection mode with toolbar semantics", async () => {
    const user = setupUser();
    render(() => (
      <ToggleButtonGroup selectionMode="multiple" aria-label="Text style">
        {() => (
          <>
            <ToggleButton id="a" aria-label="Bold">
              Bold
            </ToggleButton>
            <ToggleButton id="b" aria-label="Italic">
              Italic
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const group = screen.getByRole("toolbar", { name: "Text style" });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]);
    await user.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("supports controlled selectedKeys", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ToggleButtonGroup
        selectionMode="multiple"
        selectedKeys={new Set(["a"])}
        onSelectionChange={onSelectionChange}
        aria-label="Formatting"
      >
        {() => (
          <>
            <ToggleButton id="a" aria-label="A">
              A
            </ToggleButton>
            <ToggleButton id="b" aria-label="B">
              B
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");

    await user.click(buttons[1]);
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["a", "b"]));
  });

  it("respects disallowEmptySelection in single selection mode", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <ToggleButtonGroup
        selectionMode="single"
        disallowEmptySelection
        defaultSelectedKeys={["a"]}
        onSelectionChange={onSelectionChange}
        aria-label="Text align"
      >
        {() => (
          <>
            <ToggleButton id="a" aria-label="A">
              A
            </ToggleButton>
            <ToggleButton id="b" aria-label="B">
              B
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");

    await user.click(radios[0]);

    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).not.toHaveBeenCalledWith(new Set());
  });

  it("preserves per-item disabled state inside an enabled group", async () => {
    const user = setupUser();
    const onPress = vi.fn();
    render(() => (
      <ToggleButtonGroup selectionMode="single" aria-label="Formatting">
        {() => (
          <>
            <ToggleButton id="a" aria-label="A" isDisabled onPress={onPress}>
              A
            </ToggleButton>
            <ToggleButton id="b" aria-label="B">
              B
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const first = screen.getByRole("radio", { name: "A" });
    const second = screen.getByRole("radio", { name: "B" });
    expect(first).toBeDisabled();
    expect(second).not.toBeDisabled();

    await user.click(first);

    expect(onPress).not.toHaveBeenCalled();
    expect(first).toHaveAttribute("aria-checked", "false");
  });

  it("uses keyboard arrow navigation between items", () => {
    render(() => (
      <ToggleButtonGroup selectionMode="multiple" aria-label="Formatting">
        {() => (
          <>
            <ToggleButton id="a" aria-label="A">
              A
            </ToggleButton>
            <ToggleButton id="b" aria-label="B">
              B
            </ToggleButton>
          </>
        )}
      </ToggleButtonGroup>
    ));

    const buttons = screen.getAllByRole("button");
    buttons[0].focus();
    fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
    expect(document.activeElement).toBe(buttons[1]);
  });
});
