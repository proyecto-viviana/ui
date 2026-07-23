/* Mirror of spec panel 03 (CHIPS & BADGES) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The spec packs two families into one wrapping row: four topic chips (one accent-
   filled, three on the scan-gridded well surface) and a run of status badges either
   side of a hairline rule. TagGroup, Divider and Badge are the real counterparts.
   The chips land almost literally — Tag already wears the register library-side.
   The badges are where the register runs out of channels, and each mismatch is
   documented at its site rather than patched from the app. */
import { type JSX } from "solid-js";
import { Badge, Divider, Provider, TagGroup, Text } from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* TagGroup builds its tags through the solidaria collection machinery, so it needs
   the items + render-function form; static children render outside the collection
   context and leave the group empty on the server. */
const CHIPS = [
  { id: "shaders", label: "#shaders" },
  { id: "pathtracing", label: "#pathtracing" },
  { id: "colorspaces", label: "#colorspaces" },
  { id: "raymarching", label: "#raymarching" },
];

export function MirrorPanel03(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="03 // CHIPS & BADGES — VIVIANA UI">
      {/* No background prop: the components must sit on the panel's glass exactly as the
          spec markup does. background="base" would paint an opaque plate underneath them
          and there would be nothing left to compare. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="03"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "10px",
          "flex-wrap": "wrap",
        }}
      >
        {/* The one near-literal correspondence in the panel. Tag's own register already
            paints an unselected tag on --surface-well with the --well-scan conic grid,
            and an emphasized *selected* tag takes the accent fill with white ink and no
            scan — which is exactly the spec's "#shaders filled, the other three scanned"
            split. So the distinction is expressed as selection state rather than as the
            spec's per-chip fg/bg/border/scan quadruple, and nothing here is restated.
            Render the raw label, not a <Tag>: TagGroup wraps each item itself, and its
            isRenderedTag() check is `instanceof HTMLElement` — always false on the
            server, so a returned <Tag> gets double-wrapped into a nested role="row".
            Library bug, same one the gallery works around. */}
        <TagGroup
          aria-label="Topics"
          items={CHIPS}
          isEmphasized
          selectionMode="single"
          defaultSelectedKeys={["shaders"]}
        >
          {(c) => c.label}
        </TagGroup>

        {/* The spec's 1px × 26px hairline. Divider resolves to the same --border-default
            token; it is 2px at size M and stretches to the row (align-self: stretch)
            instead of taking a fixed height, neither of which it exposes a knob for. */}
        <Divider orientation="vertical" />

        {/* GAP (colour): the spec's LIVE pill is white ink on --accent-live (#ff6b35), a
            channel no badge variant resolves to — the ramps carry no orange-red. `notice`
            is the nearer hue but renders as a pale peach plate with black ink, losing the
            spec's saturated-fill/white-ink relationship entirely; `negative` keeps that
            relationship and is closer in chroma, so it is the substitution — at the cost
            of sharing a hue with DEGRADED below, which the spec deliberately separates.
            GAP (motion): Badge has no live/pulsing affordance, so the spec's glxPulse
            breathing is dropped rather than animated onto the component from here. */}
        <Badge variant="negative">● LIVE</Badge>

        {/* GAP: the spec draws NEW as violet ink on a violet 1px rule. `purple` is the
            violet channel, but badgeStyles only branches `outline` for accent /
            informative / positive / notice / negative / neutral — every other variant
            falls through to a transparent border and default black/white ink, which would
            erase the violet completely. Both remaining fills keep a violet plate — subtle
            a tint (#f4ebfc / #40007a), bold the saturated fill (#9a47e2 / #9d4ee4) — but
            neither can put violet in the *ink*, which is the part the spec actually draws.
            Bold is the substitution because it holds the spec's chroma; either way this
            reads as a violet plate where the spec draws a violet outline. */}
        <Badge variant="purple">NEW</Badge>

        {/* Outline is a real branch for `notice`, so these two are direct matches: token
            ink, token rule, transparent fill — the spec's treatment exactly. */}
        <Badge variant="notice" fillStyle="outline">
          DUE
        </Badge>
        <Badge variant="negative" fillStyle="outline">
          0x3F DEGRADED
        </Badge>

        {/* GAP (fill): the spec's streak chip is --amber-600 ink on an --amber-100 plate.
            `subtle` is the library's tinted-plate fill style, but it resets the ink to
            plain black/white for every variant, so the amber-on-amber pairing has no
            expression — the plate follows, the ink does not.
            GAP (icon): Badge's icon slot is an IconContext render pipeline that only
            library icons (createIcon → SVG) opt into, and Image — the raster component —
            exposes no image-rendering control, so pixel art would arrive smoothed. The
            flame therefore stays the spec's own <img> and misses the baseline-centring a
            real badge icon would get. <Text> is explicit because mixed children skip
            Badge's text-only fast path, which is what otherwise applies the label styles. */}
        <Badge variant="notice" fillStyle="subtle">
          <img
            src="/glasselated/streak-flame.png"
            alt=""
            style={{
              width: "20px",
              height: "20px",
              "image-rendering": "pixelated",
              "flex-shrink": 0,
            }}
          />
          <Text>12-day streak</Text>
        </Badge>
      </Provider>
    </Panel>
  );
}
