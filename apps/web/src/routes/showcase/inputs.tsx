/* Panel 02 — Inputs. Text entry: TextField, TextArea, NumberField,
   SearchField, Form, LabeledValue — label/description/error states on the
   matte well the register reserves for editable surfaces. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { Form, LabeledValue, NumberField, SearchField, TextArea, TextField } from "@proyecto-viviana/ui";
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
