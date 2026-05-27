import h from "solid-js/h";
import { For, createMemo, createSignal } from "solid-js";
import {
  Badge,
  Link,
  Meter,
  Picker,
  Provider,
  SearchField,
} from "@proyecto-viviana/solid-spectrum";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import {
  comparisonEntries,
  missingOfficialComparisonEntries,
  officialComparisonEntries,
  type ComparisonEntry,
  type ParityStatus,
} from "@comparison/data/comparison-manifest";
import { getComponentCoverage, type ComponentCoverage } from "@comparison/data/coverage";
import { officialVisualStateSummary } from "@comparison/data/visual-state-matrix";
import { hc, renderProp } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

type CatalogueParityFilter = "all" | ParityStatus;
type CatalogueStatusFilter = "all" | "live" | "tracked";
type CatalogueSort = "docs" | "name" | "coverage" | "parity";

interface CatalogueEntryView {
  entry: ComparisonEntry;
  coverage: ComponentCoverage;
  index: number;
}

interface PickerOption<T extends string> {
  id: T;
  label: string;
}

const parityOptions: PickerOption<CatalogueParityFilter>[] = [
  { id: "all", label: "All" },
  { id: "matched", label: "Matched" },
  { id: "partial", label: "Partial" },
  { id: "gap", label: "Gap" },
];

const statusOptions: PickerOption<CatalogueStatusFilter>[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "tracked", label: "Tracked" },
];

const sortOptions: PickerOption<CatalogueSort>[] = [
  { id: "docs", label: "Docs order" },
  { id: "name", label: "Name" },
  { id: "coverage", label: "Coverage" },
  { id: "parity", label: "Parity" },
];

const catalogueEntries: CatalogueEntryView[] = comparisonEntries.map((entry, index) => ({
  entry,
  index,
  coverage: getComponentCoverage(entry, getComponentControlGroup(entry)),
}));

const overallCoverage = Math.round(
  catalogueEntries.reduce((sum, item) => sum + item.coverage.overall, 0) / catalogueEntries.length,
);

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function isKnownKey<T extends string>(key: string, options: PickerOption<T>[]): key is T {
  return options.some((option) => option.id === key);
}

function parityVariant(parity: ParityStatus) {
  if (parity === "matched") {
    return "positive";
  }
  if (parity === "partial") {
    return "notice";
  }
  return "negative";
}

function PickerControl<T extends string>(props: {
  label: string;
  options: PickerOption<T>[];
  selectedKey: T;
  onSelectionChange: (key: T) => void;
}) {
  return hc(Picker, {
    get label() {
      return props.label;
    },
    size: "M",
    get items() {
      return props.options;
    },
    getKey: (item: PickerOption<T>) => item.id,
    getTextValue: (item: PickerOption<T>) => item.label,
    get selectedKey() {
      return props.selectedKey;
    },
    onSelectionChange: (nextKey: unknown) => {
      const key = String(nextKey);
      if (isKnownKey(key, props.options)) {
        props.onSelectionChange(key);
      }
    },
  });
}

