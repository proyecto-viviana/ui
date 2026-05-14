import { readdir, readFile } from "node:fs/promises";

const docsBasePath = "/solid-spectrum/docs";
const componentsDir = "apps/web/src/routes/solid-spectrum/docs/components";
const hooksDir = "apps/web/src/routes/solid-spectrum/docs/hooks";
const routeTreeFile = "apps/web/src/routeTree.gen.ts";

async function listRouteSlugs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".tsx"))
    .map((entry) => entry.name.replace(".tsx", ""))
    .sort();
}

const componentSlugs = await listRouteSlugs(componentsDir);
const hookSlugs = await listRouteSlugs(hooksDir);
const routeTree = await readFile(routeTreeFile, "utf8");

const expectedPaths = [
  ...componentSlugs.map((slug) => `${docsBasePath}/components/${slug}`),
  ...hookSlugs.map((slug) => `${docsBasePath}/hooks/${slug}`),
];

const missingPaths = expectedPaths.filter((path) => !routeTree.includes(path));

if (missingPaths.length > 0) {
  console.error("Docs routeTree is missing discovered route files:");
  for (const path of missingPaths) {
    console.error(`- ${path}`);
  }
  console.error("Run the router generator/build step so routeTree.gen.ts is up to date.");
  process.exit(1);
}

console.log(`OK: docs routeTree covers ${expectedPaths.length} docs routes.`);
