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
import {
  Badge,
  BellIcon,
  ListView,
  ListViewItem,
  NotificationBadge,
  Provider,
  Tab,
  TabList,
  Tabs,
  Text,
} from "../../src";

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

/** Panel04 rail shape: a Tab whose children are a bare string AND a conditional
 * element (NotificationBadge), i.e. multiple mixed children where one is an element.
 * Every other Tabs fixture carries exactly one child; this is the shape the mirror
 * claimed cannot server-render, so it is the one that must be proven. */
const BADGE_ITEMS = [
  { id: "home", label: "home", count: null as number | null },
  { id: "review", label: "review", count: 4 as number | null },
  { id: "live", label: "live", count: null as number | null },
];

export function TabsBadgeFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tabs
        aria-label="Sections"
        orientation="vertical"
        items={BADGE_ITEMS}
        getTextValue={(n: (typeof BADGE_ITEMS)[number]) => n.label}
        defaultSelectedKey="home"
      >
        <TabList>
          {(n: (typeof BADGE_ITEMS)[number]) => (
            <Tab id={n.id}>
              <Text>{n.label}</Text>
              {n.count === null ? null : <NotificationBadge value={n.count} />}
            </Tab>
          )}
        </TabList>
      </Tabs>
    </Provider>
  );
}

/** Panel04 tab-bar shape: a Tab that leads with an element (icon) followed by a
 * bare string. Element-first ordering, in case the child order changes which half
 * of the pair the hydration walk trips on. */
const ICON_ITEMS = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Explore" },
  { id: "play", label: "Play" },
];

export function TabsIconFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <Tabs
        aria-label="App sections"
        items={ICON_ITEMS}
        getTextValue={(t: (typeof ICON_ITEMS)[number]) => t.label}
        defaultSelectedKey="home"
      >
        <TabList>
          {(t: (typeof ICON_ITEMS)[number]) => (
            <Tab id={t.id}>
              <BellIcon />
              <Text>{t.label}</Text>
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

const INTERACTIVE_ROWS = [
  { id: "row-a", title: "Row A" },
  { id: "row-b", title: "Row B" },
];

/** A selectable ListView (dynamic `items`, render-prop children) used to prove
 * rows actually respond to interaction — not just that hydration completes
 * without a mismatch. See Collections.hydrate.test.tsx. */
export function ListViewInteractiveFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ListView aria-label="Interactive rows" items={INTERACTIVE_ROWS} selectionMode="multiple">
        {(row: (typeof INTERACTIVE_ROWS)[number]) => (
          <ListViewItem id={row.id} textValue={row.title}>
            <Text slot="label">{row.title}</Text>
          </ListViewItem>
        )}
      </ListView>
    </Provider>
  );
}

/** A selectable ListView using STATIC `<ListViewItem>` children (no `items` prop) —
 * the S2-parity API shape most apps reach for first. Static children register
 * themselves into the collection through a `createEffect` in `GridListItem`
 * (see gridlist/index.tsx `registrationContext.registerItem`), which never runs
 * during `renderToString` (effects are client-only), so this shape is the one
 * that actually exercises the reported "ListView items never hydrate" bug. */
export function ListViewStaticInteractiveFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ListView aria-label="Static interactive rows" selectionMode="multiple">
        <ListViewItem id="row-a" textValue="Row A">
          <Text slot="label">Row A</Text>
        </ListViewItem>
        <ListViewItem id="row-b" textValue="Row B">
          <Text slot="label">Row B</Text>
        </ListViewItem>
      </ListView>
    </Provider>
  );
}

const SLOTTED_ROWS = [
  { id: "radiometry", title: "Radiometry Basics", meta: "Reference · 8 min", tag: "READ" },
  { id: "pathtracing", title: "Monte Carlo Path Tracing", meta: "Journey · phase 3/5", tag: "RUNNING" },
];

/** Panel08 shape in full: items + render-function, each row carrying `description`,
 * a plain `<span slot="label">` (not <Text>), and a `<div slot="actions">` wrapping a
 * Badge. The mirror claims this shape "does not hydrate under ANY shape" — the other
 * ListView fixtures use only a single <Text slot="label"> child, so this reproduces the
 * multi-slot form (label + description + actions) the mirror actually renders. */
export function ListViewSlottedFixture(): JSX.Element {
  return (
    <Provider background="base" colorScheme="dark">
      <ListView aria-label="Lessons" items={SLOTTED_ROWS} isQuiet>
        {(row: (typeof SLOTTED_ROWS)[number]) => (
          <ListViewItem id={row.id} textValue={row.title} description={row.meta}>
            <Text slot="label">{row.title}</Text>
            <div slot="actions">
              <Badge size="S" variant="neutral" fillStyle="outline">
                {row.tag}
              </Badge>
            </div>
          </ListViewItem>
        )}
      </ListView>
    </Provider>
  );
}
