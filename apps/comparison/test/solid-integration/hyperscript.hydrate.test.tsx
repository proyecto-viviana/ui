import { createComponent, render, type JSX } from "@solidjs/web";
import { createContext, createSignal, flush, onCleanup, useContext } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import { h, hc, Keyed, renderProp } from "../../src/components/solid/solid-h";
import {
  SolidNewIcon,
  SolidPlanIllustration,
  SolidDropZoneIllustration,
  SolidIllustratedMessageIllustration,
  createComparisonResolvedThemeSignal,
} from "../../src/components/solid/fixtures/styled-shared";
import { comparisonThemeChangeEvent } from "../../src/data/theme";

// CSR fixtures use the same client compiler as the paired hydration lane.
// These tests do not claim that hyperscript itself serializes SSR markup.
let container: HTMLDivElement;
let dispose: (() => void) | undefined;
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
});
afterEach(() => {
  try {
    dispose?.();
  } finally {
    dispose = undefined;
    container.remove();
    vi.restoreAllMocks();
  }
});
async function settle() {
  await Promise.resolve();
  flush();
  await new Promise<void>((done) => setTimeout(done, 0));
  flush();
}

it("preserves context, callbacks, live props and sibling owners", async () => {
  const Context = createContext("outside");
  const [label, setLabel] = createSignal("first");
  const callback = vi.fn();
  const cleaned = vi.fn();
  const mounted = vi.fn();
  let node: HTMLButtonElement | undefined;
  const Child = (props: {
    title: string;
    onAction: () => void;
    ref: (el: HTMLButtonElement) => void;
  }) => {
    const value = useContext(Context);
    mounted();
    onCleanup(cleaned);
    return hc(
      "button",
      {
        get title() {
          return props.title;
        },
        onClick: props.onAction,
        ref: props.ref,
      },
      [value],
    )();
  };
  dispose = render(
    () =>
      hc(Context, { value: "inside" }, [
        hc(Child, {
          title: label,
          onAction: callback,
          ref: (el: HTMLButtonElement) => {
            node = el;
          },
        }),
        () => hc("span", {}, [label()]),
      ])(),
    container,
  );
  await settle();
  expect(node?.textContent).toBe("inside");
  expect(node?.title).toBe("first");
  expect(callback).not.toHaveBeenCalled();
  setLabel("second");
  await settle();
  expect(container.querySelector("button")).toBe(node);
  expect(node?.title).toBe("second");
  expect(container.querySelector("span")?.textContent).toBe("second");
  expect(mounted).toHaveBeenCalledTimes(1);
  expect(cleaned).not.toHaveBeenCalled();
  node?.click();
  expect(callback).toHaveBeenCalledTimes(1);
  dispose();
  dispose = undefined;
  expect(cleaned).toHaveBeenCalledTimes(1);
});

it("keeps explicit render props callable and rejects ambiguous function children", () => {
  const callback = vi.fn((value: string) => value);
  const Component = (props: { children: (value: string) => JSX.Element }) =>
    props.children("value");
  dispose = render(() => hc(Component, {}, renderProp(callback))(), container);
  expect(callback).toHaveBeenCalledExactlyOnceWith("value");
  expect(container.textContent).toBe("value");
  // @ts-expect-error Runtime callers must also get the explicit child-contract error.
  expect(() => hc(Component, {}, () => "ambiguous")).toThrow("Use child arrays");
});

it("narrows the element call form without pretending component thunks have native branding", () => {
  const native = h("span", {}, "native");
  const component = hc(() => h("button", {}, "component")());
  expect(typeof native).toBe("function");
  expect(typeof component).toBe("function");
  dispose = render(() => [native(), component()], container);
  expect(container.querySelector("span")?.textContent).toBe("native");
  expect(container.querySelector("button")?.textContent).toBe("component");
});

