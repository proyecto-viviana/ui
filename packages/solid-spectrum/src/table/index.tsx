import {
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  mergeProps,
  runWithOwner,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  ColumnResizer as HeadlessColumnResizer,
  ResizableTableContainer as HeadlessResizableTableContainer,
  Table as HeadlessTable,
  TableBody as HeadlessTableBody,
  TableCell as HeadlessTableCell,
  TableColumn as HeadlessTableColumn,
  TableFooter as HeadlessTableFooter,
  TableHeader as HeadlessTableHeader,
  TableRow as HeadlessTableRow,
  TableSelectAllCheckbox as HeadlessTableSelectAllCheckbox,
  TableColumnResizeStateContext as HeadlessTableColumnResizeStateContext,
  TableSelectionCheckbox as HeadlessTableSelectionCheckbox,
  TableStateContext as HeadlessTableStateContext,
  Form as HeadlessForm,
  Popover as HeadlessPopover,
  OverlayTriggerStateContext,
  type ColumnResizerProps as HeadlessColumnResizerProps,
  type ColumnResizerRenderProps,
  type ResizableTableContainerProps as HeadlessResizableTableContainerProps,
  type TableBodyProps as HeadlessTableBodyProps,
  type TableCellProps as HeadlessTableCellProps,
  type TableCellRenderProps,
  type TableColumnProps as HeadlessTableColumnProps,
  type TableColumnRenderProps,
  type TableFooterProps as HeadlessTableFooterProps,
  type TableFooterRenderProps,
  type TableHeaderProps as HeadlessTableHeaderProps,
  type TableProps as HeadlessTableProps,
  type TableRenderProps,
  type TableRowProps as HeadlessTableRowProps,
  type TableRowRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type {
  ColumnDefinition,
  Key,
  LoadingState,
  SortDescriptor,
} from "@proyecto-viviana/solid-stately";
import Arrow from "../icon/ui-icons/Arrow";
import Checkmark from "../icon/ui-icons/Checkmark";
import Dash from "../icon/ui-icons/Dash";
import { useProviderProps } from "../provider";
import type { StyleString } from "../style";
import {
  baseColor,
  colorMix,
  focusRing,
  setColorScheme,
  style,
} from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { createMediaQuery } from "../utils/createMediaQuery";
import { createStringFormatter, getOwnerDocument } from "@proyecto-viviana/solidaria";
import {
  ActionButton,
  ActionButtonContext,
  Button,
  ButtonContext,
  type ActionButtonProps,
  type ActionButtonSize,
} from "../button";
import type { SpectrumContextValue } from "../button/spectrum-context";
import { ButtonGroup } from "../buttongroup";
import { CustomDialog, DialogContainer } from "../dialog";
import Cross from "../icon/ui-icons/Cross";
import { s2IntlStrings } from "../intl";

export type TableSize = "sm" | "md" | "lg";
export type TableVariant = "default" | "striped" | "bordered";
export type TableDensity = "compact" | "regular" | "spacious";
export type TableOverflowMode = "truncate" | "wrap";
export type TableSelectionStyle = "checkbox" | "highlight";
export type TableAlign = "start" | "center" | "end" | "left" | "right";

interface TableContextValue {
  density: TableDensity;
  isQuiet: boolean;
  overflowMode: TableOverflowMode;
  showSelectionCheckboxes: boolean;
  selectionStyle: TableSelectionStyle;
  loadingState?: LoadingState;
  onLoadMore?: () => void | Promise<void>;
}

const TableContext = createContext<TableContextValue>({
  density: "regular",
  isQuiet: false,
  overflowMode: "truncate",
  showSelectionCheckboxes: false,
  selectionStyle: "checkbox",
});

export interface TableProps<T extends object> extends Omit<
  HeadlessTableProps<T>,
  | "class"
  | "style"
  | "children"
  | "selectionBehavior"
  | "onSelectionChange"
  | "showSelectionCheckboxes"
> {
  /** Children components (TableHeader, TableBody). */
  children?: JSX.Element | (() => JSX.Element);
  /** Density of rows and headers. */
  density?: TableDensity;
  /** Whether the TableView should draw without the default container chrome. */
  isQuiet?: boolean;
  /** Whether labels and cell content truncate or wrap. */
  overflowMode?: TableOverflowMode;
  /** Provides an action bar when rows are selected. */
  renderActionBar?: (selectedKeys: "all" | Set<Key>) => JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible inline style alias. Prefer styles or UNSAFE_style. */
  style?: JSX.CSSProperties;
  /** Title for the table. Prefer aria-label/aria-labelledby for new code. */
  title?: JSX.Element;
  /** Description for the table. */
  description?: JSX.Element;
  /** Legacy size alias retained for compatibility. */
  size?: TableSize;
  /** Legacy variant alias retained for compatibility. */
  variant?: TableVariant;
  /** Overrides the default S2 selection checkbox behavior. */
  showSelectionCheckboxes?: boolean;
  /**
   * How selection is displayed: `checkbox` shows selection checkboxes (toggle
   * behavior), `highlight` selects whole rows with no checkboxes (replace
   * behavior).
   * @default 'checkbox'
   */
  selectionStyle?: TableSelectionStyle;
  /** S2 row action alias. */
  onAction?: (key: Key) => void;
  /** S2 asynchronous loading state. */
  loadingState?: LoadingState;
  /** S2 asynchronous load-more callback. */
  onLoadMore?: () => void | Promise<void>;
  /** Called when a column resize starts. */
  onResizeStart?: (widths: Map<Key, number>) => void;
  /** Called during column resize. */
  onResize?: (widths: Map<Key, number>) => void;
  /** Called when a column resize ends. */
  onResizeEnd?: (widths: Map<Key, number>) => void;
  /** Selection behavior forwarded to the headless table. S2 defaults to toggle. */
  selectionBehavior?: HeadlessTableProps<T>["selectionBehavior"];
  /** Selection callback mirrored for the optional action bar. */
  onSelectionChange?: HeadlessTableProps<T>["onSelectionChange"];
}

export interface TableHeaderProps extends Omit<HeadlessTableHeaderProps, "class" | "style"> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
}

