import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type SelectItem = {
  id: string;
  name: string;
  isDisabled?: boolean;
};

export const Route = createFileRoute("/solid-spectrum/docs/components/select")({
  component: SelectPage,
});

function SelectPage() {
  const [selected, setSelected] = createSignal<string | null>(null);

  const fruitOptions: SelectItem[] = [
    { id: "apple", name: "Apple" },
    { id: "banana", name: "Banana" },
    { id: "cherry", name: "Cherry" },
    { id: "date", name: "Date" },
    { id: "elderberry", name: "Elderberry" },
  ];

  const countryOptions: SelectItem[] = [
    { id: "us", name: "United States" },
    { id: "uk", name: "United Kingdom" },
    { id: "ca", name: "Canada" },
    { id: "au", name: "Australia" },
  ];

  const planOptions: SelectItem[] = [
    { id: "free", name: "Free" },
    { id: "basic", name: "Basic - $9/mo" },
    { id: "pro", name: "Pro - $29/mo" },
    { id: "enterprise", name: "Enterprise (Contact Sales)", isDisabled: true },
  ];

  return (
    <DocPage
      title="Select"
      description="Select allows users to choose a single option from a dropdown list. It's ideal for forms where space is limited."
      importCode={`import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A simple select with static options."
        code={`<Select items={items} selectedKey={selected()} onSelectionChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectListBox>
    {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
  </SelectListBox>
</Select>`}
      >
        <div class="max-w-xs">
          <Select
            label="Favorite fruit"
            items={fruitOptions}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            selectedKey={selected()}
            onSelectionChange={(key) => setSelected((key as string) ?? null)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectListBox<SelectItem>>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
          <p class="mt-2 text-sm text-bg-500">Selected: {selected() || "None"}</p>
        </div>
      </Example>

      <Example
        title="With Description"
        description="Add a description to provide additional context."
        code={`<Select label="Country" description="Select your country of residence" items={items}>...</Select>`}
      >
        <div class="max-w-xs">
          <Select
            label="Country"
            description="Select your country of residence"
            items={countryOptions}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectListBox<SelectItem>>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
        </div>
      </Example>

      <Example
        title="Disabled Options"
        description="Individual options can be disabled."
        code={`<Select items={items} getDisabled={(item) => item.isDisabled ?? false}>...</Select>`}
      >
        <div class="max-w-xs">
          <Select
            label="Plan"
            items={planOptions}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            getDisabled={(item) => item.isDisabled ?? false}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectListBox<SelectItem>>
              {(item) => (
                <SelectOption id={item.id} isDisabled={item.isDisabled}>
                  {item.name}
                </SelectOption>
              )}
            </SelectListBox>
          </Select>
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="The entire select can be disabled."
        code={`<Select label="Disabled select" isDisabled items={items}>...</Select>`}
      >
        <div class="max-w-xs">
          <Select
            label="Disabled select"
            isDisabled
            items={[{ id: "opt1", name: "Option 1" }]}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cannot select" />
            </SelectTrigger>
            <SelectListBox<SelectItem>>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
        </div>
      </Example>

      <Example
        title="Required Field"
        description="Mark the select as required for form validation."
        code={`<Select label="Required field" isRequired items={items}>...</Select>`}
      >
        <div class="max-w-xs">
          <Select
            label="Required field"
            isRequired
            items={[
              { id: "opt1", name: "Option 1" },
              { id: "opt2", name: "Option 2" },
            ]}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectListBox<SelectItem>>
              {(item) => <SelectOption id={item.id}>{item.name}</SelectOption>}
            </SelectListBox>
          </Select>
        </div>
      </Example>

      <h2>Select Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Collection of selectable items",
          },
          {
            name: "label",
            type: "string",
            description: "Label for the select field",
          },
          {
            name: "description",
            type: "string",
            description: "Help text below the select",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message to display",
          },
          {
            name: "selectedKey",
            type: "string | null",
            description: "Currently selected key (controlled)",
          },
          {
            name: "defaultSelectedKey",
            type: "string",
            description: "Default selected key (uncontrolled)",
          },
          {
            name: "onSelectionChange",
            type: "(key: string | null) => void",
            description: "Handler called when selection changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the select is disabled",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether a selection is required",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "SelectTrigger and SelectListBox",
          },
        ]}
      />

      <h2>SelectOption Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the option",
          },
          {
            name: "textValue",
            type: "string",
            description: "Text value for typeahead (defaults to children text)",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the option is disabled",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Option content",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>listbox</code> pattern with proper ARIA roles
          </li>
          <li>Full keyboard navigation: Arrow keys, Home, End, Page Up/Down</li>
          <li>Type-ahead search to quickly find options</li>
          <li>Announces selection changes to screen readers</li>
          <li>Focus trapped within popover when open</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