it("recreates exactly one keyed owner and keeps same-key child updates live", async () => {
  const [key, setKey] = createSignal("first");
  const [label, setLabel] = createSignal("initial");
  const mounted = vi.fn();
  const cleaned = vi.fn();
  const Child = (props: { id: string }) => {
    mounted(props.id);
    onCleanup(() => cleaned(props.id));
    return h("button", {}, label)();
  };
  dispose = render(
    () =>
      createComponent(Keyed, {
        get when() {
          return key();
        },
        children: (id) => hc(Child, { id })(),
      }),
    container,
  );
  await settle();
  const original = container.querySelector("button");
  setLabel("updated");
  await settle();
  expect(container.querySelector("button")).toBe(original);
  expect(original?.textContent).toBe("updated");
  expect(mounted).toHaveBeenCalledExactlyOnceWith("first");
  expect(cleaned).not.toHaveBeenCalled();
  setKey("second");
  await settle();
  const replacement = container.querySelector("button");
  expect(replacement).not.toBeNull();
  expect(replacement).not.toBe(original);
  expect(original?.isConnected).toBe(false);
  expect(mounted.mock.calls).toEqual([["first"], ["second"]]);
  expect(cleaned).toHaveBeenCalledExactlyOnceWith("first");
  setLabel("still live");
  await settle();
  expect(container.querySelector("button")).toBe(replacement);
  expect(replacement?.textContent).toBe("still live");
  dispose();
  dispose = undefined;
  expect(cleaned.mock.calls).toEqual([["first"], ["second"]]);
});

it("keeps provider context through an intrinsic shell and keyed child construction", async () => {
  const Context = createContext("outside");
  const [key, setKey] = createSignal("first");
  const seen: string[] = [];
  const Child = () => {
    const value = useContext(Context);
    seen.push(value);
    return h("button", {}, value)();
  };
  dispose = render(
    () =>
      hc(Context, { value: "unique-fixture-context" }, [
        () =>
          hc("div", {}, [
            createComponent(Keyed, {
              get when() {
                return key();
              },
              children: (_key: string) => hc(Child)(),
            }),
          ]),
      ])(),
    container,
  );
  await settle();
  const original = container.querySelector("button");
  expect(original?.textContent).toBe("unique-fixture-context");
  setKey("second");
  await settle();
  expect(container.querySelector("button")).not.toBe(original);
  expect(original?.isConnected).toBe(false);
  expect(seen).toEqual(["unique-fixture-context", "unique-fixture-context"]);
});

for (const [name, Illustration] of [
  ["new", SolidNewIcon],
  ["plan", SolidPlanIllustration],
  ["drop zone", SolidDropZoneIllustration],
  ["illustrated message", SolidIllustratedMessageIllustration],
] as const) {
  it(`${name}: forwards live SVG props without overriding caller values or leaking size`, async () => {
    const [value, setValue] = createSignal("first");
    dispose = render(
      () =>
        createComponent(Illustration, {
          get class() {
            return value();
          },
          get "aria-label"() {
            return value();
          },
          get viewBox() {
            return value() === "first" ? "0 0 64 64" : "0 0 80 80";
          },
        }),
      container,
    );
    await settle();
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 64 64");
    expect(svg?.getAttribute("size")).toBeNull();
    expect(svg?.classList.contains("first")).toBe(true);
    setValue("second");
    await settle();
    expect(container.querySelector("svg")).toBe(svg);
    expect(svg?.getAttribute("viewBox")).toBe("0 0 80 80");
    expect(svg?.getAttribute("aria-label")).toBe("second");
    expect(svg?.classList.contains("first")).toBe(false);
    expect(svg?.classList.contains("second")).toBe(true);
  });
}

it("owns exactly one theme listener and removes it on disposal", async () => {
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  let read: () => string;
  dispose = render(() => {
    read = createComparisonResolvedThemeSignal();
    return hc("span", {}, [read])();
  }, container);
  await settle();
  const registrations = add.mock.calls.filter(([type]) => type === comparisonThemeChangeEvent);
  expect(registrations).toHaveLength(1);
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.textContent).toBe("dark");
  dispose();
  dispose = undefined;
  expect(remove.mock.calls.filter(([type]) => type === comparisonThemeChangeEvent)).toEqual(
    registrations,
  );
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "light" } }),
  );
  await settle();
  expect(read!()).toBe("dark");
});
