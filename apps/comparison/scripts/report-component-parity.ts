import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

import { componentGroupDefinitions } from "../src/data/component-groups";
import { componentControlGroups } from "../src/data/component-controls";
import { comparisonEntries } from "../src/data/comparison-manifest";
import { reactSpectrumCatalogue } from "../src/data/react-spectrum-catalogue";
import { getVisualStateTargets } from "../src/data/visual-state-matrix";

interface Gap {
  slug: string;
  title: string;
  detail?: string;
}

const strict = process.argv.includes("--strict");

function titleForSlug(slug: string): string {
  return reactSpectrumCatalogue.find((entry) => entry.slug === slug)?.title ?? slug;
}

function formatGap(gap: Gap): string {
  return gap.detail != null
    ? `- ${gap.title} (${gap.slug}) - ${gap.detail}`
    : `- ${gap.title} (${gap.slug})`;
}

function printGapSection(label: string, gaps: readonly Gap[]): void {
  if (gaps.length === 0) {
    console.log(`[pass] ${label}`);
    return;
  }

  console.log(`[gap] ${label}: ${gaps.length}`);
  for (const gap of gaps) {
    console.log(formatGap(gap));
  }
}

function objectKeyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return undefined;
}

function readObjectLiteralKeys(url: URL, variableName: string): Set<string> {
  const filename = fileURLToPath(url);
  const source = ts.createSourceFile(
    filename,
    readFileSync(filename, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    filename.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.JSX,
  );
  let objectLiteral: ts.ObjectLiteralExpression | undefined;

  function visit(node: ts.Node): void {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer != null &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      objectLiteral = node.initializer;
    }

    ts.forEachChild(node, visit);
  }

  visit(source);

  if (objectLiteral == null) {
    throw new Error(`Could not find object literal ${variableName} in ${filename}`);
  }

  return new Set(
    objectLiteral.properties.flatMap((property) => {
      if (
        ts.isPropertyAssignment(property) ||
        ts.isShorthandPropertyAssignment(property) ||
        ts.isMethodDeclaration(property)
      ) {
        const name = objectKeyName(property.name);
        return name == null ? [] : [name];
      }

      return [];
    }),
  );
}

function noteCandidates(slug: string): readonly string[] {
  const familyNotes: Record<string, readonly string[]> = {
    actionbutton: ["button-family-validation-notes.md"],
    actionbuttongroup: ["button-family-validation-notes.md"],
    buttongroup: ["button-family-validation-notes.md"],
    card: ["card-cardview-validation-notes.md"],
    cardview: ["card-cardview-validation-notes.md"],
    icons: ["icon-illustration-validation-notes.md"],
    illustrations: ["icon-illustration-validation-notes.md"],
    linkbutton: ["button-family-validation-notes.md"],
    togglebutton: ["togglebutton-validation-notes.md", "button-family-validation-notes.md"],
    togglebuttongroup: [
      "togglebuttongroup-validation-notes.md",
      "button-family-validation-notes.md",
    ],
  };

  return [`${slug}-validation-notes.md`, ...(familyNotes[slug] ?? [])];
}

function hasValidationNote(slug: string): boolean {
  return noteCandidates(slug).some((filename) =>
    existsSync(new URL(`../playbook/components/${filename}`, import.meta.url)),
  );
}

function hasCurrentVisualEvidence(slug: string): boolean {
  const entry = comparisonEntries.find((candidate) => candidate.slug === slug);
  if (entry == null) {
    return false;
  }

  return getVisualStateTargets(entry).some(
    (state) =>
      (state.react === "visual" || state.react === "asserted") &&
      (state.solid === "visual" || state.solid === "asserted") &&
      state.pairDiff !== "planned" &&
      state.pairDiff !== "blocked",
  );
}

const officialEntriesBySlug = new Map(reactSpectrumCatalogue.map((entry) => [entry.slug, entry]));
const comparisonEntriesBySlug = new Map(comparisonEntries.map((entry) => [entry.slug, entry]));
const officialSlugs = new Set(officialEntriesBySlug.keys());
const comparisonSlugs = new Set(comparisonEntriesBySlug.keys());
const controlGroupSlugs = new Set(Object.keys(componentControlGroups));
const groupedSlugCounts = new Map<string, number>();

for (const group of componentGroupDefinitions) {
  for (const slug of group.slugs) {
    groupedSlugCounts.set(slug, (groupedSlugCounts.get(slug) ?? 0) + 1);
  }
}

const reactStyledFixtureSlugs = readObjectLiteralKeys(
  new URL("../src/components/react/fixtures/styled.jsx", import.meta.url),
  "reactStyledFixtures",
);
const solidStyledFixtureSlugs = readObjectLiteralKeys(
  new URL("../src/components/solid/fixtures/styled.tsx", import.meta.url),
  "solidStyledFixtures",
);

