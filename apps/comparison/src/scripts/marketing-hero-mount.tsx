import { render } from "solid-js/web";
import MarketingHero from "@comparison/components/solid/marketing/MarketingHero";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-marketing-hero-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.replaceChildren();
  render(() => MarketingHero(), mountNode);
  mountNode.dataset.mounted = "true";
}
