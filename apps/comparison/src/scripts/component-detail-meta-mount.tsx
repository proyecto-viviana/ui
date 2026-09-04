import { render } from "solid-js/web";
import ComponentDetailMeta from "@comparison/components/solid/ComponentDetailMeta";
import { mountOnAstroPage } from "./mount-on-astro-page";

function mountComponentDetailMeta() {
  for (const mountNode of document.querySelectorAll<HTMLElement>(
    ".js-component-detail-meta-mount",
  )) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    const slug = mountNode.dataset.componentSlug;
    if (!slug) {
      continue;
    }

    mountNode.dataset.mounted = "true";
    mountNode.replaceChildren();
    render(() => ComponentDetailMeta({ slug }), mountNode);
  }
}

mountOnAstroPage(mountComponentDetailMeta);
