import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SAFE_CHROME_IMPORTERS = new Set([
  "DocsSidebar.tsx",
  "DocsTopBar.tsx",
  "DocsFooter.tsx",
  "DocsToc.tsx",
  "CatalogueOverview.tsx",
  "IndexHero.tsx",
  "ComponentDetailHero.tsx",
  "ComponentDetailMeta.tsx",
  "MarketingHero.tsx",
  "MarketingCta.tsx",
]);

export const SAFE_CHROME_MOUNT_SCRIPTS = new Set([
  "docs-sidebar-mount.tsx",
  "docs-topbar-mount.tsx",
  "docs-footer-mount.tsx",
  "docs-toc-mount.tsx",
  "catalogue-overview-mount.tsx",
  "index-hero-mount.tsx",
  "component-detail-hero-mount.tsx",
  "component-detail-meta-mount.tsx",
  "marketing-hero-mount.tsx",
  "marketing-cta-mount.tsx",
]);

export const TARGET_PUBLISHED_PACKAGES = {
  "@proyecto-viviana/solid-spectrum": "packages/solid-spectrum",
  "@proyecto-viviana/ui": "packages/viviana-ui",
  "@proyecto-viviana/solidaria": "packages/solidaria",
  "@proyecto-viviana/solidaria-components": "packages/solidaria-components",
};

export function isExcludedFromChromeCondition(normalizedPath) {
  return (
    normalizedPath.includes("ComponentExampleSection") ||
    normalizedPath.includes("ComponentExampleControls") ||
    normalizedPath.includes("ComponentExampleFiles") ||
    normalizedPath.includes("ComponentExamplePreview") ||
    normalizedPath.includes("/component-example-section-mount.") ||
    normalizedPath.includes("/component-controls.") ||
    normalizedPath.includes("/components/solid/fixtures/") ||
    normalizedPath.includes("/fixture-registries/") ||
    normalizedPath.includes("/components/solid/islands/") ||
    normalizedPath.includes("/pages/d12/")
  );
}

export function isChromeImporter(importer) {
  if (!importer) return false;
  const normalized = String(importer).split(/[?#]/, 1)[0].replaceAll("\\", "/");
  if (isExcludedFromChromeCondition(normalized)) {
    return false;
  }
  const basename = normalized.split("/").pop();
  if (SAFE_CHROME_IMPORTERS.has(basename) || SAFE_CHROME_MOUNT_SCRIPTS.has(basename)) {
    return true;
  }
  if (normalized.includes("/apps/comparison/src/components/solid/chrome/")) {
    return true;
  }
  if (
    /\/packages\/(solid-spectrum|viviana-ui|solidaria|solidaria-components)\/dist\/.*\.m?js$/.test(
      normalized,
    )
  ) {
    return true;
  }
  return false;
}

export function createPublishedPackageResolver(repoRoot) {
  const packageConfigs = new Map();

  function getPackageJson(pkgName, pkgRelDir) {
    let pkgJson = packageConfigs.get(pkgName);
    if (!pkgJson) {
      const pkgPath = path.resolve(repoRoot, pkgRelDir, "package.json");
      pkgJson = JSON.parse(readFileSync(pkgPath, "utf8"));
      packageConfigs.set(pkgName, pkgJson);
    }
    return pkgJson;
  }

  return function resolvePublishedPackageImport(id) {
    for (const [pkgName, pkgRelDir] of Object.entries(TARGET_PUBLISHED_PACKAGES)) {
      if (id === pkgName || id.startsWith(`${pkgName}/`)) {
        const subpath = id === pkgName ? "." : `./${id.slice(pkgName.length + 1)}`;
        // S2 style macro entries in solid-spectrum must remain on source/explicit aliases
        if (
          pkgName === "@proyecto-viviana/solid-spectrum" &&
          (subpath === "./style" || subpath === "./style/runtime")
        ) {
          return null;
        }

        const pkgDir = path.resolve(repoRoot, pkgRelDir);
        const pkgJson = getPackageJson(pkgName, pkgRelDir);
        const exportEntry = pkgJson.exports?.[subpath];
        if (!exportEntry) {
          return null;
        }

        const target =
          typeof exportEntry === "string"
            ? exportEntry
            : (exportEntry.import ?? exportEntry.default ?? null);
        if (!target) {
          return null;
        }

        const resolved = path.resolve(pkgDir, target);
        if (!existsSync(resolved)) {
          throw new Error(
            `published condition target ${target} for ${id} does not exist at ${resolved}`,
          );
        }
        return resolved;
      }
    }
    return null;
  };
}

export function comparisonChromePublishedConditionPlugin({ repoRoot }) {
  const resolver = createPublishedPackageResolver(repoRoot);

  return {
    name: "comparison-chrome-published-condition",
    enforce: "pre",
    resolveId(id, importer) {
      if (!importer) return null;
      if (!isChromeImporter(importer)) {
        return null;
      }
      return resolver(id);
    },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
  const resolver = createPublishedPackageResolver(repoRoot);

  for (const file of SAFE_CHROME_IMPORTERS) {
    const filePath = path.resolve(
      repoRoot,
      "apps/comparison/src/components/solid",
      file.includes("/") ? file : file,
    );
    if (
      !existsSync(filePath) &&
      !existsSync(path.resolve(repoRoot, "apps/comparison/src/components/solid/marketing", file))
    ) {
      console.error(`chrome published condition: missing safe chrome importer ${file}`);
      process.exit(1);
    }
  }

  for (const script of SAFE_CHROME_MOUNT_SCRIPTS) {
    const scriptPath = path.resolve(repoRoot, "apps/comparison/src/scripts", script);
    if (!existsSync(scriptPath)) {
      console.error(`chrome published condition: missing mount script ${script}`);
      process.exit(1);
    }
  }

  const sampleResolution = resolver("@proyecto-viviana/solid-spectrum/Provider");
  if (!sampleResolution || !sampleResolution.endsWith("packages/solid-spectrum/dist/Provider.js")) {
    console.error(
      `chrome published condition: unexpected resolution for Provider: ${sampleResolution}`,
    );
    process.exit(1);
  }

  console.log(
    `chrome published condition: ok (${SAFE_CHROME_IMPORTERS.size} safe chrome importers, 4 packages via compiled dist/*.js)`,
  );
}
