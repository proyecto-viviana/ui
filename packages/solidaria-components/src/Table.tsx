/**
 * Table component for solidaria-components
 *
 * A pre-wired headless table that combines state + aria hooks.
 * Based on react-aria-components/src/Table.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createUniqueId,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createTable,
  createTableColumnHeader,
  createTableRow,
  createTableCell,
  createTableRowGroup,
  createTableSelectionCheckbox,
  createTableSelectAllCheckbox,
  createFocusRing,
  isFocusVisible as isGlobalFocusVisible,
  getTableData,
  createHover,
  mergeProps,
  type AriaTableProps,
  createTableColumnResize,
} from "@proyecto-viviana/solidaria";
import {
  createTableState,
  createTableCollection,
  createTableColumnResizeState,
  type TableState,
  type TableCollection,
  type TableColumnResizeState,
  type Key,
  type SortDescriptor,
  type ColumnDefinition,
  type ColumnSize,
  type GridNode,
  type DropTarget,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  dataAttr,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { SharedElementTransition } from "./SharedElementTransition";
import { type DragAndDropHooks } from "./useDragAndDrop";
import { ButtonContext, type ButtonProps } from "./Button";
import {
  CollectionRendererContext,
  type CollectionRendererContextValue,
  useCollectionRenderer,
} from "./Collection";
import { useVirtualizerContext } from "./Virtualizer";
import {
  type LinkDOMProps,
  type RouterOptions,
  useRouter,
  useLinkProps,
  type RouterClickModifiers,
} from "./RouterProvider";
import {
  getNormalizedDropTargetKey,
  mergePersistedKeysIntoVirtualRange,
  useDndPersistedKeys,
  useRenderDropIndicator,
} from "./DragAndDrop";

export interface TableRenderProps {
  /** Whether the table has focus. */
  isFocused: boolean;
  /** Whether the table has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the table is disabled. */
  isDisabled: boolean;
  /** Whether the table is empty. */
  isEmpty: boolean;
}

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;
export type TableColumnDefinition<T = unknown> = Omit<ColumnDefinition<T>, "key" | "children"> & {
  /** React Spectrum-style alias for the column key. */
  id?: Key;
  key?: Key;
  children?: TableColumnDefinition<T>[];
};

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else ref.current = el;
}

function normalizeColumnDefinitions<T>(
  columns: TableColumnDefinition<T>[],
  parentKey?: Key,
): (ColumnDefinition<T> & { id?: Key })[] {
  return columns.map((column, index) => {
    const key = column.key ?? column.id ?? (parentKey == null ? index : `${parentKey}-${index}`);
    const id = column.id ?? column.key;

    return {
      ...column,
      key,
      id,
      children: column.children ? normalizeColumnDefinitions(column.children, key) : undefined,
    } as ColumnDefinition<T> & { id?: Key };
  });
}

function getRowHeaderColumnKeys<T>(columns: (ColumnDefinition<T> & { id?: Key })[]): Set<Key> {
  const keys = new Set<Key>();

  for (const column of columns) {
    if (column.isRowHeader) {
      keys.add(column.key);
    }

    if (column.children) {
      for (const key of getRowHeaderColumnKeys(
        column.children as (ColumnDefinition<T> & {
          id?: Key;
        })[],
      )) {
        keys.add(key);
      }
    }
  }

  return keys;
}

