import { render } from "solid-js/web";
import DocsFooter from "@comparison/components/solid/DocsFooter";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-footer-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  mountNode.replaceChildren();

  render(() => DocsFooter(), mountNode);
}
