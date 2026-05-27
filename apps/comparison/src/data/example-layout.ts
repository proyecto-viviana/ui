import type { ComparisonSlug } from "./comparison-manifest";

export type ExamplePreviewLayout = "split" | "stacked";

const widthSensitivePreviewSlugs = new Set<ComparisonSlug>([
  "actionbar",
  "breadcrumbs",
  "calendar",
  "cardview",
  "combobox",
  "datepicker",
  "daterangepicker",
  "dialog",
  "dropzone",
  "form",
  "illustratedmessage",
  "listview",
  "rangecalendar",
  "tableview",
  "taggroup",
  "treeview",
]);

export function getExamplePreviewLayout(slug: ComparisonSlug): ExamplePreviewLayout {
  return widthSensitivePreviewSlugs.has(slug) ? "stacked" : "split";
}
