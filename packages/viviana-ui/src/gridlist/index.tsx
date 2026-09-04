// @ts-nocheck

/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ListView.tsx

// Port of packages/@react-spectrum/s2/src/ListView.tsx.

import {
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  GridList as HeadlessGridList,
  GridListItem as HeadlessGridListItem,
  GridListSelectionCheckbox as HeadlessGridListSelectionCheckbox,
  GridListStateContext as HeadlessGridListStateContext,
  type GridListItemProps as HeadlessGridListItemProps,
  type GridListItemRenderProps,
  type GridListProps as HeadlessGridListProps,
  type GridListRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { ActionButtonGroupContext } from "../button/group-context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { Image, ImageContext, ImageCoordinator } from "../image";
import { IconContext } from "../icon";
import Checkmark from "../icon/ui-icons/Checkmark";
import Chevron from "../icon/ui-icons/Chevron";
import LinkOut from "../icon/ui-icons/LinkOut";
import { ActionMenuContext } from "../menu/ActionMenu";
import { useProviderProps } from "../provider";
import type { StyleString } from "../style";
import { baseColor, colorMix, focusRing, space, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { Text, TextContext } from "../text";

export type GridListSize = "sm" | "md" | "lg";
export type GridListVariant = "default" | "cards" | "bordered";
export type GridListLayout = "list" | "grid";
export type GridListSelectionStyle = "checkbox" | "highlight";
export type GridListOverflowMode = "truncate" | "wrap";
export type GridListLoadingState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "sorting"
  | "filtering"
  | "error";

export interface GridListProps<T extends object> extends Omit<
  HeadlessGridListProps<T>,
  "class" | "style" | "children" | "items" | "selectionBehavior" | "isLoading" | "slot" | "ref"
> {
  /** The ListView items. Use static ListViewItem children or a render function with `items`. */
  children: JSX.Element | ((item: T) => JSX.Element);
  /** The items to render for dynamic collections. */
  items?: T[];
  /** Whether the ListView should draw without the default container chrome. */
  isQuiet?: boolean;
  /** How selection is visualized. @default 'checkbox' */
  selectionStyle?: GridListSelectionStyle;
  /** Whether labels and descriptions truncate or wrap. @default 'truncate' */
  overflowMode?: GridListOverflowMode;
  /** Hides the external-link trailing icon on link items. */
  hideLinkOutIcon?: boolean;
  /** Loading state forwarded to load-more behavior. */
  loadingState?: GridListLoadingState;
  /** Provides an action bar when items are selected. */
  renderActionBar?: (selectedKeys: "all" | Set<Key>) => JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the grid list root element. */
  ref?: RefLike<HTMLDivElement>;
  /** Legacy GridList size alias retained for compatibility. */
  size?: GridListSize;
  /** Legacy GridList variant alias retained for compatibility. */
  variant?: GridListVariant;
  /** Legacy GridList layout alias retained for compatibility. */
  layout?: GridListLayout;
  /** Legacy GridList columns alias retained for compatibility. */
  columns?: number | "auto";
  /** Legacy label helper. Prefer aria-label or aria-labelledby. */
  label?: JSX.Element;
  /** Legacy description helper. */
  description?: JSX.Element;
}

export interface GridListItemProps<T extends object> extends Omit<
  HeadlessGridListItemProps<T>,
  "class" | "style" | "children" | "ref"
> {
  /** The unique id of the ListViewItem. */
  id: Key;
  /** The contents of the item. */
  children?: JSX.Element | ((renderProps: GridListItemRenderProps) => JSX.Element);
  /** Whether this item is disabled. Static collections support this directly; dynamic collections can also use `getDisabled`. */
  isDisabled?: boolean;
  /** Whether this item navigates into child content. */
  hasChildItems?: boolean;
  /** Link target metadata for visual parity with React Spectrum's link-out affordance. */
  href?: string;
  target?: string;
  download?: boolean | string;
  rel?: string;
  hrefLang?: string;
  ping?: string;
  referrerPolicy?: string;
  routerOptions?: unknown;
  /** Optional description text. Prefer `<Text slot="description">`. */
  description?: JSX.Element;
  /** Optional icon helper retained from the older GridList API. */
  icon?: () => JSX.Element;
  /** Optional image helper retained from the older GridList API. */
  image?: string;
  /** Alt text for the image helper. */
  imageAlt?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Ref for the rendered row element. */
  ref?: RefLike<HTMLDivElement>;
}

type StaticGridListItem = {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
  props: GridListItemProps<object>;
};

type ItemRegistration = {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
  props?: GridListItemProps<object>;
};

interface StaticCollectionContextValue {
  mode: "static" | "dynamic";
  registerItem(item: ItemRegistration): void;
  unregisterItem(id: Key): void;
}

interface ListViewContextValue {
  isQuiet: boolean;
  selectionStyle: GridListSelectionStyle;
  overflowMode: GridListOverflowMode;
  hideLinkOutIcon: boolean;
}

export const GridListContext = createContext<SpectrumContextValue<GridListProps<unknown>>>(null);
const InternalListViewContext = createContext<ListViewContextValue>({
  isQuiet: false,
  selectionStyle: "checkbox",
  overflowMode: "truncate",
  hideLinkOutIcon: false,
});
const StaticGridListCollectionContext = createContext<StaticCollectionContextValue | null>(null);

const listViewWrapper = style(
  {
    minHeight: 0,
    minWidth: 200,
    display: "flex",
    flexDirection: "column",
    isolation: "isolate",
    position: "relative",
    overflow: "clip",
  },
  getAllowedOverrides({ height: true }),
);

// Mirrors S2: the trailing-icon column width is set on the grid CONTAINER and
// inherits to the rows, so every row reserves the column when ANY row carries a
// trailing icon (grid alignment across rows). `listitem` reads it via
// `var(--trailing-icon-width)`.
const hasTrailingIconRows = ':has([data-has-trailing-icon]) [role="row"]';

const listView = style<GridListRenderProps & { isQuiet?: boolean; isActionBar?: boolean }>(
  {
    ...focusRing(),
    outlineOffset: {
      default: -2,
      isQuiet: -1,
    },
    outlineStyle: "none",
    userSelect: "none",
    minHeight: 0,
    minWidth: 0,
    width: "full",
    height: {
      isActionBar: "full",
    },
    boxSizing: "border-box",
    overflow: "auto",
    fontSize: controlFont(),
    backgroundColor: {
      default: "gray-25",
      isQuiet: "transparent",
    },
    borderRadius: {
      default: "default",
      isQuiet: "none",
    },
    borderColor: "gray-300",
    borderWidth: {
      default: 1,
      isQuiet: 0,
    },
    borderStyle: "solid",
    disableTapHighlight: true,
    "--trailing-icon-width": {
      type: "width",
      value: {
        default: "auto",
        [hasTrailingIconRows]: "1lh",
      },
    },
  },
  getAllowedOverrides({ height: true }),
);

const legacyLabel = style({
  font: controlFont(),
  fontWeight: "medium",
  color: baseColor("neutral"),
  marginBottom: 4,
});

const legacyDescription = style({
  font: "body-sm",
  color: baseColor("neutral-subdued"),
  marginTop: 4,
});

const emptyState = style({
  minHeight: 112,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "neutral",
  font: "body-sm",
});

const emptyStateRow = style({
  display: "contents",
});

const selectedBackground = colorMix("gray-25", "gray-900", 7);
const selectedActiveBackground = colorMix("gray-25", "gray-900", 10);

type ListViewRowLayerProps = GridListItemRenderProps & {
  isQuiet?: boolean;
  isLink?: boolean;
  isFirstItem?: boolean;
  isLastItem?: boolean;
  isNextSelected?: boolean;
  isPrevSelected?: boolean;
  isPrevNotSelected?: boolean;
  isNextNotSelected?: boolean;
  selectionStyle?: GridListSelectionStyle;
  overflowMode?: GridListOverflowMode;
  hasTrailingIcon?: boolean;
};

const listViewItem = style<ListViewRowLayerProps>({
  font: controlFont(),
  outlineStyle: "none",
  boxSizing: "border-box",
  columnGap: 0,
  paddingX: 0,
  paddingY: 8,
  backgroundColor: "transparent",
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isSelected: {
        selectionStyle: {
          highlight: "HighlightText",
        },
      },
      isDisabled: "GrayText",
    },
  },
  position: "relative",
  // In S2 the selection-fill layer (`listViewRowBackground`, `zIndex:-1`) sits
  // inside the Virtualizer's row wrapper (`position:absolute; zIndex:0`), whose
  // stacking context keeps the negative-z fill painting ABOVE the grid's own
  // white background. Our ListView is not virtualized (no such wrapper), so the
  // row itself must establish that stacking context — otherwise the grid's
  // `z-auto` background paints over the `zIndex:-1` fill and the selected row
  // shows no highlight. `z-index` is not a D1-pinned property, so this mirrors
  // S2's rendered result without diverging on any certified computed style.
  zIndex: 0,
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "grid",
  gridTemplateAreas: [
    ". dragbutton . checkmark icon label       actions actionmenu trailing-icon .",
    ". .          . .         .    description actions actionmenu trailing-icon .",
  ],
  gridTemplateColumns: [
    4,
    "auto",
    8,
    "auto",
    "auto",
    "minmax(0, 1fr)",
    "auto",
    "auto",
    "var(--trailing-icon-width)",
    6,
  ],
  gridTemplateRows: "1fr auto",
  rowGap: {
    ":has([slot=description])": space(1),
  },
  alignItems: "baseline",
  minHeight: 40,
  textDecoration: "none",
  cursor: {
    default: "default",
    isLink: "pointer",
  },
  "--borderColor": {
    type: "borderColor",
    value: {
      default: "gray-300",
      forcedColors: "ButtonBorder",
      isSelected: {
        selectionStyle: {
          highlight: {
            default: "blue-900",
            forcedColors: "Highlight",
          },
          checkbox: "gray-300",
        },
      },
    },
  },
  borderTopWidth: 0,
  borderBottomWidth: {
    default: 1,
    isLastItem: {
      default: 1,
      isQuiet: 0,
    },
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: "solid",
  borderColor: {
    default: "--borderColor",
    isNextSelected: "transparent",
    isSelected: "transparent",
    forcedColors: "ButtonBorder",
  },
  "--radius": {
    type: "borderTopStartRadius",
    value: "default",
  },
  forcedColorAdjust: "none",
});

const insetBorderRadius = "calc(var(--radius) - 1px)";

const listViewRowBackground = style<ListViewRowLayerProps>({
  position: "absolute",
  zIndex: -1,
  top: {
    default: 0,
    isSelected: "[-1px]",
    isPrevSelected: 0,
    isFirstItem: 0,
    forcedColors: 0,
  },
  left: 0,
  right: 0,
  bottom: {
    default: 0,
    isSelected: "[-1px]",
  },
  backgroundColor: {
    default: "transparent",
    isHovered: {
      default: "gray-900/5",
      selectionStyle: {
        checkbox: selectedBackground,
      },
    },
    isPressed: {
      default: "gray-900/10",
      selectionStyle: {
        checkbox: selectedActiveBackground,
      },
    },
    isSelected: {
      selectionStyle: {
        checkbox: {
          default: selectedBackground,
          isHovered: selectedActiveBackground,
          isPressed: selectedActiveBackground,
          isFocusVisible: selectedActiveBackground,
        },
        highlight: {
          default: colorMix("gray-25", "blue-900", 10),
          isHovered: colorMix("gray-25", "blue-900", 15),
          isPressed: colorMix("gray-25", "blue-900", 15),
        },
      },
    },
    forcedColors: {
      default: "Background",
      selectionStyle: {
        highlight: {
          isSelected: "Highlight",
        },
      },
    },
  },
  borderTopStartRadius: {
    isQuiet: "default",
    isSelected: "none",
    isPrevNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: "none",
          highlight: `[${insetBorderRadius}]`,
        },
      },
      isQuiet: "default",
    },
  },
  borderTopEndRadius: {
    isQuiet: "default",
    isSelected: "none",
    isPrevNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: "none",
          highlight: `[${insetBorderRadius}]`,
        },
      },
      isQuiet: "default",
    },
  },
  borderBottomStartRadius: {
    isQuiet: "default",
    isSelected: "none",
    isNextNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: "none",
          highlight: `[${insetBorderRadius}]`,
        },
      },
      isQuiet: "default",
    },
  },
  borderBottomEndRadius: {
    isQuiet: "default",
    isSelected: "none",
    isNextNotSelected: {
      isSelected: {
        selectionStyle: {
          checkbox: "none",
          highlight: `[${insetBorderRadius}]`,
        },
      },
      isQuiet: "default",
    },
  },
  borderTopWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1,
      },
    },
    isPrevSelected: 0,
  },
  borderBottomWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1,
      },
    },
    isNextSelected: 0,
  },
  borderStartWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1,
      },
    },
  },
  borderEndWidth: {
    default: {
      selectionStyle: {
        checkbox: 0,
        highlight: 1,
      },
    },
  },
  borderStyle: "solid",
  borderColor: {
    default: "transparent",
    isSelected: {
      selectionStyle: {
        checkbox: "transparent",
        highlight: "--borderColor",
      },
    },
  },
});

