/* Mirror of spec panel 08 (LIST ROWS) built from real @proyecto-viviana/ui
   components, in the same <Panel> chrome as the spec.

   ListView is the library's counterpart here and it is a genuinely close one —
   it is S2's GridList, a non-virtualized list of rows with label/description/
   actions slots, which is exactly the shape the spec draws. So unlike most of
   the nine, this twin fails on details rather than on the whole.

   Two container decisions, both to keep the delta on the ROWS, which is what the
   panel is named after:
     • The container is the library's own <Well> — the matte, never-glass inset
       (`well` ink, a 1px `well-border` hairline, the 4px `--well-scan` pixel
       dither) that is exactly the surface this panel's container calls for, drawn
       by a real component rather than `Provider background=…`, the one prop this
       comparison forbids. NEAR-MISS: the spec well is specifically the *tutor*
       ink (--surface-well-tutor); Well exposes no ink variant, so it lands on the
       base `well` ink — the right surface, one shade off.
     • ListView is therefore `isQuiet`, its documented "draw without the default
       container chrome" variant, so it sits ON that well instead of stacking its
       own gray-25 plate and 1px border inside one. This is a real library prop,
       not an app override — but it does mean the twin is NOT exercising the
       default ListView container, which is a separate surface worth its own look.

   TableView was the other candidate (its columns would put `meta` inline right,
   where the spec has it, instead of stacked under the title). It was rejected:
   it brings a header row, sort affordances and column semantics the spec has
   none of, and "list rows" is the thing being specified. */