const missingManifestEntries = reactSpectrumCatalogue
  .filter((entry) => !comparisonSlugs.has(entry.slug))
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const extraManifestEntries = comparisonEntries
  .filter((entry) => !officialSlugs.has(entry.slug))
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const missingSidebarEntries = reactSpectrumCatalogue
  .filter((entry) => !groupedSlugCounts.has(entry.slug))
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const duplicateSidebarEntries = [...groupedSlugCounts]
  .filter(([, count]) => count > 1)
  .map(([slug, count]) => ({
    slug,
    title: titleForSlug(slug),
    detail: `${count} sidebar groups`,
  }));
const unknownSidebarEntries = [...groupedSlugCounts.keys()]
  .filter((slug) => !officialSlugs.has(slug))
  .map((slug) => ({ slug, title: slug }));
const missingControlGroups = reactSpectrumCatalogue
  .filter((entry) => !controlGroupSlugs.has(entry.slug))
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const gapControlGroups = reactSpectrumCatalogue
  .filter(
    (entry) =>
      componentControlGroups[entry.slug as keyof typeof componentControlGroups]?.coverage === "gap",
  )
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const emptyModeledControlGroups = reactSpectrumCatalogue
  .filter((entry) => {
    const controls = componentControlGroups[entry.slug as keyof typeof componentControlGroups];
    return controls?.coverage === "modeled" && controls.controls.length === 0;
  })
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const missingReactStyledFixtures = reactSpectrumCatalogue
  .filter((entry) => {
    const manifestEntry = comparisonEntriesBySlug.get(entry.slug);
    return (
      manifestEntry?.layers.styled.react === "live" && !reactStyledFixtureSlugs.has(entry.slug)
    );
  })
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const missingSolidStyledFixtures = reactSpectrumCatalogue
  .filter((entry) => {
    const manifestEntry = comparisonEntriesBySlug.get(entry.slug);
    return (
      manifestEntry?.layers.styled.solid === "live" && !solidStyledFixtureSlugs.has(entry.slug)
    );
  })
  .map((entry) => ({ slug: entry.slug, title: entry.title }));
const missingValidationNotes = reactSpectrumCatalogue
  .filter((entry) => !hasValidationNote(entry.slug))
  .map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    detail: `expected one of ${noteCandidates(entry.slug).join(", ")}`,
  }));
const noCurrentVisualEvidence = reactSpectrumCatalogue
  .filter((entry) => !hasCurrentVisualEvidence(entry.slug))
  .map((entry) => ({ slug: entry.slug, title: entry.title }));

const blockingGaps = [
  missingManifestEntries,
  extraManifestEntries,
  missingSidebarEntries,
  duplicateSidebarEntries,
  unknownSidebarEntries,
  missingControlGroups,
  gapControlGroups,
  emptyModeledControlGroups,
  missingReactStyledFixtures,
  missingSolidStyledFixtures,
  missingValidationNotes,
].reduce((count, gaps) => count + gaps.length, 0);
const depthGaps = noCurrentVisualEvidence.length;

console.log("Comparison component parity audit");
console.log(`Official S2 catalogue entries: ${reactSpectrumCatalogue.length}`);
console.log(`Comparison manifest entries: ${comparisonEntries.length}`);
console.log(
  `Sidebar grouped official entries: ${reactSpectrumCatalogue.length - missingSidebarEntries.length}`,
);
console.log(
  `Official entries with modeled controls: ${
    reactSpectrumCatalogue.length - missingControlGroups.length - gapControlGroups.length
  }`,
);
console.log(
  `Official entries with validation notes: ${
    reactSpectrumCatalogue.length - missingValidationNotes.length
  }`,
);
console.log(
  `Official entries with current visual/asserted evidence: ${
    reactSpectrumCatalogue.length - depthGaps
  }`,
);
console.log("");
console.log(
  "Note: React Spectrum S2 documents this route as `Icons`; the comparison slug is `icons`.",
);
console.log("");

printGapSection(
  "Official catalogue entries missing from comparison manifest",
  missingManifestEntries,
);
printGapSection("Comparison manifest entries outside official S2 catalogue", extraManifestEntries);
printGapSection("Official entries missing from sidebar grouping", missingSidebarEntries);
printGapSection("Sidebar entries duplicated across groups", duplicateSidebarEntries);
printGapSection("Sidebar entries outside official S2 catalogue", unknownSidebarEntries);
printGapSection("Official entries missing modeled control groups", missingControlGroups);
printGapSection("Official entries with gap control groups", gapControlGroups);
printGapSection(
  "Official entries with modeled but empty control groups",
  emptyModeledControlGroups,
);
printGapSection("Live React styled entries missing React fixtures", missingReactStyledFixtures);
printGapSection("Live Solid styled entries missing Solid fixtures", missingSolidStyledFixtures);
printGapSection("Official entries missing validation-note coverage", missingValidationNotes);
printGapSection(
  "Official entries without current visual/asserted evidence",
  noCurrentVisualEvidence,
);

if (strict && (blockingGaps > 0 || depthGaps > 0)) {
  process.exitCode = 1;
}
