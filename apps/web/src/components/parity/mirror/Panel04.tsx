/* Mirror of spec panel 04 (NAVIGATION) built from real @proyecto-viviana/ui components.
   Renders in the same <Panel> chrome as the spec so any difference between the pair is
   attributable to the components, not the container.

   The spec draws two navigations: a vertical rail of four terminal rows, and a five-slot
   mobile tab bar. `Tabs` is the library's navigation primitive that carries selection
   across a set of peers, and it now ships both register forms this panel needs: the
   default vertical `line` rail, and the horizontal `variant="pill"` glass tab bar whose
   slots stack a pixel icon over a micro label. ListView was the other candidate for the
   rail and was rejected: it is a data grid (row semantics, checkbox selection), not
   navigation.

   Neither half renders panels. Tabs tolerates a TabList with no TabPanels, and the spec
   has no panel content to mirror — inventing some would break the like-for-like. */
import { type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  NotificationBadge,
  PixelHomeIcon,
  PixelMapIcon,
  PixelPlayIcon,
  PixelUserIcon,
  PixelZapIcon,
  Provider,
  Tab,
  TabList,
  Tabs,
  Text,
  Well,
} from "@proyecto-viviana/ui";
import { Panel } from "../lab-shell";
import { useGlasselatedTheme } from "../glasselated-theme";

/* Same four rows, same order, same lowercase labels as the spec's NAV_ITEMS.
   `count` is the spec's amber pill on `review`; the colours are deliberately absent —
   the spec hard-codes a per-item `fg`, the twin lets the component own selected/rest. */
const NAV_ITEMS = [
  { id: "home", label: "home", count: null as number | null },
  { id: "explore", label: "explore", count: null as number | null },
  { id: "review", label: "review", count: 4 as number | null },
  { id: "live", label: "live", count: null as number | null },
];

/* The spec's TAB_ITEMS, now carrying the library's own register glyphs. `home`,
   `explore` (map), `play`, `live` (zap) and `me` (user) each map to the exported
   Pixel*Icon that draws the exact artwork the spec panel uses. */
const TAB_ITEMS: { id: string; Icon: Component; label: string }[] = [
  { id: "home", Icon: PixelHomeIcon, label: "Home" },
  { id: "explore", Icon: PixelMapIcon, label: "Explore" },
  { id: "play", Icon: PixelPlayIcon, label: "Play" },
  { id: "live", Icon: PixelZapIcon, label: "Live" },
  { id: "me", Icon: PixelUserIcon, label: "Me" },
];

export function MirrorPanel04(): JSX.Element {
  const { theme } = useGlasselatedTheme();

  return (
    <Panel label="04 // NAVIGATION — VIVIANA UI">
      {/* This twin server-renders in full. It used to be deferred past hydration: a
          Tab carrying any element child — the rail's NotificationBadge, the tab bar's
          pixel icon — SSR'd an empty <span> and hydration threw. That was a collection
          SSR defect in the library's own GridList (render-effect item registration + a
          non-frozen collection accessor); see
          packages/viviana-ui/test/Collections.{ssr,hydrate}.test for the
          Tab-with-element-child regression fixtures. So the badge and icons are composed
          directly, no ClientOnly. */}
      {/* No background prop: the components must sit on the panel's glass exactly as the
          spec markup does. background="base" would paint an opaque plate underneath them
          and there would be nothing left to compare. (The rail's <Well> below is a real
          component drawing its own matte inset — not the forbidden Provider background.) */}
      <Provider
        colorScheme={theme()}
        class="viviana-mirror-zone"
        data-mirror="04"
        style={{ display: "flex", "flex-direction": "column", gap: "16px" }}
      >
        {/* The rail sits in the library's own <Well>: a matte, never-glass inset — the
            `well` ink, a 1px `well-border` hairline, and the 4px `--well-scan` pixel
            dither (wellScan()), the same matte surface the register's fields share. It is
            the spec rail's container, drawn by a real component rather than omitted.
            NEAR-MISS (well ink): the spec rail is specifically the *tutor* well
            (--surface-well-tutor); Well exposes no ink variant, so it lands on the base
            `well` ink — the right surface, one shade off.
            The rail's ">" caret is the register's signature nav cue — rest-invisible,
            ghosting in on row hover (0.55) and pinning solid on the active row — and
            Tabs draws it itself: the vertical `line` rail renders a
            data-rsp-slot="tab-caret" glyph with exactly that behaviour and suppresses
            the sliding SelectionIndicator in its place (tabs/index.tsx:558,1141). So the
            row matches the spec's caret rather than standing a selection bar in for it. */}
        <Well style={{ padding: "8px", "max-width": "250px" }}>
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
        </Well>

        {/* The tab bar is Tabs' `variant="pill"`: the register's mobile tab bar — a
            full-radius glass capsule (`layer-1` under `--blur-panel`, a `border-subtle`
            hairline, the `edge-glass` rim) whose slots spread `space-around` and stack a
            pixel icon over a micro label (column flow, 52px slot floor). That is the
            spec's tab bar drawn by the component itself, not a flush strip standing in for
            it. Width is pinned to the spec's ~340px: pill is horizontal-only and never
            collapses into a picker, so no room has to be left for an overflow menu the
            way the default `line` strip would demand. */}
        <div style={{ "max-width": "340px" }}>
          <Tabs
            aria-label="App sections"
            variant="pill"
            items={TAB_ITEMS}
            getTextValue={(t) => t.label}
            defaultSelectedKey="home"
          >
            <TabList>
              {(t: (typeof TAB_ITEMS)[number]) => (
                <Tab id={t.id}>
                  {/* Real library pixel icons — PixelHomeIcon / PixelMapIcon /
                      PixelPlayIcon / PixelZapIcon / PixelUserIcon — the register's own
                      glyph set, the same artwork the spec draws. Unlike the app's PixelIcon
                      primitive, these are createIcon() components, so they consume Tab's
                      IconContext and pick up its centerBaseline alignment and icon sizing.
                      They take no explicit colour: defaulting to currentColor lets the
                      Tab's own selected/rest ink drive them, where the spec hard-codes
                      accent vs tertiary per item. */}
                  <Dynamic component={t.Icon} />
                  {/* <Text> for the label, as the rail above. Under `pill` the Tab stacks
                      it beneath the icon. */}
                  <Text>{t.label}</Text>
                </Tab>
              )}
            </TabList>
          </Tabs>
        </div>
      </Provider>
    </Panel>
  );
}
