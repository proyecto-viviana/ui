/* Panel 14 — Type & Layout. The register's nine-role ladder ships in the
   library now: typeRoles exports every role as a precompiled class, Heading's
   levels are the three pixel tiers, and Text/Content/Keyboard bake meta/body/
   terminal when standalone (composed inside a parent they still defer to its
   context). Flex/Grid/Divider/Separator carry the layout; Provider shows the
   scheme-override seam. */
import { createFileRoute } from "@tanstack/solid-router";
import { For, type JSX } from "solid-js";
import {
  Heading,
  Text,
  Keyboard,
  Content,
  Header,
  Footer,
  Flex,
  Grid,
  Divider,
  Separator,
  CenterBaseline,
  Provider,
  Well,
  Meter,
  BellIcon,
  SearchIcon,
  typeRoles,
  type TypeRole,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/type")({
  component: Page,
});

const HEADING_LEVELS = [1, 2, 3, 4] as const;
const FLEX_GAPS = ["xs", "sm", "md", "lg", "xl"] as const;
const DIVIDER_SIZES = ["S", "M", "L"] as const;
const SEPARATOR_VARIANTS = ["default", "subtle", "strong"] as const;
const SEPARATOR_SIZES = ["sm", "md", "lg"] as const;

const captionStyle: JSX.CSSProperties = {
  font: "var(--type-terminal)",
  "font-family": "var(--font-mono)",
  color: "var(--text-secondary)",
};

const TYPE_ROLE_LADDER: ReadonlyArray<{ role: TypeRole; sample: string; note: string }> = [
  { role: "display", sample: "Think in circles", note: "Pixel · hero & page titles" },
  { role: "title", sample: "Monte Carlo Path Tracing", note: "Pixel · section/panel titles" },
  { role: "headline", sample: "Spaced Review", note: "Pixel · card & list titles" },
  { role: "label", sample: "Resume · Home · #shaders", note: "Pixel · buttons/nav/chips" },
  { role: "body", sample: "March a ray through signed distance fields.", note: "Geist · prose" },
  { role: "meta", sample: "Today 18:00 · 214 waiting", note: "Geist · secondary" },
  { role: "micro", sample: "LIVE · DUE · 0x3F", note: "Mono · below the pixel floor" },
  { role: "terminal", sample: "> submit checkpoint --answer", note: "Mono · wells & prompts" },
  { role: "button", sample: "RESUME SESSION", note: "Mono · control labels" },
];

