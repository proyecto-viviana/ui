/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/TagGroup.tsx

/**
 * TagGroup component for solidaria-components
 *
 * Pre-wired headless tag group component that combines aria hooks.
 * Port of react-aria-components/src/TagGroup.tsx
 *
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 */

import { createContext, createMemo, createSignal, useContext, For, Show } from "solid-js";
import type { Context } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createButton,
  createFocusRing,
  createHover,
  createId,
  createSlotId,
  createTagGroup,
  createTag,
  useLocale,
  type AriaTagGroupProps,
} from "@proyecto-viviana/solidaria";
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
  type RefLike,
  useRenderProps,
  filterDOMProps,
  dataAttr,
  mergeRefs,
  assignRef,
  useSlot,
  Provider,
} from "./utils";
import { LabelContext } from "./Label";
import { TextContext } from "./Text";
import { ButtonContext, type ButtonProps } from "./Button";
import { SharedElementTransition } from "./SharedElementTransition";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
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
    Omit<
      JSX.HTMLAttributes<HTMLDivElement>,
      "class" | "style" | "children" | "aria-label" | "aria-labelledby" | "aria-describedby"
    > {
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
  /** Whether the tag list itself is focused. */
  isFocused: boolean;
  /** Whether the tag list itself is keyboard focused. */
  isFocusVisible: boolean;
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
  /** Whether the tag is keyboard focused. */
  isFocusVisible: boolean;
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
  /** A ref to the tag's DOM element (merged with the internal collection ref). */
  ref?: RefLike<HTMLDivElement>;
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

// Label and help text are siblings of TagList, so the group mints their ids
// and the list points the grid at them. Remove-button text, aria-live, and
// focusing the list when the last tag disappears stay out of this path (#54).
interface TagGroupFieldContextValue {
  descriptionId: () => string | undefined;
  errorMessageId: () => string | undefined;
  labelledBy: () => string | undefined;
  ariaLabel: () => string | undefined;
  describedBy: () => string | undefined;
}

const TagGroupFieldContext = createContext<TagGroupFieldContextValue | null>(null);

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
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "children",
    "label",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "description",
    "errorMessage",
  ]);

  // Start true when nothing else names the group, matching useSlot: a Label
  // child confirms it, and onSettled clears it when that child is absent.
  const [labelRef, hasLabel] = useSlot(
    !local["aria-label"] && !local["aria-labelledby"] && !local.label,
  );
  const labelId = createId();
  const descriptionId = createSlotId([
    () => Boolean(local.description),
    () => Boolean(local.errorMessage),
  ]);
  const errorMessageId = createSlotId([
    () => Boolean(local.description),
    () => Boolean(local.errorMessage),
  ]);
  const field: TagGroupFieldContextValue = {
    descriptionId,
    errorMessageId,
    labelledBy: () => local["aria-labelledby"] ?? (hasLabel() ? labelId : undefined),
    ariaLabel: () => local["aria-label"],
    describedBy: () => local["aria-describedby"],
  };
  const textSlots = {
    slots: {
      get description() {
        return { id: descriptionId() };
      },
      get errorMessage() {
        return { id: errorMessageId() };
      },
    },
  };

  return (
    <div
      {...domProps}
      class={typeof local.class === "string" ? local.class : "solidaria-TagGroup"}
      style={typeof local.style === "object" ? local.style : undefined}
      slot={local.slot}
    >
      <TagGroupFieldContext value={field}>
        <LabelContext
          value={{
            ref: labelRef,
            elementType: "span",
            get id() {
              return labelId;
            },
          }}
        >
          <TextContext value={textSlots}>{local.children}</TextContext>
        </LabelContext>
      </TagGroupFieldContext>
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

  // The tag group navigates on the inline axis, so ArrowLeft/ArrowRight flip
  // under RTL. Thread the resolved layout direction into the hook (mirrors
  // ListBox, and useTagGroup passing `direction` to the ListKeyboardDelegate).
  const locale = useLocale();
  const field = useContext(TagGroupFieldContext);

  // Callback-valued props must not go through createMemo — a memo that
  // stores a function is easy to unwrap/call, and the live getter
  // `onRemove={handler()}` must re-read on each access.
  const onRemove = () => local.onRemove;

  const labelledBy = () => local["aria-labelledby"] ?? field?.labelledBy();
  const describedBy = () => {
    const ids = [
      field?.descriptionId(),
      field?.errorMessageId(),
      local["aria-describedby"] ?? field?.describedBy(),
    ].filter((id): id is string => !!id);
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  const tagGroupAria = createTagGroup(
    {
      get "aria-label"() {
        if (local["aria-label"] != null) {
          return local["aria-label"];
        }
        // A real label id suppresses the string fallback; the grid is named
        // by aria-labelledby. TagList's own label still wins when no id is set.
        if (labelledBy()) {
          return field?.ariaLabel();
        }
        return local.label ?? field?.ariaLabel();
      },
      get "aria-labelledby"() {
        return labelledBy();
      },
      get "aria-describedby"() {
        return describedBy();
      },
      get isDisabled() {
        return local.isDisabled;
      },
      get onRemove() {
        return onRemove();
      },
      get direction() {
        return locale().direction;
      },
    },
    state,
    gridRef,
  );

  // Self ring: a focused row must not mark the list. Solid onFocus does not
  // bubble, which matches useFocusRing() with no `within`.
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TagListRenderProps>(() => ({
    isEmpty: local.items.length === 0,
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
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
      return onRemove();
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };

  return (
    <TagGroupContext value={contextValue}>
      <TagListStateContext value={state}>
        <div
          ref={setGridRef}
          {...domProps}
          {...tagGroupAria.gridProps}
          class={renderProps.class()}
          style={renderProps.style()}
          // Chain after the grid trampoline. Replacing gridProps.onFocus would
          // skip the move onto the first or last row.
          onFocus={(event) => {
            tagGroupAria.gridProps.onFocus?.(event);
            focusProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            tagGroupAria.gridProps.onBlur?.(event);
            focusProps.onBlur?.(event);
          }}
          data-empty={dataAttr(local.items.length === 0)}
          data-focused={dataAttr(isFocused())}
          data-focus-visible={dataAttr(isFocusVisible())}
        >
          <SharedElementTransition>
            <Show when={local.items.length > 0} fallback={local.renderEmptyState?.()}>
              <For each={local.items}>{(item) => props.children(item)}</For>
            </Show>
          </SharedElementTransition>
        </div>
      </TagListStateContext>
    </TagGroupContext>
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
    "ref",
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
      get onAction() {
        return local.onAction ? () => local.onAction?.(local.id) : undefined;
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
        rawHandler?.();
      },
    };
  });

  const allowsRemoving = createMemo(
    () => Boolean(tagAria.allowsRemoving) || Boolean(groupContext?.onRemove),
  );
  const renderValues = createMemo<TagRenderProps>(() => ({
    isSelected: tagAria.isSelected,
    isDisabled: tagAria.isDisabled,
    isFocused: tagAria.isFocused,
    isFocusVisible: tagAria.isFocusVisible,
    isPressed: tagAria.isPressed,
    allowsRemoving: allowsRemoving(),
    selectionMode: state?.selectionMode() ?? "none",
    removeButtonProps: normalizedRemoveButtonProps(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
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

  // Pin remove props carry no tabIndex. #318 keeps tabIndex -1 on TagRemoveButton.
  const removeButtonSlot: ButtonProps = {
    get id() {
      return tagAria.removeButtonProps.id as string;
    },
    get "aria-label"() {
      return tagAria.removeButtonProps["aria-label"] as string;
    },
    get "aria-labelledby"() {
      return tagAria.removeButtonProps["aria-labelledby"] as string;
    },
    get isDisabled() {
      return Boolean(tagAria.removeButtonProps.isDisabled);
    },
    onPress() {
      const handler = tagAria.removeButtonProps.onPress;
      if (typeof handler === "function") {
        handler();
      }
    },
  };
  const buttonContextValue = {
    slots: {
      remove: removeButtonSlot,
    },
  };

  return (
    <SelectionIndicatorContext value={selectionIndicatorContext()}>
      <TagContext
        value={{
          get removeButtonProps() {
            return normalizedRemoveButtonProps();
          },
          get allowsRemoving() {
            return allowsRemoving();
          },
        }}
      >
        <div
          ref={mergeRefs(setTagRef, local.ref)}
          {...domProps()}
          {...tagAria.rowProps}
          class={renderProps.class()}
          style={renderProps.style()}
          data-selected={dataAttr(tagAria.isSelected)}
          data-disabled={dataAttr(tagAria.isDisabled)}
          data-focused={dataAttr(tagAria.isFocused)}
          data-focus-visible={dataAttr(tagAria.isFocusVisible)}
          data-pressed={dataAttr(tagAria.isPressed)}
          data-allows-removing={dataAttr(allowsRemoving())}
        >
          <div {...tagAria.gridCellProps} style={{ display: "contents" }}>
            <Provider
              values={[[ButtonContext, buttonContextValue]] as Array<[Context<unknown>, unknown]>}
            >
              {renderProps.renderChildrenStable()}
            </Provider>
          </div>
        </div>
      </TagContext>
    </SelectionIndicatorContext>
  );
}

export interface TagRemoveButtonRenderProps {
  /** Whether the remove button is pressed. */
  isPressed: boolean;
  /** Whether the remove button is disabled. */
  isDisabled: boolean;
  /** Whether the remove button is hovered. */
  isHovered: boolean;
  /** Whether the remove button is focused. */
  isFocused: boolean;
  /** Whether the remove button has focus visible. */
  isFocusVisible: boolean;
}

export interface TagRemoveButtonProps
  extends
    SlotProps,
    Omit<
      JSX.ButtonHTMLAttributes<HTMLButtonElement>,
      "children" | "class" | "style" | "disabled" | "ref"
    > {
  /** The children of the button (usually an X icon) or a render function. */
  children?: RenderChildren<TagRemoveButtonRenderProps>;
  /** The CSS className for the element or a function. */
  class?: ClassNameOrFunction<TagRemoveButtonRenderProps>;
  /** The inline style for the element or a function. */
  style?: StyleOrFunction<TagRemoveButtonRenderProps>;
  /** Explicit button props from Tag render props. */
  buttonProps?: Record<string, unknown>;
  /** Ref to the button element. */
  ref?: RefLike<HTMLButtonElement>;
}

/**
 * TagRemoveButton is the button used to remove a tag.
 * It should be placed inside a Tag component.
 */
export function TagRemoveButton(props: TagRemoveButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["children", "class", "style", "buttonProps", "ref"]);

  const tagContext = useContext(TagContext);
  const getRemoveButtonProps = () =>
    (local.buttonProps ?? tagContext?.removeButtonProps ?? {}) as Record<string, unknown>;
  const isDisabled = () => Boolean(getRemoveButtonProps().isDisabled);
  const rawId = () => getRemoveButtonProps().id;
  const rawAriaLabel = () => getRemoveButtonProps()["aria-label"];
  const rawAriaLabelledBy = () => getRemoveButtonProps()["aria-labelledby"];
  const rawTabIndex = () => getRemoveButtonProps().tabIndex;

  const buttonId = () => (typeof rawId() === "string" ? (rawId() as string) : undefined);
  const ariaLabel = () =>
    typeof rawAriaLabel() === "string" ? (rawAriaLabel() as string) : "Remove";
  const ariaLabelledBy = () =>
    typeof rawAriaLabelledBy() === "string" ? (rawAriaLabelledBy() as string) : undefined;
  const tabIndex = () =>
    typeof rawTabIndex() === "number" ? (rawTabIndex() as number) : undefined;

  const { buttonProps, isPressed } = createButton({
    get id() {
      return buttonId();
    },
    get "aria-label"() {
      return ariaLabel();
    },
    get "aria-labelledby"() {
      return ariaLabelledBy();
    },
    get isDisabled() {
      return isDisabled();
    },
    get excludeFromTabOrder() {
      return tabIndex() === -1;
    },
    onPress: (e) => {
      const handler = getRemoveButtonProps().onPress;
      if (typeof handler === "function" && !isDisabled()) {
        (handler as (e: unknown) => void)(e);
      }
    },
  });

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TagRemoveButtonRenderProps>(() => ({
    isPressed: isPressed(),
    isDisabled: isDisabled(),
    isHovered: isHovered(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children ?? "×";
      },
      get class() {
        return local.class;
      },
      get style() {
        return local.style;
      },
      defaultClassName: "solidaria-TagRemoveButton",
    },
    renderValues,
  );

  const cleanButtonProps = () => {
    const { ref: _ref, ...rest } = buttonProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const handlePointerDown: JSX.EventHandler<HTMLButtonElement, PointerEvent> = (event) => {
    event.stopPropagation();
    const handler = cleanButtonProps().onPointerDown;
    if (typeof handler === "function") {
      (handler as JSX.EventHandler<HTMLButtonElement, PointerEvent>)(event);
    }
  };

  const handleMouseDown: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    event.stopPropagation();
    const handler = cleanButtonProps().onMouseDown;
    if (typeof handler === "function") {
      (handler as JSX.EventHandler<HTMLButtonElement, MouseEvent>)(event);
    }
  };

  const handleClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    event.stopPropagation();
    const handler = cleanButtonProps().onClick;
    if (typeof handler === "function") {
      (handler as JSX.EventHandler<HTMLButtonElement, MouseEvent>)(event);
    }
  };

  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
    const handler = cleanButtonProps().onKeyDown;
    if (typeof handler === "function") {
      (handler as JSX.EventHandler<HTMLButtonElement, KeyboardEvent>)(event);
    }
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.stopPropagation();
    }
  };

  const handleKeyUp: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (event) => {
    const handler = cleanButtonProps().onKeyUp;
    if (typeof handler === "function") {
      (handler as JSX.EventHandler<HTMLButtonElement, KeyboardEvent>)(event);
    }
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.stopPropagation();
    }
  };

  return (
    <button
      {...domProps}
      {...cleanButtonProps()}
      {...cleanFocusProps()}
      {...cleanHoverProps()}
      ref={(el) => {
        assignRef(local.ref, el);
      }}
      type="button"
      id={buttonId()}
      aria-label={ariaLabel()}
      aria-labelledby={ariaLabelledBy()}
      tabindex={tabIndex()}
      disabled={isDisabled()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-allows-removing={dataAttr(tagContext?.allowsRemoving ?? false)}
      data-pressed={dataAttr(isPressed())}
      data-disabled={dataAttr(isDisabled())}
      data-hovered={dataAttr(isHovered())}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      onPointerDown={handlePointerDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {renderProps.renderChildrenStable()}
    </button>
  );
}

export type { Key, SelectionMode, SelectionBehavior };
