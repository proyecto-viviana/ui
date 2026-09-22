/**
 * @vitest-environment jsdom
 *
 * Hydration half of the ComboBox hydration twin (#545 class 3).
 *
 * Reads the markup ComboBox.ssr.test.tsx writes (run that first) and hydrates a
 * DOM-compiled ComboBox over it. Hydration keys are a per-owner path, so any
 * primitive that allocates an id on one side only shifts every sibling id after
 * it: `createComboBox` guarded its `createStringFormatter` behind `!isServer`,
 * the client allocated two ids the server never did, and the first fallback-less
 * claim in the shifted subtree — the `errorMessage` `Text`, which goes through
 * `ElementTag`/`dynamic` — threw `Hydration Mismatch. Unable to find DOM nodes
 * for hydration key`, killing `/solid-spectrum/docs/components/combobox`.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { ComboBoxHelpTextFixture } from "./fixtures/combobox";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/combobox-ssr.html"),
  "utf8",
);

describe("ComboBox hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates help text without a mismatch", async () => {
    const selector = "input, button, [slot=description], [slot=errorMessage]";
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <ComboBoxHelpTextFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes.length).toBeGreaterThan(0);
      },
    });

    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.textContent).toContain("Please select a valid food item");
  });
});
