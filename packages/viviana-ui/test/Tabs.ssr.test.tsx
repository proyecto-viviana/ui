import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { TabsFixture } from "./fixtures/tabs";

describe("Tabs SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders tabs and writes hydratable markup", () => {
    const html = renderToString(() => <TabsFixture />);

    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "tabs-specimen-ssr.html"), html, "utf8");
  });
});