export interface TableProps<T extends object> extends Omit<AriaTableProps, "children">, SlotProps {
  /** The data items to render in the table. */
  items: T[];
  /** The column definitions. */
  columns: TableColumnDefinition<T>[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item for a column. */
  getTextValue?: (item: T, column: TableColumnDefinition<T>) => string;
  /** The selection mode. */
  selectionMode?: "none" | "single" | "multiple";
  /** The selection behavior (toggle vs replace). */
  selectionBehavior?: "toggle" | "replace";
  /** Whether disabled rows remain focusable. */
  disabledBehavior?: "selection" | "all";
  /** Whether Escape clears selection. */
  escapeKeyBehavior?: "clearSelection" | "none";
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Currently selected keys (controlled). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** The current sort descriptor. */
  sortDescriptor?: SortDescriptor;
  /** Handler called when sort changes. */
  onSortChange?: (descriptor: SortDescriptor) => void;
  /** Whether to show selection checkboxes. */
  showSelectionCheckboxes?: boolean;
  /** The children of the component. */
  children?: JSX.Element | RenderChildren<TableRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableRenderProps>;
  /** A function to render when the table is empty. */
  renderEmptyState?: () => JSX.Element;
  /** Ref for the table element. */
  ref?: RefLike<HTMLTableElement>;
  /** Custom renderer for the table element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLTableElement>,
    renderProps: TableRenderProps,
  ) => JSX.Element;
  /** Drag and drop hooks from `useDragAndDrop`. */
  dragAndDropHooks?: DragAndDropHooks<T>;
}

export interface TableHeaderRenderProps {
  /** Whether the header has focus. */
  isFocused: boolean;
  /** Whether the header is being hovered. */
  isHovered: boolean;
}

export interface TableHeaderProps extends SlotProps {
  /** The children (usually TableColumn components). */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableHeaderRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableHeaderRenderProps>;
  /** Ref for the table header element. */
  ref?: RefLike<HTMLTableSectionElement>;
  /** Custom renderer for the table header element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLTableSectionElement>,
    renderProps: TableHeaderRenderProps,
  ) => JSX.Element;
}

export interface TableColumnRenderProps {
  /** Whether the column is focused. */
  isFocused: boolean;
  /** Whether the column has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the column is sortable. */
  isSortable: boolean;
  /** The current sort direction ('ascending', 'descending', or undefined). */
  sortDirection: "ascending" | "descending" | undefined;
  /** Whether the column is being hovered. */
  isHovered: boolean;
  /** Whether the column allows resizing. */
  allowsResizing: boolean;
  /** Whether the column is currently being resized. */
  isResizing: boolean;
}

export interface TableColumnProps extends SlotProps {
  /** The unique key for the column. */
  id: Key;
  /** Whether the column allows sorting. */
  allowsSorting?: boolean;
  /** Whether the column allows resizing. */
  allowsResizing?: boolean;
  /** Column width (number for px, string for 'Xfr', 'X%', 'Xpx'). */
  width?: ColumnSize;
  /** Default width for uncontrolled mode. */
  defaultWidth?: ColumnSize;
  /** Minimum column width in px. */
  minWidth?: number;
  /** Maximum column width in px. */
  maxWidth?: number;
  /** The children of the column. */
  children?: RenderChildren<TableColumnRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableColumnRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableColumnRenderProps>;
  /** Ref for the column header element. */
  ref?: RefLike<HTMLTableCellElement>;
  /** Custom renderer for the column header element. */
  render?: (
    props: JSX.ThHTMLAttributes<HTMLTableCellElement>,
    renderProps: TableColumnRenderProps,
  ) => JSX.Element;
}

export interface TableBodyRenderProps {
  /** Whether the body is empty. */
  isEmpty: boolean;
}

export interface TableBodyProps<T> extends SlotProps {
  /** The items to render. If not provided, uses items from Table. */
  items?: T[];
  /** The children (usually a render function for TableRow). */
  children?: (item: T) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableBodyRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableBodyRenderProps>;
  /** A function to render when the body is empty. */
  renderEmptyState?: () => JSX.Element;
  /** Whether there are more rows to load. */
  hasMore?: boolean;
  /** Whether additional rows are currently loading. */
  isLoading?: boolean;
  /** Called when the load more sentinel becomes visible. */
  onLoadMore?: () => void | Promise<void>;
  /** Ref for the table body element. */
  ref?: RefLike<HTMLTableSectionElement>;
  /** Custom renderer for the table body element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLTableSectionElement>,
    renderProps: TableBodyRenderProps,
  ) => JSX.Element;
}

export interface TableFooterRenderProps {
  /** Whether the footer has no items. */
  isEmpty: boolean;
}

export interface TableFooterProps<T> extends SlotProps {
  /** The footer items to render. */
  items?: T[];
  /** The children, or a render function when `items` is provided. */
  children?: JSX.Element | ((item: T) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableFooterRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableFooterRenderProps>;
}

export interface TableRowRenderProps {
  /** Whether the row is selected. */
  isSelected: boolean;
  /** Whether the row is focused. */
  isFocused: boolean;
  /** Whether the row has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the row is pressed. */
  isPressed: boolean;
  /** Whether the row is hovered. */
  isHovered: boolean;
  /** Whether the row is disabled. */
  isDisabled: boolean;
}

export interface TableRowProps<T> extends SlotProps {
  /** The unique key for the row. */
  id?: Key;
  /** The item value. */
  item?: T;
  /** Columns to render when children is a column render function. */
  columns?: TableColumnDefinition<T>[];
  /** Whether the row is disabled. */
  isDisabled?: boolean;
  /** The children of the row (usually TableCell components). */
  children?:
    | JSX.Element
    | RenderChildren<TableRowRenderProps>
    | ((column: TableColumnDefinition<T>) => JSX.Element);
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableRowRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableRowRenderProps>;
  /** Handler called when the row is activated (double-click or Enter). */
  onAction?: () => void;
  /** The URL this row links to. */
  href?: string;
  /** Link target for linked rows. */
  target?: LinkDOMProps["target"];
  /** Link relationship for linked rows. */
  rel?: LinkDOMProps["rel"];
  /** Download attribute for linked rows. */
  download?: LinkDOMProps["download"];
  /** Ping attribute for linked rows. */
  ping?: LinkDOMProps["ping"];
  /** Referrer policy for linked rows. */
  referrerPolicy?: LinkDOMProps["referrerPolicy"];
  /** Router options for linked rows. */
  routerOptions?: RouterOptions;
  /** Ref for the table row element. */
  ref?: RefLike<HTMLTableRowElement>;
  /** Custom renderer for the table row element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLTableRowElement>,
    renderProps: TableRowRenderProps,
  ) => JSX.Element;
}

export interface TableCellRenderProps {
  /** Whether the cell is focused. */
  isFocused: boolean;
  /** Whether the cell has keyboard focus. */
  isFocusVisible: boolean;
  /** The zero-based column index for the cell. */
  columnIndex: number;
  /** Whether the cell is pressed. */
  isPressed: boolean;
  /** Whether the cell is hovered. */
  isHovered: boolean;
}

export interface TableCellProps extends SlotProps {
  /** The unique key for the cell. */
  id?: Key;
  /** Number of columns spanned by the cell. */
  colSpan?: number;
  /** The children of the cell. */
  children?: RenderChildren<TableCellRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<TableCellRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<TableCellRenderProps>;
  /** Ref for the table cell element. */
  ref?: RefLike<HTMLTableCellElement>;
  /** Custom renderer for the table cell element. */
  render?: (
    props: JSX.TdHTMLAttributes<HTMLTableCellElement>,
    renderProps: TableCellRenderProps,
  ) => JSX.Element;
}

export interface TableLoadMoreItemProps extends SlotProps {
  onLoadMore: () => void | Promise<void>;
  isLoading?: boolean;
  /** Scroll offset multiplier for early loading trigger (default: 1 = 100% of viewport height). */
  scrollOffset?: number;
  colSpan?: number;
  children?: JSX.Element;
  class?: ClassNameOrFunction<{ isLoading: boolean }>;
  style?: StyleOrFunction<{ isLoading: boolean }>;
}

interface TableContextValue<T extends object> {
  state: TableState<T, TableCollection<T>>;
  collection: TableCollection<T>;
  items: T[];
  columns: (ColumnDefinition<T> & { id?: Key })[];
  isDisabled: boolean;
  showSelectionCheckboxes: boolean;
  dragAndDropHooks?: DragAndDropHooks<T>;
  dragState?: unknown;
  dropState?: unknown;
  isVirtualized: boolean;
}

export const TableContext = createContext<TableContextValue<object> | null>(null);
export const TableStateContext = createContext<TableState<object, TableCollection<object>> | null>(
  null,
);
/** The resize context carries a getter for the resize state. The getter may return null before columns register. */
export const TableColumnResizeStateContext = createContext<{
  getState: () => TableColumnResizeState | null;
  getCallbacks?: () => {
    onResizeStart?: (widths: Map<Key, number>) => void;
    onResize?: (widths: Map<Key, number>) => void;
    onResizeEnd?: (widths: Map<Key, number>) => void;
  };
} | null>(null);

interface TableRowContextValue {
  rowKey: Key;
  rowNode: GridNode<unknown>;
  getCellColumnKey(cellId: string, explicitId?: Key): Key | undefined;
}

export const TableRowContext = createContext<TableRowContextValue | null>(null);

/**
 * A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
 * and optionally supports row selection and sorting.
 */
export function Table<T extends object>(props: TableProps<T>): JSX.Element {
  const [local, stateProps, ariaProps] = splitProps(
    props,
    ["class", "style", "render", "slot", "renderEmptyState", "dragAndDropHooks", "ref"],
    [
      "items",
      "columns",
      "getKey",
      "getTextValue",
      "disabledKeys",
      "disabledBehavior",
      "escapeKeyBehavior",
      "selectionMode",
      "selectionBehavior",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "sortDescriptor",
      "onSortChange",
      "showSelectionCheckboxes",
    ],
  );

  const [ref, setRef] = createSignal<HTMLTableElement | null>(null);
  const normalizedColumns = createMemo(() => normalizeColumnDefinitions(stateProps.columns));
  const rowHeaderColumnKeys = createMemo(() => getRowHeaderColumnKeys(normalizedColumns()));

  const collection = createMemo(() =>
    createTableCollection<T>({
      columns: normalizedColumns(),
      rows: stateProps.items,
      getKey: stateProps.getKey,
      getTextValue: stateProps.getTextValue as
        | ((item: T, column: ColumnDefinition<T>) => string)
        | undefined,
      showSelectionCheckboxes: stateProps.showSelectionCheckboxes ?? false,
      rowHeaderColumnKeys: rowHeaderColumnKeys().size > 0 ? rowHeaderColumnKeys() : undefined,
    }),
  );

  const state = createTableState<T, TableCollection<T>>(() => ({
    collection: collection(),
    disabledKeys: stateProps.disabledKeys,
    selectionMode: stateProps.selectionMode,
    selectionBehavior: stateProps.selectionBehavior,
    selectedKeys: stateProps.selectedKeys,
    defaultSelectedKeys: stateProps.defaultSelectedKeys,
    onSelectionChange: stateProps.onSelectionChange,
    sortDescriptor: stateProps.sortDescriptor,
    onSortChange: stateProps.onSortChange,
    showSelectionCheckboxes: stateProps.showSelectionCheckboxes,
  }));
  const parentCollectionRenderer = useCollectionRenderer<T>();

  const { gridProps } = createTable<T>(
    () => ({
      id: ariaProps.id,
      "aria-label": ariaProps["aria-label"],
      "aria-labelledby": ariaProps["aria-labelledby"],
      "aria-describedby": ariaProps["aria-describedby"],
      isVirtualized: ariaProps.isVirtualized ?? parentCollectionRenderer?.isVirtualized,
      onRowAction: ariaProps.onRowAction,
      onCellAction: ariaProps.onCellAction,
      shouldSelectOnPressUp: ariaProps.shouldSelectOnPressUp,
      focusMode: ariaProps.focusMode,
      escapeKeyBehavior: stateProps.escapeKeyBehavior,
    }),
    () => state,
    ref,
  );

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TableRenderProps>(() => ({
    isFocused: state.isFocused || isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: false, // Tables don't have a global disabled state
    isEmpty: stateProps.items.length === 0,
  }));

  // Resolve render props (class and style only — children rendered directly in JSX
  // to avoid eager evaluation before context providers mount)
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    return filtered;
  });

