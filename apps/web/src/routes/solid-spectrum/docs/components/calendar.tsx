import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Calendar } from "@proyecto-viviana/solid-spectrum";
import { CalendarDateClass as CalendarDate, type DateValue } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

  const minDate = new CalendarDate(2026, 1, 1);
  const maxDate = new CalendarDate(2026, 12, 31);

  const unavailableDates = [
    new CalendarDate(2026, 2, 14),
    new CalendarDate(2026, 2, 15),
    new CalendarDate(2026, 2, 16),
  ];

  const isDateUnavailable = (date: DateValue) => {
    return unavailableDates.some(
      (d) => d.year === date.year && d.month === date.month && d.day === date.day,
    );
  };

  return (
    <DocPage
      title="Calendar"
      description="A calendar displays a grid of days organized into weeks and months. Users can select a single date by clicking on a day cell. Calendars are useful for date selection in scheduling, booking, and form contexts."
      importCode={`import { Calendar } from '@proyecto-viviana/solid-spectrum';
import { CalendarDateClass as CalendarDate } from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Date Selection"
        description="A simple calendar that allows users to pick a date. The selected date is tracked via a signal and displayed below the calendar."
        code={`const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

<Calendar
  aria-label="Event date"
  value={selectedDate()}
  onChange={setSelectedDate}
/>

<p>Selected: {selectedDate()?.toString() ?? "None"}</p>`}
      >
        <div class="flex flex-col items-start gap-4">
          <Calendar aria-label="Event date" value={selectedDate()} onChange={setSelectedDate} />
          <p class="text-sm text-bg-500">
            Selected date:{" "}
            {selectedDate()
              ? `${selectedDate()!.month}/${selectedDate()!.day}/${selectedDate()!.year}`
              : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="Disabled Dates"
        description="Use the isDateUnavailable callback to prevent specific dates from being selected. Unavailable dates appear visually muted and cannot be clicked."
        code={`const unavailableDates = [
  new CalendarDate(2026, 2, 14),
  new CalendarDate(2026, 2, 15),
  new CalendarDate(2026, 2, 16),
];

const isDateUnavailable = (date: DateValue) =>
  unavailableDates.some(
    (d) => d.year === date.year && d.month === date.month && d.day === date.day
  );

<Calendar
  aria-label="Appointment date"
  isDateUnavailable={isDateUnavailable}
  defaultValue={new CalendarDate(2026, 2, 1)}
/>`}
      >
        <div class="flex flex-col items-start gap-4">
          <Calendar
            aria-label="Appointment date"
            isDateUnavailable={isDateUnavailable}
            defaultValue={new CalendarDate(2026, 2, 1)}
          />
          <p class="text-xs text-bg-400">Feb 14-16 are unavailable</p>
        </div>
      </Example>

      <Example
        title="Min/Max Date Constraints"
        description="Restrict the selectable date range by providing minValue and maxValue props. Dates outside the range are disabled and months beyond the range cannot be navigated to."
        code={`const minDate = new CalendarDate(2026, 1, 1);
const maxDate = new CalendarDate(2026, 12, 31);

<Calendar
  aria-label="Date within 2026"
  minValue={minDate}
  maxValue={maxDate}
/>`}
      >
        <div class="flex flex-col items-start gap-4">
          <Calendar aria-label="Date within 2026" minValue={minDate} maxValue={maxDate} />
          <p class="text-xs text-bg-400">Only dates in 2026 are selectable</p>
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "value",
            type: "DateValue | null",
            description: "The currently selected date (controlled)",
          },
          {
            name: "onChange",
            type: "(date: DateValue) => void",
            description: "Handler called when the selected date changes",
          },
          {
            name: "defaultValue",
            type: "DateValue",
            description: "The default selected date (uncontrolled)",
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
            description: "Whether the calendar is disabled",
          },
          {
            name: "isDateUnavailable",
            type: "(date: DateValue) => boolean",
            description: "Callback that returns whether a specific date is unavailable",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label for the calendar",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the calendar",
          },
          {
            name: "locale",
            type: "string",
            description: "The locale to use for formatting month and day names",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses a <code>grid</code> role with proper <code>gridcell</code> roles for each day
          </li>
          <li>
            Full keyboard navigation: Arrow keys move between days, Page Up/Down change months
          </li>
          <li>Today's date is visually indicated and announced to screen readers</li>
          <li>
            Disabled and unavailable dates are announced as such via <code>aria-disabled</code>
          </li>
          <li>
            Previous/next month buttons include descriptive <code>aria-label</code> attributes
          </li>
          <li>
            Selected date is communicated via <code>aria-selected</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
