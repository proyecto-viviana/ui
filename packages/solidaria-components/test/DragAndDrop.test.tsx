/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import {
  DragAndDropContext,
  DropIndicator,
  DropIndicatorContext,
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useRenderDropIndicator,
  useDndPersistedKeys,
} from "../src/DragAndDrop";

describe("DragAndDrop parity primitives", () => {
  it("DropIndicator marks active drop target", () => {
    render(() => (
      <DragAndDropContext.Provider
        value={{
          dropState: {
            isDropTarget: (target) => target.type === "item" && target.key === "a",
          },
        }}
      >
        <DropIndicator target={{ type: "item", key: "a", dropPosition: "before" }} />
      </DragAndDropContext.Provider>
    ));

    const indicator = screen.getByRole("option");
    expect(indicator).toHaveAttribute("data-drop-target");
  });

  it("DropIndicatorContext can override rendering", () => {
    render(() => (
      <DropIndicatorContext.Provider
        value={{
          render: () => <div data-testid="custom-indicator" />,
        }}
      >
        <DropIndicator target={{ type: "item", key: "a", dropPosition: "before" }} />
      </DropIndicatorContext.Provider>
    ));

    expect(screen.getByTestId("custom-indicator")).toBeInTheDocument();
  });

  it("useDndPersistedKeys returns focused and virtual drop-target keys", () => {
    function Probe() {
      const keys = useDndPersistedKeys(
        { focusedKey: "focused" },
        { isVirtualDragging: () => true },
        { target: { type: "item", key: "drop", dropPosition: "before" } },
      );
      return (
        <output data-testid="persisted-keys">{JSON.stringify(Array.from(keys()).sort())}</output>
      );
    }

    render(() => <Probe />);
    expect(screen.getByTestId("persisted-keys").textContent).toBe('["drop","focused"]');
  });

  it("useDndPersistedKeys normalizes after-target to next non-descendant item key", () => {
    const collection = {
      getKeyAfter(key: string | number) {
        const order = ["a", "a-1", "a-2", "b"];
        const index = order.indexOf(String(key));
        return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
      },
      getItem(key: string | number) {
        const levels: Record<string, number> = {
          a: 0,
          "a-1": 1,
          "a-2": 1,
          b: 0,
        };
        if (!(String(key) in levels)) return null;
        return { type: "item", level: levels[String(key)] };
      },
    };

    function Probe() {
      const keys = useDndPersistedKeys(
        { focusedKey: null },
        { isVirtualDragging: () => true },
        { target: { type: "item", key: "a", dropPosition: "after" } },
        collection,
      );
      return (
        <output data-testid="normalized-after-key">{JSON.stringify(Array.from(keys()))}</output>
      );
    }

    render(() => <Probe />);
    expect(screen.getByTestId("normalized-after-key").textContent).toBe('["b"]');
  });

  it("mergePersistedKeysIntoVirtualRange keeps nearby persisted keys in range", () => {
    const range = mergePersistedKeysIntoVirtualRange(
      { start: 10, end: 20, offsetTop: 400, offsetBottom: 3200 },
      [2, 16],
      100,
      {
        getLayoutInfo: (index) => ({
          rect: {
            y: index * 40,
            height: 40,
          },
        }),
      },
      20,
    );

    expect(range.start).toBe(2);
    expect(range.end).toBe(20);
  });

  it("mergePersistedKeysIntoVirtualRange skips very distant persisted keys when expansion budget is exceeded", () => {
    const range = mergePersistedKeysIntoVirtualRange(
      { start: 50, end: 60, offsetTop: 2000, offsetBottom: 1600 },
      [0, 58],
      1000,
      {
        getLayoutInfo: (index) => ({
          rect: {
            y: index * 40,
            height: 40,
          },
        }),
      },
      8,
    );

    expect(range.start).toBe(50);
    expect(range.end).toBe(60);
  });

  it("mergePersistedKeysIntoVirtualRange can force include prioritized indexes with a larger cap", () => {
    const range = mergePersistedKeysIntoVirtualRange(
      { start: 50, end: 60, offsetTop: 2000, offsetBottom: 1600 },
      [58],
      1000,
      {
        getLayoutInfo: (index) => ({
          rect: {
            y: index * 40,
            height: 40,
          },
        }),
      },
      8,
      {
        forceIncludeIndexes: [0],
        forceIncludeMaxSpan: 80,
      },
    );

    expect(range.start).toBe(0);
    expect(range.end).toBe(60);
  });

  it("mergePersistedKeysIntoVirtualRange recenters to include forced indexes when direct merge would exceed cap", () => {
    const range = mergePersistedKeysIntoVirtualRange(
      { start: 900, end: 940, offsetTop: 36000, offsetBottom: 2400 },
      [],
      1000,
      {
        getLayoutInfo: (index) => ({
          rect: {
            y: index * 40,
            height: 40,
          },
        }),
      },
      20,
      {
        forceIncludeIndexes: [40],
        forceIncludeMaxSpan: 120,
      },
    );

    expect(range.start).toBeLessThanOrEqual(40);
    expect(range.end).toBeGreaterThan(40);
    expect(range.end - range.start).toBeLessThanOrEqual(120);
  });

  it("getNormalizedDropTargetKey normalizes after drop targets using collection boundaries", () => {
    const collection = {
      getKeyAfter(key: string | number) {
        const order = ["a", "a-1", "a-2", "b"];
        const index = order.indexOf(String(key));
        return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
      },
      getItem(key: string | number) {
        const levels: Record<string, number> = {
          a: 0,
          "a-1": 1,
          "a-2": 1,
          b: 0,
        };
        if (!(String(key) in levels)) return null;
        return { type: "item", level: levels[String(key)] };
      },
    };

    const normalized = getNormalizedDropTargetKey(
      { type: "item", key: "a", dropPosition: "after" },
      collection,
    );

    expect(normalized).toBe("b");
  });

  it("mergePersistedKeysIntoVirtualRange prioritizes forced indexes by provided order", () => {
    const range = mergePersistedKeysIntoVirtualRange(
      { start: 90, end: 110, offsetTop: 3600, offsetBottom: 35600 },
      [],
      1000,
      {
        getLayoutInfo: (index) => ({
          rect: {
            y: index * 40,
            height: 40,
          },
        }),
      },
      20,
      {
        forceIncludeIndexes: [900, 100],
        forceIncludeMaxSpan: 120,
      },
    );

    // Drop target-like forced index (first) wins over closer focused-like index.
    expect(range.start).toBeLessThanOrEqual(900);
    expect(range.end).toBeGreaterThan(900);
  });

  it("useRenderDropIndicator renders during virtual dragging even when target is not active", () => {
    function Probe() {
      const renderDropIndicator = useRenderDropIndicator(
        {
          isVirtualDragging: () => true,
          useDropIndicator: () => ({
            dropIndicatorProps: {},
            isDropTarget: false,
            isHidden: true,
          }),
        },
        { isDropTarget: () => false },
      );
      return (
        <div data-testid="virtual-drag-indicator">
          {renderDropIndicator?.({ type: "item", key: "x", dropPosition: "before" }) ?? null}
        </div>
      );
    }

    render(() => <Probe />);
    expect(
      screen.getByTestId("virtual-drag-indicator").querySelector('[role="option"]'),
    ).toBeTruthy();
  });

  it("useRenderDropIndicator uses hook-provided renderer when available", () => {
    function Probe() {
      const renderDropIndicator = useRenderDropIndicator(
        {
          renderDropIndicator: (target) => <div data-testid={`custom-${target.key}`} />,
          isVirtualDragging: () => true,
          useDropIndicator: () => ({
            dropIndicatorProps: {},
            isDropTarget: false,
            isHidden: true,
          }),
        },
        { isDropTarget: () => false },
      );
      return (
        <div>
          {renderDropIndicator?.({ type: "item", key: "x", dropPosition: "before" }) ?? null}
        </div>
      );
    }

    render(() => <Probe />);
    expect(screen.getByTestId("custom-x")).toBeInTheDocument();
  });

  it("useRenderDropIndicator returns undefined when useDropIndicator is absent", () => {
    function Probe() {
      const renderDropIndicator = useRenderDropIndicator(
        {
          renderDropIndicator: (target) => <div data-testid={`custom-${target.key}`} />,
          isVirtualDragging: () => true,
        },
        { isDropTarget: () => true },
      );
      return <output data-testid="no-drop-hook">{String(renderDropIndicator == null)}</output>;
    }

    render(() => <Probe />);
    expect(screen.getByTestId("no-drop-hook").textContent).toBe("true");
  });
});
