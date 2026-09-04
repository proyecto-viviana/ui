/**
 * SSR half of the Form hydration regression.
 *
 * Runs under vitest.ssr.config.ts so renderToString emits hydratable server
 * markup. Companion Form.hydrate.test.tsx hydrates over this output.
 *
 * Regression source: effect-latam /perfil and /foros/$slug blanked the whole
 * route with "template is not a function" / Hydration Mismatch when Spectrum
 * Form was in the SSR tree (Picker alone was fine; Form was the bisect hit).
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
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

const outDir = resolve(import.meta.dirname, "../../../output");

function write(name: string, html: string) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, name), html, "utf8");
}

describe("Form SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders Form+Button hydratable markup", () => {
    const html = renderToString(() => <FormButtonFixture />);
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Go");
    expect(html.toLowerCase()).toContain("<form");
    write("form-button-ssr.html", html);
  });

  it("renders Form+TextField hydratable markup", () => {
    const html = renderToString(() => <FormTextFieldFixture />);
    expect(html).toContain("Nombre");
    expect(html).toContain("Username");
    expect(html).toContain("Guardar");
    const labels = html.match(/<label\b[^>]*>/g) ?? [];
    expect(labels.length).toBeGreaterThan(0);
    for (const tag of labels) {
      expect(tag.match(/ for="/g)?.length ?? 0).toBe(1);
    }
    write("form-textfield-ssr.html", html);
  });

  it("renders Form+TextArea hydratable markup", () => {
    const html = renderToString(() => <FormTextAreaFixture />);
    expect(html).toContain("Título");
    expect(html).toContain("Contenido");
    write("form-textarea-ssr.html", html);
  });

  it("renders Form+Picker hydratable markup", () => {
    const html = renderToString(() => <FormPickerFixture />);
    expect(html).toContain("País");
    // selected value visible in trigger or native select
    expect(html).toMatch(/Uruguay|UY/);
    write("form-picker-ssr.html", html);
  });

  it("renders Form+native button markup", () => {
    const html = renderToString(() => <FormNativeButtonFixture />);
    expect(html).toContain("Go native");
    write("form-native-button-ssr.html", html);
  });

  it("renders Form+two Buttons markup", () => {
    const html = renderToString(() => <FormTwoButtonsFixture />);
    expect(html).toContain("Cancel");
    write("form-two-buttons-ssr.html", html);
  });

  it("renders Form+Button in fragment markup", () => {
    const html = renderToString(() => <FormButtonInFragmentFixture />);
    expect(html).toContain("Go");
    write("form-button-fragment-ssr.html", html);
  });
});
