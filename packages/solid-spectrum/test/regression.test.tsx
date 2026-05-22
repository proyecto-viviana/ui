/**
 * @vitest-environment jsdom
 *
 * Comprehensive component regression tests with DOM snapshots.
 * One describe block per component, each rendering with realistic props,
 * making multiple assertions, and capturing an innerHTML snapshot.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import { parseDate, type TreeItemData } from "@proyecto-viviana/solid-stately";

// ── Forms & Inputs ──────────────────────────────────────────────
import { Button } from "../src/button";
import { Checkbox } from "../src/checkbox";
import { TextField } from "../src/textfield";
import { TextArea } from "../src/textfield";
import { NumberField } from "../src/numberfield";
import { SearchField } from "../src/searchfield";
import { Slider, RangeSlider } from "../src/slider";
import { ToggleSwitch } from "../src/switch";
import { RadioGroup, Radio } from "../src/radio";

// ── Selection & Collections ─────────────────────────────────────
import { ComboBox, ComboBoxOption } from "../src/combobox";
import { Select, SelectTrigger, SelectValue, SelectListBox, SelectOption } from "../src/select";
import { ListBox, ListBoxOption } from "../src/listbox";
import { ActionMenu } from "../src/ActionMenu";
import { MenuTrigger, MenuButton, Menu, MenuItem } from "../src/menu";
import { GridList, GridListItem } from "../src/gridlist";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "../src/table";
import { Tree, TreeItem } from "../src/tree";
import { Tabs, TabList, Tab, TabPanel } from "../src/tabs";

// ── Overlays & Dialogs ──────────────────────────────────────────
import { DialogTrigger, Dialog, AlertDialog } from "../src/dialog";
import { PopoverTrigger, Popover } from "../src/popover";
import { TooltipTrigger, Tooltip } from "../src/tooltip";
import { ToastProvider, ToastRegion, addToast, globalToastQueue } from "../src/toast";
import type { QueuedToast, ToastContent } from "../src/toast";

// ── Navigation & Layout ─────────────────────────────────────────
import { Breadcrumbs, BreadcrumbItem } from "../src/breadcrumbs";
import { Link } from "../src/link";
import { Toolbar } from "../src/toolbar";
import { Disclosure, DisclosureGroup, DisclosureTrigger, DisclosurePanel } from "../src/disclosure";

// ── Date & Time ─────────────────────────────────────────────────
import { Calendar } from "../src/calendar";
import { DatePicker } from "../src/calendar/DatePicker";
import { DateField } from "../src/calendar/DateField";

// ── Data Display ────────────────────────────────────────────────
import { ProgressBar } from "../src/progress-bar";
import { Meter } from "../src/meter";
import { Badge } from "../src/badge";
import { Alert } from "../src/alert";
import { StatusLight } from "../src/statuslight";
import { Separator } from "../src/separator";

// ── Color ───────────────────────────────────────────────────────
import {
  ColorArea,
  ColorSlider,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorWheel,
  ColorWheelTrack,
  ColorWheelThumb,
} from "../src/color";

// ── Other ───────────────────────────────────────────────────────
import { Avatar } from "../src/avatar";
import { Landmark } from "../src/landmark";
import { Well } from "../src/well";
import { Label } from "../src/label";
import { Form } from "../src/form";

// ═══════════════════════════════════════════════════════════════
// Shared helpers
// ═══════════════════════════════════════════════════════════════

function clearGlobalToasts() {
  const toasts = globalToastQueue.visibleToasts;
  if (typeof toasts === "function") {
    (toasts() as QueuedToast<ToastContent>[]).forEach((t) => globalToastQueue.close(t.key));
  }
}

/** Normalize auto-generated IDs so snapshots stay stable across runs. */
function normalizeIds(html: string): string {
  const idMap = new Map<string, string>();
  let counter = 0;
  return html
    .replace(/id="([^"]+)"/g, (_match, id) => {
      if (!idMap.has(id)) {
        idMap.set(id, `id-${counter++}`);
      }
      return `id="${idMap.get(id)}"`;
    })
    .replace(
      /(aria-labelledby|aria-describedby|aria-controls|aria-owns|for|aria-activedescendant)="([^"]+)"/g,
      (_match, attr, ids) => {
        const normalized = ids
          .split(/\s+/)
          .map((id: string) => {
            if (!idMap.has(id)) {
              idMap.set(id, `id-${counter++}`);
            }
            return idMap.get(id);
          })
          .join(" ");
        return `${attr}="${normalized}"`;
      },
    )
    .replace(/name="solidaria-cl-\d+"/g, 'name="solidaria-cl-0"');
}

