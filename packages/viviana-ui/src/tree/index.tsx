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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/TreeView.tsx

// Port of packages/@react-spectrum/s2/src/TreeView.tsx.

import {
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  isDisposed,
  onCleanup,
  runWithOwner,
  useContext,
  createTrackedEffect,
  type Owner,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  Tree as HeadlessTree,
  TreeItem as HeadlessTreeItem,
  TreeItemContent as HeadlessTreeItemContent,
  TreeExpandButton as HeadlessTreeExpandButton,
  TreeSelectionCheckbox as HeadlessTreeSelectionCheckbox,
  TreeLoadMoreItem as HeadlessTreeLoadMoreItem,
  TreeStateContext as HeadlessTreeStateContext,
  TreeItemContext as HeadlessTreeItemContext,
  SlotProvider,
  type TreeProps as HeadlessTreeProps,
  type TreeItemProps as HeadlessTreeItemProps,
  type TreeItemContentProps as HeadlessTreeItemContentProps,
  type TreeItemContentRenderProps as HeadlessTreeItemContentRenderProps,
  type TreeExpandButtonProps as HeadlessTreeExpandButtonProps,
  type TreeRenderProps,
  type TreeItemRenderProps,
  type TreeEmptyStateRenderProps,
  type TreeRenderItemState,
  evaluateRenderChildren,
} from "@proyecto-viviana/solidaria-components";
import type { Key, TreeItemData } from "@proyecto-viviana/solid-stately";
import { ActionButtonGroupContext } from "../button/group-context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { IconContext } from "../icon";
import Checkmark from "../icon/ui-icons/Checkmark";
import { ActionMenuContext } from "../menu/ActionMenu";
import { ProgressCircle } from "../progress/ProgressCircle";
import { createButton, mergeProps, createStringFormatter } from "@proyecto-viviana/solidaria";
import { s2IntlStrings } from "../intl";
import { useProviderProps, type ProviderInheritedProps } from "../provider";
import type { StyleString } from "../style";
import { baseColor, css, focusRing, space, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { edgeToText } from "../style/spectrum-theme" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { Text, TextContext } from "../text";
import { TextField } from "../textfield";
import { attrString, splitProps } from "@proyecto-viviana/solidaria/utils";

export type TreeSelectionStyle = "checkbox" | "highlight";
export type TreeLoadingState =
  | "idle"
  | "loading"
  | "loadingMore"
  | "sorting"
  | "filtering"
  | "error";

export interface TreeProps<T extends object> extends Omit<
  HeadlessTreeProps<T>,
  "class" | "style" | "children" | "items" | "selectionBehavior" | "isLoading" | "slot" | "ref"
> {
  /** TreeView content. Use a render function with `items` for S2 dynamic collections. */
  children: JSX.Element | ((item: TreeItemData<T>, state: TreeRenderItemState) => JSX.Element);
  /** Dynamic hierarchical items. Supports either `id` or `key`, matching React Spectrum examples. */
  items?: TreeItemData<T>[];
  /** Whether selection is shown with checkboxes or highlighted rows. @default 'checkbox' */
  selectionStyle?: TreeSelectionStyle;
  /**
   * Row height. `compact` is the 24px layer-tree row and expand control.
   * Omitted and `regular` stay the 40px row.
   */
  density?: "regular" | "compact";
  /** Loading state forwarded to load-more behavior. */
  loadingState?: TreeLoadingState;
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
  /** Ref for the tree root element. */
  ref?: RefLike<HTMLDivElement>;
  /** Legacy label helper. Prefer aria-label or aria-labelledby. */
  label?: JSX.Element;
  /** Legacy description helper. */
  description?: JSX.Element;
  /**
   * Commits an in-place label edit. Passing it enables F2 or a double press
   * on the label. Enter commits, Escape cancels, and blur commits.
   */
  onRename?: (key: Key, name: string) => void;
  /**
   * Keys whose detail control is open. Child rows stay on expandedKeys.
   * Omit it to keep the detail state inside the tree.
   */
  detailExpandedKeys?: Iterable<Key>;
  /** Called when the detail control toggles a key. */
  onDetailExpandedChange?: (keys: Set<Key>) => void;
}

export interface TreeItemProps<T extends object> extends Omit<
  HeadlessTreeItemProps<T>,
  "class" | "style" | "children" | "ref"
> {
  /** The unique id of the TreeViewItem. */
  id: Key;
  /** TreeViewItem content. Text-only children are wrapped in the S2 label slot. */
  children?: JSX.Element | ((renderProps: TreeItemRenderProps) => JSX.Element);
  /** Whether this item is disabled. Dynamic collections should prefer item data `isDisabled`. */
  isDisabled?: boolean;
  /** Whether this item has children that may not be loaded yet. */
  hasChildItems?: boolean;
  /**
   * Shows the detail control. It toggles detailExpandedKeys only.
   * Child rows stay on the tree expandedKeys control.
   */
  hasDetail?: boolean;
  /** Link target metadata. */
  href?: HeadlessTreeItemProps<T>["href"];
  target?: HeadlessTreeItemProps<T>["target"];
  download?: HeadlessTreeItemProps<T>["download"];
  rel?: HeadlessTreeItemProps<T>["rel"];
  hrefLang?: HeadlessTreeItemProps<T>["hrefLang"];
  ping?: HeadlessTreeItemProps<T>["ping"];
  referrerPolicy?: HeadlessTreeItemProps<T>["referrerPolicy"];
  routerOptions?: HeadlessTreeItemProps<T>["routerOptions"];
  /** Optional description text. Prefer `<Text slot="description">`. */
  description?: JSX.Element;
  /** Optional icon helper retained from the older Tree API. Prefer an icon child. */
  icon?: () => JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Ref for the rendered row element. */
  ref?: RefLike<HTMLElement>;
}

export interface TreeExpandButtonProps extends Omit<
  HeadlessTreeExpandButtonProps,
  "class" | "style"
> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Additional inline styles. Use only as a last resort. */
  style?: JSX.CSSProperties;
}

export interface TreeItemContentProps extends Omit<
  HeadlessTreeItemContentProps,
  "class" | "style"
> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Additional inline styles. Use only as a last resort. */
  style?: JSX.CSSProperties;
}

export interface TreeLoadMoreItemProps {
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  loadingState?: TreeLoadingState;
  level?: number;
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}

type StaticTreeItem = {
  id: Key;
  parentId?: Key;
  textValue?: string;
  isDisabled?: boolean;
  hasChildItems?: boolean;
  props: TreeItemProps<object>;
  children?: StaticTreeItem[];
};

