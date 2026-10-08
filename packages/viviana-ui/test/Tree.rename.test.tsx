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
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
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
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    expect(press(input, "Escape")).toBe(false);
    await tick();
    expect(calls).toEqual([]);
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    expect(document.activeElement).toBe(item);
    expect(label(item).textContent).toBe("Layer");
  });

  for (const destination of ["blur", "outside"] as const) {
    it(`commits on ${destination === "blur" ? "blur" : "focus moving outside"}`, async () => {
      const calls: Array<[string, string]> = [];
      const { container } = render(() => (
        <>
          <Layers onRename={(key, name) => calls.push([key, name])} />
          <button data-outside="">Outside</button>
        </>
      ));
      const item = row(container, "layer");
      const input = await openWithF2(container);
      expect(document.activeElement).toBe(input);
      const events: Array<{
        type: string;
        target: EventTarget | null;
        currentTarget: EventTarget | null;
        relatedTarget: EventTarget | null;
      }> = [];
      const capture = (event: FocusEvent) => {
        events.push({
          type: event.type,
          target: event.target,
          currentTarget: event.currentTarget,
          relatedTarget: event.relatedTarget,
        });
      };
      input.addEventListener("blur", capture);
      input.addEventListener("focusout", capture);
      input.value = "Renamed";
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      expect(input.isConnected).toBe(true);
      expect(item.querySelector("[data-tree-rename] input")).toBe(input);
      expect(document.activeElement).toBe(input);
      expect(events).toEqual([]);
      const outside = container.querySelector<HTMLButtonElement>("[data-outside]");
      if (!outside) throw new Error("outside focus target did not render");
      if (destination === "blur") input.blur();
      else outside.focus();
      expect(events).toEqual(
        ["blur", "focusout"].map((type) => ({
          type,
          target: input,
          currentTarget: input,
          relatedTarget: destination === "blur" ? null : outside,
        })),
      );
      await tick();
      expect(calls).toEqual([["layer", "Renamed"]]);
      expect(item.querySelector("[data-tree-rename]")).toBeNull();
      expect(document.activeElement).not.toBe(item);
      if (destination === "outside") expect(document.activeElement).toBe(outside);
    });
  }

  it("keeps uninterrupted edits focused and preserves selection before a settled outside exit", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <>
        <Layers onRename={(key, name) => calls.push([key, name])} />
        <button data-outside="">Outside</button>
      </>
    ));
    const item = row(container, "layer");
    const input = await openWithF2(container);
    for (const [name, start, end] of [
      ["Renamed", 2, 4],
      ["Renamed again", 5, 5],
    ] as const) {
      input.value = name;
      input.setSelectionRange(start, end, "backward");
      input.dispatchEvent(new InputEvent("input", { bubbles: true }));
      for (const settled of [false, true]) {
        if (settled) await tick();
        expect(input.isConnected).toBe(true);
        expect(item.querySelector("[data-tree-rename] input")).toBe(input);
        expect(document.activeElement).toBe(input);
        expect(input.value).toBe(name);
        expect([input.selectionStart, input.selectionEnd, input.selectionDirection]).toEqual([
          start,
          end,
          "backward",
        ]);
        expect(calls).toEqual([]);
      }
    }
    const outside = container.querySelector<HTMLButtonElement>("[data-outside]");
    if (!outside) throw new Error("outside focus target did not render");
    outside.focus();
    await tick();
    expect(calls).toEqual([["layer", "Renamed again"]]);
    expect(item.querySelector("[data-tree-rename]")).toBeNull();
    expect(document.activeElement).toBe(outside);
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    input.blur();
    await tick();
    expect(calls).toEqual([["layer", "Renamed again"]]);
    expect(document.activeElement).toBe(outside);
  });

  it("protects internal focus and does not refocus an already unfocused editor on input", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const input = await openWithF2(container);
    const field = input.closest("[data-tree-rename]");
    if (!field) throw new Error("rename field did not render");
    const internal = document.createElement("button");
    field.append(internal);
    internal.focus();
    await tick();
    expect(document.activeElement).toBe(internal);
    expect(calls).toEqual([]);
    input.value = "Background update";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await tick();
    expect(document.activeElement).toBe(internal);
    expect(calls).toEqual([]);
    expect(input.isConnected).toBe(true);
  });

  it("protects the editor from row focus without selecting its contents", async () => {
    const calls: Array<[string, string]> = [];
    const { container } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const input = await openWithF2(container);
    input.setSelectionRange(2, 2);
    row(container, "layer").focus();
    await tick();
    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 2]);
    expect(calls).toEqual([]);
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
    const calls: Array<[string, string]> = [];
    const { container, unmount } = render(() => (
      <Layers onRename={(key, name) => calls.push([key, name])} />
    ));
    const input = await openWithF2(container);
    row(container, "layer").focus();
    const outside = document.createElement("button");
    document.body.append(outside);
    outside.focus();
    expect(() => unmount()).not.toThrow();
    await tick();
    expect(document.querySelector("[data-tree-rename]")).toBeNull();
    expect(input.isConnected).toBe(false);
    expect(document.activeElement).toBe(outside);
    expect(calls).toEqual([]);
    outside.remove();
  });
});
