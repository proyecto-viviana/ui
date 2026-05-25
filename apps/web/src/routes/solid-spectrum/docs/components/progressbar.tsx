import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onCleanup } from "solid-js";
import { ProgressBar, Button } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/progressbar")({
  component: ProgressBarPage,
});

function ProgressBarPage() {
  const [uploadProgress, setUploadProgress] = createSignal(0);
  const [isUploading, setIsUploading] = createSignal(false);

  function simulateUpload() {
    setUploadProgress(0);
    setIsUploading(true);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 400);
    onCleanup(() => clearInterval(interval));
  }

  return (
    <DocPage
      title="ProgressBar"
      description="ProgressBar shows the completion progress of a task, either as a determinate bar showing exact progress, or an indeterminate animation for tasks with unknown duration."
      importCode={`import { ProgressBar } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Progress"
        description="A simple progress bar with a label and percentage value. Click the button to simulate a file upload."
        code={`const [progress, setProgress] = createSignal(0);

<ProgressBar label="Uploading..." value={progress()} />
<Button onPress={simulateUpload}>Start Upload</Button>`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar label="Uploading files..." value={Math.min(uploadProgress(), 100)} />
          <div class="flex items-center gap-3">
            <Button variant="primary" onPress={simulateUpload} isDisabled={isUploading()}>
              {isUploading() ? "Uploading..." : "Start Upload"}
            </Button>
            {uploadProgress() >= 100 && (
              <span class="text-sm text-green-600 font-medium">Complete!</span>
            )}
          </div>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Progress bars are available in S2 sizes from S through XL."
        code={`<ProgressBar label="Small" value={40} size="S" />
<ProgressBar label="Medium" value={60} size="M" />
<ProgressBar label="Large" value={75} size="L" />
<ProgressBar label="Extra Large" value={90} size="XL" />`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar label="Small" value={40} size="S" />
          <ProgressBar label="Medium" value={60} size="M" />
          <ProgressBar label="Large" value={75} size="L" />
          <ProgressBar label="Extra Large" value={90} size="XL" />
        </div>
      </Example>

      <Example
        title="Label Position"
        description="Place the label/value row above the bar or inline beside it."
        code={`<ProgressBar label="Top label" value={60} labelPosition="top" />
<ProgressBar label="Side label" value={60} labelPosition="side" />`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar label="Top label" value={60} labelPosition="top" />
          <ProgressBar label="Side label" value={60} labelPosition="side" />
        </div>
      </Example>

      <Example
        title="Indeterminate"
        description="When the progress amount is unknown, use indeterminate mode to show an animated indicator."
        code={`<ProgressBar label="Loading data..." isIndeterminate />
<ProgressBar label="Processing..." isIndeterminate size="L" />`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar label="Loading data..." isIndeterminate />
          <ProgressBar label="Processing..." isIndeterminate size="L" />
        </div>
      </Example>

      <Example
        title="Custom Value Label"
        description="Customize how the value is displayed using a custom value label."
        code={`<ProgressBar label="Storage" value={75} valueLabel="750 MB of 1 GB" />
<ProgressBar label="Disk usage" value={90} valueLabel="9 / 10 TB" />`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar label="Storage" value={75} valueLabel="750 MB of 1 GB" />
          <ProgressBar label="Disk usage" value={90} valueLabel="9 / 10 TB" />
        </div>
      </Example>

      <Example
        title="Custom Range"
        description="Set custom minimum and maximum values for the progress range."
        code={`<ProgressBar label="Temperature" value={72} minValue={32} maxValue={212} valueLabel="72 F" />
<ProgressBar label="Volume" value={7} minValue={0} maxValue={11} valueLabel="7 / 11" />`}
      >
        <div class="space-y-4 max-w-md">
          <ProgressBar
            label="Temperature"
            value={72}
            minValue={32}
            maxValue={212}
            valueLabel="72 F"
          />
          <ProgressBar label="Volume" value={7} minValue={0} maxValue={11} valueLabel="7 / 11" />
        </div>
      </Example>

      <Example
        title="Static Color"
        description="Use static color when the progress bar appears on a colored background."
        code={`<ProgressBar label="On dark" value={56} staticColor="white" />
<ProgressBar label="On light" value={56} staticColor="black" />`}
      >
        <div class="space-y-4 max-w-md">
          <div class="rounded-md bg-slate-900 p-4">
            <ProgressBar label="On dark" value={56} staticColor="white" />
          </div>
          <div class="rounded-md bg-slate-100 p-4">
            <ProgressBar label="On light" value={56} staticColor="black" />
          </div>
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "value",
            type: "number",
            description: "Current progress value",
          },
          {
            name: "label",
            type: "string",
            description: "Text label displayed above the bar",
          },
          {
            name: "size",
            type: "'S' | 'M' | 'L' | 'XL'",
            default: "'M'",
            description: "Size of the progress bar",
          },
          {
            name: "isIndeterminate",
            type: "boolean",
            default: "false",
            description: "Show an indeterminate animation for unknown progress",
          },
          {
            name: "minValue",
            type: "number",
            default: "0",
            description: "Minimum value of the progress range",
          },
          {
            name: "maxValue",
            type: "number",
            default: "100",
            description: "Maximum value of the progress range",
          },
          {
            name: "valueLabel",
            type: "string",
            description: "Custom text to display as the value (overrides percentage)",
          },
          {
            name: "labelPosition",
            type: "'top' | 'side'",
            default: "'top'",
            description: "Position of the label and value relative to the bar",
          },
          {
            name: "staticColor",
            type: "'white' | 'black' | 'auto'",
            description: "Static color branch for use on colored backgrounds",
          },
          {
            name: "formatOptions",
            type: "Intl.NumberFormatOptions",
            description: "Options used to format the generated value label",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label (alternative to visible label)",
          },
          {
            name: "styles",
            type: "StyleString",
            description: "S2 style macro overrides for supported layout properties",
          },
          {
            name: "UNSAFE_className",
            type: "string",
            description: "Escape hatch class name",
          },
          {
            name: "UNSAFE_style",
            type: "JSX.CSSProperties",
            description: "Escape hatch inline styles",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="progressbar"</code> with <code>aria-valuenow</code>,{" "}
            <code>aria-valuemin</code>, and <code>aria-valuemax</code>
          </li>
          <li>
            Label is linked via <code>aria-labelledby</code> for screen readers
          </li>
          <li>
            Indeterminate state omits <code>aria-valuenow</code> per ARIA spec
          </li>
          <li>Custom value labels are announced to screen readers</li>
          <li>Value changes are announced as the progress updates</li>
          <li>High contrast mode support for visibility in all themes</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
