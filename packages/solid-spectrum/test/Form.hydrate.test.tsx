/**
 * Hydration half of the Form SSR regression.
 *
 * Hydrates each Form fixture over its own SSR markup and asserts Solid reports
 * no "Hydration Mismatch" and throws nothing. A mismatch is not cosmetic: Solid
 * aborts hydration for the entire tree, which is exactly what blanked
 * effect-latam /perfil and /foros routes when Form was in the SSR tree.
 */
import { hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  FormButtonFixture,
  FormTextFieldFixture,
  FormTextAreaFixture,
  FormPickerFixture,
  FormNativeButtonFixture,
  FormTwoButtonsFixture,
  FormButtonInFragmentFixture,
} from "./fixtures/form";

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
): { thrown: unknown; mismatches: string[]; errors: string[]; container: HTMLElement } {
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
    errors: messages.filter((m) => /Error|error/i.test(m) && !/Hydration Mismatch/i.test(m)),
    container,
  };
}

describe("Form hydrates over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("Form+Button", () => {
    const r = hydrateOverSsr("form-button-ssr.html", FormButtonFixture);
    if (r.thrown) console.log("THROWN Form+Button:", r.thrown);
    if (r.mismatches.length) console.log("MISMATCH Form+Button:", r.mismatches);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.querySelector("form")).not.toBeNull();
    expect(r.container.textContent).toContain("Go");
  });

  it("Form+TextField (profile shape)", () => {
    const r = hydrateOverSsr("form-textfield-ssr.html", FormTextFieldFixture);
    if (r.thrown) console.log("THROWN Form+TextField:", r.thrown);
    if (r.mismatches.length) console.log("MISMATCH Form+TextField:", r.mismatches);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.textContent).toContain("Nombre");
    expect(r.container.textContent).toContain("Username");
    expect(r.container.querySelector("input")).not.toBeNull();
  });

  it("Form+TextArea (foros shape)", () => {
    const r = hydrateOverSsr("form-textarea-ssr.html", FormTextAreaFixture);
    if (r.thrown) console.log("THROWN Form+TextArea:", r.thrown);
    if (r.mismatches.length) console.log("MISMATCH Form+TextArea:", r.mismatches);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.textContent).toContain("Título");
    expect(r.container.textContent).toContain("Contenido");
  });

  it("Form+native button", () => {
    const r = hydrateOverSsr("form-native-button-ssr.html", FormNativeButtonFixture);
    if (r.thrown) console.log("THROWN native:", r.thrown);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
  });

  it("Form+two Buttons", () => {
    const r = hydrateOverSsr("form-two-buttons-ssr.html", FormTwoButtonsFixture);
    if (r.thrown) console.log("THROWN two:", r.thrown);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
  });

  it("Form+Button in fragment", () => {
    const r = hydrateOverSsr("form-button-fragment-ssr.html", FormButtonInFragmentFixture);
    if (r.thrown) console.log("THROWN fragment:", r.thrown);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
  });

  it("Form+Picker (country picker shape)", () => {
    const r = hydrateOverSsr("form-picker-ssr.html", FormPickerFixture);
    if (r.thrown) console.log("THROWN Form+Picker:", r.thrown);
    if (r.mismatches.length) console.log("MISMATCH Form+Picker:", r.mismatches);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.textContent).toMatch(/País|Uruguay|UY/);
    expect(r.container.querySelector("[aria-haspopup]")).not.toBeNull();
  });
});
