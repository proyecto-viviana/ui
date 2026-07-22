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
  ToastQueue,
  ToastContainer,
  ProgressBar,
  ProgressCircle,
  Meter,
  Skeleton,
  NotificationBadge,
  Button,
  ToggleButton,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/status")({
  component: Page,
});

const STATUS_LIGHT_VARIANTS = ["informative", "notice", "negative", "neutral"] as const;
const INLINE_ALERT_VARIANTS = ["informative", "notice", "negative", "neutral"] as const;

function Page() {
  const def = panelBySlug("status")!;
  const [isLoaded, setIsLoaded] = createSignal(false);

  return (
    <Panel def={def}>
      <Demo label="StatusLight · register variants — no green">
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

      <Demo label="InlineAlert · register variants — no green">
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

      <Demo label="Toast · queue — buttons enqueue onto the global toast queue">
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

      <Demo label="Meter · register variants — no green">
        <Row>
          <Meter label="Disk" variant="informative" value={35} />
          <Meter label="Memory" variant="notice" value={78} />
          <Meter label="CPU" variant="negative" value={96} />
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
