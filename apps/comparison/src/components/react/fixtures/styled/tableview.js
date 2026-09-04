import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionBar as SpectrumActionBar,
  ActionButton as SpectrumActionButton,
  Cell as SpectrumCell,
  Column as SpectrumColumn,
  Content as SpectrumContent,
  Heading as SpectrumHeading,
  IllustratedMessage as SpectrumIllustratedMessage,
  Row as SpectrumRow,
  TableBody as SpectrumTableBody,
  TableHeader as SpectrumTableHeader,
  TableView as SpectrumTableView,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import {
  initialTableViewSelectedKeys,
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
  normalizeTableViewDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/tableview-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  collectionFixtureStyle,
} from "../styled-shared.js";

function ReactTableViewDemo() {
  const [demoProps, setDemoProps] = useState(tableViewDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => initialTableViewSelectedKeys(demoProps));
  const [sortDescriptor, setSortDescriptor] = useState(() =>
    tableViewInitialSortDescriptor(demoProps),
  );
  const [actionKey, setActionKey] = useState("");
  const colorScheme = useComparisonResolvedTheme();
  const locale = tableViewDemoLocaleFromWindow();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tableview") {
        setDemoProps((current) => {
          const nextProps = normalizeTableViewDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialTableViewSelectedKeys(nextProps));
          setSortDescriptor(tableViewInitialSortDescriptor(nextProps));
          setActionKey("");
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const baseRows = tableViewDemoItems(demoProps);
  const itemKeys = baseRows.map((item) => item.id);
  const rows = sortTableViewRows(baseRows, sortDescriptor);
  const visibleColumns = tableViewVisibleColumns(demoProps);
  const disabledKeys = tableViewKeysFromValue(demoProps.disabledKeys, [], "multiple", itemKeys);
  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: tableViewKeysFromValue(
            demoProps.defaultSelectedKeys,
            itemKeys.includes("project-brief") ? ["project-brief"] : [],
            demoProps.selectionMode,
            itemKeys,
          ),
        }
      : { selectedKeys };
  const actionBar = (keys) =>
    jsx(SpectrumActionBar, {
      selectedItemCount: keys === "all" ? rows.length : keys.size,
      "data-comparison-tableview-actionbar": "true",
      onClearSelection: () => setSelectedKeys(new Set()),
      children: jsx(SpectrumActionButton, {
        children: jsx(SpectrumText, { children: "Archive" }),
      }),
    });
  const renderKey = `${serializeTableViewDemoProps(demoProps)}|${serializeTableViewSortDescriptor(
    sortDescriptor,
  )}`;

  return renderReactSpectrumReference(
    jsx("div", {
      style: { ...collectionFixtureStyle, width: 520 },
      "data-comparison-control-root": "tableview",
      "data-comparison-control-props": serializeTableViewDemoProps(demoProps),
      "data-comparison-selected-keys": serializeTableViewKeys(selectedKeys),
      "data-comparison-action-key": actionKey,
      "data-comparison-sort-descriptor": serializeTableViewSortDescriptor(sortDescriptor),
      children: [
        jsx("button", { children: "Before" }, "before"),
        jsxs(
          SpectrumTableView,
          {
            "aria-label": "Project documents",
            density: demoProps.density,
            overflowMode: demoProps.overflowMode,
            isQuiet: demoProps.isQuiet,
            selectionMode: demoProps.selectionMode,
            disabledKeys,
            ...selectionProps,
            sortDescriptor,
            onSortChange: setSortDescriptor,
            onSelectionChange: (keys) =>
              setSelectedKeys(keys === "all" ? new Set(rows.map((row) => row.id)) : new Set(keys)),
            onAction: (key) => setActionKey(String(key)),
            renderActionBar: demoProps.showActionBar ? actionBar : undefined,
            UNSAFE_style: { ...collectionTableStyle, height: 260 },
            children: [
              jsxs(SpectrumTableHeader, {
                children: visibleColumns.map((column) =>
                  jsx(
                    SpectrumColumn,
                    {
                      id: column.id,
                      isRowHeader: column.isRowHeader,
                      align: demoProps.showDividers ? column.align : undefined,
                      showDivider: demoProps.showDividers ? column.showDivider : undefined,
                      allowsSorting: demoProps.sortColumn !== "none",
                      allowsResizing: demoProps.allowsResizing,
                      width:
                        demoProps.allowsResizing && column.id === "status"
                          ? 112
                          : demoProps.allowsResizing && column.id === "type"
                            ? 128
                            : undefined,
                      minWidth: demoProps.allowsResizing && column.id === "name" ? 180 : undefined,
                      maxWidth: demoProps.allowsResizing && column.id === "name" ? 320 : undefined,
                      children: column.name,
                    },
                    column.id,
                  ),
                ),
              }),
              jsx(SpectrumTableBody, {
                items: rows,
                renderEmptyState: () =>
                  jsxs(SpectrumIllustratedMessage, {
                    children: [
                      jsx(SpectrumHeading, { children: "No documents" }),
                      jsx(SpectrumContent, { children: "Create or upload a file to continue." }),
                    ],
                  }),
                children: (row) =>
                  jsxs(
                    SpectrumRow,
                    {
                      id: row.id,
                      textValue: row.name,
                      isDisabled: demoProps.disabledItem === row.id,
                      href:
                        demoProps.rowLinks && row.id === "project-brief"
                          ? "https://example.com/project-brief"
                          : undefined,
                      target:
                        demoProps.rowLinks && row.id === "project-brief" ? "_blank" : undefined,
                      children: visibleColumns.map((column) =>
                        jsx(
                          SpectrumCell,
                          {
                            align: demoProps.showDividers ? column.align : undefined,
                            showDivider: demoProps.showDividers ? column.showDivider : undefined,
                            children: row[column.id],
                          },
                          column.id,
                        ),
                      ),
                    },
                    row.id,
                  ),
              }),
            ],
          },
          renderKey,
        ),
        jsx("button", { children: "After" }, "after"),
      ],
    }),
    colorScheme,
    locale,
  );
}

const collectionTableStyle = {
  width: "100%",
};

export default () => jsx(ReactTableViewDemo, {});
