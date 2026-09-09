/* /examples/theater — the lesson with the room lights off.
 *
 * One frame fills the canvas and everything else floats over it: the exit and
 * the title along the top, the render readouts down the left, the caption at
 * the foot of the picture, the transcript drawer on the right, and the player
 * chrome across the bottom. The handoff's CRT grille, its scan sweep and its
 * corner brackets are all one shipped component — `HudFrame` with `scanlines`
 * and `sweep` — so the screen needs no overlay of its own.
 *
 * The screen's fuchsia is spent on the `● 214 WATCHING` badge (DECISIONS C-1),
 * so the command bar's `+ Create` runs outlined. */
import { createSignal, For } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  ActionButton,
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  HudFrame,
  Image,
  LinkButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuTrigger,
  ProgressBar,
  SearchField,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  TerminalLog,
  Text,
  Well,
  PixelChevronRightIcon,
  PixelLayoutIcon,
  PixelPlayIcon,
  PixelSparkleIcon,
  typeRoles,
  type TerminalLogLine,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import {
  BEATS,
  CHAPTERS,
  CMDS,
  CWDS,
  SPEEDS,
  TRANSCRIPT,
  TRANSCRIPT_CURRENT,
} from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/theater")({
  head: () => exampleSeo("theater"),
  component: TheaterScreen,
});

/* ── the drawer ────────────────────────────────────────────────────────── */

/* The transcript, as the log it already is: the timecode goes in the line's
   `time` slot, and the line being spoken takes the shell's prompt ink. */
const TRANSCRIPT_LOG: TerminalLogLine[] = TRANSCRIPT.map((line, index) => ({
  time: line.at,
  text: line.text,
  ...(index === TRANSCRIPT_CURRENT ? { channel: "prompt" as const } : {}),
}));

const OUTLINE_LOG: TerminalLogLine[] = BEATS.map((beat) => ({
  spans: [
    { text: `${beat.num}  `, channel: "metric" as const },
    { text: beat.title },
    ...(beat.state === "now" ? [{ text: "  ← here", channel: "signal" as const }] : []),
  ],
  ...(beat.state === "done" ? { channel: "muted" as const } : {}),
}));

const NOTES_LOG: TerminalLogLine[] = [
  { time: "03:58", text: "unbiased ≠ correct per frame — correct in expectation", channel: "info" },
  { time: "04:12", text: "noise ∝ 1/√N · halve it → 4× the samples" },
  { time: "04:31", text: "clamp fireflies before the average, not after", channel: "signal" },
];

const TUTOR_LOG: TerminalLogLine[] = [
  { spans: [{ text: "$ ", channel: "prompt" }, { text: "ask about this moment" }] },
  {
    spans: [
      { text: "tutor  ", channel: "signal" },
      { text: "The estimator is unbiased: each frame is wrong, the average is not." },
    ],
  },
  { text: "reading  transcript 04:12 · 1 ref", channel: "muted" },
];

const DRAWER_TABS = [
  { id: "transcript", label: "transcript" },
  { id: "outline", label: "outline" },
  { id: "notes", label: "notes" },
  { id: "tutor", label: "tutor" },
] as const;

/* ── the chrome ────────────────────────────────────────────────────────── */

const ELAPSED = "04:12";
const RUNTIME = "12:40";
const PLAYHEAD = Math.round(((4 * 60 + 12) / (12 * 60 + 40)) * 100);
const CHAPTER_SEGMENTS = CHAPTERS.map((chapter) => chapter.minutes);