  const cleanGridProps = () => {
    const { ref: _ref1, ...rest } = gridProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref2, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const getItemNodes = createMemo(() =>
    Array.from(state.collection).filter((node) => node.type === "item"),
  );
  const getDropTargetByIndex = (
    index: number,
    position: "before" | "after" | "on",
  ): DropTarget | null => {
    const node = getItemNodes()[index];
    if (!node) return null;
    return { type: "item", key: node.key, dropPosition: position };
  };
  const hasDroppableDnd = createMemo(() => {
    const hooks = local.dragAndDropHooks;
    return Boolean(
      hooks?.useDroppableCollectionState &&
      hooks.useDroppableCollection &&
      (hooks.dropTargetDelegate ||
        parentCollectionRenderer?.dropTargetDelegate ||
        hooks.ListDropTargetDelegate),
    );
  });
  const hasDraggableDnd = createMemo(() => {
    const hooks = local.dragAndDropHooks;
    return Boolean(hooks?.useDraggableCollectionState && hooks.useDraggableCollection);
  });
  const dragState = createMemo(() => {
    if (!hasDraggableDnd()) return undefined;
    return local.dragAndDropHooks?.useDraggableCollectionState?.({
      items: stateProps.items,
    });
  });
  const dropState = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    return local.dragAndDropHooks?.useDroppableCollectionState?.({});
  });
  createEffect(() => {
    if (!hasDraggableDnd()) return;
    const hooks = local.dragAndDropHooks;
    const activeDragState = dragState();
    if (!hooks?.useDraggableCollection || !activeDragState) return;
    hooks.useDraggableCollection({}, activeDragState, () => ref());
  });
  const droppableCollection = createMemo(() => {
    if (!hasDroppableDnd()) return undefined;
    const hooks = local.dragAndDropHooks;
    const activeDropState = dropState();
    if (!hooks?.useDroppableCollection || !activeDropState) return undefined;
    const resolveDirection = (): "ltr" | "rtl" => {
      const el = ref();
      if (el && typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
        const dir = window.getComputedStyle(el).direction;
        if (dir === "rtl") return "rtl";
      }
      return typeof document !== "undefined" && document.dir === "rtl" ? "rtl" : "ltr";
    };
    const dropTargetDelegate =
      hooks.dropTargetDelegate ??
      parentCollectionRenderer?.dropTargetDelegate ??
      (hooks.ListDropTargetDelegate
        ? new hooks.ListDropTargetDelegate(
            () => state.collection,
            () => ref(),
            { layout: "grid", orientation: "vertical", direction: resolveDirection() },
          )
        : undefined);
    if (!dropTargetDelegate) return undefined;
    return hooks.useDroppableCollection(
      {
        dropTargetDelegate,
        keyboardDelegate: {
          getFirstKey: () => state.collection.getFirstKey?.() ?? null,
          getLastKey: () => state.collection.getLastKey?.() ?? null,
          getKeyBelow: (key) => state.collection.getKeyAfter?.(key) ?? null,
          getKeyAbove: (key) => state.collection.getKeyBefore?.(key) ?? null,
          getKeyLeftOf: (key) =>
            resolveDirection() === "rtl"
              ? (state.collection.getKeyAfter?.(key) ?? null)
              : (state.collection.getKeyBefore?.(key) ?? null),
          getKeyRightOf: (key) =>
            resolveDirection() === "rtl"
              ? (state.collection.getKeyBefore?.(key) ?? null)
              : (state.collection.getKeyAfter?.(key) ?? null),
          getKeyPageBelow: (key) => state.collection.getKeyAfter?.(key) ?? null,
          getKeyPageAbove: (key) => state.collection.getKeyBefore?.(key) ?? null,
        },
        get collection() {
          return state.collection;
        },
        get selectedKeys() {
          return state.selectedKeys;
        },
        setSelectedKeys: (keys: Set<Key>) => {
          if (state.selectionMode === "none") return;
          state.clearSelection();
          for (const key of keys) {
            state.toggleSelection(key);
          }
        },
        setFocusedKey: (key) => state.setFocusedKey(key),
      },
      activeDropState,
      () => ref(),
    );
  });
  const isRootDropTarget = createMemo(() => {
    return Boolean(dropState()?.target?.type === "root");
  });
  const dndRenderDropIndicator = createMemo(() =>
    useRenderDropIndicator(local.dragAndDropHooks, dropState()),
  );
  const dndDropIndicator = (index: number, position: "before" | "after" | "on") => {
    const target = getDropTargetByIndex(index, position);
    if (!target || target.type !== "item") return undefined;
    return dndRenderDropIndicator()?.(target);
  };

  const contextValue: TableContextValue<T> = {
    state,
    get collection() {
      return collection();
    },
    get items() {
      return stateProps.items;
    },
    get columns() {
      return normalizedColumns();
    },
    isDisabled: false,
    get showSelectionCheckboxes() {
      return stateProps.showSelectionCheckboxes ?? false;
    },
    get dragAndDropHooks() {
      return local.dragAndDropHooks;
    },
    get dragState() {
      return dragState();
    },
    get dropState() {
      return dropState();
    },
    get isVirtualized() {
      return ariaProps.isVirtualized ?? parentCollectionRenderer?.isVirtualized ?? false;
    },
  };
  const collectionRenderer = createMemo<CollectionRendererContextValue<unknown>>(() => ({
    ...parentCollectionRenderer,
    renderItem: (item) => item as JSX.Element,
    renderDropIndicator: (index: number, position: "before" | "after" | "on") =>
      dndDropIndicator(index, position) ??
      parentCollectionRenderer?.renderDropIndicator?.(index, position),
  }));
  const tableChildren = () =>
    typeof props.children === "function" ? props.children(renderValues()) : props.children;
  const tableProps = () =>
    ({
      ref: (el: HTMLTableElement) => {
        setRef(el);
        assignRef(local.ref, el);
      },
      ...mergeProps(
        domProps(),
        cleanGridProps(),
        cleanFocusProps(),
        (droppableCollection()?.collectionProps as Record<string, unknown> | undefined) ?? {},
      ),
      class: renderProps.class(),
      style: renderProps.style(),
      "data-focused": state.isFocused || undefined,
      "data-focus-visible": isFocusVisible() || undefined,
      "data-empty": stateProps.items.length === 0 || undefined,
      "data-drop-target": isRootDropTarget() || undefined,
      slot: local.slot,
      children: tableChildren(),
    }) as JSX.HTMLAttributes<HTMLTableElement>;

  return (
    <TableContext.Provider value={contextValue as unknown as TableContextValue<object>}>
      <TableStateContext.Provider
        value={state as unknown as TableState<object, TableCollection<object>>}
      >
        <CollectionRendererContext.Provider value={collectionRenderer()}>
          {local.render ? local.render(tableProps(), renderValues()) : <table {...tableProps()} />}
        </CollectionRendererContext.Provider>
      </TableStateContext.Provider>
    </TableContext.Provider>
  );
}

/**
 * A header row in a table containing column headers.
 */
