import { createComponent, render } from "solid-js/web";
import ComparisonIsland from "../components/solid/ComparisonIsland.tsx";
import type { ComparisonLayerId, ComparisonSlug } from "../data/comparison-manifest";

const pendingByNode = new WeakMap<HTMLElement, Promise<void>>();

export function mountSolidComparisonIslands(root: ParentNode = document) {
  const jobs: Promise<void>[] = [];

  for (const mountNode of root.querySelectorAll<HTMLElement>(".js-solid-mount")) {
    const pending = pendingByNode.get(mountNode);
    if (pending) {
      jobs.push(pending);
      continue;
    }
    if (mountNode.dataset.mounted) {
      continue;
    }

    const componentSlug = mountNode.dataset.componentSlug as ComparisonSlug | undefined;
    const layer = mountNode.dataset.layer as ComparisonLayerId | undefined;
    if (!componentSlug || !layer) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    const job = new Promise<void>((resolve) => {
      render(
        () =>
          createComponent(ComparisonIsland, {
            componentSlug,
            layer,
            onFixtureReady: resolve,
          }),
        mountNode,
      );
    });
    pendingByNode.set(mountNode, job);
    jobs.push(job);
  }

  return Promise.all(jobs);
}

void mountSolidComparisonIslands();