function TheaterScreen() {
  const [speed, setSpeed] = createSignal(SPEEDS[2]!);

  return (
    <AppShell cwd={CWDS["theater"]} cmd={CMDS["theater"]} active="lesson" askFilled={false}>
      <div class="ex-theater ex-canvas">
        {/* The picture, and the register's CRT treatment of it. */}
        <div class="ex-theater-stage">
          <HudFrame UNSAFE_className="ex-theater-frame" brackets="M" channel="info" scanlines sweep>
            <Image
              UNSAFE_className="ex-theater-image"
              src="/examples/thumb-1.png"
              alt=""
              isPixelated
            />
          </HudFrame>
        </div>

        <div class="ex-theater-plane">
          <div class="ex-theater-topbar">
            <Flex alignItems="center" gap="12px">
              <LinkButton href="/examples/lesson" variant="secondary" fillStyle="outline" size="S">
                ‹ exit theater
              </LinkButton>
              <Text styles={typeRoles.terminal}>~/rendering / 04</Text>
              <div class="ex-theater-spacer" />
              <Heading level={1}>Why Random Rays Make Real Pictures</Heading>
              <div class="ex-theater-spacer" />
              <Badge variant="positive" fillStyle="subtle" size="S">
                +30 XP
              </Badge>
              <Badge variant="live" size="S">
                ● 214 WATCHING
              </Badge>
            </Flex>
          </div>

          <div class="ex-theater-readout">
            <Well tone="deep" size="S">
              <Flex direction="column" gap="6px">
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>SPP</Text>
                  <Badge variant="metric" fillStyle="subtle" size="S">
                    1,204 / 6,000
                  </Badge>
                </Flex>
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>VAR</Text>
                  <Badge variant="informative" fillStyle="subtle" size="S">
                    0.0031
                  </Badge>
                </Flex>
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>FIREFLY</Text>
                  <Badge variant="notice" fillStyle="subtle" size="S">
                    @ 812,204
                  </Badge>
                </Flex>
              </Flex>
            </Well>
          </div>

          <div class="ex-theater-caption">
            <Well tone="deep" size="S">
              <Text styles={typeRoles.terminal}>
                so the estimator is unbiased — wrong on every frame, right on average.
              </Text>
            </Well>
          </div>

          {/* ── the drawer ─────────────────────────────────────────────── */}
          <Card id="theater-drawer" class="ex-theater-drawer" variant="tertiary" size="L">
            <div class="ex-theater-drawer-body">
              <Tabs aria-label="Theater drawer" variant="terminal" defaultSelectedKey="transcript">
                <TabList>
                  <For each={DRAWER_TABS}>{(tab) => <Tab id={tab.id}>{tab.label}</Tab>}</For>
                </TabList>
                <TabPanels UNSAFE_className="ex-theater-panels">
                  <TabPanel id="transcript">
                    <TerminalLog aria-label="Transcript" lines={TRANSCRIPT_LOG} />
                  </TabPanel>
                  <TabPanel id="outline">
                    <TerminalLog aria-label="Chapter outline" lines={OUTLINE_LOG} />
                  </TabPanel>
                  <TabPanel id="notes">
                    <TerminalLog aria-label="Your notes" lines={NOTES_LOG} />
                  </TabPanel>
                  <TabPanel id="tutor">
                    <TerminalLog aria-label="Tutor" lines={TUTOR_LOG} bootIn showCaret />
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Flex alignItems="end" gap="8px">
                <div class="ex-theater-ask">
                  <SearchField
                    aria-label="Ask about this moment"
                    placeholder="ask about this moment…"
                    prefix="$"
                    shortcut="↵"
                    size="S"
                  />
                </div>
                <Button variant="terminal" size="S">
                  ↵
                </Button>
              </Flex>
            </div>
          </Card>

          {/* ── the chrome ─────────────────────────────────────────────── */}
          <div class="ex-theater-chrome">
            <Well tone="deep" size="S">
              <Flex alignItems="center" gap="8px">
                <ActionButton aria-label="Pause" size="S">
                  <PixelPlayIcon />
                </ActionButton>
                <ActionButton aria-label="Previous chapter" size="S">
                  <PixelSparkleIcon />
                </ActionButton>
                <ActionButton aria-label="Next chapter" size="S">
                  <PixelChevronRightIcon />
                </ActionButton>
                <Text styles={typeRoles.terminal}>{ELAPSED}</Text>
                <div class="ex-theater-track">
                  <ProgressBar
                    aria-label="Chapter progress"
                    value={PLAYHEAD}
                    segments={CHAPTER_SEGMENTS}
                    size="S"
                  />
                </div>
                <Text styles={typeRoles.terminal}>{RUNTIME}</Text>
                <Text styles={typeRoles.micro}>ch 2 · the estimator</Text>
                <div class="ex-theater-spacer" />
                <ActionButton aria-label="Captions" size="S">
                  <PixelLayoutIcon />
                </ActionButton>
                <MenuTrigger>
                  <MenuButton variant="quiet">{speed()} ▴</MenuButton>
                  <Menu
                    aria-label="Playback speed"
                    selectionMode="single"
                    disallowEmptySelection
                    selectedKeys={[speed()]}
                    onSelectionChange={(keys) => {
                      if (keys === "all") return;
                      for (const key of keys) setSpeed(String(key));
                    }}
                  >
                    <For each={SPEEDS}>
                      {(rate) => (
                        <MenuItem id={rate} textValue={rate}>
                          {rate}
                        </MenuItem>
                      )}
                    </For>
                  </Menu>
                </MenuTrigger>
                <Text styles={typeRoles.terminal}>♪ ▮▮▮▯</Text>
                <ActionButton aria-label="Full screen" size="S">
                  <PixelLayoutIcon />
                </ActionButton>
              </Flex>
            </Well>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
