/**
 * Browser proof for #109: FileTrigger click isolation and DropZone native focus.
 * Kept off the comparison *.spec.ts match so it does not boot the preview server.
 */
import { expect, test as base } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Page, Locator, TestInfo } from "@playwright/test";

// Each test owns observers installed before navigation, including the original cases.
const test = base.extend<{
  nativeErrors: string[];
  trustedChooser: boolean;
  popupCase: string | null;
}>({
  trustedChooser: [false, { option: true }],
  popupCase: [null, { option: true }],
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

test.beforeEach(async ({ page, trustedChooser, popupCase }, testInfo) => {
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
const popup642Prefix = "/tmp/ui-642-popup-20261009";
const popup642Consumer = "/home/emoporemilio/projects/viviana-hub/visualmode/visualmode";
const popup642Policy = "/tmp/ui-642-offline-font-2026-10-09/receipt.json";
const popup642Generation = "28b88444-8143-4feb-a309-5500c28c5879";
const popup642Hash = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
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
  if (!resolve(info.outputDir).startsWith(`${popup642Prefix}-`))
    throw new Error("#642 requires owned --output prefix");
  const [implementation, theme, width, lane] = selected.split(":");
  if (!/^(source|react):(light|dark):(220|280):(diagnostic|uninstrumented)$/.test(selected))
    throw new Error("invalid #642 test mode");
  const registration = JSON.parse(
    readFileSync(`${popup642Prefix}-registration-2026-10-08.json`, "utf8"),
  );
  if (registration.launch_generation !== popup642Generation)
    throw new Error("#642 registration generation changed");
  // Runtime admission is separate from preparation. Do not infer it from port release.
  const custodyPath = `${popup642Prefix}-browser-custody.json`;
  if (!existsSync(custodyPath)) throw new Error(`#642 browser custody absent: ${custodyPath}`);
  const custody = JSON.parse(readFileSync(custodyPath, "utf8"));
  if (
    custody.generation !== popup642Generation ||
    custody.port !== 4479 ||
    custody.exclusive !== true ||
    custody.visualmode10250Released !== true ||
    custody.cacheDir !== "/tmp/ui-636-native-vite-cache"
  )
    throw new Error("#642 incomplete generation-bound browser custody");
  const ledgerPath = `${popup642Prefix}-attempts.json`;
  const ledger = existsSync(ledgerPath)
    ? JSON.parse(readFileSync(ledgerPath, "utf8"))
    : { generation: popup642Generation, cells: {} };
  if (ledger.generation !== popup642Generation) throw new Error("#642 attempt generation mismatch");
  const cell = `${implementation}:${theme}:${width}`;
  const entries = (ledger.cells[cell] ??= []);
  if (entries.length >= 10) throw new Error(`#642 ten-attempt TOTAL exhausted: ${cell}`);
  const reservation = {
    case: info.title,
    lane,
    at: new Date().toISOString(),
    count: entries.length + 1,
    status: "reserved-before-navigation",
  };
  entries.push(reservation);
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
  const run: Popup642Run = {
    ...reservation,
    errors: [],
    network: [],
    modules: [],
    pending: [],
    steps: [],
  };
  popup642Runs.set(page, run);
  const geistPath = `${popup642Consumer}/engine/crates/foundation/fixtures/fonts/geist-mono/GeistMono[wght].ttf`;
  const geist = readFileSync(geistPath);
  if (
    geist.length !== 138896 ||
    popup642Hash(geist) !== "2386ddac2c72b6e0c126561e91486b7284412f303d8d9513da9ffec789e63338"
  )
    throw new Error("#642 original Geist bytes mismatch");
  const policy = JSON.parse(readFileSync(popup642Policy, "utf8"));
  const adobe = readFileSync(policy.path);
  if (
    policy.success !== true ||
    adobe.length !== 482528 ||
    popup642Hash(adobe) !== "82d5975ac48b94197a94d944a6a1ee6b234e813e2ee469e2c63e3012319cd416" ||
    policy.sha256 !== popup642Hash(adobe)
  )
    throw new Error("#642 reviewed Adobe input mismatch");
  const consumerCSS = readFileSync(`${popup642Consumer}/src/styles/design-system.css`, "utf8");
  // Exact authored consumer rules; only package import and local font URL adapt.
  const css = consumerCSS
    .replace("@import '@proyecto-viviana/ui/components.css';", "")
    .replace(
      "../../engine/crates/foundation/fixtures/fonts/geist-mono/GeistMono[wght].ttf?no-inline",
      "/__ui642/GeistMono-variable.ttf",
    );
  run.steps.push({
    type: "font-policy",
    policy: popup642Policy,
    policyHash: popup642Hash(readFileSync(popup642Policy)),
    geistPath,
    geistHash: popup642Hash(geist),
    adobePath: policy.path,
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
    generation: popup642Generation,
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
  const ledgerPath = `${popup642Prefix}-attempts.json`,
    ledger = JSON.parse(readFileSync(ledgerPath, "utf8"));
  const cell = popupCase.split(":").slice(0, 3).join(":");
  const entry = ledger.cells[cell].find((entry: { count: number }) => entry.count === run.count);
  Object.assign(entry, {
    status: info.status,
    receiptPath,
    sha256: popup642Hash(readFileSync(receiptPath)),
  });
  writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
});
