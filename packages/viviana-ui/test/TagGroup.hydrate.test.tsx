/**
 * Hydration regression for TagGroup's `isRenderedTag()` helper (client half).
 *
 * Hydrates over TagGroup's own SSR markup and asserts Solid reports no "Hydration Mismatch".
 * On the client `HTMLElement` DOES exist, so `isRenderedTag` takes the real `instanceof` branch;
 * if the server and client ever disagreed on whether an item was "already a Tag", the wrap/no-wrap
 * decision would differ between renders and desync every hydration key after it. See
 * TagGroup.ssr.test.tsx for the mechanism.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { TagGroupFixture, TagGroupPrebuiltTagFixture } from "./fixtures/tag-group";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

describe("TagGroup hydrates over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("plain string tag content hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("tag-group-ssr.html"), () => <TagGroupFixture />);
    expect(container.querySelectorAll('[role="row"]').length).toBe(3);
  });

  it("prebuilt <Tag> render-prop content hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("tag-group-prebuilt-ssr.html"), () => (
      <TagGroupPrebuiltTagFixture />
    ));
    expect(container.querySelectorAll('[role="row"]').length).toBe(3);
  });
});
