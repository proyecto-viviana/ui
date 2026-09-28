/**
 * A collapsed disclosure panel keeps `hidden` through the hydration walk.
 * The client used to drop it as soon as `canUseDOM` was true.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { CollapsedDisclosureFixture } from "./fixtures/collapsedDisclosure";

const html = readFileSync(
  resolve(import.meta.dirname, "../../../output/disclosure-collapsed-ssr.html"),
  "utf8",
);

afterEach(() => {
  cleanupHydrationRoots();
  document.body.innerHTML = "";
});

describe("collapsed disclosure hydrates", () => {
  it("keeps the server panel and its hidden attribute", async () => {
    let serverPanel: Element | undefined;
    const container = await hydrateOverSsr(html, () => <CollapsedDisclosureFixture />, {
      beforeHydrate(root) {
        serverPanel = root.querySelector('[role="group"]') ?? undefined;
        expect(serverPanel).toBeTruthy();
        expect(serverPanel?.hasAttribute("hidden")).toBe(true);
      },
    });

    const panel = container.querySelector('[role="group"]');
    expect(panel).toBe(serverPanel);
    expect(panel?.hasAttribute("hidden")).toBe(true);
  });
});
