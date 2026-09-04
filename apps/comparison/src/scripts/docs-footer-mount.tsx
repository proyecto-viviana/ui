import { render } from "solid-js/web";
import DocsFooter from "@comparison/components/solid/DocsFooter";
import { mountOnAstroPage } from "./mount-on-astro-page";

function mountDocsFooter() {
  for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-footer-mount")) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    mountNode.replaceChildren();

    render(() => DocsFooter(), mountNode);
  }
}

mountOnAstroPage(mountDocsFooter);
