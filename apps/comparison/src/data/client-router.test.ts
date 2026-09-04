import { describe, expect, it } from "vite-plus/test";

import {
  comparisonRootFrom,
  evaluateClientRouter,
  evaluateExampleAnimateSource,
  evaluateExampleRemountSource,
  evaluateLayoutSource,
  evaluatePrefetchSource,
  evaluateSidebarPrefetchSource,
} from "../../scripts/client-router.mjs";

describe("comparison ClientRouter", () => {
  it("keeps live layouts on ClientRouter with hover prefetch and example remount", () => {
    const root = comparisonRootFrom(import.meta.url);
    expect(root.replaceAll("\\", "/")).toMatch(/apps\/comparison$/);
    expect(evaluateClientRouter(root)).toEqual([]);
  });

  it("fails a layout that omits ClientRouter", () => {
    expect(evaluateLayoutSource("src/layouts/DocsPageLayout.astro", "<html></html>")).toEqual([
      expect.objectContaining({ kind: "missing-client-router" }),
    ]);
  });

  it("fails prefetchAll true because that would prefetch every slug", () => {
    expect(
      evaluatePrefetchSource(
        "astro.config.mjs",
        "export default { prefetch: { prefetchAll: true, defaultStrategy: 'hover' } };\n",
      ),
    ).toEqual([expect.objectContaining({ kind: "prefetch-all" })]);
  });

  it("accepts hover prefetch with prefetchAll false", () => {
    expect(
      evaluatePrefetchSource(
        "astro.config.mjs",
        'export default { prefetch: { prefetchAll: false, defaultStrategy: "hover" } };\n',
      ),
    ).toEqual([]);
  });

  it("fails sidebar links without hover prefetch", () => {
    expect(
      evaluateSidebarPrefetchSource("DocsSidebar.tsx", "h('a', { href: '/components/button/' })"),
    ).toEqual([expect.objectContaining({ kind: "missing-hover-prefetch" })]);
  });

  it("accepts example remount via mountOnAstroPage helper", () => {
    expect(
      evaluateExampleRemountSource(
        "src/scripts/component-example-section-mount.tsx",
        "mountOnAstroPage(mountExampleSections, reset);\ndelete mountNode.dataset.islandsMounted;\n",
        'document.addEventListener("astro:after-swap", mount);\n',
      ),
    ).toEqual([]);
  });

  it("fails an example mount that persists islands-mounted across swaps", () => {
    expect(
      evaluateExampleRemountSource(
        "src/scripts/component-example-section-mount.tsx",
        "for (const mountNode of nodes) { if (mountNode.dataset.mounted) continue; }",
      ),
    ).toEqual(expect.arrayContaining([expect.objectContaining({ kind: "stale-example-persist" })]));
  });

  it("fails persisting the example frame", () => {
    expect(
      evaluateExampleAnimateSource(
        "ComponentExampleSectionMount.astro",
        '<div class="js-component-example-section-mount" transition:persist>',
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "stale-example-persist" }),
        expect.objectContaining({ kind: "missing-client-router" }),
      ]),
    );
  });
});
