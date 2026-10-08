/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from "vite-plus/test";
import { createSignal } from "solid-js";
import { cleanup, render, screen, waitFor, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import {
  AlertDialog,
  ButtonGroup,
  CloseButton,
  Content,
  CustomDialog,
  Dialog,
  DialogContainer,
  DialogTrigger,
  Footer,
  FullscreenDialog,
  Header,
  Heading,
  useDialogContainer,
} from "../src/dialog";
import { ActionButton, Button, LinkButton, ToggleButton } from "../src/button";

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
    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute("class")).not.toContain("comparison-spectrum");
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

  it("supports S2 composition slots and hides ButtonGroup when dismissible", async () => {
    const user = setupUser();

    render(() => (
      <DialogTrigger>
        <Button>Open composed</Button>
        <Dialog isDismissible>
          <Heading slot="title">Composed settings</Heading>
          <Header>Dialog header copy</Header>
          <Content>Composed body</Content>
          <Footer>Footer copy</Footer>
          <ButtonGroup>
            <Button>Save</Button>
          </ButtonGroup>
        </Dialog>
      </DialogTrigger>
    ));

    await user.click(screen.getByRole("button", { name: "Open composed" }));
    const dialog = screen.getByRole("dialog", { name: "Composed settings" });

    expect(dialog).toHaveAttribute("data-size", "M");
    expect(within(dialog).getByText("Dialog header copy")).toBeInTheDocument();
    expect(within(dialog).getByText("Composed body")).toBeInTheDocument();
    expect(within(dialog).getByText("Footer copy")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Save" })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps ButtonGroup visible when a composed Dialog is not dismissible", () => {
    render(() => (
      <DialogTrigger defaultOpen>
        <Button>Open actions</Button>
        <Dialog>
          <Heading slot="title">Action review</Heading>
          <Content>Review the action.</Content>
          <ButtonGroup>
            <Button>Save</Button>
          </ButtonGroup>
        </Dialog>
      </DialogTrigger>
    ));

    const dialog = screen.getByRole("dialog", { name: "Action review" });
    expect(within(dialog).getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("supports DialogContainer and useDialogContainer dismissal", async () => {
    const user = setupUser();
    const [isOpen, setIsOpen] = createSignal(true);
    const dismissals: string[] = [];

    function ContainerAction() {
      const { close } = useDialogContainer();
      return <Button onPress={() => close()}>Close contained</Button>;
    }

    render(() => (
      <DialogContainer
        onDismiss={() => {
          dismissals.push("dismiss");
          setIsOpen(false);
        }}
      >
        {isOpen() && (
          <Dialog isDismissible>
            <Heading slot="title">Contained dialog</Heading>
            <Content>
              <ContainerAction />
            </Content>
          </Dialog>
        )}
      </DialogContainer>
    ));

    expect(screen.getByRole("dialog", { name: "Contained dialog" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close contained" }));
    expect(dismissals).toEqual(["dismiss"]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("maps AlertDialog actions to the shared Dialog surface", async () => {
    const user = setupUser();
    const actions: string[] = [];

    render(() => (
      <AlertDialog
        defaultOpen
        title="Delete project"
        variant="destructive"
        primaryActionLabel="Delete"
        secondaryActionLabel="Archive"
        cancelLabel="Cancel"
        onPrimaryAction={() => actions.push("primary")}
        onSecondaryAction={() => actions.push("secondary")}
        onCancel={() => actions.push("cancel")}
      >
        This action changes project state.
      </AlertDialog>
    ));

    const dialog = screen.getByRole("alertdialog", { name: "Delete project" });
    expect(dialog).toBeInTheDocument();
    expect(dialog.getAttribute("class")).not.toContain("comparison-spectrum");
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Archive" }));
    expect(actions).toEqual(["secondary"]);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("describes an AlertDialog from its Content children", () => {
    render(() => (
      <AlertDialog
        defaultOpen
        title="Delete project"
        cancelLabel="Cancel"
        primaryActionLabel="Delete"
      >
        This action cannot be undone.
      </AlertDialog>
    ));

    const dialog = screen.getByRole("alertdialog", { name: "Delete project" });
    expect(dialog).toHaveAccessibleDescription("This action cannot be undone.");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent(
      "This action cannot be undone.",
    );
  });

  it("does not auto-describe a composed Dialog from Content", () => {
    render(() => (
      <DialogTrigger defaultOpen>
        <Button>Open dialog</Button>
        <Dialog>
          <Heading slot="title">Settings</Heading>
          <Content>Body copy is not an accessible description.</Content>
        </Dialog>
      </DialogTrigger>
    ));

    const dialog = screen.getByRole("dialog", { name: "Settings" });
    expect(dialog).not.toHaveAttribute("aria-describedby");
    expect(dialog).not.toHaveAccessibleDescription();
  });

  it("exports CustomDialog and CloseButton composition", async () => {
    const user = setupUser();

    render(() => (
      <DialogTrigger defaultOpen>
        <Button>Open custom</Button>
        <CustomDialog>
          <Heading slot="title">Custom surface</Heading>
          <Content>Custom body</Content>
          <CloseButton />
        </CustomDialog>
      </DialogTrigger>
    ));

    const customDialog = screen.getByRole("dialog", { name: "Custom surface" });
    expect(customDialog).toBeInTheDocument();
    expect(customDialog.getAttribute("class")).not.toContain("comparison-spectrum");
    expect(within(customDialog).getByText("Custom body")).toBeInTheDocument();

    await user.click(within(customDialog).getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("dialog", { name: "Custom surface" })).not.toBeInTheDocument();
  });

  it("exports FullscreenDialog composition", () => {
    render(() => (
      <DialogTrigger defaultOpen>
        <Button>Open fullscreen</Button>
        <FullscreenDialog variant="fullscreenTakeover">
          <Heading slot="title">Fullscreen surface</Heading>
          <Content>Fullscreen body</Content>
        </FullscreenDialog>
      </DialogTrigger>
    ));

    const fullscreenDialog = screen.getByRole("dialog", { name: "Fullscreen surface" });
    expect(fullscreenDialog).toBeInTheDocument();
    expect(fullscreenDialog.getAttribute("class")).not.toContain("comparison-spectrum");
    expect(fullscreenDialog).toHaveAttribute("data-variant", "fullscreenTakeover");
    expect(within(fullscreenDialog).getByText("Fullscreen body")).toBeInTheDocument();
  });

  it("DialogTrigger around Button produces dialog whose aria-labelledby resolves to button in CSR", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<Button>Trigger Button</Button>}
        content={() => (
          <Dialog>
            <p>Body</p>
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    const trigger = document.getElementById(labelledBy!);
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent).toContain("Trigger Button");
  });

  it("DialogTrigger around ActionButton produces dialog whose aria-labelledby resolves to action button in CSR", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<ActionButton>Trigger Action</ActionButton>}
        content={() => (
          <Dialog>
            <p>Body</p>
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    const trigger = document.getElementById(labelledBy!);
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent).toContain("Trigger Action");
  });

  it("DialogTrigger around ToggleButton produces dialog whose aria-labelledby resolves to toggle button in CSR", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<ToggleButton>Trigger Toggle</ToggleButton>}
        content={() => (
          <Dialog>
            <p>Body</p>
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    const trigger = document.getElementById(labelledBy!);
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent).toContain("Trigger Toggle");
  });

  it("DialogTrigger around LinkButton produces dialog whose aria-labelledby resolves to link button in CSR", () => {
    render(() => (
      <DialogTrigger
        defaultOpen
        trigger={<LinkButton href="#test">Trigger Link</LinkButton>}
        content={() => (
          <Dialog>
            <p>Body</p>
          </Dialog>
        )}
      />
    ));

    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");

    expect(labelledBy).toBeTruthy();
    const trigger = document.getElementById(labelledBy!);
    expect(trigger).not.toBeNull();
    expect(trigger?.tagName.toLowerCase()).toBe("a");
    expect(trigger?.textContent).toContain("Trigger Link");
  });
});

afterEach(cleanup);

describe("AlertDialog caller contract", () => {
  it("forwards live caller attributes without replacing the open root or focused child", async () => {
    const [value, setValue] = createSignal<string | undefined>();
    render(() => (
      <>
        <span id="label-A">External A</span>
        <span id="label-B">External B</span>
        <span id="description-A">Description A</span>
        <span id="description-B">Description B</span>
        <span id="details-A">Details A</span>
        <span id="details-B">Details B</span>
        <AlertDialog
          defaultOpen
          title="Generated title"
          id={value() && `dialog-${value()}`}
          data-marker={value()}
          aria-label={value() && `Caller ${value()}`}
          aria-labelledby={value() && `label-${value()}`}
          aria-describedby={value() && `description-${value()}`}
          aria-details={value() && `details-${value()}`}
          {...({ role: "dialog" } as Record<string, unknown>)}
        >
          <span>Generated content</span>
          <input aria-label="Persistent input" />
        </AlertDialog>
      </>
    ));
    const root = screen.getByRole("alertdialog");
    const child = within(root).getByText("Generated content");
    const input = within(root).getByRole("textbox");
    input.focus();
    for (const next of [undefined, "A", "B", undefined, "A"]) {
      setValue(next);
      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBe(root);
        expect(within(root).getByText("Generated content")).toBe(child);
        expect(within(root).getByRole("textbox")).toBe(input);
        expect(input).toHaveFocus();
        expect(root).toHaveAttribute("role", "alertdialog");
        if (next) {
          expect(root).toHaveAttribute("id", `dialog-${next}`);
          expect(root).toHaveAttribute("data-marker", next);
          expect(root).toHaveAttribute("aria-label", `Caller ${next}`);
          expect(root).toHaveAttribute("aria-labelledby", `label-${next}`);
          expect(root).toHaveAttribute("aria-describedby", `description-${next}`);
          expect(root).toHaveAttribute("aria-details", `details-${next}`);
          expect(document.getElementById(root.getAttribute("aria-details")!)).toHaveTextContent(
            `Details ${next}`,
          );
          expect(root).toHaveAccessibleName(`External ${next}`);
          expect(root).toHaveAccessibleDescription(`Description ${next}`);
        } else {
          // The trigger may supply its own generated overlay id.
          expect(root.id).not.toMatch(/^dialog-[AB]$/);
          expect(root).not.toHaveAttribute("data-marker");
          expect(root).not.toHaveAttribute("aria-label");
          expect(root).not.toHaveAttribute("aria-details");
          expect(root).toHaveAccessibleName("Generated title");
          expect(root).toHaveAccessibleDescription("Generated content");
          expect(document.getElementById(root.getAttribute("aria-labelledby")!)).toHaveTextContent(
            "Generated title",
          );
          expect(document.getElementById(root.getAttribute("aria-describedby")!)).toContainElement(
            child,
          );
        }
      });
    }
  });

  it("applies external naming precedence and live explicit label fallback", async () => {
    const [label, setLabel] = createSignal<string | undefined>("Caller name");
    const [labelledby, setLabelledby] = createSignal<string | undefined>("external-name");
    render(() => (
      <>
        <span id="external-name">External name</span>
        <AlertDialog
          defaultOpen
          title="Visible title"
          aria-label={label()}
          aria-labelledby={labelledby()}
        >
          Body copy
        </AlertDialog>
      </>
    ));
    const root = screen.getByRole("alertdialog");
    expect(root).toHaveAccessibleName("External name");
    setLabelledby(undefined);
    await waitFor(() => {
      expect(root).toHaveAccessibleName("Caller name");
      expect(root).not.toHaveAttribute("aria-labelledby");
    });
    setLabel("Updated caller name");
    await waitFor(() => {
      expect(root).toHaveAccessibleName("Updated caller name");
      expect(root).not.toHaveAttribute("aria-labelledby");
      expect(root).toHaveAccessibleDescription("Body copy");
      expect(document.getElementById(root.getAttribute("aria-describedby")!)).toHaveTextContent(
        "Body copy",
      );
    });
  });
});

describe("AlertDialog action ordering", () => {
  it.each(["Cancel", "Archive", "Confirm"])("closes before %s exactly once", async (action) => {
    const user = setupUser();
    const events: string[] = [];
    render(() => (
      <AlertDialog
        defaultOpen
        title="Action order"
        cancelLabel="Cancel"
        secondaryActionLabel="Archive"
        onOpenChange={(open) => {
          if (!open) events.push("close");
        }}
        onCancel={() => events.push("Cancel")}
        onSecondaryAction={() => events.push("Archive")}
        onPrimaryAction={() => events.push("Confirm")}
      >
        Body
      </AlertDialog>
    ));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: action }));
    expect(events).toEqual(["close", action]);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
  it("does not close or call disabled actions", async () => {
    const user = setupUser();
    const events: string[] = [];
    render(() => (
      <AlertDialog
        defaultOpen
        title="Disabled actions"
        secondaryActionLabel="Archive"
        isPrimaryActionDisabled
        isSecondaryActionDisabled
        onOpenChange={() => events.push("change")}
        onSecondaryAction={() => events.push("secondary")}
        onPrimaryAction={() => events.push("primary")}
      >
        Body
      </AlertDialog>
    ));
    const root = screen.getByRole("alertdialog");
    await user.click(within(root).getByRole("button", { name: "Archive" }));
    await user.click(within(root).getByRole("button", { name: "Confirm" }));
    expect(events).toEqual([]);
    expect(screen.getByRole("alertdialog")).toBe(root);
  });
});
