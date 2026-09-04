import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "../../src/table";

export interface Person {
  id: string;
  name: string;
  role: string;
}

export const PEOPLE: Person[] = [
  { id: "ada", name: "Ada", role: "Engineer" },
  { id: "grace", name: "Grace", role: "Admiral" },
];

export const TABLE_COLUMNS = [
  { key: "name", label: "Name" },
  { key: "role", label: "Role" },
];

/**
 * The `/showcase/collections` "selectionMode multiple" table: a render-prop
 * child, a select-all column ahead of the data columns.
 */
export function SelectableTableFixture() {
  return (
    <Table<Person>
      aria-label="People"
      items={PEOPLE}
      columns={TABLE_COLUMNS}
      getKey={(row) => row.id}
      getTextValue={(row, column) => String(row[column.key as keyof Person] ?? "")}
      selectionMode="multiple"
    >
      {() => (
        <>
          <TableHeader>
            <TableColumn id="name">{() => <>Name</>}</TableColumn>
            <TableColumn id="role">{() => <>Role</>}</TableColumn>
          </TableHeader>
          <TableBody<Person>>
            {(row) => (
              <TableRow id={row.id} item={row}>
                {() => (
                  <>
                    <TableCell>{() => <>{row.name}</>}</TableCell>
                    <TableCell>{() => <>{row.role}</>}</TableCell>
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
