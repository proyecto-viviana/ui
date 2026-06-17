/**
 * Tests for solidaria-components Virtualizer
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createMemo, type JSX } from "solid-js";
import {
  GridLayout,
  ListLayout,
  Virtualizer,
  type VirtualizerLayout,
  useVirtualizerContext,
} from "../src/Virtualizer";
import { useCollectionRenderer } from "../src/Collection";
import { ListBox, ListBoxOption } from "../src/ListBox";
import { GridList, GridListItem } from "../src/GridList";
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "../src/Table";
import { Tree, TreeItem } from "../src/Tree";

describe("Virtualizer", () => {
  it("renders children in virtualizer container", () => {
    const layout: VirtualizerLayout = {};
    const { container } = render(() => (
      <Virtualizer layout={layout}>
        <ul>
          <li>Item 1</li>
        </ul>
      </Virtualizer>
    ));

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(container.querySelector("[data-virtualizer]")).toBeInTheDocument();
  });

  it("instantiates class layouts and provides context", () => {
    let instances = 0;
    class TestLayout implements VirtualizerLayout<{ b?: number }> {
      useLayoutOptions() {
        instances += 1;
        return { b: 2 };
      }
    }

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext<{ a?: number; b?: number }>());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="ctx">
          {JSON.stringify({
            isVirtualized: ctx()?.isVirtualized ?? false,
            hasLayout: Boolean(ctx()?.layout),
            options: ctx()?.layoutOptions ?? null,
            layoutInfo0: ctx()?.getLayoutInfo(0) ?? null,
            dropTarget0: ctx()?.getDropTargetFromPoint({ x: 2, y: 2 }, 10) ?? null,
            dropTargetEmpty: ctx()?.getDropTargetFromPoint({ x: 2, y: 2 }, 0) ?? null,
            rendererVirtualized: collection()?.isVirtualized ?? false,
            hasLayoutDelegate: Boolean(collection()?.layoutDelegate),
            hasDropTargetDelegate: Boolean(collection()?.dropTargetDelegate),
            delegateTarget:
              collection()?.dropTargetDelegate?.getDropTargetFromPoint(2, 2, () => true) ?? null,
            hasKeyboardNavigationDelegate: Boolean(
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget,
            ),
            hasKeyboardPageNavigationDelegate: Boolean(
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget,
            ),
            delegateKeyboardTarget:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "root" },
                "next",
                () => true,
              ) ?? null,
            delegatePageKeyboardTarget:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "root" },
                "next",
                () => true,
              ) ?? null,
            delegateOperation:
              collection()?.dropTargetDelegate?.getDropOperation(
                { type: "item", key: 0, dropPosition: "before" },
                { has: () => true },
                ["copy", "move"],
              ) ?? null,
            delegateRootOperation:
              collection()?.dropTargetDelegate?.getDropOperation(
                { type: "root" },
                { has: () => true },
                ["copy", "move"],
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={TestLayout} layoutOptions={{ a: 1 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("ctx").textContent || "{}");
    expect(parsed.isVirtualized).toBe(true);
    expect(parsed.hasLayout).toBe(true);
    expect(parsed.options).toEqual({ a: 1, b: 2 });
    expect(parsed.layoutInfo0?.index).toBe(0);
    expect(parsed.dropTarget0?.type).toBe("item");
    expect(parsed.dropTarget0?.index).toBe(0);
    expect(parsed.dropTargetEmpty?.type).toBe("root");
    expect(parsed.rendererVirtualized).toBe(true);
    expect(parsed.hasLayoutDelegate).toBe(true);
    expect(parsed.hasDropTargetDelegate).toBe(true);
    expect(parsed.delegateTarget?.type).toBe("root");
    expect(parsed.hasKeyboardNavigationDelegate).toBe(true);
    expect(parsed.hasKeyboardPageNavigationDelegate).toBe(true);
    expect(parsed.delegateKeyboardTarget?.type).toBe("root");
    expect(parsed.delegatePageKeyboardTarget?.type).toBe("root");
    expect(parsed.delegateOperation).toBe("move");
    expect(parsed.delegateRootOperation).toBe("copy");
    expect(instances).toBeGreaterThan(0);
  });

  it("uses custom drop operation resolver when provided", () => {
    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="drop-op">
          {collection()?.dropTargetDelegate?.getDropOperation(
            { type: "item", key: 1, dropPosition: "on" },
            { has: () => true },
            ["copy", "move"],
          ) ?? null}
        </output>
      );
    }

    render(() => (
      <Virtualizer
        layout={{}}
        getDropOperation={(_target, _types, allowed) =>
          allowed.includes("copy") ? "copy" : "cancel"
        }
      >
        <Consumer />
      </Virtualizer>
    ));

    expect(screen.getByTestId("drop-op").textContent).toBe("copy");
  });

  it("passes viewport width to layout drop-target options", () => {
    let capturedViewportWidth: unknown;
    const layout: VirtualizerLayout<Record<string, unknown>> = {
      getDropTargetFromPoint(_point, _itemCount, options) {
        capturedViewportWidth = options?.viewportWidth;
        return { type: "root", index: -1, position: "on" };
      },
    };

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext<Record<string, unknown>>());
      return (
        <output data-testid="viewport-width-option">
          {JSON.stringify(ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, 1) ?? null)}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={layout} style={{ width: "240px" }}>
        <Consumer />
      </Virtualizer>
    ));

    expect(screen.getByTestId("viewport-width-option").textContent).toContain('"type":"root"');
    expect(typeof capturedViewportWidth).toBe("number");
  });

  it("passes viewport width to layout visible-range and layout-info options", () => {
    let capturedRangeViewportWidth: unknown;
    let capturedLayoutViewportWidth: unknown;
    const layout: VirtualizerLayout<Record<string, unknown>> = {
      getVisibleRange(_ctx, options) {
        capturedRangeViewportWidth = options?.viewportWidth;
        return { start: 0, end: 1, offsetTop: 0, offsetBottom: 0 };
      },
      getLayoutInfo(index, _ctx, options) {
        capturedLayoutViewportWidth = options?.viewportWidth;
        return {
          key: String(index),
          index,
          rect: { x: 0, y: 0, width: 10, height: 10 },
        };
      },
    };

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext<Record<string, unknown>>());
      return (
        <output data-testid="viewport-width-range-layout">
          {JSON.stringify({
            range: ctx()?.getVisibleRange(1) ?? null,
            layoutInfo: ctx()?.getLayoutInfo(0) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={layout} style={{ width: "260px" }}>
        <Consumer />
      </Virtualizer>
    ));

    expect(screen.getByTestId("viewport-width-range-layout").textContent).toContain('"start":0');
    expect(typeof capturedRangeViewportWidth).toBe("number");
    expect(typeof capturedLayoutViewportWidth).toBe("number");
  });

  it("updates layout sizing when the virtualizer container is resized", async () => {
    let resizeCallback: ResizeObserverCallback | undefined;
    class TestResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      disconnect = vi.fn();
      unobserve = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", TestResizeObserver);
    let width = 120;
    let height = 80;
    const widthSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientWidth", "get")
      .mockImplementation(() => width);
    const heightSpy = vi
      .spyOn(window.HTMLElement.prototype, "clientHeight", "get")
      .mockImplementation(() => height);

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      return (
        <output data-testid="resized-layout">
          {JSON.stringify(ctx()?.getLayoutInfo(0) ?? null)}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}}>
        <Consumer />
      </Virtualizer>
    ));

    expect(screen.getByTestId("resized-layout").textContent).toContain('"width":120');

    width = 260;
    height = 100;
    resizeCallback?.([], {} as ResizeObserver);

    await waitFor(() => {
      expect(screen.getByTestId("resized-layout").textContent).toContain('"width":260');
    });

    widthSpy.mockRestore();
    heightSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("drop-target delegate falls back to sibling positions before root", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 5);
      return (
        <output data-testid="drop-fallback-target">
          {JSON.stringify(
            collection()?.dropTargetDelegate?.getDropTargetFromPoint(
              1,
              20,
              (target) => target.type === "item" && target.dropPosition !== "on",
            ) ?? null,
          )}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 40 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("drop-fallback-target").textContent || "{}");
    expect(parsed?.type).toBe("item");
    expect(["before", "after"]).toContain(parsed?.dropPosition);
  });

  it("keyboard delegate skips invalid on-targets and falls back to insertion/root targets", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 3);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-delegate">
          {JSON.stringify({
            insertion:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 0, dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition !== "on",
              ) ?? null,
            rootFallback:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 1, dropPosition: "on" },
                "next",
                (target) => target.type === "root",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-delegate").textContent || "{}");
    expect(parsed.insertion?.type).toBe("item");
    expect(["before", "after"]).toContain(parsed.insertion?.dropPosition);
    expect(parsed.rootFallback).toMatchObject({ type: "root" });
  });

  it("keyboard delegate transitions through same-item drop positions before advancing index", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 4);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-position-transitions">
          {JSON.stringify({
            nextFromBefore:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 1, dropPosition: "before" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            nextFromOn:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 1, dropPosition: "on" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromAfter:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "after" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
            previousFromOn:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-position-transitions").textContent || "{}",
    );
    expect(parsed.nextFromBefore).toMatchObject({ type: "item", key: 1, dropPosition: "on" });
    expect(parsed.nextFromOn).toMatchObject({ type: "item", key: 1, dropPosition: "after" });
    expect(parsed.previousFromAfter).toMatchObject({ type: "item", key: 2, dropPosition: "on" });
    expect(parsed.previousFromOn).toMatchObject({ type: "item", key: 2, dropPosition: "before" });
  });

  it("keyboard delegate falls back to opposite direction when forward scan has no valid targets", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 10);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-opposite-fallback">
          {JSON.stringify({
            nextFallback:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "next",
                (target) =>
                  target.type === "item" && target.dropPosition === "on" && Number(target.key) <= 4,
              ) ?? null,
            previousFallback:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 7, dropPosition: "on" },
                "previous",
                (target) =>
                  target.type === "item" && target.dropPosition === "on" && Number(target.key) >= 5,
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-opposite-fallback").textContent || "{}");
    expect(parsed.nextFallback).toMatchObject({ type: "item", key: 3, dropPosition: "on" });
    expect(parsed.previousFallback).toMatchObject({ type: "item", key: 6, dropPosition: "on" });
  });

  it("keyboard delegate prefers boundary insertion positions when starting from root", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 4);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-root-boundary-preference">
          {JSON.stringify({
            nextFromRoot:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "root" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromRoot:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "root" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-root-boundary-preference").textContent || "{}",
    );
    expect(parsed.nextFromRoot).toMatchObject({ type: "item", key: 0, dropPosition: "before" });
    expect(parsed.previousFromRoot).toMatchObject({ type: "item", key: 3, dropPosition: "after" });
  });

  it("keyboard delegate wraps to boundary insertion targets when moving past edges and root is invalid", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 4);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-wrap-boundary">
          {JSON.stringify({
            nextFromEnd:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 3, dropPosition: "after" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromStart:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 0, dropPosition: "before" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-wrap-boundary").textContent || "{}");
    expect(parsed.nextFromEnd).toMatchObject({ type: "item", key: 0, dropPosition: "before" });
    expect(parsed.previousFromStart).toMatchObject({ type: "item", key: 3, dropPosition: "after" });
  });

  it("keyboard page delegate advances by viewport-sized steps", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 100);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-delegate">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 0, dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            previous:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 50, dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 400 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-page-delegate").textContent || "{}");
    expect(parsed.next?.type).toBe("item");
    expect(parsed.next?.dropPosition).toBe("on");
    expect(Number(parsed.next?.key)).toBeGreaterThan(1);
    expect(parsed.previous?.type).toBe("item");
    expect(parsed.previous?.dropPosition).toBe("on");
    expect(Number(parsed.previous?.key)).toBeLessThan(49);
  });

  it("keyboard page delegate starts from list boundaries when target is null", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 8);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-null-target">
          {JSON.stringify({
            nextFromNull:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                null,
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromNull:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                null,
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 80 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-page-null-target").textContent || "{}");
    expect(parsed.nextFromNull).toMatchObject({ type: "item", key: 0, dropPosition: "before" });
    expect(parsed.previousFromNull).toMatchObject({ type: "item", key: 7, dropPosition: "after" });
  });

  it("keyboard delegates fall back to directional boundaries when target key is unmapped", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      return (
        <output data-testid="keyboard-unmapped-key">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "missing", dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            previous:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "missing", dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            pagePrevious:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: "missing", dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 40 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("keyboard-unmapped-key").textContent || "{}");
    expect(parsed.next).toMatchObject({ type: "item", key: 0, dropPosition: "on" });
    expect(parsed.previous).toMatchObject({ type: "item", key: 5, dropPosition: "on" });
    expect(parsed.pagePrevious).toMatchObject({ type: "item", key: 4, dropPosition: "on" });
  });

  it("keyboard delegate ignores same-item transitions for unmapped keys and rebases to real items", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      return (
        <output data-testid="keyboard-unmapped-transition-rebase">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "missing", dropPosition: "on" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previous:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "missing", dropPosition: "on" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 40 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-unmapped-transition-rebase").textContent || "{}",
    );
    expect(parsed.next).toMatchObject({ type: "item", key: 0 });
    expect(parsed.previous).toMatchObject({ type: "item", key: 5 });
    expect(parsed.next?.key).not.toBe("missing");
    expect(parsed.previous?.key).not.toBe("missing");
  });

  it("keyboard delegate does not treat numeric keys as indexes when resolver reports unmapped", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      ctx()?.setDropTargetIndexResolver(() => null);
      return (
        <output data-testid="keyboard-unmapped-numeric-key-rebase">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            previous:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            pageNext:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            pagePrevious:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 40 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-unmapped-numeric-key-rebase").textContent || "{}",
    );
    expect(parsed.next).toMatchObject({ type: "item", key: 0, dropPosition: "on" });
    expect(parsed.previous).toMatchObject({ type: "item", key: 5, dropPosition: "on" });
    expect(parsed.pageNext).toMatchObject({ type: "item", key: 1, dropPosition: "on" });
    expect(parsed.pagePrevious).toMatchObject({ type: "item", key: 4, dropPosition: "on" });
  });

  it("keyboard page delegate prefers boundary item targets before root on out-of-range jumps", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-boundary-targets">
          {JSON.stringify({
            nextFromLast:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 5, dropPosition: "on" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromMiddle:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 3, dropPosition: "on" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 240 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-page-boundary-targets").textContent || "{}",
    );
    expect(parsed.nextFromLast).toMatchObject({ type: "item", key: 5, dropPosition: "after" });
    expect(parsed.previousFromMiddle).toMatchObject({
      type: "item",
      key: 0,
      dropPosition: "before",
    });
  });

  it("keyboard page delegate falls back to root when paging above first item", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-root-above-first">
          {JSON.stringify(
            collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
              { type: "item", key: 0, dropPosition: "on" },
              "previous",
              (target) => target.type === "item" || target.type === "root",
            ) ?? null,
          )}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 240 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-page-root-above-first").textContent || "{}",
    );
    expect(parsed).toMatchObject({ type: "root" });
  });

  it("keyboard page delegate scans for valid targets when out-of-range boundary targets are invalid", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-out-of-range-fallback">
          {JSON.stringify({
            nextFromLast:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 5, dropPosition: "on" },
                "next",
                (target) =>
                  target.type === "item" && Number(target.key) <= 3 && target.dropPosition === "on",
              ) ?? null,
            previousFromFirst:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 0, dropPosition: "on" },
                "previous",
                (target) =>
                  target.type === "item" && Number(target.key) >= 2 && target.dropPosition === "on",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 240 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-page-out-of-range-fallback").textContent || "{}",
    );
    expect(parsed.nextFromLast).toMatchObject({ type: "item", key: 3, dropPosition: "on" });
    expect(parsed.previousFromFirst).toMatchObject({ type: "item", key: 2, dropPosition: "on" });
  });

  it("keyboard page delegate falls back to opposite direction when forward scan has no valid targets", () => {
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 10);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="keyboard-page-opposite-fallback">
          {JSON.stringify({
            nextFallback:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 2, dropPosition: "on" },
                "next",
                (target) =>
                  target.type === "item" && target.dropPosition === "on" && Number(target.key) <= 4,
              ) ?? null,
            previousFallback:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: 7, dropPosition: "on" },
                "previous",
                (target) =>
                  target.type === "item" && target.dropPosition === "on" && Number(target.key) >= 5,
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20, viewportSize: 80 }}>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("keyboard-page-opposite-fallback").textContent || "{}",
    );
    expect(parsed.nextFallback).toMatchObject({ type: "item", key: 4, dropPosition: "on" });
    expect(parsed.previousFallback).toMatchObject({ type: "item", key: 5, dropPosition: "on" });
  });

  it("renders only visible range for listbox when virtualized", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 100 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <ListBox aria-label="Virtualized list" items={items} getKey={(item) => item.id}>
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Virtualizer>
    ));

    expect(screen.getByText("Item 0")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.queryByText("Item 5")).not.toBeInTheDocument();

    const container = document.querySelector("[data-virtualizer]") as HTMLDivElement;
    container.scrollTop = 80;
    fireEvent.scroll(container);

    expect(screen.getByText("Item 4")).toBeInTheDocument();
    expect(screen.getByText("Item 6")).toBeInTheDocument();
    expect(screen.queryByText("Item 0")).not.toBeInTheDocument();
  });

  it("keeps section header visible when virtual range starts inside the same tree section", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const sectionedTreeItems = [
      {
        key: "section-a",
        title: "Section A",
        items: [
          { key: "a-0", value: { label: "A 0" }, textValue: "A 0" },
          { key: "a-1", value: { label: "A 1" }, textValue: "A 1" },
          { key: "a-2", value: { label: "A 2" }, textValue: "A 2" },
        ],
      },
      {
        key: "section-b",
        title: "Section B",
        items: [
          { key: "b-0", value: { label: "B 0" }, textValue: "B 0" },
          { key: "b-1", value: { label: "B 1" }, textValue: "B 1" },
        ],
      },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <Tree aria-label="Sectioned virtual tree" items={sectionedTreeItems as any}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.getByRole("rowheader", { name: "Section A" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Section B" })).not.toBeInTheDocument();

    const container = document.querySelector("[data-virtualizer]") as HTMLDivElement;
    container.scrollTop = 20;
    fireEvent.scroll(container);

    expect(screen.getByRole("rowheader", { name: "Section A" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Section B" })).not.toBeInTheDocument();
  });

  it("updates tree section headers when scrolling across section boundaries", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const sectionedTreeItems = [
      {
        key: "section-a",
        title: "Section A",
        items: [
          { key: "a-0", value: { label: "A 0" }, textValue: "A 0" },
          { key: "a-1", value: { label: "A 1" }, textValue: "A 1" },
          { key: "a-2", value: { label: "A 2" }, textValue: "A 2" },
        ],
      },
      {
        key: "section-b",
        title: "Section B",
        items: [
          { key: "b-0", value: { label: "B 0" }, textValue: "B 0" },
          { key: "b-1", value: { label: "B 1" }, textValue: "B 1" },
          { key: "b-2", value: { label: "B 2" }, textValue: "B 2" },
        ],
      },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <Tree aria-label="Section boundary virtual tree" items={sectionedTreeItems as any}>
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.getByRole("rowheader", { name: "Section A" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Section B" })).not.toBeInTheDocument();

    const container = document.querySelector("[data-virtualizer]") as HTMLDivElement;
    container.scrollTop = 60;
    fireEvent.scroll(container);

    expect(screen.getByRole("rowheader", { name: "Section B" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Section A" })).not.toBeInTheDocument();
  });

  it("retains focused item in virtualized listbox when no drop target is active", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <ListBox aria-label="Focused retention list" items={items} getKey={(item) => item.id}>
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Virtualizer>
    ));

    const listbox = screen.getByRole("listbox");
    fireEvent.focus(listbox);
    fireEvent.keyDown(listbox, { key: "End" });

    expect(screen.getByText("Item 119")).toBeInTheDocument();
  });

  it("retains far active drop target in virtualized listbox when bounded retention is enabled", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    const dropState = {
      isDropTarget: true,
      target: { type: "item" as const, key: "item-100", dropPosition: "before" as const },
      isDisabled: false,
      setTarget: () => {},
      isAccepted: () => true,
      enterTarget: () => {},
      moveToTarget: () => {},
      exitTarget: () => {},
      activateTarget: () => {},
      drop: () => {},
      shouldAcceptItemDrop: () => true,
      getDropOperation: () => "move" as const,
    };
    const dragAndDropHooks = {
      useDroppableCollectionState: () => dropState,
      useDroppableCollection: () => ({ collectionProps: {} }),
      dropTargetDelegate: {
        getDropTargetFromPoint: () => null,
      },
    };

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <ListBox
          aria-label="Drop target retention list"
          items={items}
          getKey={(item) => item.id}
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Virtualizer>
    ));

    expect(screen.getByText("Item 100")).toBeInTheDocument();
    expect(screen.queryByText("Item 115")).not.toBeInTheDocument();
  });

  it("reuses visible range result when scroll stays within same item window", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));
    let renderCalls = 0;

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <ListBox aria-label="Stable window list" items={items} getKey={(item) => item.id}>
          {(item) => {
            renderCalls += 1;
            return <ListBoxOption id={item.id}>{item.label}</ListBoxOption>;
          }}
        </ListBox>
      </Virtualizer>
    ));

    const initialRenderCalls = renderCalls;
    const container = document.querySelector("[data-virtualizer]") as HTMLDivElement;
    container.scrollTop = 5;
    fireEvent.scroll(container);

    expect(renderCalls).toBe(initialRenderCalls);
  });

  it("uses custom layout getVisibleRange when provided", () => {
    const calls: Array<{
      itemCount: number;
      scrollOffset: number;
      viewportSize: number;
      overscan: number;
    }> = [];
    const layout: VirtualizerLayout = {
      getVisibleRange(ctx) {
        calls.push(ctx);
        return {
          start: 10,
          end: 11,
          offsetTop: 200,
          offsetBottom: 0,
        };
      },
    };
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={layout}
        layoutOptions={{ viewportSize: 60 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <ListBox aria-label="Custom layout list" items={items} getKey={(item) => item.id}>
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Virtualizer>
    ));

    expect(screen.getByText("Item 10")).toBeInTheDocument();
    expect(screen.queryByText("Item 0")).not.toBeInTheDocument();
    expect(calls.length).toBeGreaterThan(0);
  });

  it("grid layout computes range by rows and columns", () => {
    const layout = new GridLayout();
    const range = layout.getVisibleRange(
      { itemCount: 100, scrollOffset: 80, viewportSize: 60, overscan: 0 },
      { rowHeight: 20, columnCount: 4 },
    );
    expect(range.start).toBe(16);
    expect(range.end).toBe(28);
    expect(range.offsetTop).toBe(80);
  });

  it("grid layout drop targeting uses viewport width for column mapping", () => {
    const layout = new GridLayout();
    const left = layout.getDropTargetFromPoint({ x: 10, y: 10 }, 8, {
      rowHeight: 20,
      columnCount: 2,
      viewportWidth: 200,
    });
    const right = layout.getDropTargetFromPoint({ x: 150, y: 10 }, 8, {
      rowHeight: 20,
      columnCount: 2,
      viewportWidth: 200,
    });
    expect(left).toMatchObject({ type: "item", index: 0 });
    expect(right).toMatchObject({ type: "item", index: 1 });
  });

  it("grid layout drop targets clamp to before-first and after-last at boundaries", () => {
    const layout = new GridLayout();
    const before = layout.getDropTargetFromPoint({ x: 0, y: -5 }, 6, {
      rowHeight: 20,
      columnCount: 2,
      viewportWidth: 200,
    });
    const after = layout.getDropTargetFromPoint({ x: 0, y: 200 }, 6, {
      rowHeight: 20,
      columnCount: 2,
      viewportWidth: 200,
    });
    expect(before).toMatchObject({ type: "item", index: 0, position: "before" });
    expect(after).toMatchObject({ type: "item", index: 5, position: "after" });
  });

  it("list layout drop targets clamp to before-first and after-last at boundaries", () => {
    const layout = new ListLayout();
    const before = layout.getDropTargetFromPoint({ x: 0, y: -10 }, 4, { itemSize: 20 });
    const after = layout.getDropTargetFromPoint({ x: 0, y: 200 }, 4, { itemSize: 20 });
    expect(before).toMatchObject({ type: "item", index: 0, position: "before" });
    expect(after).toMatchObject({ type: "item", index: 3, position: "after" });
  });

  it("propagates virtualized drop indicator renderer into listbox flow", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`drop-${position}-${index}`} />
        )}
      >
        <ListBox aria-label="DnD virtualized list" items={items} getKey={(item) => item.id}>
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Virtualizer>
    ));

    expect(screen.getByTestId("drop-before-0")).toBeInTheDocument();
    expect(screen.getByTestId("drop-on-0")).toBeInTheDocument();
    expect(screen.getByTestId("drop-after-1")).toBeInTheDocument();
    expect(screen.queryByTestId("drop-before-4")).not.toBeInTheDocument();
  });

  it("propagates drop indicator renderer into sectioned listbox flow", () => {
    const items = [
      {
        key: "sec-a",
        title: "Section A",
        items: [
          { id: "item-0", label: "Item 0" },
          { id: "item-1", label: "Item 1" },
        ],
      },
      {
        key: "sec-b",
        title: "Section B",
        items: [{ id: "item-2", label: "Item 2" }],
      },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`section-drop-${position}-${index}`} />
        )}
      >
        <ListBox aria-label="Sectioned DnD list" items={items as unknown[]}>
          {(item) => (
            <ListBoxOption id={(item as { id: string }).id}>
              {(item as { label: string }).label}
            </ListBoxOption>
          )}
        </ListBox>
      </Virtualizer>
    ));

    expect(screen.getByTestId("section-drop-before-0")).toBeInTheDocument();
    expect(screen.getByTestId("section-drop-on-0")).toBeInTheDocument();
    expect(screen.getByTestId("section-drop-after-2")).toBeInTheDocument();
  });

  it("enriches listbox drop targets with item key metadata", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const target = createMemo(
        () => ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, items.length) ?? null,
      );
      return <output data-testid="listbox-target">{JSON.stringify(target())}</output>;
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <ListBox aria-label="Listbox drop metadata" items={items} getKey={(item) => item.id}>
            {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
          </ListBox>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const target = JSON.parse(screen.getByTestId("listbox-target").textContent || "{}");
    expect(target.index).toBe(0);
    expect(target.key).toBe("item-0");
  });

  it("enriches sectioned listbox drop targets with item key metadata", () => {
    const items = [
      {
        key: "sec-a",
        title: "Section A",
        items: [
          { id: "item-0", label: "Item 0" },
          { id: "item-1", label: "Item 1" },
        ],
      },
      {
        key: "sec-b",
        title: "Section B",
        items: [{ id: "item-2", label: "Item 2" }],
      },
    ];

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const target = createMemo(() => ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, 3) ?? null);
      return <output data-testid="section-listbox-target">{JSON.stringify(target())}</output>;
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <ListBox aria-label="Sectioned listbox drop metadata" items={items as unknown[]}>
            {(item) => (
              <ListBoxOption id={(item as { id: string }).id}>
                {(item as { label: string }).label}
              </ListBoxOption>
            )}
          </ListBox>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const target = JSON.parse(screen.getByTestId("section-listbox-target").textContent || "{}");
    expect(target.index).toBe(0);
    expect(target.key).toBe("item-0");
  });

  it("sectioned listbox keyboard page delegate resolves item targets across groups", () => {
    const items = [
      {
        key: "fruits",
        title: "Fruits",
        items: [
          { id: "apple", label: "Apple" },
          { id: "banana", label: "Banana" },
        ],
      },
      {
        key: "vegetables",
        title: "Vegetables",
        items: [
          { id: "carrot", label: "Carrot" },
          { id: "daikon", label: "Daikon" },
        ],
      },
    ];

    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="sectioned-listbox-keyboard-page">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: "apple", dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            previousFallback:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: "carrot", dropPosition: "on" },
                "previous",
                (target) =>
                  target.type === "item" && target.dropPosition === "on" && target.key !== "banana",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <ListBox aria-label="Sectioned keyboard delegate listbox" items={items as unknown[]}>
            {(item) => (
              <ListBoxOption id={(item as { id: string }).id}>
                {(item as { label: string }).label}
              </ListBoxOption>
            )}
          </ListBox>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("sectioned-listbox-keyboard-page").textContent || "{}",
    );
    expect(parsed.next).toMatchObject({ type: "item", key: "carrot", dropPosition: "on" });
    expect(parsed.previousFallback).toMatchObject({
      type: "item",
      key: "apple",
      dropPosition: "on",
    });
  });

  it("virtualizes GridList item rendering", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Grid ${i}` }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <GridList items={items} getKey={(item) => item.id} aria-label="Virtualized grid list">
          {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
        </GridList>
      </Virtualizer>
    ));

    expect(screen.getByText("Grid 0")).toBeInTheDocument();
    expect(screen.getByText("Grid 1")).toBeInTheDocument();
    expect(screen.queryByText("Grid 5")).not.toBeInTheDocument();
  });

  it("retains focused item in virtualized gridlist when no drop target is active", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({ id: i, name: `Grid ${i}` }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <GridList items={items} getKey={(item) => item.id} aria-label="Focused retention grid">
          {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
        </GridList>
      </Virtualizer>
    ));

    const grid = screen.getByRole("grid");
    fireEvent.focus(grid);
    fireEvent.keyDown(grid, { key: "End" });

    expect(screen.getByText("Grid 119")).toBeInTheDocument();
  });

  it("retains far active drop target in virtualized gridlist when bounded retention is enabled", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({ id: i, name: `Grid ${i}` }));

    const dropState = {
      isDropTarget: true,
      target: { type: "item" as const, key: 100, dropPosition: "before" as const },
      isDisabled: false,
      setTarget: () => {},
      isAccepted: () => true,
      enterTarget: () => {},
      moveToTarget: () => {},
      exitTarget: () => {},
      activateTarget: () => {},
      drop: () => {},
      shouldAcceptItemDrop: () => true,
      getDropOperation: () => "move" as const,
    };
    const dragAndDropHooks = {
      useDroppableCollectionState: () => dropState,
      useDroppableCollection: () => ({ collectionProps: {} }),
      dropTargetDelegate: {
        getDropTargetFromPoint: () => null,
      },
    };

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <GridList
          items={items}
          getKey={(item) => item.id}
          aria-label="Drop target retention grid"
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
        </GridList>
      </Virtualizer>
    ));

    expect(screen.getByText("Grid 100")).toBeInTheDocument();
    expect(screen.queryByText("Grid 115")).not.toBeInTheDocument();
  });

  it("enriches gridlist drop targets with item key metadata", () => {
    const items = Array.from({ length: 6 }, (_, i) => ({ id: i, name: `Grid ${i}` }));

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const target = createMemo(
        () => ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, items.length) ?? null,
      );
      return <output data-testid="grid-target">{JSON.stringify(target())}</output>;
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <GridList items={items} getKey={(item) => item.id} aria-label="Grid drop metadata">
            {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
          </GridList>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const target = JSON.parse(screen.getByTestId("grid-target").textContent || "{}");
    expect(target.index).toBe(0);
    expect(target.key).toBe(0);
  });

  it("virtualizes Table body rows", () => {
    const columns = [{ key: "name", name: "Name" }];
    const items = Array.from({ length: 30 }, (_, i) => ({ id: i, name: `Row ${i}` }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <Table
          items={items}
          columns={columns}
          getKey={(item) => item.id}
          aria-label="Virtualized table"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </Virtualizer>
    ));

    expect(screen.getByText("Row 0")).toBeInTheDocument();
    expect(screen.getByText("Row 1")).toBeInTheDocument();
    expect(screen.queryByText("Row 6")).not.toBeInTheDocument();
  });

  it("enriches table drop targets with row key metadata", () => {
    const columns = [{ key: "name", name: "Name" }];
    const items = Array.from({ length: 6 }, (_, i) => ({ id: i, name: `Row ${i}` }));

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const target = createMemo(
        () => ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, items.length) ?? null,
      );
      return <output data-testid="table-target">{JSON.stringify(target())}</output>;
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <Table
            items={items}
            columns={columns}
            getKey={(item) => item.id}
            aria-label="Table drop metadata"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody>
                  {(item) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const target = JSON.parse(screen.getByTestId("table-target").textContent || "{}");
    expect(target.index).toBe(0);
    expect(target.key).toBe(0);
  });

  it("virtualizes Tree visible rows", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      key: `node-${i}`,
      value: { name: `Node ${i}` },
      textValue: `Node ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <Tree items={items} aria-label="Virtualized tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.getByText("Node 0")).toBeInTheDocument();
    expect(screen.getByText("Node 1")).toBeInTheDocument();
    expect(screen.queryByText("Node 6")).not.toBeInTheDocument();
  });

  it("retains focused item in virtualized tree when no drop target is active", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({
      key: `node-${i}`,
      value: { name: `Node ${i}` },
      textValue: `Node ${i}`,
    }));

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <Tree items={items} aria-label="Focused retention tree">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    const tree = screen.getByRole("treegrid");
    fireEvent.focus(tree);
    fireEvent.keyDown(tree, { key: "End" });

    expect(screen.getByText("Node 119")).toBeInTheDocument();
  });

  it("retains far active drop target in virtualized tree when bounded retention is enabled", () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});

    const items = Array.from({ length: 120 }, (_, i) => ({
      key: `node-${i}`,
      value: { name: `Node ${i}` },
      textValue: `Node ${i}`,
    }));

    const dropState = {
      isDropTarget: true,
      target: { type: "item" as const, key: "node-100", dropPosition: "before" as const },
      isDisabled: false,
      setTarget: () => {},
      isAccepted: () => true,
      enterTarget: () => {},
      moveToTarget: () => {},
      exitTarget: () => {},
      activateTarget: () => {},
      drop: () => {},
      shouldAcceptItemDrop: () => true,
      getDropOperation: () => "move" as const,
    };
    const dragAndDropHooks = {
      useDroppableCollectionState: () => dropState,
      useDroppableCollection: () => ({ collectionProps: {} }),
      dropTargetDelegate: {
        getDropTargetFromPoint: () => null,
      },
    };

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 60, overscan: 0 }}
        style={{ height: "60px", overflow: "auto" }}
      >
        <Tree
          items={items}
          aria-label="Drop target retention tree"
          dragAndDropHooks={dragAndDropHooks as any}
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.getByText("Node 100")).toBeInTheDocument();
    expect(screen.queryByText("Node 115")).not.toBeInTheDocument();
  });

  it("enriches tree drop targets with hierarchical metadata", () => {
    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [{ key: "child", value: { name: "Child" }, textValue: "Child" }],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const target = createMemo(() => ctx()?.getDropTargetFromPoint({ x: 1, y: 1 }, 3) ?? null);
      return <output data-testid="tree-target">{JSON.stringify(target())}</output>;
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 80, overscan: 0 }}
        style={{ height: "80px", overflow: "auto" }}
      >
        <>
          <Tree items={items} defaultExpandedKeys={["parent"]} aria-label="Tree drop metadata">
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const target = JSON.parse(screen.getByTestId("tree-target").textContent || "{}");
    expect(target.index).toBe(0);
    expect(target.key).toBe("parent");
    expect(target.parentKey).toBeNull();
    expect(target.level).toBe(0);
  });

  it("virtualized tree keyboard delegate rebases hidden child keys to visible rows", () => {
    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [{ key: "child", value: { name: "Child" }, textValue: "Child" }],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="tree-hidden-keyboard-rebase">
          {JSON.stringify({
            next:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "child", dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            previous:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "child", dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            pageNext:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: "child", dropPosition: "on" },
                "next",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
            pagePrevious:
              collection()?.dropTargetDelegate?.getKeyboardPageNavigationTarget?.(
                { type: "item", key: "child", dropPosition: "on" },
                "previous",
                (target) => target.type === "item" && target.dropPosition === "on",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 40, overscan: 0 }}
        style={{ height: "40px", overflow: "auto" }}
      >
        <>
          <Tree items={items} aria-label="Tree hidden keyboard key">
            {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
          </Tree>
          <Consumer />
        </>
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("tree-hidden-keyboard-rebase").textContent || "{}",
    );
    expect(parsed.next).toMatchObject({ type: "item", key: "parent", dropPosition: "on" });
    expect(parsed.previous).toMatchObject({ type: "item", key: "sibling", dropPosition: "on" });
    expect(parsed.pageNext).toMatchObject({ type: "item", key: "sibling", dropPosition: "on" });
    expect(parsed.pagePrevious).toMatchObject({ type: "item", key: "parent", dropPosition: "on" });
  });

  it("renders tree after-drop indicators at branch boundaries only", () => {
    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [{ key: "child", value: { name: "Child" }, textValue: "Child" }],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 80, overscan: 0 }}
        style={{ height: "80px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`tree-drop-${position}-${index}`} />
        )}
      >
        <Tree items={items} defaultExpandedKeys={["parent"]} aria-label="Tree DnD indicators">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.queryByTestId("tree-drop-after-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("tree-drop-after-1")).toBeInTheDocument();
    expect(screen.getByTestId("tree-drop-after-2")).toBeInTheDocument();
  });

  it("skips duplicate tree after-drop indicators for same-level siblings", () => {
    const items = [
      { key: "a", value: { name: "A" }, textValue: "A" },
      { key: "b", value: { name: "B" }, textValue: "B" },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 80, overscan: 0 }}
        style={{ height: "80px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`tree-flat-drop-${position}-${index}`} />
        )}
      >
        <Tree items={items} aria-label="Flat tree indicators">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.queryByTestId("tree-flat-drop-after-0")).not.toBeInTheDocument();
    expect(screen.getByTestId("tree-flat-drop-after-1")).toBeInTheDocument();
  });

  it("renders ancestor chain after-drop indicators when closing deep branch", () => {
    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [
          {
            key: "child",
            value: { name: "Child" },
            textValue: "Child",
            children: [
              { key: "grandchild", value: { name: "Grandchild" }, textValue: "Grandchild" },
            ],
          },
        ],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 120, overscan: 0 }}
        style={{ height: "120px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`tree-deep-drop-${position}-${index}`} />
        )}
      >
        <Tree
          items={items}
          defaultExpandedKeys={["parent", "child"]}
          aria-label="Deep tree indicators"
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    expect(screen.getByTestId("tree-deep-drop-after-2")).toBeInTheDocument();
    expect(screen.getByTestId("tree-deep-drop-after-1")).toBeInTheDocument();
    expect(screen.queryByTestId("tree-deep-drop-after-0")).not.toBeInTheDocument();
  });

  it("does not render offscreen ancestor after-drop indicators in virtualized tree window", () => {
    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [
          {
            key: "child",
            value: { name: "Child" },
            textValue: "Child",
            children: [
              { key: "grandchild", value: { name: "Grandchild" }, textValue: "Grandchild" },
            ],
          },
        ],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer
        layout={{}}
        layoutOptions={{ itemSize: 20, viewportSize: 20, overscan: 0 }}
        style={{ height: "20px", overflow: "auto" }}
        renderDropIndicator={(index, position) => (
          <li role="presentation" data-testid={`tree-offscreen-drop-${position}-${index}`} />
        )}
      >
        <Tree
          items={items}
          defaultExpandedKeys={["parent", "child"]}
          aria-label="Deep tree offscreen indicators"
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
      </Virtualizer>
    ));

    const container = document.querySelector("[data-virtualizer]") as HTMLDivElement;
    fireEvent.scroll(container, { target: { scrollTop: 40 } }); // center grandchild row

    // Current row indicator remains.
    expect(screen.getByTestId("tree-offscreen-drop-after-2")).toBeInTheDocument();
    // Ancestor row is offscreen and should not be in current virtual window.
    expect(screen.queryByTestId("tree-offscreen-drop-after-1")).not.toBeInTheDocument();
  });

  it("tree keyboard DnD navigates into expanded children from parent on-position", () => {
    // RAC parity: from parent 'on', next should go to first child 'before'
    // when the parent is expanded (tree branch boundary wrapping).
    // Tree installs its keyboard nav override into the Virtualizer context.
    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="tree-keyboard-dnd-into-children">
          {JSON.stringify({
            nextFromParentOn:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "parent", dropPosition: "on" },
                "next",
                () => true,
              ) ?? null,
          })}
        </output>
      );
    }

    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [
          { key: "child-1", value: { name: "Child 1" }, textValue: "Child 1" },
          { key: "child-2", value: { name: "Child 2" }, textValue: "Child 2" },
        ],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Tree items={items} defaultExpandedKeys={["parent"]} aria-label="Tree DnD keyboard test">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("tree-keyboard-dnd-into-children").textContent || "{}",
    );
    // When parent is expanded, next from 'on' goes to first child
    expect(parsed.nextFromParentOn).toMatchObject({
      type: "item",
      key: "child-1",
      dropPosition: "before",
    });
  });

  it("tree keyboard DnD traverses up to parent sibling from last child after-position", () => {
    // RAC parity: from last child 'after', next should traverse up to parent's next sibling
    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="tree-keyboard-dnd-exit-branch">
          {JSON.stringify({
            nextFromLastChildAfter:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "child-2", dropPosition: "after" },
                "next",
                () => true,
              ) ?? null,
          })}
        </output>
      );
    }

    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [
          { key: "child-1", value: { name: "Child 1" }, textValue: "Child 1" },
          { key: "child-2", value: { name: "Child 2" }, textValue: "Child 2" },
        ],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Tree items={items} defaultExpandedKeys={["parent"]} aria-label="Tree DnD exit branch test">
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("tree-keyboard-dnd-exit-branch").textContent || "{}",
    );
    // From last child 'after', next navigates to sibling 'before'
    expect(parsed.nextFromLastChildAfter).toMatchObject({
      type: "item",
      key: "sibling",
      dropPosition: "before",
    });
  });

  it("tree keyboard DnD previous from child goes to deepest last expanded descendant", () => {
    // RAC parity: previous from 'before' goes to deepest expanded child of previous item
    function Consumer(): JSX.Element {
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      return (
        <output data-testid="tree-keyboard-dnd-previous-deep">
          {JSON.stringify({
            previousFromSiblingBefore:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: "sibling", dropPosition: "before" },
                "previous",
                () => true,
              ) ?? null,
          })}
        </output>
      );
    }

    const items = [
      {
        key: "parent",
        value: { name: "Parent" },
        textValue: "Parent",
        children: [
          { key: "child-1", value: { name: "Child 1" }, textValue: "Child 1" },
          { key: "child-2", value: { name: "Child 2" }, textValue: "Child 2" },
        ],
      },
      { key: "sibling", value: { name: "Sibling" }, textValue: "Sibling" },
    ];

    render(() => (
      <Virtualizer layout={{}} layoutOptions={{ itemSize: 20 }}>
        <Tree
          items={items}
          defaultExpandedKeys={["parent"]}
          aria-label="Tree DnD previous deep test"
        >
          {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
        </Tree>
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(
      screen.getByTestId("tree-keyboard-dnd-previous-deep").textContent || "{}",
    );
    // Previous from sibling 'before' should go to child-2 'after' (deepest last child of parent)
    expect(parsed.previousFromSiblingBefore).toMatchObject({
      type: "item",
      key: "child-2",
      dropPosition: "after",
    });
  });

  it("grid keyboard DnD wraps to boundary targets at collection edges", () => {
    // Grid boundary wrapping: from last item 'after', next wraps to first item 'before'
    function Consumer(): JSX.Element {
      const ctx = createMemo(() => useVirtualizerContext());
      const collection = createMemo(() => useCollectionRenderer<unknown>());
      ctx()?.setDropTargetItemCountResolver(() => 6);
      ctx()?.setDropTargetIndexResolver((key) => Number(key));
      return (
        <output data-testid="grid-keyboard-dnd-wrap">
          {JSON.stringify({
            nextFromLastAfter:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 5, dropPosition: "after" },
                "next",
                (target) => target.type === "item",
              ) ?? null,
            previousFromFirstBefore:
              collection()?.dropTargetDelegate?.getKeyboardNavigationTarget?.(
                { type: "item", key: 0, dropPosition: "before" },
                "previous",
                (target) => target.type === "item",
              ) ?? null,
          })}
        </output>
      );
    }

    render(() => (
      <Virtualizer
        layout={GridLayout}
        layoutOptions={{ itemSize: 40, columns: 3, viewportWidth: 300 }}
      >
        <Consumer />
      </Virtualizer>
    ));

    const parsed = JSON.parse(screen.getByTestId("grid-keyboard-dnd-wrap").textContent || "{}");
    // From last item 'after', next wraps to first item 'before'
    expect(parsed.nextFromLastAfter).toMatchObject({
      type: "item",
      key: 0,
      dropPosition: "before",
    });
    // From first item 'before', previous wraps to last item 'after'
    expect(parsed.previousFromFirstBefore).toMatchObject({
      type: "item",
      key: 5,
      dropPosition: "after",
    });
  });
});
