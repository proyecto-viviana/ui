/* Panel 05 — Status & Progress. Live signals: pulse dots, alerts, toasts,
   dithered progress. Follows the buttons.tsx exemplar's structure and voice. */
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import {
  StatusLight,
  InlineAlert,
  Heading,
  Content,
  Text,
  typeRoles,
  ToastQueue,
  ToastContainer,
  ProgressBar,
  ProgressCircle,
  Meter,
  PixelMeter,
  Skeleton,
  NotificationBadge,
  Button,
  ToggleButton,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/status")({
  head: () => panelSeo("status"),
  component: Page,
});

const STATUS_LIGHT_VARIANTS = [
  "informative",
  "positive",
  "notice",
  "negative",
  "metric",
  "neutral",
] as const;
const INLINE_ALERT_VARIANTS = ["informative", "positive", "notice", "negative", "neutral"] as const;

function Page() {
  const def = panelBySlug("status")!;
  const [isLoaded, setIsLoaded] = createSignal(false);

  return (
    <Panel def={def}>
      <Demo label="StatusLight · semantic + register variants — positive is a cohesive green">
        <Row>
          <For each={STATUS_LIGHT_VARIANTS}>
            {(variant) => (
              <StatusLight variant={variant}>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </StatusLight>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="StatusLight · sizes">
        <Row>
          <StatusLight variant="informative" size="S">
            Small
          </StatusLight>
          <StatusLight variant="informative" size="M">
            Medium
          </StatusLight>
          <StatusLight variant="informative" size="L">
            Large
          </StatusLight>
          <StatusLight variant="informative" size="XL">
            Extra large
          </StatusLight>
        </Row>
      </Demo>

      <Demo label="InlineAlert · semantic variants — positive is a cohesive green">
        <Row>
          <For each={INLINE_ALERT_VARIANTS}>
            {(variant) => (
              <InlineAlert variant={variant}>
                <Heading>{variant.charAt(0).toUpperCase() + variant.slice(1)}</Heading>
                <Content>Non-modal feedback tied to the surface it describes.</Content>
              </InlineAlert>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="InlineAlert · fill styles">
        <Row>
          <InlineAlert variant="informative" fillStyle="border">
            <Heading>Border</Heading>
            <Content>Edge only, glass card underneath.</Content>
          </InlineAlert>
          <InlineAlert variant="notice" fillStyle="subtleFill">
            <Heading>Subtle fill</Heading>
            <Content>Tinted surface, no edge.</Content>
          </InlineAlert>
          <InlineAlert variant="negative" fillStyle="boldFill">
            <Heading>Bold fill</Heading>
            <Content>Saturated background, white ink.</Content>
          </InlineAlert>
        </Row>
      </Demo>

      <Demo label="Toast · queue — the status trio (negative / warning / success) plus info & neutral">
        <Row>
          <Button variant="secondary" onPress={() => ToastQueue.neutral("Queued for review")}>
            Neutral
          </Button>
          <Button variant="accent" onPress={() => ToastQueue.info("Sync started")}>
            Info
          </Button>
          <Button variant="negative" onPress={() => ToastQueue.negative("Sync failed")}>
            Negative
          </Button>
          <Button variant="warning" onPress={() => ToastQueue.notice("Sync running low on space")}>
            Warning
          </Button>
          <Button variant="success" onPress={() => ToastQueue.positive("Sync complete")}>
            Success
          </Button>
        </Row>
        <ToastContainer placement="bottom end" />
      </Demo>

      <Demo label="ProgressBar · determinate">
        <Row>
          <ProgressBar label="Build" value={25} />
          <ProgressBar label="Build" value={68} />
          <ProgressBar label="Build" value={100} />
        </Row>
      </Demo>

      <Demo label="ProgressBar · indeterminate">
        <Row>
          <ProgressBar label="Syncing" isIndeterminate />
        </Row>
      </Demo>

      <Demo label="ProgressBar · pending — the XP bar's dithered in-flight segment">
        <Row>
          <ProgressBar
            label="Level 12"
            valueLabel="2,840 / 3,200 XP"
            value={84}
            pendingValue={90}
          />
        </Row>
      </Demo>

      <Demo label="ProgressBar · bracket — the same value as a mono readout">
        <Row>
          <ProgressBar label="Chapter 3" value={40} trackStyle="bracket" />
          <ProgressBar label="Chapter 4" value={90} trackStyle="bracket" />
        </Row>
      </Demo>

      <Demo label="ProgressBar · segments — a run cut into uneven chapters">
        <Row>
          <ProgressBar label="Course" value={45} segments={[3, 1, 2]} />
          <ProgressBar
            label="Session"
            valueLabel="live"
            value={62}
            pendingValue={72}
            segments={[2, 1, 1, 3]}
          />
        </Row>
      </Demo>

      <Demo label="ProgressCircle · determinate">
        <Row>
          <ProgressCircle aria-label="Loading" value={25} size="S" />
          <ProgressCircle aria-label="Loading" value={68} size="M" />
          <ProgressCircle aria-label="Loading" value={100} size="L" />
        </Row>
      </Demo>

      <Demo label="ProgressCircle · indeterminate">
        <Row>
          <ProgressCircle aria-label="Loading" isIndeterminate />
        </Row>
      </Demo>

      <Demo label="ProgressCircle · register ring — quantized blocks, centered readout">
        <Row>
          <ProgressCircle aria-label="Focus blocks: 3 of 5" value={60} size="L">
            <span class={typeRoles.headline}>3/5</span>
            <span class={typeRoles.micro} style={{ color: "var(--text-secondary)" }}>
              FOCUS
            </span>
          </ProgressCircle>
        </Row>
      </Demo>

      <Demo label="Meter · segments — the wells' ▮▮▮▯▯ capacity form">
        {/* The register draws these inline — `focus [▮▮▮▯▯] 3/5` — so the well
            form is the side label position. */}
        <Row>
          <Meter
            label="Focus"
            variant="informative"
            labelPosition="side"
            segments={5}
            value={3}
            maxValue={5}
            valueLabel="3/5"
          />
          <Meter
            label="Streak"
            variant="notice"
            labelPosition="side"
            segments={5}
            value={4}
            maxValue={5}
            valueLabel="4/5"
          />
          <Meter
            label="Memory"
            variant="negative"
            labelPosition="side"
            segments={5}
            value={1}
            maxValue={5}
            valueLabel="1/5"
          />
        </Row>
      </Demo>

      <Demo label="PixelMeter · the three pixel forms — streak row, ring, activity map">
        {/* One fill rule in all three: lit cells, a dithered leading edge at the
            boundary, hairline for the rest. `grid` takes four levels so the
            trailing week fades instead of stopping flat. */}
        <Row>
          <PixelMeter label="Streak" value={9} maxValue={14} channel="signal" />
          <PixelMeter shape="ring" label="12/16" value={12} channel="metric" />
        </Row>
        <Row>
          <PixelMeter shape="grid" label="Activity" value={120} levels={4} />
        </Row>
      </Demo>

      <Demo label="Meter · semantic variants — positive is a cohesive green">
        <Row>
          <Meter label="Disk" variant="informative" value={35} />
          <Meter label="Uptime" variant="positive" value={62} />
          <Meter label="Memory" variant="notice" value={78} />
          <Meter label="CPU" variant="negative" value={96} />
          <Meter label="Latency" variant="metric" value={48} />
        </Row>
      </Demo>

      <Demo label="Skeleton · loading toggle">
        <Row>
          <ToggleButton onChange={(isSelected: boolean) => setIsLoaded(isSelected)}>
            Loaded
          </ToggleButton>
          <Skeleton isLoading={!isLoaded()}>
            <Text>Uplink established</Text>
          </Skeleton>
        </Row>
      </Demo>

      <Demo label="NotificationBadge · values">
        <Row>
          <NotificationBadge />
          <NotificationBadge value={3} />
          <NotificationBadge value={42} />
          <NotificationBadge value={128} />
        </Row>
      </Demo>
    </Panel>
  );
}
