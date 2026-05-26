import { render } from "solid-js/web";
import DocsSidebar from "@comparison/components/solid/DocsSidebar";

for (const mountNode of document.querySelectorAll<HTMLElement>(".js-docs-sidebar-mount")) {
  if (mountNode.dataset.mounted) {
    continue;
  }

  mountNode.dataset.mounted = "true";
  const activeSlug = mountNode.dataset.activeSlug || undefined;
  const navigationLabel = mountNode.dataset.navigationLabel || undefined;
  const referenceLabel = mountNode.dataset.referenceLabel || undefined;
  const referenceUrl = mountNode.dataset.referenceUrl || undefined;
  mountNode.replaceChildren();

  render(
    () =>
      DocsSidebar({
        activeSlug,
        navigationLabel,
        referenceLabel,
        referenceUrl,
      }),
    mountNode,
  );
}
