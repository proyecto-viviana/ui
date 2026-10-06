/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ColorSwatchPicker.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/selection/ListKeyboardDelegate.ts

import { createContext, createEffect, createMemo, createSignal, flush, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createListBox,
  createOption,
  createFocusRing,
  mergeProps,
  useLocale,
  createStringFormatter,
} from "@proyecto-viviana/solidaria";
import {
  createListState,
  normalizeColor,
  type Color,
  type ListState,
  type Key,
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
import { racIntlStrings } from "./intl";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import { ColorPickerContext } from "./ColorPicker";
import { ColorSwatch, ColorSwatchContext } from "./ColorSwatch";

export interface ColorSwatchPickerItemData {
  key: string;
  color: Color;
  textValue: string;
  isDisabled?: boolean;
}

export interface ColorSwatchPickerContextValue {
  state: ListState<ColorSwatchPickerItemData>;
  registerItem: (item: ColorSwatchPickerItemData) => void;
  unregisterItem: (key: string) => void;
}

export const ColorSwatchPickerContext = createContext<ColorSwatchPickerContextValue | null>(null);

export interface ColorSwatchPickerRenderProps {
  /** Whether the swatch picker has focus. */
  isFocused: boolean;
  /** Whether the swatch picker has keyboard focus. */
  isFocusVisible: boolean;
  /** The currently selected color. */
  selectedColor: Color;
  /** Item arrangement mode. */
  layout: "grid" | "stack";
}

export interface ColorSwatchPickerProps extends SlotProps {
  /** The element's unique identifier. */
  id?: string;
  /** The current color value (controlled). */
  value?: Color | string;
  /** The default color value (uncontrolled). */
  defaultValue?: Color | string;
  /** Handler called when the selected color changes. */
  onChange?: (color: Color) => void;
  /** Accessible label for the swatch picker. */
  "aria-label"?: string;
  /** ID of element that labels the swatch picker. */
  "aria-labelledby"?: string;
  /** ID of element that describes the swatch picker. */
  "aria-describedby"?: string;
  /** ID of element that provides detailed information about the swatch picker. */
  "aria-details"?: string;
  /** Whether swatches are arranged as a grid or stack. */
  layout?: "grid" | "stack";
  /** The children (ColorSwatchPickerItem elements). */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchPickerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchPickerRenderProps>;
}

export interface ColorSwatchPickerItemRenderProps {
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is focused. */
  isFocused: boolean;
  /** Whether the item has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the item is pressed. */
  isPressed: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** The color represented by the item. */
  color: Color;
}

export interface ColorSwatchPickerItemProps extends SlotProps {
  /** The color represented by this swatch item. */
  color: Color | string;
  /** Whether this item is disabled. */
  isDisabled?: boolean;
  /** Accessible label for this item. */
  "aria-label"?: string;
  /** The children of the swatch item. */
  children?: RenderChildren<ColorSwatchPickerItemRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ColorSwatchPickerItemRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ColorSwatchPickerItemRenderProps>;
}

export function ColorSwatchPicker(props: ColorSwatchPickerProps): JSX.Element {
  const pickerContext = useContext(ColorPickerContext);
  const locale = useLocale();
  const stringFormatter = createStringFormatter(racIntlStrings, "react-aria-components");
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "layout",
    "children",
    "class",
    "style",
    "slot",
  ]);

  const [itemMap, setItemMap] = createSignal<Map<string, ColorSwatchPickerItemData>>(new Map(), {
    ownedWrite: true,
  });
  const [itemOrder, setItemOrder] = createSignal<string[]>([], { ownedWrite: true });
  const [internalColor, setInternalColor] = createSignal<Color>(
    normalizeColor(local.defaultValue ?? pickerContext?.value ?? "#000000"),
  );

  const selectedColor = createMemo<Color>(() => {
    if (local.value !== undefined) {
      return normalizeColor(local.value);
    }
    if (pickerContext?.value !== undefined) {
      return normalizeColor(pickerContext.value);
    }
    return internalColor();
  });

  const selectedKey = createMemo(() => selectedColor().toString("hexa"));
  const isControlled = createMemo(
    () => local.value !== undefined || pickerContext?.value !== undefined,
  );

  const registerItem = (item: ColorSwatchPickerItemData) => {
    setItemMap((prev) => {
      const next = new Map(prev);
      next.set(item.key, item);
      return next;
    });
    setItemOrder((prev) => (prev.includes(item.key) ? prev : [...prev, item.key]));
  };

  const unregisterItem = (key: string) => {
    setItemMap((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    setItemOrder((prev) => prev.filter((itemKey) => itemKey !== key));
  };

  const items = createMemo(() => {
    const map = itemMap();
    return itemOrder()
      .map((key) => map.get(key))
      .filter((item): item is ColorSwatchPickerItemData => item != null);
  });

  const state = createListState<ColorSwatchPickerItemData>({
    get items() {
      return items();
    },
    get getKey() {
      return (item: ColorSwatchPickerItemData) => item.key;
    },
    get getTextValue() {
      return (item: ColorSwatchPickerItemData) => item.textValue;
    },
    get getDisabled() {
      return (item: ColorSwatchPickerItemData) => !!item.isDisabled;
    },
    selectionMode: "single",
    disallowEmptySelection: true,
    get selectedKeys() {
      return [selectedKey()];
    },
    onSelectionChange(keys) {
      if (keys === "all") return;
      const key = keys.values().next().value as string | undefined;
      if (!key) return;
      const item = itemMap().get(key);
      if (!item) return;
      if (!isControlled()) {
        setInternalColor(item.color);
      }
      (local.onChange ?? pickerContext?.onChange)?.(item.color);
    },
  });

  const [pickerRef, setPickerRef] = createSignal<HTMLDivElement | null>(null);

  const listBoxAria = createListBox(
    () => ({
      id: local.id,
      "aria-label":
        (local["aria-label"] || undefined) ??
        (!local["aria-labelledby"] ? stringFormatter().format("colorSwatchPicker") : undefined),
      "aria-labelledby": local["aria-labelledby"],
      "aria-describedby": local["aria-describedby"],
      "aria-details": local["aria-details"],
    }),
    state,
    () => pickerRef(),
  );

  const resolveDirection = (): "ltr" | "rtl" => locale().direction;

  const isItemDisabled = (key: Key | null) => {
    if (key == null) return false;
    if (state.isDisabled(key)) return true;
    // Collection disabledKeys can lag the first registration pass; the item
    // map is the live source for ColorSwatchPickerItem `isDisabled`.
    return !!itemMap().get(String(key))?.isDisabled;
  };

  const findNextEnabledKey = (from: Key | null, direction: "next" | "prev") => {
    const collection = state.collection();
    const getAdjacent =
      direction === "next"
        ? (key: Key) => collection.getKeyAfter(key)
        : (key: Key) => collection.getKeyBefore(key);
    const getBoundary =
      direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

    let key = from != null ? getAdjacent(from) : getBoundary();
    while (key != null && isItemDisabled(key)) {
      key = getAdjacent(key);
    }

    return key;
  };

  const getBoundaryEnabledKey = (direction: "next" | "prev") => {
    const collection = state.collection();
    const getAdjacent =
      direction === "next"
        ? (key: Key) => collection.getKeyAfter(key)
        : (key: Key) => collection.getKeyBefore(key);
    const getBoundary =
      direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

    let key = getBoundary();
    while (key != null && isItemDisabled(key)) {
      key = getAdjacent(key);
    }

    return key;
  };

  const getOptionElementForKey = (
    listbox: HTMLElement | null,
    key: Key | null,
  ): HTMLElement | null => {
    if (!listbox || key == null) return null;
    const keyString = String(key);
    for (const optionElement of listbox.querySelectorAll<HTMLElement>('[role="option"]')) {
      if (optionElement.id === keyString) {
        return optionElement;
      }
    }
    return null;
  };

  const findGridKey = (
    listbox: HTMLElement | null,
    key: Key,
    nextKey: (current: Key) => Key | null,
    shouldSkip: (prevRect: DOMRect, itemRect: DOMRect) => boolean,
  ): Key | null => {
    let candidate: Key | null = key;
    const previousRect = getOptionElementForKey(listbox, candidate)?.getBoundingClientRect();
    if (!previousRect) {
      return null;
    }

    while (candidate != null) {
      candidate = nextKey(candidate);
      if (candidate == null) {
        return null;
      }

      const itemRect = getOptionElementForKey(listbox, candidate)?.getBoundingClientRect();
      if (!itemRect) {
        return null;
      }

      if (!shouldSkip(previousRect, itemRect)) {
        return candidate;
      }
    }

    return null;
  };

  const isSameRow = (prevRect: DOMRect, itemRect: DOMRect) =>
    prevRect.y === itemRect.y || prevRect.x !== itemRect.x;
  const getGridKeyBelow = (listbox: HTMLElement | null, key: Key) =>
    findGridKey(listbox, key, (current) => findNextEnabledKey(current, "next"), isSameRow);
  const getGridKeyAbove = (listbox: HTMLElement | null, key: Key) =>
    findGridKey(listbox, key, (current) => findNextEnabledKey(current, "prev"), isSameRow);
  const getGridKeyRightOf = (key: Key) =>
    resolveDirection() === "rtl"
      ? findNextEnabledKey(key, "prev")
      : findNextEnabledKey(key, "next");
  const getGridKeyLeftOf = (key: Key) =>
    resolveDirection() === "rtl"
      ? findNextEnabledKey(key, "next")
      : findNextEnabledKey(key, "prev");

  const handleStackKeyDown = (e: KeyboardEvent): boolean => {
    if ((local.layout ?? "grid") === "grid") return false;
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return false;

    const focusedKey = state.focusedKey();
    const initialKey =
      focusedKey ??
      (e.key === "ArrowUp" ? getBoundaryEnabledKey("prev") : getBoundaryEnabledKey("next"));
    if (initialKey == null) return false;

    const nextKey =
      e.key === "ArrowDown"
        ? findNextEnabledKey(initialKey, "next")
        : findNextEnabledKey(initialKey, "prev");
    if (nextKey != null) {
      state.setFocusedKey(nextKey);
    }

    e.preventDefault();
    e.stopPropagation();
    return true;
  };

  const handleGridKeyDown = (e: KeyboardEvent): boolean => {
    if ((local.layout ?? "grid") !== "grid") return false;
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowDown" &&
      e.key !== "ArrowUp"
    ) {
      return false;
    }

    const listbox = e.currentTarget as HTMLElement | null;
    const focusedKey = state.focusedKey();
    const initialKey =
      focusedKey ??
      (e.key === "ArrowUp" || e.key === "ArrowLeft"
        ? getBoundaryEnabledKey("prev")
        : getBoundaryEnabledKey("next"));
    if (initialKey == null) return false;

    let nextKey: Key | null = null;
    switch (e.key) {
      case "ArrowDown":
        nextKey = getGridKeyBelow(listbox, initialKey);
        break;
      case "ArrowUp":
        nextKey = getGridKeyAbove(listbox, initialKey);
        break;
      case "ArrowRight":
        nextKey = getGridKeyRightOf(initialKey);
        break;
      case "ArrowLeft":
        nextKey = getGridKeyLeftOf(initialKey);
        break;
    }

    // Match the pinned ListKeyboardDelegate: an arrow in grid layout is always
    // consumed (blocking the linear ListBox handler and page scroll),
    // but focus only moves when the delegate yields a next key. With
    // shouldFocusWrap unset (upstream default false) there is no wrap, so arrows
    // stop dead at the grid's edges. Selection is not mutated on arrow — under
    // the default 'toggle' selection behavior focus moves without selecting, and
    // Enter/Space commits (handled by createSelectableItem).
    if (nextKey != null) {
      state.setFocusedKey(nextKey);
    }

    e.preventDefault();
    e.stopPropagation();
    return true;
  };

  const getListBoxKeyDown = () => {
    const props = listBoxAria.listBoxProps as Record<string, unknown>;
    return props.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined;
  };

  const onColorSwatchPickerKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (handleGridKeyDown(e) || handleStackKeyDown(e)) {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      const key = state.focusedKey();
      if (key != null && !isItemDisabled(key)) {
        state.setSelectedKeys([key]);
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    }
    getListBoxKeyDown()?.(e);
  };

  // NB: we deliberately do NOT seed `state.setFocusedKey(selectedKey())` at rest.
  // Upstream's RAC `<ListBox>` (which `AriaColorSwatchPicker` is) keeps
  // `focusedKey == null` until the collection is focused — the listbox CONTAINER
  // is the roving tabstop (`tabIndex 0`), and `useSelectableCollection`'s onFocus
  // navigates to `firstSelectedKey` on entry (mirrored by `createListBox`'s
  // `onListBoxFocus`). Pre-seeding focusedKey to the selected swatch made the
  // selected option the rest tabstop instead (container `tabIndex -1`) — a
  // self-inflicted divergence — and, because our `createFocusWithin` only flips
  // `manager.setFocused(true)` on CONTAINER focus (Solid's `onFocus` is
  // non-bubbling), it also routed entry through a direct option focus that never
  // set `isFocused`, so arrow keys could not pull real DOM focus. Letting the
  // container be the tabstop restores both.

  const { isFocused, isFocusVisible, focusProps } = createFocusRing({ within: true });
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const renderValues = createMemo<ColorSwatchPickerRenderProps>(() => ({
    isFocused: state.isFocused() || isFocused(),
    isFocusVisible: isFocusVisible(),
    selectedColor: selectedColor(),
    layout: local.layout ?? "grid",
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatchPicker",
    },
    renderValues,
  );

  const cleanListBoxProps = () => {
    const {
      ref: _ref,
      onKeyDown: _onKeyDown,
      ...restListBoxProps
    } = listBoxAria.listBoxProps as Record<string, unknown>;
    return restListBoxProps;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...restFocusProps } = focusProps as Record<string, unknown>;
    return restFocusProps;
  };

  return (
    <ColorSwatchPickerContext
      value={{
        state,
        registerItem,
        unregisterItem,
      }}
    >
      <div
        {...mergeProps(domProps(), cleanListBoxProps(), cleanFocusProps(), {
          onKeyDown: onColorSwatchPickerKeyDown,
          onFocus: (e: FocusEvent) => {
            if (e.target !== e.currentTarget) return;
            if (state.focusedKey() == null) {
              const key =
                state.selectionManager.firstSelectedKey ?? state.collection().getFirstKey();
              if (key != null) state.setFocusedKey(key);
            }
            state.setFocused(true);
            try {
              flush();
            } catch {
              /* event handler; ignore forbidden-scope flush */
            }
          },
        })}
        ref={setPickerRef}
        class={renderProps.class()}
        style={renderProps.style()}
        slot={local.slot ?? undefined}
        data-focused={dataAttr(state.isFocused())}
        data-focus-visible={dataAttr(isFocusVisible())}
        data-layout={local.layout ?? "grid"}
      >
        {local.children}
      </div>
    </ColorSwatchPickerContext>
  );
}

