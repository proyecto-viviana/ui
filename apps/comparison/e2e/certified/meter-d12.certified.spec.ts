import { registerSsrHydrationDriver, type SsrHydrationScenario } from "../drivers/ssr-hydration";

/**
 * D12 proves that the styled Meter's shared Label ID and aria-labelledby
 * relationship are present on the server and stay stable through hydration.
 */
const meterSsrScenario: SsrHydrationScenario = {
  slug: "meter",
  title: "Meter",
  cases: [
    {
      id: "label-context",
      route: "/d12/meter/",
      target: (page) => page.getByRole("meter", { name: "Storage" }),
      expectTag: "div",
    },
  ],
};

registerSsrHydrationDriver(meterSsrScenario);
