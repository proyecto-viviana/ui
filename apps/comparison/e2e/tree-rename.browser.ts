import { test, expect, type Page } from "@playwright/test";
import type {} from "../../../packages/viviana-ui/test/fixtures/tree-rename-browser/main";

const row = (page: Page, key = "layer") => page.locator(`[data-tree-view-item][data-key="${key}"]`);
const label = (page: Page) =>
  row(page).locator("[data-rsp-slot='label'], [slot='label'], [data-slot='label']").first();
const input = (page: Page) => row(page).locator("[data-tree-rename] input");
const calls = (page: Page) => page.evaluate(() => window.treeRenameProof.calls);
// An animation-frame checkpoint observes queued lifecycle work; it adds no product action.
const settled = (page: Page) =>
  page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
async function open(page: Page) {
  await row(page).focus();
  await page.keyboard.press("F2");
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveAttribute("aria-label", "Layer");
  await expect(label(page)).toHaveJSProperty("hidden", true);
  await expect.poll(() => calls(page)).toEqual([]);
}

// One navigation per page: the fixture serves the package source unbundled, and
// a second full load in the same page exhausts Chromium's request budget
// (net::ERR_INSUFFICIENT_RESOURCES) before the tree renders.
const RENAME_OFF = "omitted onRename never opens an editor";

test.beforeEach(async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push("pageerror: " + error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push("console.error: " + message.text());
  });
  page.on("requestfailed", (request) =>
    errors.push("requestfailed: " + request.url() + ": " + request.failure()?.errorText),
  );
  (page as Page & { treeProofErrors?: string[] }).treeProofErrors = errors;
  await page.addInitScript(() => {
    window.treeRenameRejections = [];
    window.addEventListener("unhandledrejection", (event) =>
      window.treeRenameRejections.push(String(event.reason)),
    );
  });
  await page.goto(testInfo.title === RENAME_OFF ? "/?rename=off" : "/");
  await expect(row(page)).toBeVisible();
});
test.afterEach(async ({ page }, testInfo) => {
  if (!page.isClosed()) {
    await testInfo.attach("callback-ledger", {
      body: JSON.stringify(await calls(page)),
      contentType: "application/json",
    });
    const graph = await page.request.get("/__tree_rename_graph");
    expect(graph.ok()).toBe(true);
    const body = await graph.json();
    await testInfo.attach("loaded-module-graph", {
      body: JSON.stringify(body),
      contentType: "application/json",
    });
    expect(
      body.modules.some(
        (m: { file: string | null; sha256: string | null }) =>
          m.file?.endsWith("/packages/viviana-ui/src/tree/index.tsx") &&
          /^[a-f0-9]{64}$/.test(m.sha256 ?? ""),
      ),
    ).toBe(true);
    expect(await page.evaluate(() => window.treeRenameRejections)).toEqual([]);
  }
  expect((page as Page & { treeProofErrors?: string[] }).treeProofErrors).toEqual([]);
});

test("F2 opens the editor with original label and focus", async ({ page }) => {
  await open(page);
});

test("real double press opens label; expand control and single press do not", async ({ page }) => {
  await row(page, "branch").locator("[data-rsp-slot='expand-button']").dblclick();
  await settled(page);
  await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
  await label(page).click();
  await settled(page);
  await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
  await label(page).dblclick();
  await expect(input(page)).toBeFocused();
  expect(await calls(page)).toEqual([]);
});

for (const key of ["Enter", "Escape"] as const)
  test(`${key} settles exactly once and restores row focus`, async ({ page }) => {
    await open(page);
    await input(page).fill(key === "Enter" ? "Layer 2" : "Discarded");
    await page.keyboard.press(key);
    await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
    await expect(row(page)).toBeFocused();
    await expect(label(page)).toHaveJSProperty("hidden", false);
    expect(await calls(page)).toEqual(key === "Enter" ? [["layer", "Layer 2"]] : []);
    if (key === "Escape") await expect(label(page)).toHaveText("Layer");
    await settled(page);
    expect(await calls(page)).toEqual(key === "Enter" ? [["layer", "Layer 2"]] : []);
  });

for (const destination of ["blur", "outside"] as const)
  test(`native ${destination} commits without taking outside focus`, async ({ page }) => {
    await open(page);
    await input(page).fill("Renamed");
    const events = await input(page).evaluate((element, destination) => {
      const input = element as HTMLInputElement;
      const outside = document.getElementById("outside")!;
      const events: object[] = [];
      for (const type of ["blur", "focusout"])
        input.addEventListener(type, (event) => {
          const focus = event as FocusEvent;
          events.push({
            type,
            targetIsInput: focus.target === input,
            currentIsInput: focus.currentTarget === input,
            relatedIsExpected: focus.relatedTarget === (destination === "blur" ? null : outside),
          });
        });
      if (destination === "blur") input.blur();
      else outside.focus();
      return events;
    }, destination);
    expect(events).toEqual(
      ["blur", "focusout"].map((type) => ({
        type,
        targetIsInput: true,
        currentIsInput: true,
        relatedIsExpected: true,
      })),
    );
    await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
    expect(await calls(page)).toEqual([["layer", "Renamed"]]);
    await expect(row(page)).not.toBeFocused();
    if (destination === "outside") await expect(page.locator("#outside")).toBeFocused();
  });

