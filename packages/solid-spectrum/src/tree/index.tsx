import {
  children as resolveChildren,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  Tree as HeadlessTree,
  TreeItem as HeadlessTreeItem,
  TreeItemContent as HeadlessTreeItemContent,
  TreeExpandButton as HeadlessTreeExpandButton,
  TreeSelectionCheckbox as HeadlessTreeSelectionCheckbox,
  TreeLoadMoreItem as HeadlessTreeLoadMoreItem,
  TreeStateContext as HeadlessTreeStateContext,
  TreeItemContext as HeadlessTreeItemContext,
  type TreeProps as HeadlessTreeProps,
  type TreeItemProps as HeadlessTreeItemProps,
  type TreeItemContentProps as HeadlessTreeItemContentProps,
  type TreeItemContentRenderProps as HeadlessTreeItemContentRenderProps,
  type TreeExpandButtonProps as HeadlessTreeExpandButtonProps,
  type TreeRenderProps,
  type TreeItemRenderProps,
  type TreeRenderItemState,
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
import Chevron from "../icon/ui-icons/Chevron";
import { ActionMenuContext } from "../menu/ActionMenu";
import { ProgressCircle } from "../progress/ProgressCircle";
import { useProviderProps } from "../provider";
import type { StyleString } from "../style";
import {
  baseColor,
  colorMix,
  focusRing,
  fontRelative,
  space,
  style,
} from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { edgeToText } from "../style/spectrum-theme" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { Text, TextContext } from "../text";

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
  textValue?: string;
  isDisabled?: boolean;
  hasChildItems?: boolean;
  props: TreeItemProps<object>;
};

type ItemRegistration = {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
  hasChildItems?: boolean;
  props?: TreeItemProps<object>;
};

interface StaticCollectionContextValue {
  mode: "static" | "dynamic";
  registerItem(item: ItemRegistration): void;
  unregisterItem(id: Key): void;
}

interface TreeViewContextValue {
  selectionStyle: TreeSelectionStyle;
}

export const TreeViewContext = createContext<SpectrumContextValue<TreeProps<object>>>(null);
const InternalTreeViewContext = createContext<TreeViewContextValue>({
  selectionStyle: "checkbox",
});
const StaticTreeCollectionContext = createContext<StaticCollectionContextValue | null>(null);

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

const selectedBackground = colorMix("gray-25", "gray-900", 7);
const selectedActiveBackground = colorMix("gray-25", "gray-900", 10);

type TreeRowLayerProps = Partial<TreeItemRenderProps> & {
  isLink?: boolean;
  selectionStyle?: TreeSelectionStyle;
};

