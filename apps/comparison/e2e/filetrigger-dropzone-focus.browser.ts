/**
 * Browser proof for #109: FileTrigger click isolation and DropZone native focus.
 * Kept off the comparison *.spec.ts match so it does not boot the preview server.
 */
import { expect, test as base } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, realpathSync, lstatSync } from "node:fs";
import { resolve } from "node:path";
import type { Page, Locator, TestInfo } from "@playwright/test";

// Each test owns observers installed before navigation, including the original cases.
const test = base.extend<{
  nativeErrors: string[];
  trustedChooser: boolean;
  popupCase: string | null;
  native630Case: string | null;
}>({
  trustedChooser: [false, { option: true }],
  popupCase: [null, { option: true }],
  native630Case: [null, { option: true }],
  nativeErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.stack ?? error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      await use(errors);
    },
    { auto: true },
  ],
});

type FocusRecord = {
  type: string;
  target?: string | null;
  currentTarget?: string | null;
  relatedTarget?: string | null;
  path?: string[];
  value?: boolean;
};
type FocusWindow = Window & {
  __focusFixture: { events: FocusRecord[]; dispose: () => void };
  __nativeRejections: string[];
};

async function focusLog(page: Page) {
  return page.evaluate(() => {
    const fixture = (window as FocusWindow).__focusFixture;
    if (!fixture || !Array.isArray(fixture.events)) throw new Error("missing focus fixture log");
    return fixture.events;
  });
}

async function startOutside(page: Page) {
  await page.locator("#outside").focus();
  await expect(page.locator("#outside")).toBeFocused();
  await page.evaluate(() => {
    const fixture = (window as FocusWindow).__focusFixture;
    if (!fixture || !Array.isArray(fixture.events)) throw new Error("missing focus fixture log");
    fixture.events.length = 0;
  });
}

function boundary(type: "focus" | "blur", target: string, owner = "owner") {
  return {
    type,
    target,
    currentTarget: owner,
    relatedTarget: "outside",
    path: expect.arrayContaining([target, owner]),
  };
}

test.afterEach(async ({ page, nativeErrors }, testInfo) => {
  const rejections = await page.evaluate(() => {
    const observed = (window as FocusWindow).__nativeRejections;
    if (!Array.isArray(observed)) throw new Error("missing rejection observer");
    return observed;
  });
  expect.soft(nativeErrors, "uncaught native errors (observers precede navigation)").toEqual([]);
  expect.soft(rejections, "unhandled native promise rejections").toEqual([]);
  console.log(
    "native-error-evidence",
    JSON.stringify({ case: testInfo.title, errors: nativeErrors, rejections }),
  );
});

test.beforeEach(async ({ page, trustedChooser, popupCase, native630Case }, testInfo) => {
  await page.addInitScript((trustedChooser) => {
    const rejections: string[] = [];
    (window as FocusWindow).__nativeRejections = rejections;
    window.addEventListener("unhandledrejection", (event) => {
      rejections.push(String(event.reason));
    });
    if (trustedChooser) return;
    // Isolation spy only: this does not prove an OS file dialog opened.
    const clicks = { count: 0 };
    (window as unknown as { __fileClicks: { count: number } }).__fileClicks = clicks;
    const original = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function (this: HTMLInputElement) {
      if (this.type === "file") {
        clicks.count += 1;
        return;
      }
      return original.call(this);
    };
  }, trustedChooser);
  if (native630Case) {
    await prepareNative630(page, native630Case, testInfo);
    return;
  }
  if (popupCase) {
    await preparePopup642(page, popupCase, testInfo);
    return;
  }
  await page.goto("/");
  await expect(page.locator("#hint")).toBeVisible();
});

test("hidden file input click does not reach the DropZone ancestor", async ({ page }) => {
  const clicks = await page.evaluate(() => {
    const pair = document.getElementById("pair");
    if (!pair) {
      throw new Error("missing #pair");
    }
    let ancestorClicks = 0;
    pair.addEventListener("click", () => {
      ancestorClicks += 1;
    });
    const input = pair.querySelector('input[type="file"]');
    if (!input) {
      throw new Error("missing file input");
    }
    input.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    const active = document.activeElement;
    return {
      ancestorClicks,
      activeLabel: active instanceof HTMLElement ? active.getAttribute("aria-label") : null,
    };
  });

  expect(clicks.ancestorClicks).toBe(0);
  expect(clicks.activeLabel).not.toBe("DropZone");
});

test("a zone click restores focus with native focus and scrolls the button into view", async ({
  page,
}) => {
  const result = await page.evaluate(() => {
    const scroller = document.getElementById("scroller");
    const hint = document.getElementById("hint");
    if (!scroller || !hint) {
      throw new Error("missing scroller fixture");
    }
    scroller.scrollTop = 0;
    const before = scroller.scrollTop;
    hint.click();
    const active = document.activeElement;
    const button = active instanceof HTMLButtonElement ? active : null;
    return {
      before,
      scrollTop: scroller.scrollTop,
      tag: active?.tagName ?? null,
      label: button?.getAttribute("aria-label") ?? null,
    };
  });

  expect(result.before).toBe(0);
  expect(result.scrollTop).toBeGreaterThan(0);
  expect(result.tag).toBe("BUTTON");
  expect(result.label).toBe("DropZone");
});

test("keyboard activation opens the file picker and leaves the upload button focused", async ({
  page,
}) => {
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "DropZone" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator("#upload")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#upload")).toBeFocused();
  const clicks = await page.evaluate(
    () => (window as unknown as { __fileClicks: { count: number } }).__fileClicks.count,
  );
  expect(clicks).toBe(1);
});

