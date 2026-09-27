import { expect, test, type Page } from "@playwright/test";
import { panelDialog, type PanelDialogContext } from "./panel-dialog";

const html = `<!doctype html>
<body>
  <div id="example">
    <article class="s2-framework-panel" data-framework="react">
      <div class="comparison-reference-canvas">
        <button type="button" aria-haspopup="dialog" aria-expanded="true" aria-controls="react-dialog">Open</button>
      </div>
    </article>
    <article class="s2-framework-panel" data-framework="solid">
      <div class="comparison-reference-canvas">
        <button id="solid-trigger" type="button" aria-haspopup="dialog" aria-expanded="false">Open</button>
      </div>
      <div class="comparison-overlay-root"></div>
    </article>
  </div>
  <div id="react-dialog" role="dialog" aria-label="Review Changes">React leftover</div>
</body>`;

function ctx(page: Page, framework: "react" | "solid"): PanelDialogContext {
  return {
    page,
    framework,
    canvas: page.locator(
      `.s2-framework-panel[data-framework="${framework}"] .comparison-reference-canvas`,
    ),
  };
}

test("a React body dialog does not satisfy the Solid panel", async ({ page }) => {
  await page.setContent(html);
  const solid = ctx(page, "solid");
  const react = ctx(page, "react");

  // The page-global query is the bug: it sees the React portal.
  await expect(page.getByRole("dialog", { name: "Review Changes" })).toBeVisible();
  await expect(panelDialog(solid, { name: "Review Changes" })).toHaveCount(0);
  await expect(panelDialog(solid)).not.toBeVisible();
  await expect(panelDialog(react, { name: "Review Changes" })).toBeVisible();
  await expect(panelDialog(react)).toHaveCount(1);

  await page.locator("#solid-trigger").evaluate((trigger) => {
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-controls", "solid-dialog");
    const dialog = document.createElement("div");
    dialog.id = "solid-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-label", "Review Changes");
    dialog.textContent = "Solid";
    document.body.append(dialog);
  });

  await expect(panelDialog(solid, { name: "Review Changes" })).toBeVisible();
  await expect(panelDialog(solid)).toHaveCount(1);
  await expect(panelDialog(react)).toHaveCount(1);
});
