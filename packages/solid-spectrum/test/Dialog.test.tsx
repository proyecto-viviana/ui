/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { createSignal } from "solid-js";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
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
    expect(dialog).toHaveClass(/comparison-spectrum-Dialog/);
    expect(within(dialog).getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Archive" }));
    expect(actions).toEqual(["secondary"]);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
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
    expect(customDialog).toHaveClass(/comparison-spectrum-CustomDialog/);
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
    expect(fullscreenDialog).toHaveClass(/comparison-spectrum-FullscreenDialog/);
    expect(fullscreenDialog).toHaveAttribute("data-variant", "fullscreenTakeover");
    expect(within(fullscreenDialog).getByText("Fullscreen body")).toBeInTheDocument();
  });
});
