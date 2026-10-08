/** @vitest-environment jsdom */
import { createSignal, flush } from "solid-js";
import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { Provider, Text, TreeView, TreeViewItem, TreeViewItemContent } from "../src";

type Node = { id: string; textValue: string; children?: Node[] };

const ITEMS: Node[] = [
  {
    id: "layer",
    textValue: "Layer",
    children: [{ id: "child", textValue: "Child" }],
  },
];

function row(container: HTMLElement, key: string): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-tree-view-item][data-key="${key}"]`);
  if (!element) throw new Error(`${key} row did not render`);
  return element;
}

function childRow(container: HTMLElement): HTMLElement | null {
  return container.querySelector<HTMLElement>('[data-tree-view-item][data-key="child"]');
}

function detailButton(item: HTMLElement): HTMLButtonElement {
  const button = item.querySelector<HTMLButtonElement>("[data-rsp-slot='detail-button']");
  if (!button) throw new Error("detail control did not render");
  return button;
}

function expandButton(item: HTMLElement): HTMLButtonElement {
  const button = item.querySelector<HTMLButtonElement>("[data-rsp-slot='expand-button']");
  if (!button) throw new Error("expand control did not render");
  return button;
}

function names(keys: Set<unknown>): string[] {
  return [...keys].map(String).sort();
}

function Layers(props: {
  showDetail?: boolean;
  selectionMode?: "none" | "multiple";
  defaultExpandedKeys?: Iterable<string>;
  detailExpandedKeys?: Iterable<string>;
  onDetailExpandedChange?: (keys: Set<string>) => void;
  onExpandedChange?: (keys: Set<string>) => void;
}) {
  return (
    <Provider background="base" colorScheme="dark">
      <TreeView
        aria-label="Layers"
        items={ITEMS}
        selectionMode={props.selectionMode}
        defaultExpandedKeys={props.defaultExpandedKeys}
        detailExpandedKeys={props.detailExpandedKeys}
        onDetailExpandedChange={props.onDetailExpandedChange}
        onExpandedChange={props.onExpandedChange}
      >
        {(item) => (
          <TreeViewItem
            id={String(item.id)}
            textValue={item.textValue}
            hasDetail={props.showDetail !== false && item.id === "layer"}
          >
            <TreeViewItemContent>
              <Text slot="label">{item.textValue}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    </Provider>
  );
}

describe("TreeView detail control", () => {
  it("registers one nested static child and expands it once", async () => {
    const user = setupUser();
    const { getByRole, queryByRole, getAllByRole } = render(() => (
      <TreeView aria-label="Static layers">
        <TreeViewItem id="parent" textValue="Parent">
          <TreeViewItemContent>
            <Text slot="label">Parent</Text>
          </TreeViewItemContent>
          <TreeViewItem id="nested" textValue="Nested">
            <TreeViewItemContent>
              <Text slot="label">Nested</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        </TreeViewItem>
      </TreeView>
    ));
    const parent = () => getByRole("row", { name: /Parent/ });
    expect(parent()).toHaveAttribute("aria-level", "1");
    expect(parent()).toHaveAttribute("aria-expanded", "false");
    expect(queryByRole("row", { name: /Nested/ })).toBeNull();
    await user.click(expandButton(parent()));
    expect(parent()).toHaveAttribute("aria-expanded", "true");
    expect(getAllByRole("row", { name: /Nested/ })).toHaveLength(1);
    expect(getByRole("row", { name: /Nested/ })).toHaveAttribute("aria-level", "2");
    expect(getAllByRole("row")).toHaveLength(2);
    await user.click(expandButton(parent()));
    expect(queryByRole("row", { name: /Nested/ })).toBeNull();
    await user.click(expandButton(parent()));
    expect(getAllByRole("row", { name: /Nested/ })).toHaveLength(1);
  });

  it("renders static item function children only with live row state", async () => {
    const user = setupUser();
    let renderCount = 0;
    const { getByRole } = render(() => (
      <TreeView aria-label="Row state" selectionMode="single">
        <TreeViewItem id="stateful" textValue="Stateful" hasChildItems>
          {(state) => {
            renderCount++;
            expect(state).toBeDefined();
            expect(state.id).toBe("stateful");
            expect(state.state).toBeDefined();
            expect(typeof state.isSelected).toBe("boolean");
            expect(typeof state.isExpanded).toBe("boolean");
            return (
              <TreeViewItemContent>
                <Text slot="label">
                  Stateful {state.isSelected ? "selected" : "unselected"}{" "}
                  {state.isExpanded ? "expanded" : "collapsed"}
                </Text>
              </TreeViewItemContent>
            );
          }}
        </TreeViewItem>
      </TreeView>
    ));
    const item = () => getByRole("row", { name: "Stateful" });
    expect(item()).toHaveTextContent("Stateful unselected collapsed");
    expect(renderCount).toBeGreaterThan(0);
    expect(item()).toHaveAttribute("aria-selected", "false");
    expect(item()).toHaveAttribute("aria-expanded", "false");
    item().focus();
    expect(document.activeElement).toBe(item());
    await user.keyboard(" ");
    await waitFor(() => {
      expect(item()).toHaveTextContent("Stateful selected collapsed");
      expect(item()).toHaveAttribute("aria-selected", "true");
    });
    await user.click(item().querySelector('[data-rsp-slot="expand-button"]')!);
    await waitFor(() => {
      expect(item()).toHaveTextContent("Stateful selected expanded");
      expect(item()).toHaveAttribute("aria-expanded", "true");
    });
    await user.click(item().querySelector('[data-rsp-slot="expand-button"]')!);
    await waitFor(() => {
      expect(item()).toHaveTextContent("Stateful selected collapsed");
      expect(item()).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("toggles detail state without expanding children or selecting the row", async () => {
    const user = setupUser();
    const detailCalls: string[][] = [];
    const expandedCalls: string[][] = [];
    const { container } = render(() => (
      <Layers
        selectionMode="multiple"
        onDetailExpandedChange={(keys) => detailCalls.push(names(keys))}
        onExpandedChange={(keys) => expandedCalls.push(names(keys))}
      />
    ));
    const item = row(container, "layer");
    const detail = detailButton(item);
    expect(detail).toHaveAttribute("aria-expanded", "false");
    expect(detail).toHaveAttribute("aria-label", "Show details");
    expect(detail).toHaveAttribute("data-react-aria-prevent-focus", "");
    expect(detail).toHaveAttribute("tabindex", "-1");
    expect(item).toHaveAttribute("aria-expanded", "false");
    expect(item).not.toHaveAttribute("data-expanded");
    expect(item).toHaveAttribute("data-has-detail", "");
    expect(item).not.toHaveAttribute("data-detail-expanded");
    expect(childRow(container)).toBeNull();

    await user.click(detail);
    flush();
    expect(detailCalls).toEqual([["layer"]]);
    expect(expandedCalls).toEqual([]);
    expect(detail).toHaveAttribute("aria-expanded", "true");
    expect(detail).toHaveAttribute("aria-label", "Hide details");
    expect(detail).toHaveAttribute("data-expanded", "");
    expect(item).toHaveAttribute("data-detail-expanded", "");
    expect(item).toHaveAttribute("aria-expanded", "false");
    expect(item).not.toHaveAttribute("data-expanded");
    expect(item).not.toHaveAttribute("data-selected");
    expect(item.getAttribute("aria-selected")).not.toBe("true");
    expect(childRow(container)).toBeNull();

    await user.click(detail);
    flush();
    expect(detailCalls).toEqual([["layer"], []]);
    expect(detail).toHaveAttribute("aria-expanded", "false");
    expect(item).not.toHaveAttribute("data-detail-expanded");
    expect(item).not.toHaveAttribute("data-selected");
    expect(expandedCalls).toEqual([]);
  });

  it("toggles child rows from the expand control without changing detail state or selection", async () => {
    const user = setupUser();
    const detailCalls: string[][] = [];
    const expandedCalls: string[][] = [];
    const { container } = render(() => (
      <Layers
        selectionMode="multiple"
        onDetailExpandedChange={(keys) => detailCalls.push(names(keys))}
        onExpandedChange={(keys) => expandedCalls.push(names(keys))}
      />
    ));
    const item = row(container, "layer");
    await user.click(detailButton(item));
    flush();
    await user.click(expandButton(item));
    flush();
    await waitFor(() => {
      expect(childRow(container)).not.toBeNull();
    });
    const open = row(container, "layer");
    expect(open).toHaveAttribute("aria-expanded", "true");
    expect(open).toHaveAttribute("data-expanded", "true");
    expect(detailButton(open)).toHaveAttribute("aria-expanded", "true");
    expect(open).toHaveAttribute("data-detail-expanded", "");
    expect(open).not.toHaveAttribute("data-selected");
    expect(expandedCalls).toEqual([["layer"]]);
    expect(detailCalls).toEqual([["layer"]]);
    expect(childRow(container)?.querySelector("[data-rsp-slot='detail-button']")).toBeNull();

    await user.click(expandButton(open));
    flush();
    await waitFor(() => {
      expect(childRow(container)).toBeNull();
    });
    const closed = row(container, "layer");
    expect(closed).toHaveAttribute("aria-expanded", "false");
    expect(detailButton(closed)).toHaveAttribute("aria-expanded", "true");
    expect(closed).not.toHaveAttribute("data-selected");
    expect(detailCalls).toEqual([["layer"]]);
  });

  it("still selects the row from the label and the checkbox", async () => {
    const user = setupUser();
    const { container } = render(() => <Layers selectionMode="multiple" />);
    const item = row(container, "layer");
    const label = item.querySelector<HTMLElement>("[data-rsp-slot='label'], [slot='label']");
    if (!label) throw new Error("label did not render");
    await user.click(label);
    flush();
    expect(item).toHaveAttribute("data-selected", "true");
    expect(item).toHaveAttribute("aria-selected", "true");
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "false");
    expect(childRow(container)).toBeNull();

    const checkbox = item.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (!checkbox) throw new Error("checkbox did not render");
    await user.click(checkbox);
    flush();
    expect(item).not.toHaveAttribute("data-selected");
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "false");
    expect(item).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps ArrowRight and ArrowLeft on the child-row path", async () => {
    const user = setupUser();
    const detailCalls: string[][] = [];
    const { container } = render(() => (
      <Layers onDetailExpandedChange={(keys) => detailCalls.push(names(keys))} />
    ));
    const item = row(container, "layer");
    item.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(childRow(container)).not.toBeNull();
    });
    const expanded = row(container, "layer");
    expect(expanded).toHaveAttribute("aria-expanded", "true");
    expect(detailButton(expanded)).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(expanded);
    expect(detailCalls).toEqual([]);

    await user.keyboard("{ArrowLeft}");
    await waitFor(() => {
      expect(childRow(container)).toBeNull();
    });
    const collapsed = row(container, "layer");
    expect(detailButton(collapsed)).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(collapsed);

    await user.click(detailButton(collapsed));
    flush();
    const detailed = row(container, "layer");
    expect(detailButton(detailed)).toHaveAttribute("aria-expanded", "true");
    detailed.focus();
    await user.keyboard("{ArrowRight}");
    await waitFor(() => {
      expect(childRow(container)).not.toBeNull();
    });
    const reopened = row(container, "layer");
    expect(detailButton(reopened)).toHaveAttribute("aria-expanded", "true");
    expect(document.activeElement).not.toBe(detailButton(reopened));

    await user.keyboard("{ArrowLeft}");
    await waitFor(() => {
      expect(childRow(container)).toBeNull();
    });
    const afterLeft = row(container, "layer");
    expect(detailButton(afterLeft)).toHaveAttribute("aria-expanded", "true");
    expect(afterLeft).toHaveAttribute("data-detail-expanded", "");
  });

  it("moves ArrowRight onto the checkbox when children are already expanded", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <Layers selectionMode="multiple" defaultExpandedKeys={["layer"]} />
    ));
    const item = row(container, "layer");
    const checkbox = item.querySelector<HTMLInputElement>("input[type='checkbox']");
    if (!checkbox) throw new Error("checkbox did not render");
    expect(childRow(container)).not.toBeNull();
    item.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(checkbox);
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "false");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).not.toBe(detailButton(item));
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "false");
    expect(childRow(container)).not.toBeNull();
  });

  it("omits the detail control when hasDetail is omitted", () => {
    const { container } = render(() => <Layers showDetail={false} />);
    const item = row(container, "layer");
    expect(item.querySelector("[data-rsp-slot='detail-button']")).toBeNull();
    expect(item).not.toHaveAttribute("data-has-detail");
    expect(expandButton(item)).toBeInstanceOf(HTMLButtonElement);
  });

  it("keeps a controlled detailExpandedKeys value until the parent applies it", async () => {
    const user = setupUser();
    const seen: string[][] = [];
    let apply = true;
    const [detailKeys, setDetailKeys] = createSignal<Set<string>>(new Set());
    const { container } = render(() => (
      <Layers
        detailExpandedKeys={detailKeys()}
        onDetailExpandedChange={(keys) => {
          seen.push(names(keys));
          if (apply) setDetailKeys(new Set(keys));
        }}
      />
    ));
    const item = row(container, "layer");
    await user.click(detailButton(item));
    flush();
    expect(seen).toEqual([["layer"]]);
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "true");
    expect(item).toHaveAttribute("aria-expanded", "false");
    expect(childRow(container)).toBeNull();

    apply = false;
    await user.click(detailButton(item));
    flush();
    expect(seen).toEqual([["layer"], []]);
    expect(detailButton(item)).toHaveAttribute("aria-expanded", "true");
    expect([...detailKeys()]).toEqual(["layer"]);
  });
});
