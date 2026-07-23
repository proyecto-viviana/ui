/* Mirror of spec panel 04 (NAVIGATION) built from real @proyecto-viviana/ui components.
   Renders in the same <Panel> chrome as the spec so any difference between the pair is
   attributable to the components, not the container.

   The spec draws two navigations: a vertical rail of four terminal rows, and a five-slot
   mobile tab bar. Grepping the library's exports, `Tabs` is its only navigation primitive
   that carries selection across a set of peers — there is no SideNav, no Navigation, no
   tab/bottom bar — so both halves are built from it, vertical and horizontal. ListView was
   the other candidate for the rail and was rejected: it is a data grid (row semantics,
   checkbox selection), not navigation.

   Neither half renders panels. Tabs tolerates a TabList with no TabPanels, and the spec
   has no panel content to mirror — inventing some would break the like-for-like. */
import { type JSX } from "solid-js";
import { NotificationBadge, Provider, Tab, TabList, Tabs, Text } from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";
import { PixelIcon } from "../primitives";

/* Same four rows, same order, same lowercase labels as the spec's NAV_ITEMS.
   `count` is the spec's amber pill on `review`; the colours are deliberately absent —
   the spec hard-codes a per-item `fg`, the twin lets the component own selected/rest. */
const NAV_ITEMS = [
  { id: "home", label: "home", count: null as number | null },
  { id: "explore", label: "explore", count: null as number | null },
  { id: "review", label: "review", count: 4 as number | null },
  { id: "live", label: "live", count: null as number | null },
];

/* The spec's TAB_ITEMS, icons included. */
const TAB_ITEMS = [
  { id: "home", icon: "home", label: "Home" },
  { id: "explore", icon: "map", label: "Explore" },
  { id: "play", icon: "play", label: "Play" },
  { id: "live", icon: "zap", label: "Live" },
  { id: "me", icon: "user", label: "Me" },
];

export function MirrorPanel04(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="04 // NAVIGATION — VIVIANA UI">
      {/* This twin server-renders in full. It used to be deferred past hydration: a
          Tab carrying any element child — the rail's NotificationBadge, the tab bar's
          icon — SSR'd an empty <span> and hydration threw. That was a collection SSR
          defect in the library's own GridList (render-effect item registration + a
          non-frozen collection accessor); see
          packages/viviana-ui/test/Collections.{ssr,hydrate}.test for the
          Tab-with-element-child regression fixtures. So the badge and icons are composed
          directly, no ClientOnly. */}
      {/* No background prop: the components must sit on the panel's glass exactly as the
          spec markup does. background="base" would paint an opaque plate underneath them
          and there would be nothing left to compare. */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="04"
        style={{ display: "flex", "flex-direction": "column", gap: "16px" }}
      >
        {/* GAP (surface): the spec's rail sits in a matte tutor well — solid ink on
            --surface-well-tutor, 1px --well-border, and the 4px pixel scan-grid. The
            library ships no well/inset surface primitive, so the rail sits directly on
            the panel glass. Omitted rather than hand-rolled: reproducing the well here
            would hide the fact that the library cannot draw it.
            GAP (affordance): each spec row leads with a mono ">" caret that fades in on
            hover and pins at full opacity when selected. Tabs expresses selection with a
            SelectionIndicator bar on the rail edge instead, so the caret is dropped —
            it is the register's signature nav cue and has no component equivalent. */}
        <div style={{ "max-width": "250px" }}>
          <Tabs
            aria-label="Sections"
            orientation="vertical"
            items={NAV_ITEMS}
            getTextValue={(n) => n.label}
            defaultSelectedKey="home"
          >
            <TabList>
              {(n: (typeof NAV_ITEMS)[number]) => (
                <Tab id={n.id}>
                  {/* <Text> is what a Tab's TextContext is for: it slots the label into
                      the control's own typography. (This was where the SSR defect first
                      surfaced — an element child looked like a Text bug until the bisect
                      widened to every element — but with that fixed, the label is composed
                      the idiomatic way rather than as a bare string.) */}
                  <Text>{n.label}</Text>
                  {/* NotificationBadge is the library's own count component, so the "4"
                      is a real component rather than a styled pill. GAP (composition):
                      only ActionButton provides NotificationBadgeContext — Tab provides
                      IconContext and TextContext and nothing else — so the badge renders
                      unslotted: it trails the label at its own default size instead of
                      being positioned and sized by the host control, and it does not
                      right-align into the rail's trailing edge the way the spec's pill
                      does (Tab's content box is not a space-between row). */}
                  {n.count === null ? null : <NotificationBadge value={n.count} />}
                </Tab>
              )}
            </TabList>
          </Tabs>
        </div>

        {/* GAP (surface): the spec's tab bar is a 999px glass pill — --surface-panel under
            --blur-panel, --edge-glass rim, items space-around. Tabs has no pill/contained
            form and no isJustified (SegmentedControl has that prop; Tabs does not), so the
            twin is a flush left-aligned strip on a divider rule. Width is left unconstrained
            on purpose: Tabs measures its own width and collapses into a picker menu when it
            overflows, so pinning the spec's 340px would swap the strip for a menu button and
            mirror nothing.
            GAP (form): the spec stacks icon over label per slot, mobile-tab-bar style. S2
            lays a Tab's icon and label inline on one row and offers no stacked arrangement
            (labelBehavior only toggles the label's visibility), so the twin reads as five
            icon+label pairs in a row. */}
        <Tabs
          aria-label="App sections"
          items={TAB_ITEMS}
          getTextValue={(t) => t.label}
          defaultSelectedKey="home"
        >
          <TabList>
            {(t: (typeof TAB_ITEMS)[number]) => (
              <Tab id={t.id}>
                {/* GAP (icons): the library exports only Bell/Close/Contrast/Lighten/Link/
                    MenuHamburger/Search — there is no home/map/play/zap/user glyph and no
                    icon set to draw one from. Substituted with the island's own PixelIcon,
                    which is the exact primitive the spec panel uses, so the glyphs are
                    identical on both sides and any difference in this row is Tab's chrome
                    rather than the artwork. It takes no colour here: defaulting to
                    currentColor lets the Tab's own selected/rest ink drive it, where the
                    spec hard-codes accent vs tertiary per item. It does not consume Tab's
                    IconContext, so it misses the centerBaseline alignment and icon sizing a
                    library icon would receive. */}
                <PixelIcon name={t.icon} />
                {/* <Text> for the label, as the rail above. */}
                <Text>{t.label}</Text>
              </Tab>
            )}
          </TabList>
        </Tabs>
      </Provider>
    </Panel>
  );
}