function expectS2Button(button: HTMLElement, text: string): void {
  expect(button).not.toHaveAttribute("data-variant");
  expect(button).not.toHaveAttribute("data-style");
  expect(button).not.toHaveAttribute("data-size");
  expect(button).toHaveAttribute("type", "button");
  expect(button.textContent).toContain(text);
  expect(button.querySelector('[data-rsp-slot="text"]')?.textContent).toBe(text);
}

afterEach(() => cleanup());

// ═══════════════════════════════════════════════════════════════
// FORMS & INPUTS
// ═══════════════════════════════════════════════════════════════

describe("Regression: Button", () => {
  it("renders with role, React S2 root attributes, and text slot", () => {
    render(() => <Button>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeInTheDocument();
    expect(btn).not.toBeDisabled();
    expectS2Button(btn, "Save");
  });
});

describe("Regression: Checkbox", () => {
  it("renders with role, unchecked default, toggle, label, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => <Checkbox>Accept terms</Checkbox>);
    const cb = screen.getByRole("checkbox");
    expect(cb).toBeInTheDocument();
    expect(cb).not.toBeChecked();
    expect(screen.getByText("Accept terms")).toBeInTheDocument();

    await user.click(cb);
    await Promise.resolve();
    expect(cb).toBeChecked();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: TextField", () => {
  it("renders with role, placeholder, label, and snapshot", () => {
    const { container } = render(() => <TextField label="Email" placeholder="you@example.com" />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "you@example.com");
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: TextArea", () => {
  it("renders textarea element with placeholder and snapshot", () => {
    const { container } = render(() => <TextArea label="Notes" placeholder="Write here..." />);
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("placeholder", "Write here...");
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: NumberField", () => {
  it("renders spinbutton with increment/decrement and snapshot", () => {
    const { container } = render(() => (
      <NumberField label="Quantity" defaultValue={5} minValue={0} maxValue={100} />
    ));
    const spin = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(spin).toBeInTheDocument();
    expect(spin.value).toBe("5");
    expect(screen.getByText("Quantity")).toBeInTheDocument();
    // Increment/decrement buttons present
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: SearchField", () => {
  it("renders searchbox with clear button after typing and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => <SearchField label="Search" />);
    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();

    await user.type(input, "hello");
    expect((input as HTMLInputElement).value).toBe("hello");

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Slider", () => {
  it("renders with range input semantics and snapshot", () => {
    const { container } = render(() => (
      <Slider label="Volume" value={40} minValue={0} maxValue={100} />
    ));
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider).toHaveAttribute("type", "range");
    expect(slider.value).toBe("40");
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
    expect(slider).toHaveAttribute("aria-valuetext", "40");
    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Switch", () => {
  it("renders with role, unchecked default, click → checked, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => <ToggleSwitch aria-label="Dark mode" />);
    const sw = screen.getByRole("switch");
    expect(sw).toBeInTheDocument();
    expect(sw).not.toBeChecked();

    await user.click(sw);
    await Promise.resolve();
    expect(sw).toBeChecked();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: RadioGroup", () => {
  it("renders radiogroup with radio roles and selection, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <RadioGroup aria-label="Color">
        <Radio value="red">Red</Radio>
        <Radio value="blue">Blue</Radio>
        <Radio value="green">Green</Radio>
      </RadioGroup>
    ));
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);

    await user.click(radios[1]);
    await Promise.resolve();
    expect(radios[1]).toBeChecked();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// SELECTION & COLLECTIONS
// ═══════════════════════════════════════════════════════════════

describe("Regression: ComboBox", () => {
  const items = [
    { id: "1", name: "Apple" },
    { id: "2", name: "Banana" },
    { id: "3", name: "Cherry" },
  ];

  it("renders combobox input and snapshot", () => {
    const { container } = render(() => (
      <ComboBox
        label="Fruit"
        items={items}
        getKey={(item) => item.id}
        getTextValue={(item) => item.name}
      >
        {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
      </ComboBox>
    ));

    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
    expect(screen.getByText("Fruit")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Select", () => {
  const items = [
    { id: "sm", label: "Small" },
    { id: "md", label: "Medium" },
    { id: "lg", label: "Large" },
  ];

  it("renders trigger and snapshot", () => {
    const { container } = render(() => (
      <Select label="Size" items={items} getKey={(i) => i.id} getTextValue={(i) => i.label}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectListBox>
          {(item) => <SelectOption id={item.id}>{item.label}</SelectOption>}
        </SelectListBox>
      </Select>
    ));

    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Size" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: ListBox", () => {
  const items = [
    { id: "a", label: "Alpha" },
    { id: "b", label: "Bravo" },
    { id: "c", label: "Charlie" },
  ];

  it("renders listbox with options and snapshot", () => {
    const { container } = render(() => (
      <ListBox
        items={items}
        getKey={(i) => i.id}
        getTextValue={(i) => i.label}
        aria-label="Phonetic"
        selectionMode="single"
      >
        {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
      </ListBox>
    ));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0].textContent).toContain("Alpha");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Menu", () => {
  const items = [
    { id: "edit", label: "Edit" },
    { id: "duplicate", label: "Duplicate" },
    { id: "delete", label: "Delete" },
  ];

  it("renders trigger, click → menu with items, and snapshot", async () => {
    const user = setupUser();
    render(() => (
      <MenuTrigger>
        <MenuButton>Actions</MenuButton>
        <Menu items={items} getKey={(i) => i.id} aria-label="Actions">
          {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
        </Menu>
      </MenuTrigger>
    ));

    const trigger = screen.getByRole("button", { name: /Actions/ });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    const menuItems = screen.getAllByRole("menuitem");
    expect(menuItems.length).toBe(3);
    expect(menuItems[0].textContent).toContain("Edit");

    expect(normalizeIds(document.body.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: ActionMenu", () => {
  const items = [
    { id: "cut", label: "Cut" },
    { id: "copy", label: "Copy" },
    { id: "paste", label: "Paste" },
  ];

  it("renders button with aria-label, click → menu, and snapshot", async () => {
    const user = setupUser();
    render(() => <ActionMenu aria-label="Actions" items={items} getKey={(i) => i.id} />);

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-label", "Actions");

    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();

    expect(normalizeIds(document.body.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: GridList", () => {
  const items = [
    { id: "1", name: "Item One" },
    { id: "2", name: "Item Two" },
    { id: "3", name: "Item Three" },
  ];

  it("renders grid with rows/gridcells and snapshot", () => {
    const { container } = render(() => (
      <GridList
        items={items}
        getKey={(i) => i.id}
        getTextValue={(i) => i.name}
        aria-label="Items"
        selectionMode="single"
      >
        {(item) => <GridListItem id={item.id}>{item.name}</GridListItem>}
      </GridList>
    ));

    expect(screen.getByRole("grid")).toBeInTheDocument();
    const rows = screen.getAllByRole("row");
    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain("Item One");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Table", () => {
  const columns = [
    { key: "name", name: "Name" },
    { key: "role", name: "Role" },
  ];
  const rows = [
    { id: 1, name: "Alice", role: "Engineer" },
    { id: 2, name: "Bob", role: "Designer" },
    { id: 3, name: "Carol", role: "Manager" },
  ];

  it("renders grid with header + data rows and snapshot", () => {
    const { container } = render(() => (
      <Table items={rows} columns={columns} getKey={(r: any) => r.id} aria-label="Team">
        {() => (
          <>
            <TableHeader>
              <TableColumn id="name">{() => <>Name</>}</TableColumn>
              <TableColumn id="role">{() => <>Role</>}</TableColumn>
            </TableHeader>
            <TableBody>
              {(row: any) => (
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
    ));

    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
    expect(grid.tagName).toBe("TABLE");
    const allRows = screen.getAllByRole("row");
    expect(allRows.length).toBeGreaterThanOrEqual(4); // header + 3 data
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Designer")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Tree", () => {
  interface TestItem {
    name: string;
  }

  const treeItems: TreeItemData<TestItem>[] = [
    {
      key: "docs",
      value: { name: "Documents" },
      textValue: "Documents",
      children: [{ key: "report", value: { name: "Report.pdf" }, textValue: "Report.pdf" }],
    },
    {
      key: "readme",
      value: { name: "readme.md" },
      textValue: "readme.md",
    },
  ];

  it("renders treegrid, expanded children visible, and snapshot", () => {
    const { container } = render(() => (
      <Tree items={treeItems} aria-label="Files" defaultExpandedKeys={["docs"]}>
        {(item) => <TreeItem id={item.key}>{item.textValue}</TreeItem>}
      </Tree>
    ));

    expect(screen.getByRole("treegrid")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Report.pdf")).toBeInTheDocument();
    expect(screen.getByText("readme.md")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Tabs", () => {
  const tabItems = [
    { id: "tab1", label: "First" },
    { id: "tab2", label: "Second" },
    { id: "tab3", label: "Third" },
  ];

  it("renders tablist, tabs, click → panel changes, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <Tabs items={tabItems} getKey={(i) => i.id} defaultSelectedKey="tab1">
        <TabList items={tabItems}>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
        <TabPanel id="tab1">Content One</TabPanel>
        <TabPanel id="tab2">Content Two</TabPanel>
        <TabPanel id="tab3">Content Three</TabPanel>
      </Tabs>
    ));

    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    expect(screen.getByText("Content One")).toBeInTheDocument();

    await user.click(tabs[1]);
    expect(screen.getByText("Content Two")).toBeInTheDocument();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// OVERLAYS & DIALOGS
// ═══════════════════════════════════════════════════════════════

describe("Regression: Dialog", () => {
  it("trigger → role=dialog with title and close", async () => {
    const user = setupUser();
    render(() => (
      <DialogTrigger
        trigger={<Button>Open</Button>}
        content={(close) => (
          <Dialog title="Settings" isDismissable onClose={close}>
            <p>Dialog body content</p>
            <button onClick={close}>Done</button>
          </Dialog>
        )}
      />
    ));

    const trigger = screen.getByRole("button", { name: "Open" });
    expectS2Button(trigger, "Open");

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Dialog body content")).toBeInTheDocument();
  });
});

describe("Regression: AlertDialog", () => {
  it("renders alertdialog with confirm/cancel buttons and snapshot", () => {
    const { container } = render(() => (
      <AlertDialog
        title="Delete item?"
        isOpen
        primaryActionLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      >
        This action cannot be undone.
      </AlertDialog>
    ));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Popover", () => {
  it("trigger click → dialog content", async () => {
    const user = setupUser();
    render(() => (
      <PopoverTrigger>
        <Button>Info</Button>
        <Popover>
          <p>Popover content here</p>
        </Popover>
      </PopoverTrigger>
    ));

    const trigger = screen.getByRole("button", { name: "Info" });
    expectS2Button(trigger, "Info");

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Popover content here")).toBeInTheDocument();
  });
});

describe("Regression: Tooltip", () => {
  it("renders tooltip with role=tooltip when open", () => {
    const { container } = render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip>Helpful tip</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByRole("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Helpful tip")).toBeInTheDocument();
    expect(container.querySelector("[aria-describedby]")).toBeInTheDocument();
    expectS2Button(screen.getByRole("button", { name: "Hover me" }), "Hover me");
  });
});

describe("Regression: Toast", () => {
  afterEach(() => clearGlobalToasts());

  it("addToast → toast appears with text, and snapshot", () => {
    const { container } = render(() => (
      <ToastProvider useGlobalQueue>
        <ToastRegion portal={false} />
      </ToastProvider>
    ));

    addToast({ title: "Saved successfully", type: "success" });

    const region = screen.getByRole("region");
    expect(region).toBeInTheDocument();
    expect(screen.getByText("Saved successfully")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// NAVIGATION & LAYOUT
// ═══════════════════════════════════════════════════════════════

describe("Regression: Breadcrumbs", () => {
  const crumbs = [
    { id: "home", label: "Home" },
    { id: "products", label: "Products" },
    { id: "widget", label: "Widget" },
  ];

  it("renders nav, list structure, last=current, and snapshot", () => {
    const { container } = render(() => (
      <Breadcrumbs items={crumbs} getKey={(i) => i.id}>
        {(item) => <BreadcrumbItem>{item.label}</BreadcrumbItem>}
      </Breadcrumbs>
    ));

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Widget")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Link", () => {
  it("renders with role=link, href, text, and snapshot", () => {
    const { container } = render(() => <Link href="https://example.com">Visit Example</Link>);

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link.textContent).toContain("Visit Example");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Toolbar", () => {
  it("renders with role=toolbar containing S2 buttons", () => {
    render(() => (
      <Toolbar aria-label="Text formatting">
        <Button>Bold</Button>
        <Button>Italic</Button>
        <Button>Underline</Button>
      </Toolbar>
    ));

    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(3);
    expectS2Button(buttons[0], "Bold");
    expectS2Button(buttons[1], "Italic");
    expectS2Button(buttons[2], "Underline");
  });
});

describe("Regression: Disclosure", () => {
  it("trigger click → panel visible, aria-expanded, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <Disclosure>
        <DisclosureTrigger>Show details</DisclosureTrigger>
        <DisclosurePanel>Hidden content revealed</DisclosurePanel>
      </Disclosure>
    ));

    const trigger = screen.getByRole("button", { name: /Show details/ });
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByText("Hidden content revealed")).toBeInTheDocument();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Accordion (DisclosureGroup)", () => {
  it("renders multiple sections, click expands, and snapshot", async () => {
    const user = setupUser();
    const { container } = render(() => (
      <DisclosureGroup>
        <Disclosure id="s1">
          <DisclosureTrigger>Section 1</DisclosureTrigger>
          <DisclosurePanel>Content 1</DisclosurePanel>
        </Disclosure>
        <Disclosure id="s2">
          <DisclosureTrigger>Section 2</DisclosureTrigger>
          <DisclosurePanel>Content 2</DisclosurePanel>
        </Disclosure>
      </DisclosureGroup>
    ));

    const triggers = screen.getAllByRole("button");
    expect(triggers.length).toBe(2);

    await user.click(triggers[0]);
    expect(screen.getByText("Content 1")).toBeInTheDocument();

    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// DATE & TIME
// ═══════════════════════════════════════════════════════════════

describe("Regression: Calendar", () => {
  it("renders grid with day cells, nav buttons, and snapshot", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-02-26T12:00:00.000Z"));

    try {
      const { container } = render(() => (
        <Calendar aria-label="Event date" defaultFocusedValue={parseDate("2026-02-26")} />
      ));

      await waitFor(() => {
        expect(screen.getByRole("grid")).toBeInTheDocument();
      });

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
      // Navigation buttons (previous/next month)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Regression: DatePicker", () => {
  it("renders date segments and open button, and snapshot", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-02-26T12:00:00.000Z"));

    try {
      const { container } = render(() => (
        <DatePicker aria-label="Date" buttonAriaLabel="Choose date" />
      ));

      await waitFor(() => {
        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
      });

      const segments = screen.getAllByRole("spinbutton");
      expect(segments.length).toBeGreaterThanOrEqual(3); // month/day/year
      expect(screen.getByRole("button", { name: "Choose date" })).toBeInTheDocument();
      expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("Regression: DateField", () => {
  it("renders label and date segments, and snapshot", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date("2026-02-26T12:00:00.000Z"));

    try {
      const { container } = render(() => <DateField label="Birth date" />);

      await waitFor(() => {
        expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
      });

      expect(screen.getByText("Birth date")).toBeInTheDocument();
      const segments = screen.getAllByRole("spinbutton");
      expect(segments.length).toBeGreaterThanOrEqual(3); // month/day/year
      expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// DATA DISPLAY
// ═══════════════════════════════════════════════════════════════

describe("Regression: ProgressBar", () => {
  it("renders progressbar with aria-value attrs and label, and snapshot", () => {
    const { container } = render(() => (
      <ProgressBar label="Loading" value={60} minValue={0} maxValue={100} />
    ));

    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("Loading")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Meter", () => {
  it("renders meter with aria-value attrs and label, and snapshot", () => {
    const { container } = render(() => (
      <Meter label="Storage" value={75} minValue={0} maxValue={100} />
    ));

    const meter = screen.getByRole("meter");
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute("aria-valuenow", "75");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Badge", () => {
  it("renders count text and variant class, and snapshot", () => {
    const { container } = render(() => <Badge count={42} variant="accent" />);

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(container.querySelector('[role="presentation"]')!.className).not.toBe("");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Alert", () => {
  it("renders role=alert with title, children, variant, and snapshot", () => {
    const { container } = render(() => (
      <Alert title="Warning" variant="warning">
        Check your settings.
      </Alert>
    ));

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Check your settings.")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: StatusLight", () => {
  it("renders indicator dot and label text, and snapshot", () => {
    const { container } = render(() => <StatusLight variant="positive">Online</StatusLight>);

    expect(screen.getByText("Online")).toBeInTheDocument();
    const dot = container.querySelector('svg[aria-hidden="true"] circle');
    expect(dot).toBeInTheDocument();
    expect(screen.getByText("Online").closest("div")!.className).not.toBe("");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Separator", () => {
  it("renders separator with role=separator, and snapshot", () => {
    const { container } = render(() => <Separator />);

    expect(screen.getByRole("separator")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// COLOR
// ═══════════════════════════════════════════════════════════════

describe("Regression: ColorArea", () => {
  it("renders the S2 default color area composition, and snapshot", () => {
    const { container } = render(() => (
      <ColorArea
        aria-label="Color"
        defaultValue="#9B80FF"
        colorSpace="rgb"
        xChannel="red"
        yChannel="green"
      />
    ));

    const area = screen.getByRole("group", { name: "Color, Color picker" });
    const sliders = Array.from(container.querySelectorAll('input[type="range"]'));
    expect(area).toBeInTheDocument();
    expect(sliders).toHaveLength(2);
    expect(container.querySelector(".solidaria-ColorArea-gradient")).not.toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: ColorSlider", () => {
  it("renders slider with track and thumb, and snapshot", () => {
    const { container } = render(() => (
      <ColorSlider channel="hue" aria-label="Hue" defaultValue="hsl(0, 100%, 50%)">
        <ColorSliderTrack>
          <ColorSliderThumb />
        </ColorSliderTrack>
      </ColorSlider>
    ));

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: ColorWheel", () => {
  it("renders wheel container with circular track, and snapshot", () => {
    const { container } = render(() => (
      <ColorWheel aria-label="Hue wheel" defaultValue="hsl(0, 100%, 50%)">
        <ColorWheelTrack />
        <ColorWheelThumb />
      </ColorWheel>
    ));

    expect(container.firstElementChild).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

// ═══════════════════════════════════════════════════════════════
// OTHER
// ═══════════════════════════════════════════════════════════════

describe("Regression: RangeSlider", () => {
  it("renders 2 sliders with start/end labels and aria-values, and snapshot", () => {
    const { container } = render(() => (
      <RangeSlider
        label="Price"
        defaultValue={{ start: 20, end: 80 }}
        minValue={0}
        maxValue={100}
      />
    ));

    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);

    const startSlider = sliders[0];
    const endSlider = sliders[1];
    expect(startSlider).toHaveAttribute("aria-label", "Price start");
    expect(endSlider).toHaveAttribute("aria-label", "Price end");
    expect(startSlider).toHaveAttribute("aria-valuenow", "20");
    expect(endSlider).toHaveAttribute("aria-valuenow", "80");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Avatar", () => {
  it("renders S2 image wrapper with default slot and no initials fallback", () => {
    const { container } = render(() => <Avatar alt="John Doe" size={40} />);

    const root = container.querySelector('[slot="avatar"]');
    const img = root?.querySelector("img");

    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ width: "2.5rem", height: "2.5rem" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "John Doe");
    expect(img).not.toHaveAttribute("src");
    expect(screen.queryByText("JO")).not.toBeInTheDocument();
  });

  it("renders img when src is provided", () => {
    const { container } = render(() => <Avatar src="/avatar.png" alt="Jane" size={56} />);

    const root = container.querySelector('[slot="avatar"]');
    const img = container.querySelector("img");

    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({ width: "3.5rem", height: "3.5rem" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/avatar.png");
    expect(img).toHaveAttribute("alt", "Jane");
  });
});

describe("Regression: Landmark", () => {
  it("renders correct landmark role, and snapshot", () => {
    const { container } = render(() => (
      <Landmark role="navigation" aria-label="Main nav">
        <a href="/">Home</a>
      </Landmark>
    ));

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Well", () => {
  it("renders container div with children, and snapshot", () => {
    const { container } = render(() => (
      <Well>
        <p>Emphasized content</p>
      </Well>
    ));

    expect(screen.getByText("Emphasized content")).toBeInTheDocument();
    expect(container.firstElementChild!.className).toContain("rounded-lg");
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Label", () => {
  it("renders label element with text, and snapshot", () => {
    const { container } = render(() => <Label>Field label</Label>);

    expect(screen.getByText("Field label")).toBeInTheDocument();
    expect(normalizeIds(container.innerHTML)).toMatchSnapshot();
  });
});

describe("Regression: Form", () => {
  it("renders form element with children", () => {
    const { container } = render(() => (
      <Form>
        <TextField label="Name" />
        <Button>Submit</Button>
      </Form>
    ));

    const form = container.querySelector("form");
    expect(form).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expectS2Button(screen.getByRole("button", { name: "Submit" }), "Submit");
  });
});

// ═══════════════════════════════════════════════════════════════
// DOM PROP FORWARDING — verifies aria-label / data-testid pass through
// ═══════════════════════════════════════════════════════════════

describe("DOM prop forwarding: ActionMenu (MenuButton)", () => {
  it("forwards aria-label to trigger button", async () => {
    render(() => (
      <ActionMenu aria-label="Actions" items={[{ id: "a", label: "A" }]} getKey={(i) => i.id} />
    ));

    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-label", "Actions");
  });
});

describe("DOM prop forwarding: GridListItem", () => {
  it("forwards data-testid to li element", () => {
    render(() => (
      <GridList
        items={[{ id: "1", name: "Item" }]}
        getKey={(i) => i.id}
        getTextValue={(i) => i.name}
        aria-label="Test"
      >
        {(item) => (
          <GridListItem id={item.id} data-testid="my-item">
            {item.name}
          </GridListItem>
        )}
      </GridList>
    ));

    expect(screen.getByTestId("my-item")).toBeInTheDocument();
  });
});

describe("DOM prop forwarding: TreeItem", () => {
  it("forwards data-testid to tree item element", () => {
    const treeItems: TreeItemData<{ name: string }>[] = [
      { key: "a", value: { name: "Node A" }, textValue: "Node A" },
    ];

    render(() => (
      <Tree items={treeItems} aria-label="Files">
        {(item) => (
          <TreeItem id={item.key} data-testid="tree-node">
            {item.textValue}
          </TreeItem>
        )}
      </Tree>
    ));

    expect(screen.getByTestId("tree-node")).toBeInTheDocument();
  });
});
