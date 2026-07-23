/* Mirror of spec panel 02 (INPUTS & PROMPTS) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The spec draws two terminal *wells* — matte ink surfaces carrying a scan-grid, a
   glyph prefix, a blinking caret and a right-aligned key hint — flanking a bare
   three-way segment row. SearchField, SegmentedControl and TextField are the real
   counterparts; what the wells add beyond them is either register (the well surface
   itself, which is exactly what this side-by-side is measuring) or a slot the
   fields do not have. Both are called out at their sites rather than hand-rolled:
   a faked adornment would hide the gap this panel exists to surface. */
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
        {/* Spec well #1: `/` + "search lessons" + caret + ⌘K.
            GAP (prefix): SearchField carries the search semantics and supplies its own
            leading SearchIcon, but it has no `prefix` slot — that shared field
            primitive (src/field/prefix.tsx) is threaded into TextField, ColorField,
            NumberField and ComboBox only — so the `/` slash-command glyph cannot go
            inside the field. The built-in magnifier stands in for it. */}
        <div
          style={{
            display: "flex",
            "align-items": "center",
            gap: "10px",
            "min-width": "240px",
          }}
        >
          <SearchField aria-label="Search lessons" placeholder="search lessons" />
          {/* GAP (trailing adornment): no field in the library exposes a slot at the
              end of the input, so the key hint sits BESIDE the field rather than
              inside it as the spec draws it. Keyboard is the library's own component
              for a key cap, but it is styled only through a slotted KeyboardContext
              (MenuItem provides one); standalone it renders a bare <kbd>. Left
              unstyled deliberately — that is the finding. */}
          <Keyboard>⌘K</Keyboard>
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

        {/* Spec well #2 (tutor): `$` + the prompt + caret + ↵.
            GAP (surface): the spec paints this one on --surface-well-tutor, a second
            field surface marking the AI lane apart from the search well beside it.
            The library has a single field appearance with no such variant, so the two
            prompts read identically here where the spec distinguishes them. */}
        <div
          style={{
            flex: 1,
            "min-width": "260px",
            display: "flex",
            "align-items": "center",
            gap: "10px",
          }}
        >
          {/* The field root is a block-level grid whose input column is 1fr, so it
              fills a plain sized container — hence this wrapper rather than making the
              field a flex item, which would leave it at its intrinsic 208px default
              instead of spanning the row as the spec's well does. */}
          <div style={{ flex: 1, "min-width": 0 }}>
            {/* `prefix` is a real field slot, so unlike the search well the `$`
                renders inside the field exactly where the spec draws it. */}
            <TextField
              aria-label="Ask tutor"
              prefix="$"
              defaultValue={'ask tutor "why does variance drop?"'}
            />
          </div>
          <Keyboard>↵</Keyboard>
        </div>
      </Provider>
    </Panel>
  );
}
