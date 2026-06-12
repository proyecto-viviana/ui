import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { ComboBox, ComboBoxOption, defaultContainsFilter } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/combobox")({
  component: ComboBoxPage,
});

interface FoodItem {
  id: string;
  name: string;
  category: string;
}

const foods: FoodItem[] = [
  { id: "apple", name: "Apple", category: "Fruit" },
  { id: "banana", name: "Banana", category: "Fruit" },
  { id: "cherry", name: "Cherry", category: "Fruit" },
  { id: "carrot", name: "Carrot", category: "Vegetable" },
  { id: "celery", name: "Celery", category: "Vegetable" },
  { id: "date", name: "Date", category: "Fruit" },
];

function ComboBoxPage() {
  const [selected, setSelected] = createSignal<string | number | null>(null);

  return (
    <DocPage
      title="ComboBox"
      description="A combination of a text input and a dropdown listbox. Users can type to filter the options and select from the filtered list. Fully keyboard accessible."
      importCode={`import {
  ComboBox,
  ComboBoxOption,
  defaultContainsFilter,
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic with Filtering"
        description="Type to filter the list. Press Enter or click to select."
        code={`<ComboBox
  items={foods}
  getKey={(item) => item.id}
  getTextValue={(item) => item.name}
  selectedKey={selected()}
  onSelectionChange={setSelected}
  defaultFilter={defaultContainsFilter}
  label="Select a food"
  placeholder="Type to filter..."
>
  {(item) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
</ComboBox>`}
      >
        <div class="max-w-sm space-y-2">
          <ComboBox<FoodItem>
            items={foods}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            selectedKey={selected()}
            onSelectionChange={setSelected}
            defaultFilter={defaultContainsFilter}
            label="Select a food"
            placeholder="Type to filter..."
          >
            {(item: FoodItem) => (
              <ComboBoxOption id={item.id}>
                <span class="font-medium">{item.name}</span>
                <span class="ml-2 text-xs text-primary-400">{item.category}</span>
              </ComboBoxOption>
            )}
          </ComboBox>
          <p class="text-sm text-primary-400">Selected: {selected() || "none"}</p>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Three size variants for different contexts."
        code={`<ComboBox items={foods} size="sm" label="Small" placeholder="Filter..." ...>
<ComboBox items={foods} size="md" label="Medium" placeholder="Filter..." ...>
<ComboBox items={foods} size="lg" label="Large" placeholder="Filter..." ...>`}
      >
        <div class="space-y-4 max-w-sm">
          {(["sm", "md", "lg"] as const).map((size) => (
            <ComboBox<FoodItem>
              items={foods}
              getKey={(item) => item.id}
              getTextValue={(item) => item.name}
              defaultFilter={defaultContainsFilter}
              size={size}
              label={size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
              placeholder="Filter..."
            >
              {(item: FoodItem) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
            </ComboBox>
          ))}
        </div>
      </Example>

      <Example
        title="With Description & Validation"
        description="Helper text and validation error support."
        code={`<ComboBox
  label="Required Food"
  isInvalid
  errorMessage="Please select a food item"
  ...
/>`}
      >
        <div class="space-y-4 max-w-sm">
          <ComboBox<FoodItem>
            items={foods}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            defaultFilter={defaultContainsFilter}
            label="With Description"
            placeholder="Start typing..."
            description="Choose your favorite food"
          >
            {(item: FoodItem) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBox>
          <ComboBox<FoodItem>
            items={foods}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            defaultFilter={defaultContainsFilter}
            label="Invalid"
            placeholder="Select one..."
            isInvalid
            errorMessage="Please select a valid food item"
          >
            {(item: FoodItem) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBox>
        </div>
      </Example>

      <Example
        title="Disabled"
        description="A disabled ComboBox cannot be opened or typed in."
        code={`<ComboBox isDisabled defaultSelectedKey="apple" label="Disabled" ...>`}
      >
        <div class="max-w-sm">
          <ComboBox<FoodItem>
            items={foods}
            getKey={(item) => item.id}
            getTextValue={(item) => item.name}
            defaultSelectedKey="apple"
            isDisabled
            label="Disabled ComboBox"
          >
            {(item: FoodItem) => <ComboBoxOption id={item.id}>{item.name}</ComboBoxOption>}
          </ComboBox>
        </div>
      </Example>

      <PropsTable
        props={[
          { name: "items", type: "T[]", description: "Array of items to display" },
          {
            name: "getKey",
            type: "(item: T) => string | number",
            description: "Extracts the unique key from an item",
          },
          {
            name: "getTextValue",
            type: "(item: T) => string",
            description: "Extracts the display text for filtering",
          },
          {
            name: "selectedKey",
            type: "string | number | null",
            description: "Controlled selected key",
          },
          {
            name: "defaultSelectedKey",
            type: "string | number",
            description: "Uncontrolled default selection",
          },
          {
            name: "onSelectionChange",
            type: "(key: string | number | null) => void",
            description: "Called when selection changes",
          },
          {
            name: "defaultFilter",
            type: "(item: T, inputValue: string) => boolean",
            description: "Filter function for typing (use defaultContainsFilter)",
          },
          { name: "label", type: "string", description: "Visible label" },
          { name: "placeholder", type: "string", description: "Input placeholder" },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Size variant",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Prevents interaction",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Shows error styling",
          },
          { name: "errorMessage", type: "string", description: "Validation error message" },
          { name: "description", type: "string", description: "Helper text" },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>combobox</code> ARIA role with <code>aria-expanded</code> and{" "}
            <code>aria-haspopup</code>
          </li>
          <li>Arrow keys navigate the list; Enter/Space select; Escape closes</li>
          <li>
            Active option communicated via <code>aria-activedescendant</code>
          </li>
          <li>
            Supports type-ahead filtering natively via <code>defaultFilter</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
