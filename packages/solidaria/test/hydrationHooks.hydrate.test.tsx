import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, sharedConfig, type Accessor } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { setInteractionModality } from "../src/interactions/createInteractionModality";
import { clearAutoFocusQueue } from "../src/focus/createAutoFocus";
import { clearFocusStack, type FocusRestoreResult } from "../src/focus/createFocusRestore";
import type { FocusHookProbe } from "./fixtures/hydrationHooks";
import type { FocusManager } from "../src/focus/FocusScope";
import {
  browserFunction,
  fallbackFunction,
  focusHookCases,
  FocusHookFixture,
  FocusScopeFixture,
  hookCases,
  HydrationHookFixture,
  scopeModes,
} from "./fixtures/hydrationHooks";

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    clearAutoFocusQueue();
    clearFocusStack();
    document.body.innerHTML = "";
  }
});

describe("focus hook owner hydration parity", () => {
  for (const kind of focusHookCases) {
    it(`adopts ${kind}'s following ID and preserves enabled browser behavior`, async () => {
      setInteractionModality("keyboard");
      let node!: HTMLDivElement;
      let serverId = "";
      let computedId = "";
      let adopted: HTMLDivElement | undefined;
      let restore: FocusRestoreResult | undefined;
      let virtual: Parameters<NonNullable<FocusHookProbe["virtual"]>>[0] | undefined;
      const initialSaved: Array<HTMLElement | null> = [];
      const focused: Array<{ element: HTMLElement; hydrating: boolean }> = [];
      const restored: HTMLElement[] = [];
      const trigger = document.createElement("button");
      const html = readFileSync(
        resolve(import.meta.dirname, `../../../output/hook-${kind}-ssr.html`),
        "utf8",
      );
      const container = await hydrateOverSsr(
        html,
        () => (
          <FocusHookFixture
            kind={kind}
            id={(id) => {
              computedId = id;
            }}
            ref={(element) => {
              adopted = element;
            }}
            restore={(api) => {
              restore = api;
              initialSaved.push(api.getSavedElement());
            }}
            virtual={(api) => {
              virtual = api;
            }}
            focused={(element) => focused.push({ element, hydrating: sharedConfig.hydrating })}
            restored={(element) => restored.push(element)}
          />
        ),
        {
          beforeHydrate(container) {
            node = container.querySelector("[data-focus-hook]")!;
            expect(node).not.toBeNull();
            serverId = node.id;
            expect(serverId).not.toBe("");
            if (kind === "focus-restore") {
              document.body.appendChild(trigger);
              trigger.focus();
              expect(document.activeElement).toBe(trigger);
            }
          },
        },
      );
      expect(adopted).toBe(node);
      expect(container.querySelector("[data-focus-hook]")).toBe(node);
      expect(computedId).toBe(serverId);
      expect(node.id).toBe(serverId);
      if (kind === "auto-focus") {
        expect(focused).toEqual([{ element: node, hydrating: false }]);
        expect(document.activeElement).toBe(node);
      } else if (kind === "focus-restore") {
        expect(initialSaved).toEqual([null]);
        expect(restore!.getSavedElement()).toBe(trigger);
        node.focus();
        expect(document.activeElement).toBe(node);
        expect(restore!.restore()).toBe(true);
        expect(document.activeElement).toBe(trigger);
        expect(restored).toEqual([trigger]);
        restore!.clear();
        expect(restore!.getSavedElement()).toBeNull();
        node.focus();
        expect(restore!.restore()).toBe(false);
        expect(document.activeElement).toBe(node);
        expect(restored).toEqual([trigger]);
      } else {
        expect(virtual!.focusedKey()).toBeNull();
        expect(node).not.toHaveAttribute("aria-activedescendant");
        node.focus();
        for (const [key, expected] of [
          ["ArrowDown", "one"],
          ["ArrowDown", "three"],
          ["ArrowUp", "one"],
        ]) {
          const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
          node.dispatchEvent(event);
          flush();
          expect(event.defaultPrevented).toBe(true);
          expect(virtual!.focusedKey()).toBe(expected);
          expect(node).toHaveAttribute("aria-activedescendant", `item-${expected}`);
          expect(document.activeElement).toBe(node);
          expect(container.querySelector("[data-focus-hook]")).toBe(node);
        }
      }
    });
  }
});

