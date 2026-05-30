import { render } from "solid-js/web";
import MarketingCta from "@comparison/components/solid/marketing/MarketingCta";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-marketing-cta-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.replaceChildren();
  render(() => MarketingCta(), mountNode);
  mountNode.dataset.mounted = "true";
}
