/* Mirror of spec panel 03 (CHIPS & BADGES) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The spec packs two families into one wrapping row: four topic chips (one accent-
   filled, three on the scan-gridded well surface) and a run of status badges either
   side of a hairline rule. TagGroup, Divider and Badge are the real counterparts.
   The chips land almost literally — Tag already wears the register library-side — and
   the badges now do too: the register's own `live` (orange-red, pulsing) and `metric`
   (sky-blue) channels landed in Badge, and `subtle`/`outline` carry same-channel ink.
   The residuals that remain are documented at their sites. */
import { type JSX } from "solid-js";
import { Badge, Divider, PixelFlameIcon, Provider, TagGroup, Text } from "@proyecto-viviana/ui";
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
            Render the raw label: TagGroup wraps each item into its own role="row", so a
            bare string is the simplest faithful form. (Returning a built <Tag> is fine
            now too — the SSR double-wrap that used to force this workaround was fixed by
            the library's isServer/duck-typed isRenderedTag branch, commit 1d7604f6; the
            bare label just carries no per-tag props we need here.) */}
        <TagGroup
          aria-label="Topics"
          items={CHIPS}
          isEmphasized
          selectionMode="single"
          defaultSelectedKeys={["shaders"]}
        >
          {(c) => c.label}
        </TagGroup>

        {/* The spec's 1px × 26px hairline. `size="S"` draws the divider at 1px
            (divider/index.tsx:95) — matching the spec's width exactly. It still stretches
            to the row (align-self: stretch) rather than taking a fixed 26px height, which
            it exposes no knob for; in this centred flex row that reads as full-height. */}
        <Divider orientation="vertical" size="S" />

        {/* `live` is a real register channel now: white ink on --accent-live (#ff6b35),
            the exact orange-red the spec's LIVE pill uses (badge/index.tsx:228,170-172),
            and the glxPulse breathing comes free — badgeStyles animates `live` with a 2s
            ease-in-out infinite livePulse (badge/index.tsx:329-347), reduced-motion aware.
            So both former GAPs — the missing orange-red channel and the dropped pulse —
            are closed by one variant, and no hue is shared with DEGRADED below. */}
        <Badge variant="live">● LIVE</Badge>

        {/* The spec draws NEW as an outline chip — coloured ink on a 1px coloured rule,
            transparent fill. The register retired violet and replaced it with `metric`
            (sky-blue, --status-metric), and `metric` is a first-class outline channel:
            it carries a metric border (badge/index.tsx:322), metric ink (:213) and a
            transparent fill (:303). So `outline` draws the spec's exact treatment —
            coloured ink on a coloured rule, no plate — in the channel that stands in for
            the spec's violet, where `purple` could only ever put the colour in the plate. */}
        <Badge variant="metric" fillStyle="outline">
          NEW
        </Badge>

        {/* Outline is a real branch for `notice`, so these two are direct matches: token
            ink, token rule, transparent fill — the spec's treatment exactly. */}
        <Badge variant="notice" fillStyle="outline">
          DUE
        </Badge>
        <Badge variant="negative" fillStyle="outline">
          0x3F DEGRADED
        </Badge>

        {/* The streak chip is the register's tinted-plate fill. `notice` + `subtle` now
            renders the spec's amber-on-amber pairing directly: notice-800/900 ink on a
            notice-subtle plate (badge/index.tsx:183-194) — the ink follows the channel,
            no longer resetting to black/white. The flame is the register's own
            PixelFlameIcon (createIcon), so Badge's icon pipeline baseline-centres and
            sizes it and it inks from the badge's amber currentColor, where the spec's
            raster <img> arrived un-centred and had to be hand-sized. <Text> is explicit
            because mixed children (icon + label) skip Badge's text-only fast path that
            otherwise applies the label styles. */}
        <Badge variant="notice" fillStyle="subtle">
          <PixelFlameIcon />
          <Text>12-day streak</Text>
        </Badge>
      </Provider>
    </Panel>
  );
}