export function TableHeader(props: TableHeaderProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "render",
    "slot",
    "children",
    "ref",
  ]);

  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableHeader must be used within a Table");
  }

  const { rowGroupProps } = createTableRowGroup(() => ({ type: "thead" }));

  const { isHovered, hoverProps } = createHover({
    isDisabled: false,
    onHoverStart(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverStart?.(e);
    },
    onHoverEnd(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverEnd?.(e);
    },
    onHoverChange(isHovering) {
      (domProps as Record<string, (isHovering: boolean) => void>).onHoverChange?.(isHovering);
    },
  });

  const renderValues = createMemo<TableHeaderRenderProps>(() => ({
    isFocused: false,
    isHovered: isHovered(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-header",
    },
    renderValues,
  );

  const cleanRowGroupProps = () => {
    const { ref: _ref, ...rest } = rowGroupProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  const headerProps = () =>
    ({
      ref: (el: HTMLTableSectionElement) => assignRef(local.ref, el),
      ...domProps,
      ...cleanRowGroupProps(),
      ...cleanHoverProps(),
      class: renderProps.class(),
      style: renderProps.style(),
      "data-hovered": isHovered() || undefined,
      children: <tr role="row">{local.children}</tr>,
    }) as JSX.HTMLAttributes<HTMLTableSectionElement>;

  return local.render ? (
    local.render(headerProps(), renderValues())
  ) : (
    <thead
      ref={(el) => assignRef(local.ref, el)}
      {...domProps}
      {...cleanRowGroupProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-hovered={isHovered() || undefined}
    >
      <tr role="row">{local.children}</tr>
    </thead>
  );
}

/**
 * A column header in a table.
 */
export function TableColumn(props: TableColumnProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "render",
    "slot",
    "id",
    "allowsSorting",
    "allowsResizing",
    "width",
    "defaultWidth",
    "minWidth",
    "maxWidth",
    "children",
    "ref",
  ]);

  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableColumn must be used within a Table");
  }
  const { state, collection } = context;

  const [ref, setRef] = createSignal<HTMLTableCellElement | null>(null);

  const columnNode = createMemo(() => {
    const node = collection.getItem(local.id);
    if (!node) {
      return {
        type: "column" as const,
        key: local.id,
        value: null,
        textValue: String(local.id),
        level: 0,
        index: 0,
        hasChildNodes: false,
        childNodes: [],
      } as GridNode<unknown>;
    }
    return node;
  });

  const columnHeaderAria = createTableColumnHeader<object>(
    () => ({
      node: columnNode(),
      allowsSorting: local.allowsSorting,
    }),
    () => state as TableState<object, TableCollection<object>>,
    ref,
  );

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return !local.allowsSorting;
    },
    onHoverStart(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverStart?.(e);
    },
    onHoverEnd(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverEnd?.(e);
    },
    onHoverChange(isHovering) {
      (domProps as Record<string, (isHovering: boolean) => void>).onHoverChange?.(isHovering);
    },
  });

  const { isFocusVisible, focusProps } = createFocusRing();

  const sortDirection = createMemo(() => {
    const sortDescriptor = state.sortDescriptor;
    if (sortDescriptor?.column === local.id) {
      return sortDescriptor.direction;
    }
    return undefined;
  });

  const resizeCtx = useContext(TableColumnResizeStateContext);

  const isResizing = createMemo(() => {
    const rs = resizeCtx?.getState();
    if (!rs) return false;
    return rs.resizingColumn() === local.id;
  });

  const resizeWidth = createMemo(() => {
    const rs = resizeCtx?.getState();
    if (!rs) return undefined;
    const w = rs.getColumnWidth(local.id);
    return w > 0 ? w : undefined;
  });

  const renderValues = createMemo<TableColumnRenderProps>(() => ({
    isFocused: state.focusedKey === local.id,
    isFocusVisible: isFocusVisible() && state.focusedKey === local.id,
    isSortable: local.allowsSorting ?? false,
    sortDirection: sortDirection(),
    isHovered: isHovered(),
    allowsResizing: local.allowsResizing ?? false,
    isResizing: isResizing(),
  }));

  // Resolve render props (children rendered directly in JSX to avoid eager evaluation)
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-column",
    },
    renderValues,
  );

  const cleanColumnHeaderProps = () => {
    const { ref: _ref1, ...rest } = columnHeaderAria.columnHeaderProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const columnStyle = createMemo(() => {
    const base = renderProps.style();
    const rw = resizeWidth();
    if (rw == null) return base;
    const widthStyle = { width: `${rw}px`, "min-width": `${rw}px`, "max-width": `${rw}px` };
    if (!base) return widthStyle;
    if (typeof base === "string") return widthStyle; // fallback
    return { ...base, ...widthStyle };
  });

  const columnChildren = () =>
    typeof local.children === "function" ? local.children(renderValues()) : local.children;
  const columnProps = () =>
    ({
      ref: (el: HTMLTableCellElement) => {
        setRef(el);
        assignRef(local.ref, el);
      },
      ...domProps,
      ...mergeProps(cleanColumnHeaderProps(), cleanHoverProps(), cleanFocusProps()),
      class: renderProps.class(),
      style: columnStyle(),
      "data-sortable": local.allowsSorting || undefined,
      "data-sort-direction": sortDirection() || undefined,
      "data-resizable": local.allowsResizing || undefined,
      "data-resizing": isResizing() || undefined,
      "data-hovered": isHovered() || undefined,
      "data-focused": state.focusedKey === local.id || undefined,
      "data-focus-visible": (isFocusVisible() && state.focusedKey === local.id) || undefined,
      children: columnChildren(),
    }) as JSX.ThHTMLAttributes<HTMLTableCellElement>;

  return local.render ? (
    local.render(columnProps(), renderValues())
  ) : (
    <th
      ref={(el) => {
        setRef(el);
        assignRef(local.ref, el);
      }}
      {...domProps}
      {...mergeProps(cleanColumnHeaderProps(), cleanHoverProps(), cleanFocusProps())}
      class={renderProps.class()}
      style={columnStyle()}
      data-sortable={local.allowsSorting || undefined}
      data-sort-direction={sortDirection() || undefined}
      data-resizable={local.allowsResizing || undefined}
      data-resizing={isResizing() || undefined}
      data-hovered={isHovered() || undefined}
      data-focused={state.focusedKey === local.id || undefined}
      data-focus-visible={(isFocusVisible() && state.focusedKey === local.id) || undefined}
    >
      {columnChildren()}
    </th>
  );
}

/**
 * The body of a table containing data rows.
 */
