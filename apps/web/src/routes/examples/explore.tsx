/* /examples/explore — the index four days in (handoff study 4d).
 *
 * A filter row, then a five-cell board: the journey you are in the middle of
 * held open across both rows, and four tiles beside it. The chips are a real
 * `TagGroup` — it owns its own selection, so the screen adds no state of its
 * own — and every stamp, bracket and bar on the board is a library part.
 *
 * The handoff paints the hero's title and lede over a gradient scrim on the
 * media. A scrim is paint, and the app is not allowed to author paint here, so
 * the hero keeps the library's card grammar instead: the media in a
 * `CardPreview` under `HudFrame` brackets, the words beneath it. Same content,
 * same order, drawn by the register rather than by the app.
 */
import { For, type JSX } from "solid-js";
import {
  Button,
  Card,
  CardPreview,
  Content,
  Footer,
  Heading,
  HudFrame,
  Image,
  Meter,
  Tag,
  TagGroup,
  Text,
  typeRoles,
} from "@proyecto-viviana/ui";
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import {
  CMDS,
  CWDS,
  EXPLORE_CHIPS,
  EXPLORE_HERO,
  EXPLORE_SORT,
  TILES,
} from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/explore")({
  head: () => exampleSeo("explore"),
  component: ExploreScreen,
});

const CHIPS = EXPLORE_CHIPS.map((name) => ({ id: name, name }));

/* One seed per card so the mesh weave differs cell to cell rather than
   repeating the same figure five times. */
const TILE_SEEDS = [23, 41, 59, 71];

function ExploreScreen(): JSX.Element {
  const percent = () => Math.round((EXPLORE_HERO.done / EXPLORE_HERO.total) * 100);

  return (
    <AppShell cwd={CWDS["explore"]} cmd={CMDS["explore"]} active="explore" askFilled={true}>
      <div class="ex-screen">
        <div class="ex-explore-filters">
          <TagGroup
            aria-label="Filter journeys"
            items={CHIPS}
            selectionMode="single"
            defaultSelectedKeys={["all"]}
            isEmphasized
            size="M"
          >
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagGroup>
          <Text styles={typeRoles.meta}>{EXPLORE_SORT}</Text>
        </div>

        <div class="ex-explore-board">
          <Card
            id="explore-hero"
            class="ex-panel ex-explore-hero"
            mesh="ambient"
            meshSeed={7}
            size="L"
          >
            <CardPreview tag={EXPLORE_HERO.tag}>
              <HudFrame brackets="M" channel="info">
                <Image
                  UNSAFE_className="ex-explore-media"
                  src={EXPLORE_HERO.thumb}
                  alt=""
                  isPixelated
                />
              </HudFrame>
            </CardPreview>
            <Content>
              <Heading level={1}>{EXPLORE_HERO.title}</Heading>
              <Text slot="description">{EXPLORE_HERO.lede}</Text>
            </Content>
            <Footer>
              <Button variant="primary" size="S">
                {EXPLORE_HERO.cta}
              </Button>
              <Meter
                UNSAFE_className="ex-explore-meter"
                label={`${EXPLORE_HERO.done} / ${EXPLORE_HERO.total}`}
                labelPosition="side"
                variant="metric"
                segments={EXPLORE_HERO.total}
                value={percent()}
                size="S"
              />
            </Footer>
          </Card>

          <For each={TILES}>
            {(tile, index) => (
              <Card
                id={`explore-tile-${index()}`}
                class="ex-panel"
                mesh="ambient"
                meshSeed={TILE_SEEDS[index()]}
                size="M"
              >
                <CardPreview tag={tile.tag}>
                  <Image src={tile.thumb} alt="" isPixelated />
                </CardPreview>
                <Content>
                  <Text slot="title">{tile.title}</Text>
                </Content>
                <Footer>
                  <Text styles={typeRoles.micro}>{tile.meta}</Text>
                  <Text styles={typeRoles.micro}>{tile.percent}</Text>
                </Footer>
              </Card>
            )}
          </For>
        </div>
      </div>
    </AppShell>
  );
}
