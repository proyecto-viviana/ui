import { describe, expect, it } from "vite-plus/test";

import {
  COMPARISON_CHROME_CSS_ID,
  coalesceChromeMacroCssImports,
  comparisonRootFrom,
  concatenateCachedCss,
  contributingPathsAreChromeOnly,
  evaluateChromeCssCoalesce,
  evaluateChromeCssCoalesceSource,
  isComparisonChromeMacroModule,
  orderedUniqueIds,
} from "../../scripts/chrome-css-coalesce.mjs";

describe("comparison chrome CSS coalesce", () => {
  it("keeps live comparisonS2Macros on one virtual chrome sheet, gated off fixtures", () => {
    const root = comparisonRootFrom(import.meta.url);
    expect(root.replaceAll("\\", "/")).toMatch(/apps\/comparison$/);
    expect(evaluateChromeCssCoalesce(root)).toEqual([]);
  });

  it("rewrites many chrome macro CSS imports to one virtual sheet", () => {
    const source = [
      'export const docsTopBarRoot = "a";',
      'import "macro-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.css";',
      'import "macro-bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb.css";',
      'import "macro-cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc.css";',
    ].join("\n");
    const coalesced = coalesceChromeMacroCssImports(source);
    expect(coalesced.cssIds).toHaveLength(3);
    expect(coalesced.code).toContain(`import "${COMPARISON_CHROME_CSS_ID}";`);
    expect(coalesced.code.match(/import\s+["']macro-[a-f0-9]+\.css["']/g)).toBeNull();
  });

  it("does not treat fixture or Calendar modules as chrome", () => {
    expect(
      isComparisonChromeMacroModule(
        "/home/emoporemilio/projects/viviana-hub/ui/apps/comparison/src/components/solid/chrome/styles.ts",
      ),
    ).toBe(true);
    expect(
      isComparisonChromeMacroModule(
        "/home/emoporemilio/projects/viviana-hub/ui/apps/comparison/src/components/solid/fixtures/styled/calendar.tsx",
      ),
    ).toBe(false);
    expect(
      contributingPathsAreChromeOnly([
        "apps/comparison/src/components/solid/fixtures/styled/calendar.tsx",
      ]),
    ).toBe(false);
  });

  it("concatenates cached chrome CSS in first-seen order without duplicates", () => {
    const idsByFile = new Map([
      ["chrome/styles.ts", ["macro-aa.css", "macro-bb.css"]],
      ["chrome/other.ts", ["macro-bb.css", "macro-cc.css"]],
    ]);
    const cache = new Map([
      ["macro-aa.css", ".aa{}"],
      ["macro-bb.css", ".bb{}"],
      ["macro-cc.css", ".cc{}"],
    ]);
    expect(concatenateCachedCss(orderedUniqueIds(idsByFile), cache)).toBe(".aa{}\n.bb{}\n.cc{}");
  });

  it("fails when comparisonS2Macros stops coalescing chrome macros", () => {
    const source = `export default defineConfig({ vite: { plugins: [macros.raw()], build: { assetsInlineLimit: 0 } } });\n`;
    expect(evaluateChromeCssCoalesceSource("astro.config.mjs", source)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "missing-chrome-sheet" }),
        expect.objectContaining({ kind: "ungated-coalesce" }),
        expect.objectContaining({ kind: "missing-coalesce" }),
      ]),
    );
  });

  it("fails cssCodeSplit: false because that would smuggle fixture CSS", () => {
    const source = `import { COMPARISON_CHROME_CSS_ID, isComparisonChromeMacroModule, coalesceChromeMacroCssImports } from "./scripts/chrome-css-coalesce.mjs";\nexport default { vite: { build: { cssCodeSplit: false, assetsInlineLimit: 0 } } };\n`;
    expect(evaluateChromeCssCoalesceSource("astro.config.mjs", source)).toEqual([
      expect.objectContaining({ kind: "css-code-split-off" }),
    ]);
  });
});