export interface TableColumnProps extends Omit<HeadlessTableColumnProps, "class" | "style"> {
  /** Text alignment for the column. */
  align?: TableAlign;
  /** Whether to draw an end divider. */
  showDivider?: boolean;
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

export interface TableBodyProps<T> extends Omit<HeadlessTableBodyProps<T>, "class" | "style"> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
}

export interface TableFooterProps<T> extends Omit<HeadlessTableFooterProps<T>, "class" | "style"> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
}

export interface TableRowProps<T> extends Omit<HeadlessTableRowProps<T>, "class" | "style"> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

export interface TableCellProps extends Omit<HeadlessTableCellProps, "class" | "style"> {
  /** Text alignment for the cell. */
  align?: TableAlign;
  /** Whether to draw an end divider. */
  showDivider?: boolean;
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

const tableWrapper = style(
  {
    minHeight: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    isolation: "isolate",
    position: "relative",
    overflow: "clip",
  },
  getAllowedOverrides({ height: true }),
);

const tableShell = style<{ isQuiet?: boolean }>({
  minHeight: 0,
  minWidth: 0,
  width: "full",
  flexGrow: 1,
  boxSizing: "border-box",
  overflow: "auto",
  backgroundColor: {
    default: "gray-25",
    isQuiet: "transparent",
  },
  borderColor: "gray-300",
  borderWidth: {
    default: 1,
    isQuiet: 0,
  },
  borderStyle: "solid",
  borderRadius: {
    default: "[6px]",
    isQuiet: "none",
  },
  scrollPaddingTop: 32,
});

const table = style<TableRenderProps & { isQuiet?: boolean; hasActionBar?: boolean }>({
  ...focusRing(),
  outlineOffset: -1,
  outlineStyle: "none",
  userSelect: "none",
  minWidth: "full",
  width: "full",
  fontSize: controlFont(),
  fontFamily: "sans",
  fontWeight: "normal",
  borderWidth: 0,
  borderCollapse: "separate",
  borderSpacing: 0,
  tableLayout: "fixed",
  disableTapHighlight: true,
});

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

const tableHeader = style({
  backgroundColor: "gray-75",
});

const headerHeight = {
  compact: 32,
  regular: 32,
  spacious: 40,
} as const;

const rowHeight = {
  compact: 32,
  regular: 40,
  spacious: 48,
} as const;

const tableColumn = style<
  TableColumnRenderProps & {
    align?: "start" | "center" | "end";
    density?: TableDensity;
    showDivider?: boolean;
  }
>({
  outlineStyle: "none",
  position: "relative",
  height: {
    density: headerHeight,
  },
  minHeight: {
    density: headerHeight,
  },
  paddingX: 16,
  paddingY: 0,
  color: baseColor("neutral"),
  fontSize: controlFont(),
  fontFamily: "sans",
  fontWeight: "bold",
  textAlign: {
    align: {
      start: "start",
      center: "center",
      end: "end",
    },
  },
  verticalAlign: "middle",
  backgroundColor: "gray-75",
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  borderEndWidth: {
    showDivider: 1,
  },
  cursor: {
    isSortable: "pointer",
  },
  whiteSpace: "nowrap",
});

const tableColumnContent = style<{
  align?: "start" | "center" | "end";
  overflowMode?: TableOverflowMode;
}>({
  display: "flex",
  alignItems: "center",
  gap: "text-to-visual",
  justifyContent: {
    align: {
      start: "start",
      center: "center",
      end: "end",
    },
  },
  minWidth: 0,
  width: "full",
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

const tableSortIcon = style({
  flexShrink: 0,
  size: 10,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const rowHoverBackground = colorMix("gray-25", "gray-900", 5);
const rowPressedBackground = colorMix("gray-25", "gray-900", 8);
const rowSelectedBackground = colorMix("gray-25", "gray-900", 7);

const rowHighlightBackground = colorMix("gray-25", "blue-900", 10);
const rowHighlightActiveBackground = colorMix("gray-25", "blue-900", 15);

const tableRow = style<
  TableRowRenderProps & { density?: TableDensity; selectionStyle?: TableSelectionStyle }
>({
  outlineStyle: "none",
  position: "relative",
  minHeight: {
    density: rowHeight,
  },
  backgroundColor: {
    default: "transparent",
    isHovered: rowHoverBackground,
    isPressed: rowPressedBackground,
    isSelected: {
      default: rowSelectedBackground,
      selectionStyle: {
        highlight: {
          default: rowHighlightBackground,
          isHovered: rowHighlightActiveBackground,
          isPressed: rowHighlightActiveBackground,
        },
      },
    },
    forcedColors: {
      selectionStyle: {
        highlight: {
          isSelected: "Highlight",
        },
      },
    },
  },
  cursor: {
    isDisabled: "default",
  },
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: {
      selectionStyle: {
        highlight: {
          isSelected: "HighlightText",
        },
      },
    },
  },
});

const tableCell = style<
  TableCellRenderProps & {
    align?: "start" | "center" | "end";
    density?: TableDensity;
    overflowMode?: TableOverflowMode;
    showDivider?: boolean;
  }
>({
  ...focusRing(),
  outlineOffset: -2,
  outlineStyle: "none",
  position: "relative",
  color: "inherit",
  paddingX: 16,
  paddingY: 0,
  minHeight: {
    density: rowHeight,
  },
  height: {
    density: rowHeight,
  },
  textAlign: {
    align: {
      start: "start",
      center: "center",
      end: "end",
    },
  },
  verticalAlign: "middle",
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  borderEndWidth: {
    showDivider: 1,
  },
});

const tableCellContent = style<{
  align?: "start" | "center" | "end";
  overflowMode?: TableOverflowMode;
}>({
  minWidth: 0,
  overflow: {
    overflowMode: {
      truncate: "hidden",
      wrap: "visible",
    },
  },
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

// An editable cell renders like a regular cell but dims its content while a
// submitted edit is saving. The inline edit trigger, the editing popover/dialog,
// and the save/cancel affordances are styled below, mirroring the S2 source.
const editableCell = style<
  TableCellRenderProps & {
    align?: "start" | "center" | "end";
    density?: TableDensity;
    overflowMode?: TableOverflowMode;
    showDivider?: boolean;
    isSaving?: boolean;
  }
>({
  ...focusRing(),
  outlineOffset: -2,
  outlineStyle: "none",
  position: "relative",
  color: {
    default: "inherit",
    isSaving: baseColor("neutral-subdued"),
  },
  paddingX: 16,
  paddingY: 0,
  minHeight: {
    density: rowHeight,
  },
  height: {
    density: rowHeight,
  },
  textAlign: {
    align: {
      start: "start",
      center: "center",
      end: "end",
    },
  },
  verticalAlign: "middle",
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  borderEndWidth: {
    showDivider: 1,
  },
});

const editPopover = style(
  {
    ...setColorScheme(),
    "--s2-container-bg": {
      type: "backgroundColor",
      value: "layer-2",
    },
    backgroundColor: "--s2-container-bg",
    borderBottomRadius: "default",
    boxShadow: "elevated",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: {
      default: "gray-200",
      forcedColors: "ButtonBorder",
    },
    boxSizing: "content-box",
    isolation: "isolate",
    pointerEvents: {
      isExiting: "none",
    },
    outlineStyle: "none",
    minWidth: "--trigger-width",
    padding: 8,
    display: "flex",
    alignItems: "center",
  },
  getAllowedOverrides(),
);

const editForm = style({
  width: "full",
  display: "flex",
  alignItems: "start",
  gap: 16,
});

const editActions = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "baseline",
  flexShrink: 0,
  flexGrow: 0,
});

const editFormMobile = style({
  width: "full",
  display: "flex",
  flexDirection: "column",
  alignItems: "start",
  gap: 16,
});

const editButtonGroupStyles = style({
  alignSelf: "end",
});

// The inline edit trigger is hidden until the row is hovered or focused, the
// editor is open, or the device lacks a fine pointer (touch). Mirrors S2.
const editButtonStyles = style<{ isForcedVisible?: boolean }>({
  visibility: {
    default: "hidden",
    isForcedVisible: "visible",
    ':is([role="row"]:hover *)': "visible",
    ':is([role="row"][data-focus-visible-within] *)': "visible",
    "@media not ((hover: hover) and (pointer: fine))": "visible",
  },
});

// Input types whose text cannot be range-selected on open. Mirrors S2.
const nonTextInputTypes = new Set([
  "checkbox",
  "radio",
  "range",
  "color",
  "file",
  "image",
  "button",
  "submit",
  "reset",
]);

const emptyState = style({
  minHeight: 112,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "neutral",
  font: "body-sm",
});

const selectionColumn = style({
  width: 40,
  minWidth: 40,
  paddingX: 0,
  textAlign: "center",
});

const selectionCell = style<TableCellRenderProps & { density?: TableDensity }>({
  width: 40,
  minWidth: 40,
  paddingX: 0,
  paddingY: 0,
  height: {
    density: rowHeight,
  },
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  textAlign: "center",
  verticalAlign: "middle",
});

const selectionCheckbox = style({
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 16,
  height: 16,
});

const selectionCheckboxInput = style({
  position: "absolute",
  inset: 0,
  margin: 0,
  opacity: 0,
  cursor: "inherit",
});

const selectionCheckboxBox = style<{ isSelected?: boolean; isDisabled?: boolean }>({
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

const selectionCheckboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
});

const tableFooter = style({
  backgroundColor: "gray-75",
  borderWidth: 0,
  borderTopWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

const actionBarContainer = style({
  position: "absolute",
  insetInline: 0,
  bottom: 12,
  display: "flex",
  justifyContent: "center",
  pointerEvents: "none",
  zIndex: 2,
});

const actionBarContent = style({
  pointerEvents: "auto",
});

const resizer = style<ColumnResizerRenderProps>({
  position: "absolute",
  top: 0,
  bottom: 0,
  insetEnd: 0,
  width: 6,
  cursor: "col-resize",
  touchAction: "none",
  userSelect: "none",
  backgroundColor: {
    default: "transparent",
    isHovered: "accent-400",
    isResizing: "accent-900",
  },
});

const resizableTableContainer = style({
  position: "relative",
  width: "full",
});

function selectedKeySet(keys: "all" | Iterable<Key> | undefined): "all" | Set<Key> {
  if (keys === "all") {
    return "all";
  }

  return new Set(keys ?? []);
}

function hasSelection(keys: "all" | Set<Key>): boolean {
  return keys === "all" || keys.size > 0;
}

function densityFromProps(size: TableSize | undefined, density: TableDensity | undefined) {
  if (density) {
    return density;
  }

  switch (size) {
    case "sm":
      return "compact";
    case "lg":
      return "spacious";
    default:
      return "regular";
  }
}

function normalizeAlign(align: TableAlign | undefined): "start" | "center" | "end" {
  if (align === "right") {
    return "end";
  }

  if (align === "left") {
    return "start";
  }

  return align ?? "start";
}

function keyFromRowProps<T extends object>(props: HeadlessTableRowProps<T>): Key | undefined {
  return props.id ?? (props.item as { id?: Key; key?: Key } | undefined)?.id;
}

function inlineStyle(
  styleProp: JSX.CSSProperties | undefined,
  unsafeStyle: JSX.CSSProperties | undefined,
): JSX.CSSProperties | undefined {
  if (!styleProp && !unsafeStyle) {
    return undefined;
  }

  return {
    ...styleProp,
    ...unsafeStyle,
  };
}

export function Table<T extends object>(props: TableProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const mergedProps = mergeProps(providerProps, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "children",
    "density",
    "isQuiet",
    "overflowMode",
    "renderActionBar",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "title",
    "description",
    "size",
    "variant",
    "showSelectionCheckboxes",
    "selectionStyle",
    "selectionBehavior",
    "onSelectionChange",
    "onAction",
    "onRowAction",
    "loadingState",
    "onLoadMore",
    "onResizeStart",
    "onResize",
    "onResizeEnd",
  ]);
  const externalResizeContext = useContext(HeadlessTableColumnResizeStateContext);
  const density = () => densityFromProps(local.size, local.density);
  const isQuiet = () => !!local.isQuiet;
  const overflowMode = () => local.overflowMode ?? "truncate";
  const selectionStyle = (): TableSelectionStyle => local.selectionStyle ?? "checkbox";
  const selectionBehavior = (): "toggle" | "replace" =>
    local.selectionBehavior ?? (selectionStyle() === "highlight" ? "replace" : "toggle");
  // Mirror upstream S2's gate: checkboxes only appear with toggle behavior in
  // checkbox style. Highlight selection (replace behavior) hides them entirely.
  const showSelectionCheckboxes = () =>
    (local.showSelectionCheckboxes ?? headlessProps.selectionMode !== "none") &&
    selectionStyle() === "checkbox" &&
    selectionBehavior() === "toggle";
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
    local.onSelectionChange?.(keys);
  };
  const className = (renderProps: TableRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        table({
          ...renderProps,
          isQuiet: isQuiet(),
        }),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const context = createMemo<TableContextValue>(() => ({
    density: density(),
    isQuiet: isQuiet(),
    overflowMode: overflowMode(),
    showSelectionCheckboxes: showSelectionCheckboxes(),
    selectionStyle: selectionStyle(),
    loadingState: local.loadingState,
    onLoadMore: local.onLoadMore,
  }));
  const renderTable = () => (
    <HeadlessTable
      {...headlessProps}
      selectionBehavior={selectionBehavior()}
      shouldSelectOnPressUp={headlessProps.shouldSelectOnPressUp ?? true}
      showSelectionCheckboxes={showSelectionCheckboxes()}
      onRowAction={local.onAction ?? local.onRowAction}
      onSelectionChange={onSelectionChange}
      class={className}
      data-table-view=""
      data-density={density()}
      data-quiet={isQuiet() || undefined}
      data-overflow-mode={overflowMode()}
      data-selection-style={selectionStyle()}
    >
      {local.children}
    </HeadlessTable>
  );
  const renderResizableTable = () =>
    externalResizeContext ? (
      renderTable()
    ) : (
      <HeadlessResizableTableContainer
        class={resizableTableContainer}
        onResizeStart={local.onResizeStart}
        onResize={local.onResize}
        onResizeEnd={local.onResizeEnd}
      >
        {renderTable()}
      </HeadlessResizableTableContainer>
    );

  const renderFramed = () => (
    <div
      class={tableWrapper(null, local.styles)}
      style={inlineStyle(local.style, local.UNSAFE_style)}
    >
      {local.title ? <div class={legacyLabel({})}>{local.title}</div> : null}
      <div class={tableShell({ isQuiet: isQuiet() })} data-table-view-shell="">
        {renderResizableTable()}
      </div>
      {local.description ? <div class={legacyDescription({})}>{local.description}</div> : null}
      {local.renderActionBar && hasSelection(actionSelectedKeys()) ? (
        <div class={actionBarContainer}>
          <div class={actionBarContent}>{local.renderActionBar(actionSelectedKeys())}</div>
        </div>
      ) : null}
    </div>
  );

  return <TableContext.Provider value={context()}>{renderFramed()}</TableContext.Provider>;
}

export function TableHeader(props: TableHeaderProps): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, ["class", "styles", "UNSAFE_className"]);
  const className = () =>
    [local.UNSAFE_className, local.class, mergeStyles(tableHeader, local.styles)]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTableHeader {...headlessProps} class={className()}>
      {context.showSelectionCheckboxes ? <TableSelectAllCheckbox /> : null}
      {props.children}
    </HeadlessTableHeader>
  );
}

export function TableColumn(props: TableColumnProps): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "align",
    "showDivider",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
  ]);
  const align = () => normalizeAlign(local.align);
  const className = (renderProps: TableColumnRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tableColumn({
          ...renderProps,
          align: align(),
          density: context.density,
          showDivider: !!local.showDivider,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTableColumn {...headlessProps} class={className} style={local.UNSAFE_style}>
      {(renderProps: TableColumnRenderProps) => (
        <span class={tableColumnContent({ align: align(), overflowMode: context.overflowMode })}>
          {renderProps.isSortable && renderProps.sortDirection ? (
            <SortIcon direction={renderProps.sortDirection} />
          ) : null}
          <span>
            {typeof local.children === "function" ? local.children(renderProps) : local.children}
          </span>
          {renderProps.allowsResizing && props.id != null ? (
            <ColumnResizer column={{ key: props.id }} />
          ) : null}
        </span>
      )}
    </HeadlessTableColumn>
  );
}

export function TableBody<T extends object>(props: TableBodyProps<T>): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, [
    "class",
    "styles",
    "UNSAFE_className",
    "renderEmptyState",
    "hasMore",
    "isLoading",
    "onLoadMore",
  ]);
  const className = () =>
    [local.UNSAFE_className, local.class, mergeStyles(local.styles)].filter(Boolean).join(" ");
  const renderEmptyState = () => (
    <div class={emptyState}>{local.renderEmptyState?.() ?? "No data available"}</div>
  );
  const rootIsLoading = () => {
    const loadingState = context.loadingState;
    return (
      loadingState === "loading" ||
      loadingState === "loadingMore" ||
      loadingState === "sorting" ||
      loadingState === "filtering"
    );
  };

  return (
    <HeadlessTableBody
      {...headlessProps}
      hasMore={local.hasMore ?? !!context.onLoadMore}
      isLoading={local.isLoading ?? rootIsLoading()}
      onLoadMore={local.onLoadMore ?? context.onLoadMore}
      class={className()}
      renderEmptyState={renderEmptyState}
    >
      {props.children}
    </HeadlessTableBody>
  );
}

