/**
 * Hydration twin of solid-spectrum Form+TextField (profile shape).
 *
 * Covers `isRequired + description` — the input that desynced hydration keys
 * when mergeProps probed the Label children getter (#184).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { FormTextFieldFixture } from "./fixtures/form";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

describe("viviana-ui Form hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Form+TextField (isRequired + description)", () => {
    const container = hydrateOverSsr(readSsr("viviana-ui-form-textfield-ssr.html"), () => (
      <FormTextFieldFixture />
    ));
    expect(container.textContent).toContain("Nombre");
    expect(container.textContent).toContain("Username");
    expect(container.querySelector("input")).not.toBeNull();
  });
});
