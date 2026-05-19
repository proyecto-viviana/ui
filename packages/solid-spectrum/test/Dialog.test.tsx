/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { createSignal } from "solid-js";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { DialogTrigger, Dialog } from "../src/dialog";
import { Button } from "../src/button";

describe("Dialog (solid-spectrum)", () => {
  it("opens from trigger and closes via close action", async () => {
    const user = setupUser();

    render(() => (
      <DialogTrigger
        trigger={<Button>Open dialog</Button>}
        content={(close) => (
          <Dialog title="Settings" isDismissable onClose={close}>
            <button onClick={close}>Close now</button>
          </Dialog>
        )}
      />
    ));

    const openButton = screen.getByRole("button", { name: "Open dialog" });

    await user.click(openButton);
    expect(screen.getByRole("dialog", { name: "Settings" })).toHaveClass(
      /comparison-spectrum-Dialog/,
    );
    expect(screen.getByText("Settings")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close now" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(openButton).toHaveFocus());
  });

  it("supports defaultOpen and S2 size aliases", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<Button>Open dialog</Button>}
        content={(close) => (
          <Dialog title="Ready" size="XL" isDismissible onClose={close}>
            Loaded
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("dialog", { name: "Ready" });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("data-size", "XL");
    expect(within(dialog).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("keeps legacy size and dismissable spellings working", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<Button>Open legacy</Button>}
        content={(close) => (
          <Dialog title="Legacy" size="sm" isDismissable onClose={close}>
            Legacy spelling
          </Dialog>
        )}
      />
    ));

    expect(screen.getByRole("dialog", { name: "Legacy" })).toHaveAttribute("data-size", "S");
    expect(
      within(screen.getByRole("dialog", { name: "Legacy" })).getByRole("button", {
        name: "Dismiss",
      }),
    ).toBeInTheDocument();
  });

  it("supports controlled open state through DialogTrigger", async () => {
    const user = setupUser();
    const [open, setOpen] = createSignal(false);
    const openChanges: boolean[] = [];

    render(() => (
      <DialogTrigger
        isOpen={open()}
        onOpenChange={(nextOpen) => {
          openChanges.push(nextOpen);
          setOpen(nextOpen);
        }}
        trigger={<Button>Open controlled</Button>}
        content={(close) => (
          <Dialog title="Controlled" isDismissible onClose={close}>
            Controlled content
          </Dialog>
        )}
      />
    ));

    await user.click(screen.getByRole("button", { name: "Open controlled" }));
    expect(openChanges).toEqual([true]);
    expect(screen.getByRole("dialog", { name: "Controlled" })).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("dialog", { name: "Controlled" })).getByRole("button", {
        name: "Dismiss",
      }),
    );
    expect(openChanges).toEqual([true, false]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("passes alertdialog role and blocks Escape when keyboard dismissal is disabled", async () => {
    const user = setupUser();

    render(() => (
      <DialogTrigger
        defaultOpen
        isKeyboardDismissDisabled
        trigger={<Button>Open alert</Button>}
        content={(close) => (
          <Dialog title="Alert review" role="alertdialog" isDismissible onClose={close}>
            Alert content
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("alertdialog", { name: "Alert review" });
    expect(dialog).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.getByRole("alertdialog", { name: "Alert review" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
