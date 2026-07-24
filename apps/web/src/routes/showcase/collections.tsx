/* Panel — collections. List rows, menus, tables, trees: the register's
   collection components, one minimal demo per family, composed from the
   shared Panel/Demo/Row chrome. */
import { createFileRoute } from "@tanstack/solid-router";
import {
  ActionBar,
  ActionBarContainer,
  ActionButton,
  ActionGroup,
  ActionMenu,
  Content,
  ListBox,
  ListBoxOption,
  ListView,
  ListViewItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  SubmenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Text,
  Toolbar,
  Tree,
  TreeItem,
  TreeItemContent,
  UnavailableMenuItemTrigger,
  CardView,
  Card,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/collections")({
  head: () => panelSeo("collections"),
  component: Page,
});

const SPEED_ITEMS = [
  {
    title: "Playback speed",
    "aria-label": "Playback speed",
    items: [
      { id: "0.5x", label: "0.5x" },
      { id: "1x", label: "1x" },
      { id: "1.5x", label: "1.5x" },
      { id: "2x", label: "2x" },
    ],
  },
];

const LIST_ROWS = [
  { id: "r1", title: "Radiometry Basics", meta: "12 min" },
  { id: "r2", title: "Spectral Response", meta: "8 min" },
  { id: "r3", title: "Colorimetry", meta: "15 min" },
];

const PEOPLE = [
  { id: "p1", name: "Ada Lovelace", role: "Engineer", status: "Active" },
  { id: "p2", name: "Grace Hopper", role: "Admiral", status: "Active" },
  { id: "p3", name: "Katherine Johnson", role: "Mathematician", status: "Idle" },
];

const PROJECTS = [
  { id: "c1", title: "Nebula", status: "In progress" },
  { id: "c2", title: "Aurora", status: "Shipped" },
  { id: "c3", title: "Comet", status: "Blocked" },
];

const TABLE_COLUMNS = [
  { key: "name", name: "Name" },
  { key: "role", name: "Role" },
  { key: "status", name: "Status" },
];

