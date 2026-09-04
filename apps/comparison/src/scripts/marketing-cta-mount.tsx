import { render } from "solid-js/web";
import MarketingCta from "@comparison/components/solid/marketing/MarketingCta";
import { mountOnAstroPage } from "./mount-on-astro-page";

function mountMarketingCta() {
  for (const mountNode of document.querySelectorAll<HTMLElement>(".js-marketing-cta-mount")) {
    if (mountNode.dataset.mounted) {
      continue;
    }

    mountNode.replaceChildren();
    render(() => MarketingCta(), mountNode);
    mountNode.dataset.mounted = "true";
  }
}

mountOnAstroPage(mountMarketingCta);
