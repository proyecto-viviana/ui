import React from "react";
import { createRoot } from "react-dom/client";
import ComparisonIsland from "../components/react/ComparisonIsland.js";

const pendingByNode = new WeakMap<HTMLElement, Promise<void>>();

export function mountReactComparisonIslands(root: ParentNode = document) {
  const jobs: Promise<void>[] = [];

  for (const mountNode of root.querySelectorAll<HTMLElement>(".js-react-mount")) {
    const pending = pendingByNode.get(mountNode);
    if (pending) {
      jobs.push(pending);
      continue;
    }
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    const job = new Promise<void>((resolve) => {
      createRoot(mountNode).render(
        React.createElement(ComparisonIsland, {
          componentSlug: mountNode.dataset.componentSlug,
          layer: mountNode.dataset.layer,
          onFixtureReady: resolve,
        }),
      );
    });
    pendingByNode.set(mountNode, job);
    jobs.push(job);
  }

  return Promise.all(jobs);
}

void mountReactComparisonIslands();
