import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { TextArea } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/textarea")({
  component: TextAreaPage,
});

function TextAreaPage() {
  const [value, setValue] = createSignal("");

  return (
    <DocPage
      title="TextArea"
      description="A multi-line text input with label, description, and validation support. Shares the same accessibility and styling patterns as TextField."
      importCode={`import { TextArea } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A controlled multi-line text input."
        code={`const [value, setValue] = createSignal('');

<TextArea
  label="Description"
  value={value()}
  onChange={setValue}
  placeholder="Enter a description..."
  description="Tell us about yourself"
/>`}
      >
        <div class="max-w-sm space-y-2">
          <TextArea
            label="Description"
            value={value()}
            onChange={setValue}
            placeholder="Enter a description..."
            description="Tell us about yourself"
          />
          <p class="text-sm text-primary-400">Characters: {value().length}</p>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Small, medium, and large size variants."
        code={`<TextArea label="Small" size="sm" placeholder="Small..." />
<TextArea label="Medium" size="md" placeholder="Medium..." />
<TextArea label="Large" size="lg" placeholder="Large..." />`}
      >
        <div class="space-y-4 max-w-sm">
          <TextArea label="Small" size="sm" placeholder="Small textarea..." />
          <TextArea label="Medium" size="md" placeholder="Medium textarea..." />
          <TextArea label="Large" size="lg" placeholder="Large textarea..." />
        </div>
      </Example>

      <Example
        title="Validation"
        description="Required and invalid states with error messages."
        code={`<TextArea label="Required" isRequired placeholder="Required field" />
<TextArea
  label="With Error"
  isInvalid
  errorMessage="This field is required"
/>`}
      >
        <div class="space-y-4 max-w-sm">
          <TextArea label="Required Field" isRequired placeholder="This field is required" />
          <TextArea
            label="With Error"
            defaultValue="bad input"
            isInvalid
            errorMessage="Please enter a valid description (min 20 chars)"
          />
        </div>
      </Example>

      <Example
        title="Variants"
        description="Outline and filled visual styles."
        code={`<TextArea label="Outline" variant="outline" placeholder="Outline style" />
<TextArea label="Filled" variant="filled" placeholder="Filled style" />`}
      >
        <div class="space-y-4 max-w-sm">
          <TextArea label="Outline (default)" variant="outline" placeholder="Outline style..." />
          <TextArea label="Filled" variant="filled" placeholder="Filled style..." />
        </div>
      </Example>

      <Example
        title="Disabled"
        description="A disabled TextArea cannot be edited."
        code={`<TextArea label="Disabled" value="Cannot edit this" isDisabled />`}
      >
        <div class="max-w-sm">
          <TextArea
            label="Disabled"
            value="This content cannot be modified by the user."
            isDisabled
          />
        </div>
      </Example>

      <PropsTable
        props={[
          { name: "label", type: "string", description: "Visible label" },
          { name: "value", type: "string", description: "Controlled value" },
          { name: "defaultValue", type: "string", description: "Uncontrolled initial value" },
          {
            name: "onChange",
            type: "(value: string) => void",
            description: "Called on every keystroke",
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
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Marks field as required",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Shows error styling",
          },
          { name: "errorMessage", type: "string", description: "Validation error message" },
          { name: "description", type: "string", description: "Helper text below the field" },
          { name: "rows", type: "number", description: "Initial number of visible text rows" },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses native <code>&lt;textarea&gt;</code> for proper semantics
          </li>
          <li>
            Label is associated via <code>htmlFor</code> / <code>id</code>
          </li>
          <li>
            Error messages linked with <code>aria-describedby</code>
          </li>
          <li>
            Required state communicated via <code>aria-required</code>
          </li>
          <li>
            Invalid state communicated via <code>aria-invalid</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
