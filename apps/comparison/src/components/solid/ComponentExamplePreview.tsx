import h from "solid-js/h";
import { Badge, Provider } from "@proyecto-viviana/solid-spectrum";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import {
  getComparisonEntry,
  type ComparisonLayerId,
  type ComparisonSlug,
  type LayerTrack,
} from "@comparison/data/comparison-manifest";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

export interface ComponentExamplePreviewProps {
  slug: string;
}

type FrameworkId = "react" | "solid";

const playgroundLayer: ComparisonLayerId = "styled";

export default function ComponentExamplePreview(props: ComponentExamplePreviewProps) {
  const { resolvedTheme } = createComparisonColorScheme();
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Example preview is unavailable.")();
  }

  const controlGroup = getComponentControlGroup(entry);
  const playgroundTrack = entry.layers[playgroundLayer];

  return hc(
    Provider,
    {
      class: "s2-component-example-preview",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "div",
        { class: "s2-comparison-frame" },
        frameworkPanel({
          framework: "react",
          label: "React",
          product: "React Spectrum S2",
          slug: entry.slug,
          status: playgroundTrack.react,
        }),
        frameworkPanel({
          framework: "solid",
          label: "Solid",
          product: "solid-spectrum",
          slug: entry.slug,
          status: playgroundTrack.solid,
        }),
      ),
      h("p", { class: "s2-example-note" }, controlGroup.note),
    ],
  )();
}

interface FrameworkPanelOptions {
  framework: FrameworkId;
  label: string;
  product: string;
  slug: ComparisonSlug;
  status: LayerTrack["react"];
}

function frameworkPanel(options: FrameworkPanelOptions) {
  return h(
    "article",
    { class: "s2-framework-panel", "data-framework": options.framework },
    h(
      "header",
      {},
      h("span", {}, options.label),
      h("strong", {}, options.product),
      h("em", {}, statusBadge(options.status)),
    ),
    options.status === "live"
      ? h("div", {
          class: `comparison-island js-${options.framework}-mount`,
          "data-component-slug": options.slug,
          "data-layer": playgroundLayer,
        })
      : h("div", { class: "s2-empty-state" }, emptyStateLabel(options.framework, options.status)),
  );
}

function emptyStateLabel(framework: FrameworkId, status: FrameworkPanelOptions["status"]) {
  if (status === "missing") {
    return framework === "react"
      ? "React reference is missing."
      : "Solid implementation is missing.";
  }

  return framework === "react"
    ? "React reference is tracked but not wired yet."
    : "Solid implementation is tracked but not wired yet.";
}

function statusBadge(status: FrameworkPanelOptions["status"]) {
  return hc(
    Badge,
    {
      variant: statusVariant(status),
      fillStyle: "subtle",
      size: "S",
    },
    [status],
  );
}

function statusVariant(status: FrameworkPanelOptions["status"]) {
  if (status === "live") {
    return "positive";
  }
  if (status === "tracked") {
    return "notice";
  }
  if (status === "missing") {
    return "negative";
  }
  return "neutral";
}
