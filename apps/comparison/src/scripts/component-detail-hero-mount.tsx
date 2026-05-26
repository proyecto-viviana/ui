import { render } from "solid-js/web";
import ComponentDetailHero from "@comparison/components/solid/ComponentDetailHero";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-component-detail-hero-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  const slug = mountNode.dataset.componentSlug;
  if (!slug) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  mountNode.replaceChildren();
  render(() => ComponentDetailHero({ slug }), mountNode);
}
