/* /examples/landing — the front door.
 *
 * The one screen with no app chrome: no command bar, no icon rail. It renders
 * straight inside `ExamplesShell`, so the whole plane is the scene — a
 * pixelated still under the register's veil and scan sweep, framed by `HudFrame`
 * brackets, with the nav, the hero and the journeys riding on top.
 *
 * The hero's `+ Start free` is this screen's single filled fuchsia ask (the
 * registry names it, and the e2e spec asserts there is exactly one): everything
 * else that invites a click — the nav, the second CTA, the sign-up's return
 * key, the journey cards — is a link, an outline, or the terminal variant. */
import { For } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge,
  Button,
  Card,
  CardPreview,
  Content,
  Flex,
  Grid,
  Heading,
  HudFrame,
  Image,
  Link,
  SceneBackdrop,
  TerminalLog,
  Text,
  TextField,
  Well,
  typeRoles,
  type TerminalLogLine,
} from "@proyecto-viviana/ui";
import { LAND_CARDS, LAND_LOG } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/landing")({
  head: () => exampleSeo("landing"),
  component: LandingScreen,
});

/* ── the nav ───────────────────────────────────────────────────────────── */

const NAV = [
  { label: "journeys", href: "/examples/explore" },
  { label: "live", href: "/examples/live" },
  { label: "playground", href: "/examples/playground" },
] as const;

/* ── the live log ──────────────────────────────────────────────────────── */

/* The shape the handoff prints: a timestamp, then who did what. The last line
   is the visitor's own prompt, so it reports in the shell's channel and the
   caret sits after it. `bootIn` types the six in one after another, which is
   the component's own stepped motion — not an app keyframe. */
const NOW_LOG: readonly TerminalLogLine[] = LAND_LOG.map((line, index) => ({
  time: line.at,
  text: line.message,
  channel: index === LAND_LOG.length - 1 ? ("prompt" as const) : ("muted" as const),
}));

function LandingScreen() {
  return (
    <div class="ex-page ex-land">
      <SceneBackdrop src="/examples/thumb-2.png" sweep />

      <div class="ex-land-frame">
        <HudFrame brackets="L" channel="info" scanlines>
          <div class="ex-land-inner">
            {/* ── the nav ──────────────────────────────────────────────── */}
            <Flex alignItems="center" gap="16px" wrap>
              <Text styles={typeRoles.title}>akade</Text>
              <Text styles={typeRoles.micro}>by viviana education</Text>
              <div class="ex-land-spacer" />
              <For each={NAV}>
                {(item) => (
                  <Link href={item.href} variant="secondary" isStandalone isQuiet>
                    {item.label}
                  </Link>
                )}
              </For>
              <Button variant="secondary" fillStyle="outline" size="S">
                log in
              </Button>
            </Flex>

            {/* ── the hero and the live log ───────────────────────────── */}
            <div class="ex-land-hero">
              <div class="ex-land-pitch">
                <Text styles={typeRoles.micro}>COMPUTER GRAPHICS · LEARN BY RENDERING</Text>

                <Heading level={1} styles={typeRoles["display-xl"]}>
                  Learn graphics by rendering it.
                </Heading>

                <Text styles={typeRoles.body}>
                  Every lesson ends in a frame you rendered yourself. Read the estimator, move a
                  parameter, watch the noise fall — the maths is the picture, not a slide about the
                  picture.
                </Text>

                <Flex alignItems="center" gap="12px" wrap>
                  <Button variant="create" size="XL">
                    + Start free
                  </Button>
                  <Button variant="secondary" fillStyle="outline" size="L">
                    ▶ watch a lesson · 2:10
                  </Button>
                </Flex>

                <Well tone="deep" size="S">
                  <Flex alignItems="end" gap="8px" wrap>
                    <Text styles={typeRoles.terminal}>$ akade init --email</Text>
                    <div class="ex-land-field">
                      <TextField
                        aria-label="Email address"
                        type="email"
                        size="S"
                        placeholder="you@school.edu"
                      />
                    </div>
                    <Button variant="terminal" size="S">
                      ↵
                    </Button>
                  </Flex>
                </Well>
              </div>

              <Card id="landing-now" class="ex-panel" variant="secondary" size="L">
                <Content>
                  <Flex alignItems="center" gap="8px">
                    <Text styles={typeRoles.micro}>NOW RENDERING</Text>
                    <div class="ex-land-spacer" />
                    <Badge variant="live" fillStyle="subtle" size="S">
                      ● 1,204 LEARNERS
                    </Badge>
                  </Flex>
                  <Well tone="deep" size="M">
                    <TerminalLog aria-label="Live activity" lines={NOW_LOG} bootIn showCaret />
                  </Well>
                </Content>
              </Card>
            </div>

            {/* ── the journeys ───────────────────────────────────────── */}
            <Grid class="ex-land-journeys" columns="repeat(3, minmax(0, 1fr))" gap="12px">
              <For each={LAND_CARDS}>
                {(card) => (
                  <Card
                    id={`landing-${card.slug}`}
                    class="ex-panel"
                    href={`/examples/${card.slug}`}
                    variant="secondary"
                    size="M"
                  >
                    <CardPreview tag={card.tag}>
                      <Image src={card.thumb} alt="" isPixelated />
                    </CardPreview>
                    <Content>
                      <Heading level={2} styles={typeRoles.title}>
                        {card.title}
                      </Heading>
                      <Text styles={typeRoles.meta}>{card.meta}</Text>
                    </Content>
                  </Card>
                )}
              </For>
            </Grid>
          </div>
        </HudFrame>
      </div>
    </div>
  );
}