type ItemRegistration = {
  id: Key;
  parentId?: Key;
  textValue?: string;
  isDisabled?: boolean;
  hasChildItems?: boolean;
  hasDetail?: boolean;
  props?: TreeItemProps<object>;
};

interface StaticCollectionContextValue {
  mode: "static" | "dynamic";
  registerItem(item: ItemRegistration): void;
  unregisterItem(id: Key): void;
}

interface TreeRenameFieldSession {
  commit: (name: string) => void;
  cancel: () => void;
}

interface TreeRenameController {
  enabled: () => boolean;
  editingKey: () => Key | null;
  initialName: (key: Key) => string;
  begin: (key: Key, name: string) => void;
  commit: (key: Key, name: string) => void;
  cancel: (key: Key) => void;
  restoreRowFocus: (key: Key) => void;
  register: (element: HTMLElement, session: TreeRenameFieldSession) => void;
  unregister: (element: HTMLElement) => void;
}

interface TreeDetailController {
  isExpanded: (key: Key) => boolean;
  toggle: (key: Key) => void;
}

interface TreeViewContextValue {
  selectionStyle: TreeSelectionStyle;
  density: "regular" | "compact";
  rename: TreeRenameController;
  detail: TreeDetailController;
}

const idleTreeRename: TreeRenameController = {
  enabled: () => false,
  editingKey: () => null,
  initialName: () => "",
  begin() {},
  commit() {},
  cancel() {},
  restoreRowFocus() {},
  register() {},
  unregister() {},
};

const idleTreeDetail: TreeDetailController = {
  isExpanded: () => false,
  toggle() {},
};

export const TreeViewContext = createContext<SpectrumContextValue<TreeProps<object>>>(null);
const InternalTreeViewContext = createContext<TreeViewContextValue>({
  selectionStyle: "checkbox",
  density: "regular",
  rename: idleTreeRename,
  detail: idleTreeDetail,
});
const StaticTreeCollectionContext = createContext<StaticCollectionContextValue | null>(null);
const StaticTreeParentContext = createContext<Key | null>(null);
const SuppressNestedTreeItems = createContext(false);

