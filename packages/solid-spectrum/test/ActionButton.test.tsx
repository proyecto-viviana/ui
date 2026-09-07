import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { ActionButton } from "../src/button";

describe("ActionButton", () => {
  it("does not copy string children onto aria-label when pending", () => {
    render(() => <ActionButton isPending>Inspect</ActionButton>);

    const button = screen.getByRole("button");
    expect(button).not.toHaveAttribute("aria-label");
    expect(button).not.toHaveAttribute("aria-labelledby");
    expect(button).toHaveAccessibleName("Inspect");
  });

  it("keeps a consumer aria-label when pending", () => {
    render(() => (
      <ActionButton isPending aria-label="Inspect details">
        Inspect
      </ActionButton>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Inspect details");
  });
  it("owns compound pending props across pointer and keyboard presses", async () => {
    const user = setupUser();
    const warnings: string[] = [];
    const warn = vi.spyOn(console, "warn").mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(" "));
    });
    const onPress = vi.fn();
    let setBusy!: (value: boolean) => void;

    try {
      render(() => {
        const [busy, updateBusy] = createSignal(false);
        const [confirming] = createSignal(false);
        setBusy = updateBusy;

        return (
          <ActionButton
            isPending={busy() && !confirming()}
            onPress={() => {
              onPress();
              setBusy(true);
            }}
          >
            Inspect
          </ActionButton>
        );
      });

      const button = screen.getByRole("button", { name: "Inspect" });
      await user.hover(button);
      await user.click(button);

      expect(onPress).toHaveBeenCalledTimes(1);
      expect(button).toHaveAttribute("data-pending");
      expect(button).toHaveAttribute("aria-disabled", "true");
      expect(button).not.toBeDisabled();

      await user.click(button);
      button.focus();
      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(1);

      setBusy(false);
      expect(button).not.toHaveAttribute("data-pending");
      expect(button).not.toHaveAttribute("aria-disabled");

      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(2);
      expect(warnings).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  });
});
