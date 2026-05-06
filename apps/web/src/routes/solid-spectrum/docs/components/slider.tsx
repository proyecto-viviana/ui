import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Slider } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/slider")({
  component: SliderPage,
});

function SliderPage() {
  const [volume, setVolume] = createSignal(50);

  return (
    <DocPage
      title="Slider"
      description="A range input with a draggable thumb. Supports keyboard navigation, number formatting, custom ranges, and step values."
      importCode={`import { Slider } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A controlled slider with a label and current value display."
        code={`const [volume, setVolume] = createSignal(50);

<Slider label="Volume" value={volume()} onChange={setVolume} />`}
      >
        <div class="max-w-sm space-y-2">
          <Slider label="Volume" value={volume()} onChange={setVolume} />
          <p class="text-sm text-primary-400">Value: {volume()}</p>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Three track/thumb sizes."
        code={`<Slider label="Small" defaultValue={40} size="sm" />
<Slider label="Medium" defaultValue={60} size="md" />
<Slider label="Large" defaultValue={80} size="lg" />`}
      >
        <div class="space-y-6 max-w-sm">
          <Slider label="Small" defaultValue={40} size="sm" />
          <Slider label="Medium" defaultValue={60} size="md" />
          <Slider label="Large" defaultValue={80} size="lg" />
        </div>
      </Example>

      <Example
        title="Variants"
        description="Default and accent color variants."
        code={`<Slider label="Default" defaultValue={50} variant="default" />
<Slider label="Accent" defaultValue={70} variant="accent" />`}
      >
        <div class="space-y-6 max-w-sm">
          <Slider label="Default" defaultValue={50} variant="default" />
          <Slider label="Accent" defaultValue={70} variant="accent" />
        </div>
      </Example>

      <Example
        title="Custom Range and Step"
        description="Set min, max, and step to control the allowed values."
        code={`<Slider
  label="Temperature (°C)"
  defaultValue={22}
  minValue={16}
  maxValue={30}
  step={0.5}
  showMinMax
/>`}
      >
        <div class="space-y-6 max-w-sm">
          <Slider
            label="Temperature (°C)"
            defaultValue={22}
            minValue={16}
            maxValue={30}
            step={0.5}
            showMinMax
          />
          <Slider
            label="Rating (1–5)"
            defaultValue={3}
            minValue={1}
            maxValue={5}
            step={1}
            showMinMax
          />
        </div>
      </Example>

      <Example
        title="With Number Formatting"
        description="Display values in currency or percent format."
        code={`<Slider
  label="Price"
  defaultValue={500}
  minValue={0}
  maxValue={1000}
  step={50}
  formatOptions={{ style: 'currency', currency: 'USD' }}
/>`}
      >
        <div class="space-y-6 max-w-sm">
          <Slider
            label="Price"
            defaultValue={500}
            minValue={0}
            maxValue={1000}
            step={50}
            formatOptions={{ style: "currency", currency: "USD" }}
          />
          <Slider
            label="Discount"
            defaultValue={25}
            minValue={0}
            maxValue={100}
            formatOptions={{ style: "percent", maximumFractionDigits: 0 }}
          />
        </div>
      </Example>

      <Example
        title="Disabled"
        description="A disabled slider cannot be interacted with."
        code={`<Slider label="Disabled" defaultValue={50} isDisabled />`}
      >
        <div class="max-w-sm">
          <Slider label="Disabled" defaultValue={50} isDisabled />
        </div>
      </Example>

      <PropsTable
        props={[
          { name: "label", type: "string", description: "Visible label" },
          { name: "value", type: "number", description: "Controlled value" },
          { name: "defaultValue", type: "number", description: "Uncontrolled initial value" },
          {
            name: "onChange",
            type: "(value: number) => void",
            description: "Called when the value changes",
          },
          { name: "minValue", type: "number", default: "0", description: "Minimum allowed value" },
          {
            name: "maxValue",
            type: "number",
            default: "100",
            description: "Maximum allowed value",
          },
          { name: "step", type: "number", default: "1", description: "Step increment" },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Track/thumb size",
          },
          {
            name: "variant",
            type: "'default' | 'accent'",
            default: "'default'",
            description: "Color variant",
          },
          {
            name: "formatOptions",
            type: "Intl.NumberFormatOptions",
            description: "Number formatting (currency, percent, etc.)",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Prevents interaction",
          },
          {
            name: "showOutput",
            type: "boolean",
            default: "true",
            description: "Shows current value label",
          },
          {
            name: "showMinMax",
            type: "boolean",
            default: "false",
            description: "Shows min/max labels at track ends",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Keyboard: Arrow keys adjust by one step, Page Up/Down by 10%, Home/End go to min/max
          </li>
          <li>
            Value is announced to screen readers via <code>aria-valuetext</code>
          </li>
          <li>Formatted values (currency, percent) are properly announced</li>
          <li>
            Disabled state communicated via <code>aria-disabled</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
