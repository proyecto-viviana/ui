/* Mirror of spec panel 05 (STATUS & PROGRESS) built from real @proyecto-viviana/ui
   components, in the same <Panel> chrome as the spec so any difference between the
   pair is attributable to the components rather than the container.

   The spec draws three readouts — a pixel ring with a centred score, an XP bar, and a
   stacked-avatar presence row — and all three have real counterparts (ProgressCircle,
   ProgressBar, AvatarGroup) that now carry the register faithfully: ProgressCircle draws
   the 16-block dithered/blinking pixel ring and centres a readout in it, ProgressBar
   renders the "in flight" dither past its fill via `pendingValue`, and AvatarGroup stacks
   at the register's 30px / -9px / raised-ring geometry. What is left between the pair is
   footprint (L's 64px box inside the spec's 76px slot), called out at its site. */
import { type JSX } from "solid-js";
import { Avatar, AvatarGroup, ProgressBar, ProgressCircle, Provider } from "@proyecto-viviana/ui";
import { MONO, Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

export function MirrorPanel05(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="05 // STATUS & PROGRESS — VIVIANA UI">
      {/* No `background` prop on purpose: Provider defaults to transparent, so the
          components sit on the panel's glass exactly as the spec markup does.
          background="base" would paint an opaque plate under them and there would be
          nothing left to compare. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="05"
        style={{
          display: "flex",
          "align-items": "center",
          gap: "22px",
          "flex-wrap": "wrap",
        }}
      >
        {/* The ring is real now: ProgressCircle draws the register's 16 discrete pixel
            blocks — lit blocks in the accent, the two at the leading edge on the ordered
            checker dither, the rest recessed, every block on the staggered glxRingBlink
            (progress/ProgressCircle.tsx:80-90,113-116,150-190). value/minValue/maxValue
            carry the real 3-of-5, and the block quantisation and lead-dither follow that
            value, so the whole form the spec draws survives — not just a percentage arc.
            The only residual is footprint: L's ring lives in a 64px box, so the 76px
            wrapper preserves the spec's slot and centres the smaller ring in it. */}
        <div
          style={{
            width: "76px",
            height: "76px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          {/* The centred readout is handed to ProgressCircle as children: it renders them
              in its own absolute-centred overlay (centerStyles) over the ring, keeping the
              spec's "3/5 then FOCUS" order that a label-above-value component would invert.
              The tokens are the spec's own, so any visible difference is the ring, not the
              type. */}
          <ProgressCircle size="L" value={3} minValue={0} maxValue={5} aria-label="Focus">
            <span
              style={{
                font: "var(--type-headline)",
                "letter-spacing": "var(--type-headline-track)",
              }}
            >
              3/5
            </span>
            <span
              style={{
                "font-family": MONO,
                "font-size": "8.5px",
                "letter-spacing": "0.1em",
                color: "var(--text-tertiary)",
              }}
            >
              FOCUS
            </span>
          </ProgressCircle>
        </div>

        <div
          style={{
            flex: 1,
            "min-width": "180px",
            display: "flex",
            "flex-direction": "column",
            gap: "14px",
          }}
        >
          {/* The one near-literal correspondence in the panel: ProgressBar puts `label` at
              the start and `valueLabel` at the end of a row above the track, which is the
              spec's arrangement, and its track carries an --edge-glass rim of its own. size
              "L" is a real 8px track, matching the spec's bar exactly — a component prop,
              not a restyle. The spec's second "in flight" segment past the fill is real too:
              `pendingValue` renders a dithered extension of the fill (progress-bar/index.tsx
              :41-46,297-309). The true 2,840 of 3,200 drives the solid fill and 3,032 carries
              it 6% further as the dithered band — (3032-2840)/3200 — exactly the spec's split. */}
          <ProgressBar
            size="L"
            label="Level 12"
            valueLabel="2,840 / 3,200 XP"
            value={2840}
            pendingValue={3032}
            minValue={0}
            maxValue={3200}
          />

          {/* AvatarGroup owns the overlap and renders `label` as trailing text, so the
              spec's stack + "+214 learning now" arrangement needs neither part hand-rolled.
              size={30} is a real enum member — the register's own stack size — and the
              overlap and ring are the spec's exactly: stacked avatars tuck by 30% of their
              diameter (-9px at 30px) and each punches the knockout ring in --surface-raised
              (avatar/index.tsx:41,96-121). alt="" matches the spec — the group label supplies
              the accessible name. */}
          <AvatarGroup label="+214 learning now" size={30}>
            <Avatar src="/glasselated/avatar-1.png" alt="" />
            <Avatar src="/glasselated/avatar-2.png" alt="" />
            <Avatar src="/glasselated/avatar-3.png" alt="" />
          </AvatarGroup>
        </div>
      </Provider>
    </Panel>
  );
}