const listViewRowFocusRing = style<ListViewRowLayerProps>({
  ...focusRing(),
  outlineOffset: {
    default: -2,
    forcedColors: -3,
  },
  outlineWidth: {
    default: 2,
    forcedColors: "[3px]",
  },
  outlineColor: {
    default: "focus-ring",
    forcedColors: {
      default: "Highlight",
      selectionStyle: {
        highlight: "ButtonBorder",
      },
    },
  },
  position: "absolute",
  inset: 0,
  top: {
    default: "[-1px]",
    isFirstItem: 0,
  },
  bottom: {
    selectionStyle: {
      checkbox: {
        default: "[-1px]",
        isNextSelected: 0,
      },
      highlight: "[-1px]",
    },
  },
  borderRadius: {
    default: `[${insetBorderRadius}]`,
    isQuiet: "default",
  },
  zIndex: 1,
  pointerEvents: "none",
});

const listViewItemCell = style({
  display: "contents",
});

const listViewCheckbox = style<GridListItemRenderProps>({
  gridArea: "checkmark",
  gridRowEnd: "span 2",
  alignSelf: "center",
  justifySelf: "center",
  marginEnd: 8,
  position: "relative",
  width: 16,
  height: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // Mirrors S2 `listCheckbox` (ListView.tsx:808-811): a disabled row still
  // RENDERS the selection checkbox (so the checkmark grid track keeps its width
  // and rows stay aligned) but hides it via `visibility`.
  visibility: {
    default: "visible",
    isDisabled: "hidden",
  },
});

