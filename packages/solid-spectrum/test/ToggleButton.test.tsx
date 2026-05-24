import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ToggleButton } from "../src";
import CrossIcon from "../src/icon/ui-icons/Cross";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("ToggleButton (solid-spectrum)", () => {
  it("forwards standalone id and uncontrolled selection through the styled wrapper", async () => {
    const user = setupUser();
    const onChange = vi.fn();
    render(() => (
      <ToggleButton id="pin-toggle" defaultSelected onChange={onChange}>
        Pin
      </ToggleButton>
    ));

    const button = screen.getByRole("button", { name: "Pin" });
    expect(button).toHaveAttribute("id", "pin-toggle");
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button.querySelector('[data-rsp-slot="text"]')).not.toBeNull();

    await user.click(button);

    expect(onChange).toHaveBeenCalledWith(false);
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("supports S2 visual props, icon context, and disabled selection state", () => {
    render(() => (
      <ToggleButton
        aria-label="Close"
        size="XL"
        staticColor="white"
        isQuiet
        isEmphasized
        isDisabled
        isSelected
      >
        <CrossIcon />
      </ToggleButton>
    ));

    const button = screen.getByRole("button", { name: "Close" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-static-color");
    expect(button).not.toHaveAttribute("data-quiet");
    expect(button).not.toHaveAttribute("data-emphasized");
    expect(button.querySelector('[data-slot="icon"]')).not.toBeNull();
  });
});
