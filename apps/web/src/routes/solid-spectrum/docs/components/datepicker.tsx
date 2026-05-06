import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { DatePicker } from "@proyecto-viviana/solid-spectrum";
import { CalendarDateClass as CalendarDate, type DateValue } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/datepicker")({
  component: DatePickerPage,
});

function DatePickerPage() {
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);
  const [constrainedDate, setConstrainedDate] = createSignal<DateValue | null>(null);

  const minDate = new CalendarDate(2026, 1, 1);
  const maxDate = new CalendarDate(2026, 6, 30);

  return (
    <DocPage
      title="DatePicker"
      description="A date picker combines a segmented date input field with a dropdown calendar popup. Users can type a date directly into the field using the keyboard, or open the calendar to select a date visually."
      importCode={`import { DatePicker } from '@proyecto-viviana/solid-spectrum';
import { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Usage"
        description="A simple date picker with a label. Click the calendar icon or focus the field and press the arrow keys to interact with date segments."
        code={`const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

<DatePicker
  label="Event date"
  value={selectedDate()}
  onChange={setSelectedDate}
/>

<p>Selected: {selectedDate()?.toString() ?? "None"}</p>`}
      >
        <div class="flex flex-col gap-4 max-w-xs">
          <DatePicker label="Event date" value={selectedDate()} onChange={setSelectedDate} />
          <p class="text-sm text-bg-500">
            Selected:{" "}
            {selectedDate()
              ? `${selectedDate()!.month}/${selectedDate()!.day}/${selectedDate()!.year}`
              : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="With Min/Max Constraints"
        description="Restrict the selectable range by setting minValue and maxValue. The calendar popup will not allow navigation beyond these bounds, and the date segments enforce the limits."
        code={`const minDate = new CalendarDate(2026, 1, 1);
const maxDate = new CalendarDate(2026, 6, 30);

<DatePicker
  label="First half of 2026"
  minValue={minDate}
  maxValue={maxDate}
  value={constrainedDate()}
  onChange={setConstrainedDate}
  description="Select a date between Jan 1 and Jun 30, 2026"
/>`}
      >
        <div class="flex flex-col gap-4 max-w-xs">
          <DatePicker
            label="First half of 2026"
            minValue={minDate}
            maxValue={maxDate}
            value={constrainedDate()}
            onChange={setConstrainedDate}
            description="Select a date between Jan 1 and Jun 30, 2026"
          />
          <p class="text-sm text-bg-500">
            Selected:{" "}
            {constrainedDate()
              ? `${constrainedDate()!.month}/${constrainedDate()!.day}/${constrainedDate()!.year}`
              : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="A disabled date picker cannot be interacted with. The input field and calendar button are visually muted."
        code={`<DatePicker
  label="Disabled date"
  isDisabled
  placeholderValue={new CalendarDate(2026, 3, 15)}
/>`}
      >
        <div class="max-w-xs">
          <DatePicker
            label="Disabled date"
            isDisabled
            placeholderValue={new CalendarDate(2026, 3, 15)}
          />
        </div>
      </Example>

      <Example
        title="Required with Validation"
        description="Mark the date picker as required and provide an error message for invalid states. The field displays a red border and the error text below."
        code={`<DatePicker
  label="Birth date"
  isRequired
  isInvalid
  errorMessage="Please select your birth date"
/>`}
      >
        <div class="max-w-xs">
          <DatePicker
            label="Birth date"
            isRequired
            isInvalid
            errorMessage="Please select your birth date"
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
            description: "The currently selected date (controlled)",
          },
          {
            name: "onChange",
            type: "(date: DateValue | null) => void",
            description: "Handler called when the selected date changes",
          },
          {
            name: "minValue",
            type: "DateValue",
            description: "The minimum selectable date",
          },
          {
            name: "maxValue",
            type: "DateValue",
            description: "The maximum selectable date",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the date picker is disabled",
          },
          {
            name: "placeholderValue",
            type: "DateValue",
            description: "A placeholder date that controls the default segments shown when empty",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether a date selection is required",
          },
          {
            name: "isInvalid",
            type: "boolean",
            default: "false",
            description: "Whether the date picker is in an invalid state",
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
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the date picker",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Date segments are individually focusable with <code>spinbutton</code> role for screen
            readers
          </li>
          <li>Arrow Up/Down increments or decrements the focused segment value</li>
          <li>Tab moves between date segments (month, day, year)</li>
          <li>
            The calendar popup button has an <code>aria-label</code> describing its purpose
          </li>
          <li>
            Error messages are associated via <code>aria-describedby</code> for screen reader
            announcement
          </li>
          <li>
            Required state is communicated through <code>aria-required</code>
          </li>
          <li>Calendar popup traps focus and can be dismissed with Escape</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
