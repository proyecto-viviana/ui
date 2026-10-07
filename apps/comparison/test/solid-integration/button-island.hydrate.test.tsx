import { readFileSync } from "node:fs";
import { flush, sharedConfig } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import userEvent from "@testing-library/user-event";
import client from "../../integrations/solid/client.mjs";
import SolidButtonIsland from "../../src/components/solid/islands/SolidButtonIsland";

const fixture = JSON.parse(readFileSync("output/astro-solid-button-island.json", "utf8"));
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

it("hydrates the D12 button island on its original node and accepts mouse and Enter", async () => {
  const element = document.createElement("astro-island");
  element.setAttribute("ssr", "");
  element.setAttribute("data-solid-render-id", fixture.result.attrs["data-solid-render-id"]);
  element.innerHTML = fixture.result.html;
  document.body.append(element);
  islands.push(element);
  const button = element.querySelector("button");
  const root = element.querySelector("[data-comparison-action-count]");
  expect(button).not.toBeNull();
  expect(root).not.toBeNull();
  expect(button!.textContent).toContain("Save");
  expect(root!.getAttribute("data-comparison-action-count")).toBe("0");
  client(element)(SolidButtonIsland, {}, {}, { client: "load" });
  await settle();
  expect(typeof sharedConfig.verifyHydration).toBe("function");
  sharedConfig.verifyHydration!();
  expect(element.querySelector("button")).toBe(button);
  expect(element.querySelector("[data-comparison-action-count]")).toBe(root);
  expect(root!.getAttribute("data-comparison-hydrated")).toBe("true");
  element.removeAttribute("ssr");
  const user = userEvent.setup();
  await user.click(button!);
  await settle();
  expect(element.querySelector("button")).toBe(button);
  expect(root!.getAttribute("data-comparison-action-count")).toBe("1");
  button!.focus();
  await user.keyboard("{Enter}");
  await settle();
  expect(element.querySelector("button")).toBe(button);
  expect(root!.getAttribute("data-comparison-action-count")).toBe("2");
  expect(console.warn).not.toHaveBeenCalled();
  expect(console.error).not.toHaveBeenCalled();
});
