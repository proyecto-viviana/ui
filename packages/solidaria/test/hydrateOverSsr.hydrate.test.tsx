/**
 * Negative proof for the shared hydrate helper: a Solid 2 hydration diagnostic
 * must fail the mismatched hydration without leaking helper-owned DOM/global
 * state into the next valid hydration.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, onCleanup, sharedConfig, type Setter } from "solid-js";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { HydrateOverSsrFixture } from "./fixtures/hydrateOverSsr";

const matching = readFileSync(
  resolve(import.meta.dirname, "../../../output/hydrate-over-ssr.html"),
  "utf8",
);

describe("hydrateOverSsr Solid 2 lifecycle", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("reports a real mismatch and the next hydrate still claims the server nodes", async () => {
    let mismatchedRoot: Element | null = null;
    await expect(
      hydrateOverSsr(matching, () => <HydrateOverSsrFixture mismatch />, {
        beforeHydrate(container) {
          mismatchedRoot = container.firstElementChild;
        },
      }),
    ).rejects.toThrow(/Hydration (?:key miss|tag mismatch|completed with)/i);
    expect(mismatchedRoot).not.toBeNull();
    expect(mismatchedRoot!.isConnected).toBe(false);

    let serverRoot: Element | null = null;
    let serverButton: HTMLButtonElement | null = null;
    const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
      beforeHydrate(container) {
        serverRoot = container.firstElementChild;
        serverButton = container.querySelector("button");
      },
    });

    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.textContent).toContain("ok");
    expect(container.firstElementChild).toBe(serverRoot);
    expect(container.querySelector("button")).toBe(serverButton);
  });

  it("restores globals and removes its container when beforeHydrate throws", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const sentinel = { prior: true };
    hydrationGlobal._$HY = sentinel;
    const previousWarn = console.warn;
    const previousError = console.error;
    const childCount = document.body.childElementCount;

    try {
      await expect(
        hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
          beforeHydrate() {
            throw new Error("beforeHydrate failed");
          },
        }),
      ).rejects.toThrow("beforeHydrate failed");
      expect(console.warn).toBe(previousWarn);
      expect(console.error).toBe(previousError);
      expect(hydrationGlobal._$HY).toBe(sentinel);
      expect(document.body.childElementCount).toBe(childCount);

      const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />);
      expect(container.querySelector("button")).toHaveTextContent("ok");
    } finally {
      if (hadHydrationGlobal) hydrationGlobal._$HY = previousHydrationGlobal;
      else delete hydrationGlobal._$HY;
    }
  });

  it("rejects a nested structure mismatch even when the root and registry match", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const sentinel = { prior: true };
    const previousWarn = console.warn;
    const previousError = console.error;
    const childCount = document.body.childElementCount;
    let capturedContainer: HTMLElement | undefined;
    let serverRoot: Element | null = null;
    let adoptedRoot: Element | null = null;
    let registrySize: number | undefined;

    hydrationGlobal._$HY = sentinel;
    try {
      await expect(
        hydrateOverSsr(matching, () => <HydrateOverSsrFixture structureMismatch />, {
          beforeHydrate(container) {
            capturedContainer = container;
            serverRoot = container.firstElementChild;
          },
          beforeVerify() {
            adoptedRoot = capturedContainer!.firstElementChild;
            registrySize = (sharedConfig as unknown as { registry?: Map<string, Element> }).registry
              ?.size;
          },
        }),
      ).rejects.toThrow(/Hydration structure mismatch: expected <span> as first child/i);
      expect(serverRoot).not.toBeNull();
      expect(adoptedRoot).toBe(serverRoot);
      expect(serverRoot?.querySelector("button")).not.toBeNull();
      expect(registrySize).toBe(0);
      expect(capturedContainer?.isConnected).toBe(false);
      expect(document.body.childElementCount).toBe(childCount);
      expect(console.warn).toBe(previousWarn);
      expect(console.error).toBe(previousError);
      expect(hydrationGlobal._$HY).toBe(sentinel);
      expect(sentinel).toEqual({ prior: true });

      let nextRoot: Element | null = null;
      const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
        beforeHydrate(container) {
          nextRoot = container.firstElementChild;
        },
      });
      expect(container.firstElementChild).toBe(nextRoot);
    } finally {
      if (hadHydrationGlobal) hydrationGlobal._$HY = previousHydrationGlobal;
      else delete hydrationGlobal._$HY;
    }
  });

  it("keeps its hydration globals alive through deferred cleanup when the fixture throws", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const sentinel = { prior: true };
    const fixtureError = new Error("fixture hydration failed");
    const previousWarn = console.warn;
    const previousError = console.error;
    const childCount = document.body.childElementCount;
    let capturedContainer: HTMLElement | undefined;

    hydrationGlobal._$HY = sentinel;
    try {
      await expect(
        hydrateOverSsr(
          matching,
          () => <HydrateOverSsrFixture throwDuringHydration={fixtureError} />,
          {
            beforeHydrate(container) {
              capturedContainer = container;
            },
          },
        ),
      ).rejects.toBe(fixtureError);

      await Promise.resolve();
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(hydrationGlobal._$HY).toBe(sentinel);
      expect(sentinel).toEqual({ prior: true });
      expect(console.warn).toBe(previousWarn);
      expect(console.error).toBe(previousError);
      expect(capturedContainer?.isConnected).toBe(false);
      expect(document.body.childElementCount).toBe(childCount);

      let serverRoot: Element | null = null;
      const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
        beforeHydrate(container) {
          serverRoot = container.firstElementChild;
        },
      });
      expect(container.firstElementChild).toBe(serverRoot);
    } finally {
      if (hadHydrationGlobal) hydrationGlobal._$HY = previousHydrationGlobal;
      else delete hydrationGlobal._$HY;
    }
  });

  it("fails closed when the Solid 2 verifier is unavailable after hydrate", async () => {
    const config = sharedConfig as unknown as { verifyHydration?: () => void };
    const hadVerifier = Object.prototype.hasOwnProperty.call(config, "verifyHydration");
    const previousVerifier = config.verifyHydration;
    try {
      await expect(
        hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
          beforeVerify() {
            config.verifyHydration = undefined;
          },
        }),
      ).rejects.toThrow(/hydration verifier unavailable after hydrate/i);
    } finally {
      if (hadVerifier) config.verifyHydration = previousVerifier;
      else delete config.verifyHydration;
    }
    expect(Object.prototype.hasOwnProperty.call(config, "verifyHydration")).toBe(hadVerifier);
    expect(config.verifyHydration).toBe(previousVerifier);
  });

  it("keeps the prior hydration global untouched through deferred verification", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const sentinel = { prior: true };
    hydrationGlobal._$HY = sentinel;

    try {
      await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />);
      expect(hydrationGlobal._$HY).toBe(sentinel);
      expect(sentinel).toEqual({ prior: true });

      let serverRoot: Element | null = null;
      const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
        beforeHydrate(container) {
          serverRoot = container.firstElementChild;
        },
      });
      expect(container.firstElementChild).toBe(serverRoot);
      expect(hydrationGlobal._$HY).toBe(sentinel);
      expect(sentinel).toEqual({ prior: true });
    } finally {
      if (hadHydrationGlobal) hydrationGlobal._$HY = previousHydrationGlobal;
      else delete hydrationGlobal._$HY;
    }
  });

  it("preserves a hydration diagnostic when disposer cleanup also fails", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const previousWarn = console.warn;
    const previousError = console.error;
    const childCount = document.body.childElementCount;

    await expect(
      hydrateOverSsr(matching, () => <HydrateOverSsrFixture mismatch />, {
        cleanupHydration(dispose) {
          dispose?.();
          throw new Error("forced disposer failure");
        },
      }),
    ).rejects.toThrow(/Hydration (?:key miss|tag mismatch|completed with)/i);
    expect(console.warn).toBe(previousWarn);
    expect(console.error).toBe(previousError);
    expect(hydrationGlobal._$HY).toBe(previousHydrationGlobal);
    expect(document.body.childElementCount).toBe(childCount);
  });

  it("rejects an exact falsy verifier failure and immediately disposes its root", async () => {
    const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
    const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
    const previousHydrationGlobal = hydrationGlobal._$HY;
    const previousWarn = console.warn;
    const previousError = console.error;
    const childCount = document.body.childElementCount;
    let capturedContainer: HTMLElement | undefined;
    let didReject = false;
    let rejection: unknown = Symbol("not rejected");
    let falsyCleanupCount = 0;

    try {
      await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
        beforeHydrate(container) {
          capturedContainer = container;
        },
        beforeVerify() {
          throw undefined;
        },
        cleanupHydration(dispose) {
          expect(typeof dispose).toBe("function");
          dispose!();
          falsyCleanupCount++;
        },
      });
    } catch (error) {
      didReject = true;
      rejection = error;
    }

    expect(didReject).toBe(true);
    expect(rejection).toBeUndefined();
    expect(falsyCleanupCount).toBe(1);
    expect(capturedContainer?.isConnected).toBe(false);
    expect(document.body.childElementCount).toBe(childCount);
    expect(console.warn).toBe(previousWarn);
    expect(console.error).toBe(previousError);
    expect(Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY")).toBe(hadHydrationGlobal);
    expect(hydrationGlobal._$HY).toBe(previousHydrationGlobal);
  });

  it("does not retain a failed root in the shared disposer registry", async () => {
    const registryKey = Symbol.for("proyecto-viviana.test.hydration-disposers");
    const hydrationGlobal = globalThis as unknown as { [registryKey]?: Set<() => void> };
    let failedDisposer: (() => void) | undefined;
    let cleanupCount = 0;
    const verifierError = new Error("failed registry probe");
    await expect(
      hydrateOverSsr(
        matching,
        () => {
          onCleanup(() => cleanupCount++);
          return <HydrateOverSsrFixture />;
        },
        {
          beforeVerify() {
            throw verifierError;
          },
          cleanupHydration(dispose) {
            expect(typeof dispose).toBe("function");
            failedDisposer = dispose;
            dispose!();
          },
        },
      ),
    ).rejects.toBe(verifierError);
    expect(typeof failedDisposer).toBe("function");
    expect(hydrationGlobal[registryKey]?.has(failedDisposer!)).not.toBe(true);
    expect(cleanupCount).toBe(1);
    cleanupHydrationRoots();
    expect(cleanupCount).toBe(1);

    let serverRoot: Element | null = null;
    const container = await hydrateOverSsr(matching, () => <HydrateOverSsrFixture />, {
      beforeHydrate(container) {
        serverRoot = container.firstElementChild;
      },
    });
    expect(container.firstElementChild).toBe(serverRoot);
    expect(cleanupCount).toBe(1);
  });

  it("shared teardown disposes a live root and its listeners exactly once", async () => {
    const lifecycleEvent = "hydrate-over-ssr-lifecycle";
    let cleanupCount = 0;
    let eventCount = 0;
    let effectCount = 0;
    let setLifecycleValue: Setter<number> | undefined;

    const container = await hydrateOverSsr(matching, () => (
      <HydrateOverSsrFixture
        lifecycle={{
          eventType: lifecycleEvent,
          onCleanup: () => cleanupCount++,
          onEvent: () => eventCount++,
          onEffect: () => effectCount++,
          receiveSetter: (setter) => (setLifecycleValue = setter),
        }}
      />
    ));

    document.dispatchEvent(new Event(lifecycleEvent));
    flush();
    expect(container.querySelector("button")).toHaveTextContent("ok");
    expect(cleanupCount).toBe(0);
    expect(eventCount).toBe(1);
    expect(effectCount).toBe(2);
    cleanupHydrationRoots();
    expect(cleanupCount).toBe(1);
    const effectsAfterCleanup = effectCount;

    document.dispatchEvent(new Event(lifecycleEvent));
    setLifecycleValue?.((current) => current + 1);
    flush();

    expect(cleanupCount).toBe(1);
    expect(eventCount).toBe(1);
    expect(effectCount).toBe(effectsAfterCleanup);
    cleanupHydrationRoots();
    expect(cleanupCount).toBe(1);
  });

  it.each([undefined, null, false, 0, ""])(
    "shared teardown preserves the first falsy error (%s) and attempts every root",
    async (firstError) => {
      const cleanupOrder: number[] = [];
      for (let index = 0; index < 3; index++) {
        await hydrateOverSsr(matching, () => {
          onCleanup(() => {
            cleanupOrder.push(index);
            if (index === 0) throw firstError;
            if (index === 1) throw new Error("later cleanup failure");
          });
          return <HydrateOverSsrFixture />;
        });
      }
      let didThrow = false;
      let thrown: unknown = Symbol("not thrown");
      try {
        cleanupHydrationRoots();
      } catch (error) {
        didThrow = true;
        thrown = error;
      }
      expect(didThrow).toBe(true);
      expect(thrown).toBe(firstError);
      expect(cleanupOrder).toEqual([0, 1, 2]);
      expect(() => cleanupHydrationRoots()).not.toThrow();
      expect(cleanupOrder).toEqual([0, 1, 2]);
    },
  );
});
