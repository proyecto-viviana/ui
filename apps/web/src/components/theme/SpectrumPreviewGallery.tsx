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
  Provider,
} from "@proyecto-viviana/solid-spectrum";
import { FONT_SANS } from "@/components/docs";
import "./studio.css";

// Same theme-neutral illustrative data-URIs the viviana-ui gallery uses, so the
// Card/Avatar previews render without a network fetch.
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
  { title: "Palette", desc: "Blue · Gray", status: "positive" as const, label: "Synced" },
  { title: "Typography", desc: "Adobe Clean", status: "notice" as const, label: "Review" },
  { title: "Spacing", desc: "S2 scale", status: "neutral" as const, label: "Draft" },
];

const STATUSES = [
  { variant: "informative" as const, label: "Informative" },
  { variant: "positive" as const, label: "Online" },
  { variant: "notice" as const, label: "Pending" },
  { variant: "negative" as const, label: "Offline" },
  { variant: "neutral" as const, label: "Idle" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

// The Spectrum register paints from a FIXED palette (its own S2 tokens, resolved
// by the Provider's color-scheme), so — unlike the viviana-ui gallery — no
// --color-* token map is recolored here. The chrome around the components (panel
// surfaces, borders, labels) is app furniture, not a Spectrum component, so it
// picks neutral values off the previewed scheme to sit quietly behind the S2 look.
function chromeFor(scheme: "dark" | "light") {
  return scheme === "dark"
    ? {
        canvas: "#131313",
        surface: "#1d1d1d",
        surfaceElevated: "#242424",
        border: "#393939",
        text: "#f8f8f8",
        textSecondary: "#c8c8c8",
        accent: "#5aa3f0",
      }
    : {
        canvas: "#ffffff",
        surface: "#fafafa",
        surfaceElevated: "#f4f4f4",
        border: "#e1e1e1",
        text: "#1a1a1a",
        textSecondary: "#4b4b4b",
        accent: "#2680eb",
      };
}

export interface SpectrumPreviewGalleryProps {
  scheme: "dark" | "light";
  /** Rendered inside a device frame that owns the border/radius — drop our own. */
  framed?: boolean;
}

// A titled sub-panel, mirroring the viviana-ui gallery's Panel so both registers
// read at a glance inside the same device frame. Colors come from the scheme
// chrome (not S2 tokens) so the container stays neutral behind the components.
function Panel(props: {
  title: string;
  children: JSX.Element;
  chrome: ReturnType<typeof chromeFor>;
  wide?: boolean;
}) {
  return (
    <section
      classList={{ "pv-gallery__wide": props.wide }}
      style={{
        padding: "16px",
        background: props.chrome.surface,
        border: `1px solid ${props.chrome.border}`,
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
            background: props.chrome.accent,
            "flex-shrink": "0",
          }}
        />
        <h3
          style={{
            "font-family": FONT_SANS,
            "font-size": "11px",
            "font-weight": "600",
            "letter-spacing": "0.06em",
            color: props.chrome.textSecondary,
            "text-transform": "uppercase",
            margin: "0",
          }}
        >
          {props.title}
        </h3>
      </Flex>
      {props.children}
    </section>
  );
}

/**
 * The solid-spectrum peer of {@link ThemePreviewGallery}: the same curated slice
 * of the design system, rendered from `@proyecto-viviana/solid-spectrum` so the
 * Theme Studio can flip its live preview between the two styled registers. The S2
 * register is not knob-driven — it wears Spectrum's own palette — so this takes
 * only a scheme, and the Provider (mandatory: it declares the color-scheme atoms
 * the downlevelled light-dark() fills need) simply resolves that scheme.
 */
export function SpectrumPreviewGallery(props: SpectrumPreviewGalleryProps) {
  const [switchOn, setSwitchOn] = createSignal(true);
  const [agree, setAgree] = createSignal(true);
  const [text, setText] = createSignal("");
  const [search, setSearch] = createSignal("");
  const [tab, setTab] = createSignal("overview");
  const chrome = () => chromeFor(props.scheme);

  const bodyNote: JSX.CSSProperties = { padding: "8px", "font-size": "13px" };

  return (
    <div
      style={{
        background: chrome().canvas,
        color: chrome().text,
        "font-family": FONT_SANS,
        ...(props.framed
          ? {}
          : { border: `1px solid ${chrome().border}`, "border-radius": "16px" }),
        padding: "20px",
      }}
    >
      <Provider colorScheme={props.scheme}>
        <div class="pv-gallery">
          <Panel title="Buttons" chrome={chrome()}>
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

          <Panel title="Tags & badges" chrome={chrome()}>
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

          <Panel title="Inputs" chrome={chrome()}>
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

          <Panel title="Selection" chrome={chrome()}>
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

          <Panel title="Feedback" chrome={chrome()}>
            <Flex direction="column" gap={2}>
              <InlineAlert variant="positive">
                <Heading>Saved</Heading>
                <Content>Your changes are safe.</Content>
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

          <Panel title="Calendar" chrome={chrome()}>
            <Calendar aria-label="Pick a date" />
          </Panel>

          <Panel title="Progress" chrome={chrome()}>
            <Flex direction="column" gap={4}>
              <ProgressBar value={72} label="Uploading" />
              <ProgressBar isIndeterminate label="Processing" />
              <Meter value={64} label="Storage used" variant="notice" />
            </Flex>
          </Panel>

          <Panel title="Tabs" chrome={chrome()}>
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
                <p style={{ ...bodyNote, color: chrome().textSecondary }}>
                  A live snapshot of the Spectrum register.
                </p>
              </TabPanel>
              <TabPanel id="activity">
                <p style={{ ...bodyNote, color: chrome().textSecondary }}>
                  Recent activity would appear here.
                </p>
              </TabPanel>
              <TabPanel id="settings">
                <p style={{ ...bodyNote, color: chrome().textSecondary }}>
                  Settings would appear here.
                </p>
              </TabPanel>
            </Tabs>
          </Panel>

          <Panel title="Profile" chrome={chrome()}>
            <UserCard id="profile" size="M" textValue="Solid Spectrum" UNSAFE_style={{ width: "100%" }}>
              <Avatar src={AVATAR_IMAGE} alt="" />
              <Content>
                <Text slot="title">@solid_spectrum</Text>
                <Text slot="description">Adobe Spectrum 2, ported to SolidJS.</Text>
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

          <Panel title="Status" chrome={chrome()}>
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

          <Panel title="Cards" chrome={chrome()} wide>
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
        </div>
      </Provider>
    </div>
  );
}
