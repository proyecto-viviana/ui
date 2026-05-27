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

  return h("div", { class: "s2-example-files-content" }, [
    h(
      "div",
      { class: "s2-example-code-card" },
      h(
        "div",
        { class: "s2-example-code-label" },
        h("span", {}, "Generated source"),
        h("strong", {}, "solid-spectrum route"),
      ),
      h("pre", { class: "s2-example-code" }, h("code", {}, source)),
    ),
    h(
      "details",
      { class: "s2-example-note" },
      h("summary", {}, "Porting note"),
      h("p", {}, controlGroup.note),
    ),
  ])();
}
