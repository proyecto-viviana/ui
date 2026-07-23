/* Mirror of spec panel 09 (TYPE ROLES — the closed set) built from real
   @proyecto-viviana/ui components, in the same <Panel> chrome as the spec.

   This panel is the hardest of the nine to twin, and the reason is structural.
   The spec's eight roles are eight CSS custom properties (--type-display …
   --type-terminal): an app can name a role and get it. The library has no such
   surface. Its type lives in the build-time `font()` macro, so a role can only
   be *baked into a component* — there is no exported component whose job is
   "render text in role X", and no runtime way to ask for one. What the library
   exposes to an app is therefore not a ladder of eight but a handful of
   components that each happen to carry one baked role.

   So the middle column below is the honest answer to "what does the library
   give you for this role", one row at a time, and three of the eight have no
   answer at all. Each is called out at its row rather than hand-set to match,
   since a styled <span> here would hide the exact gap the panel measures.

   The name and spec columns are panel chrome, hand-set identically to the spec
   (same MONO/CH tokens, same widths) so the two panels line up row-for-row and
   only the middle column is under comparison. */
import { type JSX } from "solid-js";
import {
  Badge,
  Content,
  Divider,
  Heading,
  Keyboard,
  LabeledValue,
  Provider,
  Text,
} from "@proyecto-viviana/ui";
import { CH, MONO, Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* Layout-only helper reproducing one spec row: the baseline three-column line,
   its 10px pad, then the rule beneath it. The rule is the spec's one piece of
   row chrome that HAS a library counterpart, so it is a real <Divider> rather
   than the spec's `1px solid var(--border-subtle)` — its weight and colour are
   the library's own, which is a legitimate thing for the sweep to catch. */
function Row(props: {
  readonly name: string;
  readonly spec: string;
  readonly children: JSX.Element;
}): JSX.Element {
  return (
    <div>
      <div
        style={{
          display: "flex",
          "align-items": "baseline",
          gap: "16px",
          "padding-bottom": "10px",
        }}
      >
        <span style={{ "font-family": MONO, "font-size": "10px", color: CH.cy, width: "78px" }}>
          {props.name}
        </span>
        <div style={{ "min-width": 0 }}>{props.children}</div>
        <span
          style={{
            font: "var(--type-meta)",
            color: "var(--text-tertiary)",
            "margin-left": "auto",
            "text-align": "right",
          }}
        >
          {props.spec}
        </span>
      </div>
      <Divider size="S" />
    </div>
  );
}

export function MirrorPanel09(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="09 // TYPE ROLES — the closed set — VIVIANA UI">
      {/* No background prop: the type must sit on the panel's glass exactly as the
          spec's does, so the two panels are compared on the same ground. An opaque
          plate would also change the text contrast and confuse the colour sweep. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="09"
        style={{ display: "flex", "flex-direction": "column", gap: "10px" }}
      >
        {/* GAP (display/title/headline collapse to one): Heading is the only exported
            component that bakes a type role, and it bakes exactly ONE. Its `level`
            prop picks the tag (h1/h2/h3) and nothing else — the class list is a
            module-level constant, identical for every level. So the spec's three
            pixel-face tiers arrive here as three identical lines at one size. The
            levels are still passed, because the semantic difference is real even
            though the visual one is not. */}
        <Row name="display" spec="Pixel · hero & page titles">
          <Heading level={1}>Think in circles</Heading>
        </Row>
        <Row name="title" spec="Pixel · section/panel titles">
          <Heading level={2}>Monte Carlo Path Tracing</Heading>
        </Row>
        <Row name="headline" spec="Pixel · card & list titles">
          <Heading level={3}>Spaced Review</Heading>
        </Row>

        {/* SUBSTITUTION: the library's "label" role is Spectrum's FieldLabel, and the
            only way to render one standalone is LabeledValue's label slot — every
            other carrier (Button, Tab, Checkbox…) welds it to a control. `value` is
            deliberately omitted so the row shows the role and nothing else; that
            leaves LabeledValue's value cell empty, which is why labelPosition="side"
            is used — it parks the empty cell beside the label instead of under it. */}
        <Row name="label" spec="Pixel · buttons/nav/chips — 13px floor">
          <LabeledValue size="L" labelPosition="side" label="Resume · Home · #shaders" />
        </Row>

        {/* GAP (no prose role): Content and Text are the library's prose and inline
            components, but neither bakes any type at all — both render a bare
            element with an empty class and inherit whatever encloses them. They are
            slot markers for a parent (Card, InlineAlert, MenuItem) to style through
            context, not type roles an app can request. Left as-is: what renders here
            is the island's inherited type, not the library's, and that IS the
            finding. */}
        <Row name="body" spec="Geist · prose">
          <Content>
            March a ray through signed distance fields toward the nearest surface.
          </Content>
        </Row>
        <Row name="meta" spec="Geist · secondary">
          <Text>Today 18:00 · 214 waiting</Text>
        </Row>

        {/* SUBSTITUTION: nothing in the library renders bare micro text, but Badge at
            size S bakes the smallest type it has, and the spec spends this role on
            exactly these status chips. The cost is that Badge brings a pill — fill,
            radius, padding — that the spec's micro role does not have, so this row
            compares type inside a container against type on glass. */}
        <Row name="micro" spec="Mono · below the pixel floor">
          <Badge size="S" variant="neutral" fillStyle="subtle">
            LIVE · DUE · 0x3F
          </Badge>
        </Row>

        {/* GAP (no mono role): Keyboard is the right component semantically — it is
            the library's <kbd>, the terminal/monospace slot — but like Text and
            Content it bakes nothing; it is styled only through a slotted
            KeyboardContext that a parent such as MenuItem supplies. Standalone it
            inherits, so the library has no reachable mono role. Same finding as the
            trailing key hints in mirror panel 02. */}
        <Row name="terminal" spec="Mono · wells & prompts only">
          <Keyboard>{"> submit checkpoint --answer"}</Keyboard>
        </Row>
      </Provider>
    </Panel>
  );
}