test("assistive technology exposes the drop and upload buttons, not the file input", async ({
  page,
}) => {
  await expect(page.getByRole("button", { name: "DropZone" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Upload" })).toHaveCount(1);
  await expect(page.getByRole("textbox")).toHaveCount(0);
  await expect(page.locator('#pair input[type="file"]')).toHaveCount(1);
  const snapshot = await page.locator("#pair").ariaSnapshot();
  expect(snapshot).toContain("DropZone");
  expect(snapshot).toContain("Upload");
  expect(snapshot.toLowerCase()).not.toContain("textbox");
});

test("native descendant accessors stay synchronous across A to B to outside", async ({ page }) => {
  await startOutside(page);
  await page.locator("#owner-a").focus();
  const entry = [boundary("focus", "owner-a"), { type: "change", value: true }];
  expect(await focusLog(page)).toEqual(entry);
  await page.locator("#owner-b").focus();
  expect(await focusLog(page)).toEqual(entry);
  await page.locator("#outside").focus();
  expect(await focusLog(page)).toEqual([
    ...entry,
    boundary("blur", "owner-b"),
    { type: "change", value: false },
  ]);
});

test("native direct-owner accessors retain normalized types and bound methods", async ({
  page,
}) => {
  await startOutside(page);
  await page.locator("#owner").focus();
  expect(await focusLog(page)).toEqual([
    boundary("focus", "owner"),
    { type: "change", value: true },
  ]);
  await page.locator("#outside").focus();
  expect(await focusLog(page)).toEqual([
    boundary("focus", "owner"),
    { type: "change", value: true },
    boundary("blur", "owner"),
    { type: "change", value: false },
  ]);
});

test("native disabled owner and descendants emit no callbacks", async ({ page }) => {
  await startOutside(page);
  for (const id of ["disabled-owner", "disabled-owner-a", "disabled-owner-b", "outside"]) {
    await page.locator(`#${id}`).focus();
    await expect(page.locator(`#${id}`)).toBeFocused();
    expect(await focusLog(page)).toEqual([]);
  }
});

test("native focus callbacks do not survive root disposal", async ({ page }) => {
  await startOutside(page);
  await page.locator("#owner-a").focus();
  expect(await focusLog(page)).toEqual([
    boundary("focus", "owner-a"),
    { type: "change", value: true },
  ]);
  await page.evaluate(() => {
    const fixture = (window as FocusWindow).__focusFixture;
    if (!fixture || typeof fixture.dispose !== "function")
      throw new Error("missing fixture disposer");
    fixture.dispose();
  });
  await expect(page.locator("#owner")).toHaveCount(0);
  const disposed = await focusLog(page);
  // Removal need not synthesize blur. Later real focus must not reach retained listeners.
  await page.locator("#outside").focus();
  await expect(page.locator("#outside")).toBeFocused();
  await page.locator("#outside-next").focus();
  await expect(page.locator("#outside-next")).toBeFocused();
  expect(await focusLog(page)).toEqual(disposed);
});

type MenuSnapshot = {
  sameEvent: boolean;
  sameTarget: boolean;
  sameLabel: boolean;
  sameChild: boolean;
  targetConnected: boolean;
  menuConnected: boolean;
  frameworkConnected: boolean;
  menuContains: boolean;
  frameworkContains: boolean;
  pressed: boolean;
  hovered: boolean;
  focused: boolean;
  livePressed: string | null;
  mounts: number;
  cleanups: number;
  actions: string[];
  closes: number;
  sequence: string[];
  path: string[];
};
type MenuProbe = {
  capture: MenuSnapshot[];
  boundary: MenuSnapshot[];
  bubble: MenuSnapshot[];
  snapshot: () => MenuSnapshot;
  dispose: () => void;
};
type MenuWindow = Window & {
  __menuFixture: {
    arm: (kind: "solid" | "react" | "plain") => MenuProbe;
    updateSolid: () => void;
    updateReact: () => void;
    disposeReact: () => void;
    reactCounts: { mounts: number; cleanups: number };
  };
  __menuProbe: MenuProbe;
};
function connected(snapshot: MenuSnapshot) {
  for (const key of [
    "sameEvent",
    "sameTarget",
    "sameLabel",
    "sameChild",
    "targetConnected",
    "menuConnected",
    "frameworkConnected",
    "menuContains",
    "frameworkContains",
  ] as const) {
    expect(snapshot[key], key).toBe(true);
  }
  expect(snapshot.mounts).toBe(1);
  expect(snapshot.cleanups).toBe(0);
}
async function menuRead(page: Page) {
  return page.evaluate(() => {
    const probe = (window as MenuWindow).__menuProbe;
    if (!probe || !Array.isArray(probe.boundary) || !Array.isArray(probe.bubble))
      throw new Error("missing menu probe");
    return {
      capture: probe.capture,
      boundary: probe.boundary,
      bubble: probe.bubble,
      now: probe.snapshot(),
    };
  });
}

test("MenuItem retains the native target after delegated primary down on Solid and React", async ({
  page,
}, testInfo) => {
  const records: Record<string, Awaited<ReturnType<typeof menuRead>>> = {};
  for (const kind of ["plain", "react", "solid"] as const) {
    const label = page.locator(`#${kind}-label`);
    await expect(label).toBeVisible();
    await page.evaluate((kind) => {
      const fixture = (window as MenuWindow).__menuFixture;
      if (!fixture || typeof fixture.arm !== "function") throw new Error("missing menu fixture");
      (window as MenuWindow).__menuProbe = fixture.arm(kind);
      if (kind === "solid") fixture.updateSolid();
      if (kind === "react") fixture.updateReact();
    }, kind);
    if (kind !== "plain")
      await expect(label).toHaveText(`${kind === "solid" ? "Solid" : "React"} updated`);
    const box = await label.boundingBox();
    if (!box) throw new Error("missing label coordinates");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    if (kind !== "plain") {
      await expect(page.locator(`#${kind}-live`)).toHaveAttribute("data-live-hovered", "true");
      expect((await menuRead(page)).now.hovered).toBe(true);
    }
    await page.mouse.down();
    const down = await menuRead(page);
    records[kind] = down;
    console.log("menu-down-evidence", kind, JSON.stringify(down));
    await testInfo.attach(`${kind}-down`, {
      body: JSON.stringify(down, null, 2),
      contentType: "application/json",
    });
    expect(down.capture).toHaveLength(1);
    expect(down.boundary).toHaveLength(1);
    connected(down.boundary[0]);
    expect(down.boundary[0].pressed).toBe(true);
    expect(down.capture[0].pressed).toBe(false);
    expect(down.boundary[0].sequence).toEqual(
      kind === "plain" ? ["capture", "managed", "boundary"] : ["capture", "boundary"],
    );
    connected(down.now);
    expect(down.now.pressed).toBe(true);
    expect(down.now.actions).toEqual([]);
    expect(down.now.closes).toBe(0);
    if (kind !== "plain") {
      expect(down.boundary[0].livePressed).toBe("true");
      expect(down.now.livePressed).toBe("true");
      expect(down.now.focused).toBe(true);
    }
    for (const received of down.bubble) connected(received);
    await page.mouse.up();
    await expect.poll(async () => (await menuRead(page)).now.pressed).toBe(false);
    const up = await menuRead(page);
    console.log("menu-up-evidence", kind, JSON.stringify(up.now));
    connected(up.now);
    if (kind !== "plain") {
      expect(up.now.actions).toEqual(["latest"]);
      expect(up.now.closes).toBe(1);
      expect(up.now.livePressed).toBe("false");
    }
    await page.evaluate(() => (window as MenuWindow).__menuProbe.dispose());
  }
  expect(records.plain.bubble).toHaveLength(1);
  expect(records.solid.bubble.length).toBe(records.react.bubble.length);
  await testInfo.attach("document-delivery", {
    body: JSON.stringify(records, null, 2),
    contentType: "application/json",
  });
});

for (const kind of ["solid", "react"] as const) {
  test(`${kind} native keyboard activation retains focused item until the action close notification`, async ({
    page,
  }) => {
    const label = page.locator(`#${kind}-label`);
    await expect(label).toBeVisible();
    await page.evaluate((kind) => {
      const fixture = (window as MenuWindow).__menuFixture;
      if (!fixture) throw new Error("missing menu fixture");
      (window as MenuWindow).__menuProbe = fixture.arm(kind);
      if (kind === "solid") fixture.updateSolid();
      else fixture.updateReact();
    }, kind);
    await expect(label).toHaveText(`${kind === "solid" ? "Solid" : "React"} updated`);
    const item = page
      .getByRole("menu", { name: `${kind === "solid" ? "Solid" : "React"} identity` })
      .getByRole("menuitem");
    await item.focus();
    await expect(item).toBeFocused();
    await expect(page.locator(`#${kind}-live`)).toHaveAttribute("data-live-focused", "true");
    connected((await menuRead(page)).now);
    await page.keyboard.press("Enter");
    const activated = (await menuRead(page)).now;
    console.log("menu-keyboard-evidence", kind, JSON.stringify(activated));
    connected(activated);
    expect(activated.actions).toEqual(["latest"]);
    expect(activated.closes).toBe(1);
    // Standalone controls observe close notifications; they have no popup to unmount.
    await expect(item).toBeFocused();
    await page.evaluate(() => (window as MenuWindow).__menuProbe.dispose());
  });
}

test("React control explicitly unmounts its stateful child", async ({ page }) => {
  await expect(page.locator("#react-child")).toHaveText("retained child state");
  const counts = await page.evaluate(() => {
    const fixture = (window as MenuWindow).__menuFixture;
    if (!fixture) throw new Error("missing menu fixture");
    fixture.disposeReact();
    return fixture.reactCounts;
  });
  expect(counts.mounts).toBe(1);
  expect(counts.cleanups).toBe(1);
  await expect(page.locator("#react-child")).toHaveCount(0);
});

type ChooserKind = "headless" | "styled" | "raw";
type ChooserPatch = {
  ownerDisabled?: boolean;
  childDisabled?: boolean;
  pending?: boolean;
  pendingFocusable?: boolean;
  callback?: "A" | "B" | "none";
  continuation?: boolean;
};
type Selection = {
  generation: string;
  isFileList: boolean;
  sameFiles: boolean;
  length: number;
  files: { name: string; type: string; size: number }[];
};
type ChooserSnapshot = {
  mounts: number;
  cleanups: number;
  child: number;
  ancestor: number;
  ancestorKeys: number;
  sameRoot: boolean;
  sameButton: boolean;
  sameInput: boolean;
  value: string;
  files: Selection["files"];
  selections: Selection[];
};
type ChooserWindow = Window & {
  __chooserFixture: Record<
    ChooserKind,
    {
      snapshot: () => ChooserSnapshot;
      update: (patch: ChooserPatch) => void;
    }
  >;
};
async function chooserRead(page: Page, kind: ChooserKind, patch?: ChooserPatch) {
  return page.evaluate(
    ({ kind, patch }) => {
      const fixture = (window as ChooserWindow).__chooserFixture;
      const control = fixture && fixture[kind];
      if (
        !control ||
        typeof control.snapshot !== "function" ||
        typeof control.update !== "function"
      )
        throw new Error(`missing chooser fixture: ${kind}`);
      if (patch) control.update(patch);
      return control.snapshot();
    },
    { kind, patch },
  );
}
function stableChooser(snapshot: ChooserSnapshot) {
  expect(snapshot).toMatchObject({
    mounts: 1,
    cleanups: 0,
    sameRoot: true,
    sameButton: true,
    sameInput: true,
  });
}
// Two browser frames plus 150ms is the explicit bounded duplicate/absence window.
async function chooserSettled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
  await page.waitForTimeout(150);
}
const payload = {
  name: "native-636.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("native-636\n"),
};
const expectedFile = { name: payload.name, type: payload.mimeType, size: payload.buffer.length };
type Gesture = "pointer" | "Enter" | "Space";
async function activateChooser(page: Page, kind: ChooserKind, gesture: Gesture) {
  const button = page.locator(`#chooser-${kind}-button`);
  if (gesture === "pointer") await button.click();
  else {
    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press(gesture);
  }
}
async function choose(
  page: Page,
  kind: ChooserKind,
  gesture: Gesture,
  generation = "A",
  continuation = false,
) {
  const before = await chooserRead(page, kind);
  const events: import("@playwright/test").FileChooser[] = [];
  const collect = (event: import("@playwright/test").FileChooser) => events.push(event);
  page.on("filechooser", collect);
  try {
    // Attach the rejection handler immediately: timeout is bounded even if activation fails.
    const waiting = page.waitForEvent("filechooser", { timeout: 5000 }).then(
      (event) => ({ event }),
      (error) => ({ error }),
    );
    await activateChooser(page, kind, gesture);
    const result = await waiting;
    if ("error" in result) {
      console.log(
        "chooser-timeout-evidence",
        JSON.stringify({
          kind,
          gesture,
          events: events.length,
          before,
          after: await chooserRead(page, kind),
        }),
      );
      throw result.error;
    }
    const owned = await result.event
      .element()
      .evaluate((input, id) => input === document.getElementById(id), `chooser-${kind}-input`);
    expect(owned).toBe(true);
    await result.event.setFiles(payload);
    await chooserSettled(page);
    const after = await chooserRead(page, kind);
    stableChooser(after);
    expect(events).toHaveLength(1);
    // Raw wrapper keyboard handling prevents the native button click default.
    expect(after.child - before.child).toBe(kind === "raw" && gesture !== "pointer" ? 0 : 1);
    expect(after.selections).toHaveLength(before.selections.length + 1);
    expect(after.selections.at(-1)).toEqual({
      generation,
      isFileList: true,
      sameFiles: true,
      length: 1,
      files: [expectedFile],
    });
    if (continuation) {
      const key = gesture === "pointer" ? "ancestor" : "ancestorKeys";
      expect(after[key] - before[key]).toBe(1);
    }
    console.log(
      "chooser-evidence",
      JSON.stringify({
        kind,
        gesture,
        events: events.length,
        owned,
        observation: "two frames + 150ms",
        before,
        after,
      }),
    );
  } finally {
    page.off("filechooser", collect);
  }
}
async function blockedChooser(
  page: Page,
  kind: "headless" | "styled",
  mode: "owner" | "child" | "pending" | "nonfocusable",
) {
  const before = await chooserRead(page, kind);
  let events = 0;
  const collect = () => events++;
  page.on("filechooser", collect);
  try {
    const button = page.locator(`#chooser-${kind}-button`);
    const unavailable = mode === "child" || mode === "nonfocusable";
    if (unavailable) {
      console.log(
        "chooser-disabled-precondition",
        JSON.stringify(
          await button.evaluate((node) => ({
            html: node.outerHTML,
            disabled: (node as HTMLButtonElement).disabled,
          })),
        ),
      );
      await expect(button).toBeDisabled();
      await expect.soft(button).toHaveJSProperty("disabled", true);
      await button.scrollIntoViewIfNeeded();
      const box = await button.boundingBox();
      if (!box) throw new Error("missing disabled button bounds");
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.locator(`#chooser-${kind}-before`).focus();
      await expect(page.locator(`#chooser-${kind}-before`)).toBeFocused();
      await page.keyboard.press("Tab");
      console.log(
        "chooser-tab-evidence",
        JSON.stringify(await page.evaluate(() => ({ active: document.activeElement?.outerHTML }))),
      );
      await expect.soft(page.locator(`#chooser-${kind}-after`)).toBeFocused();
    } else {
      await expect(button).not.toHaveAttribute("disabled", "");
      if (mode === "pending") await expect(button).toHaveAttribute("aria-disabled", "true");
      if (mode === "pending") {
        await button.scrollIntoViewIfNeeded();
        const box = await button.boundingBox();
        if (!box) throw new Error("missing pending button bounds");
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      } else await activateChooser(page, kind, "pointer");
      for (const gesture of ["Enter", "Space"] as const) await activateChooser(page, kind, gesture);
    }
    await chooserSettled(page);
    const after = await chooserRead(page, kind);
    stableChooser(after);
    expect(events).toBe(0);
    expect(after.selections).toEqual(before.selections);
    expect(after.value).toBe(before.value);
    expect(after.files).toEqual(before.files);
    if (mode !== "owner") expect(after.child).toBe(before.child);
    console.log(
      "chooser-blocked-evidence",
      JSON.stringify({
        kind,
        mode,
        events,
        observation: "completed actions + two frames + 150ms",
        before,
        after,
      }),
    );
  } finally {
    page.off("filechooser", collect);
  }
}

test.describe("trusted chooser", () => {
  test.use({ trustedChooser: true });
  test("runtime loads source owners, one Solid entry and generated styled CSS", async ({
    page,
    browser,
  }) => {
    const evidence = await page.evaluate(() => {
      const button = document.getElementById("chooser-styled-button");
      if (!(button instanceof HTMLButtonElement)) throw new Error("missing styled button");
      const urls = performance.getEntriesByType("resource").map((entry) => entry.name);
      const styles = Array.from(document.querySelectorAll("style[data-vite-dev-id]")).map(
        (node) => ({
          id: node.getAttribute("data-vite-dev-id"),
          bytes: node.textContent?.length ?? 0,
        }),
      );
      const matched: string[] = [];
      function inspect(rules: CSSRuleList) {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule) {
            try {
              if (button!.matches(rule.selectorText)) matched.push(rule.cssText);
            } catch {
              /* pseudo selectors */
            }
          }
          if ("cssRules" in rule) inspect((rule as CSSGroupingRule).cssRules);
        }
      }
      for (const sheet of Array.from(document.styleSheets)) inspect(sheet.cssRules);
      return { urls, styles, matched, className: button.className };
    });
    for (const owner of [
      "solidaria-components/src/Button.tsx",
      "solidaria-components/src/FileTrigger.tsx",
      "solidaria-components/src/fileTriggerContext.ts",
      "solid-spectrum/src/button/Button.tsx",
      "solid-spectrum/src/filetrigger/index.tsx",
    ])
      expect(
        evidence.urls.some((url) => url.includes(owner)),
        owner,
      ).toBe(true);
    expect(evidence.urls.filter((url) => /\/solid-js\.js(?:\?|$)/.test(url))).toHaveLength(1);
    expect(
      evidence.urls.filter((url) =>
        /packages\/(solidaria-components|solid-spectrum)\/dist\//.test(url),
      ),
    ).toEqual([]);
    expect(evidence.styles.some((style) => style.bytes > 0)).toBe(true);
    expect(evidence.matched.length).toBeGreaterThan(0);
    console.log(
      "chooser-runtime-evidence",
      JSON.stringify({ chromium: browser.version(), ...evidence }),
    );
  });
  for (const kind of ["headless", "styled", "raw"] as const) {
    for (const gesture of ["pointer", "Enter", "Space"] as const) {
      test(`${kind} ${gesture} delivers once and reselects the same file`, async ({ page }) => {
        stableChooser(await chooserRead(page, kind));
        if (kind === "styled")
          await expect(
            page.locator("#chooser-styled .native-spectrum-wrapper > button"),
          ).toHaveCount(1);
        await choose(page, kind, gesture);
        await choose(page, kind, gesture);
      });
    }
    test(`${kind} live callback updates keep nodes and do not activate`, async ({ page }) => {
      await choose(page, kind, "pointer");
      const before = await chooserRead(page, kind);
      let events = 0;
      const collect = () => events++;
      page.on("filechooser", collect);
      try {
        for (const callback of ["B", "none", "B"] as const) {
          await chooserRead(page, kind, { callback });
          await chooserSettled(page);
          expect(await chooserRead(page, kind)).toEqual(before);
        }
        expect(events).toBe(0);
      } finally {
        page.off("filechooser", collect);
      }
      await choose(page, kind, "Enter", "B");
    });
  }
  for (const kind of ["headless", "styled"] as const) {
    test(`${kind} owner disability cycles and child disability preserve the selected file`, async ({
      page,
    }) => {
      await chooserRead(page, kind, { ownerDisabled: true, childDisabled: false });
      await blockedChooser(page, kind, "owner");
      await chooserRead(page, kind, { ownerDisabled: false });
      await choose(page, kind, "pointer");
      await chooserRead(page, kind, { ownerDisabled: true });
      await blockedChooser(page, kind, "owner");
      await chooserRead(page, kind, { ownerDisabled: false, callback: "B" });
      await choose(page, kind, "Space", "B");
      await chooserRead(page, kind, { childDisabled: true });
      await blockedChooser(page, kind, "child");
      await chooserRead(page, kind, { childDisabled: false });
      await choose(page, kind, "Enter", "B");
      await choose(page, "raw", "pointer");
    });
    // Spectrum's supported contract always keeps pending Buttons focusable.
    for (const focusable of kind === "headless" ? [true, false] : [true]) {
      test(`${kind} pending ${focusable ? "focusable" : "nonfocusable"} blocks and re-enables without remount`, async ({
        page,
      }) => {
        await choose(page, kind, "pointer");
        await chooserRead(page, kind, { pending: true, pendingFocusable: focusable });
        await blockedChooser(page, kind, focusable ? "pending" : "nonfocusable");
        await choose(page, "raw", "Space");
        await chooserRead(page, kind, { pending: false, callback: "B" });
        await choose(page, kind, "Enter", "B");
      });
    }
    test(`${kind} continuation reaches ancestor once without a second chooser`, async ({
      page,
    }) => {
      await chooserRead(page, kind, { continuation: true });
      for (const gesture of ["pointer", "Enter", "Space"] as const)
        await choose(page, kind, gesture, "A", true);
    });
  }
});

