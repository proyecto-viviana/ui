import { expect, test, type Locator } from "@playwright/test";

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

test.beforeEach(async ({ page }) => {
  await page.goto("/keyboard-shortcuts/");
  await expect(page.locator("[data-comparison-hydrated]")).toHaveAttribute(
    "data-comparison-hydrated",
    "true",
  );
});

test("matches platform Mod and controls default action and propagation", async ({ page }) => {
  const root = page.locator("main");
  const form = page.locator("form");
  const input = page.getByRole("textbox", { name: "Shortcut form input" });
  const isMac = await page.evaluate(() => /^Mac/i.test(navigator.platform));

  const handled = await dispatchKey(input, {
    key: "s",
    ctrlKey: !isMac,
    metaKey: isMac,
  });

  expect(handled).toEqual({ defaultPrevented: true, dispatchResult: false });
  await expect(form).toHaveAttribute("data-shortcut-save-count", "1");
  await expect(root).toHaveAttribute("data-shortcut-bubble-count", "0");
  await expect(input).not.toHaveAttribute("aria-keyshortcuts", /.+/);

  const unmatched = await dispatchKey(input, { key: "x" });
  expect(unmatched).toEqual({ defaultPrevented: false, dispatchResult: true });
  await expect(root).toHaveAttribute("data-shortcut-bubble-count", "1");
});

test("lets an unhandled Enter key submit a form", async ({ page }) => {
  const form = page.locator("form");
  const input = page.getByRole("textbox", { name: "Shortcut form input" });

  await input.press("Enter");

  await expect(form).toHaveAttribute("data-shortcut-submit-count", "1");
  await expect(form).toHaveAttribute("data-shortcut-save-count", "0");
});

test("gates repeat, composition, and disabled shortcut handlers", async ({ page }) => {
  const repeatIgnored = page.locator('[data-shortcut-case="repeat-ignored"]');
  const repeatAllowed = page.locator('[data-shortcut-case="repeat-allowed"]');
  const compositionIgnored = page.locator('[data-shortcut-case="composition-ignored"]');
  const compositionAllowed = page.locator('[data-shortcut-case="composition-allowed"]');
  const disabled = page.locator('[data-shortcut-case="disabled"]');

  expect(await dispatchKey(repeatIgnored, { key: "a", repeat: true })).toEqual({
    defaultPrevented: false,
    dispatchResult: true,
  });
  expect(await dispatchKey(repeatAllowed, { key: "a", repeat: true })).toEqual({
    defaultPrevented: true,
    dispatchResult: false,
  });
  expect(await dispatchKey(compositionIgnored, { key: "a", isComposing: true })).toEqual({
    defaultPrevented: false,
    dispatchResult: true,
  });
  expect(await dispatchKey(compositionAllowed, { key: "a", isComposing: true })).toEqual({
    defaultPrevented: true,
    dispatchResult: false,
  });
  expect(await dispatchKey(disabled, { key: "a" })).toEqual({
    defaultPrevented: false,
    dispatchResult: true,
  });

  await expect(repeatIgnored).toHaveAttribute("data-shortcut-count", "0");
  await expect(repeatAllowed).toHaveAttribute("data-shortcut-count", "1");
  await expect(compositionIgnored).toHaveAttribute("data-shortcut-count", "0");
  await expect(compositionAllowed).toHaveAttribute("data-shortcut-count", "1");
  await expect(disabled).toHaveAttribute("data-shortcut-count", "0");
});
