/**
 * Browser proof for #109: FileTrigger click isolation and DropZone native focus.
 * Kept off the comparison *.spec.ts match so it does not boot the preview server.
 */
import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

// Each test owns observers installed before navigation, including the original cases.
const test = base.extend<{ nativeErrors: string[]; trustedChooser: boolean }>({
  trustedChooser: [false, { option: true }],
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

test.beforeEach(async ({ page, trustedChooser }) => {
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
