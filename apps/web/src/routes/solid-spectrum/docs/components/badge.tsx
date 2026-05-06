import { createFileRoute } from "@tanstack/solid-router";
import { Badge, Button } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

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
        <div class="flex flex-wrap items-center gap-6">
          <div class="flex flex-col items-center gap-2">
            <Badge count={5} variant="primary" />
            <span class="text-xs text-primary-400">primary</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Badge count={12} variant="accent" />
            <span class="text-xs text-primary-400">accent</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Badge count={3} variant="success" />
            <span class="text-xs text-primary-400">success</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Badge count={99} variant="warning" />
            <span class="text-xs text-primary-400">warning</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Badge count={1} variant="danger" />
            <span class="text-xs text-primary-400">danger</span>
          </div>
        </div>
      </Example>

      <Example
        title="Typical Usage"
        description="Badges are typically positioned relative to another element."
        code={`<div class="relative inline-block">
  <Button variant="secondary">Notifications</Button>
  <Badge count={7} variant="danger" class="absolute -top-2 -right-2" />
</div>`}
      >
        <div class="flex flex-wrap gap-8 items-center">
          <div class="relative inline-block">
            <Button variant="secondary">Messages</Button>
            <span class="absolute -top-2 -right-2">
              <Badge count={7} variant="danger" />
            </span>
          </div>
          <div class="relative inline-block">
            <Button variant="secondary">Updates</Button>
            <span class="absolute -top-2 -right-2">
              <Badge count={24} variant="accent" />
            </span>
          </div>
        </div>
      </Example>

      <Example
        title="Large Counts"
        description="Counts over 99 display as '99+'."
        code={`<Badge count={100} variant="primary" />
<Badge count={999} variant="danger" />`}
      >
        <div class="flex gap-6">
          <Badge count={100} variant="primary" />
          <Badge count={999} variant="danger" />
        </div>
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
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Use <code>aria-label</code> on the parent container to describe the badge count
          </li>
          <li>
            Combine with <code>aria-live</code> regions for dynamic count updates
          </li>
          <li>
            Example: <code>&lt;button aria-label="Notifications, 7 unread"&gt;</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
