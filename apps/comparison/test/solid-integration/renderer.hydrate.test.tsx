import { readFileSync } from "node:fs";
import { flush, onCleanup, sharedConfig } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import client from "../../integrations/solid/client.mjs";
import { AsyncFixture, InputFixture, IslandFixture } from "./fixtures";

const fixture = JSON.parse(readFileSync("output/astro-solid-integration.json", "utf8"));
const islands: HTMLElement[] = [];
let bootstrap: PropertyDescriptor | undefined;
const hydrationFields = [
  "completed",
  "events",
  "load",
  "has",
  "gather",
  "loadModuleAssets",
  "cleanupFragment",
  "registry",
  "boundaryScopes",
  "captureBoundaryScope",
  "verifyHydration",
];
let configSnapshot: [string, PropertyDescriptor | undefined][];
const bootstrapListeners: Parameters<Document["addEventListener"]>[] = [];
const streamNames = ["$R", "$df", "$dfr", "$dfl", "$dflj", "$dfd", "$dfs", "$dfg", "$dfc", "$dfj"];
let streamSnapshot: [string, PropertyDescriptor | undefined][];

function runScripts(container: ParentNode) {
  for (const script of container.querySelectorAll("script")) {
    if (script.src || script.type === "module") throw new Error("Unexpected non-inline SSR script");
    window.eval(script.textContent);
    script.remove();
  }
}

beforeEach(() => {
  bootstrap = Object.getOwnPropertyDescriptor(globalThis, "_$HY");
  streamSnapshot = streamNames.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name),
  ]);
  for (const name of streamNames) Reflect.deleteProperty(globalThis, name);
  configSnapshot = hydrationFields.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(sharedConfig, name),
  ]);
  for (const name of hydrationFields) {
    Object.defineProperty(sharedConfig, name, {
      value: undefined,
      writable: true,
      configurable: true,
    });
  }
  Reflect.deleteProperty(globalThis, "_$HY");
  const add = vi.spyOn(document, "addEventListener");
  const bootstrapElement = document.createElement("div");
  bootstrapElement.innerHTML = fixture.hydrationScript;
  runScripts(bootstrapElement);
  bootstrapListeners.push(...add.mock.calls);
  add.mockRestore();
  vi.spyOn(console, "warn");
  vi.spyOn(console, "error");
});

async function settle() {
  flush();
  await Promise.resolve();
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

afterEach(async () => {
  try {
    for (const element of islands.splice(0)) {
      element.dispatchEvent(new Event("astro:unmount"));
      element.remove();
    }
    await settle();
  } finally {
    for (const [type, listener, options] of bootstrapListeners.splice(0))
      document.removeEventListener(type, listener, options);
    for (const [name, descriptor] of streamSnapshot) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    }
    for (const [name, descriptor] of configSnapshot) {
      if (descriptor) Object.defineProperty(sharedConfig, name, descriptor);
      else Reflect.deleteProperty(sharedConfig, name);
    }
    if (bootstrap) Object.defineProperty(globalThis, "_$HY", bootstrap);
    else Reflect.deleteProperty(globalThis, "_$HY");
    vi.restoreAllMocks();
  }
});