const treeViewWrapper = style(
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

const treeView = style<TreeRenderProps & { isActionBar?: boolean }>(
  {
    ...focusRing(),
    outlineOffset: -2,
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
    backgroundColor: "transparent",
    borderWidth: 0,
    disableTapHighlight: true,
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

type TreeRowLayerProps = Partial<TreeItemRenderProps> & {
  isLink?: boolean;
  selectionStyle?: TreeSelectionStyle;
  density?: "regular" | "compact";
};

const treeViewItem = style<TreeRowLayerProps>({
  outlineStyle: "none",
  position: "relative",
  borderRadius: "row",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "grid",
  gridTemplateAreas: [
    ". checkbox level-padding expand-button icon label actions actionmenu detail-button",
    ". checkbox level-padding expand-button icon description actions actionmenu detail-button",
  ],
  /* Empty when the row has no detail control, so the label start stays put. */
  gridTemplateColumns: [
    edgeToText(40),
    "auto",
    "auto",
    "auto",
    "auto",
    "minmax(0,1fr)",
    "minmax(0,auto)",
    "auto",
    "auto",
  ],
  gridTemplateRows: "1fr auto",
  alignItems: "baseline",
  rowGap: {
    ":has([slot=description])": space(1),
  },
  columnGap: 0,
  paddingX: 0,
  /* Compact is the layer-tree row. Omitted and regular stay the 40px row. */
  minHeight: {
    default: 40,
    density: {
      compact: 24,
      regular: 40,
    },
  },
  paddingY: 0,
  boxSizing: "border-box",
  textDecoration: "none",
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
    forcedColors: "ButtonText",
    selectionStyle: {
      highlight: {
        isSelected: {
          forcedColors: "HighlightText",
        },
      },
    },
  },
  backgroundColor: "transparent",
  cursor: {
    default: "default",
    isLink: "pointer",
    isDisabled: "not-allowed",
  },
  transition: "default",
  forcedColorAdjust: "none",
});

const treeViewRowBackground = style<TreeRowLayerProps>({
  position: "absolute",
  zIndex: -1,
  inset: 0,
  backgroundColor: {
    default: "gray-25",
    /* Glasselated: the register paints tree rows with its own three-step row
     * vocabulary — `--surface-hover` under the pointer, `--surface-active-soft`
     * on the current row, `--surface-active` when the current row is also
     * hovered or pressed. It draws one "current row" look regardless of how the
     * row got selected, so both selection styles land on the same fills. */
    isHovered: {
      default: "surface-hover",
      selectionStyle: {
        checkbox: "[var(--surface-active-soft)]",
      },
    },
    isPressed: {
      default: "[var(--surface-active)]",
      selectionStyle: {
        checkbox: "[var(--surface-active)]",
      },
    },
    isSelected: {
      default: "[var(--surface-active-soft)]",
      selectionStyle: {
        checkbox: {
          default: "[var(--surface-active-soft)]",
          isHovered: "[var(--surface-active)]",
          isPressed: "[var(--surface-active)]",
          isFocusVisible: "[var(--surface-active)]",
        },
        highlight: {
          default: "[var(--surface-active-soft)]",
          isHovered: "[var(--surface-active)]",
          isPressed: "[var(--surface-active)]",
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
  borderRadius: "row",
});

const treeViewRowFocusRing = style<TreeRowLayerProps>({
  ...focusRing(),
  outlineOffset: -2,
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
  borderRadius: "default",
  zIndex: 1,
  pointerEvents: "none",
});

const treeViewItemCell = style({
  display: "contents",
});

const treeLevelPadding = style({
  gridArea: "level-padding",
  alignSelf: "stretch",
  width: "[calc(var(--tree-item-level, 0) * var(--tree-indent, 16px))]",
});

const treeExpandButton = style<TreeRowLayerProps>({
  gridArea: "expand-button",
  alignSelf: "center",
  justifySelf: "center",
  /* Same density as the row: compact is 24px, otherwise 40px. */
  size: {
    default: 40,
    density: {
      compact: 24,
      regular: 40,
    },
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 0,
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  borderRadius: "default",
  visibility: {
    default: "hidden",
    isExpandable: "visible",
  },
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  disableTapHighlight: true,
});

/* Same hit target as the child chevron. It does not use that button's slot. */
const treeDetailButton = style<TreeRowLayerProps>({
  gridArea: "detail-button",
  alignSelf: "center",
  justifySelf: "center",
  size: {
    default: 40,
    density: {
      compact: 24,
      regular: 40,
    },
  },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 0,
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  borderRadius: "default",
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  disableTapHighlight: true,
});

/* Glasselated: the register draws an OUTLINE tree — the disclosure affordance is
 * the same mono ">" mark the nav rail and the list rows use, rotated 90° when the
 * branch is open, not a filled chevron glyph. */
const treeExpandMark = style<TreeRowLayerProps>({
  fontFamily: "code",
  fontSize: "[12px]",
  fontWeight: "semi-bold",
  lineHeight: "[1]",
  color: {
    default: "[var(--accent-primary)]",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  rotate: {
    isExpanded: 90,
  },
  transition: "default",
});

const treeCheckbox = style({
  gridArea: "checkbox",
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
});

const treeCheckboxInput = style({
  position: "absolute",
  inset: 0,
  margin: 0,
  opacity: 0,
  cursor: "inherit",
});

const treeCheckboxBox = style<TreeRowLayerProps>({
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

const treeCheckboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
});

const treeSlotIcon = style({
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

const treeLabel = style<TreeRowLayerProps>({
  gridArea: "label",
  minWidth: 0,
  alignSelf: "center",
  font: controlFont(),
  /* Glasselated: tree rows are list rows — mono 12.5/600, same as ListView. */
  fontFamily: "code",
  fontSize: "[12.5px]",
  fontWeight: "semi-bold",
  color: "inherit",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const treeDescription = style<TreeRowLayerProps>({
  gridArea: "description",
  minWidth: 0,
  alignSelf: "center",
  font: "ui-sm",
  fontFamily: "code",
  fontSize: "[11px]",
  color: {
    default: "[var(--terminal-dim)]",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const treeActions = style({
  gridArea: "actions",
  gridRowEnd: "span 2",
  alignSelf: "center",
  justifySelf: "end",
  marginStart: "text-to-visual",
});

const treeActionMenu = style({
  gridArea: "actionmenu",
  gridRowEnd: "span 2",
  alignSelf: "center",
});

const treeSlotLayout = css(`
  [slot="icon"], [data-slot="icon"], [data-rsp-slot="icon"] {
    grid-area: icon;
    grid-row-end: span 2;
    align-self: center;
  }
  [slot="actions"], [data-slot="actions"], [data-rsp-slot="actions"] {
    grid-area: actions;
    grid-row-end: span 2;
    align-self: center;
    justify-self: end;
  }
  [slot="actionmenu"], [data-slot="actionmenu"], [data-rsp-slot="actionmenu"] {
    grid-area: actionmenu;
    grid-row-end: span 2;
    align-self: center;
  }
  [slot="label"], [data-slot="label"], [data-rsp-slot="label"] {
    grid-area: label;
  }
  [slot="description"], [data-slot="description"], [data-rsp-slot="description"] {
    grid-area: description;
  }
  [data-renaming] [slot="label"],
  [data-renaming] [data-slot="label"],
  [data-renaming] [data-rsp-slot="label"] {
    display: none;
  }
`);

const treeLoadMore = style({
  minHeight: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "neutral-subdued",
});

const renameFieldSessions = new WeakMap<HTMLElement, TreeRenameFieldSession>();
let renameKeyListenerCount = 0;

function renameSessionFromEvent(
  event: Event,
): { field: HTMLElement; session: TreeRenameFieldSession } | null {
  const target = event.target;
  if (!(target instanceof Node)) return null;
  let element: Element | null = target instanceof Element ? target : target.parentElement;
  while (element) {
    if (element instanceof HTMLElement) {
      const session = renameFieldSessions.get(element);
      if (session) return { field: element, session };
    }
    element = element.parentElement;
  }
  return null;
}

// Document capture is ahead of the row arrow walk and the tree typeahead.
// Stopping here keeps the key in the input and leaves the browser default
// (caret movement, inserted text) intact.
function onDocumentRenameKeyDown(event: KeyboardEvent) {
  const match = renameSessionFromEvent(event);
  if (!match) return;
  if (event.isComposing || event.keyCode === 229) {
    event.stopImmediatePropagation();
    return;
  }
  if (event.key === "Enter") {
    event.preventDefault();
    event.stopImmediatePropagation();
    const input = match.field.querySelector("input");
    match.session.commit(input instanceof HTMLInputElement ? input.value : "");
    return;
  }
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    match.session.cancel();
    return;
  }
  event.stopImmediatePropagation();
}

function rowIsDisabled(row: HTMLElement): boolean {
  return row.dataset.disabled != null || row.getAttribute("aria-disabled") === "true";
}

function renameLabelText(row: HTMLElement): string {
  const label = row.querySelector<HTMLElement>(
    "[data-rsp-slot='label'], [slot='label'], [data-slot='label']",
  );
  const visible = label && !label.closest("[data-tree-rename]") ? label.textContent : null;
  const text = visible ?? row.getAttribute("aria-label") ?? "";
  return text.replace(/\s+/g, " ").trim();
}

function isRenameLabelTarget(row: HTMLElement, target: EventTarget | null): boolean {
  if (!(target instanceof Element) || !row.contains(target)) return false;
  if (
    target.closest(
      "[data-tree-rename], [data-rsp-slot='expand-button'], [data-rsp-slot='selection-indicator'], [data-rsp-slot='actionmenu'], [data-rsp-slot='actions'], input, textarea, button, a",
    )
  ) {
    return false;
  }
  const label = target.closest("[data-rsp-slot='label'], [slot='label'], [data-slot='label']");
  return label instanceof Element && row.contains(label);
}

function hideRenameLabels(row: HTMLElement, editing: boolean) {
  row.toggleAttribute("data-renaming", editing);
  const labels = row.querySelectorAll<HTMLElement>(
    "[data-rsp-slot='label'], [slot='label'], [data-slot='label']",
  );
  for (const label of labels) {
    if (label.closest("[data-tree-rename]")) continue;
    label.hidden = editing;
  }
}

function writeUnlessDisposed(owner: Owner | null, write: () => void) {
  if (owner && isDisposed(owner)) return;
  runWithOwner(null, write);
}

function TreeRenameField(props: { itemKey: Key; initialName: string; class: string }): JSX.Element {
  const { rename } = useContext(InternalTreeViewContext);
  const [value, setValue] = createSignal(props.initialName);
  const [field, setField] = createSignal<HTMLDivElement | undefined>(undefined, {
    ownedWrite: true,
  });
  const fieldOwner = getOwner();
  let settled = false;

  const currentName = () => {
    const input = field()?.querySelector("input");
    return input instanceof HTMLInputElement ? input.value : value();
  };

  const commit = (name: string, restore: boolean) => {
    if (settled) return;
    settled = true;
    if (fieldOwner && isDisposed(fieldOwner)) return;
    rename.commit(props.itemKey, name);
    if (restore) rename.restoreRowFocus(props.itemKey);
  };

  const cancel = () => {
    if (settled) return;
    settled = true;
    if (fieldOwner && isDisposed(fieldOwner)) return;
    rename.cancel(props.itemKey);
    rename.restoreRowFocus(props.itemKey);
  };

  createEffect(
    () => field(),
    (element) => {
      if (!element) return;
      rename.register(element, {
        commit: (name) => commit(name, true),
        cancel,
      });
      return () => {
        settled = true;
        rename.unregister(element);
      };
    },
  );

  const focusInput = (select = false) => {
    if (settled) return;
    const element = field();
    if (!element?.isConnected) return;
    const input = element.querySelector("input");
    if (!(input instanceof HTMLInputElement)) return;
    input.focus();
    // Select on entry only; protective refocus must preserve the editing caret.
    if (select) input.select();
  };

  // Focus after the tree's row effect. A synchronous focus inside this effect
  // lets that effect take the row and blur the field into a commit.
  createEffect(
    () => field(),
    (element) => {
      if (!element) return;
      queueMicrotask(() => focusInput(true));
    },
  );

  const stop = (event: Event) => {
    event.stopPropagation();
  };

  return (
    <div
      ref={setField}
      class={props.class}
      data-tree-rename=""
      onPointerDown={stop}
      onMouseDown={stop}
      onClick={stop}
      onDblClick={stop}
    >
      <TextField
        aria-label={props.initialName}
        size="S"
        value={value()}
        onChange={setValue}
        onBlur={(event) => {
          if (settled) return;
          const element = field();
          if (!element?.isConnected) return;
          const next = event.relatedTarget;
          if (next instanceof Node && element.contains(next)) return;
          const row = element.closest("[data-tree-view-item]");
          const active = document.activeElement;
          const staysOnRow =
            (next instanceof Node && !!row?.contains(next)) ||
            (active instanceof Node &&
              active !== element &&
              !element.contains(active) &&
              !!row?.contains(active));
          if (staysOnRow) {
            queueMicrotask(focusInput);
            return;
          }
          commit(currentName(), false);
        }}
      />
    </div>
  );
}

function selectedKeySet(keys: "all" | Iterable<Key> | undefined): "all" | Set<Key> {
  if (keys === "all") {
    return "all";
  }

  return new Set(keys ?? []);
}

function getItemKey<T extends object>(item: TreeItemData<T>, index: number): Key {
  return item.id ?? item.key ?? index;
}

function isTextOnlyChildren(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") {
    return true;
  }

  return Array.isArray(value) && value.every(isTextOnlyChildren);
}

function treeItemFromStatic(item: StaticTreeItem): TreeItemData<object> {
  const children = item.children?.map(treeItemFromStatic);
  return {
    id: item.id,
    key: item.id,
    value: item.props as object,
    textValue: item.textValue ?? String(item.id),
    isDisabled: item.isDisabled,
    hasChildItems: item.hasChildItems || Boolean(children?.length),
    children: children?.length ? children : undefined,
  };
}

function nestStaticTreeItems(items: StaticTreeItem[]): StaticTreeItem[] {
  const byParent = new Map<Key | null, StaticTreeItem[]>();
  for (const item of items) {
    const parentKey = item.parentId ?? null;
    const group = byParent.get(parentKey);
    if (group) group.push(item);
    else byParent.set(parentKey, [item]);
  }
  const seen = new Set<Key>();
  const nest = (item: StaticTreeItem): StaticTreeItem => {
    if (seen.has(item.id)) return item;
    seen.add(item.id);
    const children = byParent.get(item.id)?.map(nest);
    return children?.length ? { ...item, children } : item;
  };
  return (byParent.get(null) ?? []).map(nest);
}

function mergeRegisteredTreeItems<T extends object>(
  items: TreeItemData<T>[],
  registeredItems: Map<Key, ItemRegistration>,
): TreeItemData<T>[] {
  return items.map((item, index) => {
    const key = getItemKey(item, index);
    const registered = registeredItems.get(key);
    const children = item.children
      ? mergeRegisteredTreeItems(item.children as TreeItemData<T>[], registeredItems)
      : item.children;

    if (!registered) {
      return children === item.children ? item : { ...item, children };
    }

    return {
      ...item,
      id: item.id ?? key,
      key: item.key ?? key,
      isDisabled: item.isDisabled ?? registered.isDisabled,
      hasChildItems: item.hasChildItems ?? registered.hasChildItems,
      children,
    };
  });
}

export function Tree<T extends object>(props: TreeProps<T>): JSX.Element {
  const providerProps = useProviderProps(props) as TreeProps<T> & ProviderInheritedProps;
  const [flags] = splitProps(providerProps, [
    "isQuiet",
    "isEmphasized",
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "validationState",
  ]);
  const contextProps = getSlottedContextProps(
    useContext(TreeViewContext) as SpectrumContextValue<TreeProps<T>>,
    props.slot,
  );
  const mergedProps = mergeProps<TreeProps<T>>(flags, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "children",
    "items",
    "selectionStyle",
    "loadingState",
    "renderActionBar",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
    "label",
    "description",
    "density",
    "hasMore",
    "onLoadMore",
    "onRename",
    "detailExpandedKeys",
    "onDetailExpandedChange",
  ]);
  const selectionStyle = (): TreeSelectionStyle => local.selectionStyle ?? "checkbox";
  const density = (): "regular" | "compact" =>
    local.density === "compact" ? "compact" : "regular";
  const isLoading = () => local.loadingState === "loading" || local.loadingState === "loadingMore";
  const [staticItems, setStaticItems] = createSignal<StaticTreeItem[]>([], { ownedWrite: true });
  const [registrationVersion, setRegistrationVersion] = createSignal(0, { ownedWrite: true });
  const registeredItems = new Map<Key, ItemRegistration>();
  const usesStaticChildren = () => local.items == null;
  const syncRegisteredItems = () => {
    setStaticItems(
      Array.from(registeredItems.values())
        .filter((item) => item.props)
        .map((item) => ({
          id: item.id,
          parentId: item.parentId,
          textValue: item.textValue,
          isDisabled: item.isDisabled,
          hasChildItems: item.hasChildItems,
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
        previous.parentId === item.parentId &&
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled &&
        previous.hasChildItems === item.hasChildItems &&
        previous.hasDetail === item.hasDetail &&
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
  const treeOwner = getOwner();
  const [editingKey, setEditingKey] = createSignal<Key | null>(null);
  const initialNames = new Map<Key, string>();
  let renameFrame: HTMLDivElement | undefined;
  const writeEditingKey = (key: Key | null) => {
    // Blur can commit while this tree is disposing (#623).
    writeUnlessDisposed(treeOwner, () => setEditingKey(key));
  };
  const restoreRowFocus = (key: Key) => {
    queueMicrotask(() => {
      if (treeOwner && isDisposed(treeOwner)) return;
      const root = renameFrame;
      if (!root) return;
      const row = root.querySelector<HTMLElement>(
        `[data-tree-view-item][data-key="${CSS.escape(String(key))}"]`,
      );
      row?.focus();
    });
  };
  const rename: TreeRenameController = {
    enabled: () => local.onRename != null,
    editingKey,
    initialName(key) {
      return initialNames.get(key) ?? "";
    },
    begin(key, name) {
      if (local.onRename == null || editingKey() === key) return;
      initialNames.set(key, name);
      writeEditingKey(key);
    },
    commit(key, name) {
      const callback = local.onRename;
      if (editingKey() === key) {
        writeEditingKey(null);
        initialNames.delete(key);
      }
      if (treeOwner && isDisposed(treeOwner)) return;
      callback?.(key, name);
    },
    cancel(key) {
      if (editingKey() !== key) return;
      writeEditingKey(null);
      initialNames.delete(key);
    },
    restoreRowFocus,
    register(element, session) {
      renameFieldSessions.set(element, session);
    },
    unregister(element) {
      renameFieldSessions.delete(element);
    },
  };
  createEffect(
    () => local.onRename != null,
    (enabled) => {
      if (!enabled) return;
      if (renameKeyListenerCount === 0) {
        document.addEventListener("keydown", onDocumentRenameKeyDown, true);
      }
      renameKeyListenerCount += 1;
      return () => {
        renameKeyListenerCount -= 1;
        if (renameKeyListenerCount === 0) {
          document.removeEventListener("keydown", onDocumentRenameKeyDown, true);
        }
      };
    },
  );
  const [uncontrolledDetailKeys, setUncontrolledDetailKeys] = createSignal<Set<Key>>(new Set(), {
    ownedWrite: true,
  });
  const detailExpandedSet = createMemo(() => {
    const provided = local.detailExpandedKeys;
    if (provided != null) return new Set<Key>(provided);
    return uncontrolledDetailKeys();
  });
  const toggleDetail = (key: Key) => {
    const next = new Set(detailExpandedSet());
    if (next.has(key)) next.delete(key);
    else next.add(key);
    if (local.detailExpandedKeys == null) {
      writeUnlessDisposed(treeOwner, () => setUncontrolledDetailKeys(next));
    }
    if (treeOwner && isDisposed(treeOwner)) return;
    local.onDetailExpandedChange?.(next);
  };
  const detail: TreeDetailController = {
    isExpanded(key) {
      return detailExpandedSet().has(key);
    },
    toggle(key) {
      toggleDetail(key);
    },
  };
  const treeContext = createMemo<TreeViewContextValue>(() => ({
    selectionStyle: selectionStyle(),
    density: density(),
    rename,
    detail,
  }));
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const collectionItems = createMemo(() => {
    registrationVersion();
    if (usesStaticChildren()) {
      return nestStaticTreeItems(staticItems()).map(treeItemFromStatic) as TreeItemData<T>[];
    }

    return (local.items ?? []) as TreeItemData<T>[];
  });
  const collectionItemsWithDisabled = createMemo(() =>
    mergeRegisteredTreeItems(collectionItems(), registeredItems),
  );
  const [actionSelectedKeys, setActionSelectedKeys] = createSignal<"all" | Set<Key>>(
    selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
    { ownedWrite: true },
  );
  createEffect(
    () => selectedKeySet(headlessProps.selectedKeys ?? headlessProps.defaultSelectedKeys),
    (keys) => {
      setActionSelectedKeys(keys);
    },
  );
  const onSelectionChange = (keys: "all" | Set<Key>) => {
    setActionSelectedKeys(keys === "all" ? "all" : new Set(keys));
    headlessProps.onSelectionChange?.(keys);
  };
  const className = (renderProps: TreeRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      mergeStyles(
        treeView({ ...renderProps, isActionBar: !!local.renderActionBar }),
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const renderEmptyState = (emptyProps: TreeEmptyStateRenderProps) => (
    <div class={emptyState}>{headlessProps.renderEmptyState?.(emptyProps) ?? "No items"}</div>
  );
  const renderItem = (item: TreeItemData<T>, state: TreeRenderItemState) =>
    usesStaticChildren() ? (
      <TreeItem {...((item.value ?? item) as TreeItemProps<T>)} />
    ) : typeof local.children === "function" ? (
      local.children(item, state)
    ) : null;
  const renderRegistrationItems = (items: TreeItemData<T>[], level = 0): JSX.Element[] => {
    const rendered: JSX.Element[] = [];
    const renderChild = local.children;

    if (typeof renderChild !== "function") {
      return rendered;
    }

    for (const item of items) {
      const isExpandable = Boolean(item.children?.length || item.hasChildItems);
      rendered.push(
        renderChild(item, {
          isExpanded: false,
          isExpandable,
          level,
        }),
      );

      if (item.children?.length) {
        rendered.push(...renderRegistrationItems(item.children as TreeItemData<T>[], level + 1));
      }
    }

    return rendered;
  };
  const registrationChildren = () => {
    if (usesStaticChildren()) {
      const resolved = resolveChildren(() => local.children as JSX.Element);
      return resolved();
    }

    if (typeof local.children !== "function") {
      return null;
    }

    return renderRegistrationItems(local.items ?? []);
  };
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const loadMoreContent = () => (
    <div class={treeLoadMore} data-rsp-slot="load-more">
      {isLoading() ? (
        <ProgressCircle
          isIndeterminate
          size="S"
          aria-label={stringFormatter().format("table.loadingMore")}
        />
      ) : null}
    </div>
  );

  // One return shape, always framed — load-bearing for hydration (caught by
  // Tree.hydrate.test.tsx): never build two eager JSX branches and return one.
  // Client JSX consts are real DOM nodes, so an unused detached wrapper
  // embedding `collection` MOVES the just-claimed server nodes into itself and
  // the returned branch hydrates empty. SSR output is unaffected (strings
  // don't move), which is why only the live page lost the tree. A single
  // always-framed shape leaves exactly one construction path; without chrome
  // the wrapper is `display: contents`, so layout is untouched.
  // (A Tree hydration abort that once looked like a return-shape problem was
  // actually a repeated `local.children` read in ResolvedItemContent /
  // TreeItemContent — see the shared-evaluation comments there.)
  const collection = () => (
    <InternalTreeViewContext value={treeContext()}>
      <div hidden inert aria-hidden="true" style={{ display: "none" }}>
        <StaticTreeCollectionContext value={registrationContext}>
          {registrationChildren()}
        </StaticTreeCollectionContext>
      </div>
      <HeadlessTree
        {...headlessProps}
        ref={(element: HTMLDivElement) => assignRootRef(element)}
        items={collectionItemsWithDisabled() ?? []}
        selectionBehavior={selectionStyle() === "highlight" ? "replace" : "toggle"}
        onSelectionChange={onSelectionChange}
        isLoading={isLoading()}
        hasMore={local.hasMore ?? !!local.onLoadMore}
        onLoadMore={local.onLoadMore}
        loadingState={local.loadingState}
        renderLoadMoreItem={loadMoreContent}
        renderEmptyState={renderEmptyState}
        slot={local.slot ?? undefined}
        class={className}
        style={mergedUnsafeStyle()}
        data-tree-view=""
        data-selection-style={selectionStyle()}
        data-density={density()}
        data-loading-state={local.loadingState ?? undefined}
      >
        {(item: TreeItemData<T>, state: TreeRenderItemState) => renderItem(item, state)}
      </HeadlessTree>
    </InternalTreeViewContext>
  );

  const hasChrome = () => Boolean(local.label || local.description || local.renderActionBar);

  return (
    <div
      ref={renameFrame}
      class={hasChrome() ? treeViewWrapper(null, mergedStyles()) : undefined}
      style={hasChrome() ? mergedUnsafeStyle() : { display: "contents" }}
    >
      {local.label ? <div class={legacyLabel({})}>{local.label}</div> : null}
      {collection()}
      {local.description ? <div class={legacyDescription({})}>{local.description}</div> : null}
      {local.renderActionBar ? local.renderActionBar(actionSelectedKeys()) : null}
    </div>
  );
}

export function TreeItem<T extends object>(props: TreeItemProps<T>): JSX.Element {
  if (useContext(SuppressNestedTreeItems)) {
    return null;
  }
  const context = useContext(InternalTreeViewContext);
  const staticCollection = useContext(StaticTreeCollectionContext);
  const staticParentId = useContext(StaticTreeParentContext);
  const collectionState = useContext(HeadlessTreeStateContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "isDisabled",
    "hasChildItems",
    "hasDetail",
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
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);

  // A derived hasDetail installs its memo on read. Do that under this memo,
  // not inside the registration effect.
  const hasDetail = createMemo(() => !!local.hasDetail);

  createTrackedEffect(() => {
    if (!staticCollection) {
      return;
    }

    staticCollection.registerItem({
      id: props.id,
      parentId: staticParentId ?? undefined,
      textValue: attrString(headlessProps.textValue ?? headlessProps["aria-label"]),
      isDisabled: !!local.isDisabled,
      hasChildItems: !!local.hasChildItems,
      hasDetail: hasDetail(),
      props: staticCollection.mode === "static" ? (props as TreeItemProps<object>) : undefined,
    });
  });

  onCleanup(() => {
    staticCollection?.unregisterItem(props.id);
  });

  const itemOwner = getOwner();
  let renameRow: HTMLElement | undefined;
  let detachRenameRow: (() => void) | undefined;
  const [renameRowVersion, setRenameRowVersion] = createSignal(0, { ownedWrite: true });
  onCleanup(() => detachRenameRow?.());
  createEffect(
    () => [renameRowVersion(), context.rename.editingKey()] as const,
    ([, editingKey]) => {
      const row = renameRow;
      if (!row) return;
      hideRenameLabels(row, editingKey === props.id);
    },
  );

  function bindRenameRow(row: HTMLElement | null) {
    detachRenameRow?.();
    detachRenameRow = undefined;
    renameRow = row ?? undefined;
    if (!row || (itemOwner && isDisposed(itemOwner))) return;
    let lastLabelAt = -1;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "F2" || !context.rename.enabled() || rowIsDisabled(row)) return;
      const target = event.target;
      if (!(target instanceof Node) || !row.contains(target)) return;
      if (target instanceof Element && target.closest("[data-tree-rename], input, textarea")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      context.rename.begin(props.id, renameLabelText(row));
    };
    const onPointer = (event: MouseEvent) => {
      if (!context.rename.enabled() || rowIsDisabled(row)) return;
      if (!isRenameLabelTarget(row, event.target)) return;
      const now = event.timeStamp;
      const repeated = lastLabelAt >= 0 && now - lastLabelAt < 500;
      if (event.type === "click") lastLabelAt = now;
      if (event.type !== "dblclick" && event.detail < 2 && !repeated) return;
      event.preventDefault();
      event.stopPropagation();
      context.rename.begin(props.id, renameLabelText(row));
    };
    row.addEventListener("keydown", onKeyDown);
    row.addEventListener("click", onPointer);
    row.addEventListener("dblclick", onPointer);
    detachRenameRow = () => {
      row.removeEventListener("keydown", onKeyDown);
      row.removeEventListener("click", onPointer);
      row.removeEventListener("dblclick", onPointer);
    };
    writeUnlessDisposed(itemOwner, () => setRenameRowVersion((version) => version + 1));
  }

  // The probe must mount nested static items so they can register. The visible
  // row suppresses those same nodes; the collection paints each as its own row.
  if (staticCollection?.mode === "static") {
    return (
      <StaticTreeParentContext value={props.id}>
        {(() => {
          const children = local.children;
          return typeof children === "function" ? null : children;
        })()}
      </StaticTreeParentContext>
    );
  }

  if (staticCollection) {
    return null;
  }

  const assignItemRef = mergeContextRefs(local.ref);
  const getRowLayerProps = (renderProps: TreeItemRenderProps): TreeRowLayerProps => ({
    ...renderProps,
    selectionStyle: context.selectionStyle,
    density: context.density,
    isLink: !!local.href,
  });
  const getClassName = (renderProps: TreeItemRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      treeSlotLayout,
      mergeStyles(
        treeViewItem({
          ...getRowLayerProps(renderProps),
          isLink: !!local.href,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const getStyle = (renderProps: TreeItemRenderProps): JSX.CSSProperties => ({
    "--tree-item-level": String(renderProps.level),
    "--tree-indent": "16px",
    ...local.UNSAFE_style,
  });
  const textContext = (renderProps: TreeItemRenderProps) => ({
    slots: {
      default: {
        slot: "label",
        styles: () => treeLabel(getRowLayerProps(renderProps)),
      },
      label: {
        slot: "label",
        styles: () => treeLabel(getRowLayerProps(renderProps)),
      },
      description: {
        slot: "description",
        styles: () => treeDescription(getRowLayerProps(renderProps)),
      },
    },
  });
  const shouldShowCheckbox = (renderProps: TreeItemRenderProps) =>
    renderProps.selectionMode !== "none" &&
    renderProps.selectionBehavior === "toggle" &&
    !renderProps.isDisabled;

  function ItemChildren(renderProps: TreeItemRenderProps) {
    const slots = () => {
      const state = getRowLayerProps(renderProps);
      return {
        default: { class: treeLabel(state), "data-rsp-slot": "label" },
        label: { class: treeLabel(state), "data-rsp-slot": "label" },
        description: { class: treeDescription(state), "data-rsp-slot": "description" },
        icon: { class: treeSlotIcon, "data-rsp-slot": "icon" },
        actions: { class: treeActions, "data-rsp-slot": "actions" },
        actionmenu: { class: treeActionMenu, "data-rsp-slot": "actionmenu" },
      };
    };

    function ResolvedItemContent() {
      const resolvedChildren = resolveChildren(() =>
        evaluateRenderChildren(local.children, renderProps),
      );
      const childrenValue = () => resolvedChildren();
      const isTextOnly = () => isTextOnlyChildren(childrenValue());

      return (
        <>
          {isTextOnly() ? (
            <TreeItemContent>
              <Text slot="label">{childrenValue()}</Text>
              {local.description ? <Text slot="description">{local.description}</Text> : null}
            </TreeItemContent>
          ) : (
            childrenValue()
          )}
          {!isTextOnly() && local.description ? (
            <Text slot="description">{local.description}</Text>
          ) : null}
        </>
      );
    }

    const editing = () => context.rename.editingKey() === props.id;

    return (
      <>
        {editing() ? (
          <TreeRenameField
            itemKey={props.id}
            initialName={context.rename.initialName(props.id)}
            class={treeLabel(getRowLayerProps(renderProps))}
          />
        ) : null}
        <SlotProvider slots={slots}>
          <TextContext value={textContext(renderProps) as SpectrumContextValue<any>}>
            <IconContext
              value={{
                slot: "icon",
                styles: treeSlotIcon,
              }}
            >
              <ActionButtonGroupContext
                value={{
                  slot: "actions",
                  size: "S",
                  styles: treeActions,
                }}
              >
                <ActionMenuContext
                  value={{
                    slot: "actionmenu",
                    size: "S",
                    menuSize: "S",
                    styles: treeActionMenu,
                  }}
                >
                  {shouldShowCheckbox(renderProps) ? (
                    <TreeSelectionCheckbox itemKey={props.id} renderProps={renderProps} />
                  ) : null}
                  <div
                    class={treeViewRowBackground(getRowLayerProps(renderProps))}
                    aria-hidden="true"
                  />
                  {renderProps.isFocusVisible ? (
                    <div
                      class={treeViewRowFocusRing(getRowLayerProps(renderProps))}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span class={treeLevelPadding} aria-hidden="true" />
                  <TreeExpandButton renderProps={renderProps} />
                  {hasDetail() ? (
                    <TreeDetailButton itemKey={props.id} isDisabled={!!renderProps.isDisabled} />
                  ) : null}
                  {local.icon ? (
                    <span slot="icon" class={treeSlotIcon} data-rsp-slot="icon">
                      {local.icon()}
                    </span>
                  ) : null}
                  <ResolvedItemContent />
                </ActionMenuContext>
              </ActionButtonGroupContext>
            </IconContext>
          </TextContext>
        </SlotProvider>
      </>
    );
  }

  return (
    <HeadlessTreeItem
      {...headlessProps}
      id={props.id}
      ref={(element) => {
        assignItemRef(element);
        bindRenameRow(element instanceof HTMLElement ? element : null);
      }}
      data-renaming={context.rename.editingKey() === props.id ? "" : undefined}
      hasChildItems={local.hasChildItems}
      isDisabled={local.isDisabled}
      href={local.href}
      target={local.target}
      download={local.download}
      rel={local.rel}
      hrefLang={local.hrefLang}
      ping={local.ping}
      referrerPolicy={local.referrerPolicy}
      routerOptions={local.routerOptions}
      class={getClassName}
      style={getStyle}
      data-tree-view-item=""
      data-disabled={local.isDisabled || undefined}
      data-href={local.href || undefined}
      data-target={local.target || undefined}
      data-has-child-items={local.hasChildItems || undefined}
      data-has-detail={hasDetail() ? "" : undefined}
      data-detail-expanded={context.detail.isExpanded(props.id) ? "" : undefined}
    >
      {(renderProps: TreeItemRenderProps) => (
        <SuppressNestedTreeItems value={true}>
          <ItemChildren {...renderProps} />
        </SuppressNestedTreeItems>
      )}
    </HeadlessTreeItem>
  );
}

export function TreeItemContent(props: TreeItemContentProps): JSX.Element {
  if (useContext(StaticTreeCollectionContext)) {
    return null;
  }
  const [local, headlessProps] = splitProps(props, ["children", "class", "style"]);

  return (
    <HeadlessTreeItemContent {...headlessProps}>
      {(renderProps: HeadlessTreeItemContentRenderProps) => {
        const content = () => {
          // Share the authored-child value for classification and insertion here.
          // Keep evaluation under this owner; repeated construction is not a
          // universal getter-read rule or a global hydration-counter model.
          const rawChildren = local.children;
          return typeof rawChildren === "function" ? rawChildren(renderProps) : rawChildren;
        };
        return (
          <span
            class={[treeViewItemCell, local.class].filter(Boolean).join(" ")}
            style={local.style}
          >
            {content()}
          </span>
        );
      }}
    </HeadlessTreeItemContent>
  );
}

function TreeDetailButton(props: { itemKey: Key; isDisabled: boolean }): JSX.Element {
  const treeContext = useContext(InternalTreeViewContext);
  const expanded = () => treeContext.detail.isExpanded(props.itemKey);
  const renderState = (): TreeRowLayerProps => ({
    isDisabled: props.isDisabled,
    isExpanded: expanded(),
    isExpandable: true,
    density: treeContext.density,
    selectionStyle: treeContext.selectionStyle,
  });
  const { buttonProps } = createButton({
    elementType: "button",
    get isDisabled() {
      return props.isDisabled;
    },
    excludeFromTabOrder: true,
    preventFocusOnPress: true,
    onPress: () => {
      if (props.isDisabled) return;
      treeContext.detail.toggle(props.itemKey);
    },
  });

  return (
    <button
      {...buttonProps}
      class={treeDetailButton(renderState())}
      data-rsp-slot="detail-button"
      data-expanded={expanded() ? "" : undefined}
      data-react-aria-prevent-focus=""
      aria-expanded={expanded() ? "true" : "false"}
      aria-label={expanded() ? "Hide details" : "Show details"}
    >
      <span aria-hidden="true" class={treeExpandMark({ ...renderState(), isExpanded: false })}>
        {expanded() ? "–" : "+"}
      </span>
    </button>
  );
}

export function TreeExpandButton(
  props: TreeExpandButtonProps & { renderProps?: TreeItemRenderProps },
): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "style", "children", "renderProps"]);
  const treeContext = useContext(InternalTreeViewContext);
  const itemContext = useContext(HeadlessTreeItemContext);
  const isExpandable = () => Boolean(itemContext?.isExpandable ?? local.renderProps?.isExpandable);
  const renderState = () => ({
    ...(local.renderProps ?? {}),
    isExpandable: isExpandable(),
    isExpanded: Boolean(itemContext?.isExpanded ?? local.renderProps?.isExpanded),
    density: treeContext.density,
  });
  const className = () => [treeExpandButton(renderState()), local.class].filter(Boolean).join(" ");
  const stopPlaceholderExpansion = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  if (!isExpandable()) {
    return (
      <button
        {...headlessProps}
        type="button"
        tabindex={-1}
        class={className()}
        style={local.style}
        aria-label="Expand"
        onClick={stopPlaceholderExpansion}
        onPointerDown={stopPlaceholderExpansion}
        onPointerUp={stopPlaceholderExpansion}
        onMouseDown={stopPlaceholderExpansion}
        onMouseUp={stopPlaceholderExpansion}
        data-rsp-slot="expand-button"
      >
        {evaluateRenderChildren(local.children, renderState()) ?? (
          <span aria-hidden="true" class={treeExpandMark({ ...renderState(), isExpanded: false })}>
            {">"}
          </span>
        )}
      </button>
    );
  }

  return (
    <HeadlessTreeExpandButton
      {...headlessProps}
      class={className()}
      style={local.style}
      data-rsp-slot="expand-button"
    >
      {local.children ??
        (({ isExpanded }: { isExpanded: boolean }) => (
          <span aria-hidden="true" class={treeExpandMark({ ...renderState(), isExpanded })}>
            {">"}
          </span>
        ))}
    </HeadlessTreeExpandButton>
  );
}

export function TreeSelectionCheckbox(props: {
  itemKey: Key;
  renderProps?: TreeItemRenderProps;
  class?: string;
  style?: JSX.CSSProperties;
  excludeFromTabOrder?: boolean;
  "aria-label"?: string;
}): JSX.Element {
  const state = useContext(HeadlessTreeStateContext);
  const isSelected = () => Boolean(state?.isSelected?.(props.itemKey));
  const renderProps = createMemo<TreeRowLayerProps>(() => ({
    isSelected: props.renderProps?.isSelected ?? isSelected(),
    isFocused: props.renderProps?.isFocused ?? false,
    isFocusVisible: props.renderProps?.isFocusVisible ?? false,
    isPressed: props.renderProps?.isPressed ?? false,
    isHovered: props.renderProps?.isHovered ?? false,
    isDisabled: props.renderProps?.isDisabled ?? false,
    isExpanded: props.renderProps?.isExpanded ?? false,
    isExpandable: props.renderProps?.isExpandable ?? false,
    level: props.renderProps?.level ?? 0,
    selectionStyle: "checkbox",
  }));

  return (
    <span
      class={[treeCheckbox, props.class].filter(Boolean).join(" ")}
      style={props.style}
      data-rsp-slot="selection-indicator"
    >
      <HeadlessTreeSelectionCheckbox
        itemKey={props.itemKey}
        class={treeCheckboxInput}
        excludeFromTabOrder={props.excludeFromTabOrder}
        aria-label={props["aria-label"] ?? "Select"}
      />
      <span class={treeCheckboxBox(renderProps())}>
        {renderProps().isSelected ? <Checkmark size="XS" class={treeCheckboxIcon} /> : null}
      </span>
    </span>
  );
}

export function TreeLoadMoreItem(props: TreeLoadMoreItemProps): JSX.Element {
  const staticCollection = useContext(StaticTreeCollectionContext);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const isLoading = () =>
    props.isLoading || props.loadingState === "loading" || props.loadingState === "loadingMore";

  if (staticCollection) {
    return null;
  }

  return (
    <HeadlessTreeLoadMoreItem
      onLoadMore={props.onLoadMore}
      isLoading={isLoading()}
      loadingState={props.loadingState}
      level={props.level}
      class={["", props.class].filter(Boolean).join(" ")}
      style={props.style}
    >
      <div class={treeLoadMore} data-rsp-slot="load-more">
        {props.children ??
          (isLoading() ? (
            <ProgressCircle
              isIndeterminate
              size="S"
              aria-label={stringFormatter().format("table.loadingMore")}
            />
          ) : null)}
      </div>
    </HeadlessTreeLoadMoreItem>
  );
}

Tree.Item = TreeItem;
Tree.Content = TreeItemContent;
Tree.ExpandButton = TreeExpandButton;
Tree.SelectionCheckbox = TreeSelectionCheckbox;
Tree.LoadMoreItem = TreeLoadMoreItem;

export const TreeView = Tree;
export const TreeViewItem = TreeItem;
export const TreeViewItemContent = TreeItemContent;
export const TreeViewLoadMoreItem = TreeLoadMoreItem;
export { Collection } from "@proyecto-viviana/solidaria-components";
export { Text } from "../text";

export type { Key, TreeItemData, TreeRenderItemState, TreeRenderProps, TreeItemRenderProps };
