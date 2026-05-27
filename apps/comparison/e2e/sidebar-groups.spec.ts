import { expect, test, type Locator, type Page } from "@playwright/test";

function componentGroup(page: Page, name: string): Locator {
  return page.locator('[data-rsp-component="Disclosure"].s2-nav-group').filter({
    has: page.getByRole("button", { name, exact: true }),
  });
}

test.describe("comparison sidebar groups", () => {
  test("component groups can be collapsed on the index page", async ({ page }) => {
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

    const buttonGroup = componentGroup(page, "Button Family");
    const trigger = buttonGroup.getByRole("button", { name: "Button Family", exact: true });

    await expect(page.locator(".js-docs-sidebar-mount details.s2-nav-group")).toHaveCount(0);
    await expect(buttonGroup).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(buttonGroup.getByRole("link", { name: "Button", exact: true })).toBeVisible();

    await trigger.click();

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(buttonGroup.getByRole("link", { name: "Button", exact: true })).toBeHidden();
  });

  test("component detail pages open the active component group", async ({ page }) => {
    await page.goto("/components/textfield/");

    const activeGroup = componentGroup(page, "Form & Input");
    const inactiveGroup = componentGroup(page, "Button Family");
    const activeTrigger = activeGroup.getByRole("button", { name: "Form & Input", exact: true });
    const inactiveTrigger = inactiveGroup.getByRole("button", {
      name: "Button Family",
      exact: true,
    });

    await expect(page.locator(".js-docs-sidebar-mount details.s2-nav-group")).toHaveCount(0);
    await expect(activeTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(activeGroup.getByRole("link", { name: "TextField" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(inactiveTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(inactiveGroup.getByRole("link", { name: "Button", exact: true })).toBeHidden();
  });
});
