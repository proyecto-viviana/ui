import { render } from "solid-js/web";
import DocsToc from "@comparison/components/solid/DocsToc";
import { parseTocItems } from "@comparison/data/docs-toc";

type DocsTocVariant = "index" | "component" | "page";

function isDocsTocVariant(value: string): value is DocsTocVariant {
  return value === "index" || value === "component" || value === "page";
}

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-toc-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  const variant = mountNode.dataset.variant || "";

  if (!isDocsTocVariant(variant)) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  const slug = mountNode.dataset.componentSlug || undefined;
  const sourceLabel = mountNode.dataset.sourceLabel || undefined;
  const sourceUrl = mountNode.dataset.sourceUrl || undefined;
  const items = parseTocItems(mountNode.dataset.tocItems);
  mountNode.replaceChildren();

  render(
    () =>
      DocsToc({
        items,
        slug,
        sourceLabel,
        sourceUrl,
        variant,
      }),
    mountNode,
  );
}
