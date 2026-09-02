import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ActionBar as SolidSpectrumActionBar,
  ActionButton as SolidSpectrumActionButton,
  Cell as SolidSpectrumCell,
  Column as SolidSpectrumColumn,
  Content as SolidSpectrumContent,
  Heading as SolidSpectrumHeading,
  IllustratedMessage as SolidSpectrumIllustratedMessage,
  Provider as SolidSpectrumProvider,
  Row as SolidSpectrumRow,
  TableBody as SolidSpectrumTableBody,
  TableHeader as SolidSpectrumTableHeader,
  TableView as SolidSpectrumTableView,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  initialTableViewSelectedKeys,
  normalizeTableViewDemoProps,
  serializeTableViewDemoProps,
  serializeTableViewKeys,
  serializeTableViewSortDescriptor,
  sortTableViewRows,
  tableViewDemoItems,
  tableViewDemoLocaleFromWindow,
  tableViewDemoPropsFromWindow,
  tableViewInitialSortDescriptor,
  tableViewKeysFromValue,
  tableViewVisibleColumns,
  type TableViewDemoProps,
  type TableViewDemoRow,
  type TableViewSortDescriptor,
  comparisonControlsEvent,
} from "@comparison/data/tableview-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  collectionFixtureStyle,
} from "../styled-shared.tsx";

function SolidSpectrumTableViewDemo() {
  const [demoProps, setDemoProps] = createSignal<TableViewDemoProps>(
    tableViewDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialTableViewSelectedKeys(demoProps()),
  );
  const [sortDescriptor, setSortDescriptor] = createSignal<TableViewSortDescriptor | undefined>(
    tableViewInitialSortDescriptor(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const colorScheme = createComparisonResolvedThemeSignal();
  const locale = tableViewDemoLocaleFromWindow();
  const baseRows = createMemo(() => tableViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => baseRows().map((item) => item.id));
  const rows = createMemo(() => sortTableViewRows(baseRows(), sortDescriptor()));
  const visibleColumns = createMemo(() => tableViewVisibleColumns(demoProps()));
  const selectedKeyText = createMemo(() => serializeTableViewKeys(selectedKeys()));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tableview") {
        const nextProps = normalizeTableViewDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setSelectedKeys(initialTableViewSelectedKeys(nextProps));
        setSortDescriptor(tableViewInitialSortDescriptor(nextProps));
        setActionKey("");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          style: { ...collectionFixtureStyle, width: "520px" },
          "data-comparison-control-root": "tableview",
          get "data-comparison-control-props"() {
            return serializeTableViewDemoProps(demoProps());
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-sort-descriptor"() {
            return serializeTableViewSortDescriptor(sortDescriptor());
          },
        },
        [
          hc("button", {}, ["Before"]),
          hc(
            SolidSpectrumTableView,
            {
              "aria-label": "Project documents",
              get items() {
                return rows();
              },
              get columns() {
                return visibleColumns();
              },
              getKey: (row: TableViewDemoRow) => row.id,
              getTextValue: (row: TableViewDemoRow, column: { id?: keyof TableViewDemoRow }) =>
                column.id ? String(row[column.id] ?? "") : "",
              get density() {
                return demoProps().density;
              },
              get overflowMode() {
                return demoProps().overflowMode;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get disabledKeys() {
                return tableViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? tableViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("project-brief") ? ["project-brief"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              get sortDescriptor() {
                return sortDescriptor();
              },
              onSortChange: (descriptor: TableViewSortDescriptor) => setSortDescriptor(descriptor),
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(rows().map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
              onAction: (key: string | number) => setActionKey(String(key)),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? rows().length : keys.size,
                          "data-comparison-tableview-actionbar": "true",
                          onClearSelection: () => setSelectedKeys(new Set<string>()),
                        },
                        [
                          hc(SolidSpectrumActionButton, {}, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      )
                  : undefined;
              },
              UNSAFE_style: { ...collectionTableStyle, height: "260px" },
            },
            renderProp(() => [
              hc(
                SolidSpectrumTableHeader,
                {},
                visibleColumns().map((column) =>
                  hc(
                    SolidSpectrumColumn,
                    {
                      id: column.id,
                      isRowHeader: column.isRowHeader,
                      get align() {
                        return demoProps().showDividers ? column.align : undefined;
                      },
                      get showDivider() {
                        return demoProps().showDividers ? column.showDivider : undefined;
                      },
                      get allowsSorting() {
                        return demoProps().sortColumn !== "none";
                      },
                      get allowsResizing() {
                        return demoProps().allowsResizing;
                      },
                      get width() {
                        if (!demoProps().allowsResizing) {
                          return undefined;
                        }
                        return column.id === "status"
                          ? 112
                          : column.id === "type"
                            ? 128
                            : undefined;
                      },
                      get minWidth() {
                        return demoProps().allowsResizing && column.id === "name" ? 180 : undefined;
                      },
                      get maxWidth() {
                        return demoProps().allowsResizing && column.id === "name" ? 320 : undefined;
                      },
                    },
                    [column.name],
                  ),
                ),
              ),
              hc(
                SolidSpectrumTableBody,
                {
                  renderEmptyState: () =>
                    hc(SolidSpectrumIllustratedMessage, {}, [
                      hc(SolidSpectrumHeading, {}, ["No documents"]),
                      hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                    ]),
                },
                renderProp((row: TableViewDemoRow) =>
                  hc(
                    SolidSpectrumRow,
                    {
                      id: row.id,
                      item: row,
                      textValue: row.name,
                      get isDisabled() {
                        return demoProps().disabledItem === row.id;
                      },
                      get href() {
                        return demoProps().rowLinks && row.id === "project-brief"
                          ? "https://example.com/project-brief"
                          : undefined;
                      },
                      get target() {
                        return demoProps().rowLinks && row.id === "project-brief"
                          ? "_blank"
                          : undefined;
                      },
                    },
                    renderProp(() =>
                      visibleColumns().map((column) =>
                        hc(
                          SolidSpectrumCell,
                          {
                            get align() {
                              return demoProps().showDividers ? column.align : undefined;
                            },
                            get showDivider() {
                              return demoProps().showDividers ? column.showDivider : undefined;
                            },
                          },
                          [row[column.id]],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ]),
          ),
          hc("button", {}, ["After"]),
        ],
      ),
    ],
  );
}

const collectionTableStyle = {
  width: "100%",
};

export default () => h(SolidSpectrumTableViewDemo, {});