describe("FocusScope hydration structure and behavior", () => {
  // Autofocus runs after a paint frame and its following timer; restoration
  // may also wait a frame. Keep the real-timer hydration barrier independent.
  const afterPaint = () =>
    new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

  for (const mode of scopeModes) {
    it(`adopts the ${mode} scope and preserves its focus contract`, async () => {
      setInteractionModality("keyboard");
      const trigger = document.createElement("button");
      const outside = document.createElement("button");
      document.body.append(trigger, outside);
      let manager: FocusManager | undefined;
      let id = "";
      let serverId = "";
      let adopted: HTMLInputElement | undefined;
      let reveal!: (visible: boolean) => void;
      let add!: (visible: boolean) => void;
      const selectors = [
        "[data-focus-scope-start]",
        "[data-scope-label]",
        "[data-scope-first]",
        "[data-scope-disabled]",
        "[data-scope-last]",
        "[data-focus-scope-end]",
      ];
      let nodes: HTMLElement[] = [];
      const html = readFileSync(
        resolve(import.meta.dirname, `../../../output/focus-scope-${mode}-ssr.html`),
        "utf8",
      );
      const container = await hydrateOverSsr(
        html,
        () => (
          <FocusScopeFixture
            mode={mode}
            manager={(value) => {
              manager = value;
            }}
            id={(value) => {
              id = value;
            }}
            ref={(node) => {
              adopted = node;
            }}
            reveal={(setter) => {
              reveal = setter;
            }}
            add={(setter) => {
              add = setter;
            }}
          />
        ),
        {
          beforeHydrate(container) {
            nodes = selectors.map((selector) => {
              const node = container.querySelector<HTMLElement>(selector);
              expect(node).not.toBeNull();
              return node!;
            });
            serverId = nodes[2].id;
            expect(serverId).not.toBe("");
            trigger.focus();
            expect(document.activeElement).toBe(trigger);
          },
        },
      );
      const [start, label, first, disabled, last, end] = nodes;
      const assertAdopted = () => {
        for (let i = 0; i < selectors.length; i++) {
          expect(container.querySelector(selectors[i])).toBe(nodes[i]);
        }
        expect(adopted).toBe(first);
        expect(id).toBe(serverId);
        expect(first.id).toBe(serverId);
        expect(label).toHaveAttribute("for", serverId);
        expect(start).toHaveAttribute("hidden");
        expect(end).toHaveAttribute("hidden");
        expect(disabled).toBeDisabled();
      };
      assertAdopted();
      expect(manager).toBeDefined();
      await afterPaint();
      flush();
      expect(document.activeElement).toBe(mode === "enabled" ? first : trigger);
      expect(manager!.focusFirst()).toBe(first);
      expect(document.activeElement).toBe(first);
      expect(manager!.focusNext()).toBe(last);
      expect(document.activeElement).toBe(last);

      const forward = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
      last.dispatchEvent(forward);
      flush();
      expect(forward.defaultPrevented).toBe(mode === "enabled");
      expect(document.activeElement).toBe(mode === "enabled" ? first : last);
      first.focus();
      const reverse = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      });
      first.dispatchEvent(reverse);
      flush();
      expect(reverse.defaultPrevented).toBe(mode === "enabled");
      expect(document.activeElement).toBe(mode === "enabled" ? last : first);

      add(true);
      flush();
      // MutationObserver re-collects the new direct sibling between sentinels.
      await Promise.resolve();
      flush();
      const extra = container.querySelector<HTMLElement>("[data-scope-extra]");
      expect(extra).not.toBeNull();
      expect(manager!.focusLast()).toBe(extra);
      expect(document.activeElement).toBe(extra);
      assertAdopted();

      reveal(false);
      flush();
      for (const node of [...nodes, extra!]) expect(node.isConnected).toBe(false);
      await afterPaint();
      expect(document.activeElement).toBe(mode === "enabled" ? trigger : document.body);
      outside.focus();
      await afterPaint();
      expect(document.activeElement).toBe(outside);
    });
  }
});