function Page() {
  const def = panelBySlug("type")!;

  return (
    <Panel def={def}>
      <Demo label="typeRoles — the register's closed nine-role ladder, one class per role">
        <Flex direction="column" gap="sm">
          <For each={TYPE_ROLE_LADDER}>
            {(entry) => (
              <Flex direction="row" gap="md" alignItems="baseline">
                <span style={{ ...captionStyle, width: "72px", "flex-shrink": 0 }}>
                  {entry.role}
                </span>
                <span class={typeRoles[entry.role]} style={{ "min-width": 0 }}>
                  {entry.sample}
                </span>
                <span style={{ ...captionStyle, "margin-left": "auto", "text-align": "right" }}>
                  {entry.note}
                </span>
              </Flex>
            )}
          </For>
        </Flex>
      </Demo>

      <Demo label="Heading · levels — h1/h2/h3 are the display/title/headline tiers; h4+ share h3's rung">
        <Flex direction="column" gap="xs">
          <For each={HEADING_LEVELS}>
            {(level) => <Heading level={level}>Heading level {level}</Heading>}
          </For>
        </Flex>
      </Demo>

      <Demo label="Text — standalone it takes the meta role; composed, the parent's context styles it">
        <Text>
          Text carries the register's meta role when it stands alone — inside a Button or MenuItem
          the parent still owns its type.
        </Text>
      </Demo>

      <Demo label="Keyboard · shortcut markup — standalone it takes the terminal role">
        <Flex direction="column" gap="xs">
          <Text>
            Save <Keyboard>Ctrl+S</Keyboard>
          </Text>
          <Text>
            Command palette <Keyboard>Ctrl+K</Keyboard>
          </Text>
          <Text>
            Dismiss <Keyboard>Esc</Keyboard>
          </Text>
        </Flex>
      </Demo>

      <Demo label="Header · Content · Footer — composed as a small layout block">
        <Flex direction="column" gap="xs">
          <Header>
            <Heading level={4}>Release notes</Heading>
          </Header>
          <Content>
            <Text>Ship the type panel with real demos for every register role.</Text>
          </Content>
          <Footer>
            <Text>Updated just now.</Text>
          </Footer>
        </Flex>
      </Demo>

      <Demo label="Well — the matte terminal container: opaque surface, scan dither, never glass">
        {/* The register's stat well (TerminalGlassLab Panel07): terminal-role
            mono rows, channel ink on the label, mid ink on the value. */}
        <Well style={{ "line-height": 2.1, "max-width": "28rem" }}>
          <div class={typeRoles.terminal}>
            <span style={{ color: "var(--well-cy)" }}>focus</span>
            <span style={{ color: "var(--well-mid)" }}> [▮▮▮▯▯] 3/5</span>
          </div>
          <div class={typeRoles.terminal}>
            <span style={{ color: "var(--well-am)" }}>streak</span>
            <span style={{ color: "var(--well-mid)" }}> 12 days · hold</span>
          </div>
          <div class={typeRoles.terminal}>
            <span style={{ color: "var(--well-vi)" }}>xp</span>
            <span style={{ color: "var(--well-mid)" }}> 2,840 · lvl 12</span>
          </div>
          <div class={typeRoles.terminal}>
            <span style={{ color: "var(--well-rd)" }}>memory</span>
            <span style={{ color: "var(--well-mid)" }}> cell 0x3F degraded</span>
          </div>
        </Well>
      </Demo>

      <Demo label="Well · composed — the same well built from library primitives">
        <Well style={{ "max-width": "28rem" }}>
          <Flex direction="column" gap="sm">
            <Meter label="Focus" variant="informative" labelPosition="side" segments={5} value={3} maxValue={5} valueLabel="3/5" />
            <Meter label="Streak" variant="notice" labelPosition="side" segments={5} value={4} maxValue={5} valueLabel="4/5" />
            <Meter label="Memory" variant="negative" labelPosition="side" segments={5} value={1} maxValue={5} valueLabel="1/5" />
            <div class={typeRoles.terminal} style={{ color: "var(--well-hi)" }}>{"> "}resume session</div>
          </Flex>
        </Well>
      </Demo>

      <Demo label="Flex · gap sweep">
        <Flex direction="column" gap="md">
          <For each={FLEX_GAPS}>
            {(gap) => (
              <Flex direction="column" gap="xs">
                <span style={captionStyle}>{gap}</span>
                <Flex direction="row" gap={gap}>
                  <Text>Alpha</Text>
                  <Text>Bravo</Text>
                  <Text>Charlie</Text>
                </Flex>
              </Flex>
            )}
          </For>
        </Flex>
      </Demo>

      <Demo label="Grid · columns × gap">
        <Grid columns={3} gap="sm">
          <Text>One</Text>
          <Text>Two</Text>
          <Text>Three</Text>
          <Text>Four</Text>
          <Text>Five</Text>
          <Text>Six</Text>
        </Grid>
      </Demo>

      <Demo label="Divider · sizes">
        <Flex direction="column" gap="md">
          <For each={DIVIDER_SIZES}>
            {(size) => (
              <Flex direction="column" gap="xs">
                <span style={captionStyle}>{size}</span>
                <Divider size={size} />
              </Flex>
            )}
          </For>
        </Flex>
      </Demo>

      <Demo label="Divider · orientation — vertical stretches to fill its row">
        <Flex direction="row" gap="md" alignItems="stretch">
          <Text>Left</Text>
          <Divider orientation="vertical" />
          <Text>Right</Text>
        </Flex>
      </Demo>

      <Demo label="Separator · variant × size — strong currently renders as default">
        <Flex direction="column" gap="md">
          <For each={SEPARATOR_VARIANTS}>
            {(variant) => (
              <Flex direction="column" gap="xs">
                <span style={captionStyle}>{variant}</span>
                <For each={SEPARATOR_SIZES}>
                  {(size) => <Separator variant={variant} size={size} />}
                </For>
              </Flex>
            )}
          </For>
        </Flex>
      </Demo>

      <Demo label="CenterBaseline · icon-to-text alignment">
        <Row>
          <Flex direction="row" gap="xs" alignItems="baseline">
            <CenterBaseline>
              <BellIcon />
            </CenterBaseline>
            <Text>Notifications</Text>
          </Flex>
          <Flex direction="row" gap="xs" alignItems="baseline">
            <CenterBaseline>
              <SearchIcon />
            </CenterBaseline>
            <Text>Search</Text>
          </Flex>
        </Row>
      </Demo>

      <Demo label="Provider · colorScheme override — light island in dark, dark island in light">
        <Row>
          <Provider colorScheme="light" background="layer-1">
            <Flex direction="column" gap="xs">
              <Heading level={4}>Light</Heading>
              <Text>Forced light, regardless of the page theme.</Text>
            </Flex>
          </Provider>
          <Provider colorScheme="dark" background="layer-1">
            <Flex direction="column" gap="xs">
              <Heading level={4}>Dark</Heading>
              <Text>Forced dark, regardless of the page theme.</Text>
            </Flex>
          </Provider>
        </Row>
      </Demo>
    </Panel>
  );
}
