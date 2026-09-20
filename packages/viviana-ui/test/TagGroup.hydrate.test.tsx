/**
 * Hydration regression for TagGroup's `isRenderedTag()` helper (client half).
 *
 * Hydrates over TagGroup's own SSR markup and asserts Solid reports no "Hydration Mismatch".
 * On the client `HTMLElement` DOES exist, so `isRenderedTag` takes the real `instanceof` branch;
 * if the server and client ever disagreed on whether an item was "already a Tag", the wrap/no-wrap
 * decision would produce a different initial structure and jeopardize adoption. See
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

  it("plain string tag content hydrates with no mismatch", async () => {
    const selector = '[role="row"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(
      readSsr("tag-group-ssr.html"),
      () => <TagGroupFixture />,
      {
        beforeHydrate(container) {
          serverNodes = Array.from(container.querySelectorAll(selector));
          expect(serverNodes).toHaveLength(3);
        },
      },
    );
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.querySelectorAll('[role="row"]').length).toBe(3);
  });

  it("prebuilt <Tag> render-prop content hydrates with no mismatch", async () => {
    const selector = '[role="row"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(
      readSsr("tag-group-prebuilt-ssr.html"),
      () => <TagGroupPrebuiltTagFixture />,
      {
        beforeHydrate(container) {
          serverNodes = Array.from(container.querySelectorAll(selector));
          expect(serverNodes).toHaveLength(3);
        },
      },
    );
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.querySelectorAll('[role="row"]').length).toBe(3);
  });
});
