import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { RangeCalendar } from "@proyecto-viviana/solid-spectrum";
import {
  CalendarDateClass as CalendarDate,
  type DateValue,
  type RangeValue,
} from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/rangecalendar")({
  component: RangeCalendarPage,
});

function RangeCalendarPage() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  const minDate = new CalendarDate(2026, 1, 1);
  const maxDate = new CalendarDate(2026, 12, 31);

  const unavailableDates = [
    new CalendarDate(2026, 3, 25),
    new CalendarDate(2026, 3, 26),
    new CalendarDate(2026, 3, 27),
  ];

  const isDateUnavailable = (date: DateValue) => {
    return unavailableDates.some(
      (d) => d.year === date.year && d.month === date.month && d.day === date.day,
    );
  };

  const formatRange = (r: RangeValue<DateValue> | null) => {
    if (!r) return "None";
    return `${r.start.month}/${r.start.day}/${r.start.year} - ${r.end.month}/${r.end.day}/${r.end.year}`;
  };

  return (
    <DocPage
      title="RangeCalendar"
      description="A range calendar displays a grid of days and allows users to select a contiguous range of dates by clicking a start date and then an end date. It is useful for booking flows, report filtering, and any scenario that requires a date span."
      importCode={`import { RangeCalendar } from '@proyecto-viviana/solid-spectrum';
import {
  CalendarDateClass as CalendarDate,
  type DateValue,
  type RangeValue,
} from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Range Selection"
        description="Click a date to set the range start, then click another date to set the range end. The days between start and end are highlighted. The selected range is displayed below the calendar."
        code={`const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

<RangeCalendar
  aria-label="Trip dates"
  value={range()}
  onChange={setRange}
/>

<p>Selected: {formatRange(range())}</p>`}
      >
        <div class="flex flex-col items-start gap-4">
          <RangeCalendar aria-label="Trip dates" value={range()} onChange={setRange} />
          <p class="text-sm text-bg-500">Selected range: {formatRange(range())}</p>
        </div>
      </Example>

      <Example
        title="With Min/Max Constraints"
        description="Restrict the selectable range to a specific window. Dates outside the min/max bounds are disabled and navigation beyond those months is prevented."
        code={`const minDate = new CalendarDate(2026, 1, 1);
const maxDate = new CalendarDate(2026, 12, 31);

<RangeCalendar
  aria-label="2026 date range"
  minValue={minDate}
  maxValue={maxDate}
/>`}
      >
        <div class="flex flex-col items-start gap-4">
          <RangeCalendar aria-label="2026 date range" minValue={minDate} maxValue={maxDate} />
          <p class="text-xs text-bg-400">Only dates in 2026 are selectable</p>
        </div>
      </Example>

      <Example
        title="Unavailable Dates"
        description="Use isDateUnavailable to block specific dates from being included in a range. Users cannot select a range that spans across unavailable dates."
        code={`const isDateUnavailable = (date: DateValue) =>
  unavailableDates.some(
    (d) => d.year === date.year && d.month === date.month && d.day === date.day
  );

<RangeCalendar
  aria-label="Booking dates"
  isDateUnavailable={isDateUnavailable}
  defaultValue={{ start: new CalendarDate(2026, 3, 1), end: new CalendarDate(2026, 3, 5) }}
/>`}
      >
        <div class="flex flex-col items-start gap-4">
          <RangeCalendar
            aria-label="Booking dates"
            isDateUnavailable={isDateUnavailable}
            defaultValue={{
              start: new CalendarDate(2026, 3, 1),
              end: new CalendarDate(2026, 3, 5),
            }}
          />
          <p class="text-xs text-bg-400">Mar 25-27 are unavailable</p>
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="A disabled range calendar is non-interactive. All cells are muted and navigation buttons are inoperative."
        code={`<RangeCalendar
  aria-label="Disabled calendar"
  isDisabled
/>`}
      >
        <div>
          <RangeCalendar aria-label="Disabled calendar" isDisabled />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "value",
            type: "RangeValue<DateValue> | null",
            description: "The currently selected date range (controlled)",
          },
          {
            name: "onChange",
            type: "(range: RangeValue<DateValue>) => void",
            description: "Handler called when the selected range changes",
          },
          {
            name: "defaultValue",
            type: "RangeValue<DateValue>",
            description: "The default selected range (uncontrolled)",
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
            description: "Whether the range calendar is disabled",
          },
          {
            name: "isDateUnavailable",
            type: "(date: DateValue) => boolean",
            description:
              "Callback that returns whether a specific date is unavailable for selection",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label for the range calendar",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the range calendar",
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
            Uses a <code>grid</code> role with <code>gridcell</code> elements for each day
          </li>
          <li>
            Full keyboard navigation: Arrow keys move between days, Page Up/Down change months
          </li>
          <li>Range start and end are visually distinct with rounded corners at the endpoints</li>
          <li>
            Days within the range use <code>aria-selected="true"</code> for screen reader
            announcement
          </li>
          <li>
            Unavailable dates are announced as disabled via <code>aria-disabled</code>
          </li>
          <li>
            Previous/next month buttons include descriptive <code>aria-label</code> attributes
          </li>
          <li>Today's date is visually indicated with a ring highlight</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
