import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { HydrateOverSsrFixture } from "./fixtures/hydrateOverSsr";

describe("hydrateOverSsr fixture SSR", () => {
  it("writes fresh Solid 2 hydratable markup", () => {
    const html = renderToString(() => <HydrateOverSsrFixture />);

    expect(html).toContain('data-probe="ok"');
    expect(html).toMatch(/\s_hk=/);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "hydrate-over-ssr.html"), html, "utf8");
  });
});
