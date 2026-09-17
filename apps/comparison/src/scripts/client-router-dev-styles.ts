/**
 * Vite dev dynamically injects <style data-vite-dev-id="..."> at runtime
 * into document.head via module execution. When Astro's ClientRouter navigates
 * between pages, its swapHeadElements diffs against the incoming HTML (which
 * lacks these Vite dev styles) and removes them.
 *
 * Preserving them in event.newDocument.head prevents Astro from purging them.
 */

const DEV_STYLE_LISTENER_KEY = "__comparison_dev_styles_swap_installed__";

export function initClientRouterDevStyles(): void {
  if (!import.meta.env.DEV || typeof document === "undefined") {
    return;
  }

  const globalScope = window as unknown as Record<string, boolean>;
  if (globalScope[DEV_STYLE_LISTENER_KEY]) {
    return;
  }
  globalScope[DEV_STYLE_LISTENER_KEY] = true;

  document.addEventListener("astro:before-swap", (event) => {
    const newDoc = (event as { newDocument?: Document }).newDocument;
    if (!newDoc?.head) return;

    const existingIds = new Set<string>();
    for (const el of newDoc.head.querySelectorAll("style[data-vite-dev-id]")) {
      const id = el.getAttribute("data-vite-dev-id");
      if (id) {
        existingIds.add(id);
      }
    }

    for (const style of document.head.querySelectorAll("style[data-vite-dev-id]")) {
      const id = style.getAttribute("data-vite-dev-id");
      if (id && !existingIds.has(id)) {
        newDoc.head.appendChild(style.cloneNode(true));
        existingIds.add(id);
      }
    }
  });
}

initClientRouterDevStyles();
