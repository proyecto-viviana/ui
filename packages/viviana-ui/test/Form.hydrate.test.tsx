/**
 * Hydration twin of solid-spectrum Form+TextField (profile shape).
 *
 * Covers `isRequired + description` — the input that desynced hydration keys
 * when mergeProps probed the Label children getter (#184).
 */
import { hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { FormTextFieldFixture } from "./fixtures/form";

function installHydrationGlobals(): void {
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

function hydrateOverSsr(
  ssrFile: string,
  Fixture: () => JSX.Element,
): { thrown: unknown; mismatches: string[]; container: HTMLElement } {
  const messages: string[] = [];
  const capture = (...args: unknown[]) => {
    messages.push(args.map(String).join(" "));
  };
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(capture);
  const errorSpy = vi.spyOn(console, "error").mockImplementation(capture);

  const container = document.createElement("div");
  container.innerHTML = readFileSync(
    resolve(import.meta.dirname, `../../../output/${ssrFile}`),
    "utf8",
  );
  document.body.appendChild(container);

  let thrown: unknown;
  try {
    hydrate(() => <Fixture />, container);
  } catch (err) {
    thrown = err;
  }

  warnSpy.mockRestore();
  errorSpy.mockRestore();
  return {
    thrown,
    mismatches: messages.filter((m) => /Hydration Mismatch|template is not a function/i.test(m)),
    container,
  };
}

describe("viviana-ui Form hydrates over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("Form+TextField (isRequired + description)", () => {
    const r = hydrateOverSsr("viviana-ui-form-textfield-ssr.html", FormTextFieldFixture);
    if (r.thrown) console.log("THROWN viviana-ui Form+TextField:", r.thrown);
    if (r.mismatches.length) console.log("MISMATCH viviana-ui Form+TextField:", r.mismatches);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.textContent).toContain("Nombre");
    expect(r.container.textContent).toContain("Username");
    expect(r.container.querySelector("input")).not.toBeNull();
  });
});
