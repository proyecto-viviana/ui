import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen, cleanup } from "@solidjs/testing-library";
import { afterEach } from "vitest";
import {
  setGlobalDraggingCollectionRef,
  setGlobalDraggingKeys,
  setGlobalDraggingTypes,
} from "../src/dnd/createDraggableCollection";
import { setGlobalAllowedDropOperations, DROP_OPERATION } from "../src/dnd/utils";
import type {
  Collection,
  DropOperation,
  DropTarget,
  DroppableCollectionState,
} from "@proyecto-viviana/solid-stately";

// The faithful keyboard engine lives on the DragManager singleton: the ported
// `useDroppableCollection` effect calls `registerDropTarget({...onKeyDown})`, and
// the DragSession's document-capture listener invokes that `onKeyDown(e, drag)`
// per keystroke (react-aria 3.50). We unit-test the engine at exactly that seam —
// capturing the registered descriptor and driving its handlers the way the live
// DragSession would — without needing rAF / getDragModality / ariaHideOutside.
// Full-session integration (Enter pick-up → Tab cycle → Enter drop) is certified
// end-to-end by the browser cert (dnd on the ListBox host).
const dragManagerMock = vi.hoisted(() => {
  type Descriptor = {
    element: HTMLElement;
    getDropOperation?: (types: Set<string>, ops: DropOperation[]) => DropOperation;
    onDropEnter?: (e: unknown, drag: unknown) => void;
    onDropExit?: (e: unknown) => void;
    onDropTargetEnter?: (target: DropTarget | null) => void;
    onDropActivate?: (e: unknown, target: DropTarget | null) => void;
    onDrop?: (e: unknown, target: DropTarget | null) => void;
    onKeyDown?: (e: KeyboardEvent, drag: unknown) => void;
  };
  let captured: Descriptor | null = null;
  return {
    registerDropTarget: (target: Descriptor) => {
      captured = target;
      return () => {
        if (captured === target) captured = null;
      };
    },
    getCaptured: (): Descriptor => {
      if (!captured) throw new Error("no drop target was registered");
      return captured;
    },
    reset: () => {
      captured = null;
    },
  };
});

vi.mock("../src/dnd/DragManager", () => ({
  registerDropTarget: dragManagerMock.registerDropTarget,
}));

// Import after the mock is declared so the effect's `registerDropTarget` resolves
// to the capturing stub.
const { createDroppableCollection } = await import("../src/dnd/createDroppableCollection");

afterEach(() => {
  setGlobalDraggingCollectionRef(null);
  setGlobalDraggingKeys(new Set());
  setGlobalDraggingTypes(new Set());
  setGlobalAllowedDropOperations(DROP_OPERATION.none);
  document.dir = "";
  cleanup();
  dragManagerMock.reset();
});

// ---------------------------------------------------------------------------
// Faithful test fixtures: a real flat collection + keyboard delegate feed the
// ported `navigate()` (DropTargetKeyboardNavigation) exactly as a live ListBox
// host would. `navigate()` reads only getKeyAfter/getKeyBefore/getItem; the
// delegate supplies getFirst/Last/Below/Above (+ horizontal/page variants).
// ---------------------------------------------------------------------------
type SimpleKey = string | number;

function makeFlatCollection(keys: SimpleKey[]): Collection {
  const indexOf = (k: SimpleKey) => keys.indexOf(k);
  const node = (k: SimpleKey) => ({
    key: k,
    type: "item" as const,
    level: 0,
    parentKey: null,
    childNodes: [] as unknown[],
  });
  return {
    getKeyAfter: (k: SimpleKey) => {
      const i = indexOf(k);
      return i >= 0 && i < keys.length - 1 ? keys[i + 1] : null;
    },
    getKeyBefore: (k: SimpleKey) => {
      const i = indexOf(k);
      return i > 0 ? keys[i - 1] : null;
    },
    getFirstKey: () => keys[0] ?? null,
    getLastKey: () => keys[keys.length - 1] ?? null,
    getItem: (k: SimpleKey) => (indexOf(k) >= 0 ? node(k) : null),
    getSize: () => keys.length,
    [Symbol.iterator]: function* () {
      for (const k of keys) yield node(k);
    },
  } as unknown as Collection;
}