export function TableBody<T extends object>(props: TableBodyProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "items",
    "class",
    "style",
    "render",
    "slot",
    "renderEmptyState",
    "hasMore",
    "isLoading",
    "onLoadMore",
    "children",
    "ref",
  ]);

  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableBody must be used within a Table");
  }

  const { rowGroupProps } = createTableRowGroup(() => ({ type: "tbody" }));

  const items = createMemo(() => (local.items ?? context.items) as T[]);

  const renderValues = createMemo<TableBodyRenderProps>(() => ({
    isEmpty: items().length === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-body",
    },
    renderValues,
  );

  const cleanRowGroupProps = () => {
    const { ref: _ref, ...rest } = rowGroupProps as Record<string, unknown>;
    return rest;
  };

  const isEmpty = () => items().length === 0;
  const virtualizer = useVirtualizerContext();
  const parentCollectionRenderer = useCollectionRenderer<T>();
  const rowNodes = createMemo(() =>
    Array.from(context.collection).filter((node) => node.type === "item"),
  );
  const persistedKeys = useDndPersistedKeys(
    { focusedKey: () => context.state.focusedKey },
    context.dragAndDropHooks,
    context.dropState as { target?: DropTarget | null } | undefined,
    context.collection,
  );
  const virtualRange = createMemo(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized) return null;
    const rowCount = items().length;
    const baseRange = virtualizer.getVisibleRange(rowCount);
    const persistedIndexes = Array.from(persistedKeys())
      .map((key) => rowNodes().findIndex((node) => node.key === key))
      .filter((index) => index >= 0);
    const dropTarget = (context.dropState as { target?: DropTarget | null } | undefined)?.target;
    const normalizedDropKey = getNormalizedDropTargetKey(dropTarget, context.collection);
    const focusedKey = context.state.focusedKey;
    const focusedIndex =
      focusedKey != null ? rowNodes().findIndex((node) => node.key === focusedKey) : -1;
    const forceIncludeIndexes = [
      dropTarget?.type === "item"
        ? rowNodes().findIndex((node) => node.key === dropTarget.key)
        : -1,
      normalizedDropKey != null
        ? rowNodes().findIndex((node) => node.key === normalizedDropKey)
        : -1,
      dropTarget?.type === "item" ? -1 : focusedIndex,
    ].filter((index) => index >= 0);
    return mergePersistedKeysIntoVirtualRange(
      baseRange,
      persistedIndexes,
      rowCount,
      virtualizer,
      80,
      {
        forceIncludeIndexes,
        forceIncludeMaxSpan: 320,
      },
    );
  });
  createEffect(() => {
    if (!virtualizer || !parentCollectionRenderer?.isVirtualized) return;
    virtualizer.setDropTargetItemCountResolver(() => items().length);
    virtualizer.setDropTargetIndexResolver((key) => {
      const index = rowNodes().findIndex((node) => node.key === key);
      return index >= 0 ? index : null;
    });
    virtualizer.setDropTargetResolver((target) => {
      const node = rowNodes()[target.index];
      if (!node) return target;
      return {
        ...target,
        key: typeof node.key === "string" || typeof node.key === "number" ? node.key : undefined,
      };
    });
    onCleanup(() => {
      virtualizer.setDropTargetIndexResolver(undefined);
      virtualizer.setDropTargetItemCountResolver(undefined);
      virtualizer.setDropTargetResolver(undefined);
    });
  });
  const visibleItems = createMemo(() => {
    const range = virtualRange();
    if (!range) return items();
    return items().slice(range.start, range.end);
  });
  const spacerColSpan = () => context.columns.length + (context.showSelectionCheckboxes ? 1 : 0);

  const bodyChildren = () => (
    <>
      <SharedElementTransition>
        <Show
          when={isEmpty() && local.renderEmptyState && !local.isLoading}
          fallback={
            <>
              {virtualRange()?.offsetTop ? (
                <tr role="presentation" aria-hidden="true" data-virtualizer-spacer="top">
                  <td
                    colSpan={spacerColSpan()}
                    style={{ height: `${virtualRange()!.offsetTop}px`, padding: "0", border: "0" }}
                  />
                </tr>
              ) : null}
              <For each={visibleItems()}>
                {(item, index) => {
                  const itemIndex = () => (virtualRange()?.start ?? 0) + index();
                  const beforeIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "before");
                  const onIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "on");
                  const afterIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "after");
                  return (
                    <>
                      {beforeIndicator()}
                      {onIndicator()}
                      {local.children?.(item)}
                      {afterIndicator()}
                    </>
                  );
                }}
              </For>
              {virtualRange()?.offsetBottom ? (
                <tr role="presentation" aria-hidden="true" data-virtualizer-spacer="bottom">
                  <td
                    colSpan={spacerColSpan()}
                    style={{
                      height: `${virtualRange()!.offsetBottom}px`,
                      padding: "0",
                      border: "0",
                    }}
                  />
                </tr>
              ) : null}
            </>
          }
        >
          <tr role="row" data-empty-state>
            <th role="rowheader" colSpan={spacerColSpan()}>
              {local.renderEmptyState?.()}
            </th>
          </tr>
        </Show>
      </SharedElementTransition>
      <Show when={local.hasMore && local.onLoadMore}>
        <TableLoadMoreItem
          onLoadMore={local.onLoadMore!}
          isLoading={local.isLoading}
          colSpan={spacerColSpan()}
        />
      </Show>
    </>
  );
  const bodyProps = () =>
    ({
      ref: (el: HTMLTableSectionElement) => assignRef(local.ref, el),
      ...domProps,
      ...cleanRowGroupProps(),
      class: renderProps.class(),
      style: renderProps.style(),
      "data-empty": isEmpty() || undefined,
      children: bodyChildren(),
    }) as JSX.HTMLAttributes<HTMLTableSectionElement>;

  return local.render ? (
    local.render(bodyProps(), renderValues())
  ) : (
    <tbody
      ref={(el) => assignRef(local.ref, el)}
      {...domProps}
      {...cleanRowGroupProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-empty={isEmpty() || undefined}
    >
      <SharedElementTransition>
        <Show
          when={isEmpty() && local.renderEmptyState && !local.isLoading}
          fallback={
            <>
              {virtualRange()?.offsetTop ? (
                <tr role="presentation" aria-hidden="true" data-virtualizer-spacer="top">
                  <td
                    colSpan={spacerColSpan()}
                    style={{ height: `${virtualRange()!.offsetTop}px`, padding: "0", border: "0" }}
                  />
                </tr>
              ) : null}
              <For each={visibleItems()}>
                {(item, index) => {
                  const itemIndex = () => (virtualRange()?.start ?? 0) + index();
                  const beforeIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "before");
                  const onIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "on");
                  const afterIndicator = () =>
                    parentCollectionRenderer?.renderDropIndicator?.(itemIndex(), "after");
                  return (
                    <>
                      {beforeIndicator()}
                      {onIndicator()}
                      {local.children?.(item)}
                      {afterIndicator()}
                    </>
                  );
                }}
              </For>
              {virtualRange()?.offsetBottom ? (
                <tr role="presentation" aria-hidden="true" data-virtualizer-spacer="bottom">
                  <td
                    colSpan={spacerColSpan()}
                    style={{
                      height: `${virtualRange()!.offsetBottom}px`,
                      padding: "0",
                      border: "0",
                    }}
                  />
                </tr>
              ) : null}
            </>
          }
        >
          <tr role="row" data-empty-state>
            <th role="rowheader" colSpan={spacerColSpan()}>
              {local.renderEmptyState?.()}
            </th>
          </tr>
        </Show>
      </SharedElementTransition>
      <Show when={local.hasMore && local.onLoadMore}>
        <TableLoadMoreItem
          onLoadMore={local.onLoadMore!}
          isLoading={local.isLoading}
          colSpan={spacerColSpan()}
        />
      </Show>
    </tbody>
  );
}

/**
 * The footer of a table containing summary rows.
 */
export function TableFooter<T extends object>(props: TableFooterProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, ["items", "class", "style", "slot", "children"]);

  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableFooter must be used within a Table");
  }

  const { rowGroupProps } = createTableRowGroup(() => ({ type: "tfoot" }));
  const items = createMemo(() => local.items ?? []);

  const renderValues = createMemo<TableFooterRenderProps>(() => ({
    isEmpty: items().length === 0,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-footer",
    },
    renderValues,
  );

  const cleanRowGroupProps = () => {
    const { ref: _ref, ...rest } = rowGroupProps as Record<string, unknown>;
    return rest;
  };

  return (
    <tfoot
      {...domProps}
      {...cleanRowGroupProps()}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      <Show
        when={local.items && typeof local.children === "function"}
        fallback={local.children as JSX.Element}
      >
        <For each={items()}>{(item) => (local.children as (item: T) => JSX.Element)(item)}</For>
      </Show>
    </tfoot>
  );
}

