import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { DynamicFixture, RenderPropsFixture } from "./fixtures/utils";

const output = resolve(import.meta.dirname, "../../../output");

describe("utils SSR ownership", () => {
  it("serializes nested dynamic contexts and the conditional fallback", () => {
    const html = renderToString(() => <DynamicFixture />);
    expect(html).toMatch(/\s_hk=/);
    const withoutMarkers = html.replace(/<!--[\s\S]*?-->/g, "");
    expect(withoutMarkers).toContain("inner:first:context");
    expect(withoutMarkers).not.toContain("outer:first");
    expect(html).toContain('component="forwarded"');
    expect(html).toMatch(/<button[^>]*data-fixture="dynamic"/);
    expect(html).toMatch(/<mark[^>]*data-fixture="unlisted"/);
    expect(html).toContain('data-fixture="fallback"');
    expect(html).not.toContain('data-fixture="delayed"');
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "utils-dynamic-ssr.html"), html, "utf8");
  });

  it("serializes render props, accessors and visible conditional children", () => {
    const html = renderToString(() => <RenderPropsFixture />);
    expect(html).toMatch(/\s_hk=/);
    expect(html).toContain("render-context:first");
    expect(html).toContain('data-selected="false"');
    expect(html).toContain('data-fixture="conditional"');
    expect(html).not.toContain('data-fixture="render-fallback"');
    expect(html).not.toContain('id="unused"');
    expect(html).not.toContain('id="also-unused"');
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "utils-render-props-ssr.html"), html, "utf8");
  });
});