// #642 phase1 only. Two diagnostic + two timing-comparison attempts per cell;
// persistent reservations cap ALL focused/final invocations at ten per cell.
// UI630_REPLAY_GUARDS_BEGIN — exact frozen extraction; no browser registrations or operations.
const popup642Prefix = "/tmp/ui-642-popup-20261009";
const popup642Consumer = "/home/emoporemilio/projects/viviana-hub/visualmode/visualmode";
const popup642Policy = "/tmp/ui-642-offline-font-2026-10-09/receipt.json";
const popup642Generation = "28b88444-8143-4feb-a309-5500c28c5879";
const popup642Hash = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
type Popup642Input = { path: string; sha256: string; bytes: number };
type Popup642ReplayBinding = {
  schema: 1;
  purpose: "explicit-regression-replay";
  ownerTicket: 630;
  sourceTicket: 642;
  epoch: string;
  prefix: "/tmp/ui-630-native-20261009";
  generation: string;
  base: string;
  registration: Popup642Input;
  allowancePerCell: 4;
  invocation: {
    id: string;
    ledgerBefore:
      | { absent: true }
      | (Popup642Input & {
          absent: false;
          epochBindingSha256: string;
          counts: Record<string, number>;
        });
  };
  history: {
    generation: string;
    seal: Popup642Input;
    evidenceManifest: Popup642Input & { originalKey: string };
    ledger: Popup642Input & { originalPath: string };
  };
  inputs: { policy: Popup642Input; geist: Popup642Input; adobe: Popup642Input; css: Popup642Input };
};
type Popup642Execution = {
  prefix: string;
  generation: string;
  registrationPath: string;
  policyPath: string;
  geistPath: string;
  cssPath: string;
  adobePath?: string;
  inputs?: { policy: Buffer; geist: Buffer; adobe: Buffer; css: Buffer };
  replay?: {
    binding: Popup642ReplayBinding;
    path: string;
    sha256: string;
    priorCounts: Record<string, number>;
  };
};

