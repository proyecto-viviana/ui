import {
  missingOfficialComparisonEntries,
  officialComparisonEntries,
} from "../src/data/comparison-manifest";
import {
  reactSpectrumCatalogue,
  reactSpectrumCatalogueSource,
} from "../src/data/react-spectrum-catalogue";
import {
  officialVisualStateCoverage,
  officialVisualStateSummary,
} from "../src/data/visual-state-matrix";

const officialLive = officialComparisonEntries.filter(
  (entry) => entry.layers.styled.react === "live" && entry.layers.styled.solid === "live",
);
const nonStrictVisualOfficialStates = officialVisualStateCoverage.flatMap((entry) =>
  entry.states
    .filter(
      (state) =>
        state.react === "visual" && state.solid === "visual" && state.pairDiff !== "strict",
    )
    .map((state) => `${entry.title}: ${state.label} (${state.pairDiff})`),
);
const plannedOfficialStates = officialVisualStateCoverage.flatMap((entry) =>
  entry.states
    .filter((state) => state.pairDiff === "planned" || state.pairDiff === "blocked")
    .map((state) => `${entry.title}: ${state.label} (${state.pairDiff})`),
);
console.log(`React Spectrum catalogue source: ${reactSpectrumCatalogueSource.url}`);
console.log(`Official S2 catalogue entries: ${reactSpectrumCatalogue.length}`);
console.log(`Official entries in comparison app: ${officialComparisonEntries.length}`);
console.log(`Official styled entries live on both sides: ${officialLive.length}`);
console.log(`Official entries still missing/gap: ${missingOfficialComparisonEntries.length}`);
console.log(`Official visual states tracked: ${officialVisualStateSummary.states}`);
console.log(
  `Official visual states with current React/Solid visual evidence: ${officialVisualStateSummary.visualEvidenceStates}`,
);
console.log(
  `Official visual states with strict pair-diff tests: ${officialVisualStateSummary.strictPairDiffStates}`,
);
console.log(
  `Official visual states blocked by missing implementations: ${officialVisualStateSummary.blockedStates}`,
);

if (missingOfficialComparisonEntries.length > 0) {
  console.log("\nMissing/gap official entries:");
  for (const entry of missingOfficialComparisonEntries) {
    console.log(
      `- ${entry.title} (${entry.category}) react=${entry.layers.styled.react} solid=${entry.layers.styled.solid} ${entry.docsUrl ?? ""}`,
    );
  }
}

if (nonStrictVisualOfficialStates.length > 0) {
  console.log("\nOfficial states with current visual evidence but non-strict pair diff:");
  for (const state of nonStrictVisualOfficialStates) {
    console.log(`- ${state}`);
  }
}

if (plannedOfficialStates.length > 0) {
  console.log("\nOfficial states without complete visual/pair-diff coverage:");
  for (const state of plannedOfficialStates) {
    console.log(`- ${state}`);
  }
}