export function TableLoadMoreItem(props: TableLoadMoreItemProps): JSX.Element {
  let sentinelRef: HTMLDivElement | undefined;
  const [isPending, setIsPending] = createSignal(false);
  const isLoading = () => !!props.isLoading || isPending();

  const triggerLoadMore = async () => {
    if (isPending()) return;
    setIsPending(true);
    try {
      await props.onLoadMore();
    } finally {
      setIsPending(false);
    }
  };

  createEffect(() => {
    if (!sentinelRef || typeof IntersectionObserver !== "function") return;
    const offset = props.scrollOffset ?? 1;
    const margin = `0px 0px ${100 * offset}% 0px`;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void triggerLoadMore();
        }
      },
      { rootMargin: margin },
    );
    observer.observe(sentinelRef);
    return () => observer.disconnect();
  });

  const renderProps = useRenderProps(
    {
      children:
        props.children ??
        (() => (isLoading() ? <div role="progressbar" aria-label="loading" /> : null)),
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-Table-loadMore",
    },
    () => ({ isLoading: isLoading() }),
  );

  return (
    <>
      <tr style={{ position: "relative", width: 0, height: 0, overflow: "hidden" }} inert>
        <td>
          <div
            ref={sentinelRef}
            data-testid="loadMoreSentinel"
            style={{ position: "absolute", height: "1px", width: "1px" }}
          />
        </td>
      </tr>
      <Show when={isLoading()}>
        <tr
          role="row"
          tabIndex={0}
          onFocus={() => {
            void triggerLoadMore();
          }}
          class={renderProps.class()}
          style={renderProps.style()}
          data-loading
        >
          <td role="rowheader" colSpan={props.colSpan ?? 1}>
            {renderProps.renderChildren()}
          </td>
        </tr>
      </Show>
    </>
  );
}

/**
 * A row in a table.
 */
export function TableRow<T extends object>(props: TableRowProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "render",
    "slot",
    "id",
    "item",
    "columns",
    "isDisabled",
    "onAction",
    "children",
    "ref",
    "href",
    "target",
    "rel",
    "download",
    "ping",
    "referrerPolicy",
    "routerOptions",
  ]);

  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableRow must be used within a Table");
  }
  const { state, collection } = context;
  const tableContext = context as unknown as TableContextValue<T>;
  const registeredCellIds: string[] = [];
  const generatedId = createUniqueId();
  const rowKey = () => local.id ?? generatedId;
  const router = useRouter();
  const linkProps = createMemo(() =>
    useLinkProps({
      href: local.href,
      target: local.target,
      rel: local.rel,
      download: local.download,
      ping: local.ping,
      referrerPolicy: local.referrerPolicy,
    }),
  );

  const [ref, setRef] = createSignal<HTMLTableRowElement | null>(null);

  const rowNode = createMemo(() => {
    const node = collection.getItem(rowKey());
    if (!node) {
      return {
        type: "item" as const,
        key: rowKey(),
        value: local.item ?? null,
        textValue: String(local.id),
        level: 0,
        index: 0,
        hasChildNodes: true,
        childNodes: [],
      } as GridNode<unknown>;
    }
    return node;
  });

  const rowAria = createTableRow<object>(
    () => ({
      node: rowNode(),
      isVirtualized: tableContext.isVirtualized,
      isDisabled: local.isDisabled,
      onAction: local.onAction,
      href: linkProps().href,
      onLinkAction: (event) => {
        const target = ref();
        if (!target || !local.href) return;
        router.open(target, event as RouterClickModifiers, local.href, local.routerOptions);
      },
    }),
    () => state as TableState<object, TableCollection<object>>,
    ref,
  );
  const isSelected = () => rowAria.isSelected;
  const isDisabled = () => rowAria.isDisabled;
  const isPressed = () => rowAria.isPressed;
  const isInteractive = () => {
    const tableData = getTableData(state as TableState<object, TableCollection<object>>);
    return state.selectionMode !== "none" || !!tableData?.actions.onRowAction || !!local.onAction;
  };

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled() || !isInteractive();
    },
    onHoverStart(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverStart?.(e);
    },
    onHoverEnd(e) {
      (domProps as Record<string, (e: unknown) => void>).onHoverEnd?.(e);
    },
    onHoverChange(isHovering) {
      (domProps as Record<string, (isHovering: boolean) => void>).onHoverChange?.(isHovering);
    },
  });

  const { isFocusVisible, focusProps } = createFocusRing();
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);
  const focusWithinProps = {
    onFocusIn() {
      setIsFocusWithin(true);
    },
    onFocusOut(e: FocusEvent) {
      const currentTarget = e.currentTarget as HTMLElement;
      const nextTarget = e.relatedTarget as Node | null;
      if (!nextTarget || !currentTarget.contains(nextTarget)) {
        setIsFocusWithin(false);
      }
    },
  };

  const isFocused = createMemo(() => state.focusedKey === rowKey());
  const draggableItem = createMemo(() => {
    if (!tableContext.dragAndDropHooks?.useDraggableItem || !tableContext.dragState)
      return undefined;
    return tableContext.dragAndDropHooks.useDraggableItem(
      {
        key: rowKey() as string | number,
        hasDragButton: true,
      },
      tableContext.dragState as Parameters<NonNullable<DragAndDropHooks<T>["useDraggableItem"]>>[1],
    );
  });
  const droppableItem = createMemo(() => {
    if (!tableContext.dragAndDropHooks?.useDroppableItem || !tableContext.dropState)
      return undefined;
    return tableContext.dragAndDropHooks.useDroppableItem(
      {
        key: rowKey() as string | number,
      },
      tableContext.dropState as Parameters<NonNullable<DragAndDropHooks<T>["useDroppableItem"]>>[1],
      () => ref(),
    );
  });

  const renderValues = createMemo<TableRowRenderProps>(() => ({
    isSelected: isSelected(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible() && isFocused(),
    isPressed: isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
  }));

  // Resolve render props (children rendered directly in JSX to avoid eager evaluation)
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-row",
    },
    renderValues,
  );

  const cleanRowProps = () => {
    const { ref: _ref1, ...rest } = rowAria.rowProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const rowContextValue: TableRowContextValue = {
    rowKey: rowKey(),
    rowNode: rowNode(),
    getCellColumnKey(cellId, explicitId) {
      if (explicitId === "__selection__") {
        return explicitId;
      }

      let index = registeredCellIds.indexOf(cellId);
      if (index < 0) {
        index = registeredCellIds.length;
        registeredCellIds.push(cellId);
      }

      return explicitId ?? tableContext.columns[index]?.key;
    },
  };
  const dragButtonProps = createMemo<ButtonProps>(() => {
    const props = (draggableItem()?.dragButtonProps as ButtonProps | undefined) ?? {};
    const textValue = (rowNode().textValue || String(rowKey())).trim();
    return {
      ...props,
      "aria-label": `Drag ${textValue}`,
      style: {
        ...(typeof props.style === "object" ? props.style : {}),
        "pointer-events": "none",
      },
    };
  });
  const buttonContextValue = createMemo(() => ({
    slots: {
      default: {},
      drag: dragButtonProps(),
    },
  }));

  const rowChildren = () => (
    <ButtonContext.Provider value={buttonContextValue()}>
      {typeof local.children === "function" ? (
        local.columns ? (
          <For each={local.columns}>
            {(column) =>
              (local.children as (column: TableColumnDefinition<T>) => JSX.Element)(column)
            }
          </For>
        ) : (
          (local.children as (renderProps: TableRowRenderProps) => JSX.Element)(renderValues())
        )
      ) : (
        local.children
      )}
    </ButtonContext.Provider>
  );
  const tableRowProps = () =>
    ({
      ref: (el: HTMLTableRowElement) => {
        setRef(el);
        assignRef(local.ref, el);
      },
      ...domProps,
      ...mergeProps(
        cleanRowProps(),
        cleanHoverProps(),
        cleanFocusProps(),
        focusWithinProps as Record<string, unknown>,
        (draggableItem()?.dragProps as Record<string, unknown> | undefined) ?? {},
        (droppableItem()?.dropProps as Record<string, unknown> | undefined) ?? {},
      ),
      class: renderProps.class(),
      style: renderProps.style(),
      "data-selected": isSelected() || undefined,
      "data-focused": isFocused() || undefined,
      "data-focus-visible": (isFocusVisible() && isFocused()) || undefined,
      "data-focus-visible-within": dataAttr(isFocusWithin() && isGlobalFocusVisible()),
      "data-pressed": isPressed() || undefined,
      "data-hovered": isHovered() || undefined,
      "data-disabled": isDisabled() || undefined,
      "data-href": linkProps().href,
      "data-target": linkProps().target,
      "data-rel": linkProps().rel,
      "data-download":
        typeof linkProps().download === "string"
          ? linkProps().download
          : linkProps().download
            ? ""
            : undefined,
      "data-ping": linkProps().ping,
      "data-referrer-policy": linkProps().referrerPolicy,
      "data-dragging": draggableItem()?.isDragging || undefined,
      "data-drop-target": droppableItem()?.isDropTarget || undefined,
      children: rowChildren(),
    }) as JSX.HTMLAttributes<HTMLTableRowElement>;

  return (
    <TableRowContext.Provider value={rowContextValue}>
      {local.render ? local.render(tableRowProps(), renderValues()) : <tr {...tableRowProps()} />}
    </TableRowContext.Provider>
  );
}

