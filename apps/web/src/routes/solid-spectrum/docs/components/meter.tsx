import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Meter, Button } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/meter")({
  component: MeterPage,
});

function MeterPage() {
  const [storageUsed, setStorageUsed] = createSignal(73);

  function addFile() {
    setStorageUsed((prev) => Math.min(prev + Math.floor(Math.random() * 10 + 2), 100));
  }

  function deleteFiles() {
    setStorageUsed((prev) => Math.max(prev - Math.floor(Math.random() * 15 + 5), 0));
  }

  function storageVariant(): "success" | "warning" | "danger" {
    const used = storageUsed();
    if (used >= 90) return "danger";
    if (used >= 70) return "warning";
    return "success";
  }

  return (
    <DocPage
      title="Meter"
      description="Meter represents a quantity within a known range, such as disk usage, signal strength, or a relevance score. Unlike ProgressBar, Meter displays a static value rather than tracking progress toward completion."
      importCode={`import { Meter } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Meter"
        description="A simple meter showing a value within a range. The interactive demo simulates adding and removing files from storage."
        code={`const [storageUsed, setStorageUsed] = createSignal(73);

<Meter
  label="Storage"
  value={storageUsed()}
  variant={storageUsed() >= 90 ? 'danger' : storageUsed() >= 70 ? 'warning' : 'success'}
  valueLabel={\`\${storageUsed()}% used\`}
/>`}
      >
        <div class="space-y-4 max-w-md">
          <Meter
            label="Cloud Storage"
            value={storageUsed()}
            variant={storageVariant()}
            valueLabel={`${storageUsed()} GB of 100 GB`}
          />
          <div class="flex gap-2">
            <Button variant="secondary" onPress={addFile} isDisabled={storageUsed() >= 100}>
              Upload File
            </Button>
            <Button variant="secondary" onPress={deleteFiles} isDisabled={storageUsed() <= 0}>
              Delete Files
            </Button>
          </div>
          <p class="text-xs text-bg-400">
            {storageUsed() >= 90
              ? "Warning: Storage is nearly full!"
              : storageUsed() >= 70
                ? "Storage is getting low."
                : "Storage levels are healthy."}
          </p>
        </div>
      </Example>

      <Example
        title="Variants"
        description="Meters use color to communicate semantic meaning. Use different variants to indicate the health or status of the measured quantity."
        code={`<Meter label="CPU Usage" value={25} variant="success" />
<Meter label="Memory" value={65} variant="info" />
<Meter label="Disk I/O" value={50} variant="accent" />
<Meter label="Bandwidth" value={78} variant="warning" />
<Meter label="Error Rate" value={92} variant="danger" />`}
      >
        <div class="space-y-4 max-w-md">
          <Meter label="CPU Usage" value={25} variant="success" valueLabel="25%" />
          <Meter label="Memory" value={65} variant="info" valueLabel="65%" />
          <Meter label="Disk I/O" value={50} variant="accent" valueLabel="50%" />
          <Meter label="Bandwidth" value={78} variant="warning" valueLabel="78%" />
          <Meter label="Error Rate" value={92} variant="danger" valueLabel="92%" />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Meters are available in multiple sizes to fit different contexts."
        code={`<Meter label="Small" value={40} size="sm" />
<Meter label="Medium" value={60} size="md" />
<Meter label="Large" value={75} size="lg" />
<Meter label="Extra Large" value={85} size="lg" />`}
      >
        <div class="space-y-4 max-w-md">
          <Meter label="Small" value={40} size="sm" />
          <Meter label="Medium" value={60} size="md" />
          <Meter label="Large" value={75} size="lg" />
          <Meter label="Large (alt)" value={85} size="lg" />
        </div>
      </Example>

      <Example
        title="Without Visible Label"
        description="When the context makes the purpose clear, use aria-label instead of a visible label."
        code={`<Meter aria-label="Password strength" value={60} variant="warning" />
<Meter aria-label="Battery level" value={85} variant="success" />`}
      >
        <div class="space-y-4 max-w-md">
          <div>
            <p class="text-sm text-bg-600 mb-1">Password strength:</p>
            <Meter
              aria-label="Password strength"
              value={60}
              variant="warning"
              showValueLabel={false}
            />
          </div>
          <div>
            <p class="text-sm text-bg-600 mb-1">Battery level:</p>
            <Meter aria-label="Battery level" value={85} variant="success" showValueLabel={false} />
          </div>
          <div>
            <p class="text-sm text-bg-600 mb-1">Signal strength:</p>
            <Meter
              aria-label="Signal strength"
              value={30}
              variant="danger"
              showValueLabel={false}
            />
          </div>
        </div>
      </Example>

      <Example
        title="Custom Range and Labels"
        description="Set custom minimum and maximum values, and display custom value labels."
        code={`<Meter label="Temperature" value={72} minValue={32} maxValue={100} valueLabel="72 F" />
<Meter label="Satisfaction" value={4.2} minValue={1} maxValue={5} valueLabel="4.2 / 5" />`}
      >
        <div class="space-y-4 max-w-md">
          <Meter
            label="Temperature"
            value={72}
            minValue={32}
            maxValue={100}
            valueLabel="72 F"
            variant="warning"
          />
          <Meter
            label="Customer Satisfaction"
            value={4.2}
            minValue={1}
            maxValue={5}
            valueLabel="4.2 / 5.0"
            variant="success"
          />
          <Meter
            label="Relevance Score"
            value={850}
            minValue={0}
            maxValue={1000}
            valueLabel="850 / 1000"
            variant="accent"
          />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "value",
            type: "number",
            description: "Current meter value",
          },
          {
            name: "label",
            type: "string",
            description: "Visible label displayed above the meter",
          },
          {
            name: "variant",
            type: "'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'",
            default: "'primary'",
            description: "Color variant to communicate semantic meaning",
          },
          {
            name: "size",
            type: "'S' | 'M' | 'L' | 'XL'",
            default: "'M'",
            description: "Size of the meter bar",
          },
          {
            name: "showValueLabel",
            type: "boolean",
            default: "true",
            description: "Whether to display the value text",
          },
          {
            name: "minValue",
            type: "number",
            default: "0",
            description: "Minimum value of the range",
          },
          {
            name: "maxValue",
            type: "number",
            default: "100",
            description: "Maximum value of the range",
          },
          {
            name: "valueLabel",
            type: "string",
            description: "Custom text to display as the value (overrides default percentage)",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label when no visible label is provided",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="meter"</code>
          </li>
          <li>
            Exposes <code>aria-valuenow</code>, <code>aria-valuemin</code>, and{" "}
            <code>aria-valuemax</code>
          </li>
          <li>
            Label is linked via <code>aria-labelledby</code> for screen reader association
          </li>
          <li>
            Custom value labels are exposed as <code>aria-valuetext</code>
          </li>
          <li>
            Distinct from progress bars: meters represent a static measurement, not ongoing progress
          </li>
          <li>Color is not the sole indicator of meaning; labels provide context</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
