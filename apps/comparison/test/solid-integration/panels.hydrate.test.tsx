import { createComponent, render } from "@solidjs/web";
import { Errored, flush } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import type { ComponentControlGroup } from "../../src/data/component-controls";
import ComponentExampleFiles from "../../src/components/solid/ComponentExampleFiles";
import ComponentExampleControls from "../../src/components/solid/ComponentExampleControls";
import ComponentDetailMeta from "../../src/components/solid/ComponentDetailMeta";

const { load } = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock("@comparison/data/component-controls", () => ({
  getComponentControlGroup: load,
  comparisonControlsEvent: "comparison:controls-change",
}));
// Keep the actual async panels, hyperscript, source generator and lifecycle.
// These tests own loading semantics, not the styled controls' implementation.
vi.mock("@proyecto-viviana/solid-spectrum/Provider", () => ({
  Provider: (props: { children: unknown }) => () => props.children,
}));
vi.mock("@proyecto-viviana/solid-spectrum/ActionButton", () => ({ ActionButton: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/Content", () => ({ Content: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/ContextualHelp", () => ({ ContextualHelp: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/Heading", () => ({ Heading: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/Picker", () => ({ Picker: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/RadioGroup", () => ({
  Radio: vi.fn(),
  RadioGroup: vi.fn(),
}));
vi.mock("@proyecto-viviana/solid-spectrum/Switch", () => ({ Switch: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/TextField", () => ({ TextField: vi.fn() }));
vi.mock("@proyecto-viviana/solid-spectrum/Badge", () => ({
  Badge: (props: { children: unknown }) => () => props.children,
}));
vi.mock("@proyecto-viviana/solid-spectrum/Meter", () => ({ Meter: vi.fn() }));

const group: ComponentControlGroup = {
  slug: "button",
  title: "Button",
  coverage: "modeled",
  apiProps: ["children", "isDisabled"],
  note: "",
  controls: [
    { name: "children", label: "Label", kind: "text", defaultValue: "Save", isHidden: true },
  ],
};
let container: HTMLDivElement;
let dispose: (() => void) | undefined;
let resolve: (value: ComponentControlGroup) => void;
let reject: (reason: unknown) => void;

beforeEach(() => {
  const pending = new Promise<ComponentControlGroup>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  load.mockReset().mockReturnValue(pending);
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

for (const [name, Panel, selector] of [
  ["files", ComponentExampleFiles, "pre code"],
  ["controls", ComponentExampleControls, "form"],
  ["metadata", ComponentDetailMeta, "#coverage"],
] as const) {
  it(`${name}: preserves the pending shell then renders resolved content`, async () => {
    dispose = render(() => createComponent(Panel, { slug: "button" }), container);
    expect(load).toHaveBeenCalledTimes(1);
    expect(container.querySelector(selector)).toBeNull();
    if (name === "metadata") expect(container.textContent).toBe("");
    else
      expect(
        container.querySelector(name === "files" ? ".s2-example-files-content" : "h2")?.textContent,
      ).toBe(name === "files" ? "" : "Example");
    resolve(group);
    await settle();
    expect(container.querySelector(selector)).not.toBeNull();
    if (name === "files") expect(container.textContent).toContain("<Button>Save</Button>");
    else if (name === "controls")
      expect(container.querySelector<HTMLInputElement>('input[name="children"]')?.value).toBe(
        "Save",
      );
    else {
      expect(
        [...container.querySelectorAll("section > .s2-section-heading > h2")].map(
          (node) => node.textContent,
        ),
      ).toEqual([
        "Coverage",
        "Visual State Coverage",
        "API",
        "Component Layer",
        "Headless Layer",
        "State Layer",
      ]);
      expect(
        [...container.querySelectorAll('#api [role="row"] code')].map((node) => node.textContent),
      ).toEqual(group.apiProps);
      for (const id of [
        "coverage",
        "visual-state-coverage",
        "api",
        "components",
        "headless",
        "state",
      ]) {
        const section = container.querySelector(`#${id}`);
        expect(section).not.toBeNull();
        expect(
          container.querySelector(`#${section?.getAttribute("aria-labelledby")}`)?.tagName,
        ).toBe("H2");
      }
      expect(container.querySelectorAll(".s2-coverage-row")).toHaveLength(6);
    }
  });

  it(`${name}: rejects visibly through the caller's error boundary`, async () => {
    const failures: unknown[] = [];
    const failure = new Error("panel load failed");
    dispose = render(
      () =>
        createComponent(Errored, {
          fallback: (error) => {
            failures.push(error());
            return "load failed";
          },
          get children() {
            return createComponent(Panel, { slug: "button" });
          },
        }),
      container,
    );
    reject(failure);
    await settle();
    expect(container.textContent).toBe("load failed");
    expect(failures).toHaveLength(1);
    expect(failures[0]).toBeInstanceOf(Error);
    expect((failures[0] as Error).message).toBe("panel load failed");
    expect(failures[0]).toBe(failure);
  });

  it(`${name}: does not construct late content after owner disposal`, async () => {
    const read = vi.fn(() => (name === "metadata" ? group.apiProps : group.controls));
    dispose = render(() => createComponent(Panel, { slug: "button" }), container);
    dispose();
    dispose = undefined;
    resolve(
      Object.defineProperty({ ...group }, name === "metadata" ? "apiProps" : "controls", {
        enumerable: true,
        get: read,
      }),
    );
    await settle();
    expect(read).not.toHaveBeenCalled();
    expect(container.querySelector(selector)).toBeNull();
  });
}

it("updates generated source from controls and removes its listener on disposal", async () => {
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  dispose = render(() => createComponent(ComponentExampleFiles, { slug: "button" }), container);
  resolve(group);
  await settle();
  const source = container.querySelector("pre code");
  const callback = add.mock.calls.find(([type]) => type === "comparison:controls-change")?.[1];
  expect(typeof callback).toBe("function");
  window.dispatchEvent(
    new CustomEvent("comparison:controls-change", {
      detail: { component: "button", props: { children: "Updated" } },
    }),
  );
  await settle();
  expect(container.querySelector("pre code")?.textContent).toContain("<Button>Updated</Button>");
  expect(container.querySelector("pre code")).toBe(source);
  dispose();
  dispose = undefined;
  expect(remove).toHaveBeenCalledWith("comparison:controls-change", callback);
});
