/* Mirror of spec panel 09 (TYPE ROLES — the closed set) built from real
   @proyecto-viviana/ui components, in the same <Panel> chrome as the spec.

   The spec's roles are CSS custom properties (--type-display … --type-terminal):
   an app names a role and gets it. The library now exposes the same surface as a
   precompiled class ladder — `typeRoles` (src/text/type-roles.ts), one macro-compiled
   `style()` atom per role, verbatim the register's own values — that an app drops on a
   bare element via `class={typeRoles.X}`. So every one of the roles has an answer now,
   where three used to have none.

   The middle column shows the library's carrier for each role. Where a component bakes
   the role standalone it is used directly — Heading (display/title/headline, one per
   level), Content (body), Text (meta), Keyboard (terminal) — since that is the most
   representative thing an app reaches for. The two roles with no dedicated component,
   `label` and `micro`, use the `typeRoles` class on a bare <span>, which is the library's
   surface for exactly that case.

   The name and spec columns are panel chrome, hand-set identically to the spec
   (same MONO/CH tokens, same widths) so the two panels line up row-for-row and
   only the middle column is under comparison. */
import { type JSX } from "solid-js";
import {
  Content,
  Divider,
  Heading,
  Keyboard,
  Provider,
  Text,
  typeRoles,
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
        {/* Heading bakes a distinct role per level now: h1 → display, h2 → title,
            h3 → headline, taken verbatim from the typeRoles ladder (text/Heading.tsx
            :46-53). So the spec's three pixel-face tiers arrive as three distinct sizes —
            28/20/15px — the top of the type ladder no longer collapsing to one. */}
        <Row name="display" spec="Pixel · hero & page titles">
          <Heading level={1}>Think in circles</Heading>
        </Row>
        <Row name="title" spec="Pixel · section/panel titles">
          <Heading level={2}>Monte Carlo Path Tracing</Heading>
        </Row>
        <Row name="headline" spec="Pixel · card & list titles">
          <Heading level={3}>Spaced Review</Heading>
        </Row>

        {/* No component bakes `label` alone (Button/Tab/Checkbox all weld it to a control),
            but that is exactly what the typeRoles ladder is for: `typeRoles.label` is the
            register's label role — 600 13.5px Geist Pixel, the buttons/nav/chips face — as
            a class on a bare <span> (type-roles.ts). No control, no substitution. */}
        <Row name="label" spec="Pixel · buttons/nav/chips — 13px floor">
          <span class={typeRoles.label}>Resume · Home · #shaders</span>
        </Row>

        {/* Content and Text bake their roles standalone now: with no slotted context
            around them, Content renders typeRoles.body (Geist prose) and Text renders
            typeRoles.meta (Geist secondary, --text-secondary ink) — text/index.tsx. Inside
            a Card or MenuItem the parent's context still wins; free-standing, they are the
            body and meta roles, which is what the spec draws here. */}
        <Row name="body" spec="Geist · prose">
          <Content>March a ray through signed distance fields toward the nearest surface.</Content>
        </Row>
        <Row name="meta" spec="Geist · secondary">
          <Text>Today 18:00 · 214 waiting</Text>
        </Row>

        {/* `micro` is the other role with no dedicated component, so it too comes from the
            ladder: `typeRoles.micro` is the register's below-the-floor role — 700 10px Geist
            Mono, +0.1em — on a bare <span> (type-roles.ts). No pill, no container: type on
            glass, exactly as the spec draws it. */}
        <Row name="micro" spec="Mono · below the pixel floor">
          <span class={typeRoles.micro}>LIVE · DUE · 0x3F</span>
        </Row>

        {/* Keyboard bakes `terminal` standalone now: it is the library's <kbd>, and with
            no slotted KeyboardContext around it, it renders typeRoles.terminal — 11.5px
            Geist Mono, the wells-and-prompts face (text/Keyboard.tsx). Inside a MenuItem the
            parent still styles it; free-standing, it is the reachable mono role — the same
            one the key hints in mirror panel 02 now pick up. */}
        <Row name="terminal" spec="Mono · wells & prompts only">
          <Keyboard>{"> submit checkpoint --answer"}</Keyboard>
        </Row>
      </Provider>
    </Panel>
  );
}
