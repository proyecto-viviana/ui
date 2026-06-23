import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import {
  Cell,
  Column,
  Footer,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableFooter,
  TableHeader,
  TableRow,
  TableView,
} from "../src/table";

interface Person {
  id: string;
  name: string;
  role: string;
  status: string;
}

const columns = [
  { key: "name", name: "Name" },
  { key: "role", name: "Role" },
  { key: "status", name: "Status" },
];

const rows: Person[] = [
  { id: "alice", name: "Alice", role: "Engineer", status: "Active" },
  { id: "bob", name: "Bob", role: "Designer", status: "Paused" },
  { id: "carol", name: "Carol", role: "Manager", status: "Active" },
];

function normalizeKeys(keys: "all" | Set<unknown>) {
  return keys === "all" ? new Set(rows.map((row) => row.id)) : new Set(Array.from(keys, String));
}

const pointerEvent = createPointerEvent;

function pressWithMouse(target: HTMLElement, init: Record<string, unknown> = {}): void {
  const pointerInit = { pointerId: 1, pointerType: "mouse", ...init };
  fireEvent(target, pointerEvent("pointerdown", pointerInit));
  fireEvent(target, pointerEvent("pointerup", pointerInit));
  fireEvent.click(target, init);
}

function TestTable(props: {
  density?: "compact" | "regular" | "spacious";
  size?: "sm" | "md" | "lg";
  isQuiet?: boolean;
  overflowMode?: "truncate" | "wrap";
  selectionMode?: "none" | "single" | "multiple";
  defaultSelectedKeys?: Iterable<string>;
  disabledKeys?: Iterable<string>;
  items?: Person[];
}) {
  const data = props.items ?? rows;

  return (
    <Table
      aria-label="People"
      items={data}
      columns={columns}
      getKey={(row) => row.id}
      getTextValue={(row, column) => String(row[column.key as keyof Person] ?? "")}
      density={props.density}
      size={props.size}
      isQuiet={props.isQuiet}
      overflowMode={props.overflowMode}
      selectionMode={props.selectionMode}
      defaultSelectedKeys={props.defaultSelectedKeys}
      disabledKeys={props.disabledKeys}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name" allowsSorting>
              {() => <>Name</>}
            </TableColumn>
            <TableColumn id="role" align="center">
              {() => <>Role</>}
            </TableColumn>
            <TableColumn id="status" align="end">
              {() => <>Status</>}
            </TableColumn>
          </TableHeader>
          <TableBody>
            {(row) => (
              <TableRow id={row.id} item={row}>
                {() => (
                  <>
                    <TableCell>{() => <>{row.name}</>}</TableCell>
                    <TableCell align="center">{() => <>{row.role}</>}</TableCell>
                    <TableCell align="right">{() => <>{row.status}</>}</TableCell>
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

function HighlightTable(props: {
  selectedKeys: Iterable<string>;
  selectionStyle?: "checkbox" | "highlight";
}) {
  return (
    <Table
      aria-label="People"
      items={rows}
      columns={columns}
      getKey={(row) => row.id}
      selectionMode="multiple"
      selectionStyle={props.selectionStyle ?? "highlight"}
      defaultSelectedKeys={props.selectedKeys}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="role">{() => <>Role</>}</TableColumn>
            <TableColumn id="status">{() => <>Status</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(row) => (
              <TableRow id={row.id} item={row}>
                {() => (
                  <>
                    <TableCell>{() => <>{row.name}</>}</TableCell>
                    <TableCell>{() => <>{row.role}</>}</TableCell>
                    <TableCell>{() => <>{row.status}</>}</TableCell>
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

describe("TableView (solid-spectrum)", () => {
  afterEach(() => cleanup());

  it("exports the public TableView aliases", () => {
    expect(TableView).toBe(Table);
    expect(Column).toBe(TableColumn);
    expect(Footer).toBe(TableFooter);
    expect(Row).toBe(TableRow);
    expect(Cell).toBe(TableCell);
  });

  it("renders S2 table semantics and stable root state", () => {
    render(() => (
      <TestTable selectionMode="multiple" defaultSelectedKeys={["alice"]} disabledKeys={["bob"]} />
    ));

    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid).toHaveAttribute("data-table-view");
    expect(grid).toHaveAttribute("data-density", "regular");
    expect(grid).toHaveAttribute("data-overflow-mode", "truncate");
    expect(grid).not.toHaveAttribute("data-quiet");

    expect(screen.getAllByRole("columnheader")).toHaveLength(4);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute(
      "data-sortable",
      "true",
    );

    const selectAll = screen.getByRole("checkbox", { name: "Select All" });
    expect(selectAll).toHaveAttribute("data-indeterminate", "true");
    expect(selectAll).not.toHaveAttribute("aria-checked");
    expect((selectAll as HTMLInputElement).indeterminate).toBe(true);

    const alice = screen.getByRole("row", { name: /Alice/ });
    const bob = screen.getByRole("row", { name: /Bob/ });
    expect(alice).toHaveAttribute("data-selected", "true");
    expect(within(alice).getByRole("checkbox", { name: "Select" })).toBeChecked();
    expect(bob).toHaveAttribute("aria-disabled", "true");
  });

  it("maps S2 density, quiet, and overflow props onto the table", () => {
    render(() => (
      <TestTable
        density="spacious"
        isQuiet
        overflowMode="wrap"
        selectionMode="none"
        defaultSelectedKeys={[]}
      />
    ));

    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid).toHaveAttribute("data-density", "spacious");
    expect(grid).toHaveAttribute("data-quiet", "true");
    expect(grid).toHaveAttribute("data-overflow-mode", "wrap");
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("keeps legacy size as a density alias without changing quiet styling", () => {
    render(() => <TestTable size="sm" selectionMode="none" />);
    expect(screen.getByRole("grid", { name: "People" })).toHaveAttribute("data-density", "compact");

    cleanup();

    render(() => <TestTable size="lg" selectionMode="none" />);
    expect(screen.getByRole("grid", { name: "People" })).toHaveAttribute(
      "data-density",
      "spacious",
    );

    cleanup();

    render(() => <TestTable selectionMode="none" />);
    expect(screen.getByRole("grid", { name: "People" })).toHaveAttribute("data-density", "regular");
  });

  it("supports controlled multiple selection with S2 toggle behavior by default", () => {
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["alice"]));

      return (
        <Table
          aria-label="People"
          items={rows}
          columns={columns}
          getKey={(row) => row.id}
          selectionMode="multiple"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="role">{() => <>Role</>}</TableColumn>
                <TableColumn id="status">{() => <>Status</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(row) => (
                  <TableRow id={row.id} item={row}>
                    {() => (
                      <>
                        <TableCell>{() => <>{row.name}</>}</TableCell>
                        <TableCell>{() => <>{row.role}</>}</TableCell>
                        <TableCell>{() => <>{row.status}</>}</TableCell>
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

    render(() => <Demo />);

    const alice = screen.getByRole("row", { name: /Alice/ });
    const bob = screen.getByRole("row", { name: /Bob/ });
    expect(alice).toHaveAttribute("data-selected", "true");

    pressWithMouse(bob);

    expect(alice).toHaveAttribute("data-selected", "true");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["alice", "bob"]));

    pressWithMouse(alice);

    expect(alice).not.toHaveAttribute("data-selected");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["bob"]));
  });

  it("defaults to checkbox selection style with toggle behavior", () => {
    render(() => <TestTable selectionMode="multiple" defaultSelectedKeys={["alice"]} />);

    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid).toHaveAttribute("data-selection-style", "checkbox");
    // Select-all and per-row checkboxes remain in the default checkbox style.
    expect(screen.getByRole("checkbox", { name: "Select All" })).toBeTruthy();
    const alice = screen.getByRole("row", { name: /Alice/ });
    expect(within(alice).getByRole("checkbox", { name: "Select" })).toBeTruthy();
  });

  it("supports highlight selection with replace behavior and no checkboxes", () => {
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["alice"]));

      return (
        <Table
          aria-label="People"
          items={rows}
          columns={columns}
          getKey={(row) => row.id}
          selectionMode="multiple"
          selectionStyle="highlight"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="role">{() => <>Role</>}</TableColumn>
                <TableColumn id="status">{() => <>Status</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(row) => (
                  <TableRow id={row.id} item={row}>
                    {() => (
                      <>
                        <TableCell>{() => <>{row.name}</>}</TableCell>
                        <TableCell>{() => <>{row.role}</>}</TableCell>
                        <TableCell>{() => <>{row.status}</>}</TableCell>
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

    render(() => <Demo />);

    const grid = screen.getByRole("grid", { name: "People" });
    expect(grid).toHaveAttribute("data-selection-style", "highlight");
    // Highlight selection drops both the select-all column and per-row checkboxes.
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);

    const alice = screen.getByRole("row", { name: /Alice/ });
    const bob = screen.getByRole("row", { name: /Bob/ });
    expect(alice).toHaveAttribute("data-selected", "true");

    // Replace behavior: clicking another row replaces the selection rather than adding to it.
    pressWithMouse(bob);

    expect(alice).not.toHaveAttribute("data-selected");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["bob"]));
  });

  it("injects the highlight-selection block overlay and tags only highlight rows", () => {
    render(() => <HighlightTable selectedKeys={["alice"]} />);

    // The rounded blue block border can't be expressed by the style() macro
    // (it's a pseudo-element), so it's injected once as a shared stylesheet that
    // reads the per-row custom properties the macro sets.
    const styleEl = document.getElementById("solid-spectrum-table-highlight-selection-style");
    expect(styleEl).not.toBeNull();
    const css = styleEl?.textContent ?? "";
    expect(css).toContain(".solid-spectrum-table-highlight-selection::before");
    expect(css).toContain("border-color: var(--borderColor)");
    expect(css).toContain("border-start-start-radius: var(--borderTopRadius)");
    expect(css).toContain("border-end-start-radius: var(--borderBottomRadius)");

    const alice = screen.getByRole("row", { name: /Alice/ });
    expect(alice.className).toContain("solid-spectrum-table-highlight-selection");

    cleanup();

    // Checkbox mode never opts into the overlay class, so its ::before stays inert.
    render(() => <HighlightTable selectedKeys={["alice"]} selectionStyle="checkbox" />);
    expect(screen.getByRole("row", { name: /Alice/ }).className).not.toContain(
      "solid-spectrum-table-highlight-selection",
    );
  });

  it("suppresses the inner block edges for contiguous selected rows", () => {
    // Alice sits directly above Bob. Selecting both makes alice.isNextSelected
    // and bob.isPrevSelected true, which the macro hashes into a different row
    // class (suppressed inner border width + radius) than an isolated single-row
    // selection. jsdom loads no macro CSS, so we assert the class changes.
    const rowClass = (name: RegExp) => screen.getByRole("row", { name }).className;

    render(() => <HighlightTable selectedKeys={["alice", "bob"]} />);
    const aliceContiguous = rowClass(/Alice/);
    const bobContiguous = rowClass(/Bob/);
    cleanup();

    render(() => <HighlightTable selectedKeys={["alice"]} />);
    const aliceIsolated = rowClass(/Alice/);
    cleanup();

    render(() => <HighlightTable selectedKeys={["bob"]} />);
    const bobIsolated = rowClass(/Bob/);

    // Alice's bottom edge collapses once the row below is also selected.
    expect(aliceContiguous).not.toBe(aliceIsolated);
    // Bob's top edge collapses once the row above is also selected.
    expect(bobContiguous).not.toBe(bobIsolated);
  });

  it("selects rows on pointer down by default to match RAC table timing", () => {
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["alice"]));

      return (
        <Table
          aria-label="People"
          items={rows}
          columns={columns}
          getKey={(row) => row.id}
          selectionMode="multiple"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="role">{() => <>Role</>}</TableColumn>
                <TableColumn id="status">{() => <>Status</>}</TableColumn>
              </TableHeader>
              <TableBody>
                {(row) => (
                  <TableRow id={row.id} item={row}>
                    {() => (
                      <>
                        <TableCell>{() => <>{row.name}</>}</TableCell>
                        <TableCell>{() => <>{row.role}</>}</TableCell>
                        <TableCell>{() => <>{row.status}</>}</TableCell>
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

    render(() => <Demo />);

    const alice = screen.getByRole("row", { name: /Alice/ });
    const bob = screen.getByRole("row", { name: /Bob/ });

    fireEvent(bob, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));

    expect(alice).toHaveAttribute("data-selected", "true");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenCalledTimes(1);
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["alice", "bob"]));
  });

  it("fires row actions on pointer up by default when selection is disabled", () => {
    const onAction = vi.fn();

    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        selectionMode="none"
        onAction={onAction}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    const bob = screen.getByRole("row", { name: /Bob/ });

    fireEvent.pointerUp(bob, { pointerType: "mouse" });
    fireEvent.click(bob);

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction).toHaveBeenCalledWith("bob");
  });

  it("keeps renderActionBar selection in sync for uncontrolled selection", async () => {
    const user = setupUser();

    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        selectionMode="multiple"
        defaultSelectedKeys={["alice"]}
        renderActionBar={(keys) => (
          <output data-testid="selection">
            {keys === "all" ? "all" : Array.from(keys).sort().join(",")}
          </output>
        )}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    expect(screen.getByTestId("selection")).toHaveTextContent("alice");

    await user.click(screen.getByRole("row", { name: /Bob/ }));

    expect(screen.getByTestId("selection")).toHaveTextContent("alice,bob");
  });

  it("supports sorting state and sort change callbacks", async () => {
    const user = setupUser();
    const onSortChange = vi.fn();

    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        selectionMode="none"
        sortDescriptor={{ column: "name", direction: "ascending" }}
        onSortChange={onSortChange}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name" allowsSorting>
                {() => <>Name</>}
              </TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    const nameHeader = screen.getByRole("columnheader", { name: /Name/ });
    expect(nameHeader).toHaveAttribute("data-sortable", "true");
    expect(nameHeader).toHaveAttribute("data-sort-direction", "ascending");

    await user.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith({ column: "name", direction: "descending" });
  });

  it("renders root TableView column resizers and resize callbacks", () => {
    const onResize = vi.fn();
    const onResizeEnd = vi.fn();

    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        selectionMode="none"
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name" allowsResizing minWidth={120} maxWidth={320}>
                {() => <>Name</>}
              </TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute(
      "data-resizable",
      "true",
    );

    fireEvent.change(screen.getByLabelText("Resizer"), { target: { value: "180" } });

    expect(onResize).toHaveBeenCalled();
    expect(onResizeEnd).toHaveBeenCalled();
  });

  it("keeps the explicit ResizableTableContainer export wired", () => {
    render(() => (
      <ResizableTableContainer>
        <Table
          aria-label="People"
          items={rows}
          columns={columns}
          getKey={(row) => row.id}
          selectionMode="none"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name" allowsResizing>
                  {() => <>Name</>}
                </TableColumn>
              </TableHeader>
              <TableBody>
                {(row) => (
                  <TableRow id={row.id} item={row}>
                    {() => <TableCell>{() => <>{row.name}</>}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </ResizableTableContainer>
    ));

    const resizerInput = screen.getByLabelText("Resizer");
    expect(resizerInput).toBeInTheDocument();
    expect(resizerInput.parentElement).toHaveAttribute("role", "presentation");
  });

  it("bridges root loadingState and onLoadMore into the body", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        loadingState="loadingMore"
        onLoadMore={onLoadMore}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    expect(screen.getByRole("progressbar", { name: "loading" })).toBeInTheDocument();
  });

  it("renders footer cells and empty state", () => {
    render(() => (
      <Table aria-label="People" items={[]} columns={columns} getKey={(row: Person) => row.id}>
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody />
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>{() => <>No active people</>}</TableCell>
              </TableRow>
            </TableFooter>
          </>
        )}
      </Table>
    ));

    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.getByText("No active people").closest("td")).toHaveAttribute("colspan", "3");
  });

  it("supports the legacy title and description wrapper affordances", () => {
    render(() => (
      <Table
        aria-label="People"
        items={rows}
        columns={columns}
        getKey={(row) => row.id}
        title="User directory"
        description="All active users"
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
              <TableColumn id="status">{() => <>Status</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row) => (
                <TableRow id={row.id} item={row}>
                  {() => (
                    <>
                      <TableCell>{() => <>{row.name}</>}</TableCell>
                      <TableCell>{() => <>{row.role}</>}</TableCell>
                      <TableCell>{() => <>{row.status}</>}</TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));

    expect(screen.getByText("User directory")).toBeInTheDocument();
    expect(screen.getByText("All active users")).toBeInTheDocument();
  });
});

interface TreeItem {
  id: string;
  name: string;
  type: string;
  children?: TreeItem[];
}

// projects > (project-1 > file-1), project-2
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
        children: [{ id: "file-1", name: "File 1", type: "file" }],
      },
      { id: "project-2", name: "Project 2", type: "file" },
    ],
  },
];

// The first column is the row header, so the headless layer makes it the tree
// column (the one that renders the chevron and indentation).
const treeColumns = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

function TreeTable(props: { defaultExpandedKeys?: Iterable<string> } = {}) {
  return (
    <Table
      aria-label="Files"
      items={treeData}
      columns={treeColumns}
      getKey={(item) => item.id}
      getTextValue={(item, column) => String(item[column.key as keyof TreeItem] ?? "")}
      UNSTABLE_childItems={(item: TreeItem) => item.children}
      UNSTABLE_defaultExpandedKeys={props.defaultExpandedKeys}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="type">{() => <>Type</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(item: TreeItem) => (
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
  );
}

const treeRow = (key: string) =>
  document.querySelector(`tr[data-key="${key}"]`) as HTMLElement | null;
const treeColumnCell = (key: string) =>
  treeRow(key)?.querySelector("[data-tree-column]") as HTMLElement | undefined;
const treeChevron = (key: string) =>
  treeColumnCell(key)?.querySelector("button") as HTMLButtonElement | undefined;

describe("TableView tree grid (solid-spectrum)", () => {
  afterEach(() => cleanup());

  it("auto-injects the expand chevron into the tree column", () => {
    render(() => <TreeTable />);

    // Unlike the headless layer (where the consumer adds `<Button slot="chevron">`),
    // the styled TableCell renders the ExpandableRowChevron itself, gated on
    // `hasChildItems && isTreeColumn`. Mirrors @react-spectrum/s2 TableView's Cell.
    const chevron = treeChevron("projects");
    expect(treeColumnCell("projects")).toHaveAttribute("data-tree-column");
    expect(chevron).toBeInTheDocument();
    // The behavioral props (label, prevent-focus, press-to-toggle) flow in through
    // the row's `chevron` slot because this is the headless Button.
    expect(chevron).toHaveAttribute("slot", "chevron");
    expect(chevron).toHaveAttribute("aria-label", "Expand");
    expect(chevron).toHaveAttribute("tabindex", "-1");
    // It renders the bare ui-icon glyph, hidden from assistive tech.
    const glyph = chevron!.querySelector("svg");
    expect(glyph).toBeInTheDocument();
    expect(glyph).toHaveAttribute("aria-hidden", "true");
  });

  it("omits the chevron for leaf rows and non-tree columns", () => {
    render(() => <TreeTable defaultExpandedKeys={["projects"]} />);

    // Nested folder keeps a chevron; the leaf file row's tree cell renders none.
    expect(treeChevron("project-1")).toBeInTheDocument();
    expect(treeColumnCell("project-2")).toHaveAttribute("data-tree-column");
    expect(treeChevron("project-2")).toBeNull();
    expect(treeRow("project-2")!.querySelector("button")).toBeNull();

    // Only the row-header column is the tree column.
    const cells = treeRow("projects")!.querySelectorAll("th, td");
    const treeCells = treeRow("projects")!.querySelectorAll("[data-tree-column]");
    expect(treeCells).toHaveLength(1);
    expect(cells.length).toBeGreaterThan(1);
  });

  it("toggles row expansion when the chevron is pressed", () => {
    render(() => <TreeTable />);

    expect(treeRow("project-1")).toBeNull();

    fireEvent.click(treeChevron("projects")!);
    expect(treeRow("project-1")).toBeTruthy();
    expect(treeRow("projects")).toHaveAttribute("aria-expanded", "true");
    // Re-query: toggling recreates the tree-column cell's children.
    expect(treeChevron("projects")).toHaveAttribute("aria-label", "Collapse");

    fireEvent.click(treeChevron("projects")!);
    expect(treeRow("project-1")).toBeNull();
    expect(treeRow("projects")).not.toHaveAttribute("aria-expanded", "true");
  });
});
