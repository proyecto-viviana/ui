/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal } from "solid-js";
import { ActionMenu, ActionMenuContext, MenuItem } from "../src/menu";
import { Keyboard, Text } from "../src/text";
import { Provider } from "../src/provider";

const items = [
  { id: "copy", label: "Copy", shortcut: "Cmd+C" },
  { id: "cut", label: "Cut", shortcut: "Cmd+X" },
  { id: "paste", label: "Paste", shortcut: "Cmd+V" },
];

describe("ActionMenu (solid-spectrum)", () => {
  it("renders an S2 action button trigger with the localized default label", () => {
    render(() => <ActionMenu items={items} getKey={(item) => item.id} />);

    const trigger = screen.getByRole("button", { name: "More actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("data-size", "M");
    expect(trigger).not.toHaveAttribute("data-quiet");
    expect(trigger.className).not.toContain("rounded-md transition-colors");

    const circles = Array.from(trigger.querySelectorAll("circle")).map((circle) =>
      circle.getAttribute("cx"),
    );
    expect(circles).toEqual(["10", "4", "4", "16", "16"]);
    expect(trigger.querySelector("path")).toHaveAttribute(
      "d",
      "m10,8.5c-.82843,0-1.5.67157-1.5,1.5s.67157,1.5,1.5,1.5,1.5-.67157,1.5-1.5-.67157-1.5-1.5-1.5Z",
    );
  });

  it("uses the provider locale for the default trigger label", () => {
    render(() => (
      <Provider locale="es-ES">
        <ActionMenu items={items} getKey={(item) => item.id} />
      </Provider>
    ));

    expect(screen.getByRole("button", { name: "Más acciones" })).toBeInTheDocument();
  });

  it("opens with fallback data-driven menu items and fires action keys", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => <ActionMenu items={items} getKey={(item) => item.id} onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(screen.getByRole("menuitem", { name: "Copy" }));

    expect(onAction).toHaveBeenCalledWith("copy");
  });

  it("forwards explicit labelable props and tracks menu-button ARIA state", async () => {
    const user = setupUser();
    render(() => (
      <>
        <span id="actionmenu-label">Document actions</span>
        <span id="actionmenu-description">Available commands</span>
        <ActionMenu
          id="document-action-menu"
          aria-labelledby="actionmenu-label"
          aria-describedby="actionmenu-description"
          items={items}
          getKey={(item) => item.id}
        />
      </>
    ));

    const trigger = screen.getByRole("button", { name: "Document actions" });
    expect(trigger).toHaveAttribute("id", "document-action-menu");
    expect(trigger).toHaveAttribute("aria-label", "More actions");
    expect(trigger).toHaveAttribute("aria-describedby", "actionmenu-description");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).not.toHaveAttribute("aria-controls");

    await user.click(trigger);

    const menu = screen.getByRole("menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
  });

  it("opens from keyboard, moves focus into the menu, closes with Escape, and restores focus", async () => {
    const user = setupUser();
    render(() => <ActionMenu items={items} getKey={(item) => item.id} />);

    const trigger = screen.getByRole("button", { name: "More actions" });
    trigger.focus();

    await user.keyboard("{Enter}");

    const menu = screen.getByRole("menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("closes when pressing outside the menu", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();
    render(() => (
      <>
        <button type="button">Outside target</button>
        <ActionMenu items={items} getKey={(item) => item.id} onOpenChange={onOpenChange} />
      </>
    ));

    const trigger = screen.getByRole("button", { name: "More actions" });
    await user.click(trigger);

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByText("Outside target"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("marks disabled keys and suppresses their actions", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <ActionMenu
        defaultOpen
        disabledKeys={["cut"]}
        items={items}
        getKey={(item) => item.id}
        onAction={onAction}
      />
    ));

    const menu = screen.getByRole("menu");
    const cutItem = within(menu).getByRole("menuitem", { name: "Cut" });
    expect(cutItem).toHaveAttribute("aria-disabled", "true");
    expect(cutItem).toHaveAttribute("data-disabled");

    await user.click(cutItem);
    expect(onAction).not.toHaveBeenCalled();

    await user.click(within(menu).getByRole("menuitem", { name: "Copy" }));
    expect(onAction).toHaveBeenCalledWith("copy");
  });

  it("supports render-function children for compositional menu item content", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <ActionMenu
        defaultOpen
        shouldCloseOnSelect={false}
        items={items}
        getKey={(item) => item.id}
        onAction={onAction}
      >
        {(item) => (
          <MenuItem id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
            <Keyboard>{item.shortcut}</Keyboard>
          </MenuItem>
        )}
      </ActionMenu>
    ));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Cmd+C")).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Copy" }));

    expect(onAction).toHaveBeenCalledWith("copy");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("supports static JSX children for compositional menu item content", async () => {
    const user = setupUser();
    const onAction = vi.fn();
    render(() => (
      <ActionMenu onAction={onAction}>
        <MenuItem id="copy" textValue="Copy">
          <Text slot="label">Copy</Text>
          <Keyboard>Cmd+C</Keyboard>
        </MenuItem>
        <MenuItem id="paste" textValue="Paste" isDisabled>
          <Text slot="label">Paste</Text>
        </MenuItem>
      </ActionMenu>
    ));

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeInTheDocument();
    expect(screen.getByText("Cmd+C")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Paste" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    await user.click(screen.getByRole("menuitem", { name: "Copy" }));

    expect(onAction).toHaveBeenCalledWith("copy");
  });

  it("supports controlled open state callbacks", async () => {
    const user = setupUser();
    const onOpenChange = vi.fn();
    const [isOpen, setIsOpen] = createSignal(false);
    render(() => (
      <ActionMenu
        isOpen={isOpen()}
        onOpenChange={(open) => {
          onOpenChange(open);
          setIsOpen(open);
        }}
        items={items}
        getKey={(item) => item.id}
      />
    ));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("merges ActionMenuContext props, styles, unsafe style, and refs into the trigger", () => {
    let triggerElement: HTMLButtonElement | undefined;
    render(() => (
      <ActionMenuContext.Provider
        value={{
          size: "XL",
          isQuiet: true,
          styles: "generated-action-menu" as never,
          UNSAFE_className: "unsafe-action-menu",
          UNSAFE_style: { margin: "4px" },
          ref: (element) => {
            triggerElement = element;
          },
        }}
      >
        <ActionMenu items={items} getKey={(item) => item.id} />
      </ActionMenuContext.Provider>
    ));

    const trigger = screen.getByRole("button", { name: "More actions" });
    expect(triggerElement).toBe(trigger);
    expect(trigger).toHaveAttribute("data-size", "XL");
    expect(trigger).toHaveAttribute("data-quiet", "true");
    expect(trigger.className).toContain("unsafe-action-menu");
    expect(trigger.className).toContain("generated-action-menu");
    expect(trigger).toHaveStyle({ margin: "4px" });
  });
});