const treeViewItem = style<TreeRowLayerProps>({
  outlineStyle: "none",
  position: "relative",
  borderRadius: "sm",
  gridColumnStart: 1,
  gridColumnEnd: -1,
  display: "grid",
  gridTemplateAreas: [
    ". checkbox level-padding expand-button icon label actions actionmenu",
    ". checkbox level-padding expand-button icon description actions actionmenu",
  ],
  gridTemplateColumns: [
    edgeToText(40),
    "auto",
    "auto",
    "auto",
    "auto",
    "minmax(0,1fr)",
    "minmax(0,auto)",
    "auto",
  ],
  gridTemplateRows: "1fr auto",
  alignItems: "baseline",
  rowGap: {
    ":has([slot=description])": space(1),
  },
  columnGap: 0,
  paddingX: 0,
  minHeight: 40,
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
  borderRadius: "sm",
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
  size: 40,
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

const treeExpandIcon = style<TreeRowLayerProps>({
  rotate: {
    isExpanded: 90,
  },
  transition: "default",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
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
  borderWidth: 2,
  borderStyle: "solid",
  borderRadius: "sm",
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
  size: fontRelative(20),
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
  color: {
    default: baseColor("neutral-subdued"),
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

const treeLoadMore = style({
  minHeight: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "neutral-subdued",
});

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
  renderProps: TreeItemRenderProps,
  context: TreeViewContextValue,
): void {
  if (!root) {
    return;
  }

  const state = {
    ...renderProps,
    selectionStyle: context.selectionStyle,
  };

  const gridCell = root.querySelector('[role="gridcell"]');
  if (gridCell) {
    replaceManagedClass(gridCell, "data-s2-treeview-cell-class", treeViewItemCell);
  }

  for (const element of Array.from(
    root.querySelectorAll('[slot="label"], [data-slot="label"], [data-rsp-slot="label"]'),
  )) {
    replaceManagedClass(element, "data-s2-treeview-slot-class", treeLabel(state));
    element.setAttribute("data-rsp-slot", "label");
  }

  for (const element of Array.from(
    root.querySelectorAll(
      '[slot="description"], [data-slot="description"], [data-rsp-slot="description"]',
    ),
  )) {
    replaceManagedClass(element, "data-s2-treeview-slot-class", treeDescription(state));
    element.setAttribute("data-rsp-slot", "description");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="icon"], [data-slot="icon"]'))) {
    replaceManagedClass(element, "data-s2-treeview-slot-class", treeSlotIcon);
    element.setAttribute("data-rsp-slot", "icon");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="actions"]'))) {
    replaceManagedClass(element, "data-s2-treeview-slot-class", treeActions);
    element.setAttribute("data-rsp-slot", "actions");
  }

  for (const element of Array.from(root.querySelectorAll('[slot="actionmenu"]'))) {
    replaceManagedClass(element, "data-s2-treeview-slot-class", treeActionMenu);
    element.setAttribute("data-rsp-slot", "actionmenu");
  }
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
  return {
    id: item.id,
    key: item.id,
    value: item.props as object,
    textValue: item.textValue ?? String(item.id),
    isDisabled: item.isDisabled,
    hasChildItems: item.hasChildItems,
  };
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
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(
    useContext(TreeViewContext) as SpectrumContextValue<TreeProps<T>>,
    props.slot,
  );
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props) as TreeProps<T>;
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
    "hasMore",
    "onLoadMore",
  ]);
  const selectionStyle = (): TreeSelectionStyle => local.selectionStyle ?? "checkbox";
  const isLoading = () => local.loadingState === "loading" || local.loadingState === "loadingMore";
  const [staticItems, setStaticItems] = createSignal<StaticTreeItem[]>([]);
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
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled &&
        previous.hasChildItems === item.hasChildItems &&
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
  const treeContext = createMemo<TreeViewContextValue>(() => ({
    selectionStyle: selectionStyle(),
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
      return staticItems().map(treeItemFromStatic) as TreeItemData<T>[];
    }

    return (local.items ?? []) as TreeItemData<T>[];
  });
  const collectionItemsWithDisabled = createMemo(() =>
    mergeRegisteredTreeItems(collectionItems(), registeredItems),
  );
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
  const renderEmptyState = () => (
    <div class={emptyState}>{headlessProps.renderEmptyState?.() ?? "No items"}</div>
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
  const loadMoreContent = () => (
    <div class={treeLoadMore} data-rsp-slot="load-more">
      {isLoading() ? <ProgressCircle isIndeterminate size="S" aria-label="Loading more" /> : null}
    </div>
  );

  const collection = (
    <InternalTreeViewContext.Provider value={treeContext()}>
      <div hidden inert aria-hidden="true" style={{ display: "none" }}>
        <StaticTreeCollectionContext.Provider value={registrationContext}>
          {registrationChildren()}
        </StaticTreeCollectionContext.Provider>
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
        data-loading-state={local.loadingState ?? undefined}
      >
        {(item: TreeItemData<T>, state: TreeRenderItemState) => renderItem(item, state)}
      </HeadlessTree>
    </InternalTreeViewContext.Provider>
  );

  const framed = (
    <div class={treeViewWrapper(null, mergedStyles())} style={mergedUnsafeStyle()}>
      {local.label ? <div class={legacyLabel({})}>{local.label}</div> : null}
      {collection}
      {local.description ? <div class={legacyDescription({})}>{local.description}</div> : null}
      {local.renderActionBar ? local.renderActionBar(actionSelectedKeys()) : null}
    </div>
  );

  return local.label || local.description || local.renderActionBar ? framed : collection;
}

