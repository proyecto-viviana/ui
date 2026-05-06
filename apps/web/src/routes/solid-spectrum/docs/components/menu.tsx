import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import {
  Menu,
  MenuItem,
  MenuTrigger,
  MenuButton,
  MenuSeparator,
  Button,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type MenuDocItem = {
  id: string;
  label: string;
  isDisabled?: boolean;
  isSeparator?: boolean;
  isDestructive?: boolean;
};

export const Route = createFileRoute("/solid-spectrum/docs/components/menu")({
  component: MenuPage,
});

function MenuPage() {
  const [lastAction, setLastAction] = createSignal("None");

  const basicItems: MenuDocItem[] = [
    { id: "new", label: "New file" },
    { id: "open", label: "Open" },
    { id: "save", label: "Save" },
  ];

  const editItems: MenuDocItem[] = [
    { id: "cut", label: "Cut" },
    { id: "copy", label: "Copy" },
    { id: "paste", label: "Paste" },
    { id: "sep-1", label: "", isSeparator: true },
    { id: "selectAll", label: "Select All" },
    { id: "sep-2", label: "", isSeparator: true },
    { id: "delete", label: "Delete" },
  ];

  const disabledItems: MenuDocItem[] = [
    { id: "cut", label: "Cut" },
    { id: "copy", label: "Copy" },
    { id: "paste", label: "Paste (clipboard empty)", isDisabled: true },
  ];

  const moreItems: MenuDocItem[] = [
    { id: "settings", label: "Settings" },
    { id: "help", label: "Help" },
    { id: "about", label: "About" },
  ];

  const fileItems: MenuDocItem[] = [
    { id: "rename", label: "Rename" },
    { id: "duplicate", label: "Duplicate" },
    { id: "archive", label: "Archive" },
    { id: "sep-3", label: "", isSeparator: true },
    { id: "delete", label: "Delete permanently", isDestructive: true },
  ];

  return (
    <DocPage
      title="Menu"
      description="Menus display a list of actions or options that a user can choose. They're triggered by a button and appear as a popover."
      importCode={`import {
  Menu,
  MenuItem,
  MenuTrigger,
  MenuButton,
  MenuSeparator
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A simple menu with action items."
        code={`<MenuTrigger>
  <MenuButton>Actions</MenuButton>
  <Menu items={items}>
    {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
  </Menu>
</MenuTrigger>`}
      >
        <MenuTrigger>
          <MenuButton>Actions</MenuButton>
          <Menu items={basicItems} onAction={(key) => setLastAction(String(key))}>
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      </Example>

      <Example
        title="With Separators"
        description="Use separators to group related menu items."
        code={`<Menu items={items}>
  {(item) => item.isSeparator ? <MenuSeparator /> : <MenuItem id={item.id}>{item.label}</MenuItem>}
</Menu>`}
      >
        <MenuTrigger>
          <MenuButton>Edit</MenuButton>
          <Menu items={editItems} onAction={(key) => setLastAction(String(key))}>
            {(item) =>
              item.isSeparator ? <MenuSeparator /> : <MenuItem id={item.id}>{item.label}</MenuItem>
            }
          </Menu>
        </MenuTrigger>
      </Example>

      <Example
        title="Disabled Items"
        description="Individual menu items can be disabled."
        code={`<MenuItem id="paste" isDisabled>
  Paste (clipboard empty)
</MenuItem>`}
      >
        <MenuTrigger>
          <MenuButton>Edit</MenuButton>
          <Menu items={disabledItems} onAction={(key) => setLastAction(String(key))}>
            {(item) => (
              <MenuItem id={item.id} isDisabled={item.isDisabled}>
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      </Example>

      <Example
        title="Custom Trigger"
        description="Use any button as the menu trigger."
        code={`<MenuTrigger>
  <Button variant="accent">Open Menu</Button>
  <Menu items={items}>...</Menu>
</MenuTrigger>`}
      >
        <MenuTrigger>
          <Button variant="accent">More Options</Button>
          <Menu items={moreItems} onAction={(key) => setLastAction(String(key))}>
            {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
          </Menu>
        </MenuTrigger>
      </Example>

      <Example
        title="Destructive Actions"
        description="Use the negative variant for destructive actions."
        code={`<MenuItem id="delete" isDestructive>
  Delete permanently
</MenuItem>`}
      >
        <MenuTrigger>
          <MenuButton>File Options</MenuButton>
          <Menu items={fileItems} onAction={(key) => setLastAction(String(key))}>
            {(item) =>
              item.isSeparator ? (
                <MenuSeparator />
              ) : (
                <MenuItem id={item.id} isDestructive={item.isDestructive}>
                  {item.label}
                </MenuItem>
              )
            }
          </Menu>
        </MenuTrigger>
      </Example>

      <p class="text-sm text-bg-500 mb-6">Last action: {lastAction()}</p>

      <h2>MenuTrigger Props</h2>
      <PropsTable
        props={[
          {
            name: "isOpen",
            type: "boolean",
            description: "Whether the menu is open (controlled)",
          },
          {
            name: "defaultOpen",
            type: "boolean",
            default: "false",
            description: "Whether the menu is open by default",
          },
          {
            name: "onOpenChange",
            type: "(isOpen: boolean) => void",
            description: "Handler called when open state changes",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Trigger button and Menu component",
          },
        ]}
      />

      <h2>Menu Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Collection of menu items",
          },
          {
            name: "onAction",
            type: "(key: string) => void",
            description: "Handler called when an item is selected",
          },
          {
            name: "onClose",
            type: "() => void",
            description: "Handler called when menu closes",
          },
          {
            name: "disabledKeys",
            type: "Iterable<string>",
            description: "Keys of disabled items",
          },
          {
            name: "children",
            type: "(item: T) => JSX.Element",
            description: "Render function for MenuItem/MenuSeparator",
          },
        ]}
      />

      <h2>MenuItem Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the item",
          },
          {
            name: "textValue",
            type: "string",
            description: "Text value for typeahead",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the item is disabled",
          },
          {
            name: "onAction",
            type: "() => void",
            description: "Handler called when item is selected",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Item content",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses ARIA menu pattern with <code>menu</code> and <code>menuitem</code> roles
          </li>
          <li>Arrow keys navigate between items</li>
          <li>Home/End keys jump to first/last item</li>
          <li>Escape closes the menu and returns focus to trigger</li>
          <li>Type-ahead search jumps to matching items</li>
          <li>Disabled items are focusable but not actionable (for context)</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
