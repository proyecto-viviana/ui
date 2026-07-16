import { createSignal, For, type JSX } from "solid-js";
import {
  Button,
  Badge,
  Alert,
  Checkbox,
  ToggleSwitch,
  TextField,
  SearchField,
  TextArea,
  ProgressBar,
  Meter,
  Separator,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Breadcrumbs,
  BreadcrumbItem,
  Calendar,
  ListView,
  ListViewItem,
  ColorSwatch,
} from "@proyecto-viviana/ui";
import { parseColor } from "@proyecto-viviana/ui/ColorSwatch";
import { Chip } from "@proyecto-viviana/ui/Chip";
import { ProfileCard } from "@proyecto-viviana/ui/ProfileCard";
import { EventCard } from "@proyecto-viviana/ui/EventCard";
import { CalendarCard } from "@proyecto-viviana/ui/CalendarCard";
import { ProjectCard } from "@proyecto-viviana/ui/ProjectCard";
import { ConversationBubble, ConversationPreview } from "@proyecto-viviana/ui/Conversation";
import { TimelineItem } from "@proyecto-viviana/ui/TimelineItem";
import { Logo } from "@proyecto-viviana/ui/Logo";
import { type TokenMap } from "@/utils/themeBase";
import { tokensToInlineStyle } from "@/utils/themeGen";
import "./studio.css";

export interface ThemePreviewGalleryProps {
  /** Fully-resolved --color-* map for the scheme being previewed. */
  tokens: TokenMap;
  scheme: "dark" | "light";
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

const CRUMBS = [
  { id: "home", label: "Home", href: "#" },
  { id: "library", label: "Library", href: "#" },
  { id: "theme", label: "Theme" },
];

const LIST_ITEMS = [
  { id: "a", title: "Accessible by default" },
  { id: "b", title: "Certified contrast" },
  { id: "c", title: "Themeable tokens" },
];

const SWATCH_TOKENS = [
  "--color-primary",
  "--color-primary-500",
  "--color-accent",
  "--color-success",
  "--color-warning",
  "--color-danger",
] as const;

/**
 * Everything here reads its colors from --color-* custom properties, so applying
 * the generated token map as inline properties on the wrapper re-skins the whole
 * subtree WITHOUT touching the surrounding site chrome. The scheme toggle simply
 * swaps which resolved map (dark/light) is handed in.
 */
export function ThemePreviewGallery(props: ThemePreviewGalleryProps) {
  const [switchOn, setSwitchOn] = createSignal(true);
  const [agree, setAgree] = createSignal(true);
  const [text, setText] = createSignal("");
  const [search, setSearch] = createSignal("");
  const [tab, setTab] = createSignal("overview");

  const swatch = (token: string) => {
    const value = props.tokens[token];
    try {
      return parseColor(value);
    } catch {
      return parseColor("#000000");
    }
  };

  return (
    <div
      data-preview-canvas
      style={`${tokensToInlineStyle(props.tokens)}; background: var(--color-background); color: var(--color-text); border: 1px solid var(--color-border); border-radius: 16px;`}
      class="p-5"
    >
      <div class="pv-gallery">
        <Panel title="Buttons">
          <div class="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="negative">Danger</Button>
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <Button variant="primary" fillStyle="outline">
              Outline
            </Button>
            <Button variant="accent" fillStyle="outline">
              Outline
            </Button>
            <Button variant="primary" isDisabled>
              Disabled
            </Button>
          </div>
        </Panel>

        <Panel title="Chips & Badges">
          <div class="flex flex-wrap items-center gap-2">
            <Chip text="Primary" variant="primary" />
            <Chip text="Accent" variant="accent" />
            <Chip text="Outline" variant="outline" />
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
            <SearchField label="Search" placeholder="Search components…" value={search()} onChange={setSearch} />
            <TextArea label="Notes" placeholder="A few words…" />
          </div>
        </Panel>

        <Panel title="Toggles">
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

        <Panel title="Progress">
          <div class="space-y-4">
            <ProgressBar value={72} label="Uploading" />
            <ProgressBar isIndeterminate label="Processing" />
            <Meter value={64} label="Storage used" variant="notice" />
          </div>
        </Panel>

        <Panel title="Navigation" wide>
          <Breadcrumbs items={CRUMBS}>
            {(crumb: (typeof CRUMBS)[number]) => (
              <BreadcrumbItem id={crumb.id} href={crumb.href}>
                {crumb.label}
              </BreadcrumbItem>
            )}
          </Breadcrumbs>
          <Separator />
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

        <Panel title="List">
          <ListView
            aria-label="Highlights"
            items={LIST_ITEMS}
            getKey={(item) => item.id}
            getTextValue={(item) => item.title}
            selectionMode="single"
          >
            {(item: (typeof LIST_ITEMS)[number]) => (
              <ListViewItem id={item.id} textValue={item.title}>
                {item.title}
              </ListViewItem>
            )}
          </ListView>
        </Panel>

        <Panel title="Palette">
          <div class="flex flex-wrap gap-2">
            <For each={SWATCH_TOKENS}>
              {(token) => (
                <div class="flex flex-col items-center gap-1">
                  <ColorSwatch color={swatch(token)} size="L" />
                  <span class="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                    {token.replace("--color-", "")}
                  </span>
                </div>
              )}
            </For>
          </div>
        </Panel>

        <Panel title="Calendar">
          <Calendar aria-label="Pick a date" />
        </Panel>

        <Panel title="Profile" >
          <ProfileCard
            username="@viviana_dev"
            bio="Building accessible SolidJS components."
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
            title="Design system launch party"
            date="2 days"
            author="viviana"
            attendees={[{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }]}
            attendeeCount={42}
            actions={() => <Button variant="primary">RSVP</Button>}
          />
        </Panel>

        <Panel title="Calendar card">
          <CalendarCard
            title="Component Design Workshop"
            tags={["Design", "UI/UX"]}
            followers={[{ name: "Alice" }, { name: "Bob" }]}
            followerCount={15}
          />
        </Panel>

        <Panel title="Project">
          <div class="mx-auto max-w-[200px]">
            <ProjectCard name="@proyecto-viviana/ui" imageSrc="/logo.png" size="sm" />
          </div>
        </Panel>

        <Panel title="Conversation" wide>
          <ConversationPreview
            user={{ name: "Alice", online: true }}
            lastMessage="Have you seen the new theme?"
            timestamp="2m ago"
            unreadCount={3}
          />
          <div class="mt-3 space-y-2 p-3" style={{ background: "var(--color-surface-elevated)" }}>
            <ConversationBubble content="Hi there!" sender="other" timestamp="10:30 AM" />
            <ConversationBubble content="Love the new palette" sender="user" timestamp="10:31 AM" />
          </div>
        </Panel>

        <Panel title="Timeline & brand" wide>
          <div class="flex flex-wrap items-center gap-6">
            <TimelineItem
              type="follow"
              leftUser={{ name: "Alice" }}
              rightUser={{ name: "Bob" }}
              icon={() => <span class="text-2xl">👋</span>}
            />
            <Logo firstWord="PROYECTO" secondWord="VIVIANA" size="lg" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