it("replays a click on a delayed island after an earlier root has completed", async () => {
  const first = island();
  const second = island(fixture.second);
  const button = second.querySelector("button")!;
  client(first)(IslandFixture, fixture.props, fixture.slots, { client: "load" });
  await settle();
  first.removeAttribute("ssr");
  button.click();
  expect(button.textContent).toBe("server:0");
  client(second)(IslandFixture, fixture.props, {}, { client: "visible" });
  await settle();
  expect(second.querySelector("button")).toBe(button);
  expect(button.textContent).toBe("server:1");
  second.removeAttribute("ssr");
  button.click();
  await settle();
  expect(button.textContent).toBe("server:2");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("replays each island independently when hydration order reverses capture order", async () => {
  const first = island();
  const second = island(fixture.second);
  const firstButton = first.querySelector("button")!;
  const secondButton = second.querySelector("button")!;
  firstButton.click();
  secondButton.click();
  client(second)(IslandFixture, fixture.props, {}, { client: "visible" });
  await settle();
  expect(second.querySelector("button")).toBe(secondButton);
  expect(secondButton.textContent).toBe("server:1");
  expect(firstButton.textContent).toBe("server:0");
  // Astro may not yet have removed `ssr`; already-claimed clicks must not queue.
  secondButton.click();
  await settle();
  expect(secondButton.textContent).toBe("server:2");
  client(first)(IslandFixture, fixture.props, fixture.slots, { client: "idle" });
  await settle();
  expect(first.querySelector("button")).toBe(firstButton);
  expect(firstButton.textContent).toBe("server:1");
  expect(secondButton.textContent).toBe("server:2");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("retains and replays live input typed into a delayed island", async () => {
  const first = island();
  client(first)(IslandFixture, fixture.props, fixture.slots, { client: "load" });
  await settle();
  const element = island(fixture.input);
  const input = element.querySelector("input")!;
  const output = element.querySelector("output")!;
  input.value = "typed before hydration";
  input.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }));
  client(element)(InputFixture, {}, {}, { client: "idle" });
  await settle();
  expect(element.querySelector("input")).toBe(input);
  expect(element.querySelector("output")).toBe(output);
  expect(input.value).toBe("typed before hydration");
  expect(output.textContent).toBe("typed before hydration");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("settles an existing island's pending update before hydrating another root", async () => {
  const first = island();
  const second = island(fixture.second);
  client(first)(IslandFixture, fixture.props, fixture.slots, { client: "load" });
  await settle();
  const button = first.querySelector("button")!;
  button.click();
  client(second)(IslandFixture, fixture.props, {}, { client: "load" });
  await settle();
  expect(first.querySelector("button")).toBe(button);
  expect(button.textContent).toBe("server:1");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it.each([false, true])(
  "replays a delayed nested Solid island's click once (defer child: %s)",
  async (deferChild) => {
    const parent = island();
    const child = island(fixture.second);
    parent.querySelector("astro-slot")!.append(child);
    const parentClick = vi.fn();
    const nativeClick = vi.fn();
    parent.addEventListener("click", nativeClick);
    client(parent)(IslandFixture, { ...fixture.props, onBubble: parentClick }, fixture.slots, {
      client: "load",
    });
    await settle();
    parent.removeAttribute("ssr");
    const button = child.querySelector("button")!;
    button.click();
    expect(nativeClick).toHaveBeenCalledTimes(1);
    expect(parentClick).not.toHaveBeenCalled();
    if (deferChild) {
      await settle();
      expect(nativeClick).toHaveBeenCalledTimes(1);
      expect(parentClick).not.toHaveBeenCalled();
      expect(button.textContent).toBe("server:0");
    }
    client(child)(IslandFixture, fixture.props, {}, { client: "visible" });
    await settle();
    expect(child.querySelector("button")).toBe(button);
    expect(button.textContent).toBe("server:1");
    expect(parentClick).toHaveBeenCalledTimes(1);
    expect(nativeClick).toHaveBeenCalledTimes(1);
    expect(parent.querySelector("button")!.textContent).toBe("server:0");
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  },
);

it("does not capture a nested foreign island's events in its pending Solid parent", async () => {
  const element = island();
  const foreign = document.createElement("astro-island");
  foreign.setAttribute("ssr", "");
  foreign.innerHTML = '<button _hk="foreign">foreign action</button>';
  element.querySelector("astro-slot")!.append(foreign);
  foreign.querySelector("button")!.click();
  const button = element.querySelector("button")!;
  button.click();
  client(element)(IslandFixture, fixture.props, fixture.slots, { client: "load" });
  await settle();
  expect(element.querySelector("button")).toBe(button);
  expect(button.textContent).toBe("server:1");
  expect(element.querySelector("astro-island")).toBe(foreign);
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("adopts serialized async SSR content using the emitted bootstrap and payload scripts", async () => {
  const asyncFixture = JSON.parse(readFileSync("output/astro-solid-async.json", "utf8"));
  const element = island(asyncFixture);
  runScripts(element);
  const paragraph = element.querySelector("p");
  expect(paragraph?.textContent).toBe("resolved content");
  client(element)(
    AsyncFixture,
    { load: () => new Promise<string>(() => {}) },
    {},
    { client: "load" },
  );
  await settle();
  expect(element.querySelector("p")).toBe(paragraph);
  expect(paragraph?.textContent).toBe("resolved content");
  expect(typeof sharedConfig.verifyHydration).toBe("function");
  sharedConfig.verifyHydration!();
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it("preserves live default and named slots across client-only prop updates", async () => {
  const element = island();
  const slots = {
    default: '<input value="initial">',
    "named-slot": "<button>slotted action</button>",
  };
  const run = client(element);
  run(IslandFixture, fixture.props, slots, { client: "only" });
  await settle();
  element.removeAttribute("ssr");
  const original = [...element.querySelectorAll("astro-slot")];
  const input = element.querySelector("input")!;
  const button = element.querySelector('astro-slot[name="named-slot"] button')!;
  const click = vi.fn();
  button.addEventListener("click", click);
  input.value = "live value";
  run(IslandFixture, { ...fixture.props, label: "updated" }, slots, { client: "only" });
  await settle();
  original.forEach((node, index) =>
    expect(element.querySelectorAll("astro-slot")[index]).toBe(node),
  );
  expect(element.querySelector("input")).toBe(input);
  expect(input.value).toBe("live value");
  expect(element.querySelector('astro-slot[name="named-slot"] button')).toBe(button);
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  expect(click).toHaveBeenCalledTimes(1);
});

function island(data = fixture.first) {
  const element = document.createElement("astro-island");
  element.setAttribute("ssr", "");
  element.setAttribute("data-solid-render-id", data.attrs["data-solid-render-id"]);
  element.innerHTML = data.html;
  document.body.append(element);
  islands.push(element);
  return element;
}

it("adopts exact SSR nodes, updates props, preserves slots and disposes/remounts", async () => {
  const element = island();
  const original = [...element.querySelectorAll("*")];
  const button = element.querySelector("button")!;
  const serverId = button.id;
  expect(serverId).not.toBe("");
  const dispose = vi.fn();
  const run = client(element);
  run(IslandFixture, { ...fixture.props, onDispose: dispose }, fixture.slots, { client: "load" });
  await settle();
  expect(typeof sharedConfig.verifyHydration).toBe("function");
  sharedConfig.verifyHydration!();
  expect([...element.querySelectorAll("*")]).toEqual(original);
  original.forEach((node, index) => expect(element.querySelectorAll("*")[index]).toBe(node));
  expect(button.id).toBe(serverId);
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
  element.removeAttribute("ssr");
  button.click();
  await settle();
  expect(button.textContent).toBe("server:1");
  run(IslandFixture, { label: "updated", onDispose: dispose }, fixture.slots, { client: "load" });
  await settle();
  expect(element.querySelector("button")).toBe(button);
  expect(button.textContent).toBe("updated:1");
  expect(button.hasAttribute("data-optional")).toBe(false);
  expect(element.querySelector("em")).toBe(original.find((node) => node.tagName === "EM"));
  element.dispatchEvent(new Event("astro:unmount"));
  expect(dispose).toHaveBeenCalledTimes(1);
  element.setAttribute("ssr", "");
  run(IslandFixture, { label: "remounted", onDispose: dispose }, {}, { client: "only" });
  await settle();
  expect(element.querySelector("button")).not.toBe(button);
  expect(element.querySelector("button")!.textContent).toBe("remounted:0");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});

it.each([true, false])(
  "keeps two hydrated island IDs isolated (staggered: %s)",
  async (staggered) => {
    const first = island();
    const second = island(fixture.second);
    const buttons = [first.querySelector("button")!, second.querySelector("button")!];
    const serverIds = buttons.map((button) => button.id);
    expect(serverIds.every(Boolean)).toBe(true);
    for (const [index, element] of [first, second].entries()) {
      client(element)(IslandFixture, fixture.props, index === 0 ? fixture.slots : {}, {
        client: "load",
      });
      if (staggered) await settle();
      expect(typeof sharedConfig.verifyHydration).toBe("function");
      sharedConfig.verifyHydration!();
      expect(element.querySelector("button")).toBe(buttons[index]);
      expect(buttons[index].id).toBe(serverIds[index]);
      expect(element.querySelector("div")!.getAttribute("aria-labelledby")).toBe(serverIds[index]);
    }
    expect(buttons[0].id).not.toBe(buttons[1].id);
    buttons[1].click();
    await settle();
    expect(buttons.map((button) => button.textContent)).toEqual(["server:0", "server:1"]);
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  },
);

it.each([new Error("client render failure"), undefined, 0, false])(
  "cleans up a failed hydration and permits a fresh island %#",
  async (failure) => {
    const element = island();
    const disposed = vi.fn();
    element.querySelector("button")!.click();
    let failed = false;
    let caught;
    try {
      client(element)(
        () => {
          onCleanup(disposed);
          throw failure;
        },
        {},
        {},
        { client: "load" },
      );
    } catch (error) {
      failed = true;
      caught = error;
    }
    await settle();
    expect(failed).toBe(true);
    // Loading rethrows Solid's StatusError with the original value as its cause.
    // Preserve the native failure contract instead of unwrapping it in the adapter.
    expect(caught instanceof Error).toBe(true);
    expect(Object.hasOwn(caught as Error, "cause")).toBe(true);
    expect(Object.is((caught as Error).cause, failure), "original error cause").toBe(true);
    expect(disposed).toHaveBeenCalledTimes(1);
    element.dispatchEvent(new Event("astro:unmount"));
    expect(disposed).toHaveBeenCalledTimes(1);
    // Failure diagnostics belong to the throwing attempt, not the next island.
    vi.mocked(console.warn).mockClear();
    vi.mocked(console.error).mockClear();
    const next = island(fixture.second);
    const button = next.querySelector("button")!;
    const id = button.id;
    button.click();
    client(next)(IslandFixture, fixture.props, {}, { client: "load" });
    await settle();
    expect(typeof sharedConfig.verifyHydration).toBe("function");
    sharedConfig.verifyHydration!();
    expect(next.querySelector("button")).toBe(button);
    expect(button.id).toBe(id);
    expect(button.textContent).toBe("server:1");
    button.click();
    await settle();
    expect(button.textContent).toBe("server:2");
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  },
);
