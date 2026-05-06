import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { TextField } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/textfield")({
  component: TextFieldPage,
});

function TextFieldPage() {
  const [value, setValue] = createSignal("");

  return (
    <DocPage
      title="TextField"
      description="TextFields allow users to enter and edit text. They support various input types, validation, and accessibility features."
      importCode={`import { TextField } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A simple text input with a label."
        code={`<TextField label="Name" placeholder="Enter your name" />`}
      >
        <div class="max-w-xs">
          <TextField label="Name" placeholder="Enter your name" />
        </div>
      </Example>

      <Example
        title="Controlled Input"
        description="Control the input value with state."
        code={`const [value, setValue] = createSignal("");

<TextField
  label="Email"
  value={value()}
  onChange={setValue}
/>`}
      >
        <div class="max-w-xs">
          <TextField
            label="Email"
            value={value()}
            onChange={setValue}
            placeholder="you@example.com"
          />
          <p class="mt-2 text-sm text-bg-500">Value: {value() || "(empty)"}</p>
        </div>
      </Example>

      <Example
        title="With Description"
        description="Add helper text to provide additional context."
        code={`<TextField
  label="Username"
  description="Must be 3-20 characters, letters and numbers only"
/>`}
      >
        <div class="max-w-xs">
          <TextField
            label="Username"
            description="Must be 3-20 characters, letters and numbers only"
            placeholder="johndoe123"
          />
        </div>
      </Example>

      <Example
        title="Error State"
        description="Display validation errors to the user."
        code={`<TextField
  label="Email"
  errorMessage="Please enter a valid email address"
  isInvalid
/>`}
      >
        <div class="max-w-xs">
          <TextField
            label="Email"
            errorMessage="Please enter a valid email address"
            isInvalid
            defaultValue="not-an-email"
          />
        </div>
      </Example>

      <Example
        title="Required Field"
        description="Mark fields as required with visual indicator."
        code={`<TextField label="Email" isRequired />`}
      >
        <div class="max-w-xs">
          <TextField label="Email" isRequired placeholder="Required field" />
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="Disabled fields cannot be edited."
        code={`<TextField label="Read-only field" isDisabled defaultValue="Cannot edit" />`}
      >
        <div class="max-w-xs">
          <TextField label="Disabled field" isDisabled defaultValue="Cannot edit this" />
        </div>
      </Example>

      <Example
        title="Input Types"
        description="Specify different input types for validation and mobile keyboards."
        code={`<TextField label="Email" type="email" />
<TextField label="Password" type="password" />
<TextField label="Phone" type="tel" />`}
      >
        <div class="max-w-xs space-y-4">
          <TextField label="Email" type="email" placeholder="you@example.com" />
          <TextField label="Password" type="password" placeholder="••••••••" />
          <TextField label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
        </div>
      </Example>

      <Example
        title="Filled Variant"
        description="Use the filled visual variant for denser surfaces."
        code={`<TextField
  label="Display name"
  variant="filled"
  placeholder="Enter your display name"
/>`}
      >
        <div class="max-w-xs">
          <TextField label="Display name" variant="filled" placeholder="Enter your display name" />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Field label (required for accessibility)",
          },
          {
            name: "description",
            type: "string",
            description: "Help text below the input",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message to display",
          },
          {
            name: "value",
            type: "string",
            description: "Input value (controlled)",
          },
          {
            name: "defaultValue",
            type: "string",
            description: "Default value (uncontrolled)",
          },
          {
            name: "onChange",
            type: "(value: string) => void",
            description: "Handler called when value changes",
          },
          {
            name: "placeholder",
            type: "string",
            description: "Placeholder text",
          },
          {
            name: "type",
            type: "'text' | 'email' | 'password' | 'tel' | 'url' | 'search'",
            default: "'text'",
            description: "Input type",
          },
          {
            name: "variant",
            type: "'outline' | 'filled'",
            default: "'outline'",
            description: "Visual style variant",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether input is required",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether input is disabled",
          },
          {
            name: "isReadOnly",
            type: "boolean",
            default: "false",
            description: "Whether input is read-only",
          },
          {
            name: "isInvalid",
            type: "boolean",
            description: "Marks the field as invalid for styles and aria-invalid",
          },
          {
            name: "autoFocus",
            type: "boolean",
            default: "false",
            description: "Auto-focus on mount",
          },
          {
            name: "maxLength",
            type: "number",
            description: "Maximum character length",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Label is properly associated with input via <code>id</code> and <code>for</code>
          </li>
          <li>
            Description linked via <code>aria-describedby</code>
          </li>
          <li>
            Error message linked via <code>aria-describedby</code>
          </li>
          <li>
            Required state indicated via <code>aria-required</code>
          </li>
          <li>
            Invalid state indicated via <code>aria-invalid</code>
          </li>
          <li>Focus ring visible on keyboard navigation</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
