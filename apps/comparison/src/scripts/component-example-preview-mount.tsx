import { render } from "solid-js/web";
import ComponentExamplePreview from "@comparison/components/solid/ComponentExamplePreview";

for (const mountNode of document.querySelectorAll<HTMLElement>(
  ".js-component-example-preview-mount",
)) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  const slug = mountNode.dataset.componentSlug;

  if (!slug) {
    continue;
  }

  mountNode.replaceChildren();
  render(() => ComponentExamplePreview({ slug }), mountNode);
  mountNode.dataset.mounted = "true";

  void Promise.all([import("./react-mount"), import("./solid-mount")]).then(
    ([reactMount, solidMount]) => {
      reactMount.mountReactComparisonIslands(mountNode);
      solidMount.mountSolidComparisonIslands(mountNode);
      mountNode.dataset.islandsMounted = "true";
    },
  );
}
