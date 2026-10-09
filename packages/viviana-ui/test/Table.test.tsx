import { createSignal, flush } from "solid-js";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
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

  it.each([false, true])(
    "keeps live zero-argument cell accessors and retained state (custom render: %s)",
    (customRender) => {
      const [value, setValue] = createSignal("before");
      const argumentCounts: number[] = [];
      let mounts = 0;
      function StatefulContent() {
        mounts++;
        const [count, setCount] = createSignal(0);
        return (
          <>
            <input aria-label="Retained input" />
            <button onClick={() => setCount(count() + 1)}>Count {count()}</button>
          </>
        );
      }
      render(() => (
        <Table
          aria-label="Accessor retention"
          items={[rows[0]]}
          columns={[columns[0]]}
          getKey={(item) => item.id}
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">Name</TableColumn>
              </TableHeader>
              <TableBody>
                {(item) => (
                  <TableRow id={item.id} item={item}>
                    {() => {
                      const retained = <StatefulContent />;
                      function cellAccessor() {
                        argumentCounts.push(arguments.length);
                        return [value(), retained];
                      }
                      return (
                        <TableCell render={customRender ? (props) => <td {...props} /> : undefined}>
                          {cellAccessor}
                        </TableCell>
                      );
                    }}
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      ));
      const input = screen.getByRole("textbox", { name: "Retained input" });
      const cell = input.closest("td");
      const button = screen.getByRole("button", { name: "Count 0" });
      if (!cell) throw new Error("missing original retained cell");
      fireEvent.click(button);
      fireEvent.input(input, { target: { value: "typed" } });
      input.focus();
      expect(document.activeElement).toBe(input);
      expect(cell).toHaveTextContent("before");
      setValue("after");
      flush();
      expect(input.closest("td")).toBe(cell);
      expect(screen.getByRole("textbox", { name: "Retained input" })).toBe(input);
      expect(screen.getByRole("button", { name: "Count 1" })).toBe(button);
      expect(cell.isConnected).toBe(true);
      expect(input.isConnected).toBe(true);
      expect(button.isConnected).toBe(true);
      expect(input).toHaveValue("typed");
      expect(document.activeElement).toBe(input);
      expect(cell).toHaveTextContent("after");
      expect(cell).not.toHaveTextContent("before");
      expect(mounts).toBe(1);
      expect(argumentCounts.length).toBeGreaterThanOrEqual(2);
      expect(argumentCounts.every((count) => count === 0)).toBe(true);
    },
  );

  it("keeps argument-taking cell callback once with live getters", () => {
    let callbacks = 0;
    const argumentCounts: number[] = [];
    render(() => (
      <Table
        aria-label="Getter forwarding"
        items={[rows[0]]}
        columns={[columns[0]]}
        getKey={(item) => item.id}
      >
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">Name</TableColumn>
            </TableHeader>
            <TableBody>
              {(item) => (
                <TableRow id={item.id} item={item}>
                  {() => (
                    <TableCell>
                      {function cellCallback(state) {
                        callbacks++;
                        argumentCounts.push(arguments.length);
                        expect(
                          typeof Object.getOwnPropertyDescriptor(state, "isFocused")?.get,
                        ).toBe("function");
                        return (
                          <span data-testid="forwarded-getter">{`focused=${state.isFocused}`}</span>
                        );
                      }}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
    ));
    const content = screen.getByTestId("forwarded-getter");
    const cell = content.closest("td");
    if (!cell) throw new Error("missing getter cell");
    expect(content).toHaveTextContent("focused=false");
    cell.focus();
    flush();
    expect(content).toHaveTextContent("focused=true");
    expect(screen.getByTestId("forwarded-getter")).toBe(content);
    expect(content.isConnected).toBe(true);
    expect(cell.isConnected).toBe(true);
    expect(callbacks).toBe(1);
    expect(argumentCounts).toEqual([1]);
  });

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
