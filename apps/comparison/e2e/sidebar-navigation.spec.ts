import { expect, test, type Page } from "@playwright/test";
import { comparisonEntries } from "../src/data/comparison-manifest";

function docsNav(page: Page, name: "Components" | "Documentation") {
  return page.getByRole("navigation", { name });
}

test.describe("comparison sidebar navigation", () => {
  test("component list is a single collapsible docs section", async ({ page }) => {
    await page.goto("/");

    const sidebarMount = page.locator(".js-docs-sidebar-mount");
    const macroStyledSidebar = sidebarMount.locator(".s2-docs-sidebar");
    await expect(macroStyledSidebar).toHaveCount(1);
    await expect
      .poll(() =>
        macroStyledSidebar.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--comparison-docs-sidebar-macro").trim(),
        ),
      )
      .toBe("1");

    const nav = docsNav(page, "Documentation");
    const section = nav.locator('[data-rsp-component="Disclosure"].s2-nav-section');
    const trigger = nav.getByRole("button", { name: "Components", exact: true });

    await expect(page.locator(".js-docs-sidebar-mount details.s2-nav-group")).toHaveCount(0);
    await expect(nav.locator(".s2-nav-group, .s2-nav--grouped")).toHaveCount(0);
    await expect(section).toHaveCount(1);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("listitem")).toHaveCount(comparisonEntries.length);
    await expect(nav.getByRole("link", { name: "Accordion", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "TreeView", exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Button Family", exact: true })).toHaveCount(0);

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(nav.getByRole("link", { name: "Button", exact: true })).toBeHidden();
  });

  test("component detail pages keep the flat list visible and mark the active item", async ({
    page,
  }) => {
    await page.goto("/components/textfield/");

    const nav = docsNav(page, "Components");
    const trigger = nav.getByRole("button", { name: "Components", exact: true });

    await expect(page.locator(".js-docs-sidebar-mount details.s2-nav-group")).toHaveCount(0);
    await expect(nav.locator(".s2-nav-group, .s2-nav--grouped")).toHaveCount(0);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(nav.getByRole("listitem")).toHaveCount(comparisonEntries.length);
    await expect(nav.getByRole("link", { name: "TextField" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(nav.getByRole("link", { name: "Button", exact: true })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Form & Input", exact: true })).toHaveCount(0);
  });
});
