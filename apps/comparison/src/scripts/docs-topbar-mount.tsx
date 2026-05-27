import { render } from "solid-js/web";
import DocsTopBar from "@comparison/components/solid/DocsTopBar";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-topbar-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  const activeSlug = mountNode.dataset.activeSlug || undefined;
  const navigationLabel = mountNode.dataset.navigationLabel || undefined;
  const reactSpectrumUrl = mountNode.dataset.reactSpectrumUrl || undefined;
  const referenceLabel = mountNode.dataset.referenceLabel || undefined;
  const referenceUrl = mountNode.dataset.referenceUrl || undefined;
  mountNode.replaceChildren();

  render(
    () =>
      DocsTopBar({
        activeSlug,
        navigationLabel,
        reactSpectrumUrl,
        referenceLabel,
        referenceUrl,
      }),
    mountNode,
  );
}