import { type JSX } from "solid-js";
import {
  Badge,
  ListView,
  ListViewItem,
  PixelChevronRightIcon,
  Provider,
  Text,
  Well,
  type BadgeProps,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

interface ListRow {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly tag: string;
  readonly variant: NonNullable<BadgeProps["variant"]>;
}

/* Same four rows, same order, same strings as the spec's LIST_ROWS. Only the tag
   changes shape: the spec paints each tag as bare micro text in a channel colour,
   so each row's channel is restated here as the nearest Badge variant.

   The mapping costs two of the four channels:
     • --text-tertiary (READ) -> "neutral". Right family, wrong weight: every
       fillStyle resolves neutral ink to gray-1000, the STRONGEST neutral, and the
       badge has no subdued/dim rung. The spec's deliberately-receding READ tag
       comes out as loud as the live one.
     • --status-info (RUNNING) -> "informative". The only exact hit; informative-*
       aliases the brand blue this channel is defined as.
     • --accent-live (● LIVE) -> "negative". `--accent-live` is #ff6b35 and the
       island comments it as "its own channel" precisely because it is neither a
       status nor a brand ramp. Nothing in the library carries it; red (#f04438) is
       the nearest published hue, and it arrives with "this is an error" attached.
     • --status-metric (NEW) -> "neutral" as well. Violet is published as a base
       ramp but aliased by no semantic role, and Badge's decorative variants
       (purple/indigo/…) are still on Adobe values the library itself warns would
       clash. Same call, and same loss, as the metrics channel in mirror panel 07:
       it goes missing rather than being faked in an off-palette hue. The visible
       consequence is that READ and NEW, four rows apart in the spec, are now
       indistinguishable. */
const LIST_ROWS: ListRow[] = [
  {
    id: "radiometry",
    title: "Radiometry Basics",
    meta: "Reference · 8 min read",
    tag: "READ",
    variant: "neutral",
  },
  {
    id: "pathtracing",
    title: "Monte Carlo Path Tracing",
    meta: "Journey · phase 3/5",
    tag: "RUNNING",
    variant: "informative",
  },
  {
    id: "raymarching",
    title: "SDF Raymarching — Live w/ Shader School",
    meta: "Today 18:00 · 214 waiting",
    tag: "● LIVE",
    variant: "negative",
  },
  {
    id: "firefly",
    title: "Firefly Clamping Deep Dive",
    meta: "Reference · 12 min read",
    tag: "NEW",
    variant: "neutral",
  },
];

export function MirrorPanel08(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="08 // LIST ROWS (reference / live) — VIVIANA UI">
      {/* This twin server-renders in full. It used to be deferred: a ListView SSR'd its
          empty state instead of its rows, because static-child registration ran in a
          createEffect (which renderToString never flushes) and the collection accessor
          was a createMemo (frozen at its first, empty read on the server). Both are fixed
          in the library — render-effect registration + a plain accessor — so items +
          render-function collections now hydrate cleanly; see
          packages/viviana-ui/test/Collections.{ssr,hydrate}.test for the regression
          fixtures. No ClientOnly. */}
      {/* No background prop: the rows must sit on the well's own ink exactly as the
          spec markup does. background="base" would paint an opaque plate over the
          well and there would be nothing left to compare. */}
      <Provider colorScheme={theme()} class="viviana-mirror-zone" data-mirror="08">
        {/* padding 8px matches the spec well. The ink is the library Well's base
            `well` surface — see the NEAR-MISS in the header: no `tutor` variant to
            select --surface-well-tutor. */}
        <Well style={{ padding: "8px" }}>
          {/* items + render function — the shape the spec's data maps onto most
              directly. (Static <ListViewItem> children also server-render now: their
              registration was moved to a render effect so renderToString sees the rows,
              the same fix that let this twin drop its ClientOnly.)

              GAP (row separators): the spec separates rows with 2px of gap and
              nothing else. Every ListView row carries a 1px gray-300 borderBottom
              that no prop turns off — isQuiet only drops it from the LAST row. The
              twin therefore reads as a ruled table where the spec reads as a stack.
              Tracked by ticket #103.

              The spec opens each row with a `>` prompt glyph in --accent-primary, and
              the library now draws it with real components: PixelChevronRightIcon in
              the item's LEADING `slot="icon"` grid-area (gridlist/index.tsx:336 lays
              `icon` left of `label`, applyItemSlotClasses wires the slot). This is the
              decorative entry-point marker the spec has — not `hasChildItems`, whose
              Chevron lands TRAILING past the badge and asserts a drill-into-children
              semantic the spec's marker does not carry. NEAR-MISS: the glyph takes
              --accent-primary explicitly here; the slot's default ink is --iconPrimary. */}
          <ListView aria-label="Lessons" items={LIST_ROWS} isQuiet>
            {(row: ListRow) => (
              <ListViewItem id={row.id} textValue={row.title} description={row.meta}>
                {/* Leading `>` marker in the item's own icon slot, accent-inked to
                    match the spec's entry-point glyph. createIcon() carries `slot`
                    through as `data-slot="icon"`, so applyItemSlotClasses parks it in
                    the `icon` grid-area, left of the label. The pixel SVG fills from
                    `var(--iconPrimary, currentColor)`, and the slot sets --iconPrimary,
                    so the accent is set on that variable (a bare `color` would be
                    shadowed by the slot's own --iconPrimary). */}
                <PixelChevronRightIcon
                  slot="icon"
                  style={{ "--iconPrimary": "var(--accent-primary)" }}
                />
                {/* GAP (meta placement): `description` is the right home for the spec's
                    meta line semantically, but the item's grid parks it in row 2 under
                    the label (gridlist/index.tsx:334) where the spec has it inline and
                    right-aligned. Every row doubles in height and the spec's four-column
                    rhythm collapses into a two-line stack. There is no prop to inline it.
                    The design decision is tracked by ticket #103.

                    NOTE (first paint): these slots — label, description, actions — get
                    their grid-area from applyItemSlotClasses(), a querySelectorAll walk
                    inside a createEffect. That is client-only, so the server paints the
                    row unslotted and the grid layout lands on mount; it does not change
                    the node count, so hydration is clean. Worth catching if the sweep
                    screenshots before mount. Tracked separately by ticket #102. */}
                {/* <Text slot="label">: the slot earns the row its grid-area and Text
                    carries the slot while adding the label's typography context. */}
                <Text slot="label">{row.title}</Text>
                {/* Plain wrapper, not a restyle: `slot="actions"` is the library's own
                    contract for trailing row content, and Badge splits `slot` out of its
                    DOM props (badge/index.tsx:353) so it cannot carry the attribute
                    itself. The div exists only to hold the slot. */}
                <div slot="actions">
                  {/* GAP (form): the spec's tag is bare micro text. Badge is the library's
                      only tag primitive and it is always a pill. fillStyle="outline" is the
                      closest it gets — the sole fill-less option, transparent background with
                      the ink mirroring the border channel — but it still adds a 1px rule,
                      a radius and horizontal padding the spec does not draw, and it cannot
                      reach the spec's 9.5px/0.1em tracked mono. size="S" is the floor.
                      The design decision is tracked by ticket #103. */}
                  <Badge size="S" variant={row.variant} fillStyle="outline">
                    {row.tag}
                  </Badge>
                </div>
              </ListViewItem>
            )}
          </ListView>
        </Well>
      </Provider>
    </Panel>
  );
}
