import type { JSX } from "@solidjs/web";
import { ActionButton } from "../../src/button";
import { ActionButtonGroup } from "../../src/actionbuttongroup";
import BellIcon from "../../src/icon/s2wf-icons/BellIcon";
import { ListView, ListViewItem } from "../../src/list";
import { Provider } from "../../src/provider";
import { Text } from "../../src/text";
import { TreeView, TreeViewItem, TreeViewItemContent } from "../../src/tree";

const ROWS = [
  { id: "brief", title: "Project brief", description: "Planning notes" },
  { id: "report", title: "Quarterly report", description: "Finance packet" },
];

type Row = (typeof ROWS)[number];

function rowSlots(row: Row): JSX.Element {
  return (
    <>
      <BellIcon />
      <Text slot="label">{row.title}</Text>
      <Text slot="description">{row.description}</Text>
      <ActionButtonGroup>
        <ActionButton aria-label={`Pin ${row.title}`}>Pin</ActionButton>
      </ActionButtonGroup>
    </>
  );
}

/** Dynamic ListView whose label, description, icon, and actions are slot consumers. */
export function ListViewSlotStylesFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ListView aria-label="Documents" items={ROWS} selectionMode="multiple">
        {(row: Row) => (
          <ListViewItem id={row.id} textValue={row.title}>
            {rowSlots(row)}
          </ListViewItem>
        )}
      </ListView>
    </Provider>
  );
}

/** Dynamic TreeView with the same slot consumers inside item content. */
export function TreeSlotStylesFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <TreeView aria-label="Files" items={ROWS} selectionMode="multiple">
        {(row: Row) => (
          <TreeViewItem id={row.id} textValue={row.title}>
            <TreeViewItemContent>{rowSlots(row)}</TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    </Provider>
  );
}
