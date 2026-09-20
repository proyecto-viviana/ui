/* Panel 10 — Date & Time. Calendars render inline; the field/picker family
   shows segmented entry. apps/web has no @internationalized/date dependency,
   so every demo here stays uncontrolled — no value/defaultValue/
   placeholderValue — letting the components manage their own blank state. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  RangeCalendar,
  TimeField,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/datetime")({
  head: () => panelSeo("datetime"),
  component: DatetimePanel,
});

const SIZES = ["S", "M", "L", "XL"] as const;

function DatetimePanel() {
  const def = panelBySlug("datetime")!;

  return (
    <Panel def={def}>
      <Demo label="Calendar">
        <Row>
          <Calendar aria-label="Event date" />
        </Row>
      </Demo>

      <Demo label="Calendar · sizes">
        <Row>
          <For each={SIZES}>
            {(size) => <Calendar size={size} aria-label={`Calendar, size ${size}`} />}
          </For>
        </Row>
      </Demo>

      <Demo label="Calendar · states">
        <Row>
          <Calendar aria-label="Disabled calendar" isDisabled />
          <Calendar
            aria-label="Invalid calendar"
            isInvalid
            errorMessage="Select an available date"
          />
        </Row>
      </Demo>

      <Demo label="RangeCalendar">
        <Row>
          <RangeCalendar aria-label="Stay range" />
        </Row>
      </Demo>

      <Demo label="RangeCalendar · multi-month">
        <Row>
          <RangeCalendar aria-label="Two-month range" visibleMonths={2} />
        </Row>
      </Demo>

      <Demo label="DateField · sizes">
        <Row>
          <DateField size="S" label="Small" />
          <DateField size="M" label="Medium" />
          <DateField size="L" label="Large" />
          <DateField size="XL" label="Extra large" />
        </Row>
      </Demo>

      <Demo label="DateField · states">
        <Row>
          <DateField label="Disabled" isDisabled />
          <DateField label="Invalid" isInvalid errorMessage="Enter a valid date" />
        </Row>
      </Demo>

      <Demo label="TimeField">
        <Row>
          <TimeField label="Time" />
          <TimeField label="12-hour" hourCycle={12} />
          <TimeField label="24-hour" hourCycle={24} />
        </Row>
      </Demo>

      <Demo label="DatePicker">
        <Row>
          <DatePicker label="Departure" description="Opens a calendar popover" />
          <DatePicker label="Disabled" isDisabled />
          <DatePicker label="Invalid" isInvalid errorMessage="Choose a valid date" />
        </Row>
      </Demo>

      <Demo label="DateRangePicker">
        <Row>
          <DateRangePicker label="Stay dates" description="Start and end date" />
          <DateRangePicker label="Disabled" isDisabled />
        </Row>
      </Demo>
    </Panel>
  );
}