function popup642Execution(outputDir: string): Popup642Execution {
  const output630 = resolve(outputDir).startsWith("/tmp/ui-630-native-20261009-");
  const path = process.env.UI_NATIVE_POPUP_REPLAY_BINDING;
  const expectedHash = process.env.UI_NATIVE_POPUP_REPLAY_BINDING_SHA256;
  if (path === undefined && expectedHash === undefined) {
    if (output630) throw new Error("#630 output requires both explicit replay keys");
    return {
      prefix: popup642Prefix,
      generation: popup642Generation,
      registrationPath: `${popup642Prefix}-registration-2026-10-08.json`,
      policyPath: popup642Policy,
      geistPath: `${popup642Consumer}/engine/crates/foundation/fixtures/fonts/geist-mono/GeistMono[wght].ttf`,
      cssPath: `${popup642Consumer}/src/styles/design-system.css`,
    };
  }
  if (!output630) throw new Error("explicit popup replay requires #630 output");
  // Root authenticates the issuance externally. A digest alone grants no authority.
  if (!path || !expectedHash || !/^[a-f0-9]{64}$/.test(expectedHash))
    throw new Error("incomplete explicit popup replay binding");
  if (path !== "/tmp/ui-630-native-20261009-replay-binding.json" || realpathSync(path) !== path)
    throw new Error("noncanonical popup replay binding path");
  const bytes = readFileSync(path);
  if (popup642Hash(bytes) !== expectedHash) throw new Error("popup replay binding changed");
  const binding: Popup642ReplayBinding = JSON.parse(bytes.toString("utf8"));
  if (
    binding.schema !== 1 ||
    binding.purpose !== "explicit-regression-replay" ||
    binding.ownerTicket !== 630 ||
    binding.sourceTicket !== 642 ||
    binding.prefix !== "/tmp/ui-630-native-20261009" ||
    typeof binding.epoch !== "string" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(binding.epoch) ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(binding.generation) ||
    !/^[a-f0-9]{40}$/.test(binding.base) ||
    binding.allowancePerCell !== 4 ||
    binding.history.generation !== popup642Generation ||
    binding.generation === binding.history.generation
  )
    throw new Error("invalid explicit popup regression epoch");
  const input = (ref: Popup642Input, registration = false) => {
    const ownedPath = registration
      ? ref.path === `${binding.prefix}-registration-2026-10-08.json`
      : ref.path.startsWith(`${binding.prefix}-inputs/`);
    if (
      !ownedPath ||
      resolve(ref.path) !== ref.path ||
      realpathSync(ref.path) !== ref.path ||
      !/^[a-f0-9]{64}$/.test(ref.sha256) ||
      !Number.isSafeInteger(ref.bytes) ||
      ref.bytes < 0
    )
      throw new Error("noncanonical popup replay input");
    const value = readFileSync(ref.path);
    if (value.length !== ref.bytes || popup642Hash(value) !== ref.sha256)
      throw new Error(`popup replay input changed: ${ref.path}`);
    return value;
  };
  const registration = JSON.parse(input(binding.registration, true).toString("utf8"));
  if (
    registration.launch_generation !== binding.generation ||
    registration.base !== binding.base ||
    registration.target !== "ui-630-native-20261009" ||
    registration.repository !== "repo:ui"
  )
    throw new Error("popup replay registration mismatch");
  const seal = JSON.parse(input(binding.history.seal).toString("utf8"));
  const manifest = JSON.parse(input(binding.history.evidenceManifest).toString("utf8"));
  const history = JSON.parse(input(binding.history.ledger).toString("utf8"));
  const priorCounts = popup642LatestHistory(binding, seal, manifest, history);
  popup642Invocation(binding);
  const inputs = {
    policy: input(binding.inputs.policy),
    geist: input(binding.inputs.geist),
    adobe: input(binding.inputs.adobe),
    css: input(binding.inputs.css),
  };
  return {
    prefix: binding.prefix,
    generation: binding.generation,
    registrationPath: binding.registration.path,
    policyPath: binding.inputs.policy.path,
    geistPath: binding.inputs.geist.path,
    cssPath: binding.inputs.css.path,
    adobePath: binding.inputs.adobe.path,
    inputs,
    replay: { binding, path, sha256: expectedHash, priorCounts },
  };
}
// Evidence pins supplied by root for this admission, never a selectable older chain.
const popup642Cells = ["source", "react"].flatMap((implementation) =>
  ["light", "dark"].flatMap((theme) =>
    [220, 280].map((width) => `${implementation}:${theme}:${width}`),
  ),
);
type Popup642History = {
  generation: string;
  cells: Record<string, Array<{ count: number; status: string; sha256: string }>>;
};
function popup642LatestHistory(
  binding: Popup642ReplayBinding,
  seal: { generation: string; files: Record<string, Popup642Input> },
  manifest: { generation: string; files: Record<string, Popup642Input> },
  history: Popup642History,
): Record<string, number> {
  const manifestKey = binding.history.evidenceManifest.originalKey;
  const ledgerKey = binding.history.ledger.originalPath;
  if (
    binding.history.seal.sha256 !==
      "4e238bbfaf939c3c16c62115cfdbb0474b59b37e272393d9f0f70f90121fa9a1" ||
    binding.history.seal.bytes !== 4647 ||
    manifestKey !== "/tmp/ui-642-popup-20261009-evidence-manifest.json" ||
    binding.history.evidenceManifest.sha256 !==
      "534927967fcfb4e8ecfa13f261ac2d1d90467fafdd896f76e0e0db991e084d99" ||
    binding.history.evidenceManifest.bytes !== 549520 ||
    ledgerKey !== "/tmp/ui-642-popup-20261009-attempts.json" ||
    binding.history.ledger.sha256 !==
      "2115e00738c412eb8f9a8a38858d518650a8418b80629c5f6ebc250498f7e876" ||
    binding.history.ledger.bytes !== 28355 ||
    binding.history.generation !== popup642Generation
  )
    throw new Error("popup replay requires exact latest accepted checkpoint");
  const manifestRow = Object.hasOwn(seal.files, manifestKey) ? seal.files[manifestKey] : undefined;
  const ledgerRow = Object.hasOwn(manifest.files, ledgerKey)
    ? manifest.files[ledgerKey]
    : undefined;
  if (
    seal.generation !== popup642Generation ||
    manifest.generation !== popup642Generation ||
    history.generation !== popup642Generation ||
    manifestRow?.sha256 !== binding.history.evidenceManifest.sha256 ||
    manifestRow?.bytes !== binding.history.evidenceManifest.bytes ||
    ledgerRow?.sha256 !== binding.history.ledger.sha256 ||
    ledgerRow?.bytes !== binding.history.ledger.bytes
  )
    throw new Error("popup replay history is not linked to its seal");
  if (
    Object.keys(history.cells).length !== 8 ||
    popup642Cells.some((cell) => !Object.hasOwn(history.cells, cell))
  )
    throw new Error("popup replay history cell inventory mismatch");
  const priorCounts: Record<string, number> = {};
  for (const cell of popup642Cells) {
    const entries = history.cells[cell];
    if (
      !Array.isArray(entries) ||
      entries.length !== 8 ||
      entries.some(
        (entry, index) =>
          entry.count !== index + 1 ||
          entry.status !== (index < 4 ? "failed" : "passed") ||
          !/^[a-f0-9]{64}$/.test(entry.sha256),
      )
    )
      throw new Error(`invalid latest completed popup history: ${cell}`);
    priorCounts[cell] = 8;
  }
  return priorCounts;
}
function popup642Invocation(binding: Popup642ReplayBinding) {
  const invocation = binding.invocation;
  if (
    !invocation ||
    typeof invocation.id !== "string" ||
    !/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/.test(invocation.id)
  )
    throw new Error("missing root invocation starting-state");
  const before = invocation.ledgerBefore;
  if (before?.absent === true) {
    if (Object.keys(before).length !== 1) throw new Error("invalid absent starting-state");
  } else if (before?.absent === false) {
    if (
      before.path !== `${binding.prefix}-attempts.json` ||
      typeof before.epochBindingSha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(before.epochBindingSha256) ||
      !/^[a-f0-9]{64}$/.test(before.sha256) ||
      !Number.isSafeInteger(before.bytes) ||
      before.bytes < 0 ||
      Object.keys(before.counts).length !== 8 ||
      popup642Cells.some(
        (cell) =>
          !Object.hasOwn(before.counts, cell) ||
          !Number.isInteger(before.counts[cell]) ||
          before.counts[cell] < 0 ||
          before.counts[cell] > 4,
      )
    )
      throw new Error("invalid present invocation starting-state");
  } else throw new Error("invalid invocation ledger presence");
}
type Popup642Reservation = {
  count: number;
  priorCount: number;
  cumulativeCount: number;
  replayEpoch: string;
  status: string;
  case: string;
  sha256?: string;
  receiptPath?: string;
};
type Popup642Ledger = {
  generation: string;
  replayEpoch: string;
  replayBindingSha256: string;
  historyLedgerSha256: string;
  cells: Record<string, Popup642Reservation[]>;
};
type Popup642Expected = {
  invocation: string;
  binding: string;
  absent: boolean;
  sha256?: string;
  bytes?: number;
  counts: Record<string, number>;
};
let popup642ExpectedLedger: Popup642Expected | undefined;
function popup642ReplayLedgerShape(
  ledger: Popup642Ledger,
  execution: Popup642Execution,
  reserved = false,
) {
  const replay = execution.replay!;
  const before = replay.binding.invocation.ledgerBefore;
  if (
    ledger.generation !== execution.generation ||
    ledger.replayEpoch !== replay.binding.epoch ||
    ledger.replayBindingSha256 !== (before.absent ? replay.sha256 : before.epochBindingSha256) ||
    ledger.historyLedgerSha256 !== replay.binding.history.ledger.sha256 ||
    Object.keys(ledger.cells).length !== 8 ||
    popup642Cells.some((cell) => !Object.hasOwn(ledger.cells, cell))
  )
    throw new Error("popup replay ledger identity/cell mismatch");
  const counts: Record<string, number> = {};
  let reservations = 0;
  for (const cell of popup642Cells) {
    const entries = ledger.cells[cell];
    if (
      !Array.isArray(entries) ||
      entries.length > 4 ||
      entries.some(
        (entry, index) =>
          entry.count !== index + 1 ||
          entry.replayEpoch !== replay.binding.epoch ||
          entry.priorCount !== 8 ||
          entry.cumulativeCount !== 9 + index ||
          (entry.status === "reserved-before-navigation"
            ? !reserved || index !== entries.length - 1
            : !["passed", "failed", "interrupted", "timedOut", "skipped"].includes(entry.status) ||
              !entry.sha256 ||
              !/^[a-f0-9]{64}$/.test(entry.sha256)),
      )
    )
      throw new Error(`popup replay reservation history mismatch: ${cell}`);
    reservations += entries.filter((entry) => entry.status === "reserved-before-navigation").length;
    counts[cell] = entries.length;
  }
  if (reservations > 1 || (reserved && reservations !== 1))
    throw new Error("popup replay requires exactly its current reservation");
  return counts;
}
function popup642ReadReplayLedger(execution: Popup642Execution, reserved = false): Popup642Ledger {
  const replay = execution.replay!,
    path = `${execution.prefix}-attempts.json`;
  const before = replay.binding.invocation.ledgerBefore;
  const expected = popup642ExpectedLedger ?? {
    invocation: replay.binding.invocation.id,
    binding: replay.sha256,
    absent: before.absent,
    ...(before.absent ? {} : { sha256: before.sha256, bytes: before.bytes }),
    counts: before.absent
      ? Object.fromEntries(popup642Cells.map((cell) => [cell, 0]))
      : before.counts,
  };
  if (expected.invocation !== replay.binding.invocation.id || expected.binding !== replay.sha256)
    throw new Error("popup replay invocation changed within worker");
  const stat = lstatSync(path, { throwIfNoEntry: false });
  if (stat && !stat.isFile()) throw new Error("non-file/symlink popup replay ledger");
  if (!stat) {
    if (!expected.absent) throw new Error("popup replay ledger deleted; no recreation");
    popup642ExpectedLedger = expected;
    return {
      generation: execution.generation,
      replayEpoch: replay.binding.epoch,
      replayBindingSha256: replay.sha256,
      historyLedgerSha256: replay.binding.history.ledger.sha256,
      cells: Object.fromEntries(popup642Cells.map((cell) => [cell, []])),
    };
  }
  if (expected.absent || realpathSync(path) !== path)
    throw new Error("unexpected/redirected popup replay ledger");
  const bytes = readFileSync(path);
  if (bytes.length !== expected.bytes || popup642Hash(bytes) !== expected.sha256)
    throw new Error("popup replay serialized state changed/truncated");
  const ledger: Popup642Ledger = JSON.parse(bytes.toString("utf8"));
  const counts = popup642ReplayLedgerShape(ledger, execution, reserved);
  if (popup642Cells.some((cell) => counts[cell] !== expected.counts[cell]))
    throw new Error("popup replay starting-state counts mismatch");
  popup642ExpectedLedger = expected;
  return ledger;
}
function popup642WriteReplayLedger(
  ledger: Popup642Ledger,
  execution: Popup642Execution,
  reserved = false,
) {
  const counts = popup642ReplayLedgerShape(ledger, execution, reserved);
  const bytes = JSON.stringify(ledger, null, 2);
  writeFileSync(`${execution.prefix}-attempts.json`, bytes);
  popup642ExpectedLedger = {
    invocation: execution.replay!.binding.invocation.id,
    binding: execution.replay!.sha256,
    absent: false,
    sha256: popup642Hash(bytes),
    bytes: Buffer.byteLength(bytes),
    counts,
  };
}
function popup642ReplayCustody(custody: Record<string, unknown>, execution: Popup642Execution) {
  const replay = execution.replay;
  if (!replay) throw new Error("missing replay custody execution");
  if (
    custody.generation !== execution.generation ||
    custody.base !== replay.binding.base ||
    custody.target !== "ui-630-native-20261009" ||
    custody.exclusive !== true ||
    custody.visualmode10250Released !== true ||
    custody.revoked === true ||
    custody.port !== 4479 ||
    custody.cacheDir !== "/tmp/ui-636-native-vite-cache" ||
    custody.replayEpoch !== replay.binding.epoch ||
    custody.replayBindingSha256 !== replay.sha256 ||
    custody.invocationId !== replay.binding.invocation.id ||
    JSON.stringify(custody.ledgerBefore) !== JSON.stringify(replay.binding.invocation.ledgerBefore)
  )
    throw new Error("popup replay custody invocation mismatch");
}
function popup642ReplayCapacity(
  entries: Popup642Reservation[],
  execution: Popup642Execution,
  cell: string,
) {
  if (!execution.replay || entries.length >= execution.replay.binding.allowancePerCell)
    throw new Error(`popup replay explicit regression allowance exhausted: ${cell}`);
}
function popup642ReplayFinalization(
  ledger: Popup642Ledger,
  execution: Popup642Execution,
  cell: string,
  run: { count: number; case: string },
) {
  const matches = ledger.cells[cell].filter((entry) => entry.count === run.count);
  const entry = matches[0];
  if (
    !execution.replay ||
    matches.length !== 1 ||
    entry.status !== "reserved-before-navigation" ||
    entry.case !== run.case ||
    entry.count !== run.count ||
    entry.priorCount !== 8 ||
    entry.cumulativeCount !== 8 + run.count ||
    entry.replayEpoch !== execution.replay.binding.epoch
  )
    throw new Error("popup replay finalization lost/changed current reservation");
  return entry;
}
// UI630_REPLAY_GUARDS_END
const popup642Executions = new WeakMap<Page, Popup642Execution>();
// Root enforces single-use launch externally. Memory/hash guards cannot prevent
// a restarted process replaying an old absent-state binding after deletion.
type Popup642Window = Window & {
  __popup642: {
    dispose(): void;
    snapshot(): Record<string, unknown>;
    refs: Record<string, HTMLButtonElement>;
    accepted: Record<string, string>;
  };
  __popup642Final?: {
    stop(): void;
    snapshot(): {
      startedAt: number;
      commit: null | {
        time: number;
        trusted: boolean;
        key: string;
        id: string;
        text: string;
        role: string | null;
        focused: boolean;
        inOriginalPopup: boolean;
      };
      commitCount: number;
      events: Array<{
        time: number;
        phase: number;
        id?: string;
        field?: string | null;
        afterCommit: boolean;
        originalDirection: boolean;
      }>;
      dropped: number;
    };
  };
  __popup642Passive: {
    events: Array<Record<string, unknown>>;
    dropped: number;
    nextNode: number;
    nodes: WeakMap<Node, number>;
  };
};
type Popup642Run = {
  case: string;
  count: number;
  at: string;
  errors: string[];
  network: Array<Record<string, unknown>>;
  modules: Array<Record<string, unknown>>;
  pending: Promise<void>[];
  steps: Array<Record<string, unknown>>;
};
const popup642Runs = new WeakMap<Page, Popup642Run>();