/**
 * A cell in a table row.
 */
export function TableCell(props: TableCellProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "render",
    "slot",
    "id",
    "colSpan",
    "children",
    "ref",
  ]);

  const tableContext = useContext(TableContext);
  const rowContext = useContext(TableRowContext);

  if (!tableContext) {
    throw new Error("TableCell must be used within a Table");
  }
  if (!rowContext) {
    throw new Error("TableCell must be used within a Table");
  }

  const { state, collection } = tableContext;
  const { rowKey, rowNode } = rowContext;

  const [ref, setRef] = createSignal<HTMLTableCellElement | null>(null);
  const cellId = createUniqueId();
  const columnKey = createMemo(() => rowContext.getCellColumnKey(cellId, local.id));

  const cellNode = createMemo(() => {
    const key = columnKey();
    if (key != null) {
      const cellKey = `${rowKey}-${key}`;
      const node = collection.getItem(cellKey);
      if (node) return node;
    }

    return {
      type: "cell" as const,
      key: key ?? `${rowKey}-cell`,
      value: rowNode.value,
      textValue: "",
      level: 1,
      index: 0,
      parentKey: rowKey,
      hasChildNodes: false,
      childNodes: [],
    } as GridNode<unknown>;
  });
  const cellColumnIndex = createMemo(() => {
    const key = columnKey();
    if (key == null) return undefined;
    const cellKey = `${rowKey}-${key}`;
    return collection.getItem(cellKey) ? (cellNode().index ?? 0) : undefined;
  });

  const cellAria = createTableCell<object>(
    () => ({
      node: cellNode(),
    }),
    () => state as TableState<object, TableCollection<object>>,
    ref,
  );
  const isPressed = () => cellAria.isPressed;

  const { isHovered, hoverProps } = createHover({
    isDisabled: false,
  });

  const { isFocusVisible, focusProps } = createFocusRing();

  const isFocused = createMemo(() => state.focusedKey === cellNode().key);

  const renderValues = createMemo<TableCellRenderProps>(() => ({
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible() && isFocused(),
    columnIndex: cellColumnIndex() ?? 0,
    isPressed: isPressed(),
    isHovered: isHovered(),
  }));

  // Resolve render props (children rendered directly in JSX to avoid eager evaluation)
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-cell",
    },
    renderValues,
  );

  const cleanCellProps = () => {
    const { ref: _ref1, ...rest } = cellAria.gridCellProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref3, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  const cellChildren = () =>
    typeof local.children === "function" ? local.children(renderValues()) : local.children;
  const tableCellProps = () =>
    ({
      ref: (el: HTMLTableCellElement) => {
        setRef(el);
        assignRef(local.ref, el);
      },
      ...domProps,
      ...mergeProps(cleanCellProps(), cleanHoverProps(), cleanFocusProps()),
      colSpan: local.colSpan,
      class: renderProps.class(),
      style: renderProps.style(),
      "data-focused": isFocused() || undefined,
      "data-focus-visible": (isFocusVisible() && isFocused()) || undefined,
      "data-column-index": cellColumnIndex(),
      "data-pressed": isPressed() || undefined,
      "data-hovered": isHovered() || undefined,
      children: cellChildren(),
    }) as JSX.TdHTMLAttributes<HTMLTableCellElement>;

  return local.render ? (
    local.render(tableCellProps(), renderValues())
  ) : (
    <td
      ref={(el) => {
        setRef(el);
        assignRef(local.ref, el);
      }}
      {...domProps}
      {...mergeProps(cleanCellProps(), cleanHoverProps(), cleanFocusProps())}
      colSpan={local.colSpan}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={isFocused() || undefined}
      data-focus-visible={(isFocusVisible() && isFocused()) || undefined}
      data-column-index={cellColumnIndex()}
      data-pressed={isPressed() || undefined}
      data-hovered={isHovered() || undefined}
    >
      {cellChildren()}
    </td>
  );
}

export interface TableSelectionCheckboxProps {
  rowKey: Key;
  class?: string;
  style?: JSX.CSSProperties;
  excludeFromTabOrder?: boolean;
  "aria-label"?: string;
}

/**
 * A checkbox cell for row selection.
 */
export function TableSelectionCheckbox(props: TableSelectionCheckboxProps): JSX.Element {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableSelectionCheckbox must be used within a Table");
  }

  const { state } = context;

  const selectionCheckboxAria = createTableSelectionCheckbox<object>(
    () => ({ key: props.rowKey }),
    () => state as TableState<object, TableCollection<object>>,
  );

  return (
    <input
      {...selectionCheckboxAria.checkboxProps}
      class={props.class}
      style={props.style}
      tabIndex={props.excludeFromTabOrder ? -1 : selectionCheckboxAria.checkboxProps.tabIndex}
      aria-label={props["aria-label"] ?? selectionCheckboxAria.checkboxProps["aria-label"]}
    />
  );
}

export interface TableSelectAllCheckboxProps {
  class?: string;
  style?: JSX.CSSProperties;
  "aria-label"?: string;
}

/**
 * A checkbox for select-all functionality.
 */
export function TableSelectAllCheckbox(props: TableSelectAllCheckboxProps = {}): JSX.Element {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("TableSelectAllCheckbox must be used within a Table");
  }

  const { state } = context;

  const selectAllCheckboxAria = createTableSelectAllCheckbox<object>(
    () => state as TableState<object, TableCollection<object>>,
  );

  return (
    <input
      {...selectAllCheckboxAria.checkboxProps}
      class={props.class}
      style={props.style}
      aria-label={props["aria-label"] ?? selectAllCheckboxAria.checkboxProps["aria-label"]}
    />
  );
}

Table.Header = TableHeader;
Table.Column = TableColumn;
Table.Body = TableBody;
Table.LoadMoreItem = TableLoadMoreItem;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.SelectionCheckbox = TableSelectionCheckbox;
Table.SelectAllCheckbox = TableSelectAllCheckbox;