const listViewCheckboxInput = style({
  // Mirrors S2's `<Checkbox slot="selection">` input: an opacity-0 overlay left
  // at the browser's intrinsic checkbox size (13×13 in Chromium — S2 sets no
  // explicit width/height, and `inset:0` would wrongly stretch a form control),
  // sitting over the visual `listViewCheckboxBox`.
  position: "absolute",
  margin: 0,
  opacity: 0,
  cursor: "inherit",
});

const listViewCheckboxBox = style<GridListItemRenderProps>({
  ...focusRing(),
  size: 16,
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: "row",
  boxSizing: "border-box",
  backgroundColor: {
    default: "gray-25",
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
  },
  borderColor: {
    default: baseColor("gray-800"),
    isSelected: "transparent",
    isDisabled: "disabled",
  },
});

const listViewCheckboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
});

const listViewSlotIcon = style<GridListItemRenderProps>({
  gridArea: "icon",
  gridRowEnd: "span 2",
  display: "block",
  size: "1lh",
  alignSelf: "center",
  marginEnd: "text-to-visual",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const listViewImage = style({
  gridArea: "icon",
  gridRowEnd: "span 2",
  alignSelf: "center",
  justifySelf: "center",
  size: 32,
  borderRadius: "row",
  objectFit: "cover",
  marginEnd: "text-to-visual",
});

const listViewLabel = style<GridListItemRenderProps & { overflowMode?: GridListOverflowMode }>({
  gridArea: "label",
  minWidth: 0,
  alignSelf: "center",
  font: controlFont(),
  color: "inherit",
  overflow: "hidden",
  textOverflow: {
    overflowMode: {
      truncate: "ellipsis",
    },
  },
  whiteSpace: {
    overflowMode: {
      truncate: "nowrap",
      wrap: "normal",
    },
  },
});

const listViewDescription = style<
  GridListItemRenderProps & { overflowMode?: GridListOverflowMode }
>({
  gridArea: "description",
  minWidth: 0,
  alignSelf: "center",
  font: "ui-sm",
  color: {
    default: baseColor("neutral-subdued"),
    isDisabled: "disabled",
  },
  overflow: "hidden",
  textOverflow: {
    overflowMode: {
      truncate: "ellipsis",
    },
  },
  whiteSpace: {
    overflowMode: {
      truncate: "nowrap",
      wrap: "normal",
    },
  },
  transition: "default",
});

const listViewActions = style({
  gridArea: "actions",
  gridRowEnd: "span 2",
  alignSelf: "center",
  justifySelf: "end",
  marginStart: "text-to-visual",
});

const listViewActionMenu = style({
  gridArea: "actionmenu",
  gridRowEnd: "span 2",
  alignSelf: "center",
});

const listViewTrailingIcon = style<GridListItemRenderProps>({
  gridArea: "trailing-icon",
  gridRowEnd: "span 2",
  alignSelf: "center",
  display: "flex",
  alignItems: "center",
  justifySelf: "end",
  marginStart: "text-to-visual",
  color: {
    default: "neutral-subdued",
    isDisabled: "disabled",
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

function selectedKeySet(keys: "all" | Iterable<Key> | undefined): "all" | Set<Key> {
  if (keys === "all") {
    return "all";
  }

  return new Set(keys ?? []);
}

function keyFromItem<T extends object>(
  item: T,
  getKey: ((item: T) => Key) | undefined,
  index: number,
): Key {
  return (
    getKey?.(item) ?? (item as { id?: Key; key?: Key }).id ?? (item as { key?: Key }).key ?? index
  );
}

function isTextOnlyChildren(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") {
    return true;
  }

  return Array.isArray(value) && value.every(isTextOnlyChildren);
}

function replaceManagedClass(element: Element, dataAttribute: string, nextClass: string): void {
  const previousClass = element.getAttribute(dataAttribute);
  for (const className of previousClass?.split(/\s+/).filter(Boolean) ?? []) {
    element.classList.remove(className);
  }

  for (const className of nextClass.split(/\s+/).filter(Boolean)) {
    element.classList.add(className);
  }

  element.setAttribute(dataAttribute, nextClass);
}

function applyItemSlotClasses(
  root: HTMLElement | undefined,
  renderProps: GridListItemRenderProps,
  context: ListViewContextValue,
): void {
  if (!root) {
    return;
  }

  const state = {
    ...renderProps,
    overflowMode: context.overflowMode,
  };

  const gridCell = root.querySelector('[role="gridcell"]');
  if (gridCell) {
    replaceManagedClass(gridCell, "data-s2-listview-cell-class", listViewItemCell);
  }

  for (const element of Array.from(
    root.querySelectorAll('[slot="label"], [data-slot="label"], [data-rsp-slot="label"]'),
  )) {
    replaceManagedClass(element, "data-s2-listview-slot-class", listViewLabel(state));
    element.setAttribute("data-rsp-slot", "label");
  }

  for (const element of Array.from(
    root.querySelectorAll(
      '[slot="description"], [data-slot="description"], [data-rsp-slot="description"]',
    ),
  )) {
    replaceManagedClass(element, "data-s2-listview-slot-class", listViewDescription(state));
    element.setAttribute("data-rsp-slot", "description");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="icon"], [data-slot="icon"]'))) {
    replaceManagedClass(element, "data-s2-listview-slot-class", listViewSlotIcon);
    element.setAttribute("data-rsp-slot", "icon");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="actions"]'))) {
    replaceManagedClass(element, "data-s2-listview-slot-class", listViewActions);
    element.setAttribute("data-rsp-slot", "actions");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="actionmenu"]'))) {
    replaceManagedClass(element, "data-s2-listview-slot-class", listViewActionMenu);
    element.setAttribute("data-rsp-slot", "actionmenu");
  }
}

export function GridList<T extends object>(props: GridListProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(
    useContext(GridListContext) as SpectrumContextValue<GridListProps<T>>,
    props.slot,
  );
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "children",
    "items",
    "isQuiet",
    "selectionStyle",
    "overflowMode",
    "hideLinkOutIcon",
    "loadingState",
    "renderActionBar",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
    "size",
    "variant",
    "layout",
    "columns",
    "label",
    "description",
    "isLoading",
    "hasMore",
    "onLoadMore",
  ]);
  const isQuiet = () => !!local.isQuiet;
  const selectionStyle = (): GridListSelectionStyle => local.selectionStyle ?? "checkbox";
  const overflowMode = (): GridListOverflowMode => local.overflowMode ?? "truncate";
  const isLoading = () =>
    local.isLoading || local.loadingState === "loading" || local.loadingState === "loadingMore";
  const [staticItems, setStaticItems] = createSignal<StaticGridListItem[]>([]);
  const [registrationVersion, setRegistrationVersion] = createSignal(0);
  const registeredItems = new Map<Key, ItemRegistration>();
  const usesStaticChildren = () => local.items == null;
  const syncRegisteredItems = () => {
    setStaticItems(
      Array.from(registeredItems.values())
        .filter((item) => item.props)
        .map((item) => ({
          id: item.id,
          textValue: item.textValue,
          isDisabled: item.isDisabled,
          props: item.props!,
        })),
    );
    setRegistrationVersion((version) => version + 1);
  };
  const registrationContext: StaticCollectionContextValue = {
    get mode() {
      return usesStaticChildren() ? "static" : "dynamic";
    },
    registerItem(item) {
      const previous = registeredItems.get(item.id);
      if (
        previous &&
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled &&
        previous.props === item.props
      ) {
        return;
      }

      registeredItems.set(item.id, item);
      syncRegisteredItems();
    },
    unregisterItem(id) {
      if (registeredItems.delete(id)) {
        syncRegisteredItems();
      }
    },
  };
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  // Deliberately NOT a `createMemo`: static children register themselves into
  // `staticItems` (via a `createRenderEffect` in `GridListItem`) synchronously
  // DURING this same render pass, before this accessor is read for the
  // `HeadlessGridList` `items` prop below — but AFTER `collectionItems` itself
  // would have been constructed. A `createMemo` here caches its FIRST
  // evaluation and, under solid-js's SSR reactive system, never re-runs on a
  // later read even though the `staticItems` signal was written meanwhile
  // (memo invalidation is a client-only concern; `renderToString` computes
  // memos once and freezes them) — so every static-children ListView would
  // render `renderEmptyState()` ("No items") on the server no matter how many
  // real `<ListViewItem>` children it had. A plain accessor re-reads the
  // signal fresh on every call in both SSR and CSR, and still participates
  // correctly in client-side reactivity because reading `staticItems()`
  // inside it registers the dependency on whichever computation calls it.
  const collectionItems = () =>
    usesStaticChildren() ? (staticItems() as unknown as T[]) : (local.items ?? []);
  const getKey = createMemo(() =>
    usesStaticChildren()
      ? (item: T) => (item as unknown as StaticGridListItem).id
      : headlessProps.getKey,
  );
  const getTextValue = createMemo(() =>
    usesStaticChildren()
      ? (item: T) =>
          (item as unknown as StaticGridListItem).textValue ??
          String((item as unknown as StaticGridListItem).id)
      : headlessProps.getTextValue,
  );
  const getDisabled = createMemo(() => {
    if (usesStaticChildren()) {
      return (item: T) => Boolean((item as unknown as StaticGridListItem).isDisabled);
    }

    return (item: T) => {
      registrationVersion();
      const key = keyFromItem(item, headlessProps.getKey, local.items?.indexOf(item) ?? 0);
      return (
        Boolean(registeredItems.get(key)?.isDisabled) ||
        Boolean(headlessProps.getDisabled?.(item)) ||
        Boolean((item as { isDisabled?: boolean }).isDisabled)
      );
    };
  });
  const [actionSelectedKeys, setActionSelectedKeys] = createSignal<"all" | Set<Key>>(
    selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
  );
  createEffect(() => {
    setActionSelectedKeys(
      selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
    );
  });
  const onSelectionChange = (keys: "all" | Set<Key>) => {
    setActionSelectedKeys(keys === "all" ? "all" : new Set(keys));
    headlessProps.onSelectionChange?.(keys);
  };
  const listViewContext = createMemo<ListViewContextValue>(() => ({
    isQuiet: isQuiet(),
    selectionStyle: selectionStyle(),
    overflowMode: overflowMode(),
    hideLinkOutIcon: !!local.hideLinkOutIcon,
  }));
  const className = (renderProps: GridListRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      mergeStyles(
        listView({
          ...renderProps,
          isQuiet: isQuiet(),
          isActionBar: !!local.renderActionBar,
        }),
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const renderEmptyState = () => (
    <div role="row" class={emptyStateRow}>
      <div role="gridcell" aria-colindex="1" class={emptyState}>
        {headlessProps.renderEmptyState?.() ?? "No items"}
      </div>
    </div>
  );
  const renderItem = (item: T) =>
    usesStaticChildren() ? (
      <GridListItem {...((item as unknown as StaticGridListItem).props as GridListItemProps<T>)} />
    ) : typeof local.children === "function" ? (
      local.children(item)
    ) : null;
  const registrationChildren = () => {
    if (usesStaticChildren()) {
      const resolved = resolveChildren(() => local.children as JSX.Element);
      return resolved();
    }

    if (typeof local.children !== "function") {
      return null;
    }

    return (local.items ?? []).map((item) => local.children(item));
  };

  const collection = (
    <InternalListViewContext.Provider value={listViewContext()}>
      <StaticGridListCollectionContext.Provider value={registrationContext}>
        {registrationChildren()}
      </StaticGridListCollectionContext.Provider>
      <ImageCoordinator>
        <HeadlessGridList
          {...headlessProps}
          ref={(element: HTMLDivElement) => assignRootRef(element)}
          items={collectionItems() ?? []}
          getKey={getKey()}
          getTextValue={getTextValue()}
          getDisabled={getDisabled()}
          selectionBehavior={selectionStyle() === "highlight" ? "replace" : "toggle"}
          onSelectionChange={onSelectionChange}
          isLoading={isLoading()}
          hasMore={local.hasMore ?? !!local.onLoadMore}
          onLoadMore={local.onLoadMore}
          renderEmptyState={renderEmptyState}
          slot={local.slot ?? undefined}
          class={className}
          style={mergedUnsafeStyle()}
          data-list-view=""
          data-quiet={isQuiet() || undefined}
          data-selection-style={selectionStyle()}
          data-overflow-mode={overflowMode()}
          data-loading-state={local.loadingState ?? undefined}
        >
          {(item: T) => renderItem(item)}
        </HeadlessGridList>
      </ImageCoordinator>
    </InternalListViewContext.Provider>
  );

  // Build the framed wrapper only on the branch that actually returns it. A `const framed = (<div/>)`
  // is evaluated eagerly even when the function goes on to return `collection` instead — and under
  // hydration that eager evaluation calls getNextElement for a wrapper div the server never
  // rendered, which throws a Hydration Mismatch and aborts hydration for the entire route.
  // Constructing it lazily inside the branch keeps SSR and client element walks in lockstep.
  if (local.label || local.description || local.renderActionBar) {
    return (
      <div class={listViewWrapper({}, mergedStyles())} style={mergedUnsafeStyle()}>
        {local.label ? <div class={legacyLabel}>{local.label}</div> : null}
        {collection}
        {local.description ? <div class={legacyDescription}>{local.description}</div> : null}
        {local.renderActionBar ? local.renderActionBar(actionSelectedKeys()) : null}
      </div>
    );
  }

  return collection;
}

export function GridListItem<T extends object>(props: GridListItemProps<T>): JSX.Element {
  const context = useContext(InternalListViewContext);
  const staticCollection = useContext(StaticGridListCollectionContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "isDisabled",
    "hasChildItems",
    "href",
    "target",
    "download",
    "rel",
    "hrefLang",
    "ping",
    "referrerPolicy",
    "routerOptions",
    "description",
    "icon",
    "image",
    "imageAlt",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);

  // A render effect (not `createEffect`): registration must be visible to the
  // parent's `collectionItems()` accessor within the SAME synchronous render
  // pass that constructs this item, both on the server and the client.
  // `createEffect` defers to a microtask that solid-js's SSR `renderToString`
  // never flushes before returning, so the collection would render its
  // `renderEmptyState()` ("No items") on the server for every static-children
  // ListView — the items only ever show up client-side, after hydration has
  // already committed an empty collection. See GridList's `registrationChildren`
  // for the read order this depends on, and `collectionItems` for why it must
  // NOT be a `createMemo` either.
  createRenderEffect(() => {
    if (!staticCollection) {
      return;
    }

    staticCollection.registerItem({
      id: props.id,
      textValue: headlessProps.textValue ?? headlessProps["aria-label"],
      isDisabled: !!local.isDisabled,
      props: staticCollection.mode === "static" ? (props as GridListItemProps<object>) : undefined,
    });
  });

  onCleanup(() => {
    staticCollection?.unregisterItem(props.id);
  });

  if (staticCollection) {
    return null;
  }

  const collectionState = useContext(HeadlessGridListStateContext);
  let itemElement: HTMLDivElement | undefined;
  const assignItemRef = mergeContextRefs(local.ref, (element: HTMLDivElement) => {
    itemElement = element;
  });
  const isExternalLink = () => !!local.href && local.target === "_blank";
  const hasTrailingIcon = () =>
    (isExternalLink() && !context.hideLinkOutIcon) || Boolean(local.hasChildItems);
  const getClassName = (renderProps: GridListItemRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        listViewItem({
          ...getRowLayerProps(renderProps),
          isLink: !!local.href,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const getStyle = (): JSX.CSSProperties | undefined => ({
    ...local.UNSAFE_style,
  });
  const isSelectedKey = (key: Key | null | undefined) =>
    key != null && Boolean(collectionState?.isSelected?.(key));
  const getRowLayerProps = (renderProps: GridListItemRenderProps): ListViewRowLayerProps => {
    const collection = collectionState?.collection;
    const previousKey = collection?.getKeyBefore?.(props.id) ?? null;
    const nextKey = collection?.getKeyAfter?.(props.id) ?? null;

    return {
      ...renderProps,
      isQuiet: context.isQuiet,
      selectionStyle: context.selectionStyle,
      overflowMode: context.overflowMode,
      hasTrailingIcon: hasTrailingIcon(),
      isPrevSelected: isSelectedKey(previousKey),
      isNextSelected: isSelectedKey(nextKey),
      isPrevNotSelected: !isSelectedKey(previousKey),
      isNextNotSelected: !isSelectedKey(nextKey),
      isFirstItem: collection?.getFirstKey?.() === props.id,
      isLastItem: collection?.getLastKey?.() === props.id,
    };
  };
  const textContext = createMemo(() => ({
    slots: {
      default: { slot: "label" },
      label: { slot: "label" },
      description: { slot: "description" },
    },
  }));

  function ItemChildren(renderProps: GridListItemRenderProps) {
    createEffect(() => applyItemSlotClasses(itemElement, renderProps, context));

    function ResolvedItemContent() {
      const resolvedChildren = resolveChildren(() => {
        // Read `local.children` once — a repeated props-children read re-instantiates child
        // components on the server only, desynchronizing Solid's hydration keys and aborting
        // hydration for the whole route. See Tab's ResolvedTabContent for the full note.
        const rawChildren = local.children;
        return typeof rawChildren === "function" ? rawChildren(renderProps) : rawChildren;
      });
      const childrenValue = () => resolvedChildren();
      const isTextOnly = () => isTextOnlyChildren(childrenValue());

      return (
        <>
          {isTextOnly() ? <Text slot="label">{childrenValue()}</Text> : childrenValue()}
          {local.description ? <Text slot="description">{local.description}</Text> : null}
        </>
      );
    }

    return (
      <TextContext.Provider value={textContext() as SpectrumContextValue<any>}>
        <IconContext.Provider
          value={{
            slot: "icon",
            styles: listViewSlotIcon,
          }}
        >
          <ImageContext.Provider
            value={{
              slot: "image",
              styles: listViewImage,
            }}
          >
            <ActionButtonGroupContext.Provider
              value={{
                slot: "actions",
                size: "S",
                styles: listViewActions,
              }}
            >
              <ActionMenuContext.Provider
                value={{
                  slot: "actionmenu",
                  size: "S",
                  menuSize: "S",
                  styles: listViewActionMenu,
                }}
              >
                {renderProps.selectionMode !== "none" &&
                renderProps.selectionBehavior === "toggle" ? (
                  <GridListSelectionCheckbox
                    itemKey={props.id}
                    renderProps={renderProps}
                    excludeFromTabOrder
                  />
                ) : null}
                <div
                  class={listViewRowBackground(getRowLayerProps(renderProps))}
                  aria-hidden="true"
                />
                {renderProps.isFocusVisible ? (
                  <div
                    class={listViewRowFocusRing(getRowLayerProps(renderProps))}
                    aria-hidden="true"
                  />
                ) : null}
                {local.image ? (
                  <Image src={local.image} alt={local.imageAlt ?? ""} styles={listViewImage} />
                ) : null}
                {local.icon ? (
                  <span slot="icon" class={listViewSlotIcon} data-rsp-slot="icon">
                    {local.icon()}
                  </span>
                ) : null}
                <ResolvedItemContent />
                {isExternalLink() && !context.hideLinkOutIcon ? (
                  <LinkOut
                    size="M"
                    class={listViewTrailingIcon(renderProps)}
                    data-rsp-slot="trailing-icon"
                    aria-hidden="true"
                  />
                ) : local.hasChildItems ? (
                  <Chevron
                    size="M"
                    class={listViewTrailingIcon(renderProps)}
                    data-rsp-slot="trailing-icon"
                    aria-hidden="true"
                  />
                ) : null}
              </ActionMenuContext.Provider>
            </ActionButtonGroupContext.Provider>
          </ImageContext.Provider>
        </IconContext.Provider>
      </TextContext.Provider>
    );
  }

  return (
    <HeadlessGridListItem
      {...headlessProps}
      ref={(element) => assignItemRef(element)}
      class={getClassName}
      style={getStyle}
      data-list-view-item=""
      data-disabled={local.isDisabled || undefined}
      data-href={local.href || undefined}
      data-target={local.target || undefined}
      data-has-child-items={local.hasChildItems || undefined}
      data-has-trailing-icon={hasTrailingIcon() || undefined}
    >
      {(renderProps: GridListItemRenderProps) => <ItemChildren {...renderProps} />}
    </HeadlessGridListItem>
  );
}

export function GridListSelectionCheckbox(props: {
  itemKey: Key;
  renderProps?: GridListItemRenderProps;
  class?: string;
  style?: JSX.CSSProperties;
  excludeFromTabOrder?: boolean;
  "aria-label"?: string;
}): JSX.Element {
  const state = useContext(HeadlessGridListStateContext);
  const isSelected = () => Boolean(state?.isSelected?.(props.itemKey));
  const renderProps = createMemo<GridListItemRenderProps>(() => ({
    isSelected: props.renderProps?.isSelected ?? isSelected(),
    isFocused: props.renderProps?.isFocused ?? false,
    isFocusVisible: props.renderProps?.isFocusVisible ?? false,
    isPressed: props.renderProps?.isPressed ?? false,
    isHovered: props.renderProps?.isHovered ?? false,
    isDisabled: props.renderProps?.isDisabled ?? false,
    selectionMode: props.renderProps?.selectionMode ?? "multiple",
    selectionBehavior: props.renderProps?.selectionBehavior ?? "toggle",
  }));

  return (
    <span
      class={[listViewCheckbox(renderProps()), props.class].filter(Boolean).join(" ")}
      style={props.style}
      data-rsp-slot="selection-indicator"
    >
      <HeadlessGridListSelectionCheckbox
        itemKey={props.itemKey}
        class={listViewCheckboxInput}
        excludeFromTabOrder={props.excludeFromTabOrder}
        aria-label={props["aria-label"] ?? "Select"}
      />
      <span class={listViewCheckboxBox(renderProps())} aria-hidden="true">
        {renderProps().isSelected ? (
          // S2's checkbox checkmark is a RAW ui-icon svg that never reads
          // IconContext, so it paints the `smallerSize['M'] === 'S'` variant at
          // its intrinsic 10×10 (Checkbox.tsx). The port's `Checkmark` DOES
          // consume IconContext (createIconForBase), so rendered inside the row
          // it would inherit the LEADING-icon slot's `size: 20` (listViewSlotIcon,
          // via mergeStyles' later-wins context) and paint 2× too large. Reset
          // the context here to restore S2's immunity: the `S` glyph falls back
          // to its intrinsic 10×10, tinted only by listViewCheckboxIcon.
          <IconContext.Provider value={{}}>
            <Checkmark size="S" class={listViewCheckboxIcon} aria-hidden="true" />
          </IconContext.Provider>
        ) : null}
      </span>
    </span>
  );
}

GridList.Item = GridListItem;
GridList.SelectionCheckbox = GridListSelectionCheckbox;

export type { Key };
