import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, sharedConfig, type Accessor } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { setInteractionModality } from "../src/interactions/createInteractionModality";
import {
  browserFunction,
  fallbackFunction,
  hookCases,
  HydrationHookFixture,
} from "./fixtures/hydrationHooks";

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    document.body.innerHTML = "";
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
