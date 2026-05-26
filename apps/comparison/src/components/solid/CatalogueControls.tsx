import { createEffect, createSignal, onMount } from "solid-js";
import { Picker, Provider, SearchField } from "@proyecto-viviana/solid-spectrum";
import { hc } from "./solid-h";
import { createComparisonColorScheme } from "./useComparisonColorScheme";

type CatalogueParityFilter = "all" | "matched" | "partial" | "gap";
type CatalogueStatusFilter = "all" | "live" | "tracked";
type CatalogueSort = "docs" | "name" | "coverage" | "parity";

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

function normalize(value: unknown) {
  return String(value || "").toLowerCase();
}

function isKnownKey<T extends string>(key: string, options: PickerOption<T>[]): key is T {
  return options.some((option) => option.id === key);
}

function createPicker<T extends string>(
  label: string,
  selectedKey: () => T,
  setSelectedKey: (key: T) => void,
  options: PickerOption<T>[],
) {
  return hc(Picker<PickerOption<T>>, {
    label,
    size: "M",
    items: options,
    getKey: (item: PickerOption<T>) => item.id,
    getTextValue: (item: PickerOption<T>) => item.label,
    get selectedKey() {
      return selectedKey();
    },
    onSelectionChange: (nextKey: unknown) => {
      const key = String(nextKey);
      if (isKnownKey(key, options)) {
        setSelectedKey(key);
      }
    },
  });
}

export default function CatalogueControls() {
  const { resolvedTheme } = createComparisonColorScheme();
  const [query, setQuery] = createSignal("");
  const [parity, setParity] = createSignal<CatalogueParityFilter>("all");
  const [status, setStatus] = createSignal<CatalogueStatusFilter>("all");
  const [sort, setSort] = createSignal<CatalogueSort>("docs");
  let list: HTMLElement | null = null;
  let count: Element | null = null;
  let cards: HTMLElement[] = [];

  const applyCatalogueControls = () => {
    const normalizedQuery = normalize(query());
    const parityFilter = parity();
    const statusFilter = status();
    const sortMode = sort();

    if (!list) {
      return;
    }

    const visible: HTMLElement[] = [];

    for (const card of cards) {
      const searchable = normalize(`${card.dataset.title} ${card.dataset.summary}`);
      const matches =
        (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (parityFilter === "all" || card.dataset.parity === parityFilter) &&
        (statusFilter === "all" || card.dataset.status === statusFilter);

      card.hidden = !matches;
      if (matches) {
        visible.push(card);
      }
    }

    const sorted = [...visible].sort((a, b) => {
      if (sortMode === "name") {
        return String(a.dataset.title).localeCompare(String(b.dataset.title));
      }
      if (sortMode === "coverage") {
        return Number(b.dataset.coverage) - Number(a.dataset.coverage);
      }
      if (sortMode === "parity") {
        return (
          String(a.dataset.parity).localeCompare(String(b.dataset.parity)) ||
          Number(a.dataset.index) - Number(b.dataset.index)
        );
      }
      return Number(a.dataset.index) - Number(b.dataset.index);
    });

    for (const card of sorted) {
      list.append(card);
    }

    if (count) {
      count.textContent = `${visible.length} component${visible.length === 1 ? "" : "s"}`;
    }
  };

  onMount(() => {
    list = document.querySelector("[data-entry-list]");
    count = document.querySelector("[data-result-count]");
    cards = Array.from(document.querySelectorAll<HTMLElement>("[data-entry-card]"));
    applyCatalogueControls();
  });

  createEffect(applyCatalogueControls);

  return hc(
    Provider,
    {
      class: "s2-catalogue-control-provider",
      get colorScheme() {
        return resolvedTheme();
      },
      background: "base",
    },
    [
      hc(
        "form",
        {
          class: "s2-control-grid",
          "data-catalogue-controls": "",
          onSubmit: (event: SubmitEvent) => event.preventDefault(),
        },
        [
          hc(SearchField, {
            label: "Search",
            size: "M",
            name: "query",
            placeholder: "Button, Dialog, Picker",
            get value() {
              return query();
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              setQuery(event.currentTarget.value);
            },
            onChange: (nextValue: string) => setQuery(nextValue),
            onClear: () => setQuery(""),
          }),
          createPicker("Parity", parity, setParity, parityOptions),
          createPicker("Status", status, setStatus, statusOptions),
          createPicker("Sort", sort, setSort, sortOptions),
        ],
      ),
    ],
  )();
}