export function TreeItem<T extends object>(props: TreeItemProps<T>): JSX.Element {
  const context = useContext(InternalTreeViewContext);
  const staticCollection = useContext(StaticTreeCollectionContext);
  const collectionState = useContext(HeadlessTreeStateContext);
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
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);

  createEffect(() => {
    if (!staticCollection) {
      return;
    }

    staticCollection.registerItem({
      id: props.id,
      textValue: headlessProps.textValue ?? headlessProps["aria-label"],
      isDisabled: !!local.isDisabled,
      hasChildItems: !!local.hasChildItems,
      props: staticCollection.mode === "static" ? (props as TreeItemProps<object>) : undefined,
    });
  });

  onCleanup(() => {
    staticCollection?.unregisterItem(props.id);
  });

  if (staticCollection) {
    return null;
  }

  let itemElement: HTMLElement | undefined;
  const assignItemRef = mergeContextRefs(local.ref, (element: HTMLElement) => {
    itemElement = element;
  });
  const getRowLayerProps = (renderProps: TreeItemRenderProps): TreeRowLayerProps => ({
    ...renderProps,
    selectionStyle: context.selectionStyle,
    isLink: !!local.href,
  });
  const getClassName = (renderProps: TreeItemRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
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
    createEffect(() => applyItemSlotClasses(itemElement, renderProps, context));

    function ResolvedItemContent() {
      const resolvedChildren = resolveChildren(() =>
        typeof local.children === "function" ? local.children(renderProps) : local.children,
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

    return (
      <TextContext.Provider value={textContext(renderProps) as SpectrumContextValue<any>}>
        <IconContext.Provider
          value={{
            slot: "icon",
            styles: treeSlotIcon,
          }}
        >
          <ActionButtonGroupContext.Provider
            value={{
              slot: "actions",
              size: "S",
              styles: treeActions,
            }}
          >
            <ActionMenuContext.Provider
              value={{
                slot: "actionmenu",
                size: "S",
                menuSize: "S",
                styles: treeActionMenu,
              }}
            >
              {shouldShowCheckbox(renderProps) ? (
                <TreeSelectionCheckbox
                  itemKey={props.id}
                  renderProps={renderProps}
                  excludeFromTabOrder
                />
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
              {local.icon ? (
                <span slot="icon" class={treeSlotIcon} data-rsp-slot="icon">
                  {local.icon()}
                </span>
              ) : null}
              <ResolvedItemContent />
            </ActionMenuContext.Provider>
          </ActionButtonGroupContext.Provider>
        </IconContext.Provider>
      </TextContext.Provider>
    );
  }

  return (
    <HeadlessTreeItem
      {...headlessProps}
      ref={(element) => assignItemRef(element)}
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
    >
      {(renderProps: TreeItemRenderProps) => <ItemChildren {...renderProps} />}
    </HeadlessTreeItem>
  );
}

export function TreeItemContent(props: TreeItemContentProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["children", "class", "style"]);

  return (
    <HeadlessTreeItemContent {...headlessProps}>
      {(renderProps: HeadlessTreeItemContentRenderProps) => (
        <span class={[treeViewItemCell, local.class].filter(Boolean).join(" ")} style={local.style}>
          {typeof local.children === "function" ? local.children(renderProps) : local.children}
        </span>
      )}
    </HeadlessTreeItemContent>
  );
}

export function TreeExpandButton(
  props: TreeExpandButtonProps & { renderProps?: TreeItemRenderProps },
): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "style", "children", "renderProps"]);
  const itemContext = useContext(HeadlessTreeItemContext);
  const isExpandable = () => Boolean(itemContext?.isExpandable ?? local.renderProps?.isExpandable);
  const renderState = () => ({
    ...(local.renderProps ?? {}),
    isExpandable: isExpandable(),
    isExpanded: Boolean(itemContext?.isExpanded ?? local.renderProps?.isExpanded),
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
        tabIndex={-1}
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
        {typeof local.children === "function"
          ? local.children(renderState())
          : (local.children ?? (
              <Chevron
                size="S"
                class={treeExpandIcon({ ...renderState(), isExpanded: false })}
                aria-hidden="true"
              />
            ))}
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
          <Chevron
            size="S"
            class={treeExpandIcon({ ...renderState(), isExpanded })}
            aria-hidden="true"
          />
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
      <span class={treeCheckboxBox(renderProps())} aria-hidden="true">
        {renderProps().isSelected ? (
          <Checkmark size="XS" class={treeCheckboxIcon} aria-hidden="true" />
        ) : null}
      </span>
    </span>
  );
}

export function TreeLoadMoreItem(props: TreeLoadMoreItemProps): JSX.Element {
  const staticCollection = useContext(StaticTreeCollectionContext);
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
            <ProgressCircle isIndeterminate size="S" aria-label="Loading more" />
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

export type { Key, TreeItemData, TreeRenderItemState };
