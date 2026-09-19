import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { createBrowserValue, createHydrationState, useIsSSR } from "../src/ssr";
import { browserFunction, fallbackFunction } from "./fixtures/hydrationHooks";

describe("hydration hooks in a fresh browser owner", () => {
  it("does not report hydration for a purely client-rendered root", () => {
    createRoot((dispose) => {
      try {
        expect(createHydrationState()()).toBe(false);
        expect(useIsSSR()()).toBe(false);
      } finally {
        dispose();
      }
    });
  });

  it("keeps function values intact and computes the browser value only once", () => {
    let dispose = () => {};
    let read = () => fallbackFunction;
    let update = (_value: number) => {};
    const calls: number[] = [];
    try {
      createRoot((cleanup) => {
        dispose = cleanup;
        const [version, setVersion] = createSignal(0);
        update = setVersion;
        read = createBrowserValue(() => {
          calls.push(version());
          return browserFunction;
        }, fallbackFunction);
        expect(read()).toBe(fallbackFunction);
        expect(calls).toEqual([]);
      });
      flush();
      expect(read()).toBe(browserFunction);
      expect(calls).toEqual([0]);
      update(1);
      flush();
      expect(read()).toBe(browserFunction);
      expect(calls).toEqual([0]);
    } finally {
      dispose();
    }
  });
});