async function preparePopup642(page: Page, selected: string, info: TestInfo) {
  const execution = popup642Execution(info.outputDir);
  if (!resolve(info.outputDir).startsWith(`${execution.prefix}-`))
    throw new Error("#642 requires owned --output prefix");
  const [implementation, theme, width, lane] = selected.split(":");
  if (!/^(source|react):(light|dark):(220|280):(diagnostic|uninstrumented)$/.test(selected))
    throw new Error("invalid #642 test mode");
  const registration = JSON.parse(readFileSync(execution.registrationPath, "utf8"));
  if (registration.launch_generation !== execution.generation)
    throw new Error("#642 registration generation changed");
  // Runtime admission is separate from preparation. Do not infer it from port release.
  const custodyPath = `${execution.prefix}-browser-custody.json`;
  if (!existsSync(custodyPath)) throw new Error(`#642 browser custody absent: ${custodyPath}`);
  const custody = JSON.parse(readFileSync(custodyPath, "utf8"));
  if (
    custody.generation !== execution.generation ||
    custody.port !== 4479 ||
    custody.exclusive !== true ||
    custody.visualmode10250Released !== true ||
    custody.cacheDir !== "/tmp/ui-636-native-vite-cache"
  )
    throw new Error("#642 incomplete generation-bound browser custody");
  const replay = execution.replay;
  if (replay && realpathSync(custodyPath) !== custodyPath)
    throw new Error("redirected popup replay custody");
  if (replay) popup642ReplayCustody(custody, execution);
  const ledgerPath = `${execution.prefix}-attempts.json`;
  const ledger = replay
    ? popup642ReadReplayLedger(execution)
    : existsSync(ledgerPath)
      ? JSON.parse(readFileSync(ledgerPath, "utf8"))
      : { generation: execution.generation, cells: {} };
  if (ledger.generation !== execution.generation)
    throw new Error("#642 attempt generation mismatch");
  const cell = `${implementation}:${theme}:${width}`;
  const entries = (ledger.cells[cell] ??= []);
  if (replay) popup642ReplayCapacity(entries, execution, cell);
  if (!replay && entries.length >= 10)
    throw new Error(
      `#642 ${replay ? "explicit regression allowance" : "ten-attempt TOTAL"} exhausted: ${cell}`,
    );
  const reservation = {
    case: info.title,
    lane,
    at: new Date().toISOString(),
    count: entries.length + 1,
    status: "reserved-before-navigation",
    ...(replay
      ? {
          replayEpoch: replay.binding.epoch,
          priorCount: replay.priorCounts[cell],
          cumulativeCount: replay.priorCounts[cell] + entries.length + 1,
        }
      : {}),
  };
  entries.push(reservation);
  if (replay) popup642WriteReplayLedger(ledger, execution, true);
  else writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  const run: Popup642Run = {
    ...reservation,
    errors: [],
    network: [],
    modules: [],
    pending: [],
    steps: [],
  };
  popup642Runs.set(page, run);
  popup642Executions.set(page, execution);
  const geistPath = execution.geistPath;
  const geist = execution.inputs?.geist ?? readFileSync(geistPath);
  if (
    geist.length !== 138896 ||
    popup642Hash(geist) !== "2386ddac2c72b6e0c126561e91486b7284412f303d8d9513da9ffec789e63338"
  )
    throw new Error("#642 original Geist bytes mismatch");
  const policy = JSON.parse(
    execution.inputs?.policy.toString("utf8") ?? readFileSync(execution.policyPath, "utf8"),
  );
  const adobePath = execution.adobePath ?? policy.path;
  const adobe = execution.inputs?.adobe ?? readFileSync(adobePath);
  if (
    policy.success !== true ||
    adobe.length !== 482528 ||
    popup642Hash(adobe) !== "82d5975ac48b94197a94d944a6a1ee6b234e813e2ee469e2c63e3012319cd416" ||
    policy.sha256 !== popup642Hash(adobe)
  )
    throw new Error("#642 reviewed Adobe input mismatch");
  const consumerCSS =
    execution.inputs?.css.toString("utf8") ?? readFileSync(execution.cssPath, "utf8");
  // Exact authored consumer rules; only package import and local font URL adapt.
  const css = consumerCSS
    .replace("@import '@proyecto-viviana/ui/components.css';", "")
    .replace(
      "../../engine/crates/foundation/fixtures/fonts/geist-mono/GeistMono[wght].ttf?no-inline",
      "/__ui642/GeistMono-variable.ttf",
    );
  run.steps.push({
    type: "font-policy",
    policy: execution.policyPath,
    policyHash: popup642Hash(execution.inputs?.policy ?? readFileSync(execution.policyPath)),
    geistPath,
    geistHash: popup642Hash(geist),
    adobePath,
    adobeHash: popup642Hash(adobe),
    authoredCSSHash: popup642Hash(consumerCSS),
    boundCSSHash: popup642Hash(css),
    custody,
  });
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();
    const parsed = new URL(url);
    if (url === policy.url && request.method() === "GET" && request.resourceType() === "font") {
      run.network.push({
        type: "mapped-adobe-preload",
        url,
        resourceType: request.resourceType(),
        hash: popup642Hash(adobe),
        bytes: adobe.length,
      });
      await route.fulfill({
        status: 200,
        body: adobe,
        contentType: "font/woff2",
        headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
      });
    } else if (
      parsed.origin === "http://127.0.0.1:4479" &&
      parsed.pathname === "/__ui642/GeistMono-variable.ttf" &&
      !parsed.search &&
      request.method() === "GET" &&
      request.resourceType() === "font"
    ) {
      run.network.push({
        type: "local-original-geist",
        url,
        hash: popup642Hash(geist),
        bytes: geist.length,
      });
      await route.fulfill({
        status: 200,
        body: geist,
        contentType: "font/ttf",
        headers: { "Cache-Control": "no-store" },
      });
    } else if (parsed.origin === "http://127.0.0.1:4479" && request.resourceType() !== "font") {
      await route.continue();
    } else {
      run.errors.push(
        `unadmitted external/font request: ${request.method()} ${request.resourceType()} ${url}`,
      );
      run.network.push({ type: "rejected", url, resourceType: request.resourceType() });
      await route.abort("blockedbyclient");
    }
  });
  page.on("response", (response) => {
    if (!["script", "stylesheet"].includes(response.request().resourceType())) return;
    // Hash actual served modules/macro output without browser evaluation or IO
    // during key pairs. Source/toolchain on-disk identities are separate evidence.
    const pending = response.body().then(
      (body) => {
        run.modules.push({
          url: response.url(),
          status: response.status(),
          sha256: popup642Hash(body),
          bytes: body.length,
        });
      },
      (error) => {
        run.errors.push(`module identity: ${response.url()}: ${String(error)}`);
      },
    );
    run.pending.push(pending);
  });
  await page.addInitScript(
    ({ css, diagnostic, optionKeys }) => {
      const installCSS = () => {
        if (!document.head) return false;
        const style = document.createElement("style");
        style.dataset.ui642ConsumerCSS = "true";
        style.textContent = css;
        document.head.append(style);
        return true;
      };
      if (!installCSS()) {
        const head = new MutationObserver(() => {
          if (installCSS()) head.disconnect();
        });
        head.observe(document, { childList: true, subtree: true });
      }
      if (!diagnostic) return;
      const state = {
        events: [] as Array<Record<string, unknown>>,
        dropped: 0,
        nextNode: 1,
        nodes: new WeakMap<Node, number>(),
      };
      (window as Popup642Window).__popup642Passive = state;
      const identify = (target: EventTarget | null): Record<string, unknown> | null => {
        if (!(target instanceof Element)) return target === document ? { document: true } : null;
        if (!state.nodes.has(target)) state.nodes.set(target, state.nextNode++);
        return {
          node: state.nodes.get(target),
          tag: target.tagName,
          id: target.id,
          role: target.getAttribute("role"),
          key:
            target.getAttribute("role") === "option"
              ? optionKeys[target.textContent?.trim() ?? ""]
              : null,
          keySource: "fixture-public-options-by-unique-text",
          nativeDataKey: target.getAttribute("data-key"),
          text: target.textContent?.trim().slice(0, 160),
          field: target
            .closest("[data-canvas-entry-field]")
            ?.getAttribute("data-canvas-entry-field"),
          popup: target.closest('[role="listbox"]')?.getAttribute("aria-label"),
          connected: target.isConnected,
        };
      };
      const record = (row: Record<string, unknown>) => {
        if (state.events.length === 2048) {
          state.events.shift();
          state.dropped++;
        }
        row.time = performance.now();
        state.events.push(row);
      };
      for (const type of [
        "keydown",
        "keyup",
        "focusin",
        "focusout",
        "react-aria-focus-scope-restore",
      ]) {
        document.addEventListener(
          type,
          (event) => {
            const row = {
              type,
              key: event instanceof KeyboardEvent ? event.key : undefined,
              trusted: event.isTrusted,
              phase: event.eventPhase,
              target: identify(event.target),
              currentTarget: identify(event.currentTarget),
              active: identify(document.activeElement),
              defaultPreventedAtCapture: event.defaultPrevented,
              defaultPreventedAfterDispatch: undefined as boolean | undefined,
            };
            record(row);
            // Capture synchronously; cancellation is observed after dispatch only.
            if (type === "react-aria-focus-scope-restore")
              queueMicrotask(() => {
                row.defaultPreventedAfterDispatch = event.defaultPrevented;
              });
          },
          true,
        );
      }
      const popups = (node: Node) =>
        node instanceof Element
          ? [
              node,
              ...node.querySelectorAll('[role="listbox"], [data-entering], [data-exiting]'),
            ].filter((el) => el.matches('[role="listbox"], [data-entering], [data-exiting]'))
          : [];
      new MutationObserver((records) => {
        for (const mutation of records) {
          if (mutation.type === "attributes")
            record({
              type: "popup-attribute",
              attribute: mutation.attributeName,
              target: identify(mutation.target),
              entering: (mutation.target as Element).hasAttribute("data-entering"),
              exiting: (mutation.target as Element).hasAttribute("data-exiting"),
            });
          else {
            for (const node of mutation.addedNodes)
              for (const el of popups(node))
                record({ type: "popup-dom-add", target: identify(el) });
            for (const node of mutation.removedNodes)
              for (const el of popups(node))
                record({ type: "popup-dom-remove", target: identify(el) });
          }
        }
      }).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-entering", "data-exiting"],
      });
    },
    {
      css,
      diagnostic: lane === "diagnostic",
      optionKeys: {
        "Default (starter)": "",
        "LibreBaskerville-Regular": "LibreBaskerville-Regular",
        "Abel-Regular": "Abel-Regular",
        "Acme-Regular": "Acme-Regular",
        "Smokum-Regular": "Smokum-Regular",
        "GeistMono[wght]": "GeistMono[wght]",
        Left: "left",
        Center: "center",
        Right: "right",
        ltr: "ltr",
        rtl: "rtl",
      } as Record<string, string>,
    },
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/?ui642=${implementation}&theme=${theme}&width=${width}&lane=${lane}`);
  await expect(page.locator("#root")).toHaveAttribute("data-popup-ready", "true");
  await page.evaluate(async () => {
    await document.fonts.load('16px "Geist Mono"');
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => document.fonts.check('16px "Geist Mono"'))).toBe(true);
  await expect(page.locator("#hint")).toHaveCount(0);
  await expect(
    page.locator("#react-root, #focus-mount, #plain-root, #chooser-headless"),
  ).toHaveCount(0);
}

async function popup642Measure(page: Page, step: string) {
  const result = await page.evaluate((step) => {
    const measure = (el: Element) => {
      const s = getComputedStyle(el),
        r = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        id: el.id,
        role: el.getAttribute("role"),
        text: el.textContent?.trim().slice(0, 160),
        family: s.fontFamily,
        size: s.fontSize,
        weight: s.fontWeight,
        lineHeight: s.lineHeight,
        displayFamily: s.getPropertyValue("--s2-font-family-display"),
        sansFamily: s.getPropertyValue("--s2-font-family-sans"),
        codeFamily: s.getPropertyValue("--s2-font-family-code"),
        mono: s.getPropertyValue("--font-mono"),
        animation: s.animation,
        transition: s.transition,
        entering: el.hasAttribute("data-entering"),
        exiting: el.hasAttribute("data-exiting"),
        x: r.x,
        y: r.y,
        width: r.width,
        height: r.height,
        right: r.right,
        bottom: r.bottom,
      };
    };
    const boxes = [...document.querySelectorAll('[role="listbox"]')];
    const section = document.querySelector("[data-canvas-entry-world-text-section]")!;
    const plainLabel = (field: string) =>
      section.querySelector(`[data-canvas-entry-field="${field}"]`)!.closest("label")!
        .firstElementChild!;
    return {
      step,
      time: performance.now(),
      fonts: {
        status: document.fonts.status,
        geistReady: document.fonts.check('16px "Geist Mono"'),
        faces: [...document.fonts].map((f) => ({
          family: f.family,
          status: f.status,
          weight: f.weight,
        })),
      },
      // Standalone Text may differ (source meta role vs inherited S2 metrics).
      // These are measurements, never an equality assertion or style override.
      standaloneText: {
        heading: measure(section.firstElementChild!),
        contentLabel: measure(plainLabel("text-content")),
        sizeLabel: measure(plainLabel("text-font-size")),
      },
      controls: [
        ...document.querySelectorAll(
          "[data-canvas-entry-world-text-section] input, [data-canvas-entry-world-text-section] button",
        ),
      ].map(measure),
      popups: boxes.map((el) => ({
        listbox: measure(el),
        options: [...el.querySelectorAll('[role="option"]')].map(measure),
        ancestors: (() => {
          const parents = [];
          for (
            let p = el.parentElement;
            p && p !== document.body && parents.length < 8;
            p = p.parentElement
          )
            parents.push(measure(p));
          return parents;
        })(),
      })),
    };
  }, step);
  popup642Runs.get(page)!.steps.push(result);
}

async function popup642Settle(target: Locator) {
  let previous = "",
    stable = 0;
  await expect
    .poll(
      async () => {
        const values = await target.evaluate((el) => {
          const parents: Element[] = [el];
          for (
            let p = el.parentElement;
            p && p !== document.body && parents.length < 8;
            p = p.parentElement
          )
            parents.push(p);
          return parents.map((p) => {
            const r = p.getBoundingClientRect(),
              s = getComputedStyle(p);
            return {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              opacity: s.opacity,
              entering: p.hasAttribute("data-entering"),
              exiting: p.hasAttribute("data-exiting"),
              running: p.getAnimations().some((a) => a.playState === "running" || a.pending),
            };
          });
        });
        const current = JSON.stringify(values);
        stable = current === previous ? stable + 1 : 0;
        previous = current;
        return stable >= 2 && values.every((v) => !v.entering && !v.exiting && !v.running);
      },
      { timeout: 7000, intervals: [100, 100, 100, 200] },
    )
    .toBe(true);
}

async function popup642Sequence(page: Page, diagnostic: boolean) {
  const section = page.locator('[data-canvas-entry-world-text-section="true"]');
  const trigger = (field: string) =>
    section.locator(`[data-canvas-entry-field="${field}"]`).getByRole("button");
  const listbox = (label: string) => page.getByRole("listbox", { name: label, exact: true });
  const originalDirection = await trigger("text-direction").elementHandle();
  if (!originalDirection) throw new Error("missing original Direction");
  await expect(page.locator("[data-canvas-entry-surface]")).toHaveCSS("isolation", "isolate");
  await popup642Settle(section);
  await trigger("text-face").click();
  await expect(listbox("Face")).toBeVisible();
  await expect(listbox("Face").getByRole("option")).toHaveCount(6);
  const longFace = listbox("Face").getByRole("option", {
    name: "LibreBaskerville-Regular",
    exact: true,
  });
  await expect(longFace).toBeVisible();
  await popup642Settle(listbox("Face"));
  expect(Math.round((await listbox("Face").boundingBox())!.width)).toBe(280);
  await longFace.click();
  await expect(trigger("text-face")).toContainText("LibreBaskerville-Regular");
  await expect(listbox("Face")).toBeHidden();
  await expect(trigger("text-face")).toBeFocused();
  await popup642Settle(section);
  const controlFit = await section.evaluate((el) => {
    const pane = el.closest("[data-canvas-entry-properties-pane]")!,
      p = pane.getBoundingClientRect();
    return {
      paneFit: pane.scrollWidth <= pane.clientWidth,
      sectionFit: el.scrollWidth <= el.clientWidth,
      controls: [...el.querySelectorAll("input,button")].map((c) => {
        const r = c.getBoundingClientRect();
        return {
          field: c.closest("[data-canvas-entry-field]")?.getAttribute("data-canvas-entry-field"),
          inside: r.x >= p.x && r.right <= p.right,
        };
      }),
    };
  });
  popup642Runs.get(page)!.steps.push({ type: "closed-fit", ...controlFit });
  expect(controlFit.paneFit).toBe(true);
  expect(controlFit.sectionFit).toBe(true);
  for (const c of controlFit.controls) expect(c.inside, c.field ?? "").toBe(true);
  for (const [field, label, names, pointer] of [
    [
      "text-face",
      "Face",
      [
        "Default (starter)",
        "LibreBaskerville-Regular",
        "Abel-Regular",
        "Acme-Regular",
        "Smokum-Regular",
        "GeistMono[wght]",
      ],
      "LibreBaskerville-Regular",
    ],
    ["text-alignment", "Align", ["Left", "Center", "Right"], "Center"],
    ["text-direction", "Direction", ["ltr", "rtl"], "ltr"],
  ] as const) {
    await trigger(field).click();
    await expect(listbox(label)).toBeVisible();
    for (const name of names)
      await expect(listbox(label).getByRole("option", { name, exact: true })).toBeVisible();
    await popup642Settle(listbox(label));
    await popup642Measure(page, `${label} pointer-open settled`);
    const fit = await listbox(label).evaluate((el) => {
      const popup = el.closest("[data-placement]") ?? el,
        p = popup.getBoundingClientRect();
      const rects = [...el.querySelectorAll('[role="option"]')].map((o) =>
        o.getBoundingClientRect(),
      );
      return {
        viewport: p.x >= 0 && p.y >= 0 && p.right <= innerWidth && p.bottom <= innerHeight,
        noOverlap: rects.every((r, i) => i === 0 || r.y >= rects[i - 1].bottom - 1),
        options: [...el.querySelectorAll('[role="option"]')].map((o) => {
          const r = o.getBoundingClientRect(),
            range = document.createRange();
          range.selectNodeContents(o);
          return {
            text: o.textContent,
            overflow: o.scrollWidth <= o.clientWidth,
            inside: r.x >= p.x - 1 && r.right <= p.right + 1,
            fullText: [...range.getClientRects()]
              .filter((r) => r.width > 0)
              .every(
                (r) =>
                  r.x >= p.x - 1 &&
                  r.right <= p.right + 1 &&
                  r.y >= p.y - 1 &&
                  r.bottom <= p.bottom + 1,
              ),
          };
        }),
      };
    });
    popup642Runs.get(page)!.steps.push({ type: "option-fit", label, ...fit });
    expect(fit.viewport).toBe(true);
    expect(fit.noOverlap).toBe(true);
    for (const o of fit.options) {
      expect(o.overflow, o.text ?? "").toBe(true);
      expect(o.inside, o.text ?? "").toBe(true);
      expect(o.fullText, o.text ?? "").toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(listbox(label)).toBeHidden();
    await expect(trigger(field)).toBeFocused();
    await trigger(field).click();
    await expect(listbox(label)).toBeVisible();
    await listbox(label).getByRole("option", { name: pointer, exact: true }).click();
    await expect(trigger(field)).toContainText(pointer);
    await expect(listbox(label)).toBeHidden();
    await expect(trigger(field)).toBeFocused();
  }
  const note = async (step: string) => {
    if (diagnostic)
      popup642Runs.get(page)!.steps.push(
        await page.evaluate(
          (step) => ({
            step,
            time: performance.now(),
            active: document.activeElement?.id,
            field: document.activeElement
              ?.closest("[data-canvas-entry-field]")
              ?.getAttribute("data-canvas-entry-field"),
          }),
          step,
        ),
      );
  };
  const content = section.locator('[data-canvas-entry-field="text-content"]');
  await content.click();
  await expect(content).toBeFocused();
  await note("Content pointer");
  await page.keyboard.press("Tab");
  await expect(trigger("text-face")).toBeFocused();
  await note("Tab Face");
  await page.keyboard.press("Enter");
  await expect(listbox("Face")).toBeVisible();
  await page.keyboard.press("Home");
  await page.keyboard.press("Enter");
  await expect(trigger("text-face")).toContainText("Default (starter)");
  await expect(listbox("Face")).toBeHidden();
  await expect(trigger("text-face")).toBeFocused();
  await note("Face starter");
  await page.keyboard.press("Tab");
  await expect(section.locator('[data-canvas-entry-field="text-font-size"]')).toBeFocused();
  await note("Tab Size");
  await page.keyboard.press("Tab");
  await expect(trigger("text-alignment")).toBeFocused();
  await note("Tab Align");
  await page.keyboard.press("Enter");
  await expect(listbox("Align")).toBeVisible();
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(trigger("text-alignment")).toContainText("Right");
  await expect(listbox("Align")).toBeHidden();
  await expect(trigger("text-alignment")).toBeFocused();
  await note("Align Right");
  await page.keyboard.press("Tab");
  await expect(trigger("text-direction")).toBeFocused();
  await note("Tab Direction");
  await page.keyboard.press("Enter");
  await expect(listbox("Direction")).toBeVisible();
  const directionPopup = await listbox("Direction").elementHandle();
  // Minimal in BOTH lanes: one trusted-Enter boundary listener and bounded
  // focusin recorder, installed before End. This never intervenes in dispatch.
  await directionPopup!.evaluate((popup) => {
    const original = (window as Popup642Window).__popup642.refs["text-direction"];
    const events: ReturnType<NonNullable<Popup642Window["__popup642Final"]>["snapshot"]>["events"] =
      [];
    let commit: ReturnType<NonNullable<Popup642Window["__popup642Final"]>["snapshot"]>["commit"] =
      null;
    let commitCount = 0,
      dropped = 0;
    const startedAt = performance.now();
    const boundary = (e: KeyboardEvent) => {
      if (!e.isTrusted || e.key !== "Enter") return;
      commitCount++;
      if (commit) return;
      const target = e.target instanceof Element ? e.target : null;
      // Capture synchronously, before the product's Enter handler can restore.
      commit = {
        time: performance.now(),
        trusted: e.isTrusted,
        key: e.key,
        id: target?.id ?? "",
        text: target?.textContent?.trim() ?? "",
        role: target?.getAttribute("role") ?? null,
        focused: e.target === document.activeElement,
        inOriginalPopup: !!target && popup.contains(target),
      };
    };
    const capture = (e: FocusEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (events.length === 2048) {
        events.shift();
        dropped++;
      }
      events.push({
        time: performance.now(),
        phase: e.eventPhase,
        id: target?.id,
        field: target
          ?.closest("[data-canvas-entry-field]")
          ?.getAttribute("data-canvas-entry-field"),
        afterCommit: commit !== null,
        originalDirection: e.target === original,
      });
    };
    document.addEventListener("keydown", boundary, true);
    document.addEventListener("focusin", capture, true);
    (window as Popup642Window).__popup642Final = {
      stop() {
        document.removeEventListener("keydown", boundary, true);
        document.removeEventListener("focusin", capture, true);
      },
      snapshot: () => ({ startedAt, commit, commitCount, events: [...events], dropped }),
    };
  });
  // No readiness assertion/evaluation between End and Enter. Captures are passive.
  await page.keyboard.press("End");
  await page.keyboard.press("Enter");
  await expect(trigger("text-direction")).toContainText("rtl");
  await expect(listbox("Direction")).toBeHidden();
  await expect.poll(() => directionPopup!.evaluate((el) => !el.isConnected)).toBe(true);
  expect(
    await page.evaluate(() => (window as Popup642Window).__popup642.accepted["text-direction"]),
  ).toBe("rtl");
  await expect
    .poll(() =>
      originalDirection.evaluate(
        (el) =>
          el.isConnected &&
          document.activeElement === el &&
          (window as Popup642Window).__popup642.refs["text-direction"] === el,
      ),
    )
    .toBe(true);
  const observation = await page.evaluate(async () => {
    const original = (window as Popup642Window).__popup642.refs["text-direction"];
    const final = (window as Popup642Window).__popup642Final!;
    // Exit checks never reset the event history or excuse transient Align focus.
    const start = performance.now();
    await new Promise<void>((done) => setTimeout(done, 5000));
    const end = performance.now();
    final.stop();
    return {
      ...final.snapshot(),
      start,
      end,
      connected: original.isConnected,
      focused: document.activeElement === original,
      popupRemoved: document.querySelectorAll('[role="listbox"]').length === 0,
    };
  });
  popup642Runs
    .get(page)!
    .steps.push({ type: "commit-through-exit-and-fixed-five-second-final", ...observation });
  expect(observation.end - observation.start).toBeGreaterThanOrEqual(5000);
  expect(observation.commitCount).toBe(1);
  expect(observation.commit).toMatchObject({
    trusted: true,
    key: "Enter",
    text: "rtl",
    role: "option",
    focused: true,
    inOriginalPopup: true,
  });
  expect(observation.commit?.id).toBeTruthy();
  expect(observation.dropped).toBe(0);
  expect(observation.events.filter((e) => e.afterCommit && e.field === "text-alignment")).toEqual(
    [],
  );
  expect(observation.connected && observation.focused && observation.popupRemoved).toBe(true);
  if (diagnostic) {
    const passive = await page.evaluate(() => (window as Popup642Window).__popup642Passive);
    const keys = passive.events.filter((e) => e.type === "keydown" && e.trusted === true);
    const optionKeys = keys.filter((e) => (e.target as { role?: string })?.role === "option");
    const tail = optionKeys.slice(-4);
    expect(tail.map((e) => ({ key: e.key, text: (e.target as { text: string }).text }))).toEqual([
      { key: "End", text: "Center" },
      { key: "Enter", text: "Right" },
      { key: "End", text: "ltr" },
      { key: "Enter", text: "rtl" },
    ]);
    for (const e of tail) {
      const t = e.target as { id: string; node: number; key: string | null };
      const active = e.active as { node: number };
      expect(t.id).not.toBe("");
      expect(t.key).toBe(
        ({ Center: "center", Right: "right", ltr: "ltr", rtl: "rtl" } as Record<string, string>)[
          (e.target as { text: string }).text
        ],
      );
      expect(t.node).toBe(active.node);
    }
    expect(passive.dropped).toBe(0);
  }
  await popup642Measure(page, "final original Direction focus");
  await expect(trigger("text-direction")).toBeFocused();
}

for (const implementation of ["source", "react"] as const)
  for (const theme of ["light", "dark"] as const)
    for (const width of [220, 280] as const)
      for (const lane of ["diagnostic", "uninstrumented"] as const) {
        test.describe(`#642 ${implementation} ${theme} ${width} ${lane}`, () => {
          test.use({
            popupCase: `${implementation}:${theme}:${width}:${lane}`,
            trustedChooser: true,
          });
          for (const attempt of [1, 2])
            test(`sequential siblings attempt ${attempt}`, async ({ page }) => {
              await popup642Sequence(page, lane === "diagnostic");
            });
        });
      }

