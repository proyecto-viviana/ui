import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  SAFE_CHROME_IMPORTERS,
  SAFE_CHROME_MOUNT_SCRIPTS,
  comparisonChromePublishedConditionPlugin,
  createPublishedPackageResolver,
  isChromeImporter,
  isExcludedFromChromeCondition,
} from "../../scripts/chrome-published-condition.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("comparison chrome published condition", () => {
  it("classifies the 10 safe chrome layout islands and their mounts as chrome", () => {
    for (const importer of SAFE_CHROME_IMPORTERS) {
      expect(isChromeImporter(`/repo/apps/comparison/src/components/solid/${importer}`)).toBe(true);
    }
    for (const mount of SAFE_CHROME_MOUNT_SCRIPTS) {
      expect(isChromeImporter(`/repo/apps/comparison/src/scripts/${mount}`)).toBe(true);
    }
    expect(
      isChromeImporter("/repo/apps/comparison/src/components/solid/marketing/MarketingHero.tsx"),
    ).toBe(true);
    expect(
      isChromeImporter("/repo/apps/comparison/src/components/solid/marketing/MarketingCta.tsx"),
    ).toBe(true);
    expect(isChromeImporter("/repo/apps/comparison/src/components/solid/chrome/styles.ts")).toBe(
      true,
    );
    expect(isChromeImporter("/repo/packages/solid-spectrum/dist/ActionButton.js")).toBe(true);
    expect(isChromeImporter("/repo/packages/solidaria/dist/i18n/index.js")).toBe(true);
  });

  it("strictly excludes ComponentExampleSection, ComponentExampleControls, fixtures, and D12 islands", () => {
    const excluded = [
      "/repo/apps/comparison/src/components/solid/ComponentExampleSection.tsx",
      "/repo/apps/comparison/src/components/solid/ComponentExampleControls.tsx",
      "/repo/apps/comparison/src/components/solid/ComponentExampleFiles.tsx",
      "/repo/apps/comparison/src/components/solid/ComponentExamplePreview.tsx",
      "/repo/apps/comparison/src/scripts/component-example-section-mount.tsx",
      "/repo/apps/comparison/src/scripts/component-controls.ts",
      "/repo/apps/comparison/src/components/solid/fixtures/styled/button.tsx",
      "/repo/apps/comparison/src/data/fixture-registries/button.ts",
      "/repo/apps/comparison/src/components/solid/islands/SolidButtonIsland.tsx",
      "/repo/apps/comparison/src/pages/d12/button.astro",
    ];

    for (const p of excluded) {
      expect(isExcludedFromChromeCondition(p)).toBe(true);
      expect(isChromeImporter(p)).toBe(false);
    }

    expect(isChromeImporter("/repo/packages/solid-spectrum/src/Button.ts")).toBe(false);
    expect(isChromeImporter("/repo/packages/solidaria/dist/index.jsx")).toBe(false);
  });

  it("resolves target packages to compiled dist/*.js via published import condition", () => {
    const resolver = createPublishedPackageResolver(repoRoot);

    const providerResolved = resolver("@proyecto-viviana/solid-spectrum/Provider");
    expect(providerResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/solid-spectrum\/dist\/Provider\.js$/,
    );

    const actionButtonResolved = resolver("@proyecto-viviana/solid-spectrum/ActionButton");
    expect(actionButtonResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/solid-spectrum\/dist\/ActionButton\.js$/,
    );

    const solidariaResolved = resolver("@proyecto-viviana/solidaria");
    expect(solidariaResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/solidaria\/dist\/index\.js$/,
    );

    const solidariaI18nResolved = resolver("@proyecto-viviana/solidaria/i18n");
    expect(solidariaI18nResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/solidaria\/dist\/i18n\/index\.js$/,
    );

    const solidariaComponentsResolved = resolver("@proyecto-viviana/solidaria-components");
    expect(solidariaComponentsResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/solidaria-components\/dist\/index\.js$/,
    );

    const uiButtonResolved = resolver("@proyecto-viviana/ui/Button");
    expect(uiButtonResolved?.replaceAll("\\", "/")).toMatch(
      /packages\/viviana-ui\/dist\/Button\.js$/,
    );
  });

  it("keeps solid-spectrum/style on the source macro condition", () => {
    const resolver = createPublishedPackageResolver(repoRoot);
    expect(resolver("@proyecto-viviana/solid-spectrum/style")).toBeNull();
    expect(resolver("@proyecto-viviana/solid-spectrum/style/runtime")).toBeNull();
  });

  it("intercepts chrome layout island importers while letting #example and fixtures fall through", () => {
    const plugin = comparisonChromePublishedConditionPlugin({ repoRoot });

    // Chrome island importer resolves to compiled dist/*.js
    const chromeResolution = plugin.resolveId?.(
      "@proyecto-viviana/solid-spectrum/Provider",
      "/repo/apps/comparison/src/components/solid/DocsSidebar.tsx",
    );
    expect(chromeResolution?.replaceAll("\\", "/")).toMatch(
      /packages\/solid-spectrum\/dist\/Provider\.js$/,
    );

    // #example importer (ComponentExampleSection) falls through to source alias (null)
    const exampleResolution = plugin.resolveId?.(
      "@proyecto-viviana/solid-spectrum/Provider",
      "/repo/apps/comparison/src/components/solid/ComponentExampleSection.tsx",
    );
    expect(exampleResolution).toBeNull();

    // Fixture importer falls through to source alias (null)
    const fixtureResolution = plugin.resolveId?.(
      "@proyecto-viviana/solid-spectrum/Button",
      "/repo/apps/comparison/src/components/solid/fixtures/styled/button.tsx",
    );
    expect(fixtureResolution).toBeNull();

    // D12 island importer falls through to source alias (null)
    const d12Resolution = plugin.resolveId?.(
      "@proyecto-viviana/solid-spectrum/Button",
      "/repo/apps/comparison/src/components/solid/islands/SolidButtonIsland.tsx",
    );
    expect(d12Resolution).toBeNull();
  });
});
