import { render } from "solid-js/web";
import CatalogueControls from "@comparison/components/solid/CatalogueControls";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-catalogue-controls-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  mountNode.replaceChildren();
  render(() => CatalogueControls(), mountNode);
}
