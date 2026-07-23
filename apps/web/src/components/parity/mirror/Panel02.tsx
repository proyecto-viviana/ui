/* Mirror of spec panel 02 (INPUTS & PROMPTS) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The spec draws two terminal *wells* — matte ink surfaces carrying a scan-grid, a
   glyph prefix, a blinking caret and a right-aligned key hint — flanking a bare
   three-way segment row. SearchField, SegmentedControl and TextField are the real
   counterparts, and they now carry every adornment the wells add: a `prefix` glyph
   slot, a trailing `suffix` key-hint slot, and — on the tutor prompt — the register's
   own tutor well surface. What is left between the pair is register the fields already
   own (the matte well fill, its radius and scan-grid) set against the spec's hand-drawn
   decorations (the blinking caret), which is exactly what this side-by-side measures. */
import { type JSX } from "solid-js";
import {
  Keyboard,
  Provider,
  SearchField,
  SegmentedControl,
  SegmentedControlItem,
  TextField,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

export function MirrorPanel02(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="02 // INPUTS & PROMPTS — VIVIANA UI">
      {/* No background prop: the fields must sit on the panel's glass exactly as the
          spec markup does. background="base" would paint an opaque plate under them
          and there would be nothing left to compare. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="02"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "12px",
          "flex-wrap": "wrap",
        }}
      >
        {/* Spec well #1: `/` + "search lessons" + caret + ⌘K. Both adornments are real
            field slots now. `prefix="/"` renders the slash-command glyph in place of
            SearchField's built-in magnifier (searchfield/index.tsx:612-621), and `suffix`
            drops the ⌘K key hint inside the trailing edge of the field
            (searchfield/index.tsx:630-632) — where the spec draws it, not beside it.
            Keyboard needs no styling here: standalone it bakes typeRoles.terminal
            (Keyboard.tsx), the register's mono key-cap face, rather than a bare <kbd>. */}
        <div style={{ "min-width": "240px" }}>
          <SearchField
            aria-label="Search lessons"
            placeholder="search lessons"
            prefix="/"
            suffix={<Keyboard>⌘K</Keyboard>}
          />
        </div>

        {/* Spec segments: day / [week] / month, where the brackets are the terminal
            register's shorthand for "selected". SegmentedControl expresses selection
            itself, so the brackets are dropped rather than doubled onto the label;
            the lowercase strings are kept as the spec sets them. */}
        <SegmentedControl aria-label="Range" defaultSelectedKey="week">
          <SegmentedControlItem id="day">day</SegmentedControlItem>
          <SegmentedControlItem id="week">week</SegmentedControlItem>
          <SegmentedControlItem id="month">month</SegmentedControlItem>
        </SegmentedControl>

        {/* Spec well #2 (tutor): `$` + the prompt + caret + ↵, on the AI-lane surface.
            `surface="tutor"` paints the field on --surface-well-tutor with its own
            --well-tutor-ink (textfield/index.tsx:157-171) — the deeper AI-lane surface
            the spec uses to set the tutor prompt apart from the search well beside it.
            `prefix="$"` and `suffix={<Keyboard>↵</Keyboard>}` are both real field slots,
            so the `$` and the return-key hint render inside the field exactly where the
            spec draws them. The field root is a block grid (input column 1fr), so it
            fills this flex item and spans the row as the spec's well does. */}
        <div style={{ flex: 1, "min-width": "260px" }}>
          <TextField
            aria-label="Ask tutor"
            surface="tutor"
            prefix="$"
            suffix={<Keyboard>↵</Keyboard>}
            defaultValue={'ask tutor "why does variance drop?"'}
          />
        </div>
      </Provider>
    </Panel>
  );
}
