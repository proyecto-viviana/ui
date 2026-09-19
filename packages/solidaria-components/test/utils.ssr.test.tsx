import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { DynamicFixture, HydrationGateFixture, RenderPropsFixture } from "./fixtures/utils";

const output = resolve(import.meta.dirname, "../../../output");

describe("utils SSR ownership", () => {
  it("renders only client-only fallbacks and leaves a generated-ID sibling after the gates", () => {
    const states: boolean[] = [];
    const constructed: string[] = [];
    const html = renderToString(() => (
      <HydrationGateFixture
        state={(hydrated) => states.push(hydrated)}
        constructed={(kind) => constructed.push(kind)}
      />
    ));
    expect(states).toEqual([false]);
    expect(constructed).toEqual([
      "component-fallback",
      "hook-following",
      "hook-fallback",
      "following",
    ]);
    expect(html).toMatch(/\s_hk=/);
    for (const kind of constructed) {
      expect(html).toMatch(new RegExp(`<span[^>]*id="[^"]+"[^>]*data-gate="${kind}"`));
    }
    expect(html.replace(/<!--[\s\S]*?-->/g, "")).toContain("gate-context:first");
    expect(html).not.toContain('data-gate="component-child"');
    expect(html).not.toContain('data-gate="empty-child"');
    expect(html).not.toContain('data-gate="hook-child"');
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "utils-hydration-gates-ssr.html"), html, "utf8");
  });

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
