/* /examples/live — the room while it is happening.
 *
 * The same theater frame, reporting on the `live` channel, with the two things
 * a live room adds floating over it: the poll on the left and the chat on the
 * right. The chrome's progress is the session's four segments, not a scrub bar
 * — a live stream has nowhere to seek to — and raising your hand is one piece
 * of state the room shares, so the chat's ✋ and the chrome's ✋ are the same
 * `ToggleButton` value.
 *
 * The screen's fuchsia is spent on the `● LIVE · 214` badge (DECISIONS C-1),
 * so the command bar's `+ Create` runs outlined. */
import { createMemo, createSignal, For, Show } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  ActionButton,
  Avatar,
  Badge,
  Card,
  Divider,
  Flex,
  Heading,
  HudFrame,
  Image,
  Meter,
  ProgressBar,
  Radio,
  RadioGroup,
  SearchField,
  TerminalLog,
  Text,
  ToggleButton,
  Well,
  PixelLayoutIcon,
  PixelPlayIcon,
  typeRoles,
  type TerminalLogLine,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import { CHAT, CMDS, CWDS, POLL } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/live")({
  head: () => exampleSeo("live"),
  component: LiveScreen,
});

/* ── the chat ──────────────────────────────────────────────────────────── */

/* The room's backlog types itself in on mount (`bootIn`), the way the handoff
   staggers it. `sys` lines are the room talking about itself, so they take the
   well's recessive ink rather than a name colour. */
const CHAT_LOG: TerminalLogLine[] = CHAT.map((line) =>
  line.who === "sys"
    ? { text: `· ${line.text}`, channel: "muted" as const }
    : {
        spans: [
          { text: `${line.who}  `, channel: line.who === "mira" ? "signal" : "info" },
          { text: line.text },
        ],
      },
);

/* ── the session ───────────────────────────────────────────────────────── */

/* Four segments, weighted the way the handoff draws them, with the room part
   way through the second — the bar reports where the session is, and there is
   nothing to seek to, so it is a ProgressBar and not a slider. */
const SEGMENTS = [2, 2.4, 1.8, 1];
const SESSION_VALUE = 42;

