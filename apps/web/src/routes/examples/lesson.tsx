/* Screen 05 — Lesson: the workbench.
 *
 * Four quadrants under one command strip: the player, the estimator listing,
 * the notes with the checkpoint, and the tutor. The handoff draws it as a fixed
 * canvas with the chrome pinned to its edges, so it keeps the 1180px canvas
 * below the breakpoint (`ex-canvas`) rather than reflowing into a column.
 *
 * Everything paints from @proyecto-viviana/ui; the `ex-lesson-*` classes carry
 * grid placement and the backdrop's stacking context, and nothing else. */
import { createMemo, createSignal, For, Show } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  ActionButton,
  Badge,
  Button,
  Card,
  CardPreview,
  Content,
  Divider,
  Flex,
  Footer,
  Grid,
  Heading,
  HudFrame,
  Image,
  ProgressBar,
  Radio,
  RadioGroup,
  SceneBackdrop,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TerminalLog,
  Text,
  Well,
  PixelClockIcon,
  PixelPlayIcon,
  PixelChevronRightIcon,
  PixelLayoutIcon,
  PixelSparkleIcon,
  typeRoles,
  type TerminalLogLine,
  type TerminalLogSpan,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import {
  ANSWERS,
  CHAPTERS,
  CMDS,
  CODE_HIGHLIGHT,
  CODE_LINES,
  CWDS,
  LESSON_TABS,
  LESSON_TOGGLES,
} from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/lesson")({
  head: () => exampleSeo("lesson"),
  component: LessonScreen,
});

/* ── the tab strip ─────────────────────────────────────────────────────── */

/* A stable key per tab label, so the selection survives a label change and the
   readout can be looked up without matching on display text. */
const TAB_KEYS = ["lesson", "code", "notes", "tutor"] as const;

/* The handoff parks a readout flush right in the strip. It is the tab panel:
   TabList's `trailing` slot renders as a sibling of the `role="tablist"`
   element, so the panels can live there and each tab's `aria-controls` resolves
   to a real region instead of dangling. */
const TAB_READOUTS: Record<string, string> = {
  lesson: "rendering / 04 · 74% · 12-day streak",
  code: "estimator.glsl · ● modified",
  notes: "checkpoint open · +30 XP",
  tutor: "tutor online · 2 replies",
};

/* ── the estimator listing ─────────────────────────────────────────────── */

/* The listing's ink, by token class. The handoff colours three runs per line:
   the types and keywords, the calls, and the literals — with the trailing
   comment recessive. Splitting on a fixed vocabulary keeps the result
   deterministic, which SSR hydration requires. */
const KEYWORDS = new Set(["vec3", "int", "float", "for", "return"]);
const CALLS = new Set(["estimate", "sampleHemisphere", "trace", "rng"]);

function codeSpans(line: string): TerminalLogSpan[] {
  const comment = line.indexOf("//");
  const code = comment === -1 ? line : line.slice(0, comment);
  const spans: TerminalLogSpan[] = [];

  for (const token of code.split(/([A-Za-z_][A-Za-z0-9_]*|[0-9.]+)/)) {
    if (token === "") continue;
    if (KEYWORDS.has(token)) spans.push({ text: token, channel: "info" });
    else if (CALLS.has(token)) spans.push({ text: token, channel: "signal" });
    else if (/^[0-9.]+$/.test(token)) spans.push({ text: token, channel: "metric" });
    else spans.push({ text: token });
  }
  if (comment !== -1) spans.push({ text: line.slice(comment), channel: "muted" });
  return spans;
}

const CODE_LOG: TerminalLogLine[] = CODE_LINES.map((line, index) => ({
  spans: codeSpans(line),
  ...(index === CODE_HIGHLIGHT ? { channel: "prompt" as const } : {}),
}));

/* ── the tutor ─────────────────────────────────────────────────────────── */

const TUTOR_LOG: TerminalLogLine[] = [
  {
    spans: [{ text: "$ ", channel: "prompt" }, { text: 'ask tutor "why does variance drop?"' }],
  },
  {
    spans: [
      { text: "tutor  ", channel: "signal" },
      {
        text:
          "Each sample is an unbiased guess. Averaging N of them shrinks the spread " +
          "by √N — so the noise, not the answer, is what you are buying down.",
      },
    ],
  },
  { text: "reading  variance.md · 2 refs", channel: "muted" },
  { text: "ready", channel: "muted" },
];

/* ── the player ────────────────────────────────────────────────────────── */

/* 04:12 of 12:40, the frame the handoff is paused on. */
const ELAPSED = "04:12";
const RUNTIME = "12:40";
const PLAYHEAD = Math.round(((4 * 60 + 12) / (12 * 60 + 40)) * 100);

/* The transport's chapter cuts: one section per chapter, proportional to its
   length, so the bar reads as the lesson's shape rather than a plain track. */
const CHAPTER_SEGMENTS = CHAPTERS.map((chapter) => chapter.minutes);

