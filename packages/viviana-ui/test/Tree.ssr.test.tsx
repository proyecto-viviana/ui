/**
 * SSR half of the Tree hydration regression.
 *
 * Renders the shared fixtures with the hydratable server transform and writes
 * the markup for Tree.hydrate.test.tsx to hydrate over. The assertions here
 * only prove the server emits the rows — the bug under regression never showed
 * on this half (SSR output is strings; the eager-double-use node theft needs
 * real client DOM). The hydrate half owns the real catch.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { TreeFixture, TreeLabeledFixture } from "./fixtures/tree";

describe("Tree SSR", () => {
  it("renders hydratable markup with all rows for both return branches", () => {
    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });

    const bare = renderToString(() => <TreeFixture />);
    const labeled = renderToString(() => <TreeLabeledFixture />);

    for (const html of [bare, labeled]) {
      expect(html).toContain("data-tree-view");
      expect(html).toContain("Projects");
      // Expanded branch: parent + 2 children + sibling = 4 rows.
      expect(html.match(/role="row"/g)?.length).toBe(4);
    }

    writeFileSync(resolve(outDir, "tree-ssr.html"), bare, "utf8");
    writeFileSync(resolve(outDir, "tree-labeled-ssr.html"), labeled, "utf8");
  });
});
