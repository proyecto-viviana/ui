import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { ActionButton } from "../src/button";

describe("ActionButton", () => {
  it("does not copy string children onto aria-label when pending", () => {
    render(() => <ActionButton isPending>Inspect</ActionButton>);

    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).not.toHaveAttribute("aria-labelledby");
    expect(button).toHaveAccessibleName("Inspect");
  });
});
