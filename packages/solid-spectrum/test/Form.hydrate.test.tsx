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

describe("Form hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Form+Button", () => {
    const container = hydrateOverSsr(readSsr("form-button-ssr.html"), () => <FormButtonFixture />);
    expect(container.querySelector("form")).not.toBeNull();
    expect(container.textContent).toContain("Go");
  });

  it("Form+TextField (profile shape)", () => {
    const container = hydrateOverSsr(readSsr("form-textfield-ssr.html"), () => (
      <FormTextFieldFixture />
    ));
    expect(container.textContent).toContain("Nombre");
    expect(container.textContent).toContain("Username");
    expect(container.querySelector("input")).not.toBeNull();
  });

  it("Form+TextArea (foros shape)", () => {
    const container = hydrateOverSsr(readSsr("form-textarea-ssr.html"), () => (
      <FormTextAreaFixture />
    ));
    expect(container.textContent).toContain("Título");
    expect(container.textContent).toContain("Contenido");
  });

  it("Form+native button", () => {
    hydrateOverSsr(readSsr("form-native-button-ssr.html"), () => <FormNativeButtonFixture />);
  });

  it("Form+two Buttons", () => {
    hydrateOverSsr(readSsr("form-two-buttons-ssr.html"), () => <FormTwoButtonsFixture />);
  });

  it("Form+Button in fragment", () => {
    hydrateOverSsr(readSsr("form-button-fragment-ssr.html"), () => <FormButtonInFragmentFixture />);
  });

  it("Form+Picker (country picker shape)", () => {
    const container = hydrateOverSsr(readSsr("form-picker-ssr.html"), () => <FormPickerFixture />);
    expect(container.textContent).toMatch(/País|Uruguay|UY/);
    expect(container.querySelector("[aria-haspopup]")).not.toBeNull();
  });
});
