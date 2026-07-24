/**
 * Every example on this page opens a populated listbox. The version this
 * replaced had three, two of which opened an EMPTY one: it demonstrated static
 * `<PickerItem>` children with no `items`, and a `title` prop on
 * `<PickerSection>`. Neither exists. Both typechecked red and rendered nothing,
 * and the page had shipped that way. Picker's collection is items-driven and
 * flat — see `tech-debt.md` → `picker-static-children-and-sections`. If you add
 * an example here, open it in a browser and count the options.
 */
import { createFileRoute } from "@tanstack/solid-router";
import { Picker, PickerItem } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

const plans = [
  { id: "free", name: "Free" },
  { id: "pro", name: "Pro" },
  { id: "team", name: "Team" },
  { id: "enterprise", name: "Enterprise" },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/picker")({
  component: PickerPage,
});

function PickerPage() {
  return (
    <DocPage
      title="Picker"
      description="Picker is a styled single-selection control that combines a trigger, the selected value, and a popover listbox. It is Spectrum 2's select. The collection is data-driven: pass an `items` array and a render function — static option JSX is not part of the Solid API, because children evaluate before the collection context exists."
      importCode={`import { Picker, PickerItem } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Options come from items"
        description="Pass an items array and a render function. Each item needs a stable id, and a textValue for typeahead when the child content is not plain text. defaultSelectedKey seeds the uncontrolled selection."
        code={`<Picker label="Plan" items={plans} defaultSelectedKey="pro">
  {(item) => (
    <PickerItem id={item.id} textValue={item.name}>
      {item.name}
    </PickerItem>
  )}
</Picker>`}
      >
        <Picker label="Plan" items={plans} defaultSelectedKey="pro">
          {(item) => (
            <PickerItem id={item.id} textValue={item.name}>
              {item.name}
            </PickerItem>
          )}
        </Picker>
      </Example>

      <Example
        title="Disabled options"
        description="disabledKeys marks individual options unselectable. They stay announced but are skipped during keyboard navigation."
        code={`<Picker aria-label="Plan" items={plans} disabledKeys={["enterprise"]}>
  {(item) => (
    <PickerItem id={item.id} textValue={item.name}>
      {item.name}
    </PickerItem>
  )}
</Picker>`}
      >
        <Picker aria-label="Plan" items={plans} disabledKeys={["enterprise"]}>
          {(item) => (
            <PickerItem id={item.id} textValue={item.name}>
              {item.name}
            </PickerItem>
          )}
        </Picker>
      </Example>

      <h2>What Picker does not do yet</h2>
      <p>
        Picker's collection is <strong>flat</strong>. There is no grouped variant:{" "}
        <code>PickerSection</code> is exported, but it is a primitive for the composed{" "}
        <code>Select</code> / <code>SelectListBox</code> assembly, not something <code>Picker</code>{" "}
        reads. It also takes no <code>title</code> — a section's heading is a <code>Header</code>{" "}
        child, as in React Aria Components.
      </p>
      <p>
        Both are gaps against React Spectrum, where static children and grouped options are ordinary
        usage. They are tracked; until they close, reach for the composed <code>Select</code>{" "}
        assembly if you need groups.
      </p>

      <h2>Picker Props</h2>
      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Visible label rendered above the trigger",
          },
          {
            name: "items",
            type: "T[]",
            description:
              "Required. The data the options are built from, rendered via the children render function",
          },
          {
            name: "selectedKey",
            type: "Key | null",
            description: "The selected item's key (controlled)",
          },
          {
            name: "defaultSelectedKey",
            type: "Key",
            description: "The initially selected item's key (uncontrolled)",
          },
          {
            name: "onSelectionChange",
            type: "(key: Key | null) => void",
            description: "Handler called when the selection changes",
          },
          {
            name: "disabledKeys",
            type: "Iterable<Key>",
            description: "Keys of items that cannot be selected",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the picker is disabled",
          },
          {
            name: "children",
            type: "(item: T) => JSX.Element",
            description: "Render function turning one item into a PickerItem",
          },
        ]}
      />

      <h2>PickerItem Props</h2>
      <PropsTable
        props={[
          { name: "id", type: "Key", description: "Unique key identifying the option" },
          {
            name: "textValue",
            type: "string",
            description: "Plain-text value used for typeahead and the selected display",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether this individual option is disabled",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          The trigger exposes a <code>button</code> with <code>aria-haspopup="listbox"</code>
        </li>
        <li>
          The dropdown is a <code>listbox</code>; options carry <code>role="option"</code> and{" "}
          <code>aria-selected</code>
        </li>
        <li>The label is associated with the trigger, or supply an aria-label</li>
        <li>Enter, Space, or Down opens the listbox; typing jumps to a matching option</li>
        <li>Arrow keys move between options; Escape closes without changing the value</li>
        <li>Disabled options are announced and skipped during navigation</li>
      </AccessibilitySection>
    </DocPage>
  );
}
