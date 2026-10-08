/**
 * Tests for createMenu, createMenuItem, and createMenuTrigger hooks
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createRoot, createSignal, flush } from "solid-js";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import {
  createMenuState,
  createMenuTriggerState,
  type MenuState,
  type MenuTriggerState,
} from "../../solid-stately/src";
import {
  createMenu,
  createMenuItem,
  createMenuTrigger,
  type AriaMenuProps,
  type AriaMenuTriggerProps,
} from "../src/menu";
import { PressEvent } from "../src/interactions/createPress";
import {
  getInteractionModality,
  setInteractionModality,
} from "../src/interactions/createInteractionModality";
import * as selectableList from "../src/selection/createSelectableList";

function mountMenu<T extends { key: string; label: string }>(
  state: MenuState<T>,
  props: AriaMenuProps<T>,
  items?: readonly T[],
): HTMLElement {
  let menuEl: HTMLElement | null = null;
  render(() => {
    const { menuProps } = createMenu(props, state, () => menuEl);
    return (
      <div
        ref={(el) => {
          menuEl = el;
        }}
        {...menuProps}
      >
        {items?.map((item) => {
          let itemEl: HTMLDivElement | undefined;
          const menuItem = createMenuItem({ key: item.key }, state, () => itemEl ?? null);
          return (
            <div
              ref={(el) => {
                itemEl = el;
              }}
              {...menuItem.menuItemProps}
            >
              <span {...menuItem.labelProps}>{item.label}</span>
            </div>
          );
        })}
      </div>
    );
  });
  return screen.getByRole("menu");
}

function pressKey(target: HTMLElement, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe("createMenu", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('returns menu props with role="menu"', () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Actions" }, state);

      expect(menuProps.role).toBe("menu");
      dispose();
    });
  });

  it("sets aria-disabled when disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ isDisabled: true, "aria-label": "Actions" }, state);

      expect(menuProps["aria-disabled"]).toBe("true");
      dispose();
    });
  });

  it('keeps disabledBehavior="selection" items actionable but not selectable on click', () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    let state!: MenuState<(typeof items)[number]>;
    let itemRef!: HTMLDivElement;
    render(() => {
      state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        disabledKeys: ["copy"],
        disabledBehavior: "selection",
        onSelectionChange,
      });
      createMenu({ onAction, "aria-label": "Actions" }, state);
      const item = createMenuItem({ key: "copy" }, state, () => itemRef);
      return (
        <div ref={itemRef} {...item.menuItemProps}>
          <span {...item.labelProps}>Copy</span>
        </div>
      );
    });

    const item = screen.getByRole("menuitemradio", { name: "Copy" });
    expect(item).not.toHaveAttribute("aria-disabled");
    expect(item).not.toHaveAttribute("data-disabled");

    fireEvent.click(item);

    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
    expect(state.isSelected("copy")).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("has tabIndex 0 when not disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Actions" }, state);

      expect(menuProps.tabIndex).toBe(0);
      dispose();
    });
  });

  it("autoFocus true focuses the menu root after the frame-to-timer paint boundary", () => {
    // Mouse-open. A prior detail-0 click leaves virtual modality, and
    // focusSafely waits out transitions in that modality instead of focusing
    // in this paint timer.
    setInteractionModality("pointer");
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];
    let frame: FrameRequestCallback | undefined;
    let timer: TimerHandler | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 91;
    });
    vi.spyOn(window, "setTimeout").mockImplementation(((callback: TimerHandler) => {
      timer = callback;
      return 92;
    }) as typeof window.setTimeout);

    render(() => {
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      let menuEl: HTMLElement | null = null;
      const { menuProps } = createMenu(
        { autoFocus: true, "aria-label": "Actions" },
        state,
        () => menuEl,
      );
      return (
        <div
          ref={(el) => {
            menuEl = el;
          }}
          {...menuProps}
        >
          <div role="menuitem">Copy</div>
          <div role="menuitem">Paste</div>
        </div>
      );
    });

    expect(document.activeElement).toBe(document.body);
    frame?.(0);
    expect(document.activeElement).toBe(document.body);
    if (typeof timer === "function") timer();
    expect(document.activeElement?.getAttribute("role")).toBe("menu");
  });

  it("autoFocus true requests CSS :focus-visible on the menu root", async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    try {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      render(() => {
        const state = createMenuState({
          items,
          getKey: (item) => item.key,
        });
        let menuEl: HTMLElement | null = null;
        const { menuProps } = createMenu(
          { autoFocus: true, "aria-label": "Actions" },
          state,
          () => menuEl,
        );
        return (
          <div
            ref={(el) => {
              menuEl = el;
            }}
            {...menuProps}
          >
            <div role="menuitem">Copy</div>
          </div>
        );
      });

      await waitFor(() => {
        expect(document.activeElement?.getAttribute("role")).toBe("menu");
      });
      expect(focusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ preventScroll: true, focusVisible: true }),
      );
    } finally {
      focusSpy.mockRestore();
    }
  });

  it("calls onAction when Enter is pressed", () => {
    const onAction = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    state.setFocusedKey("copy");
    mountMenu(state, { onAction, "aria-label": "Actions" }, items);
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "Enter" });

    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
  });

  it("passes the activated item's value as the second onAction argument", () => {
    const onAction = vi.fn();
    const items = [
      { key: "copy", label: "Copy", data: 1 },
      { key: "paste", label: "Paste", data: 2 },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    state.setFocusedKey("paste");
    mountMenu(state, { onAction, "aria-label": "Actions" }, items);
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Paste" }), { key: "Enter" });

    // Mirrors useMenuItem performAction onAction(key, item?.value): the value
    // is the collection node's original data object.
    expect(onAction).toHaveBeenCalledWith("paste", items[1]);
  });

  it("does not call onClose for keyboard activation when shouldCloseOnSelect is false", () => {
    const onAction = vi.fn();
    const onClose = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    state.setFocusedKey("copy");
    mountMenu(
      state,
      { onAction, onClose, shouldCloseOnSelect: false, "aria-label": "Actions" },
      items,
    );
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key: "Enter" });

    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("updates selection when Enter is pressed in selection mode", () => {
    const onSelectionChange = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      selectionMode: "single",
      defaultSelectedKeys: ["paste"],
      onSelectionChange,
    });

    state.setFocusedKey("copy");
    mountMenu(state, { "aria-label": "Actions" }, items);
    fireEvent.keyDown(screen.getByRole("menuitemradio", { name: "Copy" }), { key: "Enter" });

    expect(state.isSelected("copy")).toBe(true);
    expect(state.isSelected("paste")).toBe(false);
    // onSelectionChange receives a `Selection` (Set subclass); compare contents.
    expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["copy"]));
  });

  it("calls onClose when Escape is pressed", () => {
    createRoot((dispose) => {
      const onClose = vi.fn();
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ onClose, "aria-label": "Actions" }, state);

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onClose).toHaveBeenCalled();
      dispose();
    });
  });

  it("forwards a bound list onKeyDown tuple and moves focus once", () => {
    const data = { id: "menu-list" };
    const seen: Array<{ data: unknown; event: KeyboardEvent }> = [];
    const real = selectableList.createSelectableList;
    const spy = vi.spyOn(selectableList, "createSelectableList").mockImplementation((options) => {
      const created = real(options);
      return {
        get listProps() {
          const current = created.listProps;
          const inner = current.onKeyDown;
          return {
            ...current,
            onKeyDown: [
              (bound: unknown, event: KeyboardEvent) => {
                seen.push({ data: bound, event });
                if (typeof inner === "function") inner(event);
              },
              data,
            ],
          };
        },
      };
    });

    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });
    const menu = mountMenu(state, { "aria-label": "Actions" }, items);
    try {
      const event = pressKey(menu, "ArrowDown");

      expect(seen).toEqual([{ data, event }]);
      expect(state.focusedKey()).toBe("copy");
    } finally {
      spy.mockRestore();
    }
  });

  it("does not delegate Escape or a disabled menu key to the list handler", () => {
    const data = { id: "menu-list" };
    const seen: KeyboardEvent[] = [];
    const real = selectableList.createSelectableList;
    const spy = vi.spyOn(selectableList, "createSelectableList").mockImplementation((options) => {
      const created = real(options);
      return {
        get listProps() {
          const current = created.listProps;
          return {
            ...current,
            onKeyDown: [
              (_bound: unknown, event: KeyboardEvent) => {
                seen.push(event);
              },
              data,
            ],
          };
        },
      };
    });

    try {
      const items = [{ key: "copy", label: "Copy" }];
      const onClose = vi.fn();
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const menu = mountMenu(state, { onClose, "aria-label": "Actions" }, items);
      const escape = pressKey(menu, "Escape");
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(escape.defaultPrevented).toBe(true);
      expect(seen).toEqual([]);
      expect(state.focusedKey()).toBeNull();

      cleanup();
      const disabled = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const disabledMenu = mountMenu(
        disabled,
        { isDisabled: true, "aria-label": "Actions" },
        items,
      );
      pressKey(disabledMenu, "ArrowDown");
      expect(seen).toEqual([]);
      expect(disabled.focusedKey()).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it("wires visible label props via aria-labelledby", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps, labelProps } = createMenu({ label: "Actions" }, state);
      expect(labelProps.id).toBeDefined();
      expect(menuProps["aria-labelledby"]).toContain(String(labelProps.id));
      dispose();
    });
  });
});

describe("createMenuItem", () => {
  afterEach(() => {
    cleanup();
  });

  it('returns menuitem props with role="menuitem"', () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuItemProps } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps.role).toBe("menuitem");
      dispose();
    });
  });

  for (const key of ["Enter", " "] as const) {
    it(`restores keyboard modality after ${key === " " ? "Space" : "Enter"} clicks the item`, () => {
      setInteractionModality("pointer");
      let modalityDuringAction: ReturnType<typeof getInteractionModality> = "pointer";
      const onAction = vi.fn(() => {
        modalityDuringAction = getInteractionModality();
      });
      const items = [{ key: "copy", label: "Copy" }];
      let itemRef!: HTMLDivElement;

      render(() => {
        const state = createMenuState({
          items,
          getKey: (item) => item.key,
        });
        createMenu({ onAction, "aria-label": "Actions" }, state);
        const item = createMenuItem({ key: "copy" }, state, () => itemRef);
        return (
          <div ref={itemRef} {...item.menuItemProps}>
            <span {...item.labelProps}>Copy</span>
          </div>
        );
      });

      fireEvent.keyDown(screen.getByRole("menuitem", { name: "Copy" }), { key });

      expect(onAction).toHaveBeenCalledWith("copy", items[0]);
      expect(modalityDuringAction).toBe("virtual");
      expect(getInteractionModality()).toBe("keyboard");
    });
  }

  it("activates an item when the pointer is released over it from another origin", () => {
    const onAction = vi.fn();
    const items = [{ key: "copy", label: "Copy" }];
    let itemRef!: HTMLDivElement;

    render(() => {
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      createMenu({ onAction, "aria-label": "Actions" }, state);
      const item = createMenuItem({ key: "copy" }, state, () => itemRef);
      return (
        <div>
          <button type="button">Trigger</button>
          <div ref={itemRef} {...item.menuItemProps}>
            <span {...item.labelProps}>Copy</span>
          </div>
        </div>
      );
    });

    const trigger = screen.getByRole("button", { name: "Trigger" });
    const item = screen.getByRole("menuitem", { name: "Copy" });
    fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0, pointerId: 1 });
    fireEvent.pointerUp(item, { pointerType: "mouse", button: 0, pointerId: 1 });

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
  });

  it("selects once when a different-origin release activates a single-selection item", () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];
    let state!: MenuState<(typeof items)[number]>;
    let itemRef!: HTMLDivElement;

    render(() => {
      state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        onSelectionChange,
      });
      createMenu({ onAction, "aria-label": "Actions" }, state);
      const item = createMenuItem({ key: "copy" }, state, () => itemRef);
      return (
        <div>
          <button type="button">Trigger</button>
          <div ref={itemRef} {...item.menuItemProps}>
            <span {...item.labelProps}>Copy</span>
          </div>
        </div>
      );
    });

    fireEvent.pointerDown(screen.getByRole("button", { name: "Trigger" }), {
      pointerType: "mouse",
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerUp(screen.getByRole("menuitemradio", { name: "Copy" }), {
      pointerType: "mouse",
      button: 0,
      pointerId: 1,
    });

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
    expect(state.isSelected("copy")).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("toggles once when a different-origin release lands on a multiple-selection item", () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];
    let state!: MenuState<(typeof items)[number]>;
    let copyRef!: HTMLDivElement;
    let pasteRef!: HTMLDivElement;

    render(() => {
      state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "multiple",
        defaultSelectedKeys: ["copy"],
        onSelectionChange,
      });
      createMenu({ onAction, "aria-label": "Actions" }, state);
      const copy = createMenuItem({ key: "copy" }, state, () => copyRef);
      const paste = createMenuItem({ key: "paste" }, state, () => pasteRef);
      return (
        <div>
          <div ref={copyRef} {...copy.menuItemProps}>
            <span {...copy.labelProps}>Copy</span>
          </div>
          <div ref={pasteRef} {...paste.menuItemProps}>
            <span {...paste.labelProps}>Paste</span>
          </div>
        </div>
      );
    });

    fireEvent.pointerDown(screen.getByRole("menuitemcheckbox", { name: "Copy" }), {
      pointerType: "mouse",
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerUp(screen.getByRole("menuitemcheckbox", { name: "Paste" }), {
      pointerType: "mouse",
      button: 0,
      pointerId: 1,
    });

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("paste", items[1]);
    expect(state.isSelected("copy")).toBe(true);
    expect(state.isSelected("paste")).toBe(true);
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
  });

  it("sets aria-disabled when disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["copy"],
      });

      const { menuItemProps, isDisabled } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps["aria-disabled"]).toBe("true");
      expect(isDisabled()).toBe(true);
      dispose();
    });
  });

  it("tracks focused state", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { isFocused: isFocusedCopy } = createMenuItem({ key: "copy" }, state);
      const { isFocused: isFocusedPaste } = createMenuItem({ key: "paste" }, state);

      expect(isFocusedCopy()).toBe(false);
      expect(isFocusedPaste()).toBe(false);

      state.setFocused(true);
      state.setFocusedKey("copy");
      expect(isFocusedCopy()).toBe(true);
      expect(isFocusedPaste()).toBe(false);
      dispose();
    });
  });

  it("has tabIndex based on focus state", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuItemProps: copyProps } = createMenuItem({ key: "copy" }, state);
      const { menuItemProps: pasteProps } = createMenuItem({ key: "paste" }, state);

      expect(copyProps.tabIndex).toBe(-1);
      expect(pasteProps.tabIndex).toBe(-1);

      state.setFocusedKey("copy");

      const { menuItemProps: copyPropsAfter } = createMenuItem({ key: "copy" }, state);
      expect(copyPropsAfter.tabIndex).toBe(0);
      dispose();
    });
  });

  it("inherits disabled state from parent menu metadata", () => {
    createRoot((dispose) => {
      const state = createMenuState({
        items: [{ key: "copy", label: "Copy" }],
        getKey: (item) => item.key,
      });

      createMenu({ isDisabled: true, "aria-label": "Actions" }, state);
      const { menuItemProps, isDisabled } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps["aria-disabled"]).toBe("true");
      expect(isDisabled()).toBe(true);
      dispose();
    });
  });

  it("exposes radio semantics for single selection mode", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        defaultSelectedKeys: ["copy"],
      });

      const copy = createMenuItem({ key: "copy" }, state);
      const paste = createMenuItem({ key: "paste" }, state);

      expect(copy.menuItemProps.role).toBe("menuitemradio");
      expect(copy.menuItemProps["aria-checked"]).toBe("true");
      expect(copy.menuItemProps["data-selected"]).toBe("true");
      expect(copy.isSelected()).toBe(true);
      expect(copy.selectionMode()).toBe("single");

      expect(paste.menuItemProps.role).toBe("menuitemradio");
      expect(paste.menuItemProps["aria-checked"]).toBe("false");
      expect(paste.menuItemProps["data-selected"]).toBeUndefined();
      expect(paste.isSelected()).toBe(false);
      dispose();
    });
  });

  it("exposes checkbox semantics for multiple selection mode", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "multiple",
        defaultSelectedKeys: ["copy"],
      });

      const copy = createMenuItem({ key: "copy" }, state);
      const paste = createMenuItem({ key: "paste" }, state);

      expect(copy.menuItemProps.role).toBe("menuitemcheckbox");
      expect(copy.menuItemProps["aria-checked"]).toBe("true");
      expect(copy.isSelected()).toBe(true);
      expect(copy.selectionMode()).toBe("multiple");

      expect(paste.menuItemProps.role).toBe("menuitemcheckbox");
      expect(paste.menuItemProps["aria-checked"]).toBe("false");
      expect(paste.isSelected()).toBe(false);
      dispose();
    });
  });

  it("joins an external aria-describedby ahead of the description slot id", () => {
    render(() => {
      const items = [{ key: "copy", label: "Copy" }];
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const item = createMenuItem({ key: "copy", "aria-describedby": "ext-desc" }, state);
      return (
        <div {...item.menuItemProps}>
          <span {...item.labelProps}>Copy</span>
          <span {...item.descriptionProps}>More about copy</span>
        </div>
      );
    });
    flush();

    const menuitem = screen.getByRole("menuitem", { name: "Copy" });
    const details = screen.getByText("More about copy");
    const describedBy = menuitem.getAttribute("aria-describedby") ?? "";
    const parts = describedBy.split(/\s+/).filter(Boolean);
    expect(parts[0]).toBe("ext-desc");
    expect(parts).toContain(details.id);
  });

  it("keeps an external aria-describedby when no description slot is mounted", () => {
    render(() => {
      const items = [{ key: "copy", label: "Copy" }];
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const item = createMenuItem({ key: "copy", "aria-describedby": "ext-desc" }, state);
      return (
        <div {...item.menuItemProps}>
          <span {...item.labelProps}>Copy</span>
        </div>
      );
    });
    flush();

    expect(screen.getByRole("menuitem", { name: "Copy" })).toHaveAttribute(
      "aria-describedby",
      "ext-desc",
    );
  });

  it("does not treat boolean aria-expanded true as the pinned open string", () => {
    setInteractionModality("keyboard");
    const items = [{ key: "copy", label: "Copy" }];
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });
    state.setFocused(true);
    state.setFocusedKey("copy");
    const [expanded, setExpanded] = createSignal<boolean | "true">(true);
    let item!: ReturnType<typeof createMenuItem>;
    render(() => {
      item = createMenuItem(
        {
          key: "copy",
          "aria-haspopup": "menu",
          get "aria-expanded"() {
            return expanded();
          },
        },
        state,
      );
      return <div {...item.menuItemProps}>Copy</div>;
    });
    flush();

    const menuitem = screen.getByRole("menuitem", { name: "Copy" });
    expect(menuitem).toHaveAttribute("aria-expanded", "true");
    expect(item.isFocusVisible()).toBe(true);
    expect(menuitem).toHaveAttribute("data-focus-visible", "true");

    setExpanded("true");
    flush();
    expect(item.isFocusVisible()).toBe(false);
    expect(menuitem).not.toHaveAttribute("data-focus-visible");
  });
});

describe("createMenu - disabled key navigation", () => {
  afterEach(() => {
    cleanup();
  });

  it("skips disabled keys when navigating with ArrowDown", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
      { key: "item4", label: "Item 4" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item2", "item3"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" });
    state.setFocusedKey("item1");
    expect(state.focusedKey()).toBe("item1");

    pressKey(menu, "ArrowDown");

    expect(state.focusedKey()).toBe("item4");
  });

  it("skips disabled keys when navigating with ArrowUp", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
      { key: "item4", label: "Item 4" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item2", "item3"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" });
    state.setFocusedKey("item4");
    expect(state.focusedKey()).toBe("item4");

    pressKey(menu, "ArrowUp");

    expect(state.focusedKey()).toBe("item1");
  });

  it("skips disabled keys when navigating to Home", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item1"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" });
    state.setFocusedKey("item3");

    pressKey(menu, "Home");

    expect(state.focusedKey()).toBe("item2");
  });

  it("skips disabled keys when navigating to End", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item3"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" });
    state.setFocusedKey("item1");

    pressKey(menu, "End");

    expect(state.focusedKey()).toBe("item2");
  });

  it("does not activate disabled items on Enter", () => {
    const onAction = vi.fn();
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item1"],
    });

    mountMenu(state, { "aria-label": "Test menu", onAction }, items);
    state.setFocusedKey("item1");
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Item 1" }), { key: "Enter" });

    expect(onAction).not.toHaveBeenCalled();
  });

  it("wraps to first non-disabled key when shouldFocusWrap is true", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item1"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu", shouldFocusWrap: true });
    state.setFocusedKey("item3");

    pressKey(menu, "ArrowDown");

    expect(state.focusedKey()).toBe("item2");
  });

  it("wraps from the last item by default, matching RAC useMenu", () => {
    const items = [
      { key: "copy", label: "Copy" },
      { key: "cut", label: "Cut" },
      { key: "paste", label: "Paste" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    const menu = mountMenu(state, { "aria-label": "Actions" });
    state.setFocusedKey("paste");

    const event = pressKey(menu, "ArrowDown");

    expect(event.defaultPrevented).toBe(true);
    expect(state.focusedKey()).toBe("copy");
  });

  it("does not skip disabled keys under disabledBehavior 'selection'", () => {
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
      { key: "item3", label: "Item 3" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item2"],
      disabledBehavior: "selection",
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" });
    state.setFocusedKey("item1");

    pressKey(menu, "ArrowDown");

    expect(state.focusedKey()).toBe("item2");
  });

  it("fires onAction but does not select a disabled-for-selection item on Enter", () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const items = [
      { key: "item1", label: "Item 1" },
      { key: "item2", label: "Item 2" },
    ];

    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      selectionMode: "single",
      disabledKeys: ["item2"],
      disabledBehavior: "selection",
      onSelectionChange,
    });

    mountMenu(state, { "aria-label": "Test menu", onAction }, items);
    state.setFocusedKey("item2");
    fireEvent.keyDown(screen.getByRole("menuitemradio", { name: "Item 2" }), { key: "Enter" });

    expect(onAction).toHaveBeenCalledWith("item2", items[1]);
    expect(state.isSelected("item2")).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});

describe("createMenu - navigation-key consumption", () => {
  afterEach(() => {
    cleanup();
  });

  const threeItems = () => [
    { key: "item1", label: "Item 1" },
    { key: "item2", label: "Item 2" },
    { key: "item3", label: "Item 3" },
  ];

  it("prevents default on an arrow key that moves focus", () => {
    const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" });

    state.setFocusedKey("item1");
    const event = pressKey(menu, "ArrowDown");

    expect(state.focusedKey()).toBe("item2");
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves ArrowDown alone at the last item when wrapping is off", () => {
    const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu", shouldFocusWrap: false });

    state.setFocusedKey("item3");
    const event = pressKey(menu, "ArrowDown");

    expect(state.focusedKey()).toBe("item3");
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves ArrowUp alone at the first item when wrapping is off", () => {
    const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu", shouldFocusWrap: false });

    state.setFocusedKey("item1");
    const event = pressKey(menu, "ArrowUp");

    expect(state.focusedKey()).toBe("item1");
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves Shift+Home alone when nothing is focused", () => {
    const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" });

    expect(state.focusedKey()).toBeNull();
    const event = pressKey(menu, "Home", { shiftKey: true });

    expect(state.focusedKey()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });

  it("moves to the first item on Home without preventing default when selection stays put", () => {
    const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" });

    expect(state.focusedKey()).toBeNull();
    const event = pressKey(menu, "Home");

    // Shared collection Home returns false unless selectOnFocus replaces the
    // selection, so the key still moves focus and is left to bubble.
    expect(state.focusedKey()).toBe("item1");
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("createMenu - page navigation", () => {
  afterEach(() => {
    cleanup();
  });

  const pageItems = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      key: `item${i + 1}`,
      label: `Item ${i + 1}`,
    }));

  it("moves focus down by multiple items on PageDown", () => {
    const items = pageItems(15);
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);
    state.setFocusedKey("item1");
    expect(state.focusedKey()).toBe("item1");

    pressKey(menu, "PageDown");

    const focused = state.focusedKey();
    expect(focused).not.toBe("item1");
    const focusedIndex = items.findIndex((i) => i.key === focused);
    expect(focusedIndex).toBeGreaterThan(0);
  });

  it("moves focus up by multiple items on PageUp", () => {
    const items = pageItems(15);
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);
    state.setFocusedKey("item15");
    expect(state.focusedKey()).toBe("item15");

    pressKey(menu, "PageUp");

    const focused = state.focusedKey();
    expect(focused).not.toBe("item15");
    const focusedIndex = items.findIndex((i) => i.key === focused);
    expect(focusedIndex).toBeLessThan(14);
  });

  it("skips disabled items on PageDown", () => {
    const items = pageItems(15);
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
      disabledKeys: ["item2", "item3", "item4", "item5"],
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);
    state.setFocusedKey("item1");

    pressKey(menu, "PageDown");

    const focused = state.focusedKey();
    expect(["item2", "item3", "item4", "item5"]).not.toContain(focused);
  });

  it("stops at last item on PageDown when near end", () => {
    const items = pageItems(3);
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);
    state.setFocusedKey("item2");

    pressKey(menu, "PageDown");

    expect(state.focusedKey()).toBe("item3");
  });

  it("stops at first item on PageUp when near beginning", () => {
    const items = pageItems(3);
    const state = createMenuState({
      items,
      getKey: (item) => item.key,
    });

    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);
    state.setFocusedKey("item2");

    pressKey(menu, "PageUp");

    expect(state.focusedKey()).toBe("item1");
  });

  it("does not prevent default on PageDown that only moves focus", () => {
    const items = pageItems(15);
    const state = createMenuState({ items, getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);

    state.setFocusedKey("item1");
    const event = pressKey(menu, "PageDown");

    // Page navigation returns the shared navigateToKey result. Menu selection
    // does not follow focus, so the move does not call preventDefault.
    expect(state.focusedKey()).not.toBe("item1");
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves PageDown alone when nothing is focused", () => {
    const items = pageItems(15);
    const state = createMenuState({ items, getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);

    expect(state.focusedKey()).toBeNull();
    const event = pressKey(menu, "PageDown");

    expect(state.focusedKey()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });

  it("leaves PageUp alone when nothing is focused", () => {
    const items = pageItems(15);
    const state = createMenuState({ items, getKey: (item) => item.key });
    const menu = mountMenu(state, { "aria-label": "Test menu" }, items);

    expect(state.focusedKey()).toBeNull();
    const event = pressKey(menu, "PageUp");

    expect(state.focusedKey()).toBeNull();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("createMenu - accessibility warnings", () => {
  afterEach(() => {
    cleanup();
  });

  it("should warn when no label is provided in development", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      // Create menu without label, aria-label, or aria-labelledby
      createMenu({}, state);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Menu requires"));
      dispose();
    });

    warnSpy.mockRestore();
  });

  it("should not warn when aria-label is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      createMenu({ "aria-label": "Actions menu" }, state);

      expect(warnSpy).not.toHaveBeenCalled();
      dispose();
    });

    warnSpy.mockRestore();
  });
});

describe("createMenuTrigger", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  function renderTrigger(props: AriaMenuTriggerProps = {}) {
    let state!: MenuTriggerState;
    let trigger!: ReturnType<typeof createMenuTrigger>;

    render(() => {
      state = createMenuTriggerState(props);
      trigger = createMenuTrigger(props, state);
      const domProps = () => {
        const {
          onPress: _onPress,
          onPressStart: _onPressStart,
          preventFocusOnPress: _preventFocusOnPress,
          ...rest
        } = trigger.menuTriggerProps;
        return rest;
      };
      return (
        <button
          {...domProps()}
          aria-haspopup={trigger.menuTriggerProps["aria-haspopup"]}
          aria-expanded={trigger.menuTriggerProps["aria-expanded"]}
          aria-controls={trigger.menuTriggerProps["aria-controls"]}
          aria-describedby={trigger.menuTriggerProps["aria-describedby"]}
        >
          Trigger
        </button>
      );
    });

    return {
      button: screen.getByRole("button", { name: "Trigger" }),
      state,
      get menuProps() {
        return trigger.menuProps;
      },
    };
  }

  it("links the trigger and menu with the upstream ARIA contract", () => {
    const { button, state, menuProps } = renderTrigger({ type: "menu" });

    expect(button).toHaveAttribute("aria-haspopup", "menu");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-controls");
    expect(menuProps["aria-labelledby"]).toBe(button.id);
    expect(menuProps.autoFocus).toBe(true);

    state.open();
    flush();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", menuProps.id);
  });

  it("opens on mouse press start, focuses the trigger, and focuses the menu root", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const trigger = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);

      trigger.menuTriggerProps.onPressStart?.(new PressEvent("pressstart", "mouse", null, button));

      expect(state.isOpen()).toBe(true);
      expect(state.focusStrategy()).toBeNull();
      expect(trigger.menuProps.autoFocus).toBe(true);
      expect(document.activeElement).toBe(button);
      button.remove();
      dispose();
    });
  });

  it("opens a virtual press at the first item", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const trigger = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);

      trigger.menuTriggerProps.onPressStart?.(
        new PressEvent("pressstart", "virtual", null, button),
      );

      expect(state.focusStrategy()).toBe("first");
      expect(trigger.menuProps.autoFocus).toBe("first");
      button.remove();
      dispose();
    });
  });

  it("waits for touch release and then toggles", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);
      const start = new PressEvent("pressstart", "touch", null, button);
      const release = new PressEvent("press", "touch", null, button);

      menuTriggerProps.onPressStart?.(start);
      expect(state.isOpen()).toBe(false);

      menuTriggerProps.onPress?.(release);
      expect(state.isOpen()).toBe(true);
      expect(document.activeElement).toBe(button);

      menuTriggerProps.onPress?.(release);
      expect(state.isOpen()).toBe(false);
      button.remove();
      dispose();
    });
  });

  it("does not open disabled press or keyboard input", () => {
    const { button, state } = renderTrigger({ isDisabled: true });
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(state.isOpen()).toBe(false);

    const press = createMenuTrigger({ isDisabled: true }, state).menuTriggerProps;
    press.onPressStart?.(new PressEvent("pressstart", "mouse", null, button));
    press.onPress?.(new PressEvent("press", "touch", null, button));
    expect(state.isOpen()).toBe(false);
  });

  it.each([
    ["Enter", false, "first"],
    [" ", false, "first"],
    ["ArrowDown", false, "first"],
    ["ArrowUp", false, "last"],
    ["ArrowDown", true, "first"],
    ["ArrowUp", true, "last"],
  ] as const)("opens press trigger with %s (Alt: %s) at %s", (key, altKey, strategy) => {
    const { button, state } = renderTrigger();
    const event = new KeyboardEvent("keydown", { key, altKey, bubbles: true, cancelable: true });

    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe(strategy);
  });

  it("leaves a handled keyboard event closed", () => {
    const { button, state } = renderTrigger();
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault();

    button.dispatchEvent(event);

    expect(state.isOpen()).toBe(false);
  });

  it("requires Alt for long-press keyboard activation", () => {
    const { button, state } = renderTrigger({ trigger: "longPress" });

    fireEvent.keyDown(button, { key: "Enter" });
    expect(state.isOpen()).toBe(false);

    fireEvent.keyDown(button, { key: "Enter", altKey: true });
    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe("first");
  });

  it("opens a long press at the first item and exposes the localized instruction", () => {
    vi.useFakeTimers();
    const { button, state } = renderTrigger({ trigger: "longPress" });

    fireEvent.pointerDown(button, { pointerType: "touch" });
    vi.advanceTimersByTime(500);

    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe("first");
    const descriptionId = button.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      "Long press or press Alt + ArrowDown to open menu",
    );
  });

  it("opens a context menu at the requested viewport point and removes popup ARIA", () => {
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    const event = new MouseEvent("contextmenu", {
      clientX: 112,
      clientY: 214,
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 112, y: 214 });
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(button).not.toHaveAttribute("aria-expanded");
    expect(button).not.toHaveAttribute("aria-controls");
  });

  it.each([
    ["right click", { button: 2 }],
    ["Control+click", { button: 0, ctrlKey: true }],
  ])("closes an open context menu on a body %s", (_name, pointer) => {
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    fireEvent.contextMenu(button, { clientX: 4, clientY: 6 });
    expect(state.isOpen()).toBe(true);

    fireEvent.mouseDown(document.body, pointer);
    expect(state.isOpen()).toBe(false);
  });

  it("uses a long press to open a context menu on iOS", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("iPhone");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(button, {
      pointerType: "touch",
      clientX: 112,
      clientY: 214,
    });
    vi.advanceTimersByTime(500);

    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 112, y: 214 });
  });

  it("does not open an iOS context menu when the long press is canceled", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("iPhone");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });

    fireEvent.pointerDown(button, { pointerType: "touch" });
    vi.advanceTimersByTime(200);
    fireEvent.pointerCancel(button, { pointerType: "touch" });
    vi.advanceTimersByTime(400);

    expect(state.isOpen()).toBe(false);
  });

  it("uses the trigger center for the macOS Control+Enter fallback", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    fireEvent.keyDown(button, { key: "Enter", ctrlKey: true });
    vi.advanceTimersByTime(10);

    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 120, y: 210 });
  });

  it("does not double-open when macOS Control+Enter also fires contextmenu", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    const open = vi.spyOn(state, "open");

    fireEvent.keyDown(button, { key: "Enter", ctrlKey: true });
    fireEvent.contextMenu(button, { clientX: 4, clientY: 6 });
    vi.advanceTimersByTime(10);

    expect(state.isOpen()).toBe(true);
    expect(open).toHaveBeenCalledTimes(1);
  });
});

describe("createMenuItem virtualized position", () => {
  it("sets aria-posinset and aria-setsize from the collection index", () => {
    createRoot((dispose) => {
      const items = [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
      ];
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const { menuItemProps } = createMenuItem({ key: "c", isVirtualized: true }, state);

      expect(menuItemProps["aria-posinset"]).toBe(3);
      expect(menuItemProps["aria-setsize"]).toBe(3);
      dispose();
    });
  });

  it("omits aria-posinset and aria-setsize when the item is not virtualized", () => {
    createRoot((dispose) => {
      const items = [
        { key: "a", label: "A" },
        { key: "b", label: "B" },
        { key: "c", label: "C" },
      ];
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      const { menuItemProps } = createMenuItem({ key: "c" }, state);

      expect(menuItemProps["aria-posinset"]).toBeUndefined();
      expect(menuItemProps["aria-setsize"]).toBeUndefined();
      dispose();
    });
  });
});