describe("hook owner hydration parity", () => {
  for (const kind of hookCases) {
    it(`adopts ${kind}'s following ID and retains its client behavior`, async () => {
      setInteractionModality("pointer");
      let node!: Element;
      let adopted: Element | undefined;
      let followingId = "";
      let read!: Accessor<unknown>;
      let update!: (value: number) => void;
      let reveal!: (visible: boolean) => void;
      const calls: Array<{ value: number; hydrating: boolean }> = [];
      const cleanups: number[] = [];
      const states: unknown[] = [];
      const html = readFileSync(
        resolve(import.meta.dirname, `../../../output/hook-${kind}-ssr.html`),
        "utf8",
      );
      const container = await hydrateOverSsr(
        html,
        () => (
          <HydrationHookFixture
            kind={kind}
            id={(id) => {
              followingId = id;
            }}
            ref={(element) => {
              adopted = element;
            }}
            state={(accessor) => {
              read = accessor;
              states.push(read());
            }}
            update={(setter) => {
              update = setter;
            }}
            reveal={(setter) => {
              reveal = setter;
            }}
            ran={(value) => calls.push({ value, hydrating: sharedConfig.hydrating })}
            cleaned={(value) => cleanups.push(value)}
          />
        ),
        {
          beforeHydrate(container) {
            node = container.querySelector("[data-hook]")!;
            expect(node).not.toBeNull();
          },
        },
      );
      expect(adopted).toBe(node);
      expect(container.querySelector("[data-hook]")).toBe(node);
      expect(followingId).toBe(node.id);
      if (kind === "focus-visible" || kind === "keyboard-focused") {
        expect(read()).toBe(false);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
        flush();
        expect(read()).toBe(true);
        expect(node).toHaveTextContent("true");
        document.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" }),
        );
        flush();
        expect(read()).toBe(false);
      } else if (kind === "hydration-state" || kind === "is-ssr") {
        expect(states).toEqual([true]);
        expect(read()).toBe(false);
        expect(node).toHaveTextContent("false");
      } else {
        expect(calls).toEqual([{ value: 0, hydrating: false }]);
        expect(read()).toBe(
          kind === "browser-function" ? browserFunction : kind === "browser-value" ? "browser" : 0,
        );
        if (kind === "browser-function") expect(states).toEqual([fallbackFunction]);
        update(1);
        flush();
        if (kind === "browser-effect") {
          expect(calls).toEqual([
            { value: 0, hydrating: false },
            { value: 1, hydrating: false },
          ]);
          expect(cleanups).toEqual([0]);
        } else {
          expect(calls).toHaveLength(1); // Value remains a one-time browser computation.
        }
      }
      expect(container.querySelector("[data-hook]")).toBe(node);
      reveal(false);
      flush();
      expect(container.querySelector("[data-hook]")).toBeNull();
      if (kind === "browser-effect") expect(cleanups).toEqual([0, 1]);
      reveal(true);
      flush();
      const remounted = container.querySelector("[data-hook]");
      expect(remounted).not.toBeNull();
      expect(remounted).not.toBe(node);
      expect(remounted).toBe(adopted);
      expect(remounted!.id).toBe(followingId);
      expect(remounted!.id).not.toBe("");
      if (kind === "hydration-state" || kind === "is-ssr") expect(states).toEqual([true, false]);
      if (kind === "browser-function") {
        expect(states).toEqual([fallbackFunction, fallbackFunction]);
        expect(read()).toBe(browserFunction);
        expect(calls).toEqual([
          { value: 0, hydrating: false },
          { value: 0, hydrating: false },
        ]);
      }
      if (kind === "browser-value") {
        expect(states).toEqual(["fallback", "fallback"]);
        expect(read()).toBe("browser");
        expect(calls).toEqual([
          { value: 0, hydrating: false },
          { value: 0, hydrating: false },
        ]);
      }
      cleanupHydrationRoots();
      if (kind === "browser-effect") expect(cleanups).toEqual([0, 1, 0]);
      if (kind === "focus-visible" || kind === "keyboard-focused") {
        setInteractionModality("keyboard");
        flush();
        expect(read()).toBe(false); // Disposed subscriptions no longer update.
      }
    });
  }
});
