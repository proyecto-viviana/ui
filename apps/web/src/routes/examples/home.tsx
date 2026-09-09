/* /examples/home — the daily surface.
 *
 * Three tiles across the top (focus, streak, level), the lesson to continue and
 * the spaced-review queue below them, and a right column of what is live plus
 * the tutor. Every region is a shipped @proyecto-viviana/ui component: the
 * handoff's pixel focus ring is `PixelMeter shape="ring"`, its streak blocks are
 * `PixelMeter shape="row"`, its dithered progress lead is `ProgressBar`'s
 * `pendingValue`, its HUD brackets are `HudFrame`, its yellow-weave review card
 * is `Card mesh="signal"`, its terminal rows are a `ListView` in a `Well`, and
 * its tutor well is `TerminalLog`. The `ex-*` classes carry box metrics only.
 *
 * The screen's one filled fuchsia ask is the review CTA (DECISIONS C-1), so the
 * command bar's `+ Create` runs outlined. */
import { For } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge,
  Card,
  Heading,
  HudFrame,
  Image,
  LinkButton,
  ListView,
  ListViewItem,
  PixelMeter,
  ProgressBar,
  TerminalLog,
  Text,
  Well,
  typeRoles,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import { CMDS, CWDS, DUE, LIVE_ROWS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/home")({
  head: () => exampleSeo("home"),
  component: HomeScreen,
});

/* The level tile's 84% earned + 6% in flight — the handoff draws the lead as a
   dither, which is exactly what ProgressBar's `pendingValue` paints. */
const LEVEL_VALUE = 84;
const LEVEL_PENDING = 90;

/* ListView's `items` takes a mutable iterable; the shared data is frozen at the
   module boundary, so copy it once here rather than per render. */
const LIVE = [...LIVE_ROWS];

function HomeScreen() {
  return (
    <AppShell cwd={CWDS["home"]} cmd={CMDS["home"]} active="home" askFilled={false}>
      <div class="ex-screen">
        <div class="ex-home ex-stack">
          <div class="ex-home-left ex-stack">
            <Card id="home-focus" class="ex-home-card" variant="secondary" size="S">
              <div class="ex-home-tile">
                <PixelMeter shape="ring" value={3} maxValue={5} label="3/5" />
                <div class="ex-home-tile-body">
                  <Text styles={typeRoles.micro}>FOCUS</Text>
                  <Text styles={typeRoles.title}>2 blocks left</Text>
                  <Text styles={typeRoles.terminal}>25 min each · next 19:00</Text>
                </div>
              </div>
            </Card>

            <Card id="home-streak" class="ex-home-card" variant="secondary" size="S">
              <div class="ex-home-tile">
                <div class="ex-home-flame">
                  <Image src="/examples/streak-flame.gif" alt="" isPixelated />
                </div>
                <div class="ex-home-tile-body">
                  <Text styles={typeRoles.micro}>STREAK</Text>
                  <Text styles={typeRoles.title}>12 days</Text>
                  <PixelMeter
                    shape="row"
                    value={12}
                    maxValue={14}
                    channel="signal"
                    aria-label="Streak: 12 of the last 14 days"
                  />
                </div>
              </div>
            </Card>

            <Card id="home-level" class="ex-home-card" variant="secondary" size="S">
              <div class="ex-home-tile-body">
                <div class="ex-home-row">
                  <Text styles={typeRoles.micro}>LEVEL 12</Text>
                  <Badge variant="metric" fillStyle="subtle" size="S">
                    2,840 / 3,200
                  </Badge>
                </div>
                <Text styles={typeRoles.title}>360 XP to 13</Text>
                <ProgressBar
                  aria-label="Level 12 progress: 2,840 of 3,200 XP"
                  value={LEVEL_VALUE}
                  pendingValue={LEVEL_PENDING}
                />
              </div>
            </Card>

            <Card
              id="home-continue"
              class="ex-home-card ex-home-continue"
              variant="secondary"
              size="S"
            >
              <div class="ex-home-continue-body ex-stack">
                <div class="ex-home-media">
                  <HudFrame brackets="M" channel="info">
                    <Image src="/examples/thumb-1.png" alt="" isPixelated />
                  </HudFrame>
                  <div class="ex-home-media-readout">
                    <Badge variant="informative" fillStyle="subtle" size="S">
                      RESUME · 04:12 / 12:40
                    </Badge>
                  </div>
                  <div class="ex-home-media-bar">
                    <ProgressBar size="S" value={33} aria-label="Lesson progress: 33 percent" />
                  </div>
                </div>
                <div class="ex-home-tile-body">
                  <Text styles={typeRoles.micro}>CONTINUE · RENDERING 04/09</Text>
                  <Heading level={1} styles={typeRoles.title}>
                    Why Random Rays Make Real Pictures
                  </Heading>
                  <Text styles={typeRoles.body}>
                    You stopped at the estimator. 8 min left, checkpoint pending.
                  </Text>
                  <div class="ex-home-actions">
                    <LinkButton href="/examples/lesson" variant="primary">
                      Resume
                    </LinkButton>
                    <LinkButton href="/examples/explore" variant="secondary" fillStyle="outline">
                      Outline
                    </LinkButton>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              id="home-review"
              class="ex-home-card ex-home-review"
              variant="secondary"
              size="S"
              mesh="signal"
            >
              <div class="ex-home-tile-body">
                <div class="ex-home-row">
                  <Text styles={typeRoles.micro}>~/review/queue</Text>
                  <Badge variant="notice" fillStyle="outline" size="S">
                    DUE
                  </Badge>
                </div>
                <Heading level={2} styles={typeRoles.title}>
                  Spaced review
                </Heading>
                <div class="ex-home-due">
                  <For each={DUE}>
                    {(card) => (
                      <div class="ex-home-due-row">
                        <Text styles={typeRoles.terminal}>░ {card.title}</Text>
                        <Text styles={typeRoles.terminal}>{card.age}</Text>
                      </div>
                    )}
                  </For>
                </div>
                <div class="ex-home-actions">
                  <LinkButton href="/examples/lesson" variant="create">
                    Review 4 · ~6 min
                  </LinkButton>
                </div>
              </div>
            </Card>
          </div>

          <div class="ex-home-right">
            <Card id="home-live" class="ex-home-card" variant="secondary" size="S">
              <div class="ex-home-tile-body">
                <div class="ex-home-row">
                  <Text styles={typeRoles.micro}>LIVE // today</Text>
                  <Badge variant="live" fillStyle="subtle" size="S">
                    ● ON AIR
                  </Badge>
                </div>
                <Well tone="deep" size="S">
                  <ListView aria-label="Live and upcoming sessions" items={LIVE} isQuiet>
                    {(row) => (
                      <ListViewItem
                        id={row.title}
                        textValue={row.title}
                        description={
                          row.tag
                            ? `${row.when} · ${row.host} · ${row.tag}`
                            : `${row.when} · ${row.host}`
                        }
                      >
                        <Text slot="label">{row.title}</Text>
                      </ListViewItem>
                    )}
                  </ListView>
                </Well>
              </div>
            </Card>

            <Card id="home-tutor" class="ex-home-card" variant="secondary" size="S">
              <div class="ex-home-tile-body">
                <Text styles={typeRoles.micro}>TUTOR</Text>
                <TerminalLog
                  aria-label="Tutor"
                  showCaret
                  lines={[
                    {
                      spans: [
                        { text: "tutor", channel: "metric" },
                        { text: "  you left mid-derivation." },
                      ],
                    },
                    { text: "  pick up at the 1/√N step?", channel: "muted" },
                  ]}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
