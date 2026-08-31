import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";

interface DispatchedKeyResult {
  defaultPrevented: boolean;
  dispatchResult: boolean;
}

async function dispatchKey(target: Locator, init: KeyboardEventInit): Promise<DispatchedKeyResult> {
  return target.evaluate((element, eventInit) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ...eventInit,
    });
    const dispatchResult = element.dispatchEvent(event);
    return {
      defaultPrevented: event.defaultPrevented,
      dispatchResult,
    };
  }, init);
}

async function focusFirstOption(page: Page, canvas: Locator) {
  const before = canvas.getByRole("button", { name: "Before" });
  const listbox = canvas.getByRole("listbox", { name: "Permissions" });
  const read = listbox.getByRole("option", { name: "Read" });

  await before.focus();
  await page.keyboard.press("Tab");
  await expect(read).toBeFocused();

  return {
    listbox,
    read,
    write: listbox.getByRole("option", { name: "Write" }),
    admin: listbox.getByRole("option", { name: "Admin" }),
  };
}

async function activeText(page: Page): Promise<string | null> {
  return page.evaluate(() => document.activeElement?.textContent?.trim() ?? null);
}

async function getCanvases(page: Page): Promise<Array<[FrameworkName, Locator]>> {
  const section = await styledSection(page);
  return [
    ["React Spectrum stack", await frameworkCanvas(section, "React Spectrum stack")],
    ["Solidaria stack", await frameworkCanvas(section, "Solidaria stack")],
  ];
}

test.beforeEach(async ({ page }) => {
  await page.goto("/components/listbox/");
  await waitForComparisonRouteReady(page);
});

test("matches repeated arrow navigation against React Aria Components", async ({ page }) => {
  const outcomes: Array<{
    framework: FrameworkName;
    key: DispatchedKeyResult;
    active: string | null;
  }> = [];

  for (const [framework, canvas] of await getCanvases(page)) {
    const fixture = await focusFirstOption(page, canvas);
    const key = await dispatchKey(fixture.read, { key: "ArrowDown", repeat: true });
    await expect(fixture.write).toBeFocused();
    outcomes.push({ framework, key, active: await activeText(page) });
  }

  expect(outcomes).toEqual([
    {
      framework: "React Spectrum stack",
      key: { defaultPrevented: true, dispatchResult: false },
      active: "Write",
    },
    {
      framework: "Solidaria stack",
      key: { defaultPrevented: true, dispatchResult: false },
      active: "Write",
    },
  ]);
});

test("matches composition, repeat, modifier, and Tab boundaries", async ({ page }) => {
  const isMac = await page.evaluate(() => /^Mac/i.test(navigator.platform));
  const rejectedModifier = isMac ? { ctrlKey: true } : { altKey: true };
  const acceptedModifier = isMac ? { altKey: true } : { ctrlKey: true };
  const outcomes: Array<Record<string, unknown>> = [];

  for (const [framework, canvas] of await getCanvases(page)) {
    const fixture = await focusFirstOption(page, canvas);
    const composingArrow = await dispatchKey(fixture.read, {
      key: "ArrowDown",
      isComposing: true,
    });
    await expect(fixture.read).toBeFocused();

    const repeatedEnd = await dispatchKey(fixture.read, { key: "End", repeat: true });
    await expect(fixture.read).toBeFocused();

    const rejectedArrow = await dispatchKey(fixture.read, {
      key: "ArrowDown",
      ...rejectedModifier,
    });
    await expect(fixture.read).toBeFocused();

    const acceptedArrow = await dispatchKey(fixture.read, {
      key: "ArrowDown",
      ...acceptedModifier,
    });
    await expect(fixture.write).toBeFocused();

    const repeatedTab = await dispatchKey(fixture.write, { key: "Tab", repeat: true });
    await expect(fixture.write).toBeFocused();

    const altTab = await dispatchKey(fixture.write, { key: "Tab", altKey: true });
    await expect(fixture.write).toBeFocused();

    outcomes.push({
      framework,
      composingArrow,
      repeatedEnd,
      rejectedArrow,
      acceptedArrow,
      repeatedTab,
      altTab,
      active: await activeText(page),
    });
  }

  const expected = {
    composingArrow: { defaultPrevented: false, dispatchResult: true },
    repeatedEnd: { defaultPrevented: false, dispatchResult: true },
    rejectedArrow: { defaultPrevented: false, dispatchResult: true },
    acceptedArrow: { defaultPrevented: true, dispatchResult: false },
    repeatedTab: { defaultPrevented: false, dispatchResult: true },
    altTab: { defaultPrevented: false, dispatchResult: true },
    active: "Write",
  };
  expect(outcomes).toEqual([
    { framework: "React Spectrum stack", ...expected },
    { framework: "Solidaria stack", ...expected },
  ]);
});

test("matches repeated select-all and Escape behavior in multiple selection", async ({ page }) => {
  await page.goto("/components/listbox/?selectionMode=multiple");
  await waitForComparisonRouteReady(page);
  const isMac = await page.evaluate(() => /^Mac/i.test(navigator.platform));
  const mod = isMac ? { metaKey: true } : { ctrlKey: true };
  const outcomes: Array<Record<string, unknown>> = [];

  for (const [framework, canvas] of await getCanvases(page)) {
    const fixture = await focusFirstOption(page, canvas);
    const selectedOptions = fixture.listbox.locator('[role="option"][aria-selected="true"]');

    const repeatedSelectAll = await dispatchKey(fixture.read, {
      key: "a",
      repeat: true,
      ...mod,
    });
    await expect(selectedOptions).toHaveCount(0);

    const selectAll = await dispatchKey(fixture.read, { key: "a", ...mod });
    await expect(selectedOptions).toHaveCount(3);

    const repeatedEscape = await dispatchKey(fixture.read, { key: "Escape", repeat: true });
    await expect(selectedOptions).toHaveCount(3);

    const composingEscape = await dispatchKey(fixture.read, {
      key: "Escape",
      isComposing: true,
    });
    await expect(selectedOptions).toHaveCount(3);

    const escape = await dispatchKey(fixture.read, { key: "Escape" });
    await expect(selectedOptions).toHaveCount(0);

    outcomes.push({
      framework,
      repeatedSelectAll,
      selectAll,
      repeatedEscape,
      composingEscape,
      escape,
    });
  }

  const expected = {
    repeatedSelectAll: { defaultPrevented: false, dispatchResult: true },
    selectAll: { defaultPrevented: true, dispatchResult: false },
    repeatedEscape: { defaultPrevented: false, dispatchResult: true },
    composingEscape: { defaultPrevented: false, dispatchResult: true },
    escape: { defaultPrevented: true, dispatchResult: false },
  };
  expect(outcomes).toEqual([
    { framework: "React Spectrum stack", ...expected },
    { framework: "Solidaria stack", ...expected },
  ]);
});
