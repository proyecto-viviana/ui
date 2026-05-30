import React from "react";
import { createRoot } from "react-dom/client";
import ComparisonIsland from "../components/react/ComparisonIsland.js";

export function mountReactComparisonIslands(root: ParentNode = document) {
  for (const mountNode of root.querySelectorAll<HTMLElement>(".js-react-mount")) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    createRoot(mountNode).render(
      React.createElement(ComparisonIsland, {
        componentSlug: mountNode.dataset.componentSlug,
        layer: mountNode.dataset.layer,
      }),
    );
  }
}

mountReactComparisonIslands();
