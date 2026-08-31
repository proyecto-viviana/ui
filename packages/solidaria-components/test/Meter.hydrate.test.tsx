/**
 * Hydration half of the Meter server-render regression.
 *
 * This test hydrates the shared Label relationship and checks that the meter
 * and label keep the same ID reference.
 */
import { hydrate } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Label } from "../src/Label";
import { Meter } from "../src/Meter";

function installHydrationGlobals(): void {
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

function MeterFixture() {
  return (
    <Meter value={25}>
      {() => (
        <>
          <Label>Storage space</Label>
          <span>25%</span>
        </>
      )}
    </Meter>
  );
}

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/meter-ssr.html"),
  "utf8",
);

describe("Meter hydration over server markup", () => {
  beforeEach(() => {
    installHydrationGlobals();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates without a mismatch and keeps the label relationship", () => {
    const errors: unknown[][] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args);
    });

    const container = document.createElement("div");
    container.innerHTML = ssrHtml;
    document.body.appendChild(container);

    let thrown: unknown;
    try {
      hydrate(() => <MeterFixture />, container);
    } catch (error) {
      thrown = error;
    }

    errorSpy.mockRestore();

    const meter = container.querySelector<HTMLElement>('[role="meter"]');
    const label = container.querySelector<HTMLElement>("span[id]");
    expect(thrown).toBeUndefined();
    expect(errors).toEqual([]);
    expect(meter).not.toBeNull();
    expect(label).not.toBeNull();
    expect(meter?.getAttribute("aria-labelledby")).toBe(label?.id);
  });
});
