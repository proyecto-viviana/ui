/* /examples/playground — the render viewport (study 4f).
 *
 * The viewport is the hero: a pixelated frame under `HudFrame` brackets with
 * the sampler's readouts pinned over it, the open files as a terminal tab
 * strip, and the parameters as five real sliders in a matte well. The log
 * beneath them reports the one thing the render is unhappy about.
 *
 * Every region is a shipped @proyecto-viviana/ui component: the HUD brackets
 * are `HudFrame`, the readouts are `Badge`, the converging bar is
 * `ProgressBar`'s `value` + `pendingValue` (solid lead, dithered tail), the
 * file strip is `Tabs variant="terminal"` inside a `Well`, the parameters are
 * `Slider`s that own their own value, and the log is `TerminalLog`. RUN is
 * `Button variant="terminal"` — the console affordance, not an ask — so the
 * screen's single fuchsia fill stays on the command bar's `+ Create`. */
import { For } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge,
  Button,
  Card,
  Content,
  Flex,
  Heading,
  HudFrame,
  Image,
  ProgressBar,
  Slider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TerminalLog,
  Text,
  Well,
  typeRoles,
  type TerminalLogLine,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import { CMDS, CWDS, PARAMS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/playground")({
  head: () => exampleSeo("playground"),
  component: PlaygroundScreen,
});

/* ── the open files ────────────────────────────────────────────────────── */

const FILES = ["estimator.glsl", "scene.json", "console"] as const;

/* The strip's flush-right readout is the tab panel: `TabList`'s `trailing` slot
   renders as a sibling of `role="tablist"`, so each tab's `aria-controls`
   resolves to a real region instead of dangling. */
const FILE_READOUTS: Record<string, string> = {
  "estimator.glsl": "156 lines · ● modified",
  "scene.json": "42 keys · saved",
  console: "1 warning · 0 errors",
};

/* ── the parameters ────────────────────────────────────────────────────── */

/* Each parameter's real scale, so the slider reports a value in the unit the
   handoff prints rather than a bare percentage. The starting value is derived
   from the sample data's `fill`, which is what the study draws — 0.6 of 10,000
   samples is the 6,000 on the artboard — so the data stays the single source
   and the two cannot drift apart. Formatting is `Intl.NumberFormat` options
   handed to the slider, so the output is the library's, produced identically on
   the server and the client under the shell's `en-US` provider. */
interface ParamScale {
  readonly minValue: number;
  readonly maxValue: number;
  readonly step: number;
  readonly formatOptions?: Intl.NumberFormatOptions;
}

const SCALES: Record<string, ParamScale> = {
  samples: { minValue: 0, maxValue: 10000, step: 100 },
  bounces: { minValue: 0, maxValue: 20, step: 1 },
  clamp: { minValue: 0, maxValue: 16, step: 1 },
  roughness: { minValue: 0, maxValue: 1, step: 0.01, formatOptions: { minimumFractionDigits: 2 } },
  exposure: {
    minValue: -5,
    maxValue: 5,
    step: 0.1,
    formatOptions: { signDisplay: "always", minimumFractionDigits: 1 },
  },
};

/* ── the log ───────────────────────────────────────────────────────────── */

const LOG: readonly TerminalLogLine[] = [
  {
    spans: [
      { text: "warn", channel: "signal" },
      { text: "  firefly @ px(812,204) — try " },
      { text: "clamp = 8", channel: "prompt" },
    ],
  },
  { channel: "prompt", text: "$" },
];

/* The sampler's state on the frame the study is paused on: 1,204 of 6,000
   samples placed, with the next batch in flight — which is exactly what
   `pendingValue` paints as the dithered lead ahead of the solid bar. */
const CONVERGED = 20;
const IN_FLIGHT = 23;