export function TableFooter<T extends object>(props: TableFooterProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "styles", "UNSAFE_className"]);
  const className = (_renderProps: TableFooterRenderProps): string =>
    [local.UNSAFE_className, local.class, mergeStyles(tableFooter, local.styles)]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTableFooter {...headlessProps} class={className}>
      {props.children}
    </HeadlessTableFooter>
  );
}

export function TableRow<T extends object>(props: TableRowProps<T>): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
  ]);
  const rowKey = () => keyFromRowProps(headlessProps);
  const className = (renderProps: TableRowRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tableRow({
          ...renderProps,
          density: context.density,
          selectionStyle: context.selectionStyle,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTableRow {...headlessProps} class={className} style={local.UNSAFE_style}>
      {(renderProps: TableRowRenderProps) => (
        <>
          {context.showSelectionCheckboxes && rowKey() != null ? (
            <TableSelectionCheckbox
              rowKey={rowKey()!}
              isSelected={renderProps.isSelected}
              isDisabled={renderProps.isDisabled}
            />
          ) : null}
          {typeof local.children === "function"
            ? (local.children as (renderProps: TableRowRenderProps) => JSX.Element)(renderProps)
            : local.children}
        </>
      )}
    </HeadlessTableRow>
  );
}

export function TableCell(props: TableCellProps): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "align",
    "showDivider",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
  ]);
  const align = () => normalizeAlign(local.align);
  const className = (renderProps: TableCellRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        tableCell({
          ...renderProps,
          align: align(),
          density: context.density,
          overflowMode: context.overflowMode,
          showDivider: !!local.showDivider,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTableCell {...headlessProps} class={className} style={local.UNSAFE_style}>
      {(renderProps: TableCellRenderProps) => (
        <div class={tableCellContent({ align: align(), overflowMode: context.overflowMode })}>
          {typeof local.children === "function" ? local.children(renderProps) : local.children}
        </div>
      )}
    </HeadlessTableCell>
  );
}

export interface EditableCellProps extends EditableCellOwnProps, TableCellProps {}

interface EditableCellOwnProps {
  /** Renders the editing form fields shown in the popover (desktop) or dialog (mobile). */
  renderEditing: () => JSX.Element;
  /** Whether a submitted edit is currently saving. Dims the cell and shows a pending trigger. */
  isSaving?: boolean;
  /** Handler called when the editing form is submitted. The native submit is already prevented. */
  onSubmit?: (event: SubmitEvent) => void;
  /** Handler called when editing is cancelled (Cancel button, Escape, or interact-outside without save). */
  onCancel?: () => void;
  /** A native form `action` for the editing form. */
  action?: string;
}

/**
 * An EditableCell is a table cell whose contents can be edited inline. Pressing
 * the cell's `<ActionButton slot="edit">` opens an editing surface — a popover on
 * desktop, a full dialog on touch devices — containing the fields returned by
 * `renderEditing`. Mirrors the React Spectrum S2 `EditableCell`.
 */
export function EditableCell(props: EditableCellProps): JSX.Element {
  const context = useContext(TableContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "align",
    "showDivider",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "renderEditing",
    "isSaving",
    "onSubmit",
    "onCancel",
    "action",
    "ref",
  ]);
  let cellEl: HTMLTableCellElement | null = null;
  const align = (): "start" | "center" | "end" => normalizeAlign(local.align);
  const className = (renderProps: TableCellRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        editableCell({
          ...renderProps,
          align: align(),
          density: context.density,
          overflowMode: context.overflowMode,
          showDivider: !!local.showDivider,
          isSaving: !!local.isSaving,
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const setCell = (el: HTMLTableCellElement): void => {
    cellEl = el;
    const ref = local.ref;
    if (typeof ref === "function") {
      ref(el);
    } else if (ref) {
      ref.current = el;
    }
  };

  // The headless cell re-invokes its children callback whenever its own render props change
  // (hover/press/focus). Recreating the stateful inner there would tear the edit button down
  // mid-press and reset the open state, so anchor a single inner instance to EditableCell's
  // owner and return it across every rerun. Cell render props are captured once and handed to
  // the (static, per upstream) children — they are not re-read reactively.
  const owner = getOwner();
  let inner: JSX.Element | undefined;
  let latestRenderProps: TableCellRenderProps | undefined;

  const renderInner = (renderProps: TableCellRenderProps): JSX.Element => {
    latestRenderProps = renderProps;
    inner ??= runWithOwner(owner, () => (
      <EditableCellInner
        align={align}
        overflowMode={() => context.overflowMode}
        density={() => context.density}
        getCell={() => cellEl}
        renderEditing={local.renderEditing}
        isSaving={() => local.isSaving}
        onSubmit={local.onSubmit}
        onCancel={local.onCancel}
        action={local.action}
        ariaLabel={(props as { "aria-label"?: string })["aria-label"]}
        renderChildren={() => {
          if (typeof local.children !== "function") {
            return local.children;
          }
          // `latestRenderProps` is a plain capture, not a signal, so reading it does not make
          // the children reactive to the cell's hover/press churn.
          return latestRenderProps ? local.children(latestRenderProps) : null;
        }}
      />
    )) as JSX.Element;
    return inner;
  };

  return (
    <HeadlessTableCell
      {...headlessProps}
      ref={setCell}
      class={className}
      style={local.UNSAFE_style}
    >
      {(renderProps: TableCellRenderProps) => renderInner(renderProps)}
    </HeadlessTableCell>
  );
}

interface EditableCellInnerProps {
  align: () => "start" | "center" | "end";
  overflowMode: () => TableOverflowMode;
  density: () => TableDensity;
  getCell: () => HTMLTableCellElement | null;
  renderEditing: () => JSX.Element;
  isSaving: () => boolean | undefined;
  onSubmit?: (event: SubmitEvent) => void;
  onCancel?: () => void;
  action?: string;
  ariaLabel?: string;
  /**
   * Invoked inside the edit-slot provider so the `slot="edit"` ActionButton
   * resolves its `onPress` from `editSlots`. In Solid, `useContext` binds to the
   * owner active when the component executes, so the children must be created
   * here rather than pre-evaluated in `EditableCell`'s scope.
   */
  renderChildren: () => JSX.Element;
}

function EditableCellInner(props: EditableCellInnerProps): JSX.Element {
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const [isOpen, setIsOpen] = createSignal(false);
  const [formEl, setFormEl] = createSignal<HTMLFormElement | null>(null);
  const [triggerWidth, setTriggerWidth] = createSignal(0);
  const [tableWidth, setTableWidth] = createSignal(0);
  const [verticalOffset, setVerticalOffset] = createSignal(0);

  // Touch devices (no fine pointer / hover) get a full dialog instead of a popover.
  const hasFinePointer = createMediaQuery("(hover: hover) and (pointer: fine)");
  const isMobile = (): boolean => !hasFinePointer();

  const size = (): ActionButtonSize => {
    const density = props.density();
    if (density === "compact") {
      return "S";
    }
    if (density === "spacious") {
      return "L";
    }
    return "M";
  };

  // Position the popover relative to the cell: measure the trigger and table
  // widths, and offset upward by the row height so it overlays the cell. Mirrors
  // the S2 useLayoutEffect.
  createEffect(() => {
    if (!isOpen()) {
      return;
    }
    const cell = props.getCell();
    const boundingRect = cell?.parentElement?.getBoundingClientRect();
    setTriggerWidth(cell?.clientWidth ?? 0);
    setVerticalOffset((boundingRect?.top ?? 0) - (boundingRect?.bottom ?? 0));
    const grid = cell?.closest('[role="grid"],[role="treegrid"]');
    setTableWidth((grid as HTMLElement | null)?.clientWidth ?? 0);
  });

  // Auto-select the entire text range of the autofocused input when the editor
  // opens. Re-runs once the form element mounts. Mirrors the S2 useEffect.
  createEffect(() => {
    const form = formEl();
    if (!isOpen() || !form) {
      return;
    }
    queueMicrotask(() => {
      if (!isOpen()) {
        return;
      }
      const active = getOwnerDocument(form)?.activeElement;
      if (
        active &&
        form.contains(active) &&
        ((active instanceof HTMLInputElement && !nonTextInputTypes.has(active.type)) ||
          active instanceof HTMLTextAreaElement) &&
        typeof active.select === "function"
      ) {
        active.select();
      }
    });
  });

  const cancel = (): void => {
    setIsOpen(false);
    props.onCancel?.();
  };

  // Our headless Form doesn't prevent the native submit (unlike RAC's Form), so
  // stop the page reload here, then notify the consumer and close. Mirrors S2.
  const handleSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    props.onSubmit?.(event);
    setIsOpen(false);
  };

  // The mobile dialog disables keyboard dismissal, so translate Escape into a
  // cancel ourselves. Mirrors the S2 dialog-level Escape handler.
  const onFormKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      cancel();
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const attachForm = (el: HTMLFormElement): void => {
    setFormEl(el);
    el.addEventListener("submit", handleSubmit);
    if (isMobile()) {
      el.addEventListener("keydown", onFormKeyDown);
    }
  };

  // Interact-outside never closes the popover directly; instead, if focus is
  // still within the form, submit (saving), which then closes. Mirrors S2.
  const shouldCloseOnInteractOutside = (): boolean => {
    const form = formEl();
    if (!form) {
      return false;
    }
    const active = getOwnerDocument(form)?.activeElement;
    if (!active || !form.contains(active)) {
      return false;
    }
    form.requestSubmit();
    return false;
  };

  const editSlots: SpectrumContextValue<ActionButtonProps> = {
    slots: {
      default: {},
      edit: {
        onPress: () => setIsOpen(true),
        excludeFromTabOrder: true,
        get isPending() {
          return props.isSaving();
        },
        get isQuiet() {
          return !props.isSaving();
        },
        get size() {
          return size();
        },
        get styles() {
          return editButtonStyles({ isForcedVisible: isOpen() || !!props.isSaving() });
        },
      },
    },
  };

  return (
    <ButtonContext.Provider value={null}>
      <ActionButtonContext.Provider value={editSlots}>
        <div class={tableCellContent({ align: props.align(), overflowMode: props.overflowMode() })}>
          {props.renderChildren()}
        </div>

        <ActionButtonContext.Provider value={null}>
          <Show when={!isMobile()}>
            <HeadlessPopover
              isOpen={isOpen()}
              onOpenChange={setIsOpen}
              aria-label={props.ariaLabel ?? stringFormatter().format("table.editCell")}
              triggerRef={() => props.getCell()}
              placement="bottom start"
              offset={verticalOffset()}
              shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
              class={(renderProps) => editPopover({ isExiting: renderProps.isExiting })}
              style={() => ({
                minWidth: `min(${triggerWidth()}px, ${tableWidth()}px)`,
                maxWidth: `${tableWidth()}px`,
              })}
            >
              <OverlayTriggerStateContext.Provider value={null}>
                <HeadlessForm
                  ref={attachForm}
                  action={props.action}
                  class={editForm}
                  style={() => ({ "--input-width": `calc(${triggerWidth()}px - 32px)` })}
                >
                  {props.renderEditing()}
                  <div class={editActions}>
                    <ActionButton
                      isQuiet
                      onPress={cancel}
                      aria-label={stringFormatter().format("table.cancel")}
                    >
                      <Cross />
                    </ActionButton>
                    <ActionButton
                      isQuiet
                      type="submit"
                      aria-label={stringFormatter().format("table.save")}
                    >
                      <Checkmark />
                    </ActionButton>
                  </div>
                </HeadlessForm>
              </OverlayTriggerStateContext.Provider>
            </HeadlessPopover>
          </Show>

          <Show when={isMobile()}>
            <DialogContainer onDismiss={() => formEl()?.requestSubmit()}>
              <Show when={isOpen()}>
                <CustomDialog
                  isDismissible
                  isKeyboardDismissDisabled
                  aria-label={props.ariaLabel ?? stringFormatter().format("table.editCell")}
                >
                  <HeadlessForm ref={attachForm} action={props.action} class={editFormMobile}>
                    {props.renderEditing()}
                    <ButtonGroup align="end" styles={editButtonGroupStyles}>
                      <Button onPress={cancel} variant="secondary" fillStyle="outline">
                        Cancel
                      </Button>
                      <Button type="submit" variant="accent">
                        Save
                      </Button>
                    </ButtonGroup>
                  </HeadlessForm>
                </CustomDialog>
              </Show>
            </DialogContainer>
          </Show>
        </ActionButtonContext.Provider>
      </ActionButtonContext.Provider>
    </ButtonContext.Provider>
  );
}

export function TableSelectionCheckbox(props: {
  rowKey: Key;
  isSelected?: boolean;
  isDisabled?: boolean;
}): JSX.Element {
  const context = useContext(TableContext);

  return (
    <HeadlessTableCell
      id="__selection__"
      class={(renderProps: TableCellRenderProps) =>
        selectionCell({ ...renderProps, density: context.density })
      }
    >
      <span class={selectionCheckbox} data-rsp-slot="selection-indicator">
        <HeadlessTableSelectionCheckbox rowKey={props.rowKey} class={selectionCheckboxInput} />
        <span
          class={selectionCheckboxBox({
            isSelected: !!props.isSelected,
            isDisabled: !!props.isDisabled,
          })}
          aria-hidden="true"
        >
          {props.isSelected ? (
            <Checkmark size="XS" class={selectionCheckboxIcon} aria-hidden="true" />
          ) : null}
        </span>
      </span>
    </HeadlessTableCell>
  );
}

export function TableSelectAllCheckbox(): JSX.Element {
  const context = useContext(TableContext);
  const state = useContext(HeadlessTableStateContext);
  const isSelected = () => state?.selectedKeys === "all";
  const isIndeterminate = () => {
    const keys = state?.selectedKeys;
    if (!state || keys === "all" || keys == null || keys.size === 0) {
      return false;
    }

    return keys.size < state.collection.size;
  };
  const isDisabled = () =>
    !state || state.selectionMode !== "multiple" || state.collection.size === 0;
  const className = (renderProps: TableColumnRenderProps): string =>
    mergeStyles(
      tableColumn({
        ...renderProps,
        align: "center",
        density: context.density,
      }),
      selectionColumn,
    );

  return (
    <HeadlessTableColumn id="__selection__" class={className}>
      <span class={selectionCheckbox} data-rsp-slot="select-all-indicator">
        <HeadlessTableSelectAllCheckbox class={selectionCheckboxInput} />
        <span
          class={selectionCheckboxBox({
            isSelected: isSelected() || isIndeterminate(),
            isDisabled: isDisabled(),
          })}
          aria-hidden="true"
        >
          {isSelected() ? (
            <Checkmark size="XS" class={selectionCheckboxIcon} aria-hidden="true" />
          ) : isIndeterminate() ? (
            <Dash size="XS" class={selectionCheckboxIcon} aria-hidden="true" />
          ) : null}
        </span>
      </span>
    </HeadlessTableColumn>
  );
}

export interface ColumnResizerProps extends Omit<HeadlessColumnResizerProps, "class" | "style"> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
}

export function ColumnResizer(props: ColumnResizerProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "styles", "UNSAFE_className"]);
  const className = (renderProps: ColumnResizerRenderProps): string =>
    [local.UNSAFE_className, local.class, mergeStyles(resizer(renderProps), local.styles)]
      .filter(Boolean)
      .join(" ");

  return <HeadlessColumnResizer {...headlessProps} class={className} />;
}

export interface ResizableTableContainerProps extends Omit<
  HeadlessResizableTableContainerProps,
  "class" | "style"
> {
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

export function ResizableTableContainer(props: ResizableTableContainerProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
  ]);
  const className = () =>
    [local.UNSAFE_className, local.class, mergeStyles(resizableTableContainer, local.styles)]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessResizableTableContainer
      {...headlessProps}
      class={className()}
      style={local.UNSAFE_style}
    />
  );
}

function SortIcon(props: { direction: "ascending" | "descending" }): JSX.Element {
  return (
    <Arrow
      size="M"
      class={tableSortIcon}
      aria-hidden="true"
      style={{
        transform: props.direction === "ascending" ? "rotate(-90deg)" : "rotate(90deg)",
      }}
    />
  );
}

Table.Header = TableHeader;
Table.Column = TableColumn;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.EditableCell = EditableCell;
Table.SelectionCheckbox = TableSelectionCheckbox;
Table.SelectAllCheckbox = TableSelectAllCheckbox;
Table.ColumnResizer = ColumnResizer;

export const TableView = Table;
export const Column = TableColumn;
export const Footer = TableFooter;
export const Row = TableRow;
export const Cell = TableCell;

export type { ColumnDefinition, Key, SortDescriptor };
