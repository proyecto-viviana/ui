/* Mirror of spec panel 05 (STATUS & PROGRESS) built from real @proyecto-viviana/ui
   components, in the same <Panel> chrome as the spec so any difference between the
   pair is attributable to the components rather than the container.

   The spec draws three readouts — a pixel ring with a centred score, an XP bar, and a
   stacked-avatar presence row — and all three have real counterparts (ProgressCircle,
   ProgressBar, AvatarGroup). The gaps are therefore not "component missing" but
   "component can't express it", which is the more useful finding; each is called out
   at its site rather than papered over. */
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
        {/* GAP (form): the spec's ring is 16 discrete 7px blocks — 10 lit, 2 dithered at
            the leading edge, each on a staggered blink. ProgressCircle draws a single
            continuous SVG arc at three fixed sizes (S/M/L = 16/32/64px), so neither the
            quantisation, the dither, nor the blink survives. L is the closest size; the
            76px box around it preserves the spec's footprint so the row's rhythm matches
            and the ring itself is the only thing that reads differently.
            value/minValue/maxValue carry the real 3-of-5, so the arc is genuinely 60%
            rather than a hardcoded percentage. */}
        <div
          style={{
            position: "relative",
            width: "76px",
            height: "76px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          <ProgressCircle size="L" value={3} minValue={0} maxValue={5} aria-label="Focus" />
          {/* GAP (composition): ProgressCircle takes no children and has no label slot, so
              the centred readout cannot be handed to the component. It is overlaid here
              instead of being moved beside the ring, because in the SPEC this readout is
              also just two plain spans — mirroring plain text with plain text keeps the
              comparison controlled, and keeps the spec's "3/5 then FOCUS" order that
              LabeledValue (label-above-value only) would have inverted. The tokens are the
              spec's own, so any visible difference here is the ring, not the type. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "center",
              "pointer-events": "none",
            }}
          >
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
          </div>
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
              not a restyle.
              GAP: past its 84% fill the spec adds a second 6% dithered segment (work "in
              flight"). ProgressBar has one fill and no buffered/secondary value, so that
              segment is dropped and the true 2,840 of 3,200 drives the single fill. */}
          <ProgressBar
            size="L"
            label="Level 12"
            valueLabel="2,840 / 3,200 XP"
            value={2840}
            minValue={0}
            maxValue={3200}
          />

          {/* AvatarGroup owns the overlap and renders `label` as trailing text, so the
              spec's stack + "+214 learning now" arrangement needs neither part hand-rolled.
              GAP: size is an enum (16…40), so the spec's 30px avatars round to 32, and the
              overlap/ring treatment is the library's own rather than the spec's -9px inset
              on --surface-raised. alt="" matches the spec — the group label supplies the
              accessible name. */}
          <AvatarGroup label="+214 learning now" size={32}>
            <Avatar src="/glasselated/avatar-1.png" alt="" />
            <Avatar src="/glasselated/avatar-2.png" alt="" />
            <Avatar src="/glasselated/avatar-3.png" alt="" />
          </AvatarGroup>
        </div>
      </Provider>
    </Panel>
  );
}
