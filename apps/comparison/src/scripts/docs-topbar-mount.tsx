import { render } from "solid-js/web";
import DocsTopBar from "@comparison/components/solid/DocsTopBar";
import { parseTocItems, type DocsTocVariant } from "@comparison/data/docs-toc";

function toDocsTocVariant(value: string | undefined): DocsTocVariant {
  return value === "component" || value === "page" ? value : "index";
}

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
  const tocItems = parseTocItems(mountNode.dataset.tocItems);
  const tocSlug = mountNode.dataset.tocSlug || undefined;
  const tocVariant = toDocsTocVariant(mountNode.dataset.tocVariant);
  mountNode.replaceChildren();

  render(
    () =>
      DocsTopBar({
        activeSlug,
        navigationLabel,
        reactSpectrumUrl,
        referenceLabel,
        referenceUrl,
        tocItems,
        tocSlug,
        tocVariant,
      }),
    mountNode,
  );
}