interface DelegateOptions {
  horizontal?: boolean;
  omitVertical?: boolean;
  omitPage?: boolean;
}

function makeDelegate(keys: SimpleKey[], collection: Collection, opts: DelegateOptions = {}) {
  const after = (k: SimpleKey) => collection.getKeyAfter(k);
  const before = (k: SimpleKey) => collection.getKeyBefore(k);
  const delegate: Record<string, unknown> = {
    getFirstKey: () => keys[0] ?? null,
    getLastKey: () => keys[keys.length - 1] ?? null,
  };
  if (!opts.omitVertical) {
    delegate.getKeyBelow = (k: SimpleKey) => after(k);
    delegate.getKeyAbove = (k: SimpleKey) => before(k);
  }
  if (opts.horizontal) {
    delegate.getKeyRightOf = (k: SimpleKey) => after(k);
    delegate.getKeyLeftOf = (k: SimpleKey) => before(k);
  }
  if (!opts.omitPage) {
    delegate.getKeyPageBelow = (k: SimpleKey) => after(k);
    delegate.getKeyPageAbove = (k: SimpleKey) => before(k);
  }
  return delegate;
}

type GetDropOperation = (target: DropTarget) => DropOperation;

function makeState(getDropOperation?: GetDropOperation) {
  let currentTarget: DropTarget | null = null;
  const calls: string[] = [];
  const label = (target: DropTarget | null) => {
    if (target?.type === "item") return `item:${String(target.key)}:${target.dropPosition}`;
    return target?.type ?? "null";
  };
  const state = {
    get target() {
      return currentTarget;
    },
    get isDropTarget() {
      return currentTarget != null;
    },
    get isDisabled() {
      return false;
    },
    setTarget(target: DropTarget | null) {
      currentTarget = target;
      calls.push(label(target));
    },
    activateTarget() {
      calls.push("activate");
    },
    exitTarget() {
      currentTarget = null;
      calls.push("exit");
    },
    getDropOperation(target: DropTarget) {
      return getDropOperation ? getDropOperation(target) : ("move" as const);
    },
    enterTarget() {},
    moveToTarget() {},
    drop() {},
    isAccepted() {
      return true;
    },
    shouldAcceptItemDrop() {
      return true;
    },
  } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;
  return { state, calls, getTarget: () => currentTarget };
}

interface HarnessConfig {
  keys: SimpleKey[];
  state: DroppableCollectionState;
  delegateOptions?: DelegateOptions;
  extra?: Record<string, unknown>;
}

let harnessCounter = 0;

/** Render a droppable collection and return its registered DragManager descriptor. */
function mountHarness(config: HarnessConfig) {
  const id = `drop-host-${++harnessCounter}`;
  const collection = makeFlatCollection(config.keys);
  const keyboardDelegate = makeDelegate(config.keys, collection, config.delegateOptions);

  function TestComponent() {
    const { collectionProps } = createDroppableCollection(
      () => ({
        ref: () => document.getElementById(id) as HTMLElement | null,
        dropTargetDelegate: {
          getDropTargetFromPoint() {
            return null;
          },
        },
        collection,
        keyboardDelegate,
        ...config.extra,
      }),
      config.state,
    );
    return <div id={id} tabIndex={0} data-testid={id} {...collectionProps} />;
  }

  render(() => <TestComponent />);
  return { descriptor: dragManagerMock.getCaptured(), id };
}

// A drag session payload as the DragSession hands it to `onKeyDown(e, drag)`.
const DRAG = {
  element: document.body,
  items: [{ "text/plain": "payload" }],
  allowedDropOperations: ["move"] as DropOperation[],
};

const keyDown = (key: string): KeyboardEvent => ({ key }) as KeyboardEvent;