function Page() {
  const def = panelBySlug("collections")!;

  return (
    <Panel def={def}>
      <Demo label="ListBox · single-select — ListBoxOption + ListBoxSection">
        <ListBox
          aria-label="Playback speed"
          items={SPEED_ITEMS}
          getKey={(item) => item.id}
          selectionMode="single"
          defaultSelectedKeys={["1x"]}
        >
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      </Demo>

      <Demo label="ListView · rows with description">
        <ListView aria-label="Lessons" items={LIST_ROWS} isQuiet>
          {(row) => (
            <ListViewItem id={row.id} textValue={row.title} description={row.meta}>
              <Text slot="label">{row.title}</Text>
            </ListViewItem>
          )}
        </ListView>
      </Demo>

      <Demo label="Menu · MenuTrigger + MenuButton — section, separator, submenu, unavailable item">
        <Row>
          <MenuTrigger>
            <MenuButton>Document</MenuButton>
            <Menu aria-label="Document actions">
              <MenuSection>
                <MenuItem id="open" textValue="Open">
                  Open
                </MenuItem>
                <MenuItem id="rename" textValue="Rename">
                  Rename
                </MenuItem>
              </MenuSection>
              <MenuSeparator />
              <SubmenuTrigger>
                <MenuItem id="share" textValue="Share">
                  Share
                </MenuItem>
                <Menu aria-label="Share via">
                  <MenuItem id="link" textValue="Copy link">
                    Copy link
                  </MenuItem>
                  <MenuItem id="email" textValue="Email">
                    Email
                  </MenuItem>
                </Menu>
              </SubmenuTrigger>
              <MenuSeparator />
              <UnavailableMenuItemTrigger isUnavailable>
                <MenuItem id="locked" textValue="Locked action">
                  Locked action
                </MenuItem>
              </UnavailableMenuItemTrigger>
            </Menu>
          </MenuTrigger>
        </Row>
      </Demo>

      <Demo label="ActionMenu · convenience wrapper">
        <ActionMenu aria-label="Row actions">
          <MenuItem id="edit" textValue="Edit">
            Edit
          </MenuItem>
          <MenuItem id="duplicate" textValue="Duplicate">
            Duplicate
          </MenuItem>
          <MenuItem id="delete" textValue="Delete">
            Delete
          </MenuItem>
        </ActionMenu>
      </Demo>

      <Demo label="ActionGroup · single selection — the selected item takes the accent fill">
        <ActionGroup
          aria-label="Text alignment"
          selectionMode="single"
          defaultSelectedKeys={["left"]}
          items={[
            { id: "left", label: "Left" },
            { id: "center", label: "Center" },
            { id: "right", label: "Right" },
          ]}
        />
      </Demo>

      <Demo label="ActionBar · ActionBarContainer — the bar floats over the bottom of the wrapped view">
        <ActionBarContainer>
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "8px",
              "min-height": "160px",
            }}
          >
            <div>Quarterly report</div>
            <div>Launch checklist</div>
            <div>Design brief</div>
            <div>3 rows selected</div>
          </div>
          <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
            <ActionButton>Edit</ActionButton>
            <ActionButton>Delete</ActionButton>
          </ActionBar>
        </ActionBarContainer>
      </Demo>

      <Demo label="Toolbar">
        <Toolbar aria-label="Formatting tools">
          <ActionButton>Bold</ActionButton>
          <ActionButton>Italic</ActionButton>
          <ActionButton>Underline</ActionButton>
        </Toolbar>
      </Demo>

      <Demo label="TableView · 3x3">
        <Table<(typeof PEOPLE)[number]>
          aria-label="People"
          items={PEOPLE}
          columns={TABLE_COLUMNS}
          getKey={(row) => row.id}
          getTextValue={(row, column) =>
            String(row[column.key as keyof (typeof PEOPLE)[number]] ?? "")
          }
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="role">{() => <>Role</>}</TableColumn>
                <TableColumn id="status">{() => <>Status</>}</TableColumn>
              </TableHeader>
              <TableBody<(typeof PEOPLE)[number]>>
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
      </Demo>

      <Demo label="TableView · selectionMode multiple — selection checkboxes">
        <Table<(typeof PEOPLE)[number]>
          aria-label="People"
          items={PEOPLE}
          columns={TABLE_COLUMNS}
          getKey={(row) => row.id}
          getTextValue={(row, column) =>
            String(row[column.key as keyof (typeof PEOPLE)[number]] ?? "")
          }
          selectionMode="multiple"
        >
          {() => (
            <>
              <TableHeader>
                <TableColumn id="name">{() => <>Name</>}</TableColumn>
                <TableColumn id="role">{() => <>Role</>}</TableColumn>
                <TableColumn id="status">{() => <>Status</>}</TableColumn>
              </TableHeader>
              <TableBody<(typeof PEOPLE)[number]>>
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
      </Demo>

      <Demo label="TreeView · two levels">
        <Tree
          aria-label="Files"
          items={[
            {
              id: "projects",
              textValue: "Projects",
              children: [
                { id: "brief", textValue: "Project brief" },
                { id: "report", textValue: "Quarterly report" },
              ],
            },
            { id: "archive", textValue: "Archive" },
          ]}
          defaultExpandedKeys={["projects"]}
        >
          {(item) => (
            <TreeItem id={String(item.id ?? item.key)} textValue={item.textValue}>
              <TreeItemContent>
                <Text slot="label">{item.textValue}</Text>
              </TreeItemContent>
            </TreeItem>
          )}
        </Tree>
      </Demo>

      <Demo label="CardView">
        <CardView aria-label="Projects" items={PROJECTS} getKey={(item) => item.id} size="S">
          {(item) => (
            <Card id={item.id} textValue={`${item.title} ${item.status}`}>
              <Content>
                <Text slot="title">{item.title}</Text>
                <Text slot="description">{item.status}</Text>
              </Content>
            </Card>
          )}
        </CardView>
      </Demo>
    </Panel>
  );
}
