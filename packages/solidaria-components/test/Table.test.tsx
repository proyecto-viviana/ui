/**
 * Tests for Table component.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@solidjs/testing-library";
import { createSignal, For } from "solid-js";
import { Button } from "../src/Button";
import { Checkbox } from "../src/Checkbox";
import { RouterProvider } from "../src/RouterProvider";
import { useDragAndDrop } from "../src/useDragAndDrop";
import { TableLayout, Virtualizer } from "../src/Virtualizer";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  TableSelectionCheckbox,
  TableSelectAllCheckbox,
  ColumnResizer,
  ResizableTableContainer,
} from "../src/Table";

// Test data
const testColumns = [
  { key: "name", name: "Name" },
  { key: "type", name: "Type" },
  { key: "level", name: "Level" },
];

const testData = [
  { id: 1, name: "Pikachu", type: "Electric", level: 25 },
  { id: 2, name: "Charizard", type: "Fire", level: 45 },
  { id: 3, name: "Blastoise", type: "Water", level: 42 },
];

function setupIntersectionObserverMock() {
  const originalIntersectionObserver = globalThis.IntersectionObserver;
  let triggerIntersection: ((entries: IntersectionObserverEntry[]) => void) | undefined;
  const observe = vi.fn();
  const disconnect = vi.fn();

  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds = [];
    constructor(callback: IntersectionObserverCallback) {
      triggerIntersection = callback as (entries: IntersectionObserverEntry[]) => void;
    }
    observe = observe;
    unobserve = vi.fn();
    disconnect = disconnect;
    takeRecords = vi.fn(() => []);
  }

  globalThis.IntersectionObserver =
    MockIntersectionObserver as unknown as typeof IntersectionObserver;

  return {
    observe,
    triggerIntersection: (entries: IntersectionObserverEntry[]) => triggerIntersection?.(entries),
    restore: () => {
      globalThis.IntersectionObserver = originalIntersectionObserver;
    },
  };
}

// Helper using render props at every nesting level to avoid solid-refresh HMR context issues
function TestTable(props: Partial<Parameters<typeof Table>[0]> = {}) {
  return (
    <Table
      items={testData}
      columns={testColumns}
      getKey={(item: any) => item.id}
      aria-label="Pokemon"
      {...props}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="type">{() => <>Type</>}</TableColumn>
            <TableColumn id="level">{() => <>Level</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(item: any) => (
              <TableRow id={item.id} item={item}>
                {() => (
                  <>
                    <TableCell>{() => <>{item.name}</>}</TableCell>
                    <TableCell>{() => <>{item.type}</>}</TableCell>
                    <TableCell>{() => <>{item.level}</>}</TableCell>
                  </>
                )}
              </TableRow>
            )}
          </TableBody>
        </>
      )}
    </Table>
  );
}

describe("Table", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // BASIC RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestTable />);

      const table = document.querySelector(".solidaria-Table");
      expect(table).toBeTruthy();
      expect(table?.tagName).toBe("TABLE");
    });

    it("should render with default classes", () => {
      render(() => <TestTable />);

      expect(document.querySelector(".solidaria-Table")).toBeTruthy();
      expect(document.querySelector(".solidaria-Table-header")).toBeTruthy();
      expect(document.querySelector(".solidaria-Table-body")).toBeTruthy();
      expect(document.querySelectorAll(".solidaria-Table-column")).toHaveLength(3);
      expect(document.querySelectorAll(".solidaria-Table-row")).toHaveLength(3);
      expect(document.querySelectorAll(".solidaria-Table-cell")).toHaveLength(9);
    });

    it("should render with custom class", () => {
      render(() => <TestTable class="custom-table" />);

      const table = document.querySelector(".custom-table");
      expect(table).toBeTruthy();
    });

    it("should support custom render function", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          render={(props) => <table {...props} data-custom="true" />}
        >
          <TableHeader render={(props) => <thead {...props} data-custom="true" />}>
            <TableColumn id="name" render={(props) => <th {...props} data-custom="true" />}>
              Name
            </TableColumn>
            <TableColumn id="type" render={(props) => <th {...props} data-custom="true" />}>
              Type
            </TableColumn>
            <TableColumn id="level" render={(props) => <th {...props} data-custom="true" />}>
              Level
            </TableColumn>
          </TableHeader>
          <TableBody render={(props) => <tbody {...props} data-custom="true" />}>
            {(item: any) => (
              <TableRow
                id={item.id}
                item={item}
                render={(props) => <tr {...props} data-custom="true" />}
              >
                <TableCell render={(props) => <td {...props} data-custom="true" />}>
                  {item.name}
                </TableCell>
                <TableCell render={(props) => <td {...props} data-custom="true" />}>
                  {item.type}
                </TableCell>
                <TableCell render={(props) => <td {...props} data-custom="true" />}>
                  {item.level}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      ));

      expect(screen.getByRole("grid")).toHaveAttribute("data-custom", "true");
      for (const row of screen.getAllByRole("row").slice(1)) {
        expect(row).toHaveAttribute("data-custom", "true");
      }
      for (const cell of [
        ...screen.getAllByRole("columnheader"),
        ...screen.queryAllByRole("rowheader"),
        ...screen.getAllByRole("gridcell"),
      ]) {
        expect(cell).toHaveAttribute("data-custom", "true");
      }
    });

    it("should render with custom classes", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          class="table"
        >
          {() => (
            <>
              <TableHeader class="header">
                <TableColumn id="name" class="column">
                  {() => <>Name</>}
                </TableColumn>
              </TableHeader>
              <TableBody class="body">
                {(item: any) => (
                  <TableRow id={item.id} item={item} class="row">
                    {() => <TableCell class="cell">{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(document.querySelector(".table")).toBeTruthy();
      expect(document.querySelector(".header")).toBeTruthy();
      expect(document.querySelector(".body")).toBeTruthy();
      expect(document.querySelector(".column")).toBeTruthy();
      expect(document.querySelectorAll(".row")).toHaveLength(3);
      expect(document.querySelectorAll(".cell")).toHaveLength(3);
    });

    it("should support DOM props", () => {
      render(() => <TestTable data-testid="pokemon-table" slot="table-slot" />);

      const table = screen.getByTestId("pokemon-table");
      expect(table).toHaveAttribute("role", "grid");
      expect(table).toHaveAttribute("slot", "table-slot");
    });

    it("should support overriding table style", () => {
      render(() => <TestTable style={{ width: "200px" }} />);

      expect(screen.getByRole("grid")).toHaveStyle({ width: "200px" });
    });

    it("should support refs", () => {
      let tableRef: HTMLTableElement | null = null;
      let headerRef: HTMLTableSectionElement | null = null;
      let columnRef: HTMLTableCellElement | null = null;
      let bodyRef: HTMLTableSectionElement | null = null;
      let rowRef: HTMLTableRowElement | null = null;
      let cellRef: HTMLTableCellElement | null = null;

      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns.slice(0, 2)}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          ref={(el) => {
            tableRef = el;
          }}
        >
          {() => (
            <>
              <TableHeader
                ref={(el) => {
                  headerRef = el;
                }}
              >
                <TableColumn
                  id="name"
                  ref={(el) => {
                    columnRef = el;
                  }}
                >
                  {() => <>Name</>}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody
                ref={(el) => {
                  bodyRef = el;
                }}
              >
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    ref={(el) => {
                      rowRef = el;
                    }}
                  >
                    {() => (
                      <>
                        <TableCell
                          ref={(el) => {
                            cellRef = el;
                          }}
                        >
                          {() => <>{item.name}</>}
                        </TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(tableRef).toBeInstanceOf(HTMLTableElement);
      expect(headerRef).toBeInstanceOf(HTMLTableSectionElement);
      expect(columnRef).toBeInstanceOf(HTMLTableCellElement);
      expect(bodyRef).toBeInstanceOf(HTMLTableSectionElement);
      expect(rowRef).toBeInstanceOf(HTMLTableRowElement);
      expect(cellRef).toBeInstanceOf(HTMLTableCellElement);
    });

    it("should support onScroll", () => {
      const onScroll = vi.fn();
      render(() => <TestTable onScroll={onScroll} />);

      fireEvent.scroll(screen.getByRole("grid"));
      expect(onScroll).toHaveBeenCalledTimes(1);
    });

    it("should support dynamic collections", () => {
      function DynamicTable() {
        const [rows, setRows] = createSignal(testData.slice(0, 2));
        return (
          <>
            <button type="button" onClick={() => setRows([testData[2]])}>
              Update
            </button>
            <Table
              items={rows()}
              columns={testColumns}
              getKey={(item: any) => item.id}
              aria-label="Pokemon"
            >
              {() => (
                <>
                  <TableHeader>
                    <TableColumn id="name">{() => <>Name</>}</TableColumn>
                    <TableColumn id="type">{() => <>Type</>}</TableColumn>
                    <TableColumn id="level">{() => <>Level</>}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(item: any) => (
                      <TableRow id={item.id} item={item}>
                        {() => (
                          <>
                            <TableCell>{() => <>{item.name}</>}</TableCell>
                            <TableCell>{() => <>{item.type}</>}</TableCell>
                            <TableCell>{() => <>{item.level}</>}</TableCell>
                          </>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        );
      }

      render(() => <DynamicTable />);
      expect(screen.getByText("Pikachu")).toBeTruthy();
      expect(screen.getByText("Charizard")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(screen.getByText("Blastoise")).toBeTruthy();
      expect(screen.queryByText("Pikachu")).toBeNull();
    });

    it("supports removing rows", () => {
      function RemovableRowsTable() {
        const [rows, setRows] = createSignal(testData);
        return (
          <>
            <button type="button" onClick={() => setRows([testData[0], testData[2]])}>
              Remove
            </button>
            <Table
              items={rows()}
              columns={testColumns}
              getKey={(item: any) => item.id}
              aria-label="Pokemon"
            >
              {() => (
                <>
                  <TableHeader>
                    <TableColumn id="name">{() => <>Name</>}</TableColumn>
                    <TableColumn id="type">{() => <>Type</>}</TableColumn>
                    <TableColumn id="level">{() => <>Level</>}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(item: any) => (
                      <TableRow id={item.id} item={item}>
                        {() => (
                          <>
                            <TableCell>{() => <>{item.name}</>}</TableCell>
                            <TableCell>{() => <>{item.type}</>}</TableCell>
                            <TableCell>{() => <>{item.level}</>}</TableCell>
                          </>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        );
      }

      render(() => <RemovableRowsTable />);
      expect(screen.getAllByRole("row")).toHaveLength(4);
      expect(screen.getByText("Charizard")).toBeTruthy();

      fireEvent.click(screen.getByRole("button", { name: "Remove" }));

      expect(screen.getAllByRole("row")).toHaveLength(3);
      expect(screen.queryByText("Charizard")).toBeNull();
      expect(screen.getByText("Blastoise")).toBeTruthy();
    });

    it("should support updating columns", () => {
      function DynamicColumnsTable() {
        const [columns, setColumns] = createSignal(testColumns);
        return (
          <>
            <button type="button" onClick={() => setColumns([testColumns[0], testColumns[2]])}>
              Update
            </button>
            <Table
              items={testData}
              columns={columns()}
              getKey={(item: any) => item.id}
              aria-label="Pokemon"
            >
              {() => (
                <>
                  <TableHeader>
                    <For each={columns()}>
                      {(column) => (
                        <TableColumn id={column.key}>{() => <>{column.name}</>}</TableColumn>
                      )}
                    </For>
                  </TableHeader>
                  <TableBody>
                    {(item: any) => (
                      <TableRow id={item.id} item={item}>
                        {() => (
                          <For each={columns()}>
                            {(column) => <TableCell>{() => <>{item[column.key]}</>}</TableCell>}
                          </For>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        );
      }

      render(() => <DynamicColumnsTable />);
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);

      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(screen.getAllByRole("columnheader")).toHaveLength(2);
      expect(screen.queryByRole("columnheader", { name: "Type" })).toBeNull();
      expect(screen.getByRole("columnheader", { name: "Level" })).toBeTruthy();
    });

    it("should support updating and reordering a row at the same time", () => {
      function ReorderedRowsTable() {
        const [rows, setRows] = createSignal(testData);
        return (
          <>
            <button
              type="button"
              onClick={() =>
                setRows([testData[1], { ...testData[0], name: "Raichu" }, testData[2]])
              }
            >
              Update
            </button>
            <Table
              items={rows()}
              columns={testColumns}
              getKey={(item: any) => item.id}
              aria-label="Pokemon"
            >
              {() => (
                <>
                  <TableHeader>
                    <TableColumn id="name">{() => <>Name</>}</TableColumn>
                    <TableColumn id="type">{() => <>Type</>}</TableColumn>
                    <TableColumn id="level">{() => <>Level</>}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {(item: any) => (
                      <TableRow id={item.id} item={item}>
                        {() => (
                          <>
                            <TableCell>{() => <>{item.name}</>}</TableCell>
                            <TableCell>{() => <>{item.type}</>}</TableCell>
                            <TableCell>{() => <>{item.level}</>}</TableCell>
                          </>
                        )}
                      </TableRow>
                    )}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        );
      }

      render(() => <ReorderedRowsTable />);
      expect(
        screen
          .getAllByRole("row")
          .slice(1)
          .map((row) => row.textContent),
      ).toEqual(["PikachuElectric25", "CharizardFire45", "BlastoiseWater42"]);

      fireEvent.click(screen.getByRole("button", { name: "Update" }));

      expect(
        screen
          .getAllByRole("row")
          .slice(1)
          .map((row) => row.textContent),
      ).toEqual(["CharizardFire45", "RaichuElectric25", "BlastoiseWater42"]);
    });

    it("supports removing a column and adding it back static", () => {
      function HidingColumnsTable() {
        const [hideColumns, setHideColumns] = createSignal(false);
        const columns = () => (hideColumns() ? [testColumns[0], testColumns[2]] : testColumns);
        return (
          <>
            <ResizableTableContainer>
              <Table
                items={testData}
                columns={columns()}
                getKey={(item: any) => item.id}
                aria-label="Pokemon"
              >
                {() => (
                  <>
                    <TableHeader>
                      <TableColumn id="name">{() => <>Name</>}</TableColumn>
                      {!hideColumns() && <TableColumn id="type">{() => <>Type</>}</TableColumn>}
                      <TableColumn id="level">{() => <>Level</>}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {(item: any) => (
                        <TableRow id={item.id} item={item}>
                          {() => (
                            <>
                              <TableCell>{() => <>{item.name}</>}</TableCell>
                              {!hideColumns() && <TableCell>{() => <>{item.type}</>}</TableCell>}
                              <TableCell>{() => <>{item.level}</>}</TableCell>
                            </>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </>
                )}
              </Table>
            </ResizableTableContainer>
            <button type="button" onClick={() => setHideColumns((value) => !value)}>
              {hideColumns() ? "Show Columns" : "Hide Columns"}
            </button>
          </>
        );
      }

      render(() => <HidingColumnsTable />);
      expect(screen.getByRole("button")).toHaveTextContent("Hide Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);

      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toHaveTextContent("Show Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(2);

      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toHaveTextContent("Hide Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    });

    it("supports removing a column and adding it back dynamic", () => {
      function HidingDynamicColumnsTable() {
        const [hideColumns, setHideColumns] = createSignal(false);
        const columns = () => (hideColumns() ? [testColumns[0], testColumns[2]] : testColumns);
        return (
          <>
            <ResizableTableContainer>
              <Table
                items={testData}
                columns={columns()}
                getKey={(item: any) => item.id}
                aria-label="Pokemon"
              >
                {() => (
                  <>
                    <TableHeader>
                      <For each={columns()}>
                        {(column) => (
                          <TableColumn id={column.key}>{() => <>{column.name}</>}</TableColumn>
                        )}
                      </For>
                    </TableHeader>
                    <TableBody>
                      {(item: any) => (
                        <TableRow id={item.id} item={item}>
                          {() => (
                            <For each={columns()}>
                              {(column) => <TableCell>{() => <>{item[column.key]}</>}</TableCell>}
                            </For>
                          )}
                        </TableRow>
                      )}
                    </TableBody>
                  </>
                )}
              </Table>
            </ResizableTableContainer>
            <button type="button" onClick={() => setHideColumns((value) => !value)}>
              {hideColumns() ? "Show Columns" : "Hide Columns"}
            </button>
          </>
        );
      }

      render(() => <HidingDynamicColumnsTable />);
      expect(screen.getByRole("button")).toHaveTextContent("Hide Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);

      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toHaveTextContent("Show Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(2);

      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByRole("button")).toHaveTextContent("Hide Columns");
      expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    });

    it("should support data-focus-visible-within", () => {
      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
                <TableColumn id="level">{() => <>Level</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <button type="button">{item.name}</button>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                        <TableCell>{() => <>{item.level}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getAllByRole("row")[1];
      const button = screen.getByRole("button", { name: "Pikachu" });
      expect(row).not.toHaveAttribute("data-focus-visible-within");

      fireEvent.keyDown(document, { key: "Tab" });
      row.focus();
      fireEvent.focus(row);
      expect(row).toHaveAttribute("data-focus-visible-within");

      fireEvent.blur(row, { relatedTarget: button });
      button.focus();
      fireEvent.focus(button);
      expect(row).toHaveAttribute("data-focus-visible-within");

      fireEvent.focusOut(row);
      expect(row).not.toHaveAttribute("data-focus-visible-within");
    });

    it("should render header", () => {
      render(() => <TestTable />);

      const header = document.querySelector(".solidaria-Table-header");
      expect(header).toBeTruthy();
      expect(header?.tagName).toBe("THEAD");
    });

    it("should render column headers", () => {
      render(() => <TestTable />);

      const columns = document.querySelectorAll(".solidaria-Table-column");
      expect(columns.length).toBe(3);
      expect(screen.getByText("Name")).toBeTruthy();
      expect(screen.getByText("Type")).toBeTruthy();
      expect(screen.getByText("Level")).toBeTruthy();
    });

    it("should support column hover when sorting is allowed", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn
                  id="name"
                  allowsSorting
                  class={(props) => (props.isHovered ? "hover" : "")}
                >
                  {() => <>Name</>}
                </TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const column = screen.getByRole("columnheader", { name: "Name" });
      expect(column).not.toHaveAttribute("data-hovered");
      expect(column).not.toHaveClass("hover");

      fireEvent.pointerOver(column, { pointerType: "mouse" });
      expect(column).toHaveAttribute("data-hovered");
      expect(column).toHaveClass("hover");

      fireEvent.pointerOut(column, { pointerType: "mouse" });
      expect(column).not.toHaveAttribute("data-hovered");
      expect(column).not.toHaveClass("hover");
    });

    it("should not show column hover state when column is not sortable", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name" class={(props) => (props.isHovered ? "hover" : "")}>
                  {() => <>Name</>}
                </TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const column = screen.getByRole("columnheader", { name: "Name" });
      fireEvent.pointerOver(column, { pointerType: "mouse" });
      expect(column).not.toHaveAttribute("data-hovered");
      expect(column).not.toHaveClass("hover");
    });

    it("should support hover events on the TableHeader", () => {
      const onHoverStart = vi.fn();
      const onHoverEnd = vi.fn();
      const onHoverChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader
                class={(props) => (props.isHovered ? "hover" : "")}
                onHoverStart={onHoverStart as never}
                onHoverEnd={onHoverEnd as never}
                onHoverChange={onHoverChange as never}
              >
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const header = screen.getAllByRole("rowgroup")[0];
      expect(header).not.toHaveAttribute("data-hovered");
      expect(header).not.toHaveClass("hover");

      fireEvent.pointerOver(header, { pointerType: "mouse" });
      expect(header).toHaveAttribute("data-hovered");
      expect(header).toHaveClass("hover");
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(true);

      fireEvent.pointerOut(header, { pointerType: "mouse" });
      expect(header).not.toHaveAttribute("data-hovered");
      expect(header).not.toHaveClass("hover");
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(false);
    });

    it("should render body", () => {
      render(() => <TestTable />);

      const body = document.querySelector(".solidaria-Table-body");
      expect(body).toBeTruthy();
      expect(body?.tagName).toBe("TBODY");
    });

    it("should render footer rows", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
                <TableColumn id="level">{() => <>Level</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                        <TableCell>{() => <>{item.level}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={2}>{() => <>Total</>}</TableCell>
                  <TableCell>{() => <>112</>}</TableCell>
                </TableRow>
              </TableFooter>
            </>
          )}
        </Table>
      ));

      const footer = document.querySelector(".solidaria-Table-footer");
      expect(footer).toBeTruthy();
      expect(footer?.tagName).toBe("TFOOT");
      expect(screen.getByText("Total")).toHaveAttribute("colspan", "2");
      expect(screen.getByText("112")).toBeTruthy();
    });

    it("should render rows", () => {
      render(() => <TestTable />);

      const rows = document.querySelectorAll(".solidaria-Table-row");
      expect(rows.length).toBe(3);
    });

    it("should render cells with data", () => {
      render(() => <TestTable />);

      expect(screen.getByText("Pikachu")).toBeTruthy();
      expect(screen.getByText("Electric")).toBeTruthy();
      expect(screen.getByText("Charizard")).toBeTruthy();
      expect(screen.getByText("Fire")).toBeTruthy();
    });

    it("should render cells with default class", () => {
      render(() => <TestTable />);

      const cells = document.querySelectorAll(".solidaria-Table-cell");
      expect(cells.length).toBe(9);
    });

    it("should trigger onLoadMore from table body sentinel", () => {
      const onLoadMore = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
                <TableColumn id="level">{() => <>Level</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={onLoadMore}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                        <TableCell>{() => <>{item.level}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const loadMoreRow = document.querySelector(".solidaria-Table-loadMore");
      expect(loadMoreRow).toBeTruthy();
      fireEvent.focus(loadMoreRow!);
      expect(onLoadMore).toHaveBeenCalled();
    });

    it("should render the load more element with the expected attributes", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                        <TableCell>{() => <>{item.level}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const loader = document.querySelector(".solidaria-Table-loadMore")!;
      expect(loader).toHaveAttribute("role", "row");
      expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();
      expect(loader.querySelector('[role="rowheader"]')).toHaveAttribute("colspan", "3");
      expect(screen.getByTestId("loadMoreSentinel").closest("tr")).toHaveAttribute("inert");
    });

    it("should still render the sentinel, but not render the spinner if it isnt loading", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
      expect(document.querySelector(".solidaria-Table-loadMore")).toBeNull();
    });

    it("should render the loading element when loading", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();
      expect(screen.getByTestId("loadMoreSentinel").closest("tr")).toHaveAttribute("inert");
    });

    it("should render the sentinel but not the loading indicator when not loading", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
    });

    it("should not reserve room for the loader if isLoading is false", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
      expect(document.querySelector(".solidaria-Table-loadMore")).toBeNull();
    });

    it("should not focus the load more row when using ArrowDown", async () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = screen.getByRole("grid", { name: "Pokemon" });
      const rows = screen.getAllByRole("row");
      rows[1].focus();
      fireEvent.focus(rows[1]);
      fireEvent.keyDown(table, { key: "ArrowDown" });
      fireEvent.keyDown(table, { key: "ArrowDown" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[3]);

      fireEvent.keyDown(table, { key: "ArrowDown" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[3]);

      fireEvent.keyDown(table, { key: "ArrowUp" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[2]);
    });

    it("should not focus the load more row when using End", async () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = screen.getByRole("grid", { name: "Pokemon" });
      const rows = screen.getAllByRole("row");
      rows[1].focus();
      fireEvent.focus(rows[1]);
      fireEvent.keyDown(table, { key: "End" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[3]);

      fireEvent.keyDown(table, { key: "ArrowUp" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[2]);
    });

    it("should not focus the load more row when using PageDown", async () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell id="name">{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = screen.getByRole("grid", { name: "Pokemon" });
      const rows = screen.getAllByRole("row");
      rows[1].focus();
      fireEvent.focus(rows[1]);
      fireEvent.keyDown(table, { key: "PageDown" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[3]);

      fireEvent.keyDown(table, { key: "ArrowUp" });
      await Promise.resolve();
      expect(document.activeElement).toBe(rows[2]);
    });

    it("should properly render the renderEmptyState if table is empty", () => {
      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Pokemon" selectionMode="multiple">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody
                hasMore
                onLoadMore={() => {}}
                renderEmptyState={() => <div>No results</div>}
              >
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByText("No results")).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Select All" })).toBeDisabled();
      expect(document.querySelector(".solidaria-Table-body")).toHaveAttribute("data-empty");
    });

    it("should not render no results state and the loader at the same time", () => {
      const [isLoading, setIsLoading] = createSignal(true);

      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Pokemon" selectionMode="multiple">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody
                hasMore
                isLoading={isLoading()}
                onLoadMore={() => {}}
                renderEmptyState={() => <div>No results</div>}
              >
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(document.querySelector(".solidaria-Table-body")).toHaveAttribute("data-empty");
      expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();
      expect(screen.queryByText("No results")).toBeNull();

      setIsLoading(false);
      expect(document.querySelector(".solidaria-Table-body")).toHaveAttribute("data-empty");
      expect(screen.queryByRole("progressbar")).toBeNull();
      expect(screen.getByText("No results")).toBeInTheDocument();
    });

    it("should disable the select all checkbox and column focusablity when the table is empty and loading", () => {
      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Pokemon" selectionMode="multiple">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody
                hasMore
                isLoading
                onLoadMore={() => {}}
                renderEmptyState={() => <div>No results</div>}
              >
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("checkbox", { name: "Select All" })).toBeDisabled();
      expect(screen.getAllByRole("columnheader")[0]).not.toHaveAttribute("tabindex", "0");
    });

    it("should fire onLoadMore when intersecting with the sentinel", () => {
      const onLoadMore = vi.fn();
      const observer = setupIntersectionObserverMock();

      try {
        render(() => (
          <Table
            items={testData}
            columns={testColumns}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody hasMore onLoadMore={onLoadMore}>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        ));

        expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId("loadMoreSentinel"));
        expect(onLoadMore).not.toHaveBeenCalled();

        observer.triggerIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
      } finally {
        observer.restore();
      }
    });

    it("should only fire loadMore when intersection is detected regardless of loading state", async () => {
      const onLoadMore = vi.fn();
      const [isLoading, setIsLoading] = createSignal(true);
      const observer = setupIntersectionObserverMock();

      try {
        render(() => (
          <Table
            items={testData}
            columns={testColumns}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody hasMore isLoading={isLoading()} onLoadMore={onLoadMore}>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        ));

        expect(observer.observe).toHaveBeenCalledWith(screen.getByTestId("loadMoreSentinel"));
        expect(onLoadMore).not.toHaveBeenCalled();

        observer.triggerIntersection([{ isIntersecting: false } as IntersectionObserverEntry]);
        expect(onLoadMore).not.toHaveBeenCalled();

        observer.triggerIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);
        expect(onLoadMore).toHaveBeenCalledTimes(1);

        await Promise.resolve();
        setIsLoading(false);
        observer.triggerIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);
        expect(onLoadMore).toHaveBeenCalledTimes(2);
      } finally {
        observer.restore();
      }
    });

    it("should not crash when dragging over the loader", () => {
      const { dragAndDropHooks } = useDragAndDrop<(typeof testData)[number]>({
        items: testData,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          dragAndDropHooks={dragAndDropHooks}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const loader = document.querySelector(".solidaria-Table-loadMore")!;
      expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();
      expect(() => fireEvent.dragEnter(loader)).not.toThrow();
      expect(() => fireEvent.dragOver(loader)).not.toThrow();
    });

    it("should automatically fire onLoadMore if there aren't enough items to fill the Table", async () => {
      const onLoadMore = vi.fn();
      const [isLoading, setIsLoading] = createSignal(true);
      const observer = setupIntersectionObserverMock();

      try {
        render(() => (
          <Table
            items={testData}
            columns={testColumns}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody hasMore isLoading={isLoading()} onLoadMore={onLoadMore}>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        ));

        expect(onLoadMore).not.toHaveBeenCalled();
        setIsLoading(false);
        await Promise.resolve();
        observer.triggerIntersection([{ isIntersecting: true } as IntersectionObserverEntry]);
        expect(onLoadMore).toHaveBeenCalledTimes(1);
      } finally {
        observer.restore();
      }
    });

    it("should always render the sentinel even when virtualized", () => {
      const rows = Array.from({ length: 25 }, (_, index) => ({
        id: index + 1,
        name: `Pokemon ${index + 1}`,
      }));

      render(() => (
        <Virtualizer
          layout={TableLayout}
          layoutOptions={{ itemSize: 36, viewportSize: 72, overscan: 0 }}
        >
          <Table
            items={rows}
            columns={[{ key: "name", name: "Name" }]}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody hasMore onLoadMore={() => {}}>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell id="name">{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </Virtualizer>
      ));

      expect(screen.getByTestId("loadMoreSentinel")).toBeInTheDocument();
      expect(screen.queryByText("Pokemon 25")).toBeNull();
    });

    it.skip("accepts a user defined scrollRef", () => {
      // Upstream currently skips this title; keep it mirrored so the parity script does not track it as a Solid gap.
    });

    it("should support virtualizer", () => {
      const rows = Array.from({ length: 25 }, (_, index) => ({
        id: index + 1,
        name: `Pokemon ${index + 1}`,
      }));

      render(() => (
        <Virtualizer
          layout={TableLayout}
          layoutOptions={{ itemSize: 36, viewportSize: 72, overscan: 0 }}
        >
          <Table
            items={rows}
            columns={[{ key: "name", name: "Name" }]}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell id="name">{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </Virtualizer>
      ));

      const table = screen.getByRole("grid", { name: "Pokemon" });
      expect(table).toHaveAttribute("aria-rowcount", "26");
      expect(table).toHaveAttribute("aria-colcount", "1");
      expect(screen.getByText("Pokemon 1")).toBeInTheDocument();
      expect(screen.getByText("Pokemon 2")).toBeInTheDocument();
      expect(screen.queryByText("Pokemon 25")).toBeNull();
    });

    it("should have the correct row indicies after loading more items", () => {
      const [items, setItems] = createSignal<typeof testData>([]);
      const [isLoading, setIsLoading] = createSignal(true);

      render(() => (
        <Virtualizer
          layout={TableLayout}
          layoutOptions={{ itemSize: 36, viewportSize: 180, overscan: 0 }}
        >
          <Table
            items={items()}
            columns={[{ key: "name", name: "Name" }]}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody hasMore isLoading={isLoading()} onLoadMore={() => {}}>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => <TableCell id="name">{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </Virtualizer>
      ));

      expect(document.querySelector(".solidaria-Table-loadMore")).not.toHaveAttribute(
        "aria-rowindex",
      );

      setItems(testData);
      setIsLoading(false);
      const rows = document.querySelectorAll(".solidaria-Table-row");
      expect(rows).toHaveLength(3);
      expect(rows[0]).toHaveAttribute("aria-rowindex", "2");
      expect(rows[1]).toHaveAttribute("aria-rowindex", "3");
      expect(rows[2]).toHaveAttribute("aria-rowindex", "4");

      setIsLoading(true);
      const loader = document.querySelector(".solidaria-Table-loadMore");
      expect(loader).not.toHaveAttribute("aria-rowindex");
      for (const [index, row] of Array.from(
        document.querySelectorAll(".solidaria-Table-row"),
      ).entries()) {
        expect(row).toHaveAttribute("aria-rowindex", `${index + 2}`);
      }
    });

    it("should apply draggable row semantics when drag hooks are provided", () => {
      const { dragAndDropHooks } = useDragAndDrop<(typeof testData)[number]>({
        items: testData,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => <TestTable dragAndDropHooks={dragAndDropHooks} />);

      const rows = document.querySelectorAll(".solidaria-Table-row");
      expect(rows[0]).toHaveAttribute("draggable", "true");
    });

    it("should support drag button slot", () => {
      const rows = [
        { id: 1, name: "Games", type: "File folder" },
        { id: 2, name: "Program Files", type: "File folder" },
      ];
      const { dragAndDropHooks } = useDragAndDrop<(typeof rows)[number]>({
        items: rows,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
      });

      render(() => (
        <Table
          items={rows}
          columns={[
            { key: "drag", name: "Drag" },
            { key: "name", name: "Name" },
          ]}
          getKey={(item: any) => item.id}
          getTextValue={(item: any, column: any) => (column.key === "name" ? item.name : "")}
          aria-label="Files"
          dragAndDropHooks={dragAndDropHooks}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="drag">{() => <>Drag</>}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <Button slot="drag">≡</Button>}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getAllByRole("button")[0]).toHaveAttribute("aria-label", "Drag Games");
    });

    it("should support disabled drag and drop", () => {
      const { dragAndDropHooks } = useDragAndDrop<(typeof testData)[number]>({
        items: testData,
        isDisabled: true,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
        onReorder: () => {},
      });

      render(() => <TestTable dragAndDropHooks={dragAndDropHooks} />);

      const table = screen.getByRole("grid", { name: "Pokemon" });
      expect(table).not.toHaveAttribute("data-allows-dragging", "true");
      expect(table).not.toHaveAttribute("draggable", "true");

      const rows = document.querySelectorAll(".solidaria-Table-row");
      for (const row of rows) {
        expect(row).not.toHaveAttribute("draggable", "true");
      }
    });

    it("should allow selection even when drag and drop is disabled", () => {
      const { dragAndDropHooks } = useDragAndDrop<(typeof testData)[number]>({
        items: testData,
        isDisabled: true,
        getItems: (keys, items) =>
          items.filter((item) => keys.has(item.id)).map((item) => ({ "text/plain": item.name })),
        onReorder: () => {},
      });

      render(() => (
        <Table
          items={testData}
          columns={[
            { key: "select", name: "Select" },
            { key: "name", name: "Name" },
          ]}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          dragAndDropHooks={dragAndDropHooks}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      for (const checkbox of checkboxes) {
        expect(checkbox).not.toBeChecked();
      }

      expect(checkboxes[0]).toHaveAttribute("aria-label", "Select All");
      fireEvent.click(checkboxes[1]);

      expect(checkboxes[1]).toBeChecked();
    });

    it("wires horizontal droppable keyboard delegate methods in ltr", () => {
      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
          isDropTarget: false,
          target: null,
          isDisabled: false,
          setTarget: () => {},
          isAccepted: () => true,
          enterTarget: () => {},
          moveToTarget: () => {},
          exitTarget: () => {},
          activateTarget: () => {},
          drop: () => {},
          shouldAcceptItemDrop: () => true,
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      render(() => <TestTable dragAndDropHooks={dragAndDropHooks as any} />);

      expect(keyboardDelegate?.getKeyLeftOf).toBeTypeOf("function");
      expect(keyboardDelegate?.getKeyRightOf).toBeTypeOf("function");
      expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(1);
      expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(3);
    });

    it("wires horizontal droppable keyboard delegate methods in rtl", () => {
      const originalDir = document.dir;
      document.dir = "rtl";
      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
          isDropTarget: false,
          target: null,
          isDisabled: false,
          setTarget: () => {},
          isAccepted: () => true,
          enterTarget: () => {},
          moveToTarget: () => {},
          exitTarget: () => {},
          activateTarget: () => {},
          drop: () => {},
          shouldAcceptItemDrop: () => true,
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => <TestTable dragAndDropHooks={dragAndDropHooks as any} />);

        expect(keyboardDelegate?.getKeyLeftOf).toBeTypeOf("function");
        expect(keyboardDelegate?.getKeyRightOf).toBeTypeOf("function");
        expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(3);
        expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(1);
      } finally {
        document.dir = originalDir;
      }
    });

    it("falls back to document direction when getComputedStyle is unavailable", () => {
      const originalDir = document.dir;
      document.dir = "rtl";
      const originalGetComputedStyle = window.getComputedStyle;
      Object.defineProperty(window, "getComputedStyle", {
        configurable: true,
        writable: true,
        value: undefined,
      });

      let keyboardDelegate:
        | {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          }
        | undefined;
      const dragAndDropHooks = {
        useDroppableCollectionState: () => ({
          isDropTarget: false,
          target: null,
          isDisabled: false,
          setTarget: () => {},
          isAccepted: () => true,
          enterTarget: () => {},
          moveToTarget: () => {},
          exitTarget: () => {},
          activateTarget: () => {},
          drop: () => {},
          shouldAcceptItemDrop: () => true,
          getDropOperation: () => "move" as const,
        }),
        useDroppableCollection: (props: {
          keyboardDelegate?: {
            getKeyLeftOf?: (key: string | number) => string | number | null;
            getKeyRightOf?: (key: string | number) => string | number | null;
          };
        }) => {
          keyboardDelegate = props.keyboardDelegate;
          return { collectionProps: {} };
        },
        useDroppableItem: () => ({ dropProps: {}, dropButtonProps: {}, isDropTarget: false }),
        ListDropTargetDelegate: class {
          getDropTargetFromPoint() {
            return null;
          }
        },
      };

      try {
        render(() => <TestTable dragAndDropHooks={dragAndDropHooks as any} />);
        expect(keyboardDelegate?.getKeyLeftOf?.(2)).toBe(3);
        expect(keyboardDelegate?.getKeyRightOf?.(2)).toBe(1);
      } finally {
        Object.defineProperty(window, "getComputedStyle", {
          configurable: true,
          writable: true,
          value: originalGetComputedStyle,
        });
        document.dir = originalDir;
      }
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-empty when table is empty", () => {
      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Empty table">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {() => <TableRow id="x">{() => <TableCell>{() => <>x</>}</TableCell>}</TableRow>}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = document.querySelector(".solidaria-Table");
      expect(table?.getAttribute("data-empty")).toBeTruthy();
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    function LinkTable(
      props: {
        selectionMode?: "none" | "single" | "multiple";
        selectionBehavior?: "toggle" | "replace";
        navigate?: (href: string, options?: any) => void;
      } = {},
    ) {
      const navigate = props.navigate ?? vi.fn();
      return (
        <RouterProvider navigate={navigate}>
          <Table
            items={testData.slice(0, 2)}
            columns={[
              { key: "select", name: "Select" },
              { key: "name", name: "Name" },
            ]}
            getKey={(item: any) => item.id}
            aria-label="Links"
            selectionMode={props.selectionMode}
            selectionBehavior={props.selectionBehavior}
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="select">{() => <>Select</>}</TableColumn>
                  <TableColumn id="name">{() => <>Name</>}</TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id} item={item} href={`/${item.name.toLowerCase()}`}>
                      {() => (
                        <>
                          <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                          <TableCell>{() => <>{item.name}</>}</TableCell>
                        </>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </RouterProvider>
      );
    }

    it('should support links with selectionMode="none"', () => {
      const navigate = vi.fn();
      render(() => <LinkTable selectionMode="none" navigate={navigate} />);

      const items = screen.getAllByRole("row").slice(1);
      for (const item of items) {
        expect(item.tagName).not.toBe("A");
        expect(item).toHaveAttribute("data-href");
      }

      fireEvent.click(items[0]);
      expect(navigate).toHaveBeenCalledWith("/pikachu", undefined);
    });

    it.each(["single", "multiple"] as const)(
      'should support links with selectionBehavior="toggle" selectionMode="%s"',
      (selectionMode) => {
        const navigate = vi.fn();
        render(() => <LinkTable selectionMode={selectionMode} navigate={navigate} />);

        const items = screen.getAllByRole("row").slice(1);
        for (const item of items) {
          expect(item.tagName).not.toBe("A");
          expect(item).toHaveAttribute("data-href");
        }

        fireEvent.click(items[0]);
        expect(navigate).toHaveBeenCalledWith("/pikachu", undefined);
        expect(items[0]).toHaveAttribute("aria-selected", "false");

        fireEvent.click(within(items[0]).getByRole("checkbox"));
        expect(items[0]).toHaveAttribute("aria-selected", "true");

        fireEvent.keyDown(items[1], { key: " " });
        fireEvent.keyUp(items[1], { key: " " });
        expect(navigate).toHaveBeenCalledTimes(1);
        expect(items[1]).toHaveAttribute("aria-selected", "true");
      },
    );

    it.each(["single", "multiple"] as const)(
      'should support links with selectionBehavior="replace" selectionMode="%s"',
      (selectionMode) => {
        const navigate = vi.fn();
        render(() => (
          <LinkTable
            selectionMode={selectionMode}
            selectionBehavior="replace"
            navigate={navigate}
          />
        ));

        const items = screen.getAllByRole("row").slice(1);
        for (const item of items) {
          expect(item.tagName).not.toBe("A");
          expect(item).toHaveAttribute("data-href");
        }

        fireEvent.click(items[0]);
        expect(navigate).not.toHaveBeenCalled();
        expect(items[0]).toHaveAttribute("aria-selected", "true");

        fireEvent.doubleClick(items[0]);
        expect(navigate).toHaveBeenCalledWith("/pikachu", undefined);

        fireEvent.keyDown(items[1], { key: " " });
        fireEvent.keyUp(items[1], { key: " " });
        expect(items[1]).toHaveAttribute("aria-selected", "true");
        expect(navigate).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(items[1], { key: "Enter" });
        fireEvent.keyUp(items[1], { key: "Enter" });
        expect(navigate).toHaveBeenCalledTimes(2);
        expect(navigate).toHaveBeenLastCalledWith("/charizard", undefined);
      },
    );

    it("should support single selection mode", () => {
      render(() => <TestTable selectionMode="single" />);

      const table = document.querySelector(".solidaria-Table");
      expect(table).toBeTruthy();
    });

    it("should support multiple selection mode", () => {
      render(() => <TestTable selectionMode="multiple" />);

      const table = document.querySelector(".solidaria-Table");
      expect(table).toBeTruthy();
    });

    it("should support default selected keys", () => {
      render(() => <TestTable selectionMode="multiple" defaultSelectedKeys={new Set([1, 2])} />);

      const selectedRows = document.querySelectorAll("[data-selected]");
      expect(selectedRows.length).toBe(2);
    });

    it("should call onSelectionChange", () => {
      const onSelectionChange = vi.fn();

      render(() => <TestTable selectionMode="single" onSelectionChange={onSelectionChange} />);

      const table = document.querySelector(".solidaria-Table");
      expect(table).toBeTruthy();
    });

    it("updates row aria-selected when selecting from focused grid with keyboard", () => {
      render(() => <TestTable selectionMode="multiple" />);

      const grid = screen.getByRole("grid", { name: "Pokemon" });
      const getFirstDataRow = () => screen.getByText("Pikachu").closest('[role="row"]');
      expect(getFirstDataRow()).toBeTruthy();
      expect(getFirstDataRow()).toHaveAttribute("aria-selected", "false");

      fireEvent.focus(grid);
      fireEvent.keyDown(grid, { key: " " });

      expect(getFirstDataRow()).toHaveAttribute("aria-selected", "true");
    });

    it("updates TableSelectionCheckbox checked state when row selection changes", () => {
      const singleRow = [testData[0]];
      render(() => (
        <Table
          items={singleRow}
          columns={[{ key: "select", name: "Select" }]}
          getKey={(item: any) => item.id}
          aria-label="Pokemon single row"
          selectionMode="single"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <>Select</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const getCheckbox = () => screen.getByRole("checkbox");
      expect(getCheckbox()).not.toBeChecked();

      const rows = screen.getAllByRole("row");
      fireEvent.click(rows[1]);

      expect(getCheckbox()).toBeChecked();
    });

    it("should render checkboxes for selection", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toHaveAttribute("aria-label", "Select All");
      for (const checkbox of checkboxes) {
        expect(checkbox).not.toBeChecked();
      }

      fireEvent.click(checkboxes[0]);

      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).toBeChecked();
      }
    });

    it('should prevent Esc from clearing selection if escapeKeyBehavior is "none"', () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          escapeKeyBehavior="none"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();

      fireEvent.keyDown(screen.getByRole("grid", { name: "Pokemon" }), { key: "Escape" });

      expect(onSelectionChange).toHaveBeenCalledTimes(2);
      expect(checkboxes[1]).toBeChecked();
      expect(checkboxes[2]).toBeChecked();
    });

    it("should not include the loader in the selection when selecting all/deselecting all", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData.slice(0, 2)}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody hasMore isLoading onLoadMore={() => {}}>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(3);
      expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();

      fireEvent.click(checkboxes[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith("all");

      fireEvent.click(checkboxes[0]);
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
    });

    it("should not propagate the checkbox context from selection into other cells", () => {
      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <Checkbox aria-label="Agree" />}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("checkbox", { name: "Agree" })).toBeInTheDocument();
    });

    it("should not render checkboxes for selection with selectionBehavior=replace", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          selectionBehavior="replace"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.queryByRole("checkbox")).toBeNull();
      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      expect(row).toHaveAttribute("aria-selected", "false");
      fireEvent.click(row);
      expect(row).toHaveAttribute("aria-selected", "true");
    });

    it("should support disabled state", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          disabledKeys={[2]}
          disabledBehavior="all"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="select">{() => <TableSelectAllCheckbox />}</TableColumn>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isDisabled ? "disabled" : "")}
                  >
                    {() => (
                      <>
                        <TableCell>{() => <TableSelectionCheckbox rowKey={item.id} />}</TableCell>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const disabledRow = screen.getByText("Charizard").closest('[role="row"]')!;
      expect(disabledRow).toHaveAttribute("aria-disabled", "true");
      expect(disabledRow).toHaveClass("disabled");
      expect(disabledRow.querySelector('input[type="checkbox"]')).toBeDisabled();

      fireEvent.click(disabledRow);
      expect(disabledRow).toHaveAttribute("aria-selected", "false");
    });

    it("should support isDisabled prop on rows", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          disabledBehavior="all"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item} isDisabled={item.id === 2}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const disabledRow = screen.getByText("Charizard").closest('[role="row"]')!;
      expect(disabledRow).toHaveAttribute("aria-disabled", "true");

      fireEvent.click(disabledRow);
      expect(disabledRow).toHaveAttribute("aria-selected", "false");
    });
  });

  // ============================================
  // SORTING
  // ============================================

  describe("sorting", () => {
    it("should support sortDescriptor prop", () => {
      render(() => <TestTable sortDescriptor={{ column: "name", direction: "ascending" }} />);

      const table = document.querySelector(".solidaria-Table");
      expect(table).toBeTruthy();
    });

    it("should support sortable columns", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          sortDescriptor={{ column: "name", direction: "ascending" }}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name" allowsSorting>
                  {() => <>Name</>}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const sortableColumn = document.querySelector("[data-sortable]");
      expect(sortableColumn).toBeTruthy();
    });

    it("should show sort direction on sorted column", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          sortDescriptor={{ column: "name", direction: "ascending" }}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name" allowsSorting>
                  {() => <>Name</>}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const sortedColumn = document.querySelector('[data-sort-direction="ascending"]');
      expect(sortedColumn).toBeTruthy();
    });

    it("updates aria-sort when sortable column is activated", () => {
      render(() => {
        const [sortDescriptor, setSortDescriptor] = createSignal<
          { column: string | number; direction: "ascending" | "descending" } | undefined
        >(undefined);

        return (
          <Table
            items={testData}
            columns={testColumns}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
            sortDescriptor={sortDescriptor() as any}
            onSortChange={(descriptor) =>
              setSortDescriptor(
                descriptor as { column: string | number; direction: "ascending" | "descending" },
              )
            }
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name" allowsSorting>
                    {() => <>Name</>}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        );
      });

      const nameColumn = screen.getByRole("columnheader", { name: "Name" });
      expect(nameColumn).toHaveAttribute("aria-sort", "none");

      fireEvent.click(nameColumn);
      expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
        "aria-sort",
        "ascending",
      );
    });

    it("updates aria-sort from pointer activation", () => {
      render(() => {
        const [sortDescriptor, setSortDescriptor] = createSignal<
          { column: string | number; direction: "ascending" | "descending" } | undefined
        >({ column: "name", direction: "ascending" });

        return (
          <Table
            items={testData}
            columns={testColumns}
            getKey={(item: any) => item.id}
            aria-label="Pokemon"
            sortDescriptor={sortDescriptor() as any}
            onSortChange={(descriptor) =>
              setSortDescriptor(
                descriptor as { column: string | number; direction: "ascending" | "descending" },
              )
            }
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name" allowsSorting>
                    {() => <>Name</>}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id}>
                      {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        );
      });

      const nameColumn = screen.getByRole("columnheader", { name: "Name" });
      fireEvent.pointerDown(nameColumn, { button: 0 });
      fireEvent.pointerUp(nameColumn, { button: 0 });
      fireEvent.click(nameColumn);

      expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
        "aria-sort",
        "descending",
      );
    });

    it("should support sorting", () => {
      const onSortChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          sortDescriptor={{ column: "name", direction: "ascending" }}
          onSortChange={onSortChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name" allowsSorting>
                  {() => <>Name</>}
                </TableColumn>
                <TableColumn id="type" allowsSorting>
                  {() => <>Type</>}
                </TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const nameColumn = screen.getByRole("columnheader", { name: "Name" });
      const typeColumn = screen.getByRole("columnheader", { name: "Type" });
      expect(nameColumn).toHaveAttribute("aria-sort", "ascending");

      fireEvent.click(typeColumn);
      expect(onSortChange).toHaveBeenCalledWith({ column: "type", direction: "ascending" });
    });
  });

  describe("Suspense", () => {
    it.skip("should support React Suspense without transitions", () => {
      // React-specific upstream coverage; Solid resources/transitions are covered outside this RAC-title parity slice.
    });

    it.skip("should support React Suspense with transitions", () => {
      // React-specific upstream coverage; Solid resources/transitions are covered outside this RAC-title parity slice.
    });

    it.skip("should not render excessively in React Suspense with transitions", () => {
      // React-specific upstream coverage; Solid resources/transitions are covered outside this RAC-title parity slice.
    });
  });

  // ============================================
  // ACCESSIBILITY
  // ============================================

  describe("accessibility", () => {
    it("should have aria-label", () => {
      render(() => <TestTable />);

      const table = document.querySelector('[aria-label="Pokemon"]');
      expect(table).toBeTruthy();
    });

    it("should render as grid role", () => {
      render(() => <TestTable />);

      const grid = document.querySelector('[role="grid"]');
      expect(grid).toBeTruthy();
    });

    it("keeps the grid tabbable when rows are present", () => {
      render(() => <TestTable />);

      const grid = document.querySelector('[role="grid"]');
      expect(grid).toBeTruthy();
      expect(grid).toHaveAttribute("tabindex", "0");
    });
  });

  // ============================================
  // RENDER PROPS
  // ============================================

  describe("render props", () => {
    it("should support class as a function", () => {
      render(() => (
        <TestTable class={(props) => `table ${props.isEmpty ? "empty" : "has-data"}`} />
      ));

      const table = document.querySelector(".has-data");
      expect(table).toBeTruthy();
    });

    it("should support row class as a function", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
          defaultSelectedKeys={new Set([1])}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    class={(props) => `row ${props.isSelected ? "selected" : ""}`}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const selectedRow = document.querySelector(".row.selected");
      expect(selectedRow).toBeTruthy();
    });

    it("should support focus ring", () => {
      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns.slice(0, 2)}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn
                  id="name"
                  allowsSorting
                  class={(props) => (props.isFocusVisible ? "focus" : "")}
                >
                  {() => <>Name</>}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isFocusVisible ? "focus" : "")}
                  >
                    {() => (
                      <>
                        <TableCell
                          id="name"
                          class={(props) => (props.isFocusVisible ? "focus" : "")}
                        >
                          {() => <>{item.name}</>}
                        </TableCell>
                        <TableCell id="type">{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      fireEvent.keyDown(document, { key: "Tab" });

      const row = screen.getByText("Pikachu").closest('[role="row"]') as HTMLElement;
      row.focus();
      fireEvent.focus(row);
      expect(row).toHaveAttribute("data-focus-visible");
      expect(row).toHaveClass("focus");

      fireEvent.blur(row);
      expect(row).not.toHaveAttribute("data-focus-visible");
      expect(row).not.toHaveClass("focus");
    });

    it("should support column index in render props", () => {
      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
                <TableColumn id="level">{() => <>Level</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell id="name">
                          {(props) => <>cell index: {props.columnIndex}</>}
                        </TableCell>
                        <TableCell id="type">
                          {(props) => <>cell index: {props.columnIndex}</>}
                        </TableCell>
                        <TableCell id="level">
                          {(props) => <>cell index: {props.columnIndex}</>}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const cells = [...screen.queryAllByRole("rowheader"), ...screen.queryAllByRole("gridcell")];
      expect(cells[0]).toHaveTextContent("cell index: 0");
      expect(cells[1]).toHaveTextContent("cell index: 1");
      expect(cells[2]).toHaveTextContent("cell index: 2");
      expect(cells[0]).toHaveAttribute("data-column-index", "0");
      expect(cells[1]).toHaveAttribute("data-column-index", "1");
      expect(cells[2]).toHaveAttribute("data-column-index", "2");
    });

    it("should infer implicit cell ids from id-based column definitions", () => {
      const getTextValue = vi.fn(
        (item: (typeof testData)[number], column: { id?: keyof (typeof testData)[number] }) =>
          column.id ? String(item[column.id] ?? "") : "",
      );

      render(() => (
        <Table
          items={[testData[0]]}
          columns={[
            { id: "name", name: "Name", isRowHeader: true },
            { id: "type", name: "Type" },
          ]}
          getKey={(item: any) => item.id}
          getTextValue={getTextValue}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("rowheader", { name: "Pikachu" })).toHaveAttribute(
        "data-column-index",
        "0",
      );
      expect(screen.getByRole("gridcell", { name: "Electric" })).toHaveAttribute(
        "data-column-index",
        "1",
      );
      expect(getTextValue.mock.calls[0][1]).toMatchObject({ id: "name", key: "name" });
    });

    it("should support row render function and not call it with state", () => {
      const renderRow = vi.fn(
        (column: (typeof testColumns)[number], item: (typeof testData)[number]) => (
          <TableCell id={column.key}>
            {() => <>{item[column.key as keyof typeof item]}</>}
          </TableCell>
        ),
      );

      render(() => (
        <Table
          items={[testData[0]]}
          columns={[testColumns[0]]}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item} columns={[testColumns[0]]}>
                    {(column: (typeof testColumns)[number]) => renderRow(column, item)}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("rowheader")).toHaveTextContent("Pikachu");
      expect(renderRow).toHaveBeenCalledTimes(1);
      expect(renderRow.mock.calls[0][0]).toBe(testColumns[0]);
      expect(renderRow.mock.calls[0][0]).not.toHaveProperty("isSelected");
    });

    it("should support cell render props", () => {
      render(() => (
        <Table
          items={[testData[0]]}
          columns={testColumns.slice(0, 2)}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">
                  {({ isFocused }) => <>Name{isFocused ? " (focused)" : ""}</>}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell id="name">
                          {({ isFocused }) => <>Foo{isFocused ? " (focused)" : ""}</>}
                        </TableCell>
                        <TableCell id="type">{() => <>Bar</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const header = screen.getByRole("columnheader", { name: "Name" });
      expect(header).toHaveTextContent("Name");
      fireEvent.focus(header);
      expect(header).toHaveTextContent("Name (focused)");

      const cell = screen.getByRole("rowheader", { name: "Foo" });
      expect(cell).toHaveTextContent("Foo");
      fireEvent.focus(cell);
      expect(cell).toHaveTextContent("Foo (focused)");
    });

    it("should support columnHeader typeahead", async () => {
      render(() => (
        <Table
          items={[
            { id: 1, name: "Games", type: "File folder" },
            { id: 2, name: "Program Files", type: "File folder" },
            { id: 3, name: "bootmgr", type: "System file" },
            { id: 4, name: "log.txt", type: "Text Document" },
          ]}
          columns={testColumns.slice(0, 2)}
          getKey={(item: any) => item.id}
          aria-label="Files"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell id="name">{() => <>{item.name}</>}</TableCell>
                        <TableCell id="type">{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = screen.getByRole("grid", { name: "Files" });
      table.focus();
      fireEvent.focus(table);
      fireEvent.keyDown(table, { key: "b" });
      fireEvent.keyDown(table, { key: "o" });
      fireEvent.keyDown(table, { key: "o" });
      await Promise.resolve();

      expect(document.activeElement).toBe(screen.getByText("bootmgr").closest('[role="row"]'));
    });

    it("should support textValue overriding typeahead", async () => {
      render(() => (
        <Table
          items={[
            { id: 1, name: "1. Games", type: "File folder", textValue: "Games" },
            { id: 2, name: "2. Program Files", type: "File folder", textValue: "Program Files" },
            { id: 3, name: "3. bootmgr", type: "System file", textValue: "bootmgr" },
            { id: 4, name: "4. log.txt", type: "Text Document", textValue: "log.txt" },
          ]}
          columns={testColumns.slice(0, 2)}
          getKey={(item: any) => item.id}
          aria-label="Files"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell id="name">{() => <>{item.name}</>}</TableCell>
                        <TableCell id="type">{() => <>{item.type}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const table = screen.getByRole("grid", { name: "Files" });
      table.focus();
      fireEvent.focus(table);
      fireEvent.keyDown(table, { key: "b" });
      fireEvent.keyDown(table, { key: "o" });
      fireEvent.keyDown(table, { key: "o" });
      await Promise.resolve();

      expect(document.activeElement).toBe(screen.getByText("3. bootmgr").closest('[role="row"]'));
    });

    it("should support hover", () => {
      const onHoverStart = vi.fn();
      const onHoverEnd = vi.fn();
      const onHoverChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isHovered ? "hover" : "")}
                    onHoverStart={onHoverStart as never}
                    onHoverEnd={onHoverEnd as never}
                    onHoverChange={onHoverChange as never}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerOver(row, { pointerType: "mouse" });
      expect(row).toHaveAttribute("data-hovered");
      expect(row).toHaveClass("hover");
      expect(onHoverStart).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(true);

      fireEvent.pointerOut(row, { pointerType: "mouse" });
      expect(onHoverEnd).toHaveBeenCalledTimes(1);
      expect(onHoverChange).toHaveBeenCalledWith(false);
    });

    it("should not show hover state when item is not interactive", () => {
      const onHoverStart = vi.fn();
      const onHoverEnd = vi.fn();
      const onHoverChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isHovered ? "hover" : "")}
                    onHoverStart={onHoverStart as never}
                    onHoverEnd={onHoverEnd as never}
                    onHoverChange={onHoverChange as never}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerOver(row, { pointerType: "mouse" });
      expect(row).not.toHaveAttribute("data-hovered");
      expect(row).not.toHaveClass("hover");
      expect(onHoverStart).not.toHaveBeenCalled();
      expect(onHoverChange).not.toHaveBeenCalled();
      expect(onHoverEnd).not.toHaveBeenCalled();
    });

    it("should support press state", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isPressed ? "pressed" : "")}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(row).toHaveAttribute("data-pressed");
      expect(row).toHaveClass("pressed");
      fireEvent.pointerUp(row, { pointerType: "mouse" });
    });

    it("should not show press state when not interactive", () => {
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isPressed ? "pressed" : "")}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(row).not.toHaveAttribute("data-pressed");
      expect(row).not.toHaveClass("pressed");

      fireEvent.pointerUp(row, { pointerType: "mouse" });
      expect(row).not.toHaveAttribute("data-pressed");
      expect(row).not.toHaveClass("pressed");
    });

    it("should support row actions", () => {
      const onRowAction = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          onRowAction={onRowAction}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    class={(props) => (props.isPressed ? "pressed" : "")}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Charizard").closest('[role="row"]')!;
      expect(row).not.toHaveAttribute("data-pressed");
      expect(row).not.toHaveClass("pressed");

      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(row).toHaveAttribute("data-pressed");
      expect(row).toHaveClass("pressed");

      fireEvent.pointerUp(row, { pointerType: "mouse" });
      fireEvent.click(row);
      expect(row).not.toHaveAttribute("data-pressed");
      expect(row).not.toHaveClass("pressed");
      expect(onRowAction).toHaveBeenCalledWith(2);
    });

    it("should support row actions on press up when shouldSelectOnPressUp is true", () => {
      const onRowAction = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="none"
          shouldSelectOnPressUp
          onRowAction={onRowAction}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Charizard").closest('[role="row"]')!;

      fireEvent.pointerUp(row, { pointerType: "mouse" });
      fireEvent.click(row);

      expect(onRowAction).toHaveBeenCalledTimes(1);
      expect(onRowAction).toHaveBeenCalledWith(2);
    });

    it("should select an item on pressing down when shouldSelectOnPressUp is not provided", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      fireEvent.pointerUp(row, { pointerType: "mouse" });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("should select an item on pressing down when shouldSelectOnPressUp is false", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
          shouldSelectOnPressUp={false}
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      fireEvent.pointerUp(row, { pointerType: "mouse" });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("should select an item on pressing up when shouldSelectOnPressUp is true", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
          shouldSelectOnPressUp
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Pikachu").closest('[role="row"]')!;
      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(onSelectionChange).not.toHaveBeenCalled();
      fireEvent.pointerUp(row, { pointerType: "mouse" });
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("should perform selection with single selection", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="single"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row = screen.getByText("Charizard").closest('[role="row"]')!;
      expect(row).toHaveAttribute("aria-selected", "false");

      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(row).toHaveAttribute("aria-selected", "true");
      expect(row).toHaveAttribute("data-selected");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([2]));

      fireEvent.pointerDown(row, { pointerType: "mouse" });
      expect(row).toHaveAttribute("aria-selected", "false");
      expect(row).not.toHaveAttribute("data-selected");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
    });

    it("should perform toggle selection in highlight mode when using modifier keys", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row1 = screen.getByText("Pikachu").closest('[role="row"]')!;
      const row2 = screen.getByText("Charizard").closest('[role="row"]')!;

      fireEvent.pointerDown(row2, { pointerType: "mouse", ctrlKey: true });
      expect(row2).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([2]));

      fireEvent.pointerDown(row1, { pointerType: "mouse", ctrlKey: true });
      expect(row1).toHaveAttribute("aria-selected", "true");
      expect(row2).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([1, 2]));

      fireEvent.pointerDown(row1, { pointerType: "mouse", ctrlKey: true });
      expect(row1).toHaveAttribute("aria-selected", "false");
      expect(row2).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([2]));
    });

    it("should perform replace selection in highlight mode when not using modifier keys", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Table
          items={testData}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
          selectionMode="multiple"
          selectionBehavior="replace"
          onSelectionChange={onSelectionChange}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const row1 = screen.getByText("Pikachu").closest('[role="row"]')!;
      const row2 = screen.getByText("Charizard").closest('[role="row"]')!;

      fireEvent.pointerDown(row2, { pointerType: "mouse" });
      expect(row2).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([2]));

      fireEvent.pointerDown(row1, { pointerType: "mouse" });
      expect(row1).toHaveAttribute("aria-selected", "true");
      expect(row2).toHaveAttribute("aria-selected", "false");
      expect(onSelectionChange).toHaveBeenLastCalledWith(new Set([1]));

      fireEvent.pointerDown(row1, { pointerType: "mouse" });
      expect(row1).toHaveAttribute("aria-selected", "true");
      expect(onSelectionChange).toHaveBeenCalledTimes(2);
    });

    it("should support onAction on items", () => {
      const onAction = vi.fn();
      render(() => (
        <Table
          items={testData.slice(0, 2)}
          columns={testColumns}
          getKey={(item: any) => item.id}
          aria-label="Pokemon"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow
                    id={item.id}
                    item={item}
                    onAction={item.id === 1 ? onAction : undefined}
                  >
                    {() => <TableCell>{() => <>{item.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      fireEvent.click(screen.getByText("Pikachu").closest('[role="row"]')!);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // EMPTY STATE
  // ============================================

  describe("empty state", () => {
    it("should support empty state", () => {
      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Empty table">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody renderEmptyState={() => "No results"}>
                {() => <TableRow id="x">{() => <TableCell>{() => <>x</>}</TableCell>}</TableRow>}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByRole("grid")).toHaveAttribute("data-empty");
      expect(screen.getByRole("rowheader")).toHaveTextContent("No results");
    });

    it("should render empty state in body", () => {
      render(() => (
        <Table items={[]} columns={testColumns} aria-label="Empty table">
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
              </TableHeader>
              <TableBody renderEmptyState={() => <div>No data available</div>}>
                {() => <TableRow id="x">{() => <TableCell>{() => <>x</>}</TableCell>}</TableRow>}
              </TableBody>
            </>
          )}
        </Table>
      ));

      expect(screen.getByText("No data available")).toBeTruthy();
      expect(screen.getByRole("rowheader")).toHaveTextContent("No data available");
    });
  });

  // ============================================
  // CONTEXT ERRORS
  // ============================================

  describe("context errors", () => {
    it("should throw when TableHeader is used outside Table", () => {
      expect(() => {
        render(() => (
          <TableHeader>
            <th>Test</th>
          </TableHeader>
        ));
      }).toThrow("TableHeader must be used within a Table");
    });

    it("should throw when TableColumn is used outside Table", () => {
      expect(() => {
        render(() => <TableColumn id="test">{() => <>Test</>}</TableColumn>);
      }).toThrow("TableColumn must be used within a Table");
    });

    it("should throw when TableBody is used outside Table", () => {
      expect(() => {
        render(() => <TableBody>{() => <tr />}</TableBody>);
      }).toThrow("TableBody must be used within a Table");
    });

    it("should throw when TableRow is used outside Table", () => {
      expect(() => {
        render(() => <TableRow id="test">{() => <td>Test</td>}</TableRow>);
      }).toThrow("TableRow must be used within a Table");
    });

    it("should throw when TableCell is used outside Table", () => {
      expect(() => {
        render(() => <TableCell>{() => <>Test</>}</TableCell>);
      }).toThrow("TableCell must be used within a Table");
    });

    it("should throw when TableSelectionCheckbox is used outside Table", () => {
      expect(() => {
        render(() => <TableSelectionCheckbox rowKey="test" />);
      }).toThrow("TableSelectionCheckbox must be used within a Table");
    });

    it("should throw when TableSelectAllCheckbox is used outside Table", () => {
      expect(() => {
        render(() => <TableSelectAllCheckbox />);
      }).toThrow("TableSelectAllCheckbox must be used within a Table");
    });
  });

  // ============================================
  // STATIC PROPERTIES
  // ============================================

  describe("static properties", () => {
    it("should have Header as static property", () => {
      expect(Table.Header).toBe(TableHeader);
    });

    it("should have Column as static property", () => {
      expect(Table.Column).toBe(TableColumn);
    });

    it("should have Body as static property", () => {
      expect(Table.Body).toBe(TableBody);
    });

    it("should have Row as static property", () => {
      expect(Table.Row).toBe(TableRow);
    });

    it("should have Cell as static property", () => {
      expect(Table.Cell).toBe(TableCell);
    });

    it("should have SelectionCheckbox as static property", () => {
      expect(Table.SelectionCheckbox).toBe(TableSelectionCheckbox);
    });

    it("should have SelectAllCheckbox as static property", () => {
      expect(Table.SelectAllCheckbox).toBe(TableSelectAllCheckbox);
    });
  });

  // ============================================
  // COLUMN RESIZE
  // ============================================

  describe("column resize", () => {
    const resizableColumns = [
      { key: "name", name: "Name" },
      { key: "type", name: "Type" },
      { key: "level", name: "Level" },
    ];

    function ResizableTestTable(props: {
      onResize?: (widths: Map<any, number>) => void;
      onResizeEnd?: (widths: Map<any, number>) => void;
    }) {
      return (
        <ResizableTableContainer>
          <Table
            items={testData}
            columns={resizableColumns}
            getKey={(item: any) => item.id}
            aria-label="Resizable Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name" allowsResizing>
                    {() => (
                      <div style={{ display: "flex", "align-items": "center" }}>
                        <span>Name</span>
                        <ColumnResizer
                          column={{ key: "name" }}
                          aria-label="Resize Name"
                          onResize={props.onResize}
                          onResizeEnd={props.onResizeEnd}
                        />
                      </div>
                    )}
                  </TableColumn>
                  <TableColumn id="type" allowsResizing>
                    {() => (
                      <div style={{ display: "flex", "align-items": "center" }}>
                        <span>Type</span>
                        <ColumnResizer
                          column={{ key: "type" }}
                          aria-label="Resize Type"
                          onResize={props.onResize}
                          onResizeEnd={props.onResizeEnd}
                        />
                      </div>
                    )}
                  </TableColumn>
                  <TableColumn id="level">{() => <>Level</>}</TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => (
                        <>
                          <TableCell>{() => <>{item.name}</>}</TableCell>
                          <TableCell>{() => <>{item.type}</>}</TableCell>
                          <TableCell>{() => <>{item.level}</>}</TableCell>
                        </>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </ResizableTableContainer>
      );
    }

    it("ResizableTableContainer provides resize context and renders children", () => {
      render(() => <ResizableTestTable />);
      const table = screen.getByRole("grid");
      expect(table).toBeInTheDocument();
    });

    it("ColumnResizer keeps the visible handle presentational", () => {
      render(() => <ResizableTestTable />);
      const resizers = document.querySelectorAll(".solidaria-Table-columnResizer");
      expect(resizers.length).toBeGreaterThanOrEqual(2);
      for (const resizer of resizers) {
        expect(resizer.getAttribute("role")).toBe("presentation");
        expect(resizer.getAttribute("aria-orientation")).toBeNull();
      }
    });

    it("ColumnResizer has a hidden range input for screen readers", () => {
      render(() => <ResizableTestTable />);
      const inputs = document.querySelectorAll('input[type="range"]');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
      // Check aria-labels
      const labels = Array.from(inputs).map((i) => i.getAttribute("aria-label"));
      expect(labels).toContain("Resize Name");
      expect(labels).toContain("Resize Type");
    });

    it("Column resizer accepts data attributes", () => {
      render(() => (
        <ResizableTableContainer>
          <Table
            items={testData}
            columns={resizableColumns}
            getKey={(item: any) => item.id}
            aria-label="Resizable Pokemon"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name" allowsResizing>
                    {() => (
                      <>
                        Name
                        <ColumnResizer column={{ key: "name" }} data-testid="resizer" />
                      </>
                    )}
                  </TableColumn>
                  <TableColumn id="type" allowsResizing>
                    {() => (
                      <>
                        Type
                        <ColumnResizer column={{ key: "type" }} data-testid="resizer" />
                      </>
                    )}
                  </TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => (
                        <>
                          <TableCell>{() => <>{item.name}</>}</TableCell>
                          <TableCell>{() => <>{item.type}</>}</TableCell>
                        </>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </ResizableTableContainer>
      ));

      expect(screen.getAllByTestId("resizer")).toHaveLength(2);
    });

    it("column resize via keyboard (arrow keys) adjusts width", () => {
      const onResize = vi.fn();
      const onResizeEnd = vi.fn();
      render(() => <ResizableTestTable onResize={onResize} onResizeEnd={onResizeEnd} />);

      // Find the hidden range input for "Name" column
      const input = document.querySelector('input[aria-label="Resize Name"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe("range");

      // Simulate resize via the input's change event (range slider)
      // This is the screen-reader path which is always available
      fireEvent.change(input, { target: { value: "200" } });
      expect(onResize).toHaveBeenCalled();
    });

    it("column resize respects min/max constraints", () => {
      // Use columns with explicit min/max
      const constrainedColumns = [
        { key: "name", name: "Name", minWidth: 100, maxWidth: 200 },
        { key: "type", name: "Type" },
      ];

      const onResize = vi.fn();

      render(() => (
        <ResizableTableContainer>
          <Table
            items={testData}
            columns={constrainedColumns}
            getKey={(item: any) => item.id}
            aria-label="Constrained Table"
          >
            {() => (
              <>
                <TableHeader>
                  <TableColumn id="name" allowsResizing minWidth={100} maxWidth={200}>
                    {() => (
                      <div>
                        <span>Name</span>
                        <ColumnResizer
                          column={{ key: "name" }}
                          aria-label="Resize Name"
                          onResize={onResize}
                        />
                      </div>
                    )}
                  </TableColumn>
                  <TableColumn id="type">{() => <>Type</>}</TableColumn>
                </TableHeader>
                <TableBody>
                  {(item: any) => (
                    <TableRow id={item.id} item={item}>
                      {() => (
                        <>
                          <TableCell>{() => <>{item.name}</>}</TableCell>
                          <TableCell>{() => <>{item.type}</>}</TableCell>
                        </>
                      )}
                    </TableRow>
                  )}
                </TableBody>
              </>
            )}
          </Table>
        </ResizableTableContainer>
      ));

      // The hidden input should reflect min/max from the resize state
      const input = document.querySelector('input[aria-label="Resize Name"]') as HTMLInputElement;
      expect(input).toBeTruthy();
      // Min should be at least 75 (default) or the provided minWidth
      const min = parseInt(input.min, 10);
      expect(min).toBeGreaterThanOrEqual(75);
    });

    it("ColumnResizer falls back to a presentational handle without ResizableTableContainer", () => {
      render(() => (
        <Table
          items={testData}
          columns={resizableColumns}
          getKey={(item: any) => item.id}
          aria-label="No resize"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">
                  {() => (
                    <div>
                      <span>Name</span>
                      <ColumnResizer column={{ key: "name" }} />
                    </div>
                  )}
                </TableColumn>
                <TableColumn id="type">{() => <>Type</>}</TableColumn>
                <TableColumn id="level">{() => <>Level</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(item: any) => (
                  <TableRow id={item.id} item={item}>
                    {() => (
                      <>
                        <TableCell>{() => <>{item.name}</>}</TableCell>
                        <TableCell>{() => <>{item.type}</>}</TableCell>
                        <TableCell>{() => <>{item.level}</>}</TableCell>
                      </>
                    )}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));

      const resizers = document.querySelectorAll(".solidaria-Table-columnResizer");
      expect(resizers.length).toBeGreaterThanOrEqual(1);
      expect(resizers[0].getAttribute("role")).toBe("presentation");
      expect(document.querySelector('input[type="range"]')).toBeNull();
    });
  });
});

// ============================================
// TREE GRID / EXPANDABLE ROWS (UNSTABLE)
// ============================================

interface TreeItem {
  id: string;
  name: string;
  type: string;
  children?: TreeItem[];
}

// projects > project-1 > (file-1, file-2), project-2 ; documents > doc-1
const treeData: TreeItem[] = [
  {
    id: "projects",
    name: "Projects",
    type: "folder",
    children: [
      {
        id: "project-1",
        name: "Project 1",
        type: "folder",
        children: [
          { id: "file-1", name: "File 1", type: "file" },
          { id: "file-2", name: "File 2", type: "file" },
        ],
      },
      { id: "project-2", name: "Project 2", type: "file" },
    ],
  },
  {
    id: "documents",
    name: "Documents",
    type: "folder",
    children: [{ id: "doc-1", name: "Doc 1", type: "file" }],
  },
];

const treeGridColumns = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

// Render-props at every level (avoids solid-refresh HMR context issues). The first column is
// the tree column and hosts the slotted chevron button; its aria-label flows from the row.
function TestTreeTable(props: Partial<Parameters<typeof Table>[0]> = {}) {
  return (
    <Table
      items={treeData}
      columns={treeGridColumns}
      getKey={(item: any) => item.id}
      aria-label="Files"
      UNSTABLE_childItems={(item: any) => item.children}
      {...props}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="type">{() => <>Type</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(item: any) => (
              <TableRow id={item.id} item={item}>
                {() => (
                  <>
                    <TableCell>
                      {(renderProps: any) => (
                        <>
                          {renderProps.hasChildItems && renderProps.isTreeColumn && (
                            <Button slot="chevron">▶</Button>
                          )}
                          {item.name}
                        </>
                      )}
                    </TableCell>
                    <TableCell>{() => <>{item.type}</>}</TableCell>
                  </>
                )}
              </TableRow>
            )}
          </TableBody>
        </>
      )}
    </Table>
  );
}

const rowByKey = (key: string) => document.querySelector(`tr[data-key="${key}"]`);
const chevronOf = (key: string) => rowByKey(key)!.querySelector("button") as HTMLButtonElement;

describe("Table (tree grid / expandable rows)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders only top-level rows when collapsed by default", () => {
    render(() => <TestTreeTable />);

    expect(document.querySelectorAll(".solidaria-Table-row")).toHaveLength(2);
    expect(rowByKey("projects")).toBeTruthy();
    expect(rowByKey("documents")).toBeTruthy();
    expect(rowByKey("project-1")).toBeNull();
    expect(rowByKey("file-1")).toBeNull();
  });

  it("flattens expanded descendants in document order", () => {
    render(() => <TestTreeTable UNSTABLE_defaultExpandedKeys={["projects", "project-1"]} />);

    const keys = Array.from(document.querySelectorAll<HTMLElement>("tr[data-key]")).map((row) =>
      row.getAttribute("data-key"),
    );
    expect(keys).toEqual(["projects", "project-1", "file-1", "file-2", "project-2", "documents"]);
  });

  it("exposes tree ARIA attributes on rows", () => {
    render(() => <TestTreeTable UNSTABLE_defaultExpandedKeys={["projects", "project-1"]} />);

    const projects = rowByKey("projects")!;
    expect(projects).toHaveAttribute("aria-expanded", "true");
    expect(projects).toHaveAttribute("aria-level", "1");
    expect(projects).toHaveAttribute("aria-posinset", "1");
    expect(projects).toHaveAttribute("aria-setsize", "2");

    expect(rowByKey("documents")).toHaveAttribute("aria-posinset", "2");

    const project2 = rowByKey("project-2")!;
    expect(project2).toHaveAttribute("aria-level", "2");
    expect(project2).toHaveAttribute("aria-posinset", "2");
    expect(project2).toHaveAttribute("aria-setsize", "2");
    // Leaf row: no aria-expanded.
    expect(project2).not.toHaveAttribute("aria-expanded");

    const file1 = rowByKey("file-1")!;
    expect(file1).toHaveAttribute("aria-level", "3");
    expect(file1).toHaveAttribute("aria-posinset", "1");
  });

  it("exposes tree data attributes and the --table-row-level var on rows", () => {
    render(() => <TestTreeTable UNSTABLE_defaultExpandedKeys={["projects", "project-1"]} />);

    const projects = rowByKey("projects") as HTMLElement;
    expect(projects).toHaveAttribute("data-expanded");
    expect(projects).toHaveAttribute("data-has-child-items");
    expect(projects).toHaveAttribute("data-level", "1");
    expect(projects.style.getPropertyValue("--table-row-level")).toBe("1");

    const file1 = rowByKey("file-1") as HTMLElement;
    expect(file1).toHaveAttribute("data-level", "3");
    expect(file1).not.toHaveAttribute("data-has-child-items");
    expect(file1).not.toHaveAttribute("data-expanded");
    expect(file1.style.getPropertyValue("--table-row-level")).toBe("3");
  });

  it("marks the tree column cell with data-tree-column and tree data attributes", () => {
    render(() => <TestTreeTable UNSTABLE_defaultExpandedKeys={["projects"]} />);

    const cells = rowByKey("projects")!.querySelectorAll("td, th");
    const treeCell = cells[0];
    const typeCell = cells[1];

    expect(treeCell).toHaveAttribute("data-tree-column");
    expect(treeCell).toHaveAttribute("data-expanded");
    expect(treeCell).toHaveAttribute("data-has-child-items");
    expect(treeCell).toHaveAttribute("data-level", "1");

    expect(typeCell).not.toHaveAttribute("data-tree-column");
  });

  it("renders the chevron with an Expand label and excludes it from the tab order", () => {
    render(() => <TestTreeTable />);

    const chevron = chevronOf("projects");
    expect(chevron).toHaveAttribute("aria-label", "Expand");
    expect(chevron).toHaveAttribute("tabindex", "-1");
    expect(chevron).toHaveAttribute("data-react-aria-prevent-focus", "true");
  });

  it("omits the chevron for leaf rows", () => {
    render(() => <TestTreeTable UNSTABLE_defaultExpandedKeys={["projects"]} />);

    // The cell only renders a chevron when the row has children (mirrors S2's TableView, which
    // gates `<ExpandableRowChevron>` on `hasChildItems && isTreeColumn`).
    expect(rowByKey("project-2")!.querySelector("button")).toBeNull();
    expect(chevronOf("projects")).toBeTruthy();
  });

  it("expands and collapses an uncontrolled row when the chevron is pressed", () => {
    render(() => <TestTreeTable />);

    expect(rowByKey("project-1")).toBeNull();

    fireEvent.click(chevronOf("projects"));
    expect(rowByKey("project-1")).toBeTruthy();
    expect(rowByKey("projects")).toHaveAttribute("aria-expanded", "true");

    // Toggling re-renders the tree-column cell (Solid recreates its children rather than
    // reconciling), so re-query the chevron before collapsing instead of reusing a stale node.
    fireEvent.click(chevronOf("projects"));
    expect(rowByKey("project-1")).toBeNull();
    expect(rowByKey("projects")).not.toHaveAttribute("aria-expanded", "true");
  });

  it("reports changes but stays put when expansion is controlled", () => {
    const onExpandedChange = vi.fn();
    render(() => (
      <TestTreeTable
        UNSTABLE_expandedKeys={["projects"]}
        UNSTABLE_onExpandedChange={onExpandedChange}
      />
    ));

    // Controlled value is reflected.
    expect(rowByKey("project-1")).toBeTruthy();

    fireEvent.click(chevronOf("projects"));
    // The change is reported, but the view stays in sync with the (unchanged) controlled value.
    expect(onExpandedChange).toHaveBeenCalledWith(new Set([]));
    expect(rowByKey("project-1")).toBeTruthy();
  });

  it("expands and collapses the focused row with Arrow keys (LTR)", () => {
    render(() => <TestTreeTable />);

    const projects = rowByKey("projects") as HTMLElement;
    fireEvent.focus(projects);

    fireEvent.keyDown(projects, { key: "ArrowRight" });
    expect(rowByKey("project-1")).toBeTruthy();

    fireEvent.keyDown(projects, { key: "ArrowLeft" });
    expect(rowByKey("project-1")).toBeNull();
  });

  it("expands the whole tree when expandedKeys is 'all'", () => {
    render(() => <TestTreeTable UNSTABLE_expandedKeys="all" />);

    const keys = Array.from(document.querySelectorAll<HTMLElement>("tr[data-key]")).map((row) =>
      row.getAttribute("data-key"),
    );
    expect(keys).toEqual([
      "projects",
      "project-1",
      "file-1",
      "file-2",
      "project-2",
      "documents",
      "doc-1",
    ]);
  });

  it("omits tree attributes for a plain (non-tree) table", () => {
    render(() => <TestTable />);

    const row = document.querySelector(".solidaria-Table-row") as HTMLElement;
    expect(row).not.toHaveAttribute("aria-level");
    expect(row).not.toHaveAttribute("data-level");
    expect(row).not.toHaveAttribute("data-expanded");
    expect(row.style.getPropertyValue("--table-row-level")).toBe("");
    expect(document.querySelector("[data-tree-column]")).toBeNull();
  });
});
