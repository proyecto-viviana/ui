/**
 * Tests for solidaria-components ToggleButton
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ToggleButton, type ToggleButtonRenderProps } from "../src/ToggleButton";
import { ToggleButtonGroup } from "../src/ToggleButtonGroup";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

describe("ToggleButton", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with default class", () => {
    render(() => <ToggleButton aria-label="Pin">Pin</ToggleButton>);
    expect(screen.getByRole("button")).toHaveClass("solidaria-ToggleButton");
  });

  it("passes standalone id and documented ARIA button props to the DOM button", () => {
    render(() => (
      <ToggleButton
        id="pin-toggle"
        aria-label="Pin"
        aria-controls="pin-panel"
        aria-expanded={true}
        aria-haspopup="menu"
        excludeFromTabOrder
      >
        Pin
      </ToggleButton>
    ));

    const button = screen.getByRole("button", { name: "Pin" });
    expect(button).toHaveAttribute("id", "pin-toggle");
    expect(button).toHaveAttribute("aria-controls", "pin-panel");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  it("toggles selected state when clicked", async () => {
    render(() => <ToggleButton aria-label="Pin">Pin</ToggleButton>);
    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("aria-pressed", "false");
    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).toHaveAttribute("data-selected");
  });

  it("supports controlled selection", async () => {
    const onChange = vi.fn();
    render(() => (
      <ToggleButton aria-label="Pin" isSelected={true} onChange={onChange}>
        Pin
      </ToggleButton>
    ));
    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("aria-pressed", "true");
    await user.click(button);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("supports defaultSelected", () => {
    render(() => (
      <ToggleButton aria-label="Pin" defaultSelected>
        Pin
      </ToggleButton>
    ));
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("does not toggle when disabled", async () => {
    const onChange = vi.fn();
    render(() => (
      <ToggleButton aria-label="Pin" isDisabled onChange={onChange}>
        Pin
      </ToggleButton>
    ));
    const button = screen.getByRole("button");

    await user.click(button);
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(onChange).not.toHaveBeenCalled();
    expect(button).toHaveAttribute("data-disabled");
  });

  it("uses grouped id as the selection key without leaking it as a DOM id", () => {
    render(() => (
      <ToggleButtonGroup
        selectionMode="single"
        defaultSelectedKeys={["pin"]}
        aria-label="Formatting"
      >
        {() => (
          <ToggleButton id="pin" aria-label="Pin">
            Pin
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    ));

    const button = screen.getByRole("radio", { name: "Pin" });
    expect(button).toHaveAttribute("aria-checked", "true");
    expect(button).not.toHaveAttribute("id", "pin");
  });

  it("supports render props", () => {
    render(() => (
      <ToggleButton aria-label="Pin">
        {(props: ToggleButtonRenderProps) => (
          <span>{props.isSelected ? "Selected" : "Not Selected"}</span>
        )}
      </ToggleButton>
    ));
    expect(screen.getByText("Not Selected")).toBeInTheDocument();
  });

  it("reflects group disabled state in render props and data attributes", () => {
    render(() => (
      <ToggleButtonGroup isDisabled selectionMode="multiple" aria-label="Formatting">
        {() => (
          <ToggleButton id="pin" aria-label="Pin">
            {(props: ToggleButtonRenderProps) => (
              <span data-testid="label">{props.isDisabled ? "Disabled" : "Enabled"}</span>
            )}
          </ToggleButton>
        )}
      </ToggleButtonGroup>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-disabled");
    expect(screen.getByTestId("label")).toHaveTextContent("Disabled");
  });
});
