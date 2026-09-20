import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { DateRangePicker } from "@proyecto-viviana/solid-spectrum";
import {
  CalendarDateClass as CalendarDate,
  type DateValue,
  type RangeValue,
} from "@proyecto-viviana/solid-stately";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/solid-spectrum/docs/components/daterangepicker")({
  head: () =>
    seo({
      title: "DateRangePicker",
      description:
        "A date range picker lets users select a start and end date using a combined input with a range calendar popup.",
      path: "/solid-spectrum/docs/components/daterangepicker",
    }),
  component: DateRangePickerPage,
});

function DateRangePickerPage() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  const minDate = new CalendarDate(2026, 1, 1);
  const maxDate = new CalendarDate(2026, 12, 31);

  const formatRange = (r: RangeValue<DateValue> | null) => {
    if (!r) return "None";
    return `${r.start.month}/${r.start.day}/${r.start.year} - ${r.end.month}/${r.end.day}/${r.end.year}`;
  };

  return (
    <DocPage
      title="DateRangePicker"
      description="A date range picker lets users select a start and end date using a combined input with a range calendar popup. It is ideal for filtering by date ranges, booking stays, or defining time spans."
      importCode={`import { DateRangePicker } from '@proyecto-viviana/solid-spectrum';
import {
  CalendarDateClass as CalendarDate,
  type DateValue,
  type RangeValue,
} from '@proyecto-viviana/solid-stately';`}
    >
      <Example
        title="Basic Range Selection"
        description="Select a start and end date. The picker displays two date fields separated by a dash, and opens a range calendar popup when the button is clicked."
        code={`const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

<DateRangePicker
  label="Trip dates"
  value={range()}
  onChange={setRange}
/>

<p>Selected: {formatRange(range())}</p>`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <DateRangePicker label="Trip dates" value={range()} onChange={setRange} />
          <p class={typeRoles.meta}>Selected range: {formatRange(range())}</p>
        </Flex>
      </Example>

      <Example
        title="With Min/Max Constraints"
        description="Restrict the selectable range to stay within defined bounds. Dates outside the allowed range are disabled in the calendar popup."
        code={`const minDate = new CalendarDate(2026, 1, 1);
const maxDate = new CalendarDate(2026, 12, 31);

<DateRangePicker
  label="2026 date range"
  minValue={minDate}
  maxValue={maxDate}
  description="Select dates within 2026"
/>`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "24rem" }}>
          <DateRangePicker
            label="2026 date range"
            minValue={minDate}
            maxValue={maxDate}
            description="Select dates within 2026"
          />
        </Flex>
      </Example>

      <Example
        title="Disabled State"
        description="A disabled date range picker cannot be interacted with."
        code={`<DateRangePicker
  label="Unavailable range"
  isDisabled
/>`}
      >
        <div style={{ "max-width": "24rem" }}>
          <DateRangePicker label="Unavailable range" isDisabled />
        </div>
      </Example>

      <Example
        title="Required Field"
        description="Mark the date range picker as required for form validation. An asterisk appears next to the label."
        code={`<DateRangePicker
  label="Booking dates"
  isRequired
/>`}
      >
        <div style={{ "max-width": "24rem" }}>
          <DateRangePicker label="Booking dates" isRequired />
        </div>
      </Example>

      <PropsTable
        props={[
          {
            name: "label",
            type: "string",
            description: "Label text displayed above the input fields",
          },
          {
            name: "value",
            type: "RangeValue<DateValue> | null",
            description: "The currently selected date range (controlled)",
          },
          {
            name: "onChange",
            type: "(range: RangeValue<DateValue> | null) => void",
            description: "Handler called when the selected range changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the date range picker is disabled",
          },
          {
            name: "minValue",
            type: "DateValue",
            description: "The minimum selectable date for the range",
          },
          {
            name: "maxValue",
            type: "DateValue",
            description: "The maximum selectable date for the range",
          },
          {
            name: "isRequired",
            type: "boolean",
            default: "false",
            description: "Whether a date range selection is required",
          },
          {
            name: "description",
            type: "string",
            description: "Help text displayed below the input",
          },
          {
            name: "errorMessage",
            type: "string",
            description: "Error message displayed when the field is invalid",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "The visual size of the date range picker",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          Start and end date fields are grouped with a <code>group</code> role
        </li>
        <li>
          Each date display is labelled with <code>aria-label</code> for screen readers
        </li>
        <li>
          The calendar popup uses a range selection mode with <code>aria-selected</code> on range
          cells
        </li>
        <li>Range endpoints are visually and programmatically distinct (start and end)</li>
        <li>Calendar popup traps focus and can be dismissed with Escape</li>
        <li>
          Required state is communicated through <code>aria-required</code>
        </li>
      </AccessibilitySection>
    </DocPage>
  );
}
