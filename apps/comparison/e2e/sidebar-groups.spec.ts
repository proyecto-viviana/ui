import { expect, test, type Locator, type Page } from "@playwright/test";

function componentGroup(page: Page, name: string): Locator {
  return page.locator("details.s2-nav-group").filter({
    has: page.locator("summary", { hasText: name }),
  });
}

test.describe("comparison sidebar groups", () => {
  test("component groups can be collapsed on the index page", async ({ page }) => {
    await page.goto("/");

    const buttonGroup = componentGroup(page, "Button Family");
    await expect(buttonGroup).toBeVisible();
    await expect(buttonGroup).toHaveAttribute("open", "");
    await expect(buttonGroup.getByRole("link", { name: "Button", exact: true })).toBeVisible();

    await buttonGroup.locator("summary").click();

    await expect(buttonGroup.getByRole("link", { name: "Button", exact: true })).toBeHidden();
  });

  test("component detail pages open the active component group", async ({ page }) => {
    await page.goto("/components/textfield/");

    const activeGroup = componentGroup(page, "Form & Input");
    const inactiveGroup = componentGroup(page, "Button Family");

    await expect(activeGroup).toHaveAttribute("open", "");
    await expect(activeGroup.getByRole("link", { name: "TextField" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(inactiveGroup.getByRole("link", { name: "Button", exact: true })).toBeHidden();
  });
});
