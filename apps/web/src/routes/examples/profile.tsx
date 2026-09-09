/* Screen 08 — Profile: a person read as a terminal.
 *
 * The city sits behind the whole screen (`SceneBackdrop`, veil on), and three
 * columns sit on top of it: who this is, what they have done, and what they are
 * carrying. The portrait's LVL chip stays blue — it is a readout, not an ask —
 * so the screen's one fuchsia fill is the command bar's `+ Create`.
 *
 * Every region paints from @proyecto-viviana/ui: the activity map is
 * `PixelMeter shape="grid"`, each journey's readout is `ProgressBar
 * trackStyle="bracket"`, the badge tiles are `Well`s, the streak card is
 * `Card mesh="signal"`, and the NOW column is a `TerminalLog`. The `ex-*`
 * classes carry box metrics only. */
import { For } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge,
  Card,
  Heading,
  Image,
  LinkButton,
  PixelMeter,
  ProgressBar,
  SceneBackdrop,
  TerminalLog,
  Text,
  Well,
  typeRoles,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import { BADGES, CMDS, CWDS, HEAT, JOURNEYS, PROFILE_STATS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/profile")({
  head: () => exampleSeo("profile"),
  component: ProfileScreen,
});

/* The map is 26 weeks × 7 days — exactly `PixelMeter`'s grid — and the meter
   reads one value across those 182 cells, so the value is the number of days
   with any activity at all. The per-day depth in `HEAT` is the handoff's
   four-level shading; the meter shades by depth into the fill instead. */
const HEAT_CELLS = HEAT.length;
const HEAT_ACTIVE = HEAT.filter((level) => level > 0).length;

function ProfileScreen() {
  return (
    <AppShell cwd={CWDS["profile"]} cmd={CMDS["profile"]} active="profile" askFilled={true}>
      <div class="ex-screen ex-profile">
        <SceneBackdrop src="/examples/bg-city.png" />

        <div class="ex-profile-grid ex-stack">
          {/* ── who this is ─────────────────────────────────────────────── */}
          <div class="ex-profile-who">
            <div class="ex-profile-portrait">
              <Image src="/examples/avatar-nova.png" alt="" isPixelated />
            </div>
            <Badge variant="informative" size="S">
              LVL 12
            </Badge>
            <Heading level={1} styles={typeRoles["display-md"]}>
              Nova
            </Heading>
            <Text styles={typeRoles.terminal}>@nova · shader school</Text>
            <Text styles={typeRoles.terminal}>joined 2024 · 214 following</Text>
            <div class="ex-profile-actions">
              <LinkButton href="/examples/settings" variant="primary">
                Edit profile
              </LinkButton>
              <LinkButton href="/examples/explore" variant="secondary" fillStyle="outline">
                Share
              </LinkButton>
            </div>
          </div>

          {/* ── what they have done ─────────────────────────────────────── */}
          <div class="ex-profile-work">
            <div class="ex-profile-stats">
              <For each={PROFILE_STATS}>
                {(stat) => (
                  <div class="ex-profile-stat">
                    <Text styles={typeRoles.display}>{stat.value}</Text>
                    <Text styles={typeRoles.micro}>{stat.label}</Text>
                  </div>
                )}
              </For>
            </div>

            <Card id="profile-activity" class="ex-profile-card" variant="secondary" size="S">
              <div class="ex-profile-body">
                <div class="ex-profile-row">
                  <Text styles={typeRoles.micro}>ACTIVITY · 26 WEEKS</Text>
                  <Badge variant="metric" fillStyle="subtle" size="S">
                    1,204 SAMPLES
                  </Badge>
                </div>
                <PixelMeter
                  shape="grid"
                  levels={4}
                  value={HEAT_ACTIVE}
                  maxValue={HEAT_CELLS}
                  aria-label={`Activity: ${HEAT_ACTIVE} active days of the last ${HEAT_CELLS}`}
                />
                <div class="ex-profile-months">
                  <Text styles={typeRoles.micro}>mar</Text>
                  <Text styles={typeRoles.micro}>may</Text>
                  <Text styles={typeRoles.micro}>jul</Text>
                  <Text styles={typeRoles.micro}>sep</Text>
                </div>
              </div>
            </Card>

            <Card id="profile-journeys" class="ex-profile-card" variant="secondary" size="S">
              <div class="ex-profile-body">
                <Text styles={typeRoles.micro}>JOURNEYS</Text>
                <For each={JOURNEYS}>
                  {(journey) => (
                    <div class="ex-profile-journey">
                      <div class="ex-profile-thumb">
                        <Image src={journey.thumb} alt="" isPixelated />
                      </div>
                      <div class="ex-profile-journey-body">
                        <Text styles={typeRoles.headline}>{journey.title}</Text>
                        <Text styles={typeRoles.meta}>{journey.meta}</Text>
                      </div>
                      <div class="ex-profile-journey-bar">
                        <ProgressBar
                          aria-label={`${journey.title} progress`}
                          trackStyle="bracket"
                          value={Number.parseInt(journey.percent, 10)}
                          valueLabel={journey.percent}
                        />
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Card>
          </div>

          {/* ── what they are carrying ──────────────────────────────────── */}
          <div class="ex-profile-carry">
            <Card id="profile-badges" class="ex-profile-card" variant="secondary" size="S">
              <div class="ex-profile-body">
                <Text styles={typeRoles.micro}>BADGES · 6 / 8</Text>
                <div class="ex-profile-badges">
                  <For each={BADGES}>
                    {(badge) => (
                      <Well tone={badge.isLocked ? "well" : "deep"} size="S">
                        <div class="ex-profile-badge">
                          <Text styles={typeRoles.title}>{badge.glyph}</Text>
                          <Text styles={typeRoles.micro}>{badge.name}</Text>
                        </div>
                      </Well>
                    )}
                  </For>
                </div>
              </div>
            </Card>

            <Card
              id="profile-streak"
              class="ex-profile-card"
              variant="secondary"
              size="S"
              mesh="signal"
            >
              <div class="ex-profile-body">
                <div class="ex-profile-row">
                  <div class="ex-profile-flame">
                    <Image src="/examples/streak-flame.gif" alt="" isPixelated />
                  </div>
                  <div class="ex-profile-journey-body">
                    <Text styles={typeRoles.micro}>STREAK</Text>
                    <Text styles={typeRoles.title}>12 days</Text>
                  </div>
                </div>
                <Text styles={typeRoles.terminal}>best 31 · holds until 23:59</Text>
              </div>
            </Card>

            <Card id="profile-now" class="ex-profile-card" variant="secondary" size="S">
              <div class="ex-profile-body">
                <Text styles={typeRoles.micro}>NOW</Text>
                <Well tone="deep" size="S">
                  <TerminalLog
                    aria-label="What nova is doing now"
                    showCaret
                    lines={[
                      {
                        spans: [{ text: "> ", channel: "prompt" }, { text: "rendering 04/09" }],
                      },
                      {
                        spans: [{ text: "● ", channel: "signal" }, { text: "in SDF Live · 214" }],
                      },
                      { text: "# shaders · pathtracing", channel: "muted" },
                    ]}
                  />
                </Well>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
