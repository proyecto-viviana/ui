import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:4321/components/datepicker/");
  await page.waitForLoadState("networkidle");

  // Open solid datepicker
  const solidCard = await page.locator('[data-comparison-control-root="datepicker"]').nth(1);
  const button = solidCard.locator("button").first();
  await button.click();
  await page.waitForTimeout(500);

  // Click next to go to June 2026
  const popover = page.locator('[role="dialog"]').filter({ has: page.locator('[role="grid"]') });
  await popover.locator("header button").nth(1).click();
  await page.waitForTimeout(500);

  const metrics = await page.evaluate(() => {
    const popover = Array.from(document.querySelectorAll('[role="dialog"]')).find((el) =>
      el.querySelector('[role="grid"]'),
    );
    const grid = popover?.querySelector('[role="grid"]');
    const gridBox = grid?.getBoundingClientRect();

    const cells = Array.from(popover.querySelectorAll('[role="gridcell"]'));
    const buttons = Array.from(popover.querySelectorAll('[role="gridcell"] [role="button"]'));

    return {
      gridX: gridBox?.x,
      gridWidth: gridBox?.width,
      cells: cells.slice(0, 10).map((c) => {
        const box = c.getBoundingClientRect();
        const style = getComputedStyle(c);
        return {
          x: box.x,
          width: box.width,
          height: box.height,
          display: style.display,
          visibility: style.visibility,
        };
      }),
      buttons: buttons.slice(0, 10).map((b) => {
        const box = b.getBoundingClientRect();
        const style = getComputedStyle(b);
        return {
          text: b.textContent?.trim(),
          x: box.x,
          width: box.width,
          height: box.height,
          display: style.display,
          paddingLeft: style.paddingLeft,
        };
      }),
    };
  });

  console.log(JSON.stringify(metrics, null, 2));
  await browser.close();
})();
