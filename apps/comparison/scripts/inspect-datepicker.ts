import { chromium } from "playwright";
import { expect } from "@playwright/test";

async function inspect() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:4321/components/datepicker");

  // Wait for page to be ready
  await page.waitForSelector("[data-comparison-control-props]");

  // Open React DatePicker
  const reactCard = page
    .locator("article")
    .filter({ has: page.getByText("React Spectrum", { exact: false }) });
  const reactButton = reactCard.getByRole("button", { name: /calendar|choose date/i });
  await reactButton.click();

  // Wait for React popover
  const reactSurface = page
    .locator("[data-placement]")
    .filter({ has: page.locator('[role="grid"]') })
    .first();
  await expect(reactSurface).toBeVisible();

  const reactInfo = await reactSurface.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      computedWidth: style.width,
      computedMinWidth: style.minWidth,
      computedMaxWidth: style.maxWidth,
      inlineStyle: el.getAttribute("style"),
    };
  });
  console.log("React Surface info:", JSON.stringify(reactInfo, null, 2));

  await page.keyboard.press("Escape");
  await page.waitForSelector('[role="grid"]', { state: "detached" });

  // Open Solid DatePicker
  const solidCard = page
    .locator("article")
    .filter({ has: page.getByText("solid-spectrum", { exact: false }) });
  const solidButton = solidCard.getByRole("button", { name: /calendar|choose date/i });
  await solidButton.click();

  // Wait for popover
  const surface = page
    .locator("[data-placement]")
    .filter({ has: page.locator('[role="grid"]') })
    .first();
  await expect(surface).toBeVisible();

  // Get dimensions and styles
  const info = await surface.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      computedWidth: style.width,
      computedMinWidth: style.minWidth,
      computedMaxWidth: style.maxWidth,
      computedPosition: style.position,
      computedDisplay: style.display,
      computedBoxSizing: style.boxSizing,
      inlineStyle: el.getAttribute("style"),
      html: el.outerHTML.slice(0, 2000),
    };
  });

  console.log("Surface info:", JSON.stringify(info, null, 2));

  // Get first child div info
  const childInfo = await surface.evaluate((el) => {
    const child = el.firstElementChild as HTMLElement;
    if (!child) return null;
    const rect = child.getBoundingClientRect();
    const style = window.getComputedStyle(child);
    const inlineStyle = child.getAttribute("style");
    return {
      width: rect.width,
      height: rect.height,
      computedWidth: style.width,
      computedMinWidth: style.minWidth,
      computedMaxWidth: style.maxWidth,
      computedDisplay: style.display,
      computedBoxSizing: style.boxSizing,
      inlineStyle,
      html: child.outerHTML.slice(0, 2000),
    };
  });

  console.log("Child info:", JSON.stringify(childInfo, null, 2));

  // Get calendar root info
  const calendarInfo = await surface.evaluate((el) => {
    const calendar = el.querySelector('[role="group"]') as HTMLElement;
    if (!calendar) return null;
    const rect = calendar.getBoundingClientRect();
    const style = window.getComputedStyle(calendar);

    // Get ALL CSS text from ALL stylesheets
    let allCss = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          allCss += rule.cssText + "\n";
        }
      } catch (e) {
        // cross-origin stylesheets
      }
    }

    // Direct search for new calendar classes in all CSS
    const targetClasses = ["-cYDWLb-ZyRQSob13", "ZwxkHoe13"];
    const calendarWidthRules: string[] = [];
    for (const cls of targetClasses) {
      const idx = allCss.indexOf("." + cls);
      if (idx !== -1) {
        const start = Math.max(0, idx - 10);
        const end = Math.min(allCss.length, idx + 300);
        calendarWidthRules.push("FOUND " + cls + ": " + allCss.substring(start, end));
      } else {
        calendarWidthRules.push("NOT FOUND: " + cls);
      }
    }

    return {
      width: rect.width,
      height: rect.height,
      computedWidth: style.width,
      computedMinWidth: style.minWidth,
      computedMaxWidth: style.maxWidth,
      computedDisplay: style.display,
      computedBoxSizing: style.boxSizing,
      cellMaxWidth: style.getPropertyValue("--cell-max-width"),
      cellGap: style.getPropertyValue("--cell-gap"),
      actualWidthProp: calendar.style.width,
      inlineWidth: calendar.getAttribute("style"),
      calendarWidthRules,
      html: calendar.outerHTML.slice(0, 2000),
    };
  });

  // Inspect all stylesheets
  const styleInfo = await page.evaluate(() => {
    const info: any[] = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
      const sheet = document.styleSheets[i];
      try {
        const rules = Array.from(sheet.cssRules);
        const text = rules.map((r) => r.cssText).join("\n");
        info.push({
          index: i,
          href: (sheet.ownerNode as any)?.href || "inline",
          ruleCount: rules.length,
          hasCellMaxWidth: text.includes("cell-max-width"),
          hasZwxkHoe: text.includes("ZwxkHoe13"),
          hasZRqDA2: text.includes("ZRqDA2c13"),
          size: text.length,
        });
      } catch (e) {
        info.push({ index: i, href: (sheet.ownerNode as any)?.href || "inline", error: String(e) });
      }
    }
    return info;
  });
  console.log("Style info:", JSON.stringify(styleInfo, null, 2));

  console.log("Calendar info:", JSON.stringify(calendarInfo, null, 2));

  // Get calendar grid info
  const gridInfo = await surface.evaluate((el) => {
    const grid = el.querySelector('[role="grid"]') as HTMLElement;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const style = window.getComputedStyle(grid);
    return {
      width: rect.width,
      height: rect.height,
      computedWidth: style.width,
      html: grid.outerHTML.slice(0, 500),
    };
  });

  console.log("Grid info:", JSON.stringify(gridInfo, null, 2));

  // Get field group width
  const fieldGroupInfo = await solidCard.evaluate((card) => {
    const fieldGroup = card.querySelector('[class*="solidaria-DatePicker"] > div');
    if (!fieldGroup) return null;
    const rect = fieldGroup.getBoundingClientRect();
    return {
      width: rect.width,
      html: fieldGroup.outerHTML.slice(0, 500),
    };
  });
  console.log("Field group info:", JSON.stringify(fieldGroupInfo, null, 2));

  await browser.close();
}

inspect().catch(console.error);
