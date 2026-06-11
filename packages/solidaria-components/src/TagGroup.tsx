/**
 * TagGroup component for solidaria-components
 *
 * Pre-wired headless tag group component that combines aria hooks.
 * Port of react-aria-components/src/TagGroup.tsx
 *
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 */

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import { createTagGroup, createTag, type AriaTagGroupProps } from "@proyecto-viviana/solidaria";
import {
  createListState,
  type ListState,
  type Key,
  type SelectionMode,
  type SelectionBehavior,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
  dataAttr,
} from "./utils";
import { SharedElementTransition } from "./SharedElementTransition";
import {
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";

export interface TagGroupRenderProps {
  /** Whether the tag group is disabled. */
  isDisabled: boolean;
  /** Whether the tag list is empty. */
  isEmpty: boolean;
}

export interface TagGroupProps
  extends
    Omit<AriaTagGroupProps, "id">,
    SlotProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TagGroupRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TagGroupRenderProps>;
}

export interface TagListRenderProps {
  /** Whether the tag list is empty. */
  isEmpty: boolean;
  /** Whether the tag list is focused. */
  isFocused: boolean;
}

export interface TagListProps<T>
  extends
    SlotProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children" | "onSelectionChange"> {
  /** The items to display in the tag list. */
  items: T[];
  /** Function to render each item. */
  children: (item: T) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TagListRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TagListRenderProps>;
  /** Content to render when the list is empty. */
  renderEmptyState?: () => JSX.Element;
  /** The selection mode for the tag list. */
  selectionMode?: SelectionMode;
  /** How selection behaves in the collection. */
  selectionBehavior?: SelectionBehavior;
  /** The currently selected keys (controlled). */
  selectedKeys?: Iterable<Key>;
  /** The default selected keys (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** Keys that are disabled. */
  disabledKeys?: Iterable<Key>;
  /** Function to get a unique key from an item. */
  getKey?: (item: T) => Key;
  /** Accessibility label. */
  label?: string;
  /** Custom aria-label. */
  "aria-label"?: string;
  /** Reference to external label element. */
  "aria-labelledby"?: string;
  /** Reference to description element. */
  "aria-describedby"?: string;
  /** Whether the tag list is disabled. */
  isDisabled?: boolean;
  /** Handler called when tags are removed. */
  onRemove?: (keys: Set<Key>) => void;
}

export interface TagRenderProps {
  /** Whether the tag is selected. */
  isSelected: boolean;
  /** Whether the tag is disabled. */
  isDisabled: boolean;
  /** Whether the tag is focused. */
  isFocused: boolean;
  /** Whether the tag is pressed. */
  isPressed: boolean;
  /** Whether the tag allows removal. */
  allowsRemoving: boolean;
  /** The selection mode. */
  selectionMode: SelectionMode;
  /** Props for the remove button when removal is allowed. */
  removeButtonProps: Record<string, unknown>;
}

export interface TagProps extends SlotProps {
  /** A unique key for this tag. */
  id: Key;
  /** Whether the tag is disabled. */
  isDisabled?: boolean;
  /** A text value for accessibility. */
  textValue?: string;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<TagRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TagRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TagRenderProps>;
  /** Handler called when the tag is activated. */
  onAction?: (key: Key) => void;
}

interface TagGroupContextValue {
  state: ListState;
  onRemove?: (keys: Set<Key>) => void;
  isDisabled?: boolean;
}

interface TagContextValue {
  removeButtonProps: Record<string, unknown>;
  allowsRemoving: boolean;
}

export const TagGroupContext = createContext<TagGroupContextValue | null>(null);
export const TagListStateContext = createContext<ListState | null>(null);
export const TagContext = createContext<TagContextValue | null>(null);

export function useTagGroupContext(): TagGroupContextValue | null {
  return useContext(TagGroupContext);
}

/**
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 *
 * @example
 * ```tsx
 * <TagGroup label="Categories" onRemove={(keys) => removeItems(keys)}>
 *   <TagList items={items}>
 *     {(item) => <Tag id={item.id}>{item.name}</Tag>}
 *   </TagList>
 * </TagGroup>
 * ```
 */