describe("createDroppableCollection keyboard engine (DragManager seam)", () => {
  it("registers a DragManager drop target for the collection element", () => {
    const { state } = makeState();
    const { descriptor, id } = mountHarness({ keys: [1, 2, 3], state });
    expect(descriptor.element).toBe(document.getElementById(id));
    expect(typeof descriptor.onKeyDown).toBe("function");
    expect(typeof descriptor.onDropEnter).toBe("function");
  });

  it("enters at the root, then ArrowDown walks before/on drop positions across items", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onDropEnter?.({}, DRAG);
    expect(calls.at(-1)).toBe("root");

    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:1:before");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:1:on");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:2:before");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:2:on");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:3:before");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:3:on");
    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:3:after");
  });

  it("ArrowUp reverses the drop-position walk from the last item", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    // Seat the current target on the last item's "after" position (End).
    descriptor.onKeyDown?.(keyDown("End"), DRAG);
    expect(calls.at(-1)).toBe("item:3:after");

    descriptor.onKeyDown?.(keyDown("ArrowUp"), DRAG);
    expect(calls.at(-1)).toBe("item:3:on");
    descriptor.onKeyDown?.(keyDown("ArrowUp"), DRAG);
    expect(calls.at(-1)).toBe("item:3:before");
    descriptor.onKeyDown?.(keyDown("ArrowUp"), DRAG);
    expect(calls.at(-1)).toBe("item:2:on");
  });

  it("Home resets to the root; End jumps to the last item's after position", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onKeyDown?.(keyDown("Home"), DRAG);
    expect(calls.at(-1)).toBe("root");

    descriptor.onKeyDown?.(keyDown("End"), DRAG);
    expect(calls.at(-1)).toBe("item:3:after");
  });

  it("skips targets the state rejects via getDropOperation (nextValidTarget)", () => {
    // Reject every drop position on item 1 — navigation should land on item 2.
    const reject1: GetDropOperation = (t) => (t.type === "item" && t.key === 1 ? "cancel" : "move");
    const { state, calls } = makeState(reject1);
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onDropEnter?.({}, DRAG);
    expect(calls.at(-1)).toBe("root");

    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    expect(calls.at(-1)).toBe("item:2:before");
  });

  it("horizontal ArrowRight/ArrowLeft navigate when the delegate provides horizontal getters", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({
      keys: [1, 2, 3],
      state,
      delegateOptions: { horizontal: true },
    });

    descriptor.onDropEnter?.({}, DRAG);
    expect(calls.at(-1)).toBe("root");

    descriptor.onKeyDown?.(keyDown("ArrowRight"), DRAG);
    expect(calls.at(-1)).toBe("item:1:before");
    descriptor.onKeyDown?.(keyDown("ArrowRight"), DRAG);
    expect(calls.at(-1)).toBe("item:1:on");

    descriptor.onKeyDown?.(keyDown("ArrowLeft"), DRAG);
    expect(calls.at(-1)).toBe("item:1:before");
  });

  it("ignores horizontal keys when the delegate provides no horizontal getters", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onDropEnter?.({}, DRAG);
    const afterEnter = calls.length;

    descriptor.onKeyDown?.(keyDown("ArrowRight"), DRAG);
    descriptor.onKeyDown?.(keyDown("ArrowLeft"), DRAG);
    expect(calls.length).toBe(afterEnter);
  });

  it("ignores vertical keys when the delegate omits getKeyBelow/getKeyAbove", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({
      keys: [1, 2, 3],
      state,
      delegateOptions: { omitVertical: true },
    });

    descriptor.onDropEnter?.({}, DRAG);
    const afterEnter = calls.length;

    descriptor.onKeyDown?.(keyDown("ArrowDown"), DRAG);
    descriptor.onKeyDown?.(keyDown("ArrowUp"), DRAG);
    expect(calls.length).toBe(afterEnter);
  });

  it("PageDown/PageUp move by the delegate's page getters", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onDropEnter?.({}, DRAG);
    expect(calls.at(-1)).toBe("root");

    // From the root, PageDown targets the item a page below the first key.
    descriptor.onKeyDown?.(keyDown("PageDown"), DRAG);
    expect(calls.at(-1)).toBe("item:2:after");

    descriptor.onKeyDown?.(keyDown("PageUp"), DRAG);
    expect(calls.at(-1)).toBe("item:1:after");
  });

  it("ignores page keys when the delegate omits page getters", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({
      keys: [1, 2, 3],
      state,
      delegateOptions: { omitPage: true },
    });

    descriptor.onDropEnter?.({}, DRAG);
    const afterEnter = calls.length;

    descriptor.onKeyDown?.(keyDown("PageDown"), DRAG);
    descriptor.onKeyDown?.(keyDown("PageUp"), DRAG);
    expect(calls.length).toBe(afterEnter);
  });

  it("onDropExit clears the current target", () => {
    const { state, calls } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    descriptor.onDropEnter?.({}, DRAG);
    expect(state.target).not.toBeNull();

    descriptor.onDropExit?.({});
    expect(state.target).toBeNull();
    expect(calls.at(-1)).toBe("null");
  });

  it("onDropTargetEnter sets the pointer-resolved target directly", () => {
    const { state } = makeState();
    const { descriptor } = mountHarness({ keys: [1, 2, 3], state });

    const target: DropTarget = { type: "item", key: 2, dropPosition: "on" };
    descriptor.onDropTargetEnter?.(target);
    expect(state.target).toEqual(target);
  });

  it("forwards onDropActivate only for item on-targets", () => {
    const onDropActivate = vi.fn();
    const { state } = makeState();
    const { descriptor } = mountHarness({
      keys: [1, 2, 3],
      state,
      extra: { onDropActivate },
    });

    descriptor.onDropActivate?.({ x: 1, y: 2 }, { type: "item", key: 2, dropPosition: "before" });
    expect(onDropActivate).not.toHaveBeenCalled();

    descriptor.onDropActivate?.({ x: 3, y: 4 }, { type: "item", key: 2, dropPosition: "on" });
    expect(onDropActivate).toHaveBeenCalledTimes(1);
    expect(onDropActivate).toHaveBeenCalledWith({
      target: { type: "item", key: 2, dropPosition: "on" },
      x: 3,
      y: 4,
    });
  });
});

