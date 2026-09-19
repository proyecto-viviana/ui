import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, sharedConfig } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
import {
  DynamicFixture,
  HydrationGateFixture,
  RenderPropsFixture,
  type DynamicControls,
  type RenderControls,
} from "./fixtures/utils";

const readFixture = (name: string) =>
  readFileSync(resolve(import.meta.dirname, `../../../output/utils-${name}-ssr.html`), "utf8");

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    document.body.innerHTML = "";
  }
});

describe("utils hydration ownership", () => {
  it("adopts fallbacks before releasing client-only children and keeps remounts immediately ready", async () => {
    let controls!: RenderControls;
    const states: boolean[] = [];
    const constructed: Array<{ kind: string; id: string; hydrating: boolean }> = [];
    const disposed: string[] = [];
    const refs = new Map<string, HTMLSpanElement>();
    const serverNodes = new Map<string, Element>();
    const serverIds = new Map<string, string>();
    const container = await hydrateOverSsr(
      readFixture("hydration-gates"),
      () => (
        <HydrationGateFixture
          controls={(value) => {
            controls = value;
          }}
          state={(hydrated) => states.push(hydrated)}
          constructed={(kind, id) =>
            constructed.push({ kind, id, hydrating: sharedConfig.hydrating })
          }
          disposed={(kind) => disposed.push(kind)}
          ref={(kind, element) => refs.set(kind, element)}
        />
      ),
      {
        beforeHydrate(container) {
          for (const node of container.querySelectorAll("[data-gate]")) {
            const kind = node.getAttribute("data-gate")!;
            serverNodes.set(kind, node);
            serverIds.set(kind, node.id);
          }
          expect([...serverNodes.keys()]).toEqual([
            "component-fallback",
            "hook-fallback",
            "hook-following",
            "following",
          ]);
        },
      },
    );
    expect(states).toEqual([false]);
    for (const [kind, node] of serverNodes) {
      expect(refs.get(kind)).toBe(node);
      expect(constructed.find((entry) => entry.kind === kind)?.id).toBe(serverIds.get(kind));
      expect(constructed.find((entry) => entry.kind === kind)?.hydrating).toBe(true);
    }
    const childKinds = ["component-child", "empty-child", "hook-child"];
    for (const kind of childKinds) {
      expect(constructed.filter((entry) => entry.kind === kind)).toHaveLength(1);
      expect(constructed.find((entry) => entry.kind === kind)?.hydrating).toBe(false);
      expect(container.querySelector(`[data-gate="${kind}"]`)).toHaveTextContent(
        "gate-context:first",
      );
    }
    expect(container.querySelectorAll('[data-gate$="fallback"]')).toHaveLength(0);
    expect(disposed.sort()).toEqual(["component-fallback", "hook-fallback"]);
    const following = serverNodes.get("following")!;
    expect(container.querySelector('[data-gate="following"]')).toBe(following);
    const firstChildren = childKinds.map((kind) => refs.get(kind)!);
    controls.update();
    flush();
    firstChildren.forEach((node) => {
      expect(container.contains(node)).toBe(true);
      expect(node).toHaveTextContent("gate-context:second");
    });
    controls.reveal(false);
    flush();
    firstChildren.forEach((node) => expect(container.contains(node)).toBe(false));
    controls.reveal(true);
    flush();
    expect(states).toEqual([false, true]);
    for (const kind of childKinds) {
      expect(constructed.filter((entry) => entry.kind === kind)).toHaveLength(2);
      expect(container.querySelector(`[data-gate="${kind}"]`)).toHaveTextContent(
        "gate-context:second",
      );
    }
    expect(constructed.filter((entry) => entry.kind.endsWith("fallback"))).toHaveLength(2);
    expect(container.querySelector('[data-gate="following"]')).toBe(following);
    cleanupHydrationRoots();
    for (const kind of [
      ...childKinds,
      "component-fallback",
      "hook-fallback",
      "hook-following",
      "following",
    ]) {
      expect(disposed.filter((value) => value === kind)).toHaveLength(
        constructed.filter((entry) => entry.kind === kind).length,
      );
    }
  });

  it("adopts dynamic tags and preserves focus/refs through prop updates and delayed rendering", async () => {
    let controls!: DynamicControls;
    const constructions: string[] = [];
    const disposals: string[] = [];
    const refs: HTMLElement[] = [];
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(
      readFixture("dynamic"),
      () => (
        <DynamicFixture
          controls={(value) => {
            controls = value;
          }}
          constructed={(kind) => constructions.push(kind)}
          disposed={(kind) => disposals.push(kind)}
          ref={(element) => refs.push(element)}
        />
      ),
      {
        beforeHydrate(container) {
          serverNodes = [...container.querySelectorAll("section, [data-fixture], span")];
          expect(serverNodes).toHaveLength(6);
        },
      },
    );
    const adopted = [...container.querySelectorAll("section, [data-fixture], span")];
    expect(adopted).toHaveLength(serverNodes.length);
    adopted.forEach((node, index) => expect(node).toBe(serverNodes[index]));
    const initial = container.querySelector<HTMLElement>('[data-fixture="dynamic"]')!;
    expect(initial.tagName).toBe("BUTTON");
    const sibling = container.querySelector('[data-fixture="unlisted"]')!;
    expect(sibling.tagName).toBe("MARK");
    const child = initial.querySelector("span")!;
    expect(child.id).not.toBe("");
    expect(initial).toHaveAttribute("component", "forwarded");
    expect(initial).toHaveTextContent("inner:first:context");
    expect(refs).toHaveLength(1);
    expect(refs[0]).toBe(initial);
    expect(constructions).toEqual(["initial"]);
    expect(disposals).toEqual([]);

    initial.focus();
    controls.update();
    flush();
    expect(container.querySelector('[data-fixture="dynamic"]')).toBe(initial);
    expect(initial.querySelector("span")).toBe(child);
    expect(document.activeElement).toBe(initial);
    expect(initial).toHaveAttribute("title", "second");
    expect(initial).toHaveClass("label-second");
    expect(initial).toHaveTextContent("inner:second:context");
    initial.click();
    flush();
    expect(container.querySelector('[data-fixture="clicks"]')).toHaveTextContent("1");
    expect(constructions).toEqual(["initial"]);
    expect(disposals).toEqual([]);

    controls.reveal(true);
    flush();
    const delayed = container.querySelector('[data-fixture="delayed"]')!;
    expect(delayed.tagName).toBe("BUTTON");
    expect(delayed).toHaveTextContent("inner:second:context");
    expect(container.querySelector('[data-fixture="fallback"]')).toBeNull();
    controls.retag("a");
    flush();
    const replacement = container.querySelector<HTMLElement>('[data-fixture="dynamic"]')!;
    expect(replacement.tagName).toBe("A");
    expect(replacement).not.toBe(initial);
    expect(replacement).toHaveTextContent("inner:second:context");
    expect(refs.at(-1)).toBe(replacement);
    expect(container.contains(initial)).toBe(false);
    expect(container.querySelector('[data-fixture="delayed"]')?.tagName).toBe("A");
    expect(container.contains(delayed)).toBe(false);
    replacement.click();
    flush();
    expect(container.querySelector('[data-fixture="clicks"]')).toHaveTextContent("2");
    expect(container.querySelector('[data-fixture="unlisted"]')).toBe(sibling);
    controls.reveal(false);
    flush();
    expect(container.querySelector('[data-fixture="delayed"]')).toBeNull();
    expect(container.querySelector('[data-fixture="fallback"]')).toHaveTextContent("Waiting");
    controls.retag("output");
    controls.reveal(true);
    flush();
    expect(container.querySelector('[data-fixture="delayed"]')?.tagName).toBe("OUTPUT");
    expect(container.querySelector('[data-fixture="delayed"]')).toHaveTextContent(
      "inner:second:context",
    );
    expect(container.querySelector('[data-fixture="unlisted"]')).toBe(sibling);
    cleanupHydrationRoots();
    expect(disposals.filter((kind) => kind === "initial")).toHaveLength(
      constructions.filter((kind) => kind === "initial").length,
    );
    expect(disposals.filter((kind) => kind === "delayed")).toHaveLength(
      constructions.filter((kind) => kind === "delayed").length,
    );
    container.remove();
  });

  it("keeps render-prop nodes and accessor bindings while conditional siblings change", async () => {
    let controls!: RenderControls;
    let renders = 0;
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(
      readFixture("render-props"),
      () => (
        <RenderPropsFixture
          controls={(value) => {
            controls = value;
          }}
          rendered={() => renders++}
        />
      ),
      {
        beforeHydrate(container) {
          serverNodes = [...container.querySelectorAll("section, [data-fixture]")];
          expect(serverNodes).toHaveLength(4);
        },
      },
    );
    const adopted = [...container.querySelectorAll("section, [data-fixture]")];
    expect(adopted).toHaveLength(serverNodes.length);
    adopted.forEach((node, index) => expect(node).toBe(serverNodes[index]));
    const renderProp = container.querySelector('[data-fixture="render-prop"]')!;
    const accessor = container.querySelector('[data-fixture="accessor"]')!;
    expect(renderProp).toHaveTextContent("render-context:first");
    expect(renderProp).toHaveAttribute("data-selected", "false");
    expect(accessor).toHaveTextContent("first");
    expect(renders).toBe(1);
    controls.update();
    flush();
    expect(container.querySelector('[data-fixture="render-prop"]')).toBe(renderProp);
    expect(container.querySelector('[data-fixture="accessor"]')).toBe(accessor);
    expect(renderProp).toHaveTextContent("render-context:second");
    expect(renderProp).toHaveAttribute("data-selected", "true");
    expect(accessor).toHaveTextContent("second");
    expect(accessor.querySelector("span")).toBeNull();
    expect(renders).toBe(1);
    controls.reveal(false);
    flush();
    expect(container.querySelector('[data-fixture="conditional"]')).toBeNull();
    expect(container.querySelector('[data-fixture="render-fallback"]')).toHaveTextContent("Hidden");
    controls.reveal(true);
    flush();
    expect(container.querySelector('[data-fixture="conditional"]')).toHaveTextContent("second");
    expect(container.querySelector('[data-fixture="render-prop"]')).toBe(renderProp);
    expect(renders).toBe(1);
  });
});
