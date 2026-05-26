import { render } from "solid-js/web";
import IndexHero from "@comparison/components/solid/IndexHero";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-index-hero-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.replaceChildren();
  render(() => IndexHero(), mountNode);
  mountNode.dataset.mounted = "true";
}
