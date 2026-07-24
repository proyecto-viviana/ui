import { For, createSignal, type JSX } from "solid-js";
import {
  Button,
  Badge,
  InlineAlert,
  Heading,
  Content,
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
  Tag,
  TagGroup,
  UserCard,
  Card,
  CardPreview,
  Image,
  Text,
  Footer,
  StatusLight,
  Avatar,
  Flex,
  typeRoles,
} from "@proyecto-viviana/ui";
import { Provider } from "@proyecto-viviana/ui/Provider";
import { type TokenMap } from "@/utils/themeBase";
import { tokensToInlineStyle } from "@/utils/themeGen";
import "./studio.css";

// Inline, theme-neutral illustrative assets so the Card/Avatar previews render
// without a network fetch (mirrors the certified comparison fixtures, which use
// data-URI SVGs). Kept muted so the previewed --color-* palette stays the focus.
const CARD_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%232c7be5'/%3E%3Cpath d='M0 132 82 74l68 42 62-58 108 96v26H0z' fill='%23d6e9ff' opacity='.9'/%3E%3Ccircle cx='248' cy='48' r='24' fill='%23fff3b0'/%3E%3C/svg%3E";
const AVATAR_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%236b7fd7'/%3E%3Ccircle cx='32' cy='25' r='12' fill='%23fff'/%3E%3Cpath d='M12 60c0-11 9-18 20-18s20 7 20 18z' fill='%23fff'/%3E%3C/svg%3E";

const TAGS = [
  { id: "design", name: "Design" },
  { id: "themeable", name: "Themeable" },
  { id: "draft", name: "Draft" },
  { id: "starred", name: "Starred" },
];

const CARDS = [
  { title: "Palette", desc: "Indigo · Slate", status: "positive" as const, label: "Synced" },
  { title: "Typography", desc: "Geist · Geist Mono", status: "notice" as const, label: "Review" },
  { title: "Spacing", desc: "8px scale", status: "neutral" as const, label: "Draft" },
];

const STATUSES = [
  { variant: "informative" as const, label: "Informative" },
  { variant: "positive" as const, label: "Online" },
  { variant: "notice" as const, label: "Pending" },
  { variant: "negative" as const, label: "Offline" },
  { variant: "neutral" as const, label: "Idle" },
];

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
      classList={{ "pv-gallery__wide": props.wide }}
      style={{
        padding: "16px",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        "border-radius": "12px",
      }}
    >
      <Flex alignItems="center" gap={2} style={{ "margin-bottom": "12px" }}>
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
          class={typeRoles.micro}
          style={{ color: "var(--color-text-secondary)", "text-transform": "uppercase" }}
        >
          {props.title}
        </h3>
      </Flex>
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
 * and the Spectrum-2 card/status ports) without turning into a swatch dump. Only
 * solid-spectrum S2 ports are shown here — no custom Viviana surfaces. Every panel
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
      }; padding: 20px`}
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
          <Flex wrap gap={2}>
            <Button variant="primary">Primary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="negative">Danger</Button>
          </Flex>
          <Flex wrap gap={2} style={{ "margin-top": "8px" }}>
            <Button variant="accent" fillStyle="outline">
              Outline
            </Button>
            <Button variant="primary" isDisabled>
              Disabled
            </Button>
          </Flex>
        </Panel>

        <Panel title="Tags & badges">
          <TagGroup aria-label="Topics" items={TAGS}>
            {(item) => <Tag id={item.id}>{item.name}</Tag>}
          </TagGroup>
          <Flex wrap alignItems="center" gap={3} style={{ "margin-top": "12px" }}>
            <Badge count={5} variant="primary" />
            <Badge count={12} variant="accent" />
            <Badge count={3} variant="success" />
            <Badge count={9} variant="warning" />
            <Badge count={1} variant="danger" />
          </Flex>
        </Panel>

        <Panel title="Inputs">
          <Flex direction="column" gap={3}>
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
          </Flex>
        </Panel>

        <Panel title="Selection">
          <Flex direction="column" gap={3}>
            <ToggleSwitch isSelected={switchOn()} onChange={setSwitchOn}>
              Email notifications
            </ToggleSwitch>
            <Flex direction="column" gap={2}>
              <Checkbox isSelected={agree()} onChange={setAgree}>
                Accept terms
              </Checkbox>
              <Checkbox defaultSelected>Subscribe to newsletter</Checkbox>
              <Checkbox isIndeterminate>Partial selection</Checkbox>
            </Flex>
          </Flex>
        </Panel>

        <Panel title="Feedback">
          <Flex direction="column" gap={2}>
            <InlineAlert variant="positive">
              <Heading>Saved</Heading>
              <Content>Your theme is ready to copy.</Content>
            </InlineAlert>
            <InlineAlert variant="notice">
              <Heading>Heads up</Heading>
              <Content>Check contrast before shipping.</Content>
            </InlineAlert>
            <InlineAlert variant="negative">
              <Heading>Error</Heading>
              <Content>Something needs attention.</Content>
            </InlineAlert>
          </Flex>
        </Panel>

        <Panel title="Calendar">
          <Calendar aria-label="Pick a date" />
        </Panel>

        <Panel title="Progress">
          <Flex direction="column" gap={4}>
            <ProgressBar value={72} label="Uploading" />
            <ProgressBar isIndeterminate label="Processing" />
            <Meter value={64} label="Storage used" variant="notice" />
          </Flex>
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
              <p class={typeRoles.body} style={{ padding: "8px", color: "var(--color-text-secondary)" }}>
                A live snapshot of the design system under your theme.
              </p>
            </TabPanel>
            <TabPanel id="activity">
              <p class={typeRoles.body} style={{ padding: "8px", color: "var(--color-text-secondary)" }}>
                Recent activity would appear here.
              </p>
            </TabPanel>
            <TabPanel id="settings">
              <p class={typeRoles.body} style={{ padding: "8px", color: "var(--color-text-secondary)" }}>
                Settings would appear here.
              </p>
            </TabPanel>
          </Tabs>
        </Panel>

        <Panel title="Profile">
          <UserCard id="profile" size="M" textValue="Viviana UI" UNSAFE_style={{ width: "100%" }}>
            <Avatar src={AVATAR_IMAGE} alt="" />
            <Content>
              <Text slot="title">@viviana_ui</Text>
              <Text slot="description">Accessible SolidJS components, themeable to the core.</Text>
            </Content>
            <Footer>
              <Flex gap={2}>
                <Button variant="primary">Follow</Button>
                <Button variant="secondary" fillStyle="outline">
                  Message
                </Button>
              </Flex>
            </Footer>
          </UserCard>
        </Panel>

        <Panel title="Status">
          <Flex direction="column" gap={2}>
            <For each={STATUSES}>
              {(s) => (
                <StatusLight variant={s.variant} role="status">
                  {s.label}
                </StatusLight>
              )}
            </For>
          </Flex>
        </Panel>

        <Panel title="Cards" wide>
          <Flex wrap gap={4}>
            <For each={CARDS}>
              {(c) => (
                <Card id={c.title} size="M" variant="primary" textValue={c.title} UNSAFE_style={{ width: "220px" }}>
                  <CardPreview>
                    <Image src={CARD_IMAGE} alt="" />
                  </CardPreview>
                  <Content>
                    <Text slot="title">{c.title}</Text>
                    <Text slot="description">{c.desc}</Text>
                  </Content>
                  <Footer>
                    <StatusLight variant={c.status}>{c.label}</StatusLight>
                  </Footer>
                </Card>
              )}
            </For>
          </Flex>
        </Panel>
      </Provider>
    </div>
  );
}
