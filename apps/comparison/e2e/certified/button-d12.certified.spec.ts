import { expect } from "@playwright/test";
import { registerSsrHydrationDriver, type SsrHydrationScenario } from "../drivers/ssr-hydration";

/**
 * D12 (SSR/hydration) pilot: Button. The Button demo is the comparison app's
 * first hydratable Astro island (`SolidButtonIsland`, served `client:load` from
 * `/d12/button`). This certifies its server HTML equals its hydrated DOM —
 * stable ids, no mismatch, interactive after hydration — the last Phase-1
 * driver's positive-control pilot.
 *
 * Only the default (baseline) state is certified here: the island reads its
 * props from `window.location.search` at hydration, which is absent during SSR,
 * so a query-param state would SSR the defaults and hydrate a different state (a
 * genuine window-read mismatch). The baseline (no params) SSRs and hydrates the
 * same defaults, so it is the clean, faithful contract. Certifying non-default
 * states needs per-state pre-rendered pages that pass the state as an island
 * prop (server-known) — the follow-up this pilot's infrastructure enables.
 */
const buttonSsrScenario: SsrHydrationScenario = {
  slug: "button",
  title: "Button",
  cases: [
    {
      id: "baseline",
      route: "/d12/button/",
      target: (page) => page.getByRole("button", { name: "Save" }),
      expectTag: "button",
      expectText: "Save",
      interact: async ({ page, target }) => {
        const root = page.locator("[data-comparison-control-root='button']");
        await expect(root).toHaveAttribute("data-comparison-action-count", "0");
        await target.click();
        await expect(root).toHaveAttribute("data-comparison-action-count", "1");
      },
    },
  ],
};

registerSsrHydrationDriver(buttonSsrScenario);
