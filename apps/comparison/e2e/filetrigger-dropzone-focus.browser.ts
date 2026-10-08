/**
 * Browser proof for #109: FileTrigger click isolation and DropZone native focus.
 * Kept off the comparison *.spec.ts match so it does not boot the preview server.
 */
import { expect, test as base } from "@playwright/test";
import type { Page } from "@playwright/test";

// Each test owns observers installed before navigation, including the original cases.
const test = base.extend<{ nativeErrors: string[] }>({
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

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const rejections: string[] = [];
    (window as FocusWindow).__nativeRejections = rejections;
    window.addEventListener("unhandledrejection", (event) => {
      rejections.push(String(event.reason));
    });
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
  });
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
    const input = document.querySelector('input[type="file"]');
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
  await expect(page.locator('input[type="file"]')).toHaveCount(1);
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
