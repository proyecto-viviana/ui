/* Panel 14 — Type & Layout. The nine type roles ride on Heading/Text/Keyboard
   and the Content/Header/Footer slot pieces; Flex/Grid/Divider/Separator carry
   the layout; Provider shows the scheme-override seam. Nothing here paints —
   these primitives ship unstyled and take their face from the register. */
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
  BellIcon,
  SearchIcon,
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

function Page() {
  const def = panelBySlug("type")!;

  return (
    <Panel def={def}>
      <Demo label="Heading · levels — h4+ share h3's rung">
        <Flex direction="column" gap="xs">
          <For each={HEADING_LEVELS}>
            {(level) => <Heading level={level}>Heading level {level}</Heading>}
          </For>
        </Flex>
      </Demo>

      <Demo label="Text — unstyled slot; the type role comes from the parent">
        <Text>
          Text carries no font styling of its own — it is the raw content slot every other type
          component composes around.
        </Text>
      </Demo>

      <Demo label="Keyboard · shortcut markup">
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
