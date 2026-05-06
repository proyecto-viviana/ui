import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { DateField } from "@proyecto-viviana/solid-spectrum";
import { CalendarDateClass as CalendarDate, type DateValue } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/datefield")({
  component: DateFieldPage,
});

function DateFieldPage() {
  const [date, setDate] = createSignal<DateValue | null>(null);

  return (
    <DocPage
      title="DateField"
      description="A date field allows users to type a date value using individually editable segments for month, day, and year. Each segment can be incremented or decremented with arrow keys, making it efficient for keyboard-driven date entry."
      importCode={`import { DateField } from '@proyecto-viviana/solid-spectrum';
import { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Usage"
        description="A simple date field with a label. Click on a segment and use arrow keys or type numbers to set the date."
        code={`const [date, setDate] = createSignal<DateValue | null>(null);

<DateField
  label="Birth date"
  value={date()}
  onChange={setDate}
/>

<p>Selected: {date()?.toString() ?? "None"}</p>`}
      >
        <div class="flex flex-col gap-4 max-w-xs">
          <DateField label="Birth date" value={date()} onChange={setDate} />
          <p class="text-sm text-bg-500">
            Entered date: {date() ? `${date()!.month}/${date()!.day}/${date()!.year}` : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="With Placeholder Value"
        description="A placeholder date controls the initial segments shown when the field is empty. This helps guide users toward a reasonable date. The placeholder is displayed in a muted style."
        code={`<DateField
  label="Event date"
  placeholderValue={new CalendarDate(2026, 6, 15)}
  description="Enter the date of your event"
/>`}
      >
        <div class="max-w-xs">
          <DateField
            label="Event date"
            placeholderValue={new CalendarDate(2026, 6, 15)}
            description="Enter the date of your event"
          />
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="A disabled date field cannot be interacted with. All segments are visually muted and not focusable."
        code={`<DateField
  label="Locked date"
  isDisabled
  value={new CalendarDate(2026, 2, 17)}
/>`}
      >
        <div class="max-w-xs">
          <DateField label="Locked date" isDisabled value={new CalendarDate(2026, 2, 17)} />
        </div>
      </Example>

      <Example
        title="Required with Validation"
        description="Mark the field as required and display an error message for invalid states."
        code={`<DateField
  label="Start date"
  isRequired
  isInvalid
  errorMessage="A start date is required"
/>`}
      >
        <div class="max-w-xs">
          <DateField
            label="Start date"
            isRequired
            isInvalid
            errorMessage="A start date is required"
          />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Label text displayed above the date input",
          },
          {
            name: "value",
            type: "DateValue | null",
            description: "The currently entered date (controlled)",
          },
          {
            name: "onChange",
            type: "(date: DateValue | null) => void",
            description: "Handler called when the date value changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the date field is disabled",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether a date value is required",
          },
          {
            name: "placeholderValue",
            type: "DateValue",
            description: "A placeholder date that sets the initial segments displayed when empty",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Whether the date field is in an invalid state",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message displayed below the input when invalid",
          },
          {
            name: "description",
            type: "string",
            description: "Help text displayed below the input",
          },
          {
            name: "minValue",
            type: "DateValue",
            description: "The minimum allowed date",
          },
          {
            name: "maxValue",
            type: "DateValue",
            description: "The maximum allowed date",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the date field",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Each date segment uses a <code>spinbutton</code> role with proper{" "}
            <code>aria-valuemin</code>, <code>aria-valuemax</code>, and <code>aria-valuenow</code>
          </li>
          <li>Arrow Up/Down increments or decrements the focused segment</li>
          <li>Tab moves focus between segments (month, day, year)</li>
          <li>Typing digits automatically advances to the next segment when complete</li>
          <li>
            Label is associated via <code>aria-labelledby</code> for screen reader announcement
          </li>
          <li>
            Error messages are linked through <code>aria-describedby</code>
          </li>
          <li>
            Required state is communicated through <code>aria-required</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
