import { createSignal, type JSX } from "solid-js";
import {
  Button,
  Badge,
  Alert,
  Checkbox,
  ToggleSwitch,
  TextField,
  SearchField,
  ProgressBar,
  Meter,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Calendar,
} from "@proyecto-viviana/ui";
import { Chip } from "@proyecto-viviana/ui/Chip";
import { ProfileCard } from "@proyecto-viviana/ui/ProfileCard";
import { EventCard } from "@proyecto-viviana/ui/EventCard";
import { ConversationBubble, ConversationPreview } from "@proyecto-viviana/ui/Conversation";
import { Provider } from "@proyecto-viviana/ui/Provider";
import { type TokenMap } from "@/utils/themeBase";
import { tokensToInlineStyle } from "@/utils/themeGen";
import "./studio.css";

export interface ThemePreviewGalleryProps {
  /** Fully-resolved --color-* map for the scheme being previewed. */
  tokens: TokenMap;
  scheme: "dark" | "light";
  /** Rendered inside a device frame that owns the border/radius — drop our own. */
  framed?: boolean;
}

// A titled sub-panel inside the canvas: soft rounded corners + 1px border, a
// small accent dot on the heading — echoing the clean Spectrum-2 site chrome.
// Its colors ride the previewed --color-* map (not --docs-*), so the panel
// re-skins with the theme rather than tracking the surrounding site chrome.
function Panel(props: { title: string; children: JSX.Element; wide?: boolean }) {
  return (
    <section
      class="p-4"
      classList={{ "pv-gallery__wide": props.wide }}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        "border-radius": "12px",
      }}
    >
      <div class="mb-3 flex items-center gap-2">
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "8px",
            height: "8px",
            "border-radius": "3px",
            background: "var(--color-primary-500)",
            "flex-shrink": "0",
          }}
        />
        <h3
          class="font-jost text-xs font-semibold"
          style={{
            color: "var(--color-text-secondary)",
            "letter-spacing": "0.08em",
            "text-transform": "uppercase",
          }}
        >
          {props.title}
        </h3>
      </div>
      {props.children}
    </section>
  );
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

/**
 * A curated slice of the design system — enough surface to judge a theme at a
 * glance (actions, selection, inputs, semantic feedback, data, a date picker,
 * and the custom Viviana cards) without turning into a swatch dump. Every panel
 * reads its colors from --color-* custom properties, so applying the generated
 * token map as inline properties on the wrapper re-skins the whole subtree
 * WITHOUT touching the surrounding site chrome. The scheme toggle simply swaps
 * which resolved map (dark/light) is handed in.
 */