test.afterEach(async ({ page, popupCase, nativeErrors }, info) => {
  if (!popupCase) return;
  const run = popup642Runs.get(page);
  if (!run) return;
  const execution = popup642Executions.get(page)!;
  await Promise.all(run.pending);
  let beforeTeardown: unknown, afterTeardown: unknown;
  let preTeardownRejections: string[] = [],
    postTeardownRejections: string[] = [];
  try {
    const before = await page.evaluate(() => {
      const final = (window as Popup642Window).__popup642Final;
      final?.stop(); // Also remove listeners on an earlier assertion failure.
      const rejections = (window as FocusWindow).__nativeRejections;
      if (!Array.isArray(rejections)) throw new Error("missing pre-teardown rejection observer");
      return {
        fixture: (window as Popup642Window).__popup642?.snapshot(),
        finalFocus: final?.snapshot(),
        passive: (window as Popup642Window).__popup642Passive
          ? {
              events: [...(window as Popup642Window).__popup642Passive.events],
              dropped: (window as Popup642Window).__popup642Passive.dropped,
            }
          : null,
        rejections: [...rejections],
      };
    });
    beforeTeardown = before;
    preTeardownRejections = before.rejections;
  } catch (error) {
    run.errors.push(`pre-teardown evidence unavailable: ${String(error)}`);
  }
  try {
    // Cleanup is after the final focus oracle; never a causal control.
    await page.evaluate(() => (window as Popup642Window).__popup642?.dispose());
  } catch (error) {
    run.errors.push(`fixture disposal failed: ${String(error)}`);
  }
  try {
    const after = await page.evaluate(async () => {
      // Bounded task/microtask drain includes disposal-triggered rejections.
      await Promise.resolve();
      await new Promise<void>((done) => setTimeout(done, 0));
      await Promise.resolve();
      const rejections = (window as FocusWindow).__nativeRejections;
      if (!Array.isArray(rejections)) throw new Error("missing post-teardown rejection observer");
      return {
        fixture: (window as Popup642Window).__popup642?.snapshot(),
        rejections: [...rejections],
      };
    });
    afterTeardown = after;
    postTeardownRejections = after.rejections;
  } catch (error) {
    run.errors.push(`post-teardown evidence unavailable: ${String(error)}`);
  }
  await Promise.all(run.pending);
  const browser = { beforeTeardown, afterTeardown, preTeardownRejections, postTeardownRejections };
  // Soft assertions preserve receipts/raw failures and still fail the test.
  expect
    .soft(nativeErrors, "#642 all recorded native page/console errors, including teardown")
    .toEqual([]);
  expect.soft(preTeardownRejections, "#642 pre-teardown unhandled rejections").toEqual([]);
  expect
    .soft(
      postTeardownRejections,
      "#642 post-teardown unhandled rejections after task/microtask drain",
    )
    .toEqual([]);
  expect.soft(run.errors, "#642 offline/module/teardown observation errors").toEqual([]);
  const receipt = {
    ...run,
    pending: undefined,
    generation: execution.generation,
    ...(execution.replay ? { replay: execution.replay } : {}),
    selected: popupCase,
    status: info.status,
    expectedStatus: info.expectedStatus,
    errors: [...run.errors, ...nativeErrors],
    assertionErrors: info.errors,
    browser,
    atEnd: new Date().toISOString(),
    limits:
      "Diagnostic capture/MO and out-of-pair reads affect timing; uninstrumented comparison adds only a trusted final-Enter boundary and bounded focusin observer from before End through exit and the full five-second window, plus fixture refs/acceptance and outside-pair fit/font reads. Post-dispose errors use a bounded task/microtask drain; later asynchronous errors remain outside that observation window. Private lifetimes UNKNOWN; absent document restore event does not prove no private restore.",
  };
  const receiptPath = info.outputPath("ui642-attempt.json");
  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  await info.attach("ui642-attempt", { path: receiptPath, contentType: "application/json" });
  const ledgerPath = `${execution.prefix}-attempts.json`,
    ledger = execution.replay
      ? popup642ReadReplayLedger(execution, true)
      : JSON.parse(readFileSync(ledgerPath, "utf8"));
  const cell = popupCase.split(":").slice(0, 3).join(":");
  const entry = execution.replay
    ? popup642ReplayFinalization(ledger, execution, cell, run)
    : ledger.cells[cell].find((entry: { count: number }) => entry.count === run.count);
  Object.assign(entry, {
    status: info.status,
    receiptPath,
    sha256: popup642Hash(readFileSync(receiptPath)),
  });
  if (execution.replay) popup642WriteReplayLedger(ledger, execution);
  else writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
});

