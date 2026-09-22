/**
 * Hydration half of the TextField adornment twin (#545 class 2).
 *
 * Reads the markup TextField.ssr.test.tsx writes (run that first) and hydrates
 * a DOM-compiled TextField over it. This is the environment that reproduced
 * `/showcase/inputs`: the client applies the input's ref with `getOwner() ===
 * null`, the ref reads `context.inputProps`, the prefix proxy resolves the
 * computed adornment id set, and that re-runs the `suffix` getter — a
 * `useContext` with no owner, i.e. `NoOwnerError` and a blank route.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { TextFieldAdornmentsFixture } from "./fixtures/textfield-adornments";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/viviana-ui-textfield-adornments-ssr.html"),
  "utf8",
);

describe("viviana-ui TextField adornments hydrate over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates a context-reading prefix and suffix without throwing", async () => {
    const selector = "input, kbd";
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <TextFieldAdornmentsFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(3);
      },
    });

    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.textContent).toContain("⌘");
    expect(container.textContent).toContain("↵");
  });
});
