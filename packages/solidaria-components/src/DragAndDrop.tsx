/**
 * Drag and drop composition helpers for solidaria-components.
 *
 * Compatibility target: react-aria-components DragAndDrop exports.
 */

import { type JSX, type Accessor, createContext, createMemo, useContext } from "solid-js";
import type {
  DragTypes,
  DropOperation,
  DropTarget,
  ItemDropTarget,
  Key,
} from "@proyecto-viviana/solid-stately";
import type { DragAndDropHooks } from "./useDragAndDrop";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  dataAttr,
} from "./utils";

export interface DragAndDropContextValue {
  dragAndDropHooks?: DragAndDropHooks<unknown>;
  dragState?: unknown;
  dropState?: {
    target?: DropTarget | null;
    isDropTarget?: (target: DropTarget) => boolean;
  };
}

export const DragAndDropContext = createContext<DragAndDropContextValue>({});

export interface DropIndicatorRenderProps {
  isDropTarget: boolean;
}

export interface DropIndicatorProps extends SlotProps {
  target: ItemDropTarget;
  children?: JSX.Element | ((props: DropIndicatorRenderProps) => JSX.Element);
  class?: ClassNameOrFunction<DropIndicatorRenderProps>;
  style?: StyleOrFunction<DropIndicatorRenderProps>;
}

interface DropIndicatorContextValue {
  render: (props: DropIndicatorProps) => JSX.Element;
}

export const DropIndicatorContext = createContext<DropIndicatorContextValue | null>(null);