export default function CatalogueOverview() {
  const { resolvedTheme } = createComparisonColorScheme();
  const [query, setQuery] = createSignal("");
  const [parity, setParity] = createSignal<CatalogueParityFilter>("all");
  const [status, setStatus] = createSignal<CatalogueStatusFilter>("all");
  const [sort, setSort] = createSignal<CatalogueSort>("docs");

  const visibleEntries = createMemo(() => {
    const normalizedQuery = normalize(query());
    const parityFilter = parity();
    const statusFilter = status();
    const sortMode = sort();

    const visible = catalogueEntries.filter(({ entry }) => {
      const searchable = normalize(`${entry.title} ${entry.summary}`);
      return (
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (parityFilter === "all" || entry.parity === parityFilter) &&
        (statusFilter === "all" || entry.priority === statusFilter)
      );
    });

    return [...visible].sort((a, b) => {
      if (sortMode === "name") {
        return a.entry.title.localeCompare(b.entry.title);
      }
      if (sortMode === "coverage") {
        return b.coverage.overall - a.coverage.overall;
      }
      if (sortMode === "parity") {
        return a.entry.parity.localeCompare(b.entry.parity) || a.index - b.index;
      }
      return a.index - b.index;
    });
  });

  return hc(
    Provider,
    {
      class: "s2-catalogue-overview",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      h(
        "section",
        { class: "s2-example", "aria-labelledby": "coverage-title" },
        h(
          "div",
          { class: "s2-example-preview" },
          h(
            "div",
            { class: "s2-overall-coverage" },
            h(Meter, {
              label: "Overall coverage",
              value: overallCoverage,
              valueLabel: `${overallCoverage}%`,
              size: "XL",
            }),
          ),
          h(
            "div",
            { class: "s2-stat-grid" },
            statItem("Official S2", officialComparisonEntries.length),
            statItem(
              "Live routes",
              comparisonEntries.filter((entry) => entry.priority === "live").length,
            ),
            statItem("Gaps", missingOfficialComparisonEntries.length),
            statItem("Visual evidence", officialVisualStateSummary.visualEvidenceStates),
            statItem("Strict pairs", officialVisualStateSummary.strictPairDiffStates),
          ),
        ),
        h(
          "div",
          { class: "s2-example-controls" },
          h("h2", { id: "coverage-title" }, "Catalogue controls"),
          h(
            "form",
            {
              class: "s2-control-grid",
              "data-catalogue-controls": "",
              onSubmit: (event: SubmitEvent) => event.preventDefault(),
            },
            hc(SearchField, {
              label: "Search",
              size: "M",
              name: "query",
              placeholder: "Button, Dialog, Picker",
              get value() {
                return query();
              },
              onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) =>
                setQuery(event.currentTarget.value),
              onChange: setQuery,
              onClear: () => setQuery(""),
            }),
            PickerControl({
              label: "Parity",
              options: parityOptions,
              get selectedKey() {
                return parity();
              },
              onSelectionChange: setParity,
            }),
            PickerControl({
              label: "Status",
              options: statusOptions,
              get selectedKey() {
                return status();
              },
              onSelectionChange: setStatus,
            }),
            PickerControl({
              label: "Sort",
              options: sortOptions,
              get selectedKey() {
                return sort();
              },
              onSelectionChange: setSort,
            }),
          ),
        ),
      ),
      h(
        "section",
        { class: "s2-section", "aria-labelledby": "components-title" },
        h(
          "div",
          { class: "s2-section-heading" },
          h("h2", { id: "components-title" }, "Components"),
          h("span", { "data-result-count": "" }, () => {
            const count = visibleEntries().length;
            return `${count} component${count === 1 ? "" : "s"}`;
          }),
        ),
        h(
          "div",
          { class: "s2-component-list", "data-entry-list": "" },
          hc(
            For as never,
            {
              get each() {
                return visibleEntries();
              },
            },
            renderProp((item: CatalogueEntryView) => componentRow(item)),
          ),
        ),
      ),
    ],
  )();
}

function statItem(label: string, value: number) {
  return h("div", {}, h("span", {}, label), h("strong", {}, String(value)));
}

function componentRow({ entry, coverage, index }: CatalogueEntryView) {
  return hc(
    Link,
    {
      href: `/components/${entry.slug}`,
      UNSAFE_className: "s2-component-row",
      variant: "secondary",
      isStandalone: true,
      isQuiet: true,
      "data-entry-card": "",
      "data-index": index,
      "data-title": entry.title,
      "data-summary": entry.summary,
      "data-parity": entry.parity,
      "data-status": entry.priority,
      "data-source": entry.catalogueSource,
      "data-coverage": coverage.overall,
    },
    [
      h("span", { class: "s2-component-name" }, entry.title),
      h("span", { class: "s2-component-summary" }, entry.summary),
      h(
        "span",
        { class: "s2-component-coverage" },
        h(Meter, {
          "aria-label": `${entry.title} coverage`,
          value: coverage.overall,
          size: "S",
        }),
      ),
      h(
        "span",
        { class: "s2-component-parity" },
        hc(
          Badge,
          {
            variant: parityVariant(entry.parity),
            fillStyle: "subtle",
            size: "S",
          },
          [entry.parity],
        ),
      ),
    ],
  );
}
