/* Mirror of spec panel 07 (TERMINAL WELLS) built from real @proyecto-viviana/ui
   components. Renders in the same <Panel> chrome as the spec so any difference
   between the pair is attributable to the components, not the container.

   The two <Well>s come from lab-shell for the same reason: the well is the panel's
   CONTAINER, and the library has no counterpart for it to begin with — S2 dropped
   S1's Well, and the only surface a consumer can ask the library for is
   `Provider background="base|layer-1|layer-2"`, which paints the library's own
   neutral layer rather than the island's matte ink and is exactly the prop this
   comparison forbids. Reusing the spec's Well keeps both sides on the identical
   `--surface-well` + scan-grid so the readable delta is the CONTENT inside it.

   What the library is actually being asked for here is two things: a severity-keyed
   log line and a labelled metric readout. StatusLight and LabeledValue/Meter are
   the real counterparts; the gaps are in what they can express, documented at each
   site. */
import { For, type JSX } from "solid-js";
import {
  LabeledValue,
  Meter,
  Provider,
  StatusLight,
  type StatusLightProps,
} from "@proyecto-viviana/ui";
import { Panel, Well } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* Same six lines, same order, same strings as the spec's T3_LOG. Only the ink
   changes shape: the spec paints each MESSAGE in a channel colour, so each line's
   channel is restated here as the nearest StatusLight variant.

   The mapping is not one-to-one and the misses are the finding:
     • cy (info)   -> "informative"; accent/informative both alias the brand blue.
     • cy (passed) -> "positive". Reads as a success in the spec and resolves to the
       same blue by design — glasselated-ramps.ts retargets positive off green onto
       blue citing THIS line ("checkpoint 0x3D passed ✓") as its evidence.
     • am (signal) -> "notice"; notice-color-* refs the orange slot, which now carries
       brand amber.
     • rd (fault)  -> "negative"; negative-color-* refs the brand red.
     • vi (metric) -> nothing. Violet is published as a base ramp but is aliased by no
       semantic role, and StatusLight's decorative variants (purple/indigo/…) are still
       on Adobe values the library itself warns would clash. Substituted with "neutral",
       so the metrics channel simply goes missing in the twin. */
const T3_LOG: readonly {
  readonly t: string;
  readonly msg: string;
  readonly variant: NonNullable<StatusLightProps["variant"]>;
}[] = [
  { t: "18:42:07", msg: "sampler.init — 6000 target samples", variant: "neutral" },
  { t: "18:43:51", msg: "checkpoint 0x3D passed ✓", variant: "positive" },
  { t: "18:44:12", msg: "variance 0.0087 → 0.0031", variant: "neutral" },
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
              /* GAP (form): StatusLight spends its colour on a leading DOT and leaves the
                 label on the neutral content ink. The spec has no dot and paints the
                 message itself, so the twin inverts where the severity lives — the log
                 stops reading as coloured transcript and starts reading as a status list.
                 GAP (ink): there is no secondary/dim treatment inside StatusLight, so the
                 timestamp cannot hold --well-dim against the message. It is passed as part
                 of the same label (spacing preserved) and comes out at full strength, which
                 costs the well its time gutter.
                 size="S" is the closest rung to the spec's 11.5px/1.95 terminal line; the
                 exact size and row rhythm are the library's ui ramp, not the spec's. */
              <StatusLight variant={ln.variant} size="S">
                {`${ln.t}  ${ln.msg}`}
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
                them. GAP (form): the spec draws five discrete blocks, [▮▮▮▯▯]; Meter has a
                single continuous track with no segmentation, so 3/5 becomes 60% of a bar.
                variant is Meter's default informative — the brand blue, which is the
                channel the spec paints "focus" in. */}
            <Meter
              label="focus"
              labelPosition="side"
              size="S"
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
