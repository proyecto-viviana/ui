import h from "solid-js/h";
import {
  getComparisonEntry,
  type ComparisonLayerId,
  type ComparisonSlug,
  type LayerTrack,
} from "@comparison/data/comparison-manifest";
import { getExamplePreviewLayout } from "@comparison/data/example-layout";

export interface ComponentExamplePreviewProps {
  slug: string;
}

type FrameworkId = "react" | "solid";

const playgroundLayer: ComparisonLayerId = "styled";

export default function ComponentExamplePreview(props: ComponentExamplePreviewProps) {
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Example preview is unavailable.")();
  }

  const playgroundTrack = entry.layers[playgroundLayer];

  return h(
    "div",
    { class: "s2-component-example-preview" },
    h(
      "div",
      { class: "s2-comparison-frame", "data-preview-layout": getExamplePreviewLayout(entry.slug) },
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
    {
      class: "s2-framework-panel",
      "data-framework": options.framework,
      "aria-label": `${options.label} ${options.product}`,
    },
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
          tabIndex: 0,
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
  return h(
    "span",
    {
      class: "s2-framework-status",
      "data-status": status,
    },
    status,
  );
}
