import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Checkbox, CheckboxGroup } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/checkbox")({
  component: CheckboxPage,
});

function CheckboxPage() {
  const [selected, setSelected] = createSignal(false);
  const [groupValues, setGroupValues] = createSignal<string[]>(["notifications"]);

  return (
    <DocPage
      title="Checkbox"
      description="Checkboxes allow users to select one or more items from a set, or to turn an option on or off."
      importCode={`import { Checkbox, CheckboxGroup } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A single checkbox for toggling a boolean option."
        code={`<Checkbox isSelected={selected()} onChange={setSelected}>
  Accept terms and conditions
</Checkbox>`}
      >
        <Checkbox isSelected={selected()} onChange={setSelected}>
          Accept terms and conditions
        </Checkbox>
        <p class="mt-2 text-sm text-bg-500">Selected: {selected() ? "Yes" : "No"}</p>
      </Example>

      <Example
        title="Indeterminate State"
        description="The indeterminate state indicates a partial selection, commonly used in 'select all' scenarios."
        code={`<Checkbox isIndeterminate>Select all items</Checkbox>`}
      >
        <Checkbox isIndeterminate>Select all items</Checkbox>
      </Example>

      <Example
        title="Disabled State"
        description="Disabled checkboxes cannot be interacted with."
        code={`<Checkbox isDisabled>Disabled option</Checkbox>
<Checkbox isDisabled isSelected>Disabled selected</Checkbox>`}
      >
        <div class="space-y-2">
          <Checkbox isDisabled>Disabled option</Checkbox>
          <Checkbox isDisabled isSelected>
            Disabled selected
          </Checkbox>
        </div>
      </Example>

      <Example
        title="Checkbox Group"
        description="Group multiple checkboxes with a shared label and state management."
        code={`<CheckboxGroup
  label="Notification preferences"
  value={groupValues()}
  onChange={setGroupValues}
>
  <Checkbox value="email">Email notifications</Checkbox>
  <Checkbox value="sms">SMS notifications</Checkbox>
  <Checkbox value="push">Push notifications</Checkbox>
</CheckboxGroup>`}
      >
        <CheckboxGroup
          label="Notification preferences"
          value={groupValues()}
          onChange={setGroupValues}
        >
          <Checkbox value="email">Email notifications</Checkbox>
          <Checkbox value="sms">SMS notifications</Checkbox>
          <Checkbox value="push">Push notifications</Checkbox>
        </CheckboxGroup>
        <p class="mt-2 text-sm text-bg-500">Selected: {groupValues().join(", ") || "None"}</p>
      </Example>

      <Example
        title="Sizes"
        description="Checkboxes come in small, medium, and large sizes."
        code={`<Checkbox size="sm">Small</Checkbox>
<Checkbox size="md">Medium</Checkbox>
<Checkbox size="lg">Large</Checkbox>`}
      >
        <div class="flex items-center gap-6">
          <Checkbox size="sm">Small</Checkbox>
          <Checkbox size="md">Medium</Checkbox>
          <Checkbox size="lg">Large</Checkbox>
        </div>
      </Example>

      <h2>Checkbox Props</h2>
      <PropsTable
        props={[
          {
            name: "isSelected",
            type: "boolean",
            default: "false",
            description: "Whether the checkbox is selected",
          },
          {
            name: "defaultSelected",
            type: "boolean",
            default: "false",
            description: "Default selected state (uncontrolled)",
          },
          {
            name: "onChange",
            type: "(isSelected: boolean) => void",
            description: "Handler called when selection changes",
          },
          {
            name: "isIndeterminate",
            type: "boolean",
            default: "false",
            description: "Whether the checkbox is in indeterminate state",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the checkbox is disabled",
          },
          {
            name: "isReadOnly",
            type: "boolean",
            default: "false",
            description: "Whether the checkbox is read-only",
          },
          {
            name: "value",
            type: "string",
            description: "Value for the checkbox when used in a group",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Size of the checkbox",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Label content",
          },
        ]}
      />

      <h2>CheckboxGroup Props</h2>
      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Group label for accessibility",
          },
          {
            name: "value",
            type: "string[]",
            description: "Selected values (controlled)",
          },
          {
            name: "defaultValue",
            type: "string[]",
            description: "Default selected values (uncontrolled)",
          },
          {
            name: "onChange",
            type: "(values: string[]) => void",
            description: "Handler called when selection changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether all checkboxes are disabled",
          },
          {
            name: "orientation",
            type: "'horizontal' | 'vertical'",
            default: "'vertical'",
            description: "Layout orientation",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Checkbox components",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses native <code>&lt;input type="checkbox"&gt;</code> for proper semantics
          </li>
          <li>Supports keyboard toggle via Space key</li>
          <li>
            Indeterminate state communicated via <code>aria-checked="mixed"</code>
          </li>
          <li>
            Groups use <code>role="group"</code> with <code>aria-labelledby</code>
          </li>
          <li>Focus ring visible only on keyboard navigation</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
