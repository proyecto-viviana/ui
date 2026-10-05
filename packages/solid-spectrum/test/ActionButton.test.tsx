import { render, screen } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { ActionButton } from "../src/button";
import { ActionButtonGroup } from "../src/actionbuttongroup";
import { NotificationBadge } from "../src/notificationbadge";

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
      flush();
      expect(button).not.toHaveAttribute("data-pending");
      expect(button).not.toHaveAttribute("aria-disabled");

      await user.keyboard("{Enter}");
      expect(onPress).toHaveBeenCalledTimes(2);
      expect(warnings).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  });

  it("provides raw prop size to NotificationBadge rather than group size (#605)", () => {
    render(() => (
      <>
        <ActionButton>
          <NotificationBadge data-testid="plain-badge" />
          Edit
        </ActionButton>
        <ActionButtonGroup size="L">
          <ActionButton>
            <NotificationBadge data-testid="grouped-badge" />
            Edit
          </ActionButton>
        </ActionButtonGroup>
        <ActionButton size="L">
          <NotificationBadge data-testid="large-badge" />
          Edit
        </ActionButton>
      </>
    ));

    const plainBadge = screen.getByTestId("plain-badge");
    const groupedBadge = screen.getByTestId("grouped-badge");
    const largeBadge = screen.getByTestId("large-badge");

    // Both plain ActionButton and ActionButtonGroup size="L" ActionButton provide
    // raw prop size (undefined -> defaults to 'S'), while ActionButton size="L" provides 'L'.
    expect(plainBadge.className).toBe(groupedBadge.className);
    expect(plainBadge.className).not.toBe(largeBadge.className);
  });

  it("updates mixed text children reactively without recreating the button", () => {
    let setCount!: (value: number) => void;
    render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return <ActionButton>count: {count()}</ActionButton>;
    });

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("count: 0");
    setCount(1);
    flush();
    expect(screen.getByRole("button")).toBe(button);
    expect(button).toHaveTextContent("count: 1");
  });
});
