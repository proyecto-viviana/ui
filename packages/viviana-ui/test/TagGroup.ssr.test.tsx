/**
 * SSR half of the TagGroup `isRenderedTag()` regression.
 *
 * `isRenderedTag()` guards a `value instanceof HTMLElement` check with
 * `typeof HTMLElement === "undefined"` first, so it should degrade to "not a rendered Tag" (and
 * fall through to the normal `<Tag>` wrap) instead of throwing a ReferenceError when
 * `renderToString` runs in Node, where `HTMLElement` is not a global. This asserts the server
 * markup renders every tag correctly rather than crashing or silently dropping tags.
 *
 * Runs under vitest.ssr.config.ts (renderToString, hydratable). The companion
 * TagGroup.hydrate.test.tsx hydrates over this output and asserts no mismatch.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { TagGroupFixture, TagGroupPrebuiltTagFixture } from "./fixtures/tag-group";

describe("TagGroup SSR", () => {
  it("renders hydratable markup for plain string tag content without throwing", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    let html = "";
    expect(() => {
      html = renderToString(() => <TagGroupFixture />);
    }).not.toThrow();

    // All three items must be present, each wrapped in exactly one Tag row.
    expect(html).toContain("React");
    expect(html).toContain("SolidJS");
    expect(html).toContain("Vue");
    expect((html.match(/role="row"/g) ?? []).length).toBe(3);

    writeFileSync(resolve(outDir, "tag-group-ssr.html"), html, "utf8");
  });

  it("renders hydratable markup when the render prop already returns a <Tag>", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    let html = "";
    expect(() => {
      html = renderToString(() => <TagGroupPrebuiltTagFixture />);
    }).not.toThrow();

    expect(html).toContain("React");
    expect(html).toContain("SolidJS");
    expect(html).toContain("Vue");
    // Prebuilt <Tag> children must not be double-wrapped: still exactly one row per item.
    expect((html.match(/role="row"/g) ?? []).length).toBe(3);

    writeFileSync(resolve(outDir, "tag-group-prebuilt-ssr.html"), html, "utf8");
  });
});
