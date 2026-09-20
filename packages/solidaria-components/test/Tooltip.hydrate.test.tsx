import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, sharedConfig } from "solid-js";
import { waitFor } from "@solidjs/testing-library";
import { resetTooltipState } from "@proyecto-viviana/solid-stately";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
import { TooltipFixture, tooltipCases } from "./fixtures/tooltip";

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    resetTooltipState();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  }
});

describe("public Tooltip hydration routes", () => {
  for (const kind of tooltipCases) {
    it(`adopts the ${kind} route and owns description, events and cleanup`, async () => {
      const standalone = kind === "standalone";
      const created: Array<{ instance: symbol; hydrating: boolean }> = [];
      const changed: boolean[] = [];
      const disposed: symbol[] = [];
      let setOpen!: (open: boolean) => void;
      let id = "";
      let serverId = "";
      let ref: HTMLInputElement | undefined;
      const selectors = ["[data-tooltip-route]", "[data-tooltip-label]", "[data-tooltip-input]"];
      let nodes: Element[] = [];
      let button: HTMLButtonElement | null = null;
      let wrapper: HTMLElement | null = null;
      let mountNodes: ChildNode[] = [];
      const measure = vi.fn(() => new DOMRect(100, 100, 80, 30));
      const addWindow = vi.spyOn(window, "addEventListener");
      const removeWindow = vi.spyOn(window, "removeEventListener");
      const html = readFileSync(
        resolve(import.meta.dirname, `../../../output/tooltip-${kind}-ssr.html`),
        "utf8",
      );
      const container = await hydrateOverSsr(
        html,
        () => (
          <TooltipFixture
            kind={kind}
            controls={(set) => {
              setOpen = set;
            }}
            changed={(value) => changed.push(value)}
            created={(instance) => created.push({ instance, hydrating: sharedConfig.hydrating })}
            disposed={(instance) => disposed.push(instance)}
            id={(value) => {
              id = value;
            }}
            ref={(element) => {
              ref = element;
            }}
          />
        ),
        {
          beforeHydrate(container) {
            nodes = selectors.map((selector) => container.querySelector(selector)!);
            nodes.forEach((node) => expect(node).not.toBeNull());
            serverId = nodes[2].id;
            expect(serverId).not.toBe("");
            expect(document.querySelector('[role="tooltip"]')).toBeNull();
            if (!standalone) {
              button = container.querySelector<HTMLButtonElement>("[data-tooltip-trigger]")!;
              expect(button).not.toBeNull();
              wrapper = button.parentElement!;
              expect(wrapper.tagName).toBe("SPAN");
              expect(wrapper.style.display).toBe("contents");
              expect(button).not.toHaveAttribute("aria-describedby");
              vi.spyOn(button, "getBoundingClientRect").mockImplementation(measure);
            }
            mountNodes = Array.from(document.body.childNodes);
          },
        },
      );
      const assertIdentity = () => {
        selectors.forEach((selector, index) =>
          expect(container.querySelector(selector)).toBe(nodes[index]),
        );
        expect(ref).toBe(nodes[2]);
        expect(id).toBe(serverId);
        expect(nodes[2].id).toBe(serverId);
        expect(nodes[1]).toHaveAttribute("for", serverId);
        if (button) {
          expect(container.querySelector("[data-tooltip-trigger]")).toBe(button);
          expect(button.parentElement).toBe(wrapper);
        }
      };
      const tooltip = () => document.querySelector<HTMLElement>('[role="tooltip"]');
      assertIdentity();
      const assertDisposedBodies = () => {
        // Render-prop values change while exiting, so distinct bodies may be
        // replaced. Every real instance must be cleaned exactly once.
        expect(disposed).toHaveLength(created.length);
        expect(new Set(disposed).size).toBe(disposed.length);
        for (const { instance } of created) expect(disposed).toContain(instance);
      };
      const assertOpen = async () => {
        await waitFor(() => expect(document.querySelectorAll('[role="tooltip"]')).toHaveLength(1));
        const node = tooltip()!;
        expect(container.contains(node)).toBe(false);
        expect(node).toHaveTextContent("Helpful description");
        expect(node.id).not.toBe("");
        if (standalone) expect(node.id).toBe("standalone-tooltip");
        else {
          if (kind.endsWith("explicit")) expect(node.id).toBe("explicit-tooltip");
          await waitFor(() => expect(button).toHaveAttribute("aria-describedby", node.id));
          expect(document.getElementById(button!.getAttribute("aria-describedby")!)).toBe(node);
        }
        assertIdentity();
        expect(created.every(({ hydrating }) => !hydrating)).toBe(true);
        expect(created.length - disposed.length).toBe(1);
        return node;
      };
      const assertClosed = async () => {
        await waitFor(() => expect(tooltip()).toBeNull());
        if (button) expect(button).not.toHaveAttribute("aria-describedby");
        assertIdentity();
        assertDisposedBodies();
      };
      const first = await assertOpen();
      expect(created).toHaveLength(1);
      if (standalone) setOpen(false);
      else document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      flush();
      await assertClosed();
      expect(first.isConnected).toBe(false);
      expect(changed).toEqual(standalone ? [] : [false]);
      const reopen = async () => {
        const beforeReopen = changed.length;
        const wasFocused = button !== null && document.activeElement === button;
        if (standalone) setOpen(true);
        else {
          button!.blur();
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
          button!.focus();
        }
        flush();
        const node = await assertOpen();
        expect(node).not.toBe(first);
        // Blur requests close even when the preceding scroll already closed it;
        // createOverlayTriggerState forwards requests without deduplicating them.
        expect(changed.slice(beforeReopen)).toEqual(
          standalone ? [] : wasFocused ? [false, true] : [true],
        );
        return node;
      };
      let current = await reopen();
      if (!standalone) {
        const unrelated = document.createElement("div");
        document.body.append(unrelated);
        unrelated.dispatchEvent(new Event("scroll", { bubbles: true }));
        flush();
        expect(tooltip()).toBe(current);
        expect(changed).toEqual([false, true]);
        unrelated.remove();
        nodes[0].dispatchEvent(new Event("scroll", { bubbles: true }));
        flush();
        await assertClosed();
        expect(changed).toEqual([false, true, false]);
        current = await reopen();
      }
      expect(changed).toEqual(standalone ? [] : [false, true, false, false, true]);
      const createdCount = created.length;
      const ownedListeners = addWindow.mock.calls.filter(([event]) =>
        ["scroll", "resize"].includes(event),
      );
      expect(ownedListeners.some(([event]) => event === "scroll")).toBe(true);
      expect(ownedListeners.some(([event]) => event === "resize")).toBe(true);
      cleanupHydrationRoots();
      flush();
      assertDisposedBodies();
      expect(current.isConnected).toBe(false);
      expect(tooltip()).toBeNull();
      if (button) expect(button).not.toHaveAttribute("aria-describedby");
      for (const args of ownedListeners) {
        expect(removeWindow.mock.calls).toContainEqual(args);
      }
      expect(document.body.childNodes).toHaveLength(mountNodes.length);
      mountNodes.forEach((node, index) => expect(document.body.childNodes[index]).toBe(node));
      const changedCount = changed.length;
      const measureCount = measure.mock.calls.length;
      if (wrapper && button) {
        document.body.append(wrapper);
        button.blur();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
        button.focus();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      }
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("resize"));
      await new Promise((resolve) => setTimeout(resolve, 35));
      expect(changed).toHaveLength(changedCount);
      expect(measure).toHaveBeenCalledTimes(measureCount);
      expect(created).toHaveLength(createdCount);
      expect(tooltip()).toBeNull();
    });
  }
});
