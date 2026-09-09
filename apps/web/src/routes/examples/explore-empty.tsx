/* /examples/explore-empty — the index on day zero.
 *
 * The App handoff's empty state: the index card carries its own transcript,
 * then a block of shimmer where the results would be, the one thing the screen
 * has to say, and three topics to start from. The outline well beside it proves
 * the curriculum exists even though the filter matched nothing.
 *
 * The shimmer is the library's `Skeleton` over library `Image` blocks — under
 * the skeleton context an `Image` paints the register's dither sweep and hides
 * its own content, which is exactly the handoff's shimmer square. The app only
 * says how many blocks fit across.
 */
import { For, type JSX } from "solid-js";
import {
  Badge,
  Card,
  CardPreview,
  Divider,
  Heading,
  Image,
  Skeleton,
  StatusLight,
  Tag,
  TagGroup,
  TerminalLog,
  Text,
  type TerminalLogLine,
  typeRoles,
} from "@proyecto-viviana/ui";
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import {
  CMDS,
  CWDS,
  EXPLORE_EMPTY_LOG,
  EXPLORE_SHIMMER,
  EXPLORE_SUGGESTIONS,
  LESSONS,
} from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/explore-empty")({
  head: () => exampleSeo("explore-empty"),
  component: ExploreEmptyScreen,
});

/** The mark each lesson state flies in the outline, and the ink it reports in. */
const OUTLINE_MARK = { done: "✓", now: ">", todo: "░" } as const;
const OUTLINE_CHANNEL = { done: "metric", now: "prompt", todo: "muted" } as const;

/* `├─` down the branch and `└─` on the last row, the mark, a zero-padded index,
   the title and its minutes — the handoff's outline, built from the curriculum
   rather than transcribed, so the two cannot drift apart. */
const OUTLINE_LINES: readonly TerminalLogLine[] = [
  { channel: "muted", text: "rendering/            9 lessons" },
  ...LESSONS.map((lesson, index) => ({
    channel: OUTLINE_CHANNEL[lesson.state],
    text:
      `${index === LESSONS.length - 1 ? "└─" : "├─"} ${OUTLINE_MARK[lesson.state]} ` +
      `${String(index + 1).padStart(2, "0")} ${lesson.title.padEnd(14, " ")}${lesson.minutes}m`,
  })),
];

const SUGGESTIONS = EXPLORE_SUGGESTIONS.map((name) => ({ id: name, name }));

const SHIMMER = Array.from({ length: EXPLORE_SHIMMER }, (_, index) => index);

function ExploreEmptyScreen(): JSX.Element {
  return (
    <AppShell
      cwd={CWDS["explore-empty"]}
      cmd={CMDS["explore-empty"]}
      active="explore"
      askFilled={true}
    >
      <div class="ex-screen ex-empty">
        <Card id="explore-empty-index" class="ex-panel" mesh="ambient" meshSeed={11} size="L">
          <CardPreview background="inset">
            <div class="ex-cardbar">
              <StatusLight size="S" variant="informative">
                EXPLORE // index
              </StatusLight>
              <Badge variant="neutral" fillStyle="subtle" size="S">
                0 results
              </Badge>
            </div>
            <Divider />
          </CardPreview>

          <div class="ex-empty-body">
            <TerminalLog aria-label="Index transcript" bootIn lines={EXPLORE_EMPTY_LOG} />

            <div class="ex-empty-state">
              {/* The results that are not there yet. `Skeleton` is the register's
                  loading context and each block is a library `Image`, so the
                  dither sweep is the library's paint; the app only lays out the
                  eight-across grid. */}
              <Skeleton isLoading>
                <div class="ex-shimmer" aria-hidden="true">
                  <For each={SHIMMER}>{() => <Image alt="" />}</For>
                </div>
              </Skeleton>

              <Heading level={1} styles={typeRoles.title}>
                Nothing indexed yet
              </Heading>
              <Text styles={typeRoles.meta}>type a topic, or start from a suggestion</Text>

              <TagGroup
                aria-label="Suggested topics"
                items={SUGGESTIONS}
                selectionMode="single"
                isEmphasized
                size="M"
              >
                {(item) => <Tag id={item.id}>{item.name}</Tag>}
              </TagGroup>
            </div>

            <TerminalLog aria-label="Prompt" showCaret lines={[{ channel: "prompt", text: "$" }]} />
          </div>
        </Card>

        <Card id="explore-empty-outline" class="ex-panel" mesh="ambient" meshSeed={47} size="L">
          <CardPreview background="inset">
            <div class="ex-cardbar">
              <StatusLight size="S" variant="neutral">
                OUTLINE // rendering
              </StatusLight>
              <Badge variant="metric" fillStyle="outline" size="S">
                9 LESSONS
              </Badge>
            </div>
            <Divider />
          </CardPreview>

          <div class="ex-empty-body">
            <TerminalLog aria-label="rendering outline" lines={OUTLINE_LINES} />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
