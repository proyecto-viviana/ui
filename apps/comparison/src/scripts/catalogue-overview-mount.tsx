import { render } from "solid-js/web";
import CatalogueOverview from "@comparison/components/solid/CatalogueOverview";
import { mountOnAstroPage } from "./mount-on-astro-page";

function mountCatalogueOverview() {
  for (const mountNode of document.querySelectorAll<HTMLElement>(".js-catalogue-overview-mount")) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    mountNode.replaceChildren();
    render(() => CatalogueOverview(), mountNode);
  }
}

mountOnAstroPage(mountCatalogueOverview);
