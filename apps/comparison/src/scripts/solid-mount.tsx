import { render } from "solid-js/web";
import ComparisonIsland from "../components/solid/ComparisonIsland.tsx";
import type { ComparisonLayerId, ComparisonSlug } from "../data/comparison-manifest";

export function mountSolidComparisonIslands(root: ParentNode = document) {
  for (const mountNode of root.querySelectorAll<HTMLElement>(".js-solid-mount")) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    const componentSlug = mountNode.dataset.componentSlug as ComparisonSlug | undefined;
    const layer = mountNode.dataset.layer as ComparisonLayerId | undefined;

    if (!componentSlug || !layer) {
      continue;
    }

    render(
      () =>
        ComparisonIsland({
          componentSlug,
          layer,
        }),
      mountNode,
    );
  }
}

mountSolidComparisonIslands();
