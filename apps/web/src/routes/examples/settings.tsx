/* Screen 09 — Settings: preferences as an rc file.
 *
 * The handoff's fourth home study (4e) draws settings as `~/.akaderc` open in
 * an editor: nineteen numbered lines, each one a real control sitting where its
 * value would be, with a live preview of what those lines paint beside it.
 *
 * This is the one app screen with no `+ Create` — an rc file is edited and
 * saved, never used to make something — so the command bar opts out of the ask
 * (`hasAsk={false}`) and the screen spends zero fuchsia fills. Its two asks are
 * `:w save` (primary) and the preview's outlined `+ Create`, which is sample
 * content rather than this screen's own call to action.
 *
 * Every row is a library control — `Switch`, `SegmentedControl`, `TextField` —
 * and the `ex-*` classes carry the editor's box metrics only. */
import { createMemo, createSignal, For, Match, Switch as SwitchFlow } from "solid-js";
import { createFileRoute } from "@tanstack/solid-router";
import {
  Badge,
  Button,
  Card,
  Content,
  Heading,
  InlineAlert,
  SegmentedControl,
  SegmentedControlItem,
  Switch,
  TerminalLog,
  Text,
  TextField,
  Well,
  typeRoles,
} from "@proyecto-viviana/ui";
import { AppShell } from "@/components/examples/AppShell";
import { CMDS, CWDS, RC_LINES, SHAPES } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/settings")({
  head: () => exampleSeo("settings"),
  component: SettingsScreen,
});

/* The lines the file opened dirty on — `focus.blocks` and `tutor.hints`. The
   counter in the command bar reads this, so editing a clean line makes the
   count go up and the warning is about the line that actually changed. */
const UNSAVED = RC_LINES.filter((line) => line.isUnsaved === true).map((line) => line.key);

/* The five display shapes, each with the glyph the ELSH pixel face draws for
   it — the swatch row under the preview. */
const SHAPE_GLYPHS: Record<string, string> = {
  square: "■",
  circle: "●",
  grid: "▦",
  triangle: "▲",
  line: "▬",
};

