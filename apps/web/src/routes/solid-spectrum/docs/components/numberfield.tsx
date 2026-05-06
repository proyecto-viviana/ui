import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { NumberField } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/numberfield")({
  component: NumberFieldPage,
});

function NumberFieldPage() {
  const [quantity, setQuantity] = createSignal(1);
  const [price, setPrice] = createSignal(29.99);

  return (
    <DocPage
      title="NumberField"
      description="NumberFields allow users to enter and adjust numeric values with increment and decrement controls. They support range constraints, step values, and locale-aware formatting."
      importCode={`import { NumberField } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A simple number input with a label and stepper buttons."
        code={`<NumberField label="Quantity" defaultValue={1} />`}
      >
        <div class="max-w-xs">
          <NumberField label="Quantity" defaultValue={1} />
        </div>
      </Example>

      <Example
        title="Controlled Value"
        description="Control the number field value with state. The stepper buttons and keyboard input both update the controlled value."
        code={`const [quantity, setQuantity] = createSignal(1);

<NumberField
  label="Items"
  value={quantity()}
  onChange={setQuantity}
/>
<p>Current quantity: {quantity()}</p>`}
      >
        <div class="max-w-xs">
          <NumberField label="Items" value={quantity()} onChange={setQuantity} />
          <p class="mt-2 text-sm text-bg-500">Current quantity: {quantity()}</p>
        </div>
      </Example>

      <Example
        title="With Min and Max"
        description="Constrain the value within a minimum and maximum range. The stepper buttons disable at boundaries."
        code={`<NumberField
  label="Age"
  minValue={0}
  maxValue={120}
  defaultValue={25}
/>
<NumberField
  label="Rating (1-5)"
  minValue={1}
  maxValue={5}
  defaultValue={3}
/>`}
      >
        <div class="max-w-xs space-y-4">
          <NumberField label="Age" minValue={0} maxValue={120} defaultValue={25} />
          <NumberField label="Rating (1-5)" minValue={1} maxValue={5} defaultValue={3} />
        </div>
      </Example>

      <Example
        title="Step Values"
        description="Configure the increment/decrement step size for fine or coarse adjustments."
        code={`<NumberField
  label="Opacity"
  minValue={0}
  maxValue={1}
  step={0.1}
  defaultValue={0.5}
/>
<NumberField
  label="Quantity (step 5)"
  step={5}
  defaultValue={10}
/>`}
      >
        <div class="max-w-xs space-y-4">
          <NumberField label="Opacity" minValue={0} maxValue={1} step={0.1} defaultValue={0.5} />
          <NumberField label="Quantity (step 5)" step={5} defaultValue={10} />
        </div>
      </Example>

      <Example
        title="Currency Formatting"
        description="Use formatOptions to display values with locale-aware currency formatting."
        code={`const [price, setPrice] = createSignal(29.99);

<NumberField
  label="Price"
  value={price()}
  onChange={setPrice}
  formatOptions={{
    style: 'currency',
    currency: 'USD',
  }}
/>`}
      >
        <div class="max-w-xs">
          <NumberField
            label="Price"
            value={price()}
            onChange={setPrice}
            formatOptions={{
              style: "currency",
              currency: "USD",
            }}
          />
          <p class="mt-2 text-sm text-bg-500">Raw value: {price()}</p>
        </div>
      </Example>

      <Example
        title="Percentage Formatting"
        description="Display values as percentages. The underlying value is stored as a decimal (0-1)."
        code={`<NumberField
  label="Discount"
  defaultValue={0.15}
  minValue={0}
  maxValue={1}
  step={0.01}
  formatOptions={{
    style: 'percent',
  }}
/>`}
      >
        <div class="max-w-xs">
          <NumberField
            label="Discount"
            defaultValue={0.15}
            minValue={0}
            maxValue={1}
            step={0.01}
            formatOptions={{
              style: "percent",
            }}
          />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="NumberField supports small, medium, and large sizes."
        code={`<NumberField label="Small" size="sm" defaultValue={5} />
<NumberField label="Medium" size="md" defaultValue={10} />
<NumberField label="Large" size="lg" defaultValue={15} />`}
      >
        <div class="max-w-xs space-y-4">
          <NumberField label="Small" size="sm" defaultValue={5} />
          <NumberField label="Medium" size="md" defaultValue={10} />
          <NumberField label="Large" size="lg" defaultValue={15} />
        </div>
      </Example>

      <Example
        title="Hidden Stepper"
        description="Hide the increment/decrement buttons for a cleaner appearance. Users can still type values directly and use arrow keys."
        code={`<NumberField
  label="Score"
  hideStepper
  defaultValue={85}
/>`}
      >
        <div class="max-w-xs">
          <NumberField label="Score" hideStepper defaultValue={85} />
        </div>
      </Example>

      <Example
        title="Disabled and Invalid"
        description="NumberField supports disabled and invalid states for form integration."
        code={`<NumberField label="Disabled" isDisabled defaultValue={42} />
<NumberField
  label="Invalid"
  isInvalid
  errorMessage="Value must be between 1 and 100"
  defaultValue={150}
  maxValue={100}
/>`}
      >
        <div class="max-w-xs space-y-4">
          <NumberField label="Disabled" isDisabled defaultValue={42} />
          <NumberField
            label="Invalid"
            isInvalid
            errorMessage="Value must be between 1 and 100"
            defaultValue={150}
            maxValue={100}
          />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Label text for the number field (required for accessibility)",
          },
          {
            name: "value",
            type: "number",
            description: "The current value (controlled)",
          },
          {
            name: "defaultValue",
            type: "number",
            description: "The default value (uncontrolled)",
          },
          {
            name: "onChange",
            type: "(value: number) => void",
            description: "Handler called when the value changes",
          },
          {
            name: "minValue",
            type: "number",
            description: "The minimum allowed value",
          },
          {
            name: "maxValue",
            type: "number",
            description: "The maximum allowed value",
          },
          {
            name: "step",
            type: "number",
            default: "1",
            description: "The increment/decrement step size",
          },
          {
            name: "formatOptions",
            type: "Intl.NumberFormatOptions",
            description: "Options for locale-aware number formatting (e.g., currency, percent)",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The size of the number field",
          },
          {
            name: "variant",
            type: "'outline' | 'filled'",
            default: "'outline'",
            description: "Visual style variant",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the number field is disabled",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether the number field is required",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Whether the number field is in an invalid state",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message displayed when the field is invalid",
          },
          {
            name: "description",
            type: "string",
            description: "Help text displayed below the input",
          },
          {
            name: "hideStepper",
            type: "boolean",
            default: "false",
            description: "Whether to hide the increment/decrement stepper buttons",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="spinbutton"</code> with <code>aria-valuenow</code>,{" "}
            <code>aria-valuemin</code>, and <code>aria-valuemax</code> for screen readers
          </li>
          <li>
            Label is associated with the input via <code>aria-labelledby</code>
          </li>
          <li>
            Increment and decrement buttons have <code>aria-label</code> for screen readers
          </li>
          <li>
            Supports keyboard interaction: Arrow Up/Down to increment/decrement, Home/End for
            min/max
          </li>
          <li>Stepper buttons are automatically disabled at min/max boundaries</li>
          <li>
            Invalid state is communicated via <code>aria-invalid</code> and linked error message
          </li>
          <li>
            Description text is linked via <code>aria-describedby</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
