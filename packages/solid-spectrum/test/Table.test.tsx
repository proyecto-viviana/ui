import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
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

  it("supports controlled multiple selection with S2 toggle behavior by default", async () => {
    const user = setupUser();
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

    await user.click(bob);

    expect(alice).toHaveAttribute("data-selected", "true");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["alice", "bob"]));

    await user.click(alice);

    expect(alice).not.toHaveAttribute("data-selected");
    expect(bob).toHaveAttribute("data-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["bob"]));
  });

  it("selects rows on pointer up by default to match S2 press timing", () => {
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

    fireEvent.pointerUp(bob, { pointerType: "mouse" });
    fireEvent.click(bob);

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
