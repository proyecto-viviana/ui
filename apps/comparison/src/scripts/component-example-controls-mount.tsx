import { render } from "solid-js/web";
import ComponentExampleControls from "@comparison/components/solid/ComponentExampleControls";
import { initializeComparisonControls } from "@comparison/scripts/component-controls";

for (const mountNode of document.querySelectorAll<HTMLElement>(
  ".js-component-example-controls-mount",
)) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  const slug = mountNode.dataset.componentSlug;

  if (!slug) {
    continue;
  }

  mountNode.replaceChildren();

  render(() => ComponentExampleControls({ slug }), mountNode);
  initializeComparisonControls(mountNode);
  window.dispatchEvent(new CustomEvent("comparison:theme-controls-mounted"));
  mountNode.dataset.mounted = "true";
}