test("original input retains uninterrupted edits, backward selection and single outside commit", async ({
  page,
}) => {
  await open(page);
  const original = await input(page).elementHandle();
  if (!original) throw new Error("missing input");
  for (const [name, start, end] of [
    ["Renamed", 2, 4],
    ["Renamed again", 5, 5],
  ] as const) {
    await input(page).fill(name);
    const selectionAtSet = await input(page).evaluate(
      (element, range) => {
        const input = element as HTMLInputElement;
        input.setSelectionRange(range[0], range[1], "backward");
        return [input.selectionStart, input.selectionEnd, input.selectionDirection];
      },
      [start, end],
    );
    expect(selectionAtSet.slice(0, 2)).toEqual([start, end]);
    // Focused Chromium normalizes a collapsed backward caret to forward.
    // Preserve the native result across lifecycle work; ranges retain backward direction.
    if (start !== end) expect(selectionAtSet[2]).toBe("backward");
    for (const afterFrame of [false, true]) {
      if (afterFrame) await settled(page);
      expect(
        await original.evaluate((element) => {
          const input = element as HTMLInputElement;
          return {
            connected: input.isConnected,
            current:
              input.closest("[data-tree-view-item]")?.querySelector("[data-tree-rename] input") ===
              input,
            focused: document.activeElement === input,
            value: input.value,
            selection: [input.selectionStart, input.selectionEnd, input.selectionDirection],
          };
        }),
      ).toEqual({
        connected: true,
        current: true,
        focused: true,
        value: name,
        selection: selectionAtSet,
      });
      expect(await calls(page)).toEqual([]);
    }
  }
  await page.locator("#outside").click();
  await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
  expect(await calls(page)).toEqual([["layer", "Renamed again"]]);
  await expect(page.locator("#outside")).toBeFocused();
  expect(await original.evaluate((element) => element.isConnected)).toBe(false);
  await original.evaluate((element) => {
    element.dispatchEvent(new InputEvent("input", { bubbles: true }));
    (element as HTMLInputElement).blur();
  });
  await settled(page);
  expect(await calls(page)).toEqual([["layer", "Renamed again"]]);
  await expect(page.locator("#outside")).toBeFocused();
});

test("internal focus and background native input do not refocus or commit", async ({ page }) => {
  await open(page);
  await input(page).evaluate((element) => {
    const internal = document.createElement("button");
    internal.id = "internal";
    internal.textContent = "Internal";
    element.closest("[data-tree-rename]")!.append(internal);
    internal.focus();
  });
  await settled(page);
  await expect(page.locator("#internal")).toBeFocused();
  // Deliberate synthetic input notification only for the original unfocused-background-update oracle.
  // Focus transitions and ordinary typing above use real Chromium input/native focus.
  await input(page).evaluate((element) => {
    const input = element as HTMLInputElement;
    input.value = "Background update";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  await settled(page);
  await expect(page.locator("#internal")).toBeFocused();
  await expect(input(page)).toBeAttached();
  expect(await calls(page)).toEqual([]);
});

test("protective row refocus preserves caret", async ({ page }) => {
  await open(page);
  await input(page).evaluate((element) => (element as HTMLInputElement).setSelectionRange(2, 2));
  await row(page).focus();
  await expect(input(page)).toBeFocused();
  expect(
    await input(page).evaluate((element) => [
      (element as HTMLInputElement).selectionStart,
      (element as HTMLInputElement).selectionEnd,
    ]),
  ).toEqual([2, 2]);
  expect(await calls(page)).toEqual([]);
});

test("real typing and arrows stay in editor, not tree typeahead", async ({ page }) => {
  await open(page);
  await input(page).fill("Layer");
  await input(page).evaluate((element) => {
    (window as Window & { treeKeySeen?: number }).treeKeySeen = 0;
    const mark = () => {
      const w = window as Window & { treeKeySeen: number };
      w.treeKeySeen++;
    };
    const tree = element.closest("[data-tree-view]")!;
    tree.addEventListener("keydown", mark, true);
    tree.addEventListener("keydown", mark);
  });
  await page.keyboard.press("End");
  await page.keyboard.type("m");
  await page.keyboard.press("ArrowDown");
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveValue("Layerm");
  expect(await page.evaluate(() => (window as Window & { treeKeySeen?: number }).treeKeySeen)).toBe(
    0,
  );
  await expect(row(page, "mask")).not.toHaveAttribute("data-focused", "true");
  expect(await calls(page)).toEqual([]);
});

test(RENAME_OFF, async ({ page }) => {
  expect(new URL(page.url()).searchParams.get("rename")).toBe("off");
  await row(page).focus();
  await page.keyboard.press("F2");
  await label(page).dblclick();
  await settled(page);
  await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
  await expect(page.locator("#root input")).toHaveCount(0);
  expect(await calls(page)).toEqual([]);
});

test("unmount while protective focus is pending causes no callback or focus theft", async ({
  page,
}) => {
  await open(page);
  const observation = await input(page).evaluate((element) => {
    const row = element.closest<HTMLElement>("[data-tree-view-item]")!;
    row.focus(); // Queues the product's protective microtask; do not drain it before disposal.
    const outside = document.getElementById("outside")!;
    outside.focus();
    window.treeRenameProof.dispose();
    return {
      inputConnected: element.isConnected,
      outsideFocused: document.activeElement === outside,
    };
  });
  expect(observation).toEqual({ inputConnected: false, outsideFocused: true });
  await settled(page);
  await expect(page.locator("[data-tree-rename]")).toHaveCount(0);
  await expect(page.locator("#outside")).toBeFocused();
  expect(await calls(page)).toEqual([]);
});
