/* Panel 02 — Inputs. Text entry: TextField, TextArea, NumberField,
   SearchField, Form, LabeledValue — label/description/error states on the
   matte well the register reserves for editable surfaces. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  Form,
  Keyboard,
  LabeledValue,
  NumberField,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  TextArea,
  TextField,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/inputs")({
  component: InputsPanel,
});

const SIZES = ["S", "M", "L", "XL"] as const;

function InputsPanel() {
  const def = panelBySlug("inputs")!;

  return (
    <Panel def={def}>
      <Demo label="Register prompts — SearchField with a slash prefix and ⌘K hint inside the well, bare segments, tutor prompt on the AI-lane surface">
        {/* The register's panel-02 row: two prompt wells flanking a segment
            strip. The glyph inks are per-well choices (`/` cyan, `$` info),
            so they ride on the prefix JSX, not the surface. */}
        <div style={{ display: "flex", "align-items": "center", gap: "12px", "flex-wrap": "wrap" }}>
          <div style={{ "min-width": "240px" }}>
            <SearchField
              aria-label="Search lessons"
              placeholder="search lessons"
              prefix={<span style={{ color: "var(--well-cy)" }}>/</span>}
              suffix={<Keyboard>⌘K</Keyboard>}
            />
          </div>
          <SegmentedControl aria-label="Range" defaultSelectedKey="week">
            <SegmentedControlItem id="day">day</SegmentedControlItem>
            <SegmentedControlItem id="week">week</SegmentedControlItem>
            <SegmentedControlItem id="month">month</SegmentedControlItem>
          </SegmentedControl>
          <div style={{ flex: "1", "min-width": "260px" }}>
            <TextField
              aria-label="Ask tutor"
              surface="tutor"
              prefix={<span style={{ color: "var(--status-info)" }}>$</span>}
              suffix={<Keyboard>↵</Keyboard>}
              defaultValue={'ask tutor "why does variance drop?"'}
            />
          </div>
        </div>
      </Demo>

      <Demo label="TextField · sizes">
        <Row>
          <For each={SIZES}>{(size) => <TextField size={size} label={size} defaultValue="Value" />}</For>
        </Row>
      </Demo>

      <Demo label="TextField · states — required, invalid, disabled">
        <Row>
          <TextField
            label="Full name"
            description="As it appears on your ID."
            isRequired
            placeholder="Jane Doe"
          />
          <TextField
            label="Email"
            defaultValue="not-an-email"
            isInvalid
            errorMessage="Enter a valid email address."
          />
          <TextField label="Company" defaultValue="Acme Inc." isDisabled />
        </Row>
      </Demo>

      <Demo label="TextArea">
        <Row>
          <TextArea label="Notes" description="Internal only, not shared with the client." placeholder="Add context…" />
          <TextArea
            label="Reason for rejection"
            isRequired
            isInvalid
            errorMessage="A reason is required."
          />
        </Row>
      </Demo>

      <Demo label="NumberField · formatOptions">
        <Row>
          <NumberField label="Price" defaultValue={42} formatOptions={{ style: "currency", currency: "USD" }} />
          <NumberField label="Discount" defaultValue={0.15} step={0.01} formatOptions={{ style: "percent" }} />
        </Row>
      </Demo>

      <Demo label="NumberField · states — min/max, invalid, disabled">
        <Row>
          <NumberField
            label="Quantity"
            defaultValue={5}
            minValue={0}
            maxValue={20}
            description="Between 0 and 20."
          />
          <NumberField label="Seats" defaultValue={0} isInvalid errorMessage="Must be at least 1." />
          <NumberField label="Capacity" defaultValue={10} isDisabled hideStepper />
        </Row>
      </Demo>

      <Demo label="SearchField · states">
        <Row>
          <SearchField label="Search" placeholder="Search components…" />
          <SearchField label="Search" defaultValue="no results" isInvalid errorMessage="No results match." />
          <SearchField label="Search" defaultValue="disabled" isDisabled />
        </Row>
      </Demo>

      <Demo label="Form">
        <Form aria-label="Contact details">
          <TextField label="Full name" isRequired placeholder="Jane Doe" />
          <TextField label="Email" type="email" isRequired placeholder="jane@example.com" />
          <NumberField label="Team size" defaultValue={3} minValue={1} />
        </Form>
      </Demo>

      <Demo label="LabeledValue — string, number formatOptions, list">
        <Row>
          <LabeledValue label="Project name" value="Quarterly report" />
          <LabeledValue label="Budget" value={1234567.89} formatOptions={{ style: "currency", currency: "USD" }} />
          <LabeledValue label="Stakeholders" value={["Adobe", "Apple", "Google"]} />
        </Row>
      </Demo>
    </Panel>
  );
}
