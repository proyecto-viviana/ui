import { createFileRoute } from "@tanstack/solid-router";
import { Badge, Button } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

/** Nudges a count badge onto the top-right corner of whatever it is anchored to. */
const corner = { position: "absolute", top: "-8px", right: "-8px" } as const;

export const Route = createFileRoute("/solid-spectrum/docs/components/badge")({
  component: BadgePage,
});

function BadgePage() {
  return (
    <DocPage
      title="Badge"
      description="A small numeric or status indicator, typically shown attached to another element. Used for notification counts, status indicators, and labels."
      importCode={`import { Badge } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Variants"
        description="Five color variants to convey different meanings."
        code={`<Badge count={5} variant="primary" />
<Badge count={12} variant="accent" />
<Badge count={3} variant="success" />
<Badge count={99} variant="warning" />
<Badge count={1} variant="danger" />`}
      >
        <Flex wrap alignItems="center" gap={6}>
          <Flex direction="column" alignItems="center" gap={2}>
            <Badge count={5} variant="primary" />
            <span class={typeRoles.meta}>primary</span>
          </Flex>
          <Flex direction="column" alignItems="center" gap={2}>
            <Badge count={12} variant="accent" />
            <span class={typeRoles.meta}>accent</span>
          </Flex>
          <Flex direction="column" alignItems="center" gap={2}>
            <Badge count={3} variant="success" />
            <span class={typeRoles.meta}>success</span>
          </Flex>
          <Flex direction="column" alignItems="center" gap={2}>
            <Badge count={99} variant="warning" />
            <span class={typeRoles.meta}>warning</span>
          </Flex>
          <Flex direction="column" alignItems="center" gap={2}>
            <Badge count={1} variant="danger" />
            <span class={typeRoles.meta}>danger</span>
          </Flex>
        </Flex>
      </Example>

      <Example
        title="Typical Usage"
        description="Badges are typically positioned relative to another element."
        code={`<div class="badge-anchor">
  <Button variant="secondary">Notifications</Button>
  <Badge count={7} variant="danger" class="badge-corner" />
</div>`}
      >
        <Flex wrap alignItems="center" gap={8}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Button variant="secondary">Messages</Button>
            <span style={corner}>
              <Badge count={7} variant="danger" />
            </span>
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Button variant="secondary">Updates</Button>
            <span style={corner}>
              <Badge count={24} variant="accent" />
            </span>
          </div>
        </Flex>
      </Example>

      <Example
        title="Large Counts"
        description="Counts over 99 display as '99+'."
        code={`<Badge count={100} variant="primary" />
<Badge count={999} variant="danger" />`}
      >
        <Flex gap={6}>
          <Badge count={100} variant="primary" />
          <Badge count={999} variant="danger" />
        </Flex>
      </Example>

      <PropsTable
        props={[
          { name: "count", type: "number", description: "Numeric count to display" },
          {
            name: "variant",
            type: "'primary' | 'accent' | 'success' | 'warning' | 'danger'",
            default: "'primary'",
            description: "Color variant",
          },
          { name: "class", type: "string", description: "Additional CSS classes for positioning" },
        ]}
      />

      <AccessibilitySection>
        <li>
          Use <code>aria-label</code> on the parent container to describe the badge count
        </li>
        <li>
          Combine with <code>aria-live</code> regions for dynamic count updates
        </li>
        <li>
          Example: <code>&lt;button aria-label="Notifications, 7 unread"&gt;</code>
        </li>
      </AccessibilitySection>
    </DocPage>
  );
}
