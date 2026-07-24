import { createFileRoute } from "@tanstack/solid-router";
import { Picker, PickerItem, PickerSection } from "@proyecto-viviana/solid-spectrum";
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
      description="Picker is a styled single-selection control that combines a trigger, the selected value, and a popover listbox. It is Spectrum 2's select — built on the collection stack so it takes either static items or an items collection with a render function."
      importCode={`import {
  Picker,
  PickerItem,
  PickerSection
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Static items"
        description="Pass PickerItem children directly for a fixed set of options. defaultSelectedKey seeds the uncontrolled selection."
        code={`<Picker label="Plan" defaultSelectedKey="pro">
  <PickerItem id="free">Free</PickerItem>
  <PickerItem id="pro">Pro</PickerItem>
  <PickerItem id="team">Team</PickerItem>
  <PickerItem id="enterprise">Enterprise</PickerItem>
</Picker>`}
      >
        <Picker label="Plan" defaultSelectedKey="pro">
          <PickerItem id="free">Free</PickerItem>
          <PickerItem id="pro">Pro</PickerItem>
          <PickerItem id="team">Team</PickerItem>
          <PickerItem id="enterprise">Enterprise</PickerItem>
        </Picker>
      </Example>

      <Example
        title="Dynamic collection"
        description="Pass an items array and a render function to build options from data. Each item needs a stable id and textValue for typeahead."
        code={`<Picker aria-label="Plan" items={plans} defaultSelectedKey="free">
  {(item) => (
    <PickerItem id={item.id} textValue={item.name}>
      {item.name}
    </PickerItem>
  )}
</Picker>`}
      >
        <Picker aria-label="Plan" items={plans} defaultSelectedKey="free">
          {(item) => (
            <PickerItem id={item.id} textValue={item.name}>
              {item.name}
            </PickerItem>
          )}
        </Picker>
      </Example>

      <Example
        title="Sections and disabled"
        description="Group options with PickerSection, and mark unavailable ones with disabledKeys."
        code={`<Picker label="Plan" disabledKeys={["enterprise"]}>
  <PickerSection title="Personal">
    <PickerItem id="free">Free</PickerItem>
    <PickerItem id="pro">Pro</PickerItem>
  </PickerSection>
  <PickerSection title="Organization">
    <PickerItem id="team">Team</PickerItem>
    <PickerItem id="enterprise">Enterprise</PickerItem>
  </PickerSection>
</Picker>`}
      >
        <Picker label="Plan" disabledKeys={["enterprise"]}>
          <PickerSection title="Personal">
            <PickerItem id="free">Free</PickerItem>
            <PickerItem id="pro">Pro</PickerItem>
          </PickerSection>
          <PickerSection title="Organization">
            <PickerItem id="team">Team</PickerItem>
            <PickerItem id="enterprise">Enterprise</PickerItem>
          </PickerSection>
        </Picker>
      </Example>

      <h2>Picker Props</h2>
      <PropsTable
        props={[
          { name: "label", type: "string", description: "Visible label rendered above the trigger" },
          {
            name: "items",
            type: "Iterable<T>",
            description: "Data collection rendered via the children render function",
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
            type: "JSX.Element | (item: T) => JSX.Element",
            description: "PickerItem/PickerSection elements, or a render function for items",
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
