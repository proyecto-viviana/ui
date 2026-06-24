import { describe, expect, it, vi } from "vitest";
import { createSignal, type JSX } from "solid-js";
import { render, screen } from "@solidjs/testing-library";
import {
  ActionButton,
  ActionButtonContext,
  ActionButtonGroup,
  ActionButtonGroupContext,
  Avatar,
  Button,
  ButtonContext,
  ButtonGroup,
  ButtonGroupContext,
  Image,
  LinkButton,
  NotificationBadge,
  Provider,
  Text,
  ToggleButton,
  ToggleButtonContext,
  ToggleButtonGroup,
  ToggleButtonGroupContext,
} from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

function solidHelperTextChild(label: string): JSX.Element {
  return [label] as unknown as JSX.Element;
}

describe("button-family S2 contexts", () => {
  it("applies ButtonGroupContext to grouped Button and LinkButton children", () => {
    render(() => (
      <ButtonGroupContext.Provider value={{ size: "XL", isDisabled: true }}>
        <ButtonGroup>
          <Button>Save</Button>
          <LinkButton href="/docs">Docs</LinkButton>
        </ButtonGroup>
      </ButtonGroupContext.Provider>
    ));

    const button = screen.getByRole("button", { name: "Save" });
    const link = screen.getByRole("link", { name: "Docs" });

    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("data-size");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).not.toHaveAttribute("data-size");
  });

  it("merges local and context refs for Button", () => {
    const contextRef = vi.fn();
    const localRef = vi.fn();

    render(() => (
      <ButtonContext.Provider value={{ ref: contextRef }}>
        <Button ref={localRef}>Save</Button>
      </ButtonContext.Provider>
    ));

    const button = screen.getByRole("button", { name: "Save" });
    expect(contextRef).toHaveBeenCalledWith(button);
    expect(localRef).toHaveBeenCalledWith(button);
  });

  it("allows ButtonGroupContext to hide the group like React Spectrum S2", () => {
    render(() => (
      <ButtonGroupContext.Provider value={{ isHidden: true }}>
        <ButtonGroup>
          <Button>Hidden</Button>
        </ButtonGroup>
      </ButtonGroupContext.Provider>
    ));

    expect(screen.queryByRole("button", { name: "Hidden" })).toBeNull();
  });

  it("applies ActionButtonContext to standalone ActionButtons", () => {
    render(() => (
      <ActionButtonContext.Provider value={{ size: "XL", isDisabled: true }}>
        <ActionButton>Inspect</ActionButton>
      </ActionButtonContext.Provider>
    ));

    const button = screen.getByRole("button", { name: "Inspect" });
    expect(button).toBeDisabled();
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-quiet");
  });

  it("provides S2 child composition contexts inside ActionButton", () => {
    render(() => (
      <ActionButton>
        <Avatar alt="Alana" />
        <Text>Review</Text>
        <Image alt="Preview" src="/preview.png" />
        <NotificationBadge value={2} />
      </ActionButton>
    ));

    const button = screen.getByRole("button", { name: /Review/ });
    const text = screen.getByText("Review");
    const avatar = button.querySelector('[slot="avatar"]');
    const image = screen.getByRole("img", { name: "Preview" });

    expect(text).toHaveAttribute("data-rsp-slot", "text");
    expect(avatar).not.toBeNull();
    expect(button).toContainElement(image);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("wraps Solid helper string-array children in S2 text slots", () => {
    render(() => (
      <>
        <Button>{solidHelperTextChild("Save")}</Button>
        <LinkButton href="/docs">{solidHelperTextChild("Docs")}</LinkButton>
        <ActionButton>{solidHelperTextChild("Inspect")}</ActionButton>
        <ToggleButton>{solidHelperTextChild("Bold")}</ToggleButton>
      </>
    ));

    const button = screen.getByRole("button", { name: "Save" });
    const link = screen.getByRole("link", { name: "Docs" });
    const actionButton = screen.getByRole("button", { name: "Inspect" });
    const toggleButton = screen.getByRole("button", { name: "Bold" });

    expect(button.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Save");
    expect(link.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Docs");
    expect(actionButton.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Inspect");
    expect(toggleButton.querySelector('[data-rsp-slot="text"]')?.textContent).toBe("Bold");
  });

  it("localizes Button family pending progress labels from S2 intl strings", () => {
    render(() => (
      <Provider locale="es-ES">
        <Button isPending>Guardar</Button>
        <ActionButton isPending>Inspeccionar</ActionButton>
      </Provider>
    ));

    expect(screen.getAllByRole("progressbar", { name: "pendiente", hidden: true })).toHaveLength(2);
  });

  it("localizes indicator-only notification badges", () => {
    render(() => (
      <Provider locale="es-ES">
        <NotificationBadge />
      </Provider>
    ));

    expect(screen.getByRole("img", { name: "Nueva actividad" })).toBeInTheDocument();
  });

  it("keeps ActionButton dynamic aria trigger props reactive", async () => {
    const user = setupUser();

    function MenuTriggerButton() {
      const [isOpen, setIsOpen] = createSignal(false);

      return (
        <ActionButton
          aria-label={isOpen() ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen()}
          onPress={() => setIsOpen(!isOpen())}
        >
          Menú
        </ActionButton>
      );
    }

    render(() => <MenuTriggerButton />);
    const button = screen.getByRole("button", { name: "Abrir menú" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    await user.click(button);
    expect(screen.getByRole("button", { name: "Cerrar menú" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("applies ActionButtonGroupContext to the group and its children", () => {
    render(() => (
      <ActionButtonGroupContext.Provider
        value={{ size: "XL", density: "compact", orientation: "vertical", isQuiet: true }}
      >
        <ActionButtonGroup aria-label="Actions">
          <ActionButton>Copy</ActionButton>
        </ActionButtonGroup>
      </ActionButtonGroupContext.Provider>
    ));

    const toolbar = screen.getByRole("toolbar", { name: "Actions" });
    const button = screen.getByRole("button", { name: "Copy" });

    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
    expect(toolbar).not.toHaveAttribute("data-density");
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-quiet");
  });

  it("uses Toolbar behavior for ActionButtonGroup arrow navigation", async () => {
    const user = setupUser();
    render(() => (
      <ActionButtonGroup aria-label="Actions">
        <ActionButton>Copy</ActionButton>
        <ActionButton>Paste</ActionButton>
      </ActionButtonGroup>
    ));

    const copy = screen.getByRole("button", { name: "Copy" });
    const paste = screen.getByRole("button", { name: "Paste" });

    copy.focus();
    await user.keyboard("{ArrowRight}");

    expect(document.activeElement).toBe(paste);
  });

  it("omits toolbar orientation when ActionButtonGroup is nested as a group", () => {
    render(() => (
      <ActionButtonGroup aria-label="Outer actions">
        <ActionButton>Copy</ActionButton>
        <ActionButtonGroup aria-label="Nested actions">
          <ActionButton>Paste</ActionButton>
        </ActionButtonGroup>
      </ActionButtonGroup>
    ));

    const nested = screen.getByRole("group", { name: "Nested actions" });

    expect(nested).not.toHaveAttribute("aria-orientation");
    expect(nested).toHaveAttribute("data-orientation", "horizontal");
  });

  it("applies ToggleButtonContext to standalone ToggleButtons", () => {
    render(() => (
      <ToggleButtonContext.Provider value={{ size: "XL", isSelected: true }}>
        <ToggleButton>Bold</ToggleButton>
      </ToggleButtonContext.Provider>
    ));

    const button = screen.getByRole("button", { name: "Bold" });
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(button).not.toHaveAttribute("data-size");
    expect(button).not.toHaveAttribute("data-emphasized");
  });

  it("applies ToggleButtonGroupContext to selection state and child styling", () => {
    render(() => (
      <ToggleButtonGroupContext.Provider
        value={{ size: "XL", isEmphasized: true, defaultSelectedKeys: ["left"] }}
      >
        <ToggleButtonGroup aria-label="Alignment" selectionMode="single">
          <ToggleButton id="left">Left</ToggleButton>
          <ToggleButton id="right">Right</ToggleButton>
        </ToggleButtonGroup>
      </ToggleButtonGroupContext.Provider>
    ));

    const left = screen.getByRole("radio", { name: "Left" });
    expect(left).toHaveAttribute("aria-checked", "true");
    expect(left).not.toHaveAttribute("data-size");
    expect(left).not.toHaveAttribute("data-emphasized");
  });
});
