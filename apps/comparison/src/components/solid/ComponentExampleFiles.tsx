import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import { getComponentControlGroup } from "@comparison/data/component-controls";
import {
  defaultExampleSourceValues,
  exampleSourceValuesFromSearch,
  generateSolidExampleSource,
  mergeExampleSourceValues,
  type ExampleSourceValues,
} from "@comparison/data/example-source";
import { getComparisonEntry } from "@comparison/data/comparison-manifest";

export interface ComponentExampleFilesProps {
  slug: string;
}

export default function ComponentExampleFiles(props: ComponentExampleFilesProps) {
  const entry = getComparisonEntry(props.slug);

  if (!entry) {
    return h("div", { class: "s2-empty-state" }, "Example source is unavailable.")();
  }

  const controlGroup = getComponentControlGroup(entry);
  const [values, setValues] = createSignal<ExampleSourceValues>(
    typeof window === "undefined"
      ? defaultExampleSourceValues(controlGroup)
      : exampleSourceValuesFromSearch(controlGroup, window.location.search),
  );
  const source = () => generateSolidExampleSource(controlGroup, values());

  const [copied, setCopied] = createSignal(false);
  let copyTimer: ReturnType<typeof setTimeout> | undefined;
  const copySource = () => {
    void navigator.clipboard?.writeText(source());
    setCopied(true);
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => setCopied(false), 1500);
  };

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      const detail = (event as CustomEvent<{ component?: string; props?: ExampleSourceValues }>)
        .detail;

      if (detail?.component !== entry.slug) {
        return;
      }

      setValues(mergeExampleSourceValues(controlGroup, detail.props ?? {}));
    };

    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  onCleanup(() => clearTimeout(copyTimer));

  return h(
    "div",
    { class: "s2-example-files-content" },
    h(
      "div",
      { class: "s2-example-code-card" },
      h(
        "div",
        { class: "s2-example-code-label" },
        h("span", {}, "Generated source"),
        h(
          "button",
          {
            type: "button",
            class: "s2-example-copy",
            onClick: copySource,
            "aria-label": "Copy generated source",
          },
          () => (copied() ? "Copied" : "Copy"),
        ),
      ),
      h("pre", { class: "s2-example-code", tabIndex: 0 }, h("code", {}, source)),
    ),
  )();
}
