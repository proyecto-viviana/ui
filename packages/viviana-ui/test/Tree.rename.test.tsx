/** @vitest-environment jsdom */
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { Provider, Text, TreeView, TreeViewItem, TreeViewItemContent } from "../src";

const ITEMS = [
  { id: "layer", textValue: "Layer" },
  { id: "mask", textValue: "Mask" },
];

function Layers(props: { onRename?: (key: string, name: string) => void }) {
  return (
    <Provider background="base" colorScheme="dark">
      <TreeView aria-label="Layers" items={ITEMS} onRename={props.onRename}>
        {(item) => (
          <TreeViewItem id={String(item.id)} textValue={item.textValue}>
            <TreeViewItemContent>
              <Text slot="label">{item.textValue}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    </Provider>
  );
}

function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function row(container: HTMLElement, key: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-tree-view-item][data-key="${key}"]`);
  if (!element) throw new Error(`${key} row did not render`);
  return element;
}

function label(element: HTMLElement): HTMLElement {
  const slot = element.querySelector<HTMLElement>(
    "[data-rsp-slot='label'], [slot='label'], [data-slot='label']",
  );
  if (!slot) throw new Error("label did not render");
  return slot;
}

function press(target: EventTarget, key: string): boolean {
  return target.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
}

function click(target: EventTarget, detail: number): void {
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, detail }));
}

async function openWithF2(container: HTMLElement, key = "layer"): Promise<HTMLInputElement> {
  const item = row(container, key);
  press(label(item), "F2");
  await tick();
  const input = item.querySelector<HTMLInputElement>("[data-tree-rename] input");
  if (!input) throw new Error("rename field did not open");
  return input;
}

describe("TreeView onRename", () => {
  it("opens the label editor on F2 and puts focus in the field", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const item = row(container, "layer");
    const input = await openWithF2(container);
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-label")).toBe("Layer");
    expect(label(item).hidden).toBe(true);
    expect(calls).toEqual([]);
  });

  it("opens the editor on a double press of the label and ignores the expand control", async () => {
    const { container } = render(() => <Layers onRename={() => {}} />);
    const item = row(container, "layer");
    const expand = item.querySelector<HTMLElement>("[data-rsp-slot='expand-button']");
    if (!expand) throw new Error("expand control did not render");
    expand.dispatchEvent(
      new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2 }),
    );
    await tick();
    expect(item.querySelector("[data-tree-rename]")).toBeNull();

    click(label(item), 1);
    await tick();
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    click(label(item), 1);
    await tick();
    expect(item.querySelector("[data-tree-rename] input")).toBeInstanceOf(HTMLInputElement);
  });

  it("commits on Enter and restores focus to the row", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const item = row(container, "layer");
    const input = await openWithF2(container);
    input.value = "Layer 2";
    expect(press(input, "Enter")).toBe(false);
    await tick();
    expect(calls).toEqual([["layer", "Layer 2"]]);
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    expect(document.activeElement).toBe(item);
    expect(label(item).hidden).toBe(false);
  });

  it("cancels on Escape and restores focus without calling onRename", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const item = row(container, "layer");
    const input = await openWithF2(container);
    input.value = "Discarded";
    expect(press(input, "Escape")).toBe(false);
    await tick();
    expect(calls).toEqual([]);
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    expect(document.activeElement).toBe(item);
    expect(label(item).textContent).toBe("Layer");
  });

  it("commits on blur", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const item = row(container, "layer");
    const input = await openWithF2(container);
    input.value = "Renamed";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.blur();
    await tick();
    expect(calls).toEqual([["layer", "Renamed"]]);
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    expect(document.activeElement).not.toBe(item);
  });

  it("keeps arrows and type-ahead in the field", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const item = row(container, "layer");
    item.focus();
    await tick();
    const input = await openWithF2(container);
    const tree = container.querySelector("[data-tree-view]");
    if (!tree) throw new Error("tree did not render");
    let seen = 0;
    const mark = () => {
      seen += 1;
    };
    tree.addEventListener("keydown", mark, true);
    tree.addEventListener("keydown", mark);
    expect(press(input, "m")).toBe(true);
    expect(press(input, "ArrowDown")).toBe(true);
    await tick();
    expect(seen).toBe(0);
    expect(document.activeElement).toBe(input);
    expect(row(container, "mask").getAttribute("data-focused")).not.toBe("true");
    expect(calls).toEqual([]);
    tree.removeEventListener("keydown", mark, true);
    tree.removeEventListener("keydown", mark);
  });

  it("does not edit when onRename is omitted", async () => {
    const { container } = render(() => <Layers />);
    const item = row(container, "layer");
    press(label(item), "F2");
    item.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, detail: 2 }));
    await tick();
    expect(container.querySelector("[data-tree-rename]")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });

  it("does not throw when the editor unmounts", async () => {
    const { container, unmount } = render(() => <Layers onRename={() => {}} />);
    await openWithF2(container);
    expect(() => unmount()).not.toThrow();
    await tick();
    expect(document.querySelector("[data-tree-rename]")).toBeNull();
  });
});
