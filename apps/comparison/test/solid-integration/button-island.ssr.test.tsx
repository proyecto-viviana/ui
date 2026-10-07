import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vite-plus/test";
import renderer from "../../integrations/solid/server.mjs";
import SolidButtonIsland from "../../src/components/solid/islands/SolidButtonIsland";

// Styled fixtures are runtime `h()` and cannot SSR. This is the JSX island
// the D12 route hydrates, rendered through the private adapter.
it("renders the D12 button island as one hydratable root", async () => {
  const context = { result: {} };
  const result = await renderer.renderToStaticMarkup.call(
    context,
    SolidButtonIsland,
    {},
    {},
    { hydrate: true },
  );
  expect(result.attrs["data-solid-render-id"]).toBe("s0");
  expect(result.html).toMatch(/\s_hk=["']?s0/);
  expect(result.html).toContain(">Save<");
  expect(result.html).toContain('data-comparison-action-count="0"');
  expect(result.html).toContain('data-comparison-control-root="button"');
  expect(result.html).not.toContain("data-comparison-hydrated");
  const output = resolve("output/astro-solid-button-island.json");
  mkdirSync(resolve("output"), { recursive: true });
  writeFileSync(
    output,
    JSON.stringify({
      result,
      hydrationScript: renderer.renderHydrationScript(),
    }),
  );
});
