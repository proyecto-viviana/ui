/**
 * Tests for createTableColumnResize move and resize lifecycle.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSignal, createRoot, flushSync, Show } from "solid-js";
import { createTableColumnResize } from "../src/table/createTableColumnResize";
import {
  createTableColumnResizeState,
  type TableColumnResizeState,
} from "@proyecto-viviana/solid-stately";
import type { Component } from "solid-js";

interface ResizerHarnessProps {
  isDisabled?: boolean;
  onResizeStart?: (widths: Map<any, number>) => void;
  onResize?: (widths: Map<any, number>) => void;
  onResizeEnd?: (widths: Map<any, number>) => void;
  state?: TableColumnResizeState;
}

const ResizerHarness: Component<ResizerHarnessProps> = (props) => {
  const state =
    props.state ??
    createTableColumnResizeState(() => ({
      tableWidth: 500,
      columns: [
        { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
        { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
      ],
    }));

  const resizer = createTableColumnResize(
    () => ({
      column: { key: "col1" },
      "aria-label": "Resize col1",
      isDisabled: props.isDisabled,
      onResizeStart: props.onResizeStart,
      onResize: props.onResize,
      onResizeEnd: props.onResizeEnd,
    }),
    () => state,
  );

  return (
    <div
      data-testid="resizer-handle"
      data-resizing={resizer.isResizing()}
      {...resizer.resizerProps}
    >
      <input data-testid="resizer-input" {...resizer.inputProps} />
    </div>
  );
};

describe("createTableColumnResize lifecycle", () => {
  afterEach(() => {
    cleanup();
  });

  describe("mouse move lifecycle", () => {
    it("completes resize through onMoveEnd on pointerup", () => {
      const onResizeStart = vi.fn();
      const onResize = vi.fn();
      const onResizeEnd = vi.fn();

      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return (
          <ResizerHarness
            state={sharedState}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
          />
        );
      });

      const handle = screen.getByTestId("resizer-handle");

      // Pointer down initiates press/move
      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      // Pointer move drags
      fireEvent.pointerMove(window, {
        pointerType: "mouse",
        pointerId: 1,
        pageX: 150,
        pageY: 50,
      });

      expect(onResizeStart).toHaveBeenCalled();
      expect(onResize).toHaveBeenCalled();
      expect(sharedState.resizingColumn()).toBe("col1");
      expect(sharedState.getColumnWidth("col1")).toBe(250);

      // Pointer up ends resize through onMoveEnd
      fireEvent.pointerUp(window, {
        pointerType: "mouse",
        pointerId: 1,
      });

      expect(onResizeEnd).toHaveBeenCalled();
      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("touch move lifecycle", () => {
    it("completes touch resize through move lifecycle", () => {
      const onResizeStart = vi.fn();
      const onResize = vi.fn();
      const onResizeEnd = vi.fn();

      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return (
          <ResizerHarness
            state={sharedState}
            onResizeStart={onResizeStart}
            onResize={onResize}
            onResizeEnd={onResizeEnd}
          />
        );
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.touchStart(handle, {
        changedTouches: [{ identifier: 1, pageX: 100, pageY: 50 }],
      });

      fireEvent.touchMove(handle, {
        changedTouches: [{ identifier: 1, pageX: 160, pageY: 50 }],
      });

      expect(onResizeStart).toHaveBeenCalled();
      expect(onResize).toHaveBeenCalled();
      expect(sharedState.getColumnWidth("col1")).toBe(260);

      fireEvent.touchEnd(handle, {
        changedTouches: [{ identifier: 1, pageX: 160, pageY: 50 }],
      });

      expect(onResizeEnd).toHaveBeenCalled();
      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("click without move", () => {
    it("does not remain active after click release", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      fireEvent.pointerUp(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      fireEvent.click(handle, { button: 0 });

      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("hold without move (stuck-after-hold regression)", () => {
    it("proves resize never remains active after a pointer hold and release", () => {
      vi.useFakeTimers();
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      // Pointer down starts hold
      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      // Hold for 1500ms without movement
      vi.advanceTimersByTime(1500);

      // Release after hold
      fireEvent.pointerUp(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });
      fireEvent.click(handle, { button: 0 });

      vi.runAllTimers();
      vi.useRealTimers();

      expect(sharedState.resizingColumn()).toBeNull();
    });

    it("proves resize never remains active after a touch hold and release", () => {
      vi.useFakeTimers();
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.touchStart(handle, {
        changedTouches: [{ identifier: 1, pageX: 100, pageY: 50 }],
      });

      vi.advanceTimersByTime(1200);

      fireEvent.touchEnd(handle, {
        changedTouches: [{ identifier: 1, pageX: 100, pageY: 50 }],
      });

      vi.runAllTimers();
      vi.useRealTimers();

      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("cancel lifecycle", () => {
    it("ends resize on pointercancel during drag", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      fireEvent.pointerMove(window, {
        pointerType: "mouse",
        pointerId: 1,
        pageX: 140,
        pageY: 50,
      });

      expect(sharedState.resizingColumn()).toBe("col1");

      fireEvent.pointerCancel(window, {
        pointerType: "mouse",
        pointerId: 1,
      });

      expect(sharedState.resizingColumn()).toBeNull();
    });

    it("ends resize on pointercancel during hold without move", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      fireEvent.pointerCancel(window, {
        pointerType: "mouse",
        pointerId: 1,
      });

      expect(sharedState.resizingColumn()).toBeNull();
    });

    it("ends resize on touchcancel", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.touchStart(handle, {
        changedTouches: [{ identifier: 1, pageX: 100, pageY: 50 }],
      });

      fireEvent.touchCancel(handle, {
        changedTouches: [{ identifier: 1, pageX: 100, pageY: 50 }],
      });

      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("cleanup on unmount", () => {
    it("cleans up active resize when resizer component is unmounted", () => {
      let sharedState!: TableColumnResizeState;
      createRoot(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
      });

      const { unmount } = render(() => <ResizerHarness state={sharedState} />);

      const handle = screen.getByTestId("resizer-handle");

      fireEvent.pointerDown(handle, {
        pointerType: "mouse",
        pointerId: 1,
        button: 0,
        pageX: 100,
        pageY: 50,
      });

      fireEvent.pointerMove(window, {
        pointerType: "mouse",
        pointerId: 1,
        pageX: 130,
        pageY: 50,
      });

      expect(sharedState.resizingColumn()).toBe("col1");

      // Unmount during active resize
      unmount();

      expect(sharedState.resizingColumn()).toBeNull();
    });
  });

  describe("keyboard and blur interactions", () => {
    it("ends resize on blur of the range input", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const input = screen.getByTestId("resizer-input");

      // Press Enter to start keyboard resize mode
      fireEvent.keyDown(input, { key: "Enter" });
      expect(sharedState.resizingColumn()).toBe("col1");

      // Blur ends resize mode
      fireEvent.blur(input);
      expect(sharedState.resizingColumn()).toBeNull();
    });

    it("ends resize on Escape key", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const input = screen.getByTestId("resizer-input");

      fireEvent.keyDown(input, { key: "Enter" });
      expect(sharedState.resizingColumn()).toBe("col1");

      fireEvent.keyDown(input, { key: "Escape" });
      expect(sharedState.resizingColumn()).toBeNull();
    });

    it("resizes columns using arrow keys on input", () => {
      let sharedState!: TableColumnResizeState;
      render(() => {
        sharedState = createTableColumnResizeState(() => ({
          tableWidth: 500,
          columns: [
            { key: "col1", width: 200, minWidth: 50, maxWidth: 400 },
            { key: "col2", width: 300, minWidth: 50, maxWidth: 400 },
          ],
        }));
        return <ResizerHarness state={sharedState} />;
      });

      const input = screen.getByTestId("resizer-input");

      fireEvent.keyDown(input, { key: "Enter" });
      expect(sharedState.resizingColumn()).toBe("col1");

      fireEvent.keyDown(input, { key: "ArrowRight" });
      expect(sharedState.getColumnWidth("col1")).toBe(210);

      fireEvent.keyDown(input, { key: "ArrowLeft" });
      expect(sharedState.getColumnWidth("col1")).toBe(200);

      fireEvent.keyDown(input, { key: "Enter" });
      expect(sharedState.resizingColumn()).toBeNull();
    });
  });
});