function LessonScreen() {
  const [picked, setPicked] = createSignal<string | null>(null);
  const answer = createMemo(() => ANSWERS.find((option) => option.label === picked()));

  return (
    <AppShell cwd={CWDS["lesson"]} cmd={CMDS["lesson"]} active="lesson" askFilled={true}>
      <div class="ex-lesson ex-canvas">
        <SceneBackdrop skyline grid />

        <Grid
          class="ex-lesson-grid"
          rows="auto minmax(0,1fr) minmax(0,1fr)"
          columns="minmax(0,1fr) minmax(0,1fr)"
          gap="12px"
        >
          <div class="ex-lesson-strip">
            <Tabs aria-label="Lesson panes" variant="terminal" defaultSelectedKey="lesson">
              <TabList
                trailing={
                  <TabPanels>
                    <For each={TAB_KEYS}>
                      {(key) => <TabPanel id={key}>{TAB_READOUTS[key]}</TabPanel>}
                    </For>
                  </TabPanels>
                }
              >
                <For each={TAB_KEYS}>
                  {(key, index) => <Tab id={key}>{LESSON_TABS[index()]}</Tab>}
                </For>
              </TabList>
            </Tabs>
          </div>

          {/* ── the player ──────────────────────────────────────────────── */}
          <Card id="lesson-player" class="ex-lesson-pane" variant="secondary" size="L">
            <CardPreview tag="CH 2 · THE ESTIMATOR">
              <HudFrame brackets="M" channel="info" scanlines>
                <Image src="/examples/thumb-3.png" alt="" isPixelated />
              </HudFrame>
            </CardPreview>
            <Content>
              <Flex alignItems="center" gap="8px">
                <Badge variant="informative" fillStyle="subtle" size="S">
                  HD
                </Badge>
                <Text styles={typeRoles.meta}>chapter 2 of 6 · the estimator</Text>
              </Flex>
            </Content>
            <Footer>
              <Flex alignItems="center" gap="8px">
                <ActionButton aria-label="Play" size="S">
                  <PixelPlayIcon />
                </ActionButton>
                <ActionButton aria-label="Next chapter" size="S">
                  <PixelChevronRightIcon />
                </ActionButton>
                <Text styles={typeRoles.terminal}>{ELAPSED}</Text>
                <div class="ex-lesson-track">
                  <ProgressBar
                    aria-label="Chapter progress"
                    value={PLAYHEAD}
                    segments={CHAPTER_SEGMENTS}
                    size="S"
                  />
                </div>
                <Text styles={typeRoles.terminal}>{RUNTIME}</Text>
                <ActionButton aria-label="Captions" size="S">
                  <PixelLayoutIcon />
                </ActionButton>
                <ActionButton aria-label="Playback speed 1.25×" size="S">
                  <PixelClockIcon />
                </ActionButton>
              </Flex>
            </Footer>
          </Card>

          {/* ── the estimator listing ──────────────────────────────────── */}
          <Card id="lesson-code" class="ex-lesson-pane" variant="secondary" size="L">
            <Content>
              <Well tone="deep" size="M" class="ex-lesson-code">
                <TerminalLog aria-label="estimator.glsl" lines={CODE_LOG} />
              </Well>
            </Content>
            <Footer>
              <Flex alignItems="center" gap="8px">
                <Text styles={typeRoles.terminal}>estimator.glsl</Text>
                <Badge variant="notice" fillStyle="subtle" size="S">
                  ● MODIFIED
                </Badge>
                <div class="ex-lesson-spacer" />
                <Button variant="secondary" fillStyle="outline" size="S">
                  reset
                </Button>
                <Button variant="terminal" size="S">
                  [ F5 ] RUN
                </Button>
              </Flex>
            </Footer>
          </Card>

          {/* ── the notes and the checkpoint ───────────────────────────── */}
          <Card id="lesson-notes" class="ex-lesson-pane" variant="secondary" size="L">
            <Content>
              <Heading level={1}>Why random rays?</Heading>
              <Text styles={typeRoles.meta}>lesson 04 · 12 min · rendering</Text>
              <Text styles={typeRoles.body}>
                The rendering equation is an integral nobody can solve in closed form, so the
                estimator guesses: fire a ray in a random direction, weight what comes back, and
                average. Every guess is wrong; the average is not. What you buy with more samples is
                not a better answer but a quieter one.
              </Text>
              <Divider size="S" />
              <Grid class="ex-lesson-checkpoint" columns="minmax(0,1.4fr) minmax(0,1fr)" gap="16px">
                <RadioGroup
                  label="CHECKPOINT · +30 XP"
                  size="S"
                  value={picked() ?? ""}
                  onChange={setPicked}
                  isInvalid={answer() !== undefined && !answer()!.isCorrect}
                  description={
                    answer()?.isCorrect === true ? "correct ✓ +30 XP" : "Halving the noise costs…"
                  }
                  errorMessage="not quite — noise falls as 1/√N, so half the noise costs 4×"
                >
                  <For each={ANSWERS}>
                    {(option) => <Radio value={option.label}>{option.label}</Radio>}
                  </For>
                </RadioGroup>

                <Flex direction="column" gap="8px">
                  <Text styles={typeRoles.micro}>SETTINGS</Text>
                  <For each={LESSON_TOGGLES}>
                    {(name, index) => (
                      <Switch size="S" defaultSelected={index() < 2}>
                        {name}
                      </Switch>
                    )}
                  </For>
                </Flex>
              </Grid>
            </Content>
          </Card>

          {/* ── the tutor ──────────────────────────────────────────────── */}
          <Card id="lesson-tutor" class="ex-lesson-pane" variant="secondary" size="L">
            <Content>
              <Well tone="deep" size="M" class="ex-lesson-tutor">
                <TerminalLog aria-label="Tutor transcript" lines={TUTOR_LOG} bootIn showCaret />
              </Well>
            </Content>
            <Footer>
              <Flex alignItems="center" gap="8px">
                <PixelSparkleIcon />
                <Text styles={typeRoles.meta}>tutor reads the chapter you are on</Text>
                <div class="ex-lesson-spacer" />
                <Show when={answer()?.isCorrect === true}>
                  <Badge variant="positive" fillStyle="subtle" size="S">
                    +30 XP
                  </Badge>
                </Show>
              </Flex>
            </Footer>
          </Card>
        </Grid>
      </div>
    </AppShell>
  );
}
