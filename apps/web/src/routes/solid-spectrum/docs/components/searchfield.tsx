import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { SearchField } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/searchfield")({
  component: SearchFieldPage,
});

function SearchFieldPage() {
  const [value, setValue] = createSignal("");
  const [lastSearch, setLastSearch] = createSignal("");

  return (
    <DocPage
      title="SearchField"
      description="A search input with a built-in clear button and optional search icon. Supports submit events, clear events, and keyboard shortcuts (Escape to clear)."
      importCode={`import { SearchField } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A search field with a clear button and submit handler."
        code={`<SearchField
  label="Search"
  placeholder="Search for items..."
  onSubmit={(value) => console.log('Search:', value)}
  onClear={() => console.log('Cleared')}
/>`}
      >
        <Flex direction="column" gap={2} style={{ "max-width": "24rem" }}>
          <SearchField
            label="Search"
            placeholder="Search for items..."
            value={value()}
            onChange={setValue}
            onSubmit={(v) => setLastSearch(v)}
            onClear={() => {
              setValue("");
              setLastSearch("");
            }}
          />
          <p class={typeRoles.meta}>Last search: {lastSearch() || "none"}</p>
        </Flex>
      </Example>

      <Example
        title="Sizes"
        description="Three size variants to fit different layout contexts."
        code={`<SearchField label="Small" size="sm" placeholder="Search..." />
<SearchField label="Medium" size="md" placeholder="Search..." />
<SearchField label="Large" size="lg" placeholder="Search..." />`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <SearchField label="Small" size="sm" placeholder="Search..." />
          <SearchField label="Medium" size="md" placeholder="Search..." />
          <SearchField label="Large" size="lg" placeholder="Search..." />
        </Flex>
      </Example>

      <Example
        title="Variants"
        description="Outline and filled visual styles."
        code={`<SearchField label="Outline" variant="outline" placeholder="Search..." />
<SearchField label="Filled" variant="filled" placeholder="Search..." />`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <SearchField label="Outline (default)" variant="outline" placeholder="Search..." />
          <SearchField label="Filled" variant="filled" placeholder="Search..." />
        </Flex>
      </Example>

      <Example
        title="With Description"
        description="Add helper text below the field."
        code={`<SearchField
  label="Product Search"
  placeholder="Enter product name or SKU..."
  description="Press Enter to search, Escape to clear"
/>`}
      >
        <div style={{ "max-width": "24rem" }}>
          <SearchField
            label="Product Search"
            placeholder="Enter product name or SKU..."
            description="Press Enter to search, Escape to clear"
          />
        </div>
      </Example>

      <Example
        title="States"
        description="Disabled and invalid states."
        code={`<SearchField label="Disabled" defaultValue="can't change" isDisabled />
<SearchField label="Invalid" defaultValue="bad query" isInvalid errorMessage="Invalid search" />`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <SearchField label="Disabled" defaultValue="can't change" isDisabled />
          <SearchField
            label="Invalid"
            defaultValue="bad query"
            isInvalid
            errorMessage="Invalid search query"
          />
        </Flex>
      </Example>

      <PropsTable
        props={[
          { name: "label", type: "string", description: "Visible label for the field" },
          { name: "value", type: "string", description: "Controlled value" },
          { name: "defaultValue", type: "string", description: "Uncontrolled initial value" },
          {
            name: "onChange",
            type: "(value: string) => void",
            description: "Called on every keystroke",
          },
          {
            name: "onSubmit",
            type: "(value: string) => void",
            description: "Called when Enter is pressed",
          },
          {
            name: "onClear",
            type: "() => void",
            description: "Called when the clear button is clicked or Escape pressed",
          },
          { name: "placeholder", type: "string", description: "Placeholder text" },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Size variant",
          },
          {
            name: "variant",
            type: "'outline' | 'filled'",
            default: "'outline'",
            description: "Visual style",
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
          { name: "description", type: "string", description: "Helper text below the field" },
        ]}
      />

      <AccessibilitySection>
        <li>
          Uses <code>role="searchbox"</code> for proper semantics
        </li>
        <li>Clear button has an accessible label ("Clear search")</li>
        <li>Escape key clears the field and refocuses it</li>
        <li>
          Enter key triggers the <code>onSubmit</code> callback
        </li>
        <li>
          Works with <code>aria-label</code> if no visible label is provided
        </li>
      </AccessibilitySection>
    </DocPage>
  );
}
