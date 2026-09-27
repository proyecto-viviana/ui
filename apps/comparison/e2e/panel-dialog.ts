import { selectors, type Locator, type Page } from "@playwright/test";
import type { PanelFramework } from "./drivers/scenario";

export interface PanelDialogContext {
  page: Page;
  /** The driven panel's `.comparison-reference-canvas`. */
  canvas: Locator;
  framework: PanelFramework;
}

const engineKey = Symbol.for("viviana.panelDialog");

/**
 * Dialog opened by one comparison panel.
 *
 * Both stacks portal the dialog onto `document.body`, so a page-global
 * `getByRole("dialog")` treats the other panel's dialog as this one. A dialog
 * belongs to the panel whose expanded trigger either `aria-controls` it or is
 * named by its `aria-labelledby`. DatePicker sets no `aria-controls`; its
 * dialog's `aria-labelledby` names the expanded calendar button. A trigger
 * that never opens matches nothing.
 */
export function registerPanelDialogEngine(): Promise<void> {
  const g = globalThis as typeof globalThis & { [engineKey]?: Promise<void> };
  if (!g[engineKey]) {
    g[engineKey] = selectors.register("panelDialog", () => {
      // Inlined: Playwright evaluates this factory in the page, so helpers
      // have to live inside it.
      function belongsToPanel(panel: Element, dialog: Element): boolean {
        if (dialog.id) {
          const trigger = panel.querySelector(
            `[aria-expanded="true"][aria-controls="${CSS.escape(dialog.id)}"]`,
          );
          if (trigger) return true;
        }
        const labelledBy = dialog.getAttribute("aria-labelledby") ?? "";
        for (const id of labelledBy.split(/\s+/)) {
          if (!id) continue;
          const target = dialog.ownerDocument?.getElementById(id);
          if (target && panel.contains(target) && target.getAttribute("aria-expanded") === "true") {
            return true;
          }
        }
        return false;
      }

      return {
        query(root: ParentNode, framework: string) {
          return this.queryAll(root, framework)[0] ?? null;
        },
        queryAll(root: ParentNode, framework: string) {
          if (framework !== "react" && framework !== "solid") return [];
          const doc = root instanceof Document ? root : root.ownerDocument;
          if (!doc) return [];
          const panel = doc.querySelector(`#example [data-framework="${framework}"]`);
          if (!panel) return [];
          return [...doc.querySelectorAll("[role='dialog']")].filter((dialog) =>
            belongsToPanel(panel, dialog),
          );
        },
      };
    });
  }
  return g[engineKey];
}

export function panelDialog(
  ctx: PanelDialogContext,
  options?: { name?: string | RegExp },
): Locator {
  const controlled = ctx.page.locator(`panelDialog=${ctx.framework}`);
  if (options?.name === undefined) return controlled;
  return controlled.and(ctx.page.getByRole("dialog", { name: options.name }));
}

await registerPanelDialogEngine();