export function TagGroup(props: TagGroupProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  // We need TagList to provide the state, so TagGroup just provides context
  return (
    <div
      {...domProps}
      class={typeof local.class === "string" ? local.class : "solidaria-TagGroup"}
      style={typeof local.style === "object" ? local.style : undefined}
      slot={local.slot}
    >
      {props.children}
    </div>
  );
}

/**
 * TagList contains the list of tags within a TagGroup.
 */
export function TagList<T extends { id?: Key; key?: Key }>(props: TagListProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "items",
    "class",
    "style",
    "slot",
    "renderEmptyState",
    "children",
    "selectionMode",
    "selectionBehavior",
    "selectedKeys",
    "defaultSelectedKeys",
    "onSelectionChange",
    "disabledKeys",
    "getKey",
    "label",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "isDisabled",
    "onRemove",
  ]);

  // Create a ref for the grid
  const [gridRef, setGridRef] = createSignal<HTMLDivElement | null>(null);

  // Default getKey function
  const getKey = (item: T): Key => {
    if (local.getKey) return local.getKey(item);
    if (item.id !== undefined) return item.id;
    if (item.key !== undefined) return item.key;
    return String(item);
  };

  const state = createListState({
    get items() {
      return local.items;
    },
    getKey,
    get selectionMode() {
      return local.selectionMode ?? "none";
    },
    get selectionBehavior() {
      return local.selectionBehavior ?? "toggle";
    },
    get selectedKeys() {
      return local.selectedKeys;
    },
    get defaultSelectedKeys() {
      return local.defaultSelectedKeys;
    },
    get onSelectionChange() {
      return local.onSelectionChange;
    },
    get disabledKeys() {
      return local.disabledKeys;
    },
  });

  // Create tag group accessibility props
  const tagGroupAria = createTagGroup(
    {
      get "aria-label"() {
        return local["aria-label"] ?? (!local["aria-labelledby"] ? local.label : undefined);
      },
      get "aria-labelledby"() {
        return local["aria-labelledby"];
      },
      get "aria-describedby"() {
        return local["aria-describedby"];
      },
      get isDisabled() {
        return local.isDisabled;
      },
      get onRemove() {
        return local.onRemove;
      },
    },
    state,
    gridRef,
  );

  const [isFocused, setIsFocused] = createSignal(false);

  const renderValues = createMemo<TagListRenderProps>(() => ({
    isEmpty: local.items.length === 0,
    isFocused: isFocused(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TagList",
    },
    renderValues,
  );

  const contextValue: TagGroupContextValue = {
    state,
    get onRemove() {
      return local.onRemove;
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };

  return (
    <TagGroupContext.Provider value={contextValue}>
      <TagListStateContext.Provider value={state}>
        <div
          ref={setGridRef}
          {...domProps}
          {...tagGroupAria.gridProps}
          class={renderProps.class()}
          style={renderProps.style()}
          onFocus={() => {
            setIsFocused(true);
            state.setFocused(true);
          }}
          onBlur={(e) => {
            const nextTarget = e.relatedTarget as Node | null;
            if (nextTarget && e.currentTarget.contains(nextTarget)) {
              return;
            }

            setIsFocused(false);
            state.setFocused(false);
          }}
          data-empty={dataAttr(local.items.length === 0)}
          data-focused={dataAttr(isFocused())}
        >
          <SharedElementTransition>
            <Show when={local.items.length > 0} fallback={local.renderEmptyState?.()}>
              <For each={local.items}>{(item) => props.children(item)}</For>
            </Show>
          </SharedElementTransition>
        </div>
      </TagListStateContext.Provider>
    </TagGroupContext.Provider>
  );
}

/**
 * A Tag is an individual item within a TagList.
 */
export function Tag(props: TagProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "id",
    "class",
    "style",
    "slot",
    "isDisabled",
    "textValue",
    "onAction",
  ]);

  const state = useContext(TagListStateContext);
  const groupContext = useContext(TagGroupContext);

  // Create a ref for the tag
  const [tagRef, setTagRef] = createSignal<HTMLDivElement | null>(null);

  // Create tag accessibility props
  const tagAria = createTag(
    {
      get key() {
        return local.id;
      },
      role: "row",
      get isDisabled() {
        return local.isDisabled || groupContext?.isDisabled;
      },
      get textValue() {
        return local.textValue;
      },
    },
    state!,
    tagRef,
  );

  const normalizedRemoveButtonProps = createMemo<Record<string, unknown>>(() => {
    const raw = tagAria.removeButtonProps;
    const rawHandler = typeof raw.onPress === "function" ? (raw.onPress as () => void) : undefined;
    return {
      ...raw,
      onPress: () => {
        if (!tagAria.isDisabled && groupContext?.onRemove) {
          groupContext.onRemove(new Set([local.id]));
          return;
        }
        rawHandler?.();
      },
    };
  });

  const renderValues = createMemo<TagRenderProps>(() => ({
    isSelected: tagAria.isSelected,
    isDisabled: tagAria.isDisabled,
    isFocused: tagAria.isFocused,
    isPressed: tagAria.isPressed,
    allowsRemoving: tagAria.allowsRemoving,
    selectionMode: state?.selectionMode() ?? "none",
    removeButtonProps: normalizedRemoveButtonProps(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Tag",
    },
    renderValues,
  );

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: () => tagAria.isSelected,
  }));

  const domProps = createMemo(() => filterDOMProps(rest, { global: true }));

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      <TagContext.Provider
        value={{
          get removeButtonProps() {
            return normalizedRemoveButtonProps();
          },
          get allowsRemoving() {
            return tagAria.allowsRemoving;
          },
        }}
      >
        <div
          ref={setTagRef}
          {...domProps()}
          {...tagAria.rowProps}
          class={renderProps.class()}
          style={renderProps.style()}
          onClick={(event) => {
            const rowClick = tagAria.rowProps.onClick;
            if (typeof rowClick === "function") {
              (rowClick as JSX.EventHandler<HTMLDivElement, MouseEvent>)(event);
            }

            if (!tagAria.isDisabled && !(event.target as Element | null)?.closest("button")) {
              local.onAction?.(local.id);
            }
          }}
          data-selected={dataAttr(tagAria.isSelected)}
          data-disabled={dataAttr(tagAria.isDisabled)}
          data-focused={dataAttr(tagAria.isFocused)}
          data-pressed={dataAttr(tagAria.isPressed)}
          data-allows-removing={dataAttr(tagAria.allowsRemoving)}
        >
          <div {...tagAria.gridCellProps} style={{ display: "contents" }}>
            {renderProps.renderChildren()}
          </div>
        </div>
      </TagContext.Provider>
    </SelectionIndicatorContext.Provider>
  );
}

