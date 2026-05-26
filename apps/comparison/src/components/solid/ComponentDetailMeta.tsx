import h from "solid-js/h";
import { Badge, Meter, Provider } from "@proyecto-viviana/solid-spectrum";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import { getComponentCoverage, type CoverageMetric } from "@comparison/data/coverage";
import {
  comparisonEntries,
  layerOrder,
  type ComparisonEntry,
  type ComparisonLayerId,
} from "@comparison/data/comparison-manifest";
import {
  getVisualStateTargets,
  type PairDiffStatus,
  type VisualStateSideStatus,
  type VisualStateTarget,
} from "@comparison/data/visual-state-matrix";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

const playgroundLayer: ComparisonLayerId = "styled";

const layerTitles: Record<ComparisonLayerId, string> = {
  styled: "Styled Layer",
  components: "Component Layer",
  headless: "Headless Layer",
  state: "State Layer",
};

export interface ComponentDetailMetaProps {
  slug: string;
}

export default function ComponentDetailMeta(props: ComponentDetailMetaProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const entry = comparisonEntries.find((item) => item.slug === props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Component metadata is unavailable.")();
  }

  const controlGroup = getComponentControlGroup(entry);
  const coverage = getComponentCoverage(entry, controlGroup);
  const visualStates = getVisualStateTargets(entry);
  const supportingLayers = layerOrder.filter((layer) => layer !== playgroundLayer);

  return hc(
    Provider,
    {
      class: "s2-component-detail-meta",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      coverageSection(coverage.metrics, coverage.overall),
      visualStateSection(visualStates),
      apiSection(entry, controlGroup.apiProps),
      ...supportingLayers.map((layer) => supportingLayerSection(entry, layer)),
    ],
  )();
}

function coverageSection(metrics: readonly CoverageMetric[], overall: number) {
  return h(
    "section",
    { class: "s2-section", id: "coverage", "aria-labelledby": "coverage-title" },
    h(
      "div",
      { class: "s2-section-heading" },
      h("h2", { id: "coverage-title" }, "Coverage"),
      h("span", {}, `${overall}%`),
    ),
    h(
      "div",
      { class: "s2-coverage-list" },
      metrics.map((item) =>
        h(
          "div",
          { class: "s2-coverage-row" },
          h("span", {}, item.label),
          h(
            "span",
            { class: "s2-coverage-meter" },
            h(Meter, {
              "aria-label": `${item.label} coverage`,
              value: item.value,
              valueLabel: `${item.value}%`,
              size: "S",
            }),
          ),
          h("strong", {}, `${item.value}%`),
        ),
      ),
    ),
  );
}

function visualStateSection(visualStates: readonly VisualStateTarget[]) {
  return h(
    "section",
    {
      class: "s2-section",
      id: "visual-state-coverage",
      "aria-labelledby": "visual-title",
    },
    h(
      "div",
      { class: "s2-section-heading" },
      h("h2", { id: "visual-title" }, "Visual State Coverage"),
      h("span", {}, `${visualStates.length} states`),
    ),
    h(
      "div",
      { class: "s2-state-list" },
      visualStates.map((state) =>
        h(
          "article",
          { class: "s2-state-row" },
          h("div", {}, h("span", {}, state.kind), h("h3", {}, state.label), h("p", {}, state.note)),
          h(
            "div",
            {},
            statusBadge(`React ${state.react}`, sideStatusVariant(state.react)),
            statusBadge(`Solid ${state.solid}`, sideStatusVariant(state.solid)),
            statusBadge(state.pairDiff, pairDiffVariant(state.pairDiff)),
          ),
        ),
      ),
    ),
  );
}

function apiSection(entry: ComparisonEntry, apiProps: readonly string[]) {
  return h(
    "section",
    { class: "s2-section", id: "api", "aria-labelledby": "api-title" },
    h(
      "div",
      { class: "s2-section-heading" },
      h("h2", { id: "api-title" }, "API"),
      h("span", {}, apiProps.length > 0 ? String(apiProps.length) : "missing"),
    ),
    apiProps.length > 0
      ? h(
          "div",
          { class: "s2-api-table", role: "table", "aria-label": `${entry.title} API props` },
          apiProps.map((prop) =>
            h(
              "div",
              { role: "row" },
              h("code", { role: "cell" }, prop),
              h("span", { role: "cell", class: "s2-api-status" }, statusBadge("tracked", "notice")),
            ),
          ),
        )
      : h("div", { class: "s2-empty-state" }, "API prop metadata has not been imported yet."),
  );
}

function supportingLayerSection(entry: ComparisonEntry, layer: ComparisonLayerId) {
  const track = entry.layers[layer];

  return h(
    "section",
    { class: "s2-section", id: layer, "aria-labelledby": `${layer}-title` },
    h(
      "div",
      { class: "s2-section-heading" },
      h("h2", { id: `${layer}-title` }, layerTitles[layer]),
      statusBadge(track.solid, layerStatusVariant(track.solid)),
    ),
    h("p", {}, track.summary),
    h("p", {}, track.note),
  );
}

function statusBadge(
  label: string,
  variant: "positive" | "notice" | "negative" | "neutral" = "neutral",
) {
  return h(
    "span",
    { class: "s2-status-badge" },
    hc(
      Badge,
      {
        variant,
        fillStyle: "subtle",
        size: "S",
      },
      [label],
    ),
  );
}

function sideStatusVariant(status: VisualStateSideStatus) {
  if (status === "visual" || status === "asserted") {
    return "positive";
  }
  if (status === "planned") {
    return "notice";
  }
  if (status === "missing") {
    return "negative";
  }
  return "neutral";
}

function pairDiffVariant(status: PairDiffStatus) {
  if (status === "strict" || status === "asserted") {
    return "positive";
  }
  if (status === "planned") {
    return "notice";
  }
  if (status === "blocked") {
    return "negative";
  }
  return "neutral";
}

function layerStatusVariant(status: string) {
  if (status === "live") {
    return "positive";
  }
  if (status === "tracked" || status === "planned") {
    return "notice";
  }
  if (status === "missing") {
    return "negative";
  }
  return "neutral";
}
