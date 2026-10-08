/** @vitest-environment jsdom */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { Provider, Text, TreeView, TreeViewItem, TreeViewItemContent } from "../src";

/* The macro bakes sizing into opaque atoms. jsdom does not insert that sheet
 * (getComputedStyle stays auto), so this resolves the atom the element actually
 * carries against the declarations this build already emitted, then applies that
 * declaration with the desktop scale of 1. 24px is calc(1.5rem); 40px is calc(2.5rem). */
const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");

const ITEMS = [
  {
    id: "layer",
    textValue: "Layer",
    children: [{ id: "child", textValue: "Child" }],
  },
];

function LayerTree(props: { density?: "regular" | "compact" }) {
  return (
    <Provider background="base" colorScheme="dark">
      <TreeView
        aria-label="Layers"
        density={props.density}
        items={ITEMS}
        defaultExpandedKeys={["layer"]}
      >
        {(item) => (
          <TreeViewItem id={String(item.id)} textValue={item.textValue ?? String(item.id)}>
            <TreeViewItemContent>
              <Text slot="label">{item.textValue ?? String(item.id)}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    </Provider>
  );
}

function atomDeclaration(atom: string): string {
  return new RegExp(`\\.${atom.replace(/[-.]/g, "\\$&")}\\{([^}]*)\\}`).exec(sheet)?.[1] ?? "";
}

function usedPixels(value: string): number {
  const calc = /calc\(([0-9.]+)rem \* (?:var\(--s2-scale\)|1)\)/.exec(value);
  if (calc) return Number(calc[1]) * 16;
  if (value.endsWith("px")) return Number.parseFloat(value);
  throw new Error(`unresolved size: ${value}`);
}

function paint(element: HTMLElement) {
  const rules: string[] = [];
  for (const atom of element.className.split(/\s+/).filter(Boolean)) {
    const body = atomDeclaration(atom);
    if (/^(?:min-height|height|width):/.test(body)) {
      rules.push(`.${CSS.escape(atom)}{${body}}`);
    }
  }
  const style = document.createElement("style");
  style.textContent = rules.join("");
  document.head.append(style);
  document.documentElement.style.setProperty("--s2-scale", "1");
}

function rowBox(container: HTMLElement) {
  const row = container.querySelector<HTMLElement>('[data-tree-view-item][data-key="layer"]');
  const button = row?.querySelector<HTMLElement>('[data-rsp-slot="expand-button"]');
  if (!row || !button) throw new Error("layer row did not render");
  paint(row);
  paint(button);
  const rowStyle = getComputedStyle(row);
  const buttonStyle = getComputedStyle(button);
  return {
    row: usedPixels(rowStyle.minHeight),
    button: usedPixels(buttonStyle.height),
    buttonWidth: usedPixels(buttonStyle.width),
  };
}

describe("TreeView density", () => {
  it("keeps the 40px row and expand control when density is omitted", () => {
    const { container } = render(() => <LayerTree />);
    expect(rowBox(container)).toEqual({ row: 40, button: 40, buttonWidth: 40 });
    expect(container.querySelector("[data-tree-view]")?.getAttribute("data-density")).toBe(
      "regular",
    );
  });

  it("keeps the 40px row and expand control when density is regular", () => {
    const { container } = render(() => <LayerTree density="regular" />);
    expect(rowBox(container)).toEqual({ row: 40, button: 40, buttonWidth: 40 });
  });

  it("computes a 24px row and expand control when density is compact", () => {
    const { container } = render(() => <LayerTree density="compact" />);
    expect(rowBox(container)).toEqual({ row: 24, button: 24, buttonWidth: 24 });
    const child = container.querySelector<HTMLElement>('[data-tree-view-item][data-key="child"]');
    if (!child) throw new Error("child row did not render");
    paint(child);
    expect(usedPixels(getComputedStyle(child).minHeight)).toBe(24);
  });
});