describe("createDroppableCollection native pointer drop", () => {
  it("passes internal dragging keys to onMove for on-item drops", () => {
    const onMoveCalls: Array<Set<string | number>> = [];
    const dropTarget: DropTarget = { type: "item", key: "b", dropPosition: "on" };
    let currentTarget: DropTarget | null = null;
    const state = {
      get target() {
        return currentTarget;
      },
      get isDropTarget() {
        return currentTarget != null;
      },
      get isDisabled() {
        return false;
      },
      setTarget(target: DropTarget | null) {
        currentTarget = target;
      },
      activateTarget() {},
      exitTarget() {
        currentTarget = null;
      },
      getDropOperation() {
        return "move" as const;
      },
      enterTarget() {},
      moveToTarget() {},
      drop() {},
      isAccepted() {
        return true;
      },
      shouldAcceptItemDrop() {
        return true;
      },
    } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;

    function TestComponent() {
      const { collectionProps } = createDroppableCollection(
        () => ({
          ref: () => document.getElementById("drop-root-internal-move") as HTMLElement | null,
          dropTargetDelegate: {
            getDropTargetFromPoint() {
              return dropTarget;
            },
          },
          onMove: (e) => {
            onMoveCalls.push(new Set(e.keys));
          },
        }),
        state,
      );

      return (
        <div
          id="drop-root-internal-move"
          tabIndex={0}
          data-testid="drop-root-internal-move"
          {...collectionProps}
        />
      );
    }

    render(() => <TestComponent />);
    const root = screen.getByTestId("drop-root-internal-move");
    const dataTransfer = {
      effectAllowed: "all",
      dropEffect: "none",
      items: [{ kind: "string", type: "text/plain" }],
      types: ["text/plain"],
      getData: () => "payload",
    } as unknown as DataTransfer;

    const draggingKeys = new Set<string | number>(["a", "c"]);
    setGlobalDraggingCollectionRef(root as HTMLElement);
    setGlobalDraggingKeys(draggingKeys);

    fireEvent.dragEnter(root, { dataTransfer, clientX: 1, clientY: 1 });
    fireEvent.dragOver(root, { dataTransfer, clientX: 2, clientY: 2 });
    fireEvent.drop(root, { dataTransfer, clientX: 2, clientY: 2 });

    expect(onMoveCalls).toHaveLength(1);
    expect(onMoveCalls[0]).toEqual(draggingKeys);
  });

  it("passes internal dragging keys to onReorder for insertion drops", () => {
    const onReorderCalls: Array<Set<string | number>> = [];
    const dropTarget: DropTarget = { type: "item", key: "b", dropPosition: "before" };
    let currentTarget: DropTarget | null = null;
    const state = {
      get target() {
        return currentTarget;
      },
      get isDropTarget() {
        return currentTarget != null;
      },
      get isDisabled() {
        return false;
      },
      setTarget(target: DropTarget | null) {
        currentTarget = target;
      },
      activateTarget() {},
      exitTarget() {
        currentTarget = null;
      },
      getDropOperation() {
        return "move" as const;
      },
      enterTarget() {},
      moveToTarget() {},
      drop() {},
      isAccepted() {
        return true;
      },
      shouldAcceptItemDrop() {
        return true;
      },
    } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;

    function TestComponent() {
      const { collectionProps } = createDroppableCollection(
        () => ({
          ref: () => document.getElementById("drop-root-internal-reorder") as HTMLElement | null,
          dropTargetDelegate: {
            getDropTargetFromPoint() {
              return dropTarget;
            },
          },
          onReorder: (e) => {
            onReorderCalls.push(new Set(e.keys));
          },
        }),
        state,
      );

      return (
        <div
          id="drop-root-internal-reorder"
          tabIndex={0}
          data-testid="drop-root-internal-reorder"
          {...collectionProps}
        />
      );
    }

    render(() => <TestComponent />);
    const root = screen.getByTestId("drop-root-internal-reorder");
    const dataTransfer = {
      effectAllowed: "all",
      dropEffect: "none",
      items: [{ kind: "string", type: "text/plain" }],
      types: ["text/plain"],
      getData: () => "payload",
    } as unknown as DataTransfer;

    const draggingKeys = new Set<string | number>(["x"]);
    setGlobalDraggingCollectionRef(root as HTMLElement);
    setGlobalDraggingKeys(draggingKeys);

    fireEvent.dragEnter(root, { dataTransfer, clientX: 1, clientY: 1 });
    fireEvent.dragOver(root, { dataTransfer, clientX: 2, clientY: 2 });
    fireEvent.drop(root, { dataTransfer, clientX: 2, clientY: 2 });

    expect(onReorderCalls).toHaveLength(1);
    expect(onReorderCalls[0]).toEqual(draggingKeys);
  });

  it("forwards generic onDrop callback with resolved target payload", () => {
    const onDropCalls: Array<{ target: DropTarget; dropOperation: string }> = [];
    const dropTarget: DropTarget = { type: "item", key: "b", dropPosition: "on" };
    let currentTarget: DropTarget | null = null;
    const state = {
      get target() {
        return currentTarget;
      },
      get isDropTarget() {
        return currentTarget != null;
      },
      get isDisabled() {
        return false;
      },
      setTarget(target: DropTarget | null) {
        currentTarget = target;
      },
      activateTarget() {},
      exitTarget() {
        currentTarget = null;
      },
      getDropOperation() {
        return "move" as const;
      },
      enterTarget() {},
      moveToTarget() {},
      drop() {},
      isAccepted() {
        return true;
      },
      shouldAcceptItemDrop() {
        return true;
      },
    } satisfies Partial<DroppableCollectionState> as DroppableCollectionState;

    function TestComponent() {
      const { collectionProps } = createDroppableCollection(
        () => ({
          ref: () => document.getElementById("drop-root-generic-drop") as HTMLElement | null,
          dropTargetDelegate: {
            getDropTargetFromPoint() {
              return dropTarget;
            },
          },
          onDrop: (e) => {
            onDropCalls.push({ target: e.target, dropOperation: e.dropOperation });
          },
        }),
        state,
      );

      return (
        <div
          id="drop-root-generic-drop"
          tabIndex={0}
          data-testid="drop-root-generic-drop"
          {...collectionProps}
        />
      );
    }

    render(() => <TestComponent />);
    const root = screen.getByTestId("drop-root-generic-drop");
    const dataTransfer = {
      effectAllowed: "all",
      dropEffect: "none",
      items: [{ kind: "string", type: "text/plain" }],
      types: ["text/plain"],
      getData: () => "payload",
    } as unknown as DataTransfer;

    fireEvent.dragEnter(root, { dataTransfer, clientX: 1, clientY: 1 });
    fireEvent.dragOver(root, { dataTransfer, clientX: 2, clientY: 2 });
    fireEvent.drop(root, { dataTransfer, clientX: 2, clientY: 2 });

    expect(onDropCalls).toHaveLength(1);
    expect(onDropCalls[0]).toEqual({
      target: dropTarget,
      dropOperation: "move",
    });
  });
});