function PlaygroundScreen() {
  return (
    <AppShell
      cwd={CWDS["playground"]}
      cmd={CMDS["playground"]}
      active="lesson"
      askFilled={true}
      right={
        <>
          <Text styles={typeRoles.terminal}>gpu 4.2 ms · 60 fps</Text>
          <Badge variant="metric" fillStyle="subtle" size="S">
            spp 1,204
          </Badge>
          <Button variant="terminal" size="S">
            [ F5 ] RUN
          </Button>
        </>
      }
    >
      <div class="ex-screen ex-pg ex-stack">
        {/* ── the viewport ─────────────────────────────────────────────── */}
        <Card id="playground-viewport" class="ex-panel" variant="secondary" size="L">
          <Content>
            <div class="ex-pg-left">
              <div class="ex-pg-head">
                <Text styles={typeRoles.micro}>PLAYGROUND · LIVE RENDER</Text>
                <Badge variant="informative" fillStyle="outline" size="S">
                  ● CONVERGING
                </Badge>
              </div>

              <Heading level={1} styles={typeRoles.title}>
                estimator.glsl
              </Heading>

              <div class="ex-pg-viewport">
                <HudFrame brackets="M" channel="info" sweep>
                  <Image src="/examples/thumb-2.png" alt="" isPixelated />
                </HudFrame>

                <div class="ex-pg-readout-top">
                  <Badge variant="informative" fillStyle="bold" size="S">
                    SPP 1,204 / 6,000
                  </Badge>
                  <Badge variant="metric" fillStyle="bold" size="S">
                    VAR 0.0031
                  </Badge>
                  <Badge variant="notice" fillStyle="bold" size="S">
                    FIREFLY @ 812,204
                  </Badge>
                  <Badge variant="metric" fillStyle="bold" size="S">
                    4.2 MS
                  </Badge>
                </div>

                <div class="ex-pg-readout-bottom">
                  <Badge variant="informative" fillStyle="bold" size="S">
                    converging
                  </Badge>
                  <div class="ex-pg-track">
                    <ProgressBar
                      aria-label="Render convergence: 1,204 of 6,000 samples"
                      value={CONVERGED}
                      pendingValue={IN_FLIGHT}
                      size="S"
                    />
                  </div>
                  <Badge variant="metric" fillStyle="bold" size="S">
                    ~18 s
                  </Badge>
                </div>
              </div>

              <Well tone="deep" size="S">
                <Tabs
                  aria-label="Open files"
                  variant="terminal"
                  defaultSelectedKey="estimator.glsl"
                >
                  <TabList
                    trailing={
                      <TabPanels>
                        <For each={FILES}>
                          {(file) => <TabPanel id={file}>{FILE_READOUTS[file]}</TabPanel>}
                        </For>
                      </TabPanels>
                    }
                  >
                    <For each={FILES}>
                      {(file) => (
                        <Tab id={file}>{file === "estimator.glsl" ? `${file} ●` : file}</Tab>
                      )}
                    </For>
                  </TabList>
                </Tabs>
              </Well>
            </div>
          </Content>
        </Card>

        {/* ── the parameters and the log ───────────────────────────────── */}
        <div class="ex-pg-right">
          <Card id="playground-params" class="ex-panel" variant="secondary" size="L">
            <Content>
              <Well tone="deep" size="M">
                <div class="ex-pg-params">
                  <Text styles={typeRoles.micro}>PARAMS</Text>
                  <For each={PARAMS}>
                    {(param) => {
                      const scale = SCALES[param.key];
                      return (
                        <Slider
                          label={param.key}
                          size="S"
                          trackStyle="thick"
                          showOutput
                          minValue={scale.minValue}
                          maxValue={scale.maxValue}
                          step={scale.step}
                          formatOptions={scale.formatOptions}
                          defaultValue={
                            scale.minValue + param.fill * (scale.maxValue - scale.minValue)
                          }
                        />
                      );
                    }}
                  </For>
                  <Flex alignItems="center" gap="8px">
                    <Text styles={typeRoles.terminal}>preset:</Text>
                    <Badge variant="metric" fillStyle="subtle" size="S">
                      lesson-04
                    </Badge>
                    <Button variant="secondary" fillStyle="outline" size="S">
                      reset
                    </Button>
                    <Button variant="secondary" fillStyle="outline" size="S">
                      save as…
                    </Button>
                  </Flex>
                </div>
              </Well>
            </Content>
          </Card>

          <Well tone="deep" size="M">
            <TerminalLog aria-label="Render log" lines={LOG} showCaret />
          </Well>
        </div>
      </div>
    </AppShell>
  );
}