function LiveScreen() {
  const [vote, setVote] = createSignal<string | null>(null);
  const [hand, setHand] = createSignal(false);

  /* Your vote lands in the tally as it would in the room: one more count on the
     option you picked, and every bar re-reads against the new total. */
  const tally = createMemo(() =>
    POLL.map((option) => ({
      label: option.label,
      votes: option.votes + (vote() === option.label ? 1 : 0),
    })),
  );
  const total = createMemo(() => tally().reduce((sum, option) => sum + option.votes, 0));

  return (
    <AppShell cwd={CWDS["live"]} cmd={CMDS["live"]} active="live" askFilled={false}>
      <div class="ex-live ex-canvas">
        <div class="ex-live-stage">
          <HudFrame UNSAFE_className="ex-live-frame" brackets="M" channel="live" scanlines sweep>
            <Image
              UNSAFE_className="ex-live-image"
              src="/examples/thumb-4.png"
              alt=""
              isPixelated
            />
          </HudFrame>
        </div>

        <div class="ex-live-plane">
          <div class="ex-live-topbar">
            <Flex alignItems="center" gap="12px">
              <Text styles={typeRoles.terminal}>~/live / sdf-raymarching</Text>
              <Heading level={1}>SDF Raymarching — Live w/ Shader School</Heading>
              <Avatar src="/examples/avatar-2.png" alt="" size={24} />
              <Text styles={typeRoles.micro}>host · mira</Text>
              <div class="ex-live-spacer" />
              <Badge variant="live" size="S">
                ● LIVE · 214
              </Badge>
            </Flex>
          </div>

          <div class="ex-live-readout">
            <Well tone="deep" size="S">
              <Flex direction="column" gap="6px">
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>SEGMENT</Text>
                  <Badge variant="metric" fillStyle="subtle" size="S">
                    2/4 · sphere tracing
                  </Badge>
                </Flex>
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>LATENCY</Text>
                  <Badge variant="informative" fillStyle="subtle" size="S">
                    1.2s
                  </Badge>
                </Flex>
                <Flex alignItems="center" gap="8px">
                  <Text styles={typeRoles.micro}>Q&amp;A OPENS IN</Text>
                  <Badge variant="notice" fillStyle="subtle" size="S">
                    04:00
                  </Badge>
                </Flex>
              </Flex>
            </Well>
          </div>

          {/* ── the poll ───────────────────────────────────────────────── */}
          <Card id="live-poll" class="ex-live-poll" variant="tertiary" size="M">
            <div class="ex-live-poll-body">
              <Flex alignItems="center" gap="8px">
                <Text styles={typeRoles.micro}>POLL · 00:42</Text>
                <div class="ex-live-spacer" />
                <Text styles={typeRoles.micro}>{total()} votes</Text>
              </Flex>

              <RadioGroup
                label="which converges faster near thin features?"
                size="S"
                value={vote() ?? ""}
                onChange={setVote}
                description={vote() === null ? "vote to see the room" : "counted ✓"}
              >
                <For each={POLL}>
                  {(option) => <Radio value={option.label}>{option.label}</Radio>}
                </For>
              </RadioGroup>

              <Divider size="S" />

              <Flex direction="column" gap="6px">
                <For each={tally()}>
                  {(option) => (
                    <Meter
                      UNSAFE_className="ex-live-meter"
                      label={option.label}
                      labelPosition="side"
                      variant="metric"
                      value={Math.round((option.votes / total()) * 100)}
                      size="S"
                    />
                  )}
                </For>
              </Flex>
            </div>
          </Card>

          {/* ── the chat ───────────────────────────────────────────────── */}
          <Card id="live-chat" class="ex-live-chat" variant="tertiary" size="L">
            <div class="ex-live-chat-body">
              <Flex alignItems="center" gap="8px">
                <Text styles={typeRoles.micro}>CHAT // #sdf-live</Text>
                <div class="ex-live-spacer" />
                <Badge variant="informative" fillStyle="subtle" size="S">
                  214 here
                </Badge>
              </Flex>

              {/* The backlog scrolls, so the region itself has to be reachable
                  from the keyboard — otherwise the only way to read what
                  scrolled off is a mouse wheel. */}
              <div class="ex-live-log" tabindex={0} role="group" aria-label="Chat backlog">
                <TerminalLog aria-label="Chat" lines={CHAT_LOG} bootIn showCaret />
              </div>

              <Flex alignItems="end" gap="8px">
                <div class="ex-live-say">
                  <SearchField
                    aria-label="Say something"
                    placeholder="say something…"
                    prefix=">"
                    size="S"
                  />
                </div>
                <ToggleButton
                  aria-label="Raise hand"
                  size="S"
                  isEmphasized
                  isSelected={hand()}
                  onChange={setHand}
                >
                  ✋
                </ToggleButton>
              </Flex>
            </div>
          </Card>

          {/* ── the chrome ─────────────────────────────────────────────── */}
          <div class="ex-live-chrome">
            <Well tone="deep" size="S">
              <Flex alignItems="center" gap="8px">
                <ActionButton aria-label="Pause" size="S">
                  <PixelPlayIcon />
                </ActionButton>
                <Text styles={typeRoles.terminal}>● LIVE</Text>
                <Text styles={typeRoles.terminal}>00:47:12</Text>
                <div class="ex-live-track">
                  <ProgressBar
                    aria-label="Session segments · segment 2 of 4"
                    value={SESSION_VALUE}
                    segments={SEGMENTS}
                    size="S"
                  />
                </div>
                <Text styles={typeRoles.micro}>seg 2 · sphere tracing</Text>
                <div class="ex-live-spacer" />
                <Show when={hand()}>
                  <Badge variant="notice" fillStyle="subtle" size="S">
                    HAND UP
                  </Badge>
                </Show>
                <ToggleButton size="S" isEmphasized isSelected={hand()} onChange={setHand}>
                  ✋ raise hand
                </ToggleButton>
                <Text styles={typeRoles.terminal}>♥ 48</Text>
                <ActionButton aria-label="Captions" size="S">
                  <PixelLayoutIcon />
                </ActionButton>
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
