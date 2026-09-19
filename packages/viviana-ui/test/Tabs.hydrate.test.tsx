import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { TabsFixture } from "./fixtures/tabs";

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/tabs-specimen-ssr.html"),
  "utf8",
);

describe("Tabs hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates tabs without hydration mismatch", async () => {
    const selector = '[role="tablist"], [role="tab"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(ssrHtml, () => <TabsFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(5);
      },
    });
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    const tabList = container.querySelector('[role="tablist"]');
    expect(tabList).not.toBeNull();
    const tabs = container.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(4);
  });
});