export function ThemePreviewGallery(props: ThemePreviewGalleryProps) {
  const [switchOn, setSwitchOn] = createSignal(true);
  const [agree, setAgree] = createSignal(true);
  const [text, setText] = createSignal("");
  const [search, setSearch] = createSignal("");
  const [tab, setTab] = createSignal("overview");

  return (
    <div
      data-preview-canvas
      style={`${tokensToInlineStyle(props.tokens)}; background: var(--color-background); color: var(--color-text);${
        props.framed ? "" : " border: 1px solid var(--color-border); border-radius: 16px;"
      }`}
      class="p-5"
    >
      {/* The Provider does double duty here, and BOTH jobs need care:

          1. Scheme machinery. Some S2 style() macro colors flip on the
             color-scheme itself, not our token vars — e.g. the neutral (primary)
             Button's FILL. Pinning the Provider to props.scheme re-anchors those
             to the previewed scheme instead of the site root's.

          2. Winning the token cascade. The Provider stamps `data-color-scheme` on
             its wrapper div, which makes /ui's shipped `[data-color-scheme="light"]`
             block RE-DECLARE the whole --color-* contract on that same div — the
             legacy pink accent included. That block would override the recolored
             vars we set (as inherited inline styles) on the parent canvas, so in
             light mode the studio's indigo accent silently reverted to shipped pink.
             Passing the recolored map as `style` puts it inline on the very div that
             carries data-color-scheme, and an inline custom property outranks any
             attribute-selector rule — so the previewed theme wins in both schemes.
             (Dark needs no such block: its defaults live in :root, which the parent
             canvas's inline vars already outrank via inheritance.)

          The Provider IS the gallery grid: it merges `class` onto that same wrapper
          div, so no extra nesting level — the Panels stay its direct grid children. */}
      <Provider colorScheme={props.scheme} class="pv-gallery" style={props.tokens as JSX.CSSProperties}>
        <Panel title="Buttons">
          <div class="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="negative">Danger</Button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <Button variant="accent" fillStyle="outline">
              Outline
            </Button>
            <Button variant="primary" isDisabled>
              Disabled
            </Button>
          </div>
        </Panel>

        <Panel title="Chips & badges">
          <div class="flex flex-wrap items-center gap-2">
            <Chip text="Design" variant="primary" />
            <Chip text="Themeable" variant="accent" />
            <Chip text="Draft" variant="outline" />
            <Chip text="Starred" variant="primary" icon="★" />
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <Badge count={5} variant="primary" />
            <Badge count={12} variant="accent" />
            <Badge count={3} variant="success" />
            <Badge count={9} variant="warning" />
            <Badge count={1} variant="danger" />
          </div>
        </Panel>

        <Panel title="Inputs">
          <div class="space-y-3">
            <TextField
              label="Email"
              placeholder="you@example.com"
              value={text()}
              onChange={setText}
              description="We never share your email."
            />
            <SearchField
              label="Search"
              placeholder="Search components…"
              value={search()}
              onChange={setSearch}
            />
          </div>
        </Panel>

        <Panel title="Selection">
          <div class="space-y-3">
            <ToggleSwitch isSelected={switchOn()} onChange={setSwitchOn}>
              Email notifications
            </ToggleSwitch>
            <div class="space-y-2">
              <Checkbox isSelected={agree()} onChange={setAgree}>
                Accept terms
              </Checkbox>
              <Checkbox defaultSelected>Subscribe to newsletter</Checkbox>
              <Checkbox isIndeterminate>Partial selection</Checkbox>
            </div>
          </div>
        </Panel>

        <Panel title="Feedback">
          <div class="space-y-2">
            <Alert variant="success" title="Saved">
              Your theme is ready to copy.
            </Alert>
            <Alert variant="warning" title="Heads up">
              Check contrast before shipping.
            </Alert>
            <Alert variant="error" title="Error">
              Something needs attention.
            </Alert>
          </div>
        </Panel>

        <Panel title="Calendar">
          <Calendar aria-label="Pick a date" />
        </Panel>

        <Panel title="Progress">
          <div class="space-y-4">
            <ProgressBar value={72} label="Uploading" />
            <ProgressBar isIndeterminate label="Processing" />
            <Meter value={64} label="Storage used" variant="notice" />
          </div>
        </Panel>

        <Panel title="Tabs">
          <Tabs
            items={TABS}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            selectedKey={tab()}
            onSelectionChange={(k) => setTab(String(k))}
            aria-label="Preview tabs"
          >
            <TabList<(typeof TABS)[number]>>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
            <TabPanel id="overview">
              <p class="p-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                A live snapshot of the design system under your theme.
              </p>
            </TabPanel>
            <TabPanel id="activity">
              <p class="p-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Recent activity would appear here.
              </p>
            </TabPanel>
            <TabPanel id="settings">
              <p class="p-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                Settings would appear here.
              </p>
            </TabPanel>
          </Tabs>
        </Panel>

        <Panel title="Profile">
          <ProfileCard
            username="@viviana_ui"
            bio="Accessible SolidJS components, themeable to the core."
            followers={1234}
            following={567}
            actions={() => (
              <div class="flex gap-2">
                <Button variant="primary">Follow</Button>
                <Button variant="secondary" fillStyle="outline">
                  Message
                </Button>
              </div>
            )}
          />
        </Panel>

        <Panel title="Event">
          <EventCard
            title="Theme Studio launch"
            date="2 days"
            author="viviana"
            attendees={[{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }]}
            attendeeCount={42}
            actions={() => <Button variant="primary">RSVP</Button>}
          />
        </Panel>

        <Panel title="Conversation" wide>
          <ConversationPreview
            user={{ name: "Alice", online: true }}
            lastMessage="Shipping the new theme today."
            timestamp="2m ago"
            unreadCount={3}
          />
          <div class="mt-3 space-y-2 p-3" style={{ background: "var(--color-surface-elevated)" }}>
            <ConversationBubble content="Have you seen the new palette?" sender="other" timestamp="10:30 AM" />
            <ConversationBubble content="Love it — shipping today." sender="user" timestamp="10:31 AM" />
          </div>
        </Panel>
      </Provider>
    </div>
  );
}
