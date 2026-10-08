/** @vitest-environment jsdom */
import { afterEach, describe, it, expect, vi } from "vite-plus/test";
import { createSignal, onCleanup } from "solid-js";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Button } from "../src/button";
import { Menu, MenuItem, MenuTrigger, Text } from "../src/menu";

// #639: retain original nodes across nonstructural state changes, with live getters.
describe("MenuItem content qualification", () => {
  afterEach(cleanup);

  for (const kind of ["primitive", "slotted", "render-prop", "stateful", "external"] as const) {
    it(`retains ${kind} content through hover, press, focus and external updates`, async () => {
      const user = setupUser();
      const firstAction = vi.fn();
      const latestAction = vi.fn();
      let updateLabel!: (value: string) => void;
      let replaceAction!: () => void;
      let mounts = 0;
      let cleanups = 0;
      let childRef: HTMLSpanElement | undefined;
      function Child() {
        const [value] = createSignal("retained child state");
        mounts++;
        onCleanup(() => cleanups++);
        return (
          <span data-testid="stateful" ref={childRef}>
            {value()}
          </span>
        );
      }
      render(() => {
        const [label, setLabel] = createSignal("Original");
        const [action, setAction] = createSignal({ run: firstAction });
        updateLabel = setLabel;
        replaceAction = () => setAction({ run: latestAction });
        return (
          <Menu aria-label="Identity">
            <MenuItem id="identity" textValue="Original" onAction={action().run}>
              {kind === "primitive" ? (
                "Original"
              ) : kind === "render-prop" ? (
                (state) => (
                  <>
                    <Text slot="label">
                      <span data-testid="label">{label()}</span>
                    </Text>
                    <span
                      data-testid="live"
                      data-pressed={String(state.isPressed)}
                      data-hovered={String(state.isHovered)}
                      data-focused={String(state.isFocused)}
                    >
                      Live state
                    </span>
                  </>
                )
              ) : (
                <>
                  <Text slot="label">
                    <span data-testid="label">{label()}</span>
                  </Text>
                  <Text slot="description">Description</Text>
                  {kind === "stateful" ? <Child /> : null}
                </>
              )}
            </MenuItem>
          </Menu>
        );
      });
      const item = screen.getByRole("menuitem");
      const menu = screen.getByRole("menu");
      const label =
        kind === "primitive"
          ? screen.getByText("Original").firstChild!
          : screen.getByTestId("label");
      const descendants = [...item.querySelectorAll("*")];
      const live = kind === "render-prop" ? screen.getByTestId("live") : null;
      const stateful = childRef;
      const stable = () => {
        expect(screen.getByRole("menuitem")).toBe(item);
        expect(label.isConnected).toBe(true);
        expect(menu.contains(label)).toBe(true);
        expect(item.querySelectorAll("*")).toHaveLength(descendants.length);
        descendants.forEach((node, index) => expect(item.querySelectorAll("*")[index]).toBe(node));
        for (const node of descendants) expect(node.isConnected).toBe(true);
        if (kind === "stateful") {
          expect(childRef).toBe(stateful);
          expect(screen.getByTestId("stateful")).toBe(stateful);
          expect(stateful).toHaveTextContent("retained child state");
          expect([mounts, cleanups]).toEqual([1, 0]);
        }
      };
      stable();
      if (kind !== "primitive") {
        const labelId = item.getAttribute("aria-labelledby");
        expect(labelId).toBeTruthy();
        expect(document.getElementById(labelId!)).toContainElement(label as HTMLElement);
        if (kind !== "render-prop") expect(item).toHaveAccessibleDescription("Description");
      }
      await user.hover(item);
      expect(item).toHaveAttribute("data-hovered");
      if (live) expect(live).toHaveAttribute("data-hovered", "true");
      stable();
      replaceAction();
      await user.pointer({
        target: label instanceof HTMLElement ? label : label.parentElement!,
        keys: "[MouseLeft>]",
      });
      expect(item).toHaveAttribute("data-pressed");
      if (live) expect(live).toHaveAttribute("data-pressed", "true");
      expect(latestAction).not.toHaveBeenCalled();
      stable();
      await user.pointer({ keys: "[/MouseLeft]" });
      expect(item).not.toHaveAttribute("data-pressed");
      if (live) expect(live).toHaveAttribute("data-pressed", "false");
      expect(firstAction).not.toHaveBeenCalled();
      expect(latestAction).toHaveBeenCalledTimes(1);
      stable();
      item.focus();
      await waitFor(() => expect(item).toHaveAttribute("data-focused"));
      expect(item).toHaveFocus();
      if (live) expect(live).toHaveAttribute("data-focused", "true");
      stable();
      if (kind !== "primitive") {
        updateLabel("Updated");
        await waitFor(() => expect(label).toHaveTextContent("Updated"));
        stable();
      }
      await user.keyboard("{Enter}");
      expect(latestAction).toHaveBeenCalledTimes(2);
      expect(firstAction).not.toHaveBeenCalled();
      expect(item).toHaveFocus();
      stable();
      await user.unhover(item);
      expect(item).not.toHaveAttribute("data-hovered");
      if (live) expect(live).toHaveAttribute("data-hovered", "false");
      stable();
      cleanup();
      if (kind === "stateful") expect([mounts, cleanups]).toEqual([1, 1]);
    });
  }

  it("keeps disabled content inert", async () => {
    const user = setupUser();
    const action = vi.fn();
    render(() => (
      <Menu aria-label="Disabled">
        <MenuItem id="disabled" isDisabled onAction={action}>
          <Text slot="label">
            <span>Disabled label</span>
          </Text>
        </MenuItem>
      </Menu>
    ));
    const item = screen.getByRole("menuitem");
    const label = screen.getByText("Disabled label");
    await user.hover(label);
    await user.pointer({ target: label, keys: "[MouseLeft>]" });
    expect(item).not.toHaveAttribute("data-pressed");
    expect(item).not.toHaveAttribute("data-hovered");
    expect(item.contains(label)).toBe(true);
    expect(label.isConnected).toBe(true);
    await user.pointer({ keys: "[/MouseLeft]" });
    item.focus();
    await user.keyboard("{Enter}");
    expect(action).not.toHaveBeenCalled();
  });
});

// Closing is structural: identity is required before action, not after unmount.
describe("MenuItem action close stage", () => {
  afterEach(cleanup);
  for (const input of ["pointer", "keyboard"] as const) {
    it(`closes the managed popup once on ${input} activation`, async () => {
      const user = setupUser();
      const action = vi.fn();
      render(() => (
        <MenuTrigger defaultOpen>
          <Button>Open identity popup</Button>
          <Menu aria-label="Closing">
            <MenuItem id="close" textValue="Close action" onAction={action}>
              <Text slot="label">
                <span>Close action</span>
              </Text>
            </MenuItem>
          </Menu>
        </MenuTrigger>
      ));
      const item = await screen.findByRole("menuitem", { name: "Close action" });
      const label = screen.getByText("Close action");
      if (input === "pointer") {
        await user.pointer({ target: label, keys: "[MouseLeft>]" });
        expect(item).toHaveAttribute("data-pressed");
        expect(item.contains(label)).toBe(true);
        expect(label.isConnected).toBe(true);
        expect(action).not.toHaveBeenCalled();
        await user.pointer({ keys: "[/MouseLeft]" });
      } else {
        item.focus();
        expect(item).toHaveFocus();
        expect(item.contains(label)).toBe(true);
        await user.keyboard("{Enter}");
      }
      expect(action).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    });
  }
});