export interface ColumnResizerRenderProps {
  /** Whether the resizer handle is hovered. */
  isHovered: boolean;
  /** Whether the resizer's hidden input is focused. */
  isFocused: boolean;
  /** Whether the column is currently being resized. */
  isResizing: boolean;
  /** The direction(s) the column can be resized: 'both', 'left', 'right'. */
  resizableDirection: "both" | "left" | "right";
}

export interface ColumnResizerProps extends SlotProps {
  /** The column key this resizer belongs to. */
  column: { key: Key };
  /** Accessible label for the resizer. */
  "aria-label"?: string;
  /** Whether resizing is disabled. */
  isDisabled?: boolean;
  /** Called when resize starts. */
  onResizeStart?: (widths: Map<Key, number>) => void;
  /** Called during resize. */
  onResize?: (widths: Map<Key, number>) => void;
  /** Called when resize ends. */
  onResizeEnd?: (widths: Map<Key, number>) => void;
  /** CSS class — can be a string or function of render props. */
  class?: ClassNameOrFunction<ColumnResizerRenderProps>;
  /** Inline style — can be object or function of render props. */
  style?: StyleOrFunction<ColumnResizerRenderProps>;
  /** Children — can be JSX or render function. */
  children?: JSX.Element | RenderChildren<ColumnResizerRenderProps>;
}

export function ColumnResizer(props: ColumnResizerProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "column",
    "aria-label",
    "isDisabled",
    "onResizeStart",
    "onResize",
    "onResizeEnd",
    "class",
    "style",
    "slot",
    "children",
  ]);

  // Register this column with the ResizableTableContainer (auto-collect columns)
  const registerColumn = useContext(ResizableTableRegisterContext);
  if (registerColumn) {
    registerColumn(local.column.key, { key: local.column.key });
  }

  const resizeCtx = useContext(TableColumnResizeStateContext);
  const hasResizeContext = !!resizeCtx;

  // Create a fallback "no-op" resize state for when there's no ResizableTableContainer
  const noopResizeState: TableColumnResizeState = {
    resizingColumn: () => null,
    columnWidths: () => new Map(),
    startResize() {},
    endResize() {},
    updateResizedColumns(_key: Key, _width: number) {
      return new Map();
    },
    getColumnWidth() {
      return 0;
    },
    getColumnMinWidth() {
      return 75;
    },
    getColumnMaxWidth() {
      return Infinity;
    },
  };

  const { isHovered, hoverProps } = createHover({ isDisabled: local.isDisabled ?? false });
  const [isFocused, setIsFocused] = createSignal(false);

  // Create the ARIA resize hook — always create it but use reactive state getter
  const columnResize = createTableColumnResize(
    () => ({
      column: local.column,
      "aria-label": local["aria-label"] ?? "Resizer",
      isDisabled: local.isDisabled,
      onResizeStart: (widths) => {
        resizeCtx?.getCallbacks?.().onResizeStart?.(widths);
        local.onResizeStart?.(widths);
      },
      onResize: (widths) => {
        resizeCtx?.getCallbacks?.().onResize?.(widths);
        local.onResize?.(widths);
      },
      onResizeEnd: (widths) => {
        resizeCtx?.getCallbacks?.().onResizeEnd?.(widths);
        local.onResizeEnd?.(widths);
      },
    }),
    () => resizeCtx?.getState() ?? noopResizeState,
  );

  const renderValues = createMemo<ColumnResizerRenderProps>(() => ({
    isHovered: isHovered(),
    isFocused: isFocused(),
    isResizing: columnResize.isResizing(),
    resizableDirection: "both",
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Table-columnResizer",
    },
    renderValues,
  );

  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <div
      {...domProps}
      {...columnResize.resizerProps}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-hovered={isHovered() || undefined}
      data-resizing={columnResize.isResizing() || undefined}
    >
      <Show when={hasResizeContext}>
        <input
          {...columnResize.inputProps}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </Show>
      {typeof local.children === "function"
        ? (local.children as (props: ColumnResizerRenderProps) => JSX.Element)(renderValues())
        : local.children}
    </div>
  );
}

export interface ResizableTableContainerProps extends SlotProps {
  /** Children (should contain a Table). */
  children?: JSX.Element;
  /** Column resize definitions. If not provided, columns from child ColumnResizers are auto-detected. */
  columns?: Array<{ key: Key; width?: ColumnSize; minWidth?: number; maxWidth?: number }>;
  /** CSS class name. */
  class?: string;
  /** Inline style. */
  style?: JSX.CSSProperties;
  /** Called when column resize starts. */
  onResizeStart?: (widths: Map<Key, number>) => void;
  /** Called during column resize. */
  onResize?: (widths: Map<Key, number>) => void;
  /** Called when column resize ends. */
  onResizeEnd?: (widths: Map<Key, number>) => void;
}

export function ResizableTableContainer(props: ResizableTableContainerProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "children",
    "columns",
    "onResizeStart",
    "onResize",
    "onResizeEnd",
  ]);

  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | null>(null);
  const [tableWidth, setTableWidth] = createSignal(0);

  // Track container width via ResizeObserver
  createEffect(() => {
    const el = containerRef();
    if (!el) return;

    // Initial measurement
    setTableWidth(el.clientWidth);

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setTableWidth(entry.contentRect.width);
        }
      });
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    }
  });

  // Auto-collected columns from ColumnResizer children
  const [autoColumns, setAutoColumns] = createSignal<
    Map<Key, { key: Key; width?: ColumnSize; minWidth?: number; maxWidth?: number }>
  >(new Map());

  const registerColumn = (
    key: Key,
    def: { key: Key; width?: ColumnSize; minWidth?: number; maxWidth?: number },
  ) => {
    setAutoColumns((prev) => {
      const next = new Map(prev);
      next.set(key, def);
      return next;
    });
  };

  // Columns: prefer explicit prop, fall back to auto-collected
  const effectiveColumns = createMemo(() => {
    if (local.columns && local.columns.length > 0) return local.columns;
    return Array.from(autoColumns().values());
  });

  // Use measured width, with a reasonable fallback for environments without layout (e.g. jsdom)
  const effectiveWidth = createMemo(() => {
    const w = tableWidth();
    return w > 0 ? w : 800; // fallback to 800px
  });

  // Create resize state
  const resizeState = createMemo(() => {
    const cols = effectiveColumns();
    if (cols.length === 0) return null;

    return createTableColumnResizeState(() => ({
      tableWidth: effectiveWidth(),
      columns: cols,
    }));
  });

  // Provide a stable context object with a reactive getter
  const contextValue = {
    getState: () => resizeState(),
    getCallbacks: () => ({
      onResizeStart: local.onResizeStart,
      onResize: local.onResize,
      onResizeEnd: local.onResizeEnd,
    }),
  };

  return (
    <ResizableTableRegisterContext.Provider value={registerColumn}>
      <TableColumnResizeStateContext.Provider value={contextValue}>
        <div
          ref={setContainerRef}
          {...domProps}
          class={local.class ?? "solidaria-ResizableTableContainer"}
          style={{ position: "relative", overflow: "auto", ...local.style }}
        >
          {local.children}
        </div>
      </TableColumnResizeStateContext.Provider>
    </ResizableTableRegisterContext.Provider>
  );
}

/** Internal context for ColumnResizer to register itself with ResizableTableContainer */
const ResizableTableRegisterContext = createContext<
  | ((
      key: Key,
      def: { key: Key; width?: ColumnSize; minWidth?: number; maxWidth?: number },
    ) => void)
  | null
>(null);

export function useTableOptions() {
  return useContext(TableContext);
}