// #630 authored source-native cases. Runtime/controls require separate root grant.
type Native630Snapshot = {
  counts: Record<
    "table" | "card",
    { callbacks: number; mounts: number; owners: number; effects: number; effectCleanups: number }
  > & {
    root: { mounts: number; owners: number };
    view: { callbacks: number };
  };
  events: {
    type: string;
    trusted: boolean;
    target: string;
    currentTarget: string;
    connected: boolean;
    original: boolean;
    currentTargetOriginal: boolean;
  }[];
  dropped: number;
  disposed: boolean;
  state: { isFocused: boolean; isHovered: boolean; isPressed: boolean };
};
type Native630Window = FocusWindow & {
  __native630: {
    refs: Record<string, HTMLElement>;
    dispose(): void;
    capturePopup(): void;
    snapshot(): Native630Snapshot;
  };
};
type Native630Run = {
  errors: string[];
  modules: { url: string; sha256: string; bytes: number }[];
  pending: Promise<void>[];
  execution: Popup642Execution;
};
const native630Runs = new WeakMap<Page, Native630Run>();
async function prepareNative630(page: Page, selected: string, info: TestInfo) {
  if (!/^(spectrum|viviana):(default|custom)$/.test(selected)) throw new Error("invalid #630 mode");
  const execution = popup642Execution(info.outputDir),
    replay = execution.replay;
  if (!replay || !execution.inputs) throw new Error("#630 requires authenticated root snapshots");
  const custodyPath = `${execution.prefix}-browser-custody.json`;
  if (realpathSync(custodyPath) !== custodyPath) throw new Error("redirected #630 custody");
  const custody = JSON.parse(readFileSync(custodyPath, "utf8"));
  popup642ReplayCustody(custody, execution);
  // Readonly preflight shares the exact root starting-state and retained-state guard.
  // It neither reserves a #642 cell nor writes an absent ledger.
  popup642ReadReplayLedger(execution);
  // #630 cases never reserve #642 replay cells. Root separately bounds the exact
  // focused/native invocation; this preparation does not issue its allowance.
  const inputs = execution.inputs;
  const policy = JSON.parse(inputs.policy.toString("utf8"));
  if (
    policy.success !== true ||
    policy.sha256 !== popup642Hash(inputs.adobe) ||
    inputs.adobe.length !== 482528 ||
    popup642Hash(inputs.adobe) !==
      "82d5975ac48b94197a94d944a6a1ee6b234e813e2ee469e2c63e3012319cd416" ||
    inputs.geist.length !== 138896 ||
    popup642Hash(inputs.geist) !==
      "2386ddac2c72b6e0c126561e91486b7284412f303d8d9513da9ffec789e63338"
  )
    throw new Error("#630 original offline font identity mismatch");
  const run: Native630Run = { errors: [], modules: [], pending: [], execution };
  native630Runs.set(page, run);
  await page.route("**/*", async (route) => {
    const request = route.request(),
      url = request.url(),
      parsed = new URL(url);
    if (url === policy.url && request.method() === "GET" && request.resourceType() === "font")
      await route.fulfill({
        status: 200,
        body: inputs.adobe,
        contentType: "font/woff2",
        headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
      });
    else if (
      parsed.origin === "http://127.0.0.1:4479" &&
      parsed.pathname === "/__ui642/GeistMono-variable.ttf" &&
      !parsed.search &&
      request.method() === "GET" &&
      request.resourceType() === "font"
    )
      await route.fulfill({
        status: 200,
        body: inputs.geist,
        contentType: "font/ttf",
        headers: { "Cache-Control": "no-store" },
      });
    else if (parsed.origin === "http://127.0.0.1:4479" && request.resourceType() !== "font")
      await route.continue();
    else {
      run.errors.push(
        `unadmitted external/font request: ${request.method()} ${request.resourceType()} ${url}`,
      );
      await route.abort("blockedbyclient");
    }
  });
  page.on("response", (response) => {
    if (!["script", "stylesheet"].includes(response.request().resourceType())) return;
    run.pending.push(
      response.body().then(
        (body) => {
          run.modules.push({ url: response.url(), sha256: popup642Hash(body), bytes: body.length });
        },
        (error) => {
          run.errors.push(`module identity: ${response.url()}: ${String(error)}`);
        },
      ),
    );
  });
  const css = inputs.css
    .toString("utf8")
    .replace("@import '@proyecto-viviana/ui/components.css';", "")
    .replace(
      "../../engine/crates/foundation/fixtures/fonts/geist-mono/GeistMono[wght].ttf?no-inline",
      "/__ui642/GeistMono-variable.ttf",
    );
  await page.addInitScript((css) => {
    const install = () => {
      if (!document.head) return false;
      const node = document.createElement("style");
      node.dataset.native630ConsumerCss = "true";
      node.textContent = css;
      document.head.append(node);
      return true;
    };
    if (!install()) {
      const observer = new MutationObserver(() => {
        if (install()) observer.disconnect();
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  }, css);
  const [twin, host] = selected.split(":");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/?ui630=${twin}&host=${host}`);
  await expect(page.locator("#root")).toHaveAttribute("data-native630-ready", "true");
  await expect(
    page.locator("#hint, #react-root, #focus-mount, [data-canvas-entry-surface]"),
  ).toHaveCount(0);
  await page.evaluate(async () => {
    await document.fonts.load('16px "Geist Mono"');
    await document.fonts.ready;
  });
  expect(await page.evaluate(() => document.fonts.check('16px "Geist Mono"'))).toBe(true);
  await Promise.all(run.pending);
  const family = twin === "spectrum" ? "solid-spectrum" : "viviana-ui";
  for (const source of [
    "card/index",
    "cardview/index",
    "table/index",
    "textfield/index",
    "menu/ActionMenu",
    "menu/index",
  ])
    expect(
      run.modules.some((m) => m.url.includes(`${family}/src/${source}.tsx`)),
      `served ${family}/${source}`,
    ).toBe(true);
  for (const source of ["Table.tsx", "GridList.tsx", "Menu.tsx", "TextField.tsx"])
    expect(
      run.modules.some((m) => m.url.includes(`solidaria-components/src/${source}`)),
      `served ${source}`,
    ).toBe(true);
  expect(run.modules.filter((m) => /\/solid-js\.js(?:\?|$)/.test(m.url))).toHaveLength(1);
  expect(
    run.modules.filter((m) =>
      /packages\/(solid-spectrum|viviana-ui|solidaria-components|solidaria|solid-stately)\/dist\//.test(
        m.url,
      ),
    ),
  ).toEqual([]);
  const styled = await page.evaluate(() => {
    const refs = (window as Native630Window).__native630.refs;
    const matched: Record<string, number> = { cell: 0, card: 0, trigger: 0, tableInput: 0 };
    const inspect = (rules: CSSRuleList) => {
      for (const rule of rules) {
        if (rule instanceof CSSStyleRule) {
          for (const key of Object.keys(matched)) {
            // Match only actual class rules, not generic consumer/tag rules.
            if (rule.selectorText.includes(".")) {
              try {
                if (refs[key].matches(rule.selectorText)) matched[key]++;
              } catch {
                /* pseudo selector */
              }
            }
          }
        }
        if ("cssRules" in rule) inspect((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of document.styleSheets) inspect(sheet.cssRules);
    return {
      matched,
      styles: [...document.querySelectorAll("style[data-vite-dev-id]")].map((node) => ({
        id: node.getAttribute("data-vite-dev-id"),
        css: node.textContent,
      })),
    };
  });
  for (const [name, count] of Object.entries(styled.matched))
    expect(count, `generated matching ${name} CSS`).toBeGreaterThan(0);
  await info.attach("native630-source-css", {
    body: JSON.stringify({ modules: run.modules, styled }),
    contentType: "application/json",
  });
}
async function native630Snapshot(page: Page) {
  return page.evaluate(() => {
    const api = (window as Native630Window).__native630;
    if (!api || !api.refs || !api.snapshot) throw new Error("missing #630 counters/refs");
    return api.snapshot();
  });
}
async function native630Retained(page: Page, kind: "table" | "card", popup = false) {
  const identity = await page.evaluate(
    ({ kind, popup }) => {
      const api = (window as Native630Window).__native630,
        r = api.refs;
      const names =
        kind === "table"
          ? ["cell", "tableInput", "tableButton", "live"]
          : ["card", "cardInput", "cardButton", "trigger"];
      if (popup) names.push("menu", "item");
      for (const name of names) if (!r[name]) throw new Error(`missing original ${name}`);
      const input = r[`${kind}Input`] as HTMLInputElement;
      return {
        connected: names.every((name) => r[name].isConnected),
        input: document.getElementById(`native630-${kind}-input`) === input,
        button: document.getElementById(`native630-${kind}-local`) === r[`${kind}Button`],
        parent:
          kind === "table"
            ? input.closest("td") === r.cell
            : input.closest('[role="row"]') === r.card,
        live: kind !== "table" || document.getElementById("native630-live") === r.live,
        popup:
          !popup ||
          (document.querySelector('[role="menu"]') === r.menu &&
            r.menu.querySelector('[role="menuitem"]') === r.item),
        value: input.value,
        local: r[`${kind}Button`].textContent,
      };
    },
    { kind, popup },
  );
  expect(identity, "original-node/local-state/lifetime oracle").toEqual({
    connected: true,
    input: true,
    button: true,
    parent: true,
    live: true,
    popup: true,
    value: "typed value",
    local: "Local 1",
  });
  const snapshot = await native630Snapshot(page),
    c = snapshot.counts[kind];
  expect(c).toEqual({ callbacks: 1, mounts: 1, owners: 0, effects: 2, effectCleanups: 1 });
  expect(snapshot.counts.view.callbacks).toBe(1);
  expect(snapshot.dropped).toBe(0);
}
async function native630Local(page: Page, kind: "table" | "card") {
  await page.locator(`#native630-${kind}-local`).click();
  await page.locator(`#native630-${kind}-input`).click();
  await page.keyboard.type("typed value");
  await expect(page.locator(`#native630-${kind}-local`)).toHaveText("Local 1");
  await native630Retained(page, kind);
}
async function native630Live(
  page: Page,
  expected: Partial<Native630Snapshot["state"]>,
  host: string,
) {
  await expect.poll(async () => (await native630Snapshot(page)).state).toMatchObject(expected);
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const api = (window as Native630Window).__native630,
            s = api.snapshot().state;
          if (!api.refs.live) throw new Error("missing original live text");
          return (
            api.refs.live.textContent ===
            `focused=${s.isFocused};hovered=${s.isHovered};pressed=${s.isPressed}`
          );
        }),
      { message: "identical live-text oracle" },
    )
    .toBe(true);
  if (host === "default") {
    const attrs = await page.evaluate(() => {
      const api = (window as Native630Window).__native630;
      return {
        focused: api.refs.cell.hasAttribute("data-focused"),
        hovered: api.refs.cell.hasAttribute("data-hovered"),
        pressed: api.refs.cell.hasAttribute("data-pressed"),
      };
    });
    const state = (await native630Snapshot(page)).state;
    expect(attrs).toEqual({
      focused: state.isFocused,
      hovered: state.isHovered,
      pressed: state.isPressed,
    });
  }
}
for (const twin of ["spectrum", "viviana"] as const) {
  for (const host of ["default", "custom"] as const) {
    test.describe(`#630 ${twin} table ${host}`, () => {
      test.use({ native630Case: `${twin}:${host}`, trustedChooser: true });
      test("hover retains original input and backward caret", async ({ page }) => {
        await native630Local(page, "table");
        await page.evaluate(() => {
          const input = (window as Native630Window).__native630.refs.tableInput as HTMLInputElement;
          input.setSelectionRange(2, 7, "backward");
        });
        await page.locator("#native630-live").hover();
        await native630Live(page, { isHovered: true }, host);
        await page.locator("#native630-adjacent").hover();
        await expect(page.locator("#native630-adjacent")).toHaveText("adjacent-hovered=true");
        await native630Live(page, { isHovered: false }, host);
        await native630Retained(page, "table");
        const caret = await page.evaluate(() => {
          const input = (window as Native630Window).__native630.refs.tableInput as HTMLInputElement;
          return {
            active: document.activeElement === input,
            start: input.selectionStart,
            end: input.selectionEnd,
            direction: input.selectionDirection,
          };
        });
        expect(caret).toEqual({ active: true, start: 2, end: 7, direction: "backward" });
      });
      test("focus press retains original nodes and independent state", async ({ page }) => {
        await native630Local(page, "table");
        const cell = page.locator("#native630-table-input").locator("xpath=ancestor::td");
        await cell.click({ position: { x: 4, y: 4 } });
        await native630Live(page, { isFocused: true }, host);
        await native630Retained(page, "table");
        await cell.hover({ position: { x: 4, y: 4 } });
        await page.mouse.down();
        await native630Live(page, { isPressed: true }, host);
        await native630Retained(page, "table");
        await page.mouse.up();
        await native630Live(page, { isPressed: false }, host);
        await native630Retained(page, "table");
      });
    });
  }
  test.describe(`#630 ${twin} card`, () => {
    test.use({ native630Case: `${twin}:default`, trustedChooser: true });
    test("pointer open retains same-open menu through hover and press", async ({ page }) => {
      await native630Local(page, "card");
      const card = page.locator("#native630-card-input").locator('xpath=ancestor::*[@role="row"]');
      await card.hover({ position: { x: 4, y: 4 } });
      await expect(card).toHaveAttribute("data-hovered");
      await native630Retained(page, "card");
      const rowPoint = await page.evaluate(() => {
        const api = (window as Native630Window).__native630;
        const row = api.refs.card,
          surface = api.refs.cardSurface;
        if (
          !row ||
          !surface ||
          !row.isConnected ||
          !surface.isConnected ||
          surface.closest('[role="row"]') !== row
        )
          throw new Error("missing original noninteractive Card row surface");
        const rect = surface.getBoundingClientRect(),
          x = rect.left + rect.width / 2,
          y = rect.top + rect.height / 2;
        if (
          document.elementFromPoint(x, y) !== surface ||
          surface.closest('button,input,a,[role="button"]')
        )
          throw new Error("Card row point does not hit original plain surface");
        return { x, y, before: api.snapshot().events.length };
      });
      await page.mouse.click(rowPoint.x, rowPoint.y);
      await expect(card).toHaveAttribute("data-focused");
      await native630Retained(page, "card");
      await page.mouse.move(rowPoint.x, rowPoint.y);
      await page.mouse.down();
      await expect(card).toHaveAttribute("data-pressed");
      await expect(card).toHaveAttribute("data-focused");
      await native630Retained(page, "card");
      await page.mouse.up();
      await expect(card).not.toHaveAttribute("data-pressed");
      await expect(card).toHaveAttribute("data-focused");
      await native630Retained(page, "card");
      const rowEvents = (await native630Snapshot(page)).events.slice(rowPoint.before);
      for (const type of ["click", "pointerdown", "pointerup"]) {
        const observed = rowEvents.filter(
          (event) => event.type === type && event.currentTarget === "native630-card-row",
        );
        expect(observed.length).toBeGreaterThan(0);
        for (const event of observed)
          expect(event).toMatchObject({
            trusted: true,
            target: "native630-card-surface",
            currentTarget: "native630-card-row",
            connected: true,
            original: true,
            currentTargetOriginal: true,
          });
      }
      const trigger = page.locator("#native630-trigger");
      await trigger.hover();
      await page.mouse.down();
      if (await page.getByRole("menu").isVisible())
        await page.evaluate(() => (window as Native630Window).__native630.capturePopup());
      await page.mouse.up();
      await expect(page.getByRole("menu")).toBeVisible();
      await page.evaluate(() => (window as Native630Window).__native630.capturePopup());
      await native630Retained(page, "card", true);
      await page.getByRole("menuitem", { name: "Retain", exact: true }).hover();
      await page.keyboard.press("ArrowDown");
      await native630Retained(page, "card", true);
      await page.getByRole("menuitem", { name: "Retain", exact: true }).hover();
      await page.mouse.down();
      await native630Retained(page, "card", true);
      await page.mouse.up();
      await expect(page.getByRole("menu")).toBeHidden();
      await native630Retained(page, "card");
    });
    test("keyboard opens and Escape intentionally dismisses", async ({ page }) => {
      await native630Local(page, "card");
      // Input, local button, trigger: trusted Tabs intentionally move focus.
      await page.keyboard.press("Tab");
      await expect(page.locator("#native630-card-local")).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(page.locator("#native630-trigger")).toBeFocused();
      await native630Retained(page, "card");
      await page.keyboard.press("Enter");
      await expect(page.getByRole("menu")).toBeVisible();
      await page.evaluate(() => (window as Native630Window).__native630.capturePopup());
      await page.keyboard.press("ArrowDown");
      await native630Retained(page, "card", true);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("menu")).toBeHidden();
      await expect(page.locator("#native630-trigger")).toBeFocused();
    });
  });
}
test.afterEach(async ({ page, native630Case, nativeErrors }, info) => {
  if (!native630Case) return;
  const run = native630Runs.get(page);
  if (!run) throw new Error("missing #630 setup evidence");
  let before: Native630Snapshot | undefined, after: Native630Snapshot | undefined;
  try {
    before = await native630Snapshot(page);
    await page.evaluate(() => (window as Native630Window).__native630.dispose());
    const disposal = await page.evaluate(async () => {
      const api = (window as Native630Window).__native630;
      const snapshot = api.snapshot();
      const original = {
        callbacks: [snapshot.counts.table.callbacks, snapshot.counts.card.callbacks],
        events: snapshot.events.length,
      };
      // Tested callback listeners are removed; disconnected originals must not
      // produce later fixture callbacks during the bounded task/microtask drain.
      api.refs.tableInput.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
      await new Promise<void>((done) => setTimeout(done, 0));
      await Promise.resolve();
      const final = api.snapshot();
      return {
        snapshot: final,
        disconnected: Object.values(api.refs).every((el) => !el.isConnected),
        empty: document.getElementById("root")!.children.length === 0,
        callbacks: [final.counts.table.callbacks, final.counts.card.callbacks],
        events: final.events.length,
        original,
        rejections: [...(window as Native630Window).__nativeRejections],
      };
    });
    after = disposal.snapshot;
    expect.soft(disposal.disconnected && disposal.empty).toBe(true);
    expect.soft(disposal.callbacks).toEqual(disposal.original.callbacks);
    expect.soft(disposal.events).toBe(disposal.original.events);
    for (const kind of ["table", "card"] as const) {
      expect.soft(after.counts[kind].owners).toBe(1);
      expect.soft(after.counts[kind].effectCleanups).toBe(after.counts[kind].effects);
    }
    expect.soft(after.counts.root).toEqual({ mounts: 1, owners: 1 });
    expect.soft(disposal.rejections).toEqual([]);
    expect.soft(before.dropped).toBe(0);
    const testedKind = info.titlePath.join(" ").includes(" table ") ? "table" : "card";
    const inputEvents = before.events.filter(
      (e) => e.type === "input" && e.currentTarget === `native630-${testedKind}-input`,
    );
    expect.soft(inputEvents.length, "required trusted original input boundary").toBeGreaterThan(0);
    for (const event of inputEvents)
      expect.soft(event).toMatchObject({
        trusted: true,
        original: true,
        connected: true,
        target: `native630-${testedKind}-input`,
        currentTarget: `native630-${testedKind}-input`,
      });
    const clicks = before.events.filter(
      (e) => e.type === "click" && e.currentTarget === `native630-${testedKind}-local`,
    );
    expect.soft(clicks.length, "required trusted original local-button boundary").toBe(1);
    expect.soft(clicks[0]).toMatchObject({
      trusted: true,
      original: true,
      connected: true,
      target: `native630-${testedKind}-local`,
      currentTarget: `native630-${testedKind}-local`,
    });
  } catch (error) {
    run.errors.push(`#630 lifetime/disposal: ${String(error)}`);
  }
  await Promise.all(run.pending);
  expect.soft(nativeErrors).toEqual([]);
  expect.soft(run.errors).toEqual([]);
  const receiptPath = info.outputPath("ui630-source-attempt.json");
  writeFileSync(
    receiptPath,
    JSON.stringify(
      {
        selected: native630Case,
        status: info.status,
        assertionErrors: info.errors,
        before,
        after,
        errors: [...run.errors, ...nativeErrors],
        modules: run.modules,
        binding: run.execution.replay,
        runtimeQualification: "only this admitted attempt",
        limits:
          "Root authenticates issuance and enforces single-use invocation. Bounded task/microtask drain cannot rule out later errors.",
      },
      null,
      2,
    ),
  );
  await info.attach("ui630-source-attempt", { path: receiptPath, contentType: "application/json" });
});
