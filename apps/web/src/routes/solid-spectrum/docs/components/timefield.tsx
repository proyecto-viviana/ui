import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { TimeField } from "@proyecto-viviana/solid-spectrum";
import { type TimeValue } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/timefield")({
  component: TimeFieldPage,
});

function TimeFieldPage() {
  const [time, setTime] = createSignal<TimeValue | null>(null);

  const formatTime = (t: TimeValue | null) => {
    if (!t) return "None";
    const hour = t.hour;
    const minute = String(t.minute).padStart(2, "0");
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${period}`;
  };

  return (
    <DocPage
      title="TimeField"
      description="A time field allows users to enter a time value using individually editable segments for hours, minutes, and optionally seconds. Each segment supports keyboard input with arrow keys for incrementing and decrementing."
      importCode={`import { TimeField } from '@proyecto-viviana/solid-spectrum';
import { type TimeValue } from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Usage"
        description="A simple time field with a label. Click on a segment and use arrow keys or type numbers to set the time."
        code={`const [time, setTime] = createSignal<TimeValue | null>(null);

<TimeField
  label="Meeting time"
  value={time()}
  onChange={setTime}
/>

<p>Selected: {formatTime(time())}</p>`}
      >
        <div class="flex flex-col gap-4 max-w-xs">
          <TimeField label="Meeting time" value={time()} onChange={setTime} />
          <p class="text-sm text-bg-500">Entered time: {formatTime(time())}</p>
        </div>
      </Example>

      <Example
        title="With Description"
        description="Add a description to provide context about the expected time value."
        code={`<TimeField
  label="Start time"
  description="Business hours: 9 AM - 5 PM"
/>`}
      >
        <div class="max-w-xs">
          <TimeField label="Start time" description="Business hours: 9 AM - 5 PM" />
        </div>
      </Example>

      <Example
        title="Required Field"
        description="Mark the time field as required for form validation. An asterisk indicator appears next to the label."
        code={`<TimeField
  label="Appointment time"
  isRequired
/>`}
      >
        <div class="max-w-xs">
          <TimeField label="Appointment time" isRequired />
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="A disabled time field cannot be interacted with. The segments and field are visually muted."
        code={`<TimeField
  label="Fixed time"
  isDisabled
/>`}
      >
        <div class="max-w-xs">
          <TimeField label="Fixed time" isDisabled />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Label text displayed above the time input",
          },
          {
            name: "value",
            type: "TimeValue | null",
            description: "The currently entered time (controlled)",
          },
          {
            name: "onChange",
            type: "(time: TimeValue | null) => void",
            description: "Handler called when the time value changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the time field is disabled",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether a time value is required",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Whether the time field is in an invalid state",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message displayed when invalid",
          },
          {
            name: "description",
            type: "string",
            description: "Help text displayed below the input",
          },
          {
            name: "granularity",
            type: "'hour' | 'minute' | 'second'",
            default: "'minute'",
            description: "The smallest time unit to display (controls whether seconds are shown)",
          },
          {
            name: "hourCycle",
            type: "12 | 24",
            description: "Whether to use 12-hour or 24-hour time format",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the time field",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Each time segment uses a <code>spinbutton</code> role with proper{" "}
            <code>aria-valuemin</code>, <code>aria-valuemax</code>, and <code>aria-valuenow</code>
          </li>
          <li>Arrow Up/Down increments or decrements the focused segment</li>
          <li>Tab moves focus between segments (hour, minute, AM/PM)</li>
          <li>Typing digits automatically advances to the next segment</li>
          <li>AM/PM segment can be toggled by typing "a" or "p"</li>
          <li>
            Label is associated via <code>aria-labelledby</code> for screen reader announcement
          </li>
          <li>
            Required state is communicated through <code>aria-required</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
