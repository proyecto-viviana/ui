import { render } from "solid-js/web";
import CatalogueOverview from "@comparison/components/solid/CatalogueOverview";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-catalogue-overview-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  mountNode.replaceChildren();
  render(() => CatalogueOverview(), mountNode);
}
