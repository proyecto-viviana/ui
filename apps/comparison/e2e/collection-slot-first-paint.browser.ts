/**
 * First-paint layout for collection slots (#102).
 *
 * JavaScript is disabled, so no createEffect can stamp classes after parse.
 * The document is the SSR markup plus that package's built stylesheet.
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test, type Locator } from "@playwright/test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function documentFor(htmlName: string, packageDir: string): string {
  const html = readFileSync(resolve(root, "output", htmlName), "utf8");
  const css = readFileSync(
    resolve(root, "packages", packageDir, "dist/styles.css"),
    "utf8",
  ).replaceAll("</style", "<\\/style");
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`;
}

async function gridArea(locator: Locator): Promise<string> {
  return locator.evaluate((el) => getComputedStyle(el).gridArea.split("/")[0].trim());
}

test.use({ javaScriptEnabled: false });

const cases = [
  {
    name: "solid-spectrum ListView",
    html: "spectrum-listview-slots-ssr.html",
    packageDir: "solid-spectrum",
    row: "[data-list-view-item]",
  },
  {
    name: "solid-spectrum Tree",
    html: "spectrum-tree-slots-ssr.html",
    packageDir: "solid-spectrum",
    row: "[data-tree-view-item]",
  },
  {
    name: "viviana-ui ListView",
    html: "viviana-listview-slots-ssr.html",
    packageDir: "viviana-ui",
    row: "[data-list-view-item]",
  },
  {
    name: "viviana-ui Tree",
    html: "viviana-tree-slots-ssr.html",
    packageDir: "viviana-ui",
    row: "[data-tree-view-item]",
  },
];

for (const item of cases) {
  test(`${item.name} paints slot grid areas before any effect`, async ({ page }) => {
    await page.setContent(documentFor(item.html, item.packageDir), { waitUntil: "load" });
    const row = page.locator(`${item.row}[data-key="brief"]`);
    const layout = await row.evaluate((el) => {
      const style = getComputedStyle(el);
      return { display: style.display, areas: style.gridTemplateAreas };
    });
    expect(layout.display).toBe("grid");
    expect(layout.areas).toContain("label");
    expect(layout.areas).toContain("description");
    expect(layout.areas).toContain("icon");
    expect(layout.areas).toContain("actions");
    expect(await gridArea(row.locator('[data-rsp-slot="label"]'))).toBe("label");
    expect(await gridArea(row.locator('[data-rsp-slot="description"]'))).toBe("description");
    expect(await gridArea(row.locator('[data-rsp-slot="icon"]'))).toBe("icon");
    expect(await gridArea(row.locator('[slot="actions"]'))).toBe("actions");
  });
}