function SettingsScreen() {
  const [dirty, setDirty] = createSignal<readonly string[]>(UNSAVED);
  const [isSaved, setSaved] = createSignal(false);

  const touch = (key: string) => {
    setSaved(false);
    setDirty((keys) => (keys.includes(key) ? keys : [...keys, key]));
  };

  const count = createMemo(() => (isSaved() ? 0 : dirty().length));

  return (
    <AppShell
      cwd={CWDS["settings"]}
      cmd={CMDS["settings"]}
      active=""
      askFilled={false}
      hasAsk={false}
      right={
        <>
          <Badge variant="notice" fillStyle="subtle" size="S">
            ● {count()} unsaved
          </Badge>
          <Button
            variant="primary"
            size="S"
            isDisabled={count() === 0}
            onPress={() => {
              setDirty([]);
              setSaved(true);
            }}
          >
            :w save
          </Button>
        </>
      }
    >
      <div class="ex-screen ex-settings ex-stack">
        {/* ── the file ──────────────────────────────────────────────────── */}
        <Card id="settings-rc" class="ex-settings-card" variant="secondary" size="S">
          <div class="ex-settings-body">
            <div class="ex-settings-row">
              <Heading level={1} styles={typeRoles.title}>
                ~/.akaderc
              </Heading>
              <Badge variant="metric" fillStyle="subtle" size="S">
                {RC_LINES.length} LINES
              </Badge>
            </div>

            <Well tone="deep" size="M">
              <div class="ex-rc">
                <For each={RC_LINES}>
                  {(line) => (
                    <div class="ex-rc-line">
                      <div class="ex-rc-num">
                        <Text styles={typeRoles.micro}>{line.num}</Text>
                      </div>
                      <SwitchFlow>
                        <Match when={line.kind === "blank"}>
                          <div class="ex-rc-blank" />
                        </Match>
                        <Match when={line.kind === "comment"}>
                          <Text styles={typeRoles.terminal}>{line.key}</Text>
                        </Match>
                        <Match when={line.kind === "toggle"}>
                          <div class="ex-rc-key">
                            <Text styles={typeRoles.terminal}>{line.key}</Text>
                          </div>
                          <Switch
                            size="S"
                            defaultSelected={line.isOn === true}
                            onChange={() => touch(line.key)}
                          >
                            {line.value}
                          </Switch>
                        </Match>
                        <Match when={line.kind === "text"}>
                          <div class="ex-rc-key">
                            <Text styles={typeRoles.terminal}>{line.key}</Text>
                          </div>
                          <div class="ex-rc-field">
                            <TextField
                              aria-label={line.key}
                              size="S"
                              surface="tutor"
                              defaultValue={line.value}
                              onChange={() => touch(line.key)}
                            />
                          </div>
                        </Match>
                        <Match when={line.kind === "segments"}>
                          <div class="ex-rc-key">
                            <Text styles={typeRoles.terminal}>{line.key}</Text>
                          </div>
                          <SegmentedControl
                            aria-label={line.key}
                            defaultSelectedKey={(line.options ?? [])[line.selected ?? 0]}
                            onSelectionChange={() => touch(line.key)}
                          >
                            <For each={line.options ?? []}>
                              {(option) => (
                                <SegmentedControlItem id={option}>{option}</SegmentedControlItem>
                              )}
                            </For>
                          </SegmentedControl>
                        </Match>
                      </SwitchFlow>
                      <div class="ex-rc-note">
                        <Text styles={typeRoles.micro}>
                          {dirty().includes(line.key) ? "● unsaved" : (line.note ?? "")}
                        </Text>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Well>
          </div>
        </Card>

        {/* ── what the file paints ──────────────────────────────────────── */}
        <div class="ex-settings-side">
          <Card id="settings-preview" class="ex-settings-card" variant="secondary" size="S">
            <div class="ex-settings-body">
              <div class="ex-settings-row">
                <Text styles={typeRoles.micro}>PREVIEW</Text>
                <Text styles={typeRoles.micro}>updates live</Text>
              </div>

              <Heading level={2} styles={typeRoles.display}>
                Why Random Rays Make Real Pictures
              </Heading>
              <Text styles={typeRoles.body}>Body at 14px · Geist. Display shape square.</Text>

              <div class="ex-settings-trio">
                <Button variant="primary" size="S">
                  Resume
                </Button>
                <Button variant="secondary" fillStyle="outline" size="S">
                  Today
                </Button>
                <Button variant="create" fillStyle="outline" size="S">
                  + Create
                </Button>
              </div>

              <Well tone="well" size="S">
                <TerminalLog
                  aria-label="Tutor preview"
                  showCaret
                  lines={[
                    {
                      spans: [
                        { text: "$ ", channel: "prompt" },
                        { text: 'ask tutor "explain the estimator"' },
                      ],
                    },
                  ]}
                />
              </Well>

              <div class="ex-settings-swatches">
                <For each={SHAPES}>
                  {(shape) => (
                    <Well tone="deep" size="S">
                      <div class="ex-settings-swatch">
                        <Text styles={typeRoles.title}>{SHAPE_GLYPHS[shape]}</Text>
                        <Text styles={typeRoles.micro}>{shape}</Text>
                      </div>
                    </Well>
                  )}
                </For>
              </div>
              <Text styles={typeRoles.micro}>display.shape</Text>
            </div>
          </Card>

          <InlineAlert variant="notice" fillStyle="subtleFill">
            <Heading>focus.blocks changed to 5</Heading>
            <Content>Tomorrow's schedule will move. Undo from line 8, or save to keep it.</Content>
          </InlineAlert>
        </div>
      </div>
    </AppShell>
  );
}
