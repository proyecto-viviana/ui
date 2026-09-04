import { describe, expect, it } from "vite-plus/test";

import {
  comparisonRootFrom,
  evaluateCatalogueSource,
  evaluateDemoControlSource,
  evaluateDemoControlSplit,
  evaluateLoaderSource,
} from "../../scripts/demo-control-split";

describe("demo control split", () => {
  it("keeps live controls off static *-demo imports and catalogue off the loader", () => {
    const root = comparisonRootFrom(import.meta.url);
    expect(root.replaceAll("\\", "/")).toMatch(/apps\/comparison$/);
    expect(evaluateDemoControlSplit(root)).toEqual([]);
  });

  it("fails when component-controls statically imports a demo module", () => {
    const source = `import { buttonDemoDefaults } from "./button-demo";\nexport function getComponentControlGroup() {}\n`;
    expect(evaluateDemoControlSource("src/data/component-controls.ts", source)).toEqual([
      expect.objectContaining({ kind: "static-demo-import" }),
    ]);
  });

  it("accepts a dynamic per-slug demo loader", () => {
    const source = `export const componentDemoLoaders = {\n  button: () => import("./button-demo"),\n};\n`;
    expect(evaluateLoaderSource("src/data/component-demo-loaders.ts", source)).toEqual([]);
  });

  it("fails when IndexHero imports component-controls", () => {
    const source = `import { getComponentControlGroup } from "@comparison/data/component-controls";\n`;
    expect(evaluateCatalogueSource("src/components/solid/IndexHero.tsx", source)).toEqual([
      expect.objectContaining({ kind: "eager-all-slug-controls" }),
    ]);
  });
});
