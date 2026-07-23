/* Mirror of spec panel 06 (CARDS) built from real @proyecto-viviana/ui components, in
   the same <Panel> chrome as the spec so any difference between the pair is
   attributable to the components rather than the container.

   This is the panel where the library has the most to say: Card/CardPreview/Content/
   Footer is a genuine S2 composition, so the three cards are assembled from real slots
   rather than from divs with padding. Two structural facts drive most of the choices
   below and are worth stating once:

     • A standalone Card (one not inside a CardView) is FIXED WIDTH per size — 15rem at
       size M. The spec's cards are fluid thirds of the panel, so each Card carries an
       inline width:100% to sit in the grid. That is layout, not restyling, but it is a
       real finding: `size` is the only width control the component exposes, and a Card
       dropped into any fluid layout will ignore it.
     • CardPreview is the only full-bleed region Card offers (it bleeds by negative
       --card-padding-*). The spec's console header bar is full-bleed, so it lives there
       even though the slot is nominally for media — see the note at its site. */
import { For, type JSX } from "solid-js";
import {
  Badge,
  Button,
  Card,
  CardPreview,
  Content,
  Divider,
  Footer,
  Image,
  ProgressBar,
  Provider,
  StatusLight,
  Text,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* Same rows, same order, same strings as the spec's CONSOLE_CARDS.
   The spec colours its dot and state label straight from --status-signal / --status-metric.
   `notice` resolves to amber, i.e. --status-signal, so the DUE row carries over directly.

   The NEW row used `purple`, on the reading that --status-metric is the island's violet
   channel. It is not: --status-metric is #1c8fc9 / #5ac2ee (glasselated.css:97/:212), a
   cyan-blue. The island does spend violet on metrics, but this token is not that channel,
   so `purple` was painting a violet chip where the spec paints a blue one — a hue leak
   introduced here, not by the library. `informative` is the semantic blue on the themed
   ramps, so it is both the right hue and the right kind of variant: the state now carries
   meaning rather than being a bare colour name. */
const CONSOLE_CARDS = [
  {
    id: "mirror-06-review-queue",
    path: "~/review/queue",
    state: "DUE",
    status: "notice",
    title: "Spaced Review",
    desc: "4 cards due, oldest from Radiometry Basics. About 6 minutes.",
    btn: "Review",
    btnVariant: "create",
  },
  {
    id: "mirror-06-journeys-colorspaces",
    path: "~/journeys/colorspaces",
    state: "NEW",
    status: "informative",
    title: "Color Spaces",
    desc: "New design journey — 8 lessons on gamuts, gamma and OKLCH.",
    btn: "Start",
    btnVariant: "secondary",
  },
] as const;

/* The spec's console header is a padded strip; CardPreview bleeds to the card edge and
   contributes no padding of its own, so the row restates it. Layout only. */
const consoleBar: JSX.CSSProperties = {
  display: "flex",
  "align-items": "center",
  "justify-content": "space-between",
  gap: "8px",
  padding: "9px 14px",
};

export function MirrorPanel06(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="06 // CARDS — VIVIANA UI">
      {/* No `background` prop on purpose: Provider defaults to transparent, so the cards
          sit on the panel's glass exactly as the spec's MeshCards do. background="base"
          would paint an opaque plate behind them and the comparison would be over. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="06"
        style={{ display: "grid", "grid-template-columns": "1fr 1fr 1fr", gap: "14px" }}
      >
        {/* ── the media card ── */}
        {/* The spec's MeshCard paints a tinted hex-mesh weave behind the glass, and Card
            carries it now: `mesh="ambient"` paints the register's quiet mixed gray/blue/
            orange weave (card/index.tsx:47,67-72,852-866). `ambient` is the media card's
            neutral warmth; the console cards below pick `signal` vs `ambient` per state.
            Its border resolves through var(--border-subtle), so the rim matches too. */}
        {/* `id` is not optional: CardProps extends GridListItemProps, so even a standalone
            Card that never joins a collection has to be given a collection key. */}
        <Card id="mirror-06-sdf-raymarching" size="M" mesh="ambient" UNSAFE_style={{ width: "100%" }}>
          <CardPreview>
            {/* Image gets aspect-ratio 3/2 and object-fit:cover from the card's own
                ImageContext. GAP (proportion): the spec fixes the thumbnail at 110px tall;
                3/2 is not exposed as a prop, so the preview is taller here. Left alone —
                forcing a height would hide exactly the kind of difference this panel is
                built to surface. */}
            <Image src="/glasselated/thumb-1.png" alt="" />
            {/* The spec's overlay is a translucent, backdrop-blurred chip. Badge carries
                the label faithfully, but it paints no backdrop-filter of its own — that
                glass blur is the one thing that does not carry across. Positioning is ours
                (CardPreview is position:relative); the chip's own styling is entirely the
                component's. */}
            <div style={{ position: "absolute", top: "10px", left: "10px" }}>
              <Badge variant="neutral" size="S">
                SHADERS
              </Badge>
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">SDF Raymarching</Text>
            <Text slot="description">March a ray through signed distance fields.</Text>
          </Content>
          <Footer>
            {/* SUBSTITUTION: the spec draws "12 lessons · [▮▮▮▮▯▯▯▯▯▯] 40%" — a mono glyph
                meter. ProgressBar with labelPosition="side" produces the same three-part
                line (label, track, value) from real data, so the arrangement survives even
                though the ten-block quantisation does not; there is no stepped/discrete
                variant in the library. Width is inline because Footer is a flex row and
                ProgressBar sizes to content. */}
            <ProgressBar
              size="S"
              labelPosition="side"
              label="12 lessons"
              value={40}
              UNSAFE_style={{ width: "100%" }}
            />
          </Footer>
        </Card>

        {/* ── the console cards ── */}
        <For each={CONSOLE_CARDS}>
          {(w) => (
            <Card
              id={w.id}
              size="M"
              mesh={w.status === "notice" ? "signal" : "ambient"}
              UNSAFE_style={{ width: "100%" }}
            >
              {/* CardPreview is documented for media, but it is the only slot that bleeds
                  to the card edge, which is what the spec's header strip does. Using it
                  keeps the geometry real instead of hand-rolling a bar with negative
                  margins. `background="inset"` sits the strip on --surface-inset
                  (card/index.tsx:101,343-345) — the register's own console-strip
                  treatment — so it reads recessed from the card body, as the spec draws it. */}
              <CardPreview background="inset">
                <div style={consoleBar}>
                  {/* StatusLight is exactly the spec's dot + path pairing, dot colour and
                      all — one component instead of a span and a styled circle. */}
                  <StatusLight size="S" variant={w.status}>
                    {w.path}
                  </StatusLight>
                  {/* SUBSTITUTION: the spec's state is bare letter-spaced mono text tinted
                      with the dot colour. The library has no "tinted inline label"; Badge
                      subtle is the nearest real component, so the state reads as a chip
                      here. Same string, same colour family, more enclosure. */}
                  <Badge variant={w.status} fillStyle="subtle" size="S">
                    {w.state}
                  </Badge>
                </div>
                <Divider />
              </CardPreview>
              <Content>
                <Text slot="title">{w.title}</Text>
                <Text slot="description">{w.desc}</Text>
              </Content>
              <Footer>
                {/* Both CTAs land on real variants: `create` is the register's warm CTA —
                    the pale-yellow fill the spec gives the one action that makes something
                    new — and `secondary` is the raised neutral the second card uses. The
                    earlier note here said `create` had been dropped in 0.5.x and fell back
                    to `accent`, which is why this button was reading blue. */}
                <Button variant={w.btnVariant} size="S">
                  {w.btn}
                </Button>
              </Footer>
            </Card>
          )}
        </For>
      </Provider>
    </Panel>
  );
}
