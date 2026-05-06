import { createFileRoute } from "@tanstack/solid-router";
import { type JSX, type FlowComponent, createSignal, onMount, Show } from "solid-js";
import { isServer } from "solid-js/web";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableSelectionCheckbox,
  TableSelectAllCheckbox,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

/** Renders children only on the client after hydration. Same component tree on server/client for hydration compat. */
const ClientOnly: FlowComponent<{ fallback?: JSX.Element }> = (props) => {
  const [ready, setReady] = createSignal(false);
  if (!isServer) onMount(() => setReady(true));
  return (
    <Show when={ready()} fallback={props.fallback}>
      {props.children}
    </Show>
  );
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const sampleData: UserRow[] = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "Admin" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Editor" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com", role: "Viewer" },
  { id: "4", name: "Alice Brown", email: "alice@example.com", role: "Editor" },
];

const baseColumns = [
  { key: "name", name: "Name" },
  { key: "email", name: "Email" },
  { key: "role", name: "Role" },
];

const selectableColumns = [{ key: "selection", name: "Selection" }, ...baseColumns];

const sortableColumns = [
  { key: "name", name: "Name", allowsSorting: true },
  { key: "email", name: "Email", allowsSorting: true },
  { key: "role", name: "Role", allowsSorting: true },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/table")({
  component: TablePage,
});

function TablePage() {
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set());

  return (
    <DocPage
      title="Table"
      description="Tables display data in rows and columns. They support sorting, selection, and custom rendering."
      importCode={`import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Table"
        description="A simple table displaying data in rows and columns."
        code={`<Table items={rows} columns={columns} aria-label="Users table">
  <TableHeader>
    <TableColumn id="name">Name</TableColumn>
    <TableColumn id="email">Email</TableColumn>
    <TableColumn id="role">Role</TableColumn>
  </TableHeader>
  <TableBody>
    {(user) => (
      <TableRow id={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>{user.role}</TableCell>
      </TableRow>
    )}
  </TableBody>
</Table>`}
      >
        <ClientOnly fallback={<p class="text-sm text-bg-400">Loading table...</p>}>
          <Table
            items={sampleData}
            columns={baseColumns}
            aria-label="Users table"
            getKey={(user) => user.id}
          >
            <TableHeader>
              <TableColumn id="name">Name</TableColumn>
              <TableColumn id="email">Email</TableColumn>
              <TableColumn id="role">Role</TableColumn>
            </TableHeader>
            <TableBody<UserRow>>
              {(user) => (
                <TableRow id={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ClientOnly>
      </Example>

      <Example
        title="Selectable Rows"
        description="Enable row selection with checkboxes."
        code={`<Table
  items={rows}
  columns={selectableColumns}
  selectionMode="multiple"
  selectedKeys={selectedKeys()}
  onSelectionChange={setSelectedKeys}
>
  <TableHeader>
    <TableColumn id="selection"><TableSelectAllCheckbox /></TableColumn>
    ...
  </TableHeader>
  <TableBody>
    {(user) => (
      <TableRow id={user.id}>
        <TableSelectionCheckbox rowKey={user.id} />
        ...
      </TableRow>
    )}
  </TableBody>
</Table>`}
      >
        <ClientOnly fallback={<p class="text-sm text-bg-400">Loading table...</p>}>
          <div>
            <Table
              items={sampleData}
              columns={selectableColumns}
              aria-label="Selectable users table"
              getKey={(user) => user.id}
              selectionMode="multiple"
              selectedKeys={selectedKeys()}
              onSelectionChange={(keys) => {
                if (keys === "all") {
                  setSelectedKeys(new Set(sampleData.map((user) => user.id)));
                  return;
                }
                setSelectedKeys(new Set([...keys].map((key) => String(key))));
              }}
            >
              <TableHeader>
                <TableColumn id="selection">
                  <TableSelectAllCheckbox />
                </TableColumn>
                <TableColumn id="name">Name</TableColumn>
                <TableColumn id="email">Email</TableColumn>
                <TableColumn id="role">Role</TableColumn>
              </TableHeader>
              <TableBody<UserRow>>
                {(user) => (
                  <TableRow id={user.id}>
                    <TableSelectionCheckbox rowKey={user.id} />
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p class="mt-2 text-sm text-bg-500">
              Selected: {selectedKeys().size > 0 ? [...selectedKeys()].join(", ") : "None"}
            </p>
          </div>
        </ClientOnly>
      </Example>

      <Example
        title="Sortable Columns"
        description="Enable sorting by clicking column headers."
        code={`<Table items={rows} columns={sortableColumns} aria-label="Sortable users table">
  <TableHeader>
    <TableColumn id="name" allowsSorting>Name</TableColumn>
    <TableColumn id="email" allowsSorting>Email</TableColumn>
    <TableColumn id="role" allowsSorting>Role</TableColumn>
  </TableHeader>
  ...
</Table>`}
      >
        <ClientOnly fallback={<p class="text-sm text-bg-400">Loading table...</p>}>
          <Table
            items={sampleData}
            columns={sortableColumns}
            aria-label="Sortable users table"
            getKey={(user) => user.id}
          >
            <TableHeader>
              <TableColumn id="name" allowsSorting>
                Name
              </TableColumn>
              <TableColumn id="email" allowsSorting>
                Email
              </TableColumn>
              <TableColumn id="role" allowsSorting>
                Role
              </TableColumn>
            </TableHeader>
            <TableBody<UserRow>>
              {(user) => (
                <TableRow id={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ClientOnly>
      </Example>

      <h2>Table Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Data rows rendered by the table",
          },
          {
            name: "columns",
            type: "ColumnDefinition<T>[]",
            description: "Column metadata used for collection/sorting",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label for the table",
          },
          {
            name: "selectionMode",
            type: "'none' | 'single' | 'multiple'",
            default: "'none'",
            description: "How rows can be selected",
          },
          {
            name: "selectedKeys",
            type: "Set<string> | 'all'",
            description: "Currently selected row keys",
          },
          {
            name: "onSelectionChange",
            type: "(keys: Set<string> | 'all') => void",
            description: "Handler for selection changes",
          },
          {
            name: "sortDescriptor",
            type: "{ column: string, direction: 'ascending' | 'descending' }",
            description: "Current sort state",
          },
          {
            name: "onSortChange",
            type: "(descriptor: SortDescriptor) => void",
            description: "Handler for sort changes",
          },
        ]}
      />

      <h2>TableColumn Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique column identifier",
          },
          {
            name: "allowsSorting",
            type: "boolean",
            default: "false",
            description: "Whether column is sortable",
          },
          {
            name: "width",
            type: "string | number",
            description: "Column width",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Column header content",
          },
        ]}
      />

      <h2>TableRow Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique row identifier",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "TableCell components",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses native <code>&lt;table&gt;</code> elements with proper ARIA roles
          </li>
          <li>Keyboard navigation: Arrow keys to move between cells</li>
          <li>Row selection announced to screen readers</li>
          <li>Sort state announced when columns are sorted</li>
          <li>Focus indicator clearly shows current cell</li>
          <li>Supports both single and multiple selection modes</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
