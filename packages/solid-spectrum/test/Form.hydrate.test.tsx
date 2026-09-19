/**
 * Hydration half of the Form SSR regression.
 *
 * Hydrates each Form fixture over its own SSR markup and asserts Solid reports
 * no "Hydration Mismatch" and throws nothing. A mismatch is not cosmetic: Solid
 * aborts hydration for the entire tree, which is exactly what blanked
 * effect-latam /perfil and /foros routes when Form was in the SSR tree.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import {
  FormButtonFixture,
  FormTextFieldFixture,
  FormTextAreaFixture,
  FormPickerFixture,
  FormNativeButtonFixture,
  FormTwoButtonsFixture,
  FormButtonInFragmentFixture,
} from "./fixtures/form";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

async function hydrateForm(
  ssrFile: string,
  fixture: Parameters<typeof hydrateOverSsr>[1],
  expectedControls: number,
) {
  const selector = 'form, label, input:not([type="hidden"]), textarea, button';
  let serverControls: Element[] = [];
  const container = await hydrateOverSsr(readSsr(ssrFile), fixture, {
    beforeHydrate(container) {
      serverControls = Array.from(container.querySelectorAll(selector));
      expect(serverControls).toHaveLength(expectedControls);
    },
  });
  const controls = container.querySelectorAll(selector);
  expect(controls).toHaveLength(serverControls.length);
  serverControls.forEach((control, index) => expect(controls[index]).toBe(control));
  return container;
}

describe("Form hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Form+Button", async () => {
    const container = await hydrateForm("form-button-ssr.html", () => <FormButtonFixture />, 2);
    expect(container.querySelector("form")).not.toBeNull();
    expect(container.textContent).toContain("Go");
  });

  it("Form+TextField (profile shape)", async () => {
    const container = await hydrateForm(
      "form-textfield-ssr.html",
      () => <FormTextFieldFixture />,
      6,
    );
    expect(container.textContent).toContain("Nombre");
    expect(container.textContent).toContain("Username");
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("Form+TextArea (foros shape)", async () => {
    const container = await hydrateForm("form-textarea-ssr.html", () => <FormTextAreaFixture />, 6);
    expect(container.textContent).toContain("Título");
    expect(container.textContent).toContain("Contenido");
  });

  it("Form+native button", async () => {
    await hydrateForm("form-native-button-ssr.html", () => <FormNativeButtonFixture />, 2);
  });

  it("Form+two Buttons", async () => {
    await hydrateForm("form-two-buttons-ssr.html", () => <FormTwoButtonsFixture />, 3);
  });

  it("Form+Button in fragment", async () => {
    await hydrateForm("form-button-fragment-ssr.html", () => <FormButtonInFragmentFixture />, 2);
  });

  it("Form+Picker (country picker shape)", async () => {
    const container = await hydrateForm("form-picker-ssr.html", () => <FormPickerFixture />, 4);
    expect(container.textContent).toMatch(/País|Uruguay|UY/);
    expect(container.querySelector("[aria-haspopup]")).not.toBeNull();
  });
});
