import { render } from "solid-js/web";
import DocsTopBar from "@comparison/components/solid/DocsTopBar";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-topbar-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  const reactSpectrumUrl = mountNode.dataset.reactSpectrumUrl || undefined;
  mountNode.replaceChildren();

  render(
    () =>
      DocsTopBar({
        reactSpectrumUrl,
      }),
    mountNode,
  );
}
