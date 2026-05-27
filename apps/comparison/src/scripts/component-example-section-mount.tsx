import { render } from "solid-js/web";
import ComponentExampleSection from "@comparison/components/solid/ComponentExampleSection";
import { initializeComparisonControls } from "@comparison/scripts/component-controls";

for (const mountNode of document.querySelectorAll<HTMLElement>(
  ".js-component-example-section-mount",
)) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  const slug = mountNode.dataset.componentSlug;

  if (!slug) {
    continue;
  }

  mountNode.replaceChildren();
  render(() => ComponentExampleSection({ slug }), mountNode);
  initializeComparisonControls(mountNode);
  mountNode.dataset.controlsMounted = "true";
  mountNode.dataset.mounted = "true";

  void Promise.all([import("./react-mount"), import("./solid-mount")]).then(
    ([reactMount, solidMount]) => {
      reactMount.mountReactComparisonIslands(mountNode);
      solidMount.mountSolidComparisonIslands(mountNode);
      mountNode.dataset.islandsMounted = "true";
    },
  );
}
