/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@solidjs/testing-library";
import { firePointerDown, setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createSignal } from "solid-js";
import packageJson from "../package.json";
import * as actionMenuSubpath from "../src/ActionMenu";
import {
  ActionMenu,
  ActionMenu as SubpathActionMenu,
  ActionMenuContext,
  ContextualHelpPopover,
  Heading as SubpathHeading,
  MenuItem as SubpathMenuItem,
  Text as SubpathText,
  UnavailableMenuItemTrigger,
} from "../src/ActionMenu";
import { Header, Heading, Menu, MenuItem, MenuSection, SubmenuTrigger } from "../src/menu";
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

  it("forwards local trigger ref, styles, aria details, and autoFocus", async () => {
    let triggerElement: HTMLButtonElement | undefined;
    render(() => (
      <>
        <span id="actionmenu-details">Runs on the selected document</span>
        <ActionMenu
          autoFocus
          aria-details="actionmenu-details"
          styles="generated-local-action-menu"
          UNSAFE_className="unsafe-local-action-menu"
          UNSAFE_style={{ margin: "6px" }}
          ref={(element) => {
            triggerElement = element;
          }}
          items={items}
          getKey={(item) => item.id}
        />
      </>
    ));

    const trigger = screen.getByRole("button", { name: "More actions" });
    await waitFor(() => expect(trigger).toHaveFocus());

    expect(triggerElement).toBe(trigger);
    expect(trigger).toHaveAttribute("aria-details", "actionmenu-details");
    expect(trigger.className).toContain("generated-local-action-menu");
    expect(trigger.className).toContain("unsafe-local-action-menu");
    expect(trigger).toHaveStyle({ margin: "6px" });
  });

  it("forwards reactive data attributes to the trigger instead of the menu", async () => {
    const [owner, setOwner] = createSignal("documents");
    render(() => (
      <ActionMenu
        defaultOpen
        data-testid="document-actions-trigger"
        data-owner={owner()}
        items={items}
        getKey={(item) => item.id}
      />
    ));

    const trigger = screen.getByTestId("document-actions-trigger");
    expect(trigger).toHaveAttribute("data-owner", "documents");
    expect(screen.getByRole("menu")).not.toHaveAttribute("data-owner");

    setOwner("archives");

    await waitFor(() => expect(trigger).toHaveAttribute("data-owner", "archives"));
  });

  it("resolves slotted ActionMenuContext props and lets local props override context", () => {
    render(() => (
      <ActionMenuContext.Provider
        value={{
          slots: {
            primary: {
              label: "Context actions",
              size: "XL",
              isQuiet: true,
              "data-context-slot": "primary",
            },
            secondary: {
              label: "Secondary actions",
              isDisabled: true,
            },
          },
        }}
      >
        <ActionMenu
          slot="primary"
          size="S"
          data-local-slot="primary"
          items={items}
          getKey={(item) => item.id}
        />
        <ActionMenu slot={null} label="Local actions" items={items} getKey={(item) => item.id} />
      </ActionMenuContext.Provider>
    ));

    const slottedTrigger = screen.getByRole("button", { name: "Context actions" });
    expect(slottedTrigger).toHaveAttribute("data-size", "S");
    expect(slottedTrigger).toHaveAttribute("data-quiet", "true");
    expect(slottedTrigger).toHaveAttribute("data-context-slot", "primary");
    expect(slottedTrigger).toHaveAttribute("data-local-slot", "primary");

    const localTrigger = screen.getByRole("button", { name: "Local actions" });
    expect(localTrigger).toHaveAttribute("data-size", "M");
    expect(localTrigger).not.toHaveAttribute("data-quiet");
  });

  it("opens from keyboard, moves focus into the menu, closes with Escape, and restores focus", async () => {
    const user = setupUser();
    render(() => <ActionMenu items={items} getKey={(item) => item.id} />);

    const trigger = screen.getByRole("button", { name: "More actions" });
    trigger.focus();

    await user.keyboard("{Enter}");

    const menu = screen.getByRole("menu");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(menu.contains(document.activeElement)).toBe(true));

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
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

    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("marks the popover entering and exiting transition lifecycle", async () => {
    const user = setupUser();
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => 999);

    try {
      render(() => <ActionMenu items={items} getKey={(item) => item.id} />);

      await user.click(screen.getByRole("button", { name: "More actions" }));

      const popover = screen.getByRole("dialog");
      expect(popover).toHaveAttribute("data-entering");
    } finally {
      requestAnimationFrameSpy.mockRestore();
    }

    await user.keyboard("{Escape}");

    const exitingPopover = screen.getByRole("dialog");
    expect(exitingPopover).not.toHaveAttribute("data-entering");
    expect(exitingPopover).toHaveAttribute("data-exiting");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("applies the upstream press scale transform while pressed", () => {
    render(() => <ActionMenu items={items} getKey={(item) => item.id} />);

    const trigger = screen.getByRole("button", { name: "More actions" });
    const rect = {
      width: 96,
      height: 36,
      top: 0,
      right: 96,
      bottom: 36,
      left: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
    const rectSpy = vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(rect);

    try {
      firePointerDown(trigger);

      expect(trigger).toHaveAttribute("data-pressed", "true");
      expect(trigger).toHaveStyle({
        transform: "perspective(36px) translate3d(0, 0, -2px)",
        "will-change": "transform",
      });
    } finally {
      rectSpy.mockRestore();
    }
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

  it("updates data-driven render-function children while the menu is open", async () => {
    const [currentItems, setCurrentItems] = createSignal(items.slice(0, 1));
    render(() => (
      <ActionMenu defaultOpen items={currentItems()} getKey={(item) => item.id}>
        {(item) => (
          <MenuItem id={item.id} textValue={item.label}>
            <Text slot="label">{item.label}</Text>
          </MenuItem>
        )}
      </ActionMenu>
    ));

    expect(screen.getByRole("menuitem", { name: "Copy" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Cut" })).not.toBeInTheDocument();

    setCurrentItems(items.slice(0, 2));

    await waitFor(() => expect(screen.getByRole("menuitem", { name: "Cut" })).toBeInTheDocument());
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

  it("keeps static JSX menu children lazy until the ActionMenu opens", async () => {
    const user = setupUser();
    let staticItemRenderCount = 0;
    function LazyMenuItem() {
      staticItemRenderCount += 1;
      return (
        <MenuItem id="lazy" textValue="Lazy item">
          <Text slot="label">Lazy item</Text>
        </MenuItem>
      );
    }

    render(() => (
      <ActionMenu>
        <LazyMenuItem />
      </ActionMenu>
    ));

    expect(staticItemRenderCount).toBe(0);
    expect(screen.queryByRole("menuitem", { name: "Lazy item" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "More actions" }));

    expect(await screen.findByRole("menuitem", { name: "Lazy item" })).toBeInTheDocument();
    expect(staticItemRenderCount).toBeGreaterThan(0);
  });

  it("supports MenuSection composition inside ActionMenu", () => {
    render(() => (
      <ActionMenu defaultOpen>
        <MenuSection aria-label="Document actions" data-testid="document-actions-section">
          <MenuItem id="copy" textValue="Copy">
            <Text slot="label">Copy</Text>
          </MenuItem>
          <MenuItem id="archive" textValue="Archive">
            <Text slot="label">Archive</Text>
          </MenuItem>
        </MenuSection>
      </ActionMenu>
    ));

    const section = screen.getByTestId("document-actions-section");
    expect(section).toHaveAttribute("data-section");
    expect(within(section).getByRole("menuitem", { name: "Copy" })).toBeInTheDocument();
    expect(within(section).getByRole("menuitem", { name: "Archive" })).toBeInTheDocument();
  });

  it("supports section-level selection inside ActionMenu static composition", async () => {
    const user = setupUser();
    render(() => (
      <ActionMenu defaultOpen label="Format">
        <MenuSection
          selectionMode="multiple"
          defaultSelectedKeys={["bold"]}
          disabledKeys={["italic"]}
          shouldCloseOnSelect={false}
        >
          <MenuItem id="bold" textValue="Bold">
            <Text slot="label">Bold</Text>
          </MenuItem>
          <MenuItem id="italic" textValue="Italic">
            <Text slot="label">Italic</Text>
          </MenuItem>
        </MenuSection>
      </ActionMenu>
    ));

    const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
    const italic = screen.getByRole("menuitemcheckbox", { name: "Italic" });

    expect(bold).toHaveAttribute("aria-checked", "true");
    expect(bold).toHaveAttribute("data-selected", "true");
    expect(bold.querySelector('[data-rsp-slot="selection-indicator"] svg')).toBeInTheDocument();
    expect(italic).toHaveAttribute("aria-checked", "false");
    expect(italic).toHaveAttribute("aria-disabled", "true");
    expect(italic).toHaveAttribute("data-disabled");
    expect(
      italic.querySelector('[data-rsp-slot="selection-indicator"] svg'),
    ).not.toBeInTheDocument();

    await user.click(bold);

    expect(bold).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("styles section header and heading slots inside ActionMenu menus", () => {
    render(() => (
      <ActionMenu defaultOpen menuSize="L" label="Document actions">
        <MenuSection data-testid="document-actions-section">
          <Header data-testid="document-actions-header">
            <Heading level={3}>Document actions</Heading>
          </Header>
          <MenuItem id="copy" textValue="Copy">
            <Text slot="label">Copy</Text>
          </MenuItem>
        </MenuSection>
      </ActionMenu>
    ));

    const section = screen.getByTestId("document-actions-section");
    const header = screen.getByTestId("document-actions-header");
    const heading = screen.getByRole("presentation");

    expect(section.className).toContain("-macro-dynamic");
    expect(header.className).toContain("-macro-dynamic");
    expect(heading).toHaveTextContent("Document actions");
    expect(heading.className).toContain("-macro-static");
    expect(heading.className).not.toContain("text-2xl");
    expect(heading.className).not.toContain("text-primary-100");
  });

  it("renders link-style MenuItems with S2 link-out descriptors inside ActionMenu", () => {
    const visibleDescriptor = render(() => (
      <ActionMenu defaultOpen menuSize="XL" label="Document links">
        <MenuItem
          id="docs"
          textValue="Open docs"
          href="https://example.com/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Text slot="label">Open docs</Text>
        </MenuItem>
      </ActionMenu>
    ));

    const linkItem = screen.getByRole("menuitem", { name: "Open docs" });
    expect(linkItem.tagName).toBe("A");
    expect(linkItem).toHaveAttribute("href", "https://example.com/docs");
    expect(linkItem).toHaveAttribute("target", "_blank");
    expect(linkItem).toHaveAttribute("rel", "noopener noreferrer");

    const descriptor = linkItem.querySelector('[slot="descriptor"]');
    expect(descriptor).toBeInTheDocument();
    expect(descriptor?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(descriptor?.querySelector("svg")).toHaveAttribute("width", "14");

    visibleDescriptor.unmount();

    render(() => (
      <ActionMenu defaultOpen label="Hidden link descriptor" hideLinkOutIcon>
        <MenuItem
          id="hidden-docs"
          textValue="Hidden docs"
          href="https://example.com/hidden"
          target="_blank"
        >
          <Text slot="label">Hidden docs</Text>
        </MenuItem>
      </ActionMenu>
    ));

    const hiddenLinkItem = screen.getByRole("menuitem", { name: "Hidden docs" });
    expect(hiddenLinkItem.querySelector('[slot="descriptor"]')).toBeNull();
  });

  it("passes ActionMenu render state through custom MenuItem roots", () => {
    render(() => (
      <ActionMenu defaultOpen>
        <MenuItem
          id="custom"
          textValue="Custom root"
          isDisabled
          render={(rootProps, renderProps) => {
            const { children, ...rest } = rootProps;
            return (
              <li
                {...rest}
                data-custom-root="true"
                data-render-disabled={renderProps.isDisabled ? "true" : "false"}
              >
                {children}
              </li>
            );
          }}
        >
          <Text slot="label">Custom root</Text>
        </MenuItem>
      </ActionMenu>
    ));

    const customRoot = screen.getByRole("menuitem", { name: "Custom root" });
    expect(customRoot).toHaveAttribute("data-custom-root", "true");
    expect(customRoot).toHaveAttribute("aria-disabled", "true");
    expect(customRoot).toHaveAttribute("data-render-disabled", "true");
  });

  it("supports normal submenu composition inside ActionMenu", async () => {
    const user = setupUser();
    const onSubmenuOpenChange = vi.fn();
    render(() => (
      <ActionMenu defaultOpen menuSize="L" label="Document actions">
        <SubmenuTrigger onOpenChange={onSubmenuOpenChange}>
          <MenuItem id="more" textValue="More options">
            <Text slot="label">More options</Text>
          </MenuItem>
          <Menu aria-label="More options submenu">
            <MenuItem id="rename" textValue="Rename">
              <Text slot="label">Rename</Text>
            </MenuItem>
          </Menu>
        </SubmenuTrigger>
      </ActionMenu>
    ));

    const submenuTrigger = screen.getByRole("menuitem", { name: "More options" });
    expect(submenuTrigger).toHaveAttribute("aria-haspopup", "menu");
    expect(submenuTrigger).not.toHaveAttribute("aria-expanded");

    const descriptor = submenuTrigger.querySelector('[slot="descriptor"]');
    expect(descriptor).toBeInTheDocument();
    expect(descriptor?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(descriptor?.querySelector("svg")).toHaveAttribute("width", "12");

    await user.hover(submenuTrigger);

    await waitFor(() => expect(submenuTrigger).toHaveAttribute("aria-expanded", "true"));
    expect(onSubmenuOpenChange.mock.calls).toContainEqual([true]);
    const submenuId = submenuTrigger.getAttribute("aria-controls");
    expect(submenuId).toBeTruthy();
    const submenu = document.getElementById(submenuId!);
    expect(submenu).toHaveAttribute("role", "menu");
    expect(submenu).toHaveAccessibleName("More options");
    expect(
      within(submenu as HTMLElement).getByRole("menuitem", { name: "Rename" }),
    ).toBeInTheDocument();

    const submenuPopover = screen
      .getAllByRole("dialog")
      .find((dialog) => dialog.getAttribute("data-trigger") === "SubmenuTrigger");
    expect(submenuPopover).toBeInTheDocument();
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

  it("reactively restores omitted trigger defaults", async () => {
    const [label, setLabel] = createSignal<string | undefined>("Document actions");
    const [size, setSize] = createSignal<"XL" | undefined>("XL");
    const [isQuiet, setIsQuiet] = createSignal<boolean | undefined>(true);
    const [isDisabled, setIsDisabled] = createSignal<boolean | undefined>(true);

    render(() => (
      <ActionMenu
        label={label()}
        size={size()}
        isQuiet={isQuiet()}
        isDisabled={isDisabled()}
        items={items}
        getKey={(item) => item.id}
      />
    ));

    const customTrigger = screen.getByRole("button", { name: "Document actions" });
    expect(customTrigger).toHaveAttribute("data-size", "XL");
    expect(customTrigger).toHaveAttribute("data-quiet", "true");
    expect(customTrigger).toBeDisabled();

    setLabel(undefined);
    setSize(undefined);
    setIsQuiet(undefined);
    setIsDisabled(undefined);

    await waitFor(() => {
      const defaultTrigger = screen.getByRole("button", { name: "More actions" });
      expect(defaultTrigger).toHaveAttribute("data-size", "M");
      expect(defaultTrigger).not.toHaveAttribute("data-quiet");
      expect(defaultTrigger).not.toBeDisabled();
    });
  });

  it("cleans up portal menu content and ARIA references on unmount", () => {
    const { container, unmount } = render(() => (
      <ActionMenu defaultOpen items={items} getKey={(item) => item.id} />
    ));

    const trigger = container.querySelector('button[aria-label="More actions"]');
    const menu = screen.getByRole("menu");
    expect(trigger).toBeInstanceOf(HTMLButtonElement);
    expect(menu.id).toBeTruthy();
    expect(trigger).toHaveAttribute("aria-controls", menu.id);

    unmount();

    expect(document.getElementById(menu.id)).toBeNull();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
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

  it("exports the S2 ActionMenu subpath surface", () => {
    const exportsByName = actionMenuSubpath as Record<string, unknown>;

    for (const name of [
      "ActionMenu",
      "ActionMenuContext",
      "MenuItem",
      "MenuTrigger",
      "MenuSection",
      "SubmenuTrigger",
      "UnavailableMenuItemTrigger",
      "Collection",
      "ContextualHelpPopover",
      "Text",
      "Keyboard",
      "Header",
      "Heading",
    ]) {
      expect(exportsByName[name]).toBeDefined();
    }

    const packageExports = packageJson.exports as Record<
      string,
      Record<string, string | undefined>
    >;
    expect(packageExports["./ActionMenu"]).toMatchObject({
      types: "./dist/ActionMenu.d.ts",
      solid: "./dist/ActionMenu.jsx",
      import: "./dist/ActionMenu.js",
      default: "./dist/ActionMenu.js",
    });
  });

  it("supports unavailable menu item composition from the ActionMenu subpath", async () => {
    const user = setupUser();
    render(() => (
      <SubpathActionMenu defaultOpen>
        <UnavailableMenuItemTrigger isUnavailable>
          <SubpathMenuItem id="locked" textValue="Locked action">
            <SubpathText slot="label">Locked action</SubpathText>
          </SubpathMenuItem>
          <ContextualHelpPopover>
            <>
              <SubpathHeading level={2}>Locked action</SubpathHeading>
              <SubpathText>Ask an admin to enable this command.</SubpathText>
            </>
          </ContextualHelpPopover>
        </UnavailableMenuItemTrigger>
      </SubpathActionMenu>
    ));

    const menuItem = screen.getByRole("menuitem", { name: /Locked action/ });
    expect(menuItem).toHaveAttribute("aria-haspopup", "menu");
    expect(menuItem).not.toHaveAttribute("aria-expanded");

    const descriptorId = menuItem.getAttribute("aria-describedby");
    expect(descriptorId).toBeTruthy();
    const descriptor = document.getElementById(descriptorId!);
    expect(descriptor).toBeInTheDocument();
    expect(within(descriptor!).getByRole("img", { name: "Unavailable" })).toBeInTheDocument();

    await user.hover(menuItem);

    await waitFor(() => expect(menuItem).toHaveAttribute("aria-expanded", "true"));
    const helpPopoverId = menuItem.getAttribute("aria-controls");
    expect(helpPopoverId).toBeTruthy();
    const helpPopover = document.getElementById(helpPopoverId!);
    expect(helpPopover).toHaveAttribute("role", "dialog");
    expect(helpPopover).toHaveAttribute("data-trigger", "SubmenuTrigger");
    expect(helpPopover).toHaveAccessibleName("Locked action");

    const heading = within(helpPopover as HTMLElement).getByText("Locked action");
    expect(heading.tagName).toBe("H2");
    expect(helpPopover).toHaveAttribute("aria-labelledby", heading.id);
    expect(heading.getAttribute("class")).toContain("-macro-");
    expect(heading.getAttribute("class")).not.toContain("text-3xl");
    expect(
      within(helpPopover as HTMLElement).getByText("Ask an admin to enable this command."),
    ).toBeInTheDocument();
  });

  it("renders unavailable menu item trigger as a plain item when available", async () => {
    const user = setupUser();
    render(() => (
      <SubpathActionMenu defaultOpen>
        <UnavailableMenuItemTrigger isUnavailable={false}>
          <SubpathMenuItem id="share" textValue="Share">
            <SubpathText slot="label">Share</SubpathText>
          </SubpathMenuItem>
          <ContextualHelpPopover>
            <SubpathHeading level={2}>Share</SubpathHeading>
          </ContextualHelpPopover>
        </UnavailableMenuItemTrigger>
      </SubpathActionMenu>
    ));

    const menuItem = screen.getByRole("menuitem", { name: "Share" });
    expect(menuItem).not.toHaveAttribute("aria-haspopup");
    expect(menuItem).not.toHaveAttribute("aria-describedby");
    expect(menuItem.querySelector('[data-rsp-slot="descriptor"]')).not.toBeInTheDocument();

    await user.hover(menuItem);

    const submenuHelpPopover = screen
      .getAllByRole("dialog")
      .find((dialog) => dialog.getAttribute("data-trigger") === "SubmenuTrigger");
    expect(submenuHelpPopover).toBeUndefined();
  });
});
