/**
 * Shared fixtures for the collection hydration regression.
 *
 * Both halves of the test (SSR and hydrate) must render *identical* trees — they are compiled
 * twice, by two different configs, and any divergence in the fixture itself would show up as a
 * hydration mismatch and mask the bug under test. Keeping one definition makes that impossible.
 *
 * Shapes are taken from the akade design-handoff-v2 mirror panels that surfaced the failure:
 * Panel04 (Tabs with defaultSelectedKey) and Panel08 (ListView with per-row descriptions).
 */
import type { JSX } from "solid-js";
import { ListView, ListViewItem, Provider, Tab, TabList, Tabs, Text } from "../../src";

const TAB_ITEMS = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Explore" },
  { id: "play", label: "Play" },
];

const LIST_ROWS = [
  { id: "r1", title: "Radiometry Basics", meta: "12 min" },
  { id: "r2", title: "Spectral Response", meta: "8 min" },
];

export function TabsFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tabs
        aria-label="App sections"
        items={TAB_ITEMS}
        getTextValue={(t: (typeof TAB_ITEMS)[number]) => t.label}
        defaultSelectedKey="home"
      >
        <TabList>
          {(t: (typeof TAB_ITEMS)[number]) => (
            <Tab id={t.id}>
              <Text>{t.label}</Text>
            </Tab>
          )}
        </TabList>
      </Tabs>
    </Provider>
  );
}

/** Same tree as TabsFixture but with a raw <span> instead of <Text>, to isolate which half owns
 * a hydration-key divergence: the Tab content chain, or Text/ElementTag beneath it. */
export function TabsPlainFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tabs
        aria-label="App sections"
        items={TAB_ITEMS}
        getTextValue={(t: (typeof TAB_ITEMS)[number]) => t.label}
        defaultSelectedKey="home"
      >
        <TabList>
          {(t: (typeof TAB_ITEMS)[number]) => (
            <Tab id={t.id}>
              <span>{t.label}</span>
            </Tab>
          )}
        </TabList>
      </Tabs>
    </Provider>
  );
}

/** Same tree again, but the Tab child is a trivial *local* component. If this diverges too, the
 * fault is generic to instantiating any component as a Tab child, not anything inside Text. */
function PlainLabel(props: { children?: JSX.Element }): JSX.Element {
  return <span>{props.children}</span>;
}

export function TabsCompFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tabs
        aria-label="App sections"
        items={TAB_ITEMS}
        getTextValue={(t: (typeof TAB_ITEMS)[number]) => t.label}
        defaultSelectedKey="home"
      >
        <TabList>
          {(t: (typeof TAB_ITEMS)[number]) => (
            <Tab id={t.id}>
              <PlainLabel>{t.label}</PlainLabel>
            </Tab>
          )}
        </TabList>
      </Tabs>
    </Provider>
  );
}

export function ListViewFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ListView aria-label="Lessons" items={LIST_ROWS} isQuiet>
        {(row: (typeof LIST_ROWS)[number]) => (
          <ListViewItem id={row.id} textValue={row.title} description={row.meta}>
            <Text slot="label">{row.title}</Text>
          </ListViewItem>
        )}
      </ListView>
    </Provider>
  );
}
