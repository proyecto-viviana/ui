/* Mirror of spec panel 07 (TERMINAL WELLS) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The two <Well>s are the library's own now — the register's matte inset (the `well`
   ink, its scan-grid and the `well-border` hairline), the same --surface-well surface
   the spec's wells use. So the container is a real component on both sides and the
   readable delta is the CONTENT inside it.

   What the library is being asked for here is two things: a severity-keyed log line
   and a labelled metric readout. StatusLight and LabeledValue/Meter are the real
   counterparts; the residuals are in what they can express, documented at each site. */
import { For, type JSX } from "solid-js";
import {
  LabeledValue,
  Meter,
  Provider,
  StatusLight,
  type StatusLightProps,
  Well,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* Same six lines, same order, same strings as the spec's T3_LOG. Each line's channel
   maps to the StatusLight variant that paints the message in that channel's ink — and
   StatusLight now tones the LABEL to the channel, not just a leading dot, so the message
   carries the colour the spec gives it:
     • cy (info)   -> "informative"; accent/informative both alias the brand blue.
     • cy (passed) -> "positive". Reads as a success in the spec and resolves to the
       same blue by design — glasselated-ramps.ts retargets positive off green onto
       blue citing THIS line ("checkpoint 0x3D passed ✓") as its evidence.
     • am (signal) -> "notice"; notice-color-* refs the orange slot, which now carries
       brand amber.
     • rd (fault)  -> "negative"; negative-color-* refs the brand red.
     • vi (metric) -> "metric". StatusLight now carries the register's metric channel —
       the sky-blue that replaced the retired violet (--status-metric, statuslight/
       index.tsx:32,106) — so the fourth channel is expressed rather than going missing. */
const T3_LOG: readonly {
  readonly t: string;
  readonly msg: string;
  readonly variant: NonNullable<StatusLightProps["variant"]>;
}[] = [
  { t: "18:42:07", msg: "sampler.init — 6000 target samples", variant: "neutral" },
  { t: "18:43:51", msg: "checkpoint 0x3D passed ✓", variant: "positive" },
  { t: "18:44:12", msg: "variance 0.0087 → 0.0031", variant: "metric" },
  { t: "18:45:30", msg: "warn: firefly detected @ px(812,204)", variant: "notice" },
  { t: "18:47:02", msg: "err: memory cell 0x3F degraded", variant: "negative" },
  { t: "18:47:05", msg: "quiz: why do shorter paths dominate?", variant: "informative" },
];

export function MirrorPanel07(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="07 // TERMINAL WELLS — VIVIANA UI">
      {/* No background prop: the components must sit on the wells' own ink exactly as
          the spec markup does. background="base" would paint an opaque plate inside
          each well and there would be nothing left to compare. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="07"
        style={{ display: "grid", "grid-template-columns": "1.5fr 1fr", gap: "14px" }}
      >
        {/* Padding matches the spec well; its font-size/line-height are deliberately not
            restated, because they only ever styled raw text and the library components
            carry their own type ramp regardless. */}
        <Well style={{ padding: "14px 16px" }}>
          <For each={T3_LOG}>
            {(ln) => (
              /* StatusLight tones its LABEL to the channel now, not just the dot
                 (statuslight/index.tsx:92-108) — the same 800/900 pairs Meter's fill uses
                 — so the message carries the severity colour exactly as the spec paints it.
                 The timestamp holds --well-dim against it: it is a child span in the dim
                 ink, while the rest of the label inherits the channel tone from the wrapper,
                 so the well keeps its time gutter. REAL residual: StatusLight always draws
                 its leading dot, which the spec's rows do not have — the twin reads as
                 "dot + coloured line" where the spec is the coloured line alone.
                 size="S" is the closest rung to the spec's 11.5px/1.95 terminal line; the
                 exact size and row rhythm are the library's ui ramp, not the spec's. */
              <StatusLight variant={ln.variant} size="S">
                <span style={{ color: "var(--well-dim)" }}>{ln.t}</span>
                {"  "}
                {ln.msg}
              </StatusLight>
            )}
          </For>
          {/* GAP (omitted): the spec closes the log with a "> " prompt and a blinking
              caret. The library has no cursor/caret primitive and nothing stands in for
              one — an indeterminate ProgressCircle is the only live-state affordance it
              offers and it reads as loading, not as awaiting input. The line is dropped
              rather than faked, so the twin runs one row shorter than the spec.
              (lab-shell exports a shared <Caret> if pixel parity is wanted back.) */}
        </Well>

        {/* GAP (ink), whole readout: the spec keys each row by painting its LABEL in a
            channel colour — cy/am/vi/rd. LabeledValue has no variant, status or colour
            prop of any kind, so all four labels come out on the same neutral ink and the
            readout loses the channel coding that is most of its meaning. StatusLight could
            carry the fault row's red, but not in a label/value layout, so the rows are kept
            uniform and the loss is reported once rather than papered over on one row. */}
        <Well style={{ padding: "13px 15px" }}>
          <div style={{ display: "flex", "flex-direction": "column", gap: "6px" }}>
            {/* Meter is the library's gauge, and label/valueLabel land where the spec puts
                them. `segments={5}` draws it as five discrete blocks, [▮▮▮▯▯]
                (meter/index.tsx:54-60,252-259) — round(3/5 × 5) = 3 filled — so the form
                matches the spec's block meter rather than a continuous 60% bar. variant is
                Meter's default informative — the brand blue, the channel the spec paints
                "focus" in; the register keeps the channel ink on the label, not the blocks. */}
            <Meter
              label="focus"
              labelPosition="side"
              size="S"
              segments={5}
              value={3}
              minValue={0}
              maxValue={5}
              valueLabel="3/5"
            />
            <LabeledValue label="streak" value="12 days · hold" labelPosition="side" size="S" />
            <LabeledValue label="xp" value="2,840 · lvl 12" labelPosition="side" size="S" />
            <LabeledValue label="memory" value="cell 0x3F degraded" labelPosition="side" size="S" />
          </div>
        </Well>
      </Provider>
    </Panel>
  );
}