function DefaultDropIndicator(props: DropIndicatorProps): JSX.Element {
  const dnd = useContext(DragAndDropContext);
  const isDropTarget = createMemo(() => {
    const target = props.target;
    return dnd.dropState?.isDropTarget?.(target) ?? false;
  });

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-DropIndicator",
    },
    () => ({
      isDropTarget: isDropTarget(),
    }),
  );

  return (
    <div
      role="option"
      aria-disabled={true}
      class={renderProps.class()}
      style={renderProps.style()}
      data-drop-target={dataAttr(isDropTarget())}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

export function DropIndicator(props: DropIndicatorProps): JSX.Element {
  const context = useContext(DropIndicatorContext);
  if (context) return context.render(props);
  return <DefaultDropIndicator {...props} />;
}

export function useRenderDropIndicator(
  hooksOrDropState?:
    | Pick<
        DragAndDropHooks<unknown>,
        "renderDropIndicator" | "isVirtualDragging" | "useDropIndicator"
      >
    | {
        target?: DropTarget | null;
        isDropTarget?: ((target: DropTarget) => boolean) | boolean;
      },
  maybeDropState?: {
    target?: DropTarget | null;
    isDropTarget?: ((target: DropTarget) => boolean) | boolean;
  },
): ((target: ItemDropTarget) => JSX.Element | undefined) | undefined {
  const looksLikeDropState = (
    value: unknown,
  ): value is {
    target?: DropTarget | null;
    isDropTarget?: ((target: DropTarget) => boolean) | boolean;
  } => {
    return Boolean(
      value &&
      typeof value === "object" &&
      ("isDropTarget" in (value as Record<string, unknown>) ||
        "target" in (value as Record<string, unknown>)),
    );
  };

  const dragAndDropHooks = looksLikeDropState(hooksOrDropState) ? undefined : hooksOrDropState;
  const dropState = looksLikeDropState(hooksOrDropState) ? hooksOrDropState : maybeDropState;

  // RAC only renders collection indicators when drop hooks are present.
  if (dragAndDropHooks && !dragAndDropHooks.useDropIndicator) return undefined;
  if (!dropState && !dragAndDropHooks?.renderDropIndicator) return undefined;

  const targetsEqual = (a: DropTarget | null | undefined, b: DropTarget): boolean => {
    if (!a) return false;
    if (a.type !== b.type) return false;
    if (a.type === "root" && b.type === "root") return true;
    if (a.type !== "item" || b.type !== "item") return false;
    return a.key === b.key && a.dropPosition === b.dropPosition;
  };

  return (target: ItemDropTarget) => {
    const stateIsDropTarget = dropState?.isDropTarget;
    const isTarget =
      typeof stateIsDropTarget === "function"
        ? stateIsDropTarget(target)
        : stateIsDropTarget === true
          ? targetsEqual(dropState?.target, target)
          : false;
    const isVirtualDragging = dragAndDropHooks?.isVirtualDragging?.() ?? false;
    if (!isTarget && !isVirtualDragging) return undefined;
    return dragAndDropHooks?.renderDropIndicator ? (
      dragAndDropHooks.renderDropIndicator(target)
    ) : (
      <DropIndicator target={target} />
    );
  };
}

type KeyAccessor = Key | null | undefined | Accessor<Key | null | undefined>;

interface SelectionManagerLike {
  focusedKey?: KeyAccessor;
}

interface CollectionLike {
  getKeyAfter: (key: Key) => Key | null;
  getItem: (key: Key) => { level?: number; type?: string } | null | undefined;
}

interface DroppableCollectionStateLike {
  target?: DropTarget | null;
}

export interface VirtualRangeLike {
  start: number;
  end: number;
  offsetTop: number;
  offsetBottom: number;
}

export interface LayoutInfoProviderLike {
  getLayoutInfo: (index: number) => { rect: { y: number; height: number } };
}

function resolveKey(value: KeyAccessor): Key | null | undefined {
  if (typeof value === "function") {
    return (value as Accessor<Key | null | undefined>)();
  }
  return value;
}

function getAfterDropNormalizedKey(target: ItemDropTarget, collection?: CollectionLike): Key {
  if (target.dropPosition !== "after" || !collection) return target.key;

  let nextKey = collection.getKeyAfter(target.key);
  let lastDescendantKey: Key | null = null;

  if (nextKey != null) {
    const targetLevel = collection.getItem(target.key)?.level ?? 0;
    while (nextKey != null) {
      const node = collection.getItem(nextKey);
      if (!node) break;
      if (node.type && node.type !== "item") {
        nextKey = collection.getKeyAfter(nextKey);
        continue;
      }
      if ((node.level ?? 0) <= targetLevel) break;
      lastDescendantKey = nextKey;
      nextKey = collection.getKeyAfter(nextKey);
    }
  }

  return nextKey ?? lastDescendantKey ?? target.key;
}

export function getNormalizedDropTargetKey(
  target: DropTarget | null | undefined,
  collection?: CollectionLike,
): Key | null {
  if (!target || target.type !== "item") return null;
  return getAfterDropNormalizedKey(target, collection);
}

export function useDndPersistedKeys(
  selectionManager: SelectionManagerLike | null | undefined,
  dragAndDropHooks?: Pick<DragAndDropHooks<unknown>, "isVirtualDragging">,
  dropState?: DroppableCollectionStateLike,
  collection?: CollectionLike,
): Accessor<Set<Key>> {
  return createMemo(() => {
    const focusedKey = resolveKey(selectionManager?.focusedKey);
    let dropTargetKey: Key | null | undefined;

    if (dragAndDropHooks?.isVirtualDragging?.() && dropState?.target?.type === "item") {
      dropTargetKey = getNormalizedDropTargetKey(dropState.target, collection) ?? undefined;
    }

    const keys = new Set<Key>();
    if (focusedKey != null) keys.add(focusedKey);
    if (dropTargetKey != null) keys.add(dropTargetKey);
    return keys;
  });
}

export function mergePersistedKeysIntoVirtualRange(
  baseRange: VirtualRangeLike,
  persistedIndexes: number[],
  itemCount: number,
  layoutInfoProvider: LayoutInfoProviderLike,
  maxExtraItems = 60,
  options?: {
    forceIncludeIndexes?: number[];
    forceIncludeMaxSpan?: number;
    fallbackToForcedWindow?: boolean;
  },
): VirtualRangeLike {
  const validPersistedIndexes = Array.from(
    new Set(persistedIndexes.filter((index) => index >= 0 && index < itemCount)),
  ).sort((a, b) => a - b);
  const forceIndexes = Array.from(
    new Set(
      (options?.forceIncludeIndexes ?? []).filter((index) => index >= 0 && index < itemCount),
    ),
  );

  if (itemCount <= 0) return baseRange;
  if (validPersistedIndexes.length === 0 && forceIndexes.length === 0) return baseRange;

  const baseSpan = Math.max(1, baseRange.end - baseRange.start);
  const maxSpan = Math.max(baseSpan, baseSpan + maxExtraItems);

  let start = baseRange.start;
  let end = baseRange.end;

  const distanceToBaseRange = (index: number): number => {
    if (index < baseRange.start) return baseRange.start - index;
    if (index >= baseRange.end) return index - (baseRange.end - 1);
    return 0;
  };

  for (const index of validPersistedIndexes.sort(
    (a, b) => distanceToBaseRange(a) - distanceToBaseRange(b),
  )) {
    const nextStart = Math.min(start, index);
    const nextEnd = Math.max(end, index + 1);
    if (nextEnd - nextStart <= maxSpan) {
      start = nextStart;
      end = nextEnd;
    }
  }

  if (forceIndexes.length > 0) {
    const forceMaxSpan = Math.max(maxSpan, options?.forceIncludeMaxSpan ?? Math.max(maxSpan, 300));
    for (const index of forceIndexes) {
      const nextStart = Math.min(start, index);
      const nextEnd = Math.max(end, index + 1);
      if (nextEnd - nextStart <= forceMaxSpan) {
        start = nextStart;
        end = nextEnd;
      }
    }

    if (options?.fallbackToForcedWindow !== false) {
      const missingForced = forceIndexes.filter((index) => index < start || index >= end);
      if (missingForced.length > 0) {
        const nearestForced = missingForced[0];
        const forceMaxSpan = Math.max(
          maxSpan,
          options?.forceIncludeMaxSpan ?? Math.max(maxSpan, 300),
        );
        const windowSpan = Math.min(itemCount, Math.max(baseSpan, forceMaxSpan));
        const centeredStart = Math.max(
          0,
          Math.min(itemCount - windowSpan, nearestForced - Math.floor(windowSpan / 2)),
        );
        start = centeredStart;
        end = Math.min(itemCount, centeredStart + windowSpan);
      }
    }
  }

  if (start === baseRange.start && end === baseRange.end) return baseRange;

  const startRect = start > 0 ? layoutInfoProvider.getLayoutInfo(start).rect : { y: 0, height: 0 };
  const lastRect = layoutInfoProvider.getLayoutInfo(itemCount - 1).rect;
  const endRect = end > 0 ? layoutInfoProvider.getLayoutInfo(end - 1).rect : { y: 0, height: 0 };

  return {
    start,
    end,
    offsetTop: Math.max(0, startRect.y),
    offsetBottom: Math.max(0, lastRect.y + lastRect.height - (endRect.y + endRect.height)),
  };
}

export type DropTargetDelegate = {
  getDropTargetFromPoint: (
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ) => DropTarget | null;
  getDropOperation: (
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
  ) => DropOperation;
};
