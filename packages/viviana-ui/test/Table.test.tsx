import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@solidjs/testing-library";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableView,
} from "../src/table";

interface Person {
  id: string;
  name: string;
  role: string;
  status: string;
}

const rows: Person[] = [
  { id: "alice", name: "Alice", role: "Engineer", status: "Active" },
  { id: "bob", name: "Bob", role: "Designer", status: "Paused" },
  { id: "carol", name: "Carol", role: "Manager", status: "Active" },
];

const columns = [
  { key: "name", name: "Name" },
  { key: "role", name: "Role" },
  { key: "status", name: "Status" },
];

function TestTable(props: {
  selectionMode?: "none" | "single" | "multiple";
  defaultSelectedKeys?: "all" | Iterable<string>;
  selectedKeys?: "all" | Iterable<string>;
}) {
  return (
    <Table
      aria-label="People"
      items={rows}
      columns={columns}
      getKey={(row) => row.id}
      selectionMode={props.selectionMode}
      defaultSelectedKeys={props.defaultSelectedKeys}
      selectedKeys={props.selectedKeys}
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="role">{() => <>Role</>}</TableColumn>
            <TableColumn id="status">{() => <>Status</>}</TableColumn>
          </TableHeader>
          <TableBody>
            {(row: Person) => (
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

describe("TableView (viviana-ui)", () => {
  afterEach(() => cleanup());

  it("exports TableView alias", () => {
    expect(TableView).toBe(Table);
  });

  it("renders with role=grid and basic semantics", () => {
    render(() => <TestTable />);
    expect(screen.getByRole("grid", { name: "People" })).toBeInTheDocument();
  });

  it("treats an explicit full set of selected keys as selected, not mixed", () => {
    render(() => (
      <TestTable
        selectionMode="multiple"
        defaultSelectedKeys={new Set(["alice", "bob", "carol"])}
      />
    ));

    const selectAll = screen.getByRole("checkbox", { name: "Select All" }) as HTMLInputElement;
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
    expect(selectAll).not.toHaveAttribute("data-indeterminate");
  });

  it("treats partial selection as indeterminate / mixed", () => {
    render(() => <TestTable selectionMode="multiple" defaultSelectedKeys={new Set(["alice"])} />);

    const selectAll = screen.getByRole("checkbox", { name: "Select All" }) as HTMLInputElement;
    expect(selectAll.checked).toBe(false);
    expect(selectAll.indeterminate).toBe(true);
    expect(selectAll).toHaveAttribute("data-indeterminate", "true");
  });

  it("treats selectedKeys='all' as selected", () => {
    render(() => <TestTable selectionMode="multiple" defaultSelectedKeys="all" />);

    const selectAll = screen.getByRole("checkbox", { name: "Select All" }) as HTMLInputElement;
    expect(selectAll.checked).toBe(true);
    expect(selectAll.indeterminate).toBe(false);
  });
});