export function ColorSwatchPickerItem(props: ColorSwatchPickerItemProps): JSX.Element {
  const context = useContext(ColorSwatchPickerContext);
  if (!context) {
    throw new Error("ColorSwatchPickerItem must be used within a ColorSwatchPicker");
  }

  const [local, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot", "color"],
    ["isDisabled", "aria-label"],
  );

  const color = createMemo(() => normalizeColor(local.color));
  const key = createMemo(() => color().toString("hexa"));
  const textValue = createMemo(() => {
    const locale = globalThis.navigator?.language ?? "en-US";
    return color().getColorName(locale);
  });

  createEffect(
    () => ({
      key: key(),
      color: color(),
      textValue: textValue(),
      isDisabled: ariaProps.isDisabled,
    }),
    (item) => {
      context.registerItem(item);
      return () => context.unregisterItem(item.key);
    },
  );

  const [optionRef, setOptionRef] = createSignal<HTMLElement | null>(null);

  const optionAria = createOption(
    () => ({
      key: key(),
      isDisabled: ariaProps.isDisabled,
      // No aria-label: the option is named by its content (the child swatch's
      // role="img" aria-label), mirroring upstream ColorSwatchPickerItem which
      // sets only textValue (typeahead, threaded via registerItem above) and
      // never an aria-label.
      "aria-label": ariaProps["aria-label"],
    }),
    context.state,
    optionRef,
  );

  const renderValues = createMemo<ColorSwatchPickerItemRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: optionAria.isFocusVisible(),
    isPressed: optionAria.isPressed(),
    isDisabled: optionAria.isDisabled(),
    color: color(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ColorSwatchPickerItem",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const cleanOptionProps = () => {
    const { ref: _ref, ...restOptionProps } = optionAria.optionProps as Record<string, unknown>;
    return restOptionProps;
  };

  return (
    <div
      ref={setOptionRef}
      {...mergeProps(domProps(), cleanOptionProps())}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      <ColorSwatchContext
        value={{
          get color() {
            return color();
          },
        }}
      >
        {renderProps.renderChildren() ?? <ColorSwatch />}
      </ColorSwatchContext>
    </div>
  );
}