export interface TagRemoveButtonProps {
  /** The children of the button (usually an X icon). */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
  /** Explicit button props from Tag render props. */
  buttonProps?: Record<string, unknown>;
}

/**
 * TagRemoveButton is the button used to remove a tag.
 * It should be placed inside a Tag component.
 */
export function TagRemoveButton(props: TagRemoveButtonProps): JSX.Element {
  const tagContext = useContext(TagContext);
  const getRemoveButtonProps = () => props.buttonProps ?? tagContext?.removeButtonProps ?? {};
  const getIsDisabled = () => Boolean(getRemoveButtonProps().isDisabled);
  const rawId = getRemoveButtonProps().id;
  const rawAriaLabel = getRemoveButtonProps()["aria-label"];
  const rawAriaLabelledBy = getRemoveButtonProps()["aria-labelledby"];
  const buttonId: string | undefined = typeof rawId === "string" ? rawId : undefined;
  const ariaLabel: string = typeof rawAriaLabel === "string" ? rawAriaLabel : "Remove";
  const ariaLabelledBy: string | undefined =
    typeof rawAriaLabelledBy === "string" ? rawAriaLabelledBy : undefined;

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    event.stopPropagation();
    const handler = getRemoveButtonProps().onPress;
    if (typeof handler === "function" && !getIsDisabled()) {
      (handler as () => void)();
    }
  };
  const stopRowPress: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (event) => {
    event.stopPropagation();
  };

  return (
    <button
      type="button"
      class={props.class ?? "solidaria-TagRemoveButton"}
      style={props.style}
      id={buttonId}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      disabled={getIsDisabled()}
      data-allows-removing={dataAttr(tagContext?.allowsRemoving ?? false)}
      onPointerDown={stopRowPress}
      onClick={handleClick}
    >
      {props.children ?? "×"}
    </button>
  );
}

export type { Key, SelectionMode, SelectionBehavior };
