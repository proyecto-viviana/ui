import { createFileRoute } from "@tanstack/solid-router";
import { Separator } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/separator")({
  component: SeparatorPage,
});

function SeparatorPage() {
  return (
    <DocPage
      title="Separator"
      description="A visual divider between groups of content. Supports horizontal and vertical orientations, multiple sizes, and visual variants."
      importCode={`import { Separator } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Horizontal"
        description="The default orientation divides content vertically."
        code={`<p>Content above</p>
<Separator />
<p>Content below</p>`}
      >
        <Flex direction="column" gap={4} class={typeRoles.body}>
          <p>Content above the separator.</p>
          <Separator />
          <p>Content below the separator.</p>
        </Flex>
      </Example>

      <Example
        title="Vertical"
        description="Use orientation='vertical' to divide content horizontally."
        code={`<div class="separator-row">
  <span>Item 1</span>
  <Separator orientation="vertical" />
  <span>Item 2</span>
  <Separator orientation="vertical" />
  <span>Item 3</span>
</div>`}
      >
        <Flex alignItems="center" gap={4} class={typeRoles.body} style={{ height: "32px" }}>
          <span>Item 1</span>
          <Separator orientation="vertical" />
          <span>Item 2</span>
          <Separator orientation="vertical" />
          <span>Item 3</span>
        </Flex>
      </Example>

      <Example
        title="Sizes"
        description="Controls the thickness of the separator line."
        code={`<Separator size="sm" />
<Separator size="md" />
<Separator size="lg" />`}
      >
        <Flex direction="column" gap={4}>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "24px" }}>sm</span>
            <div style={{ flex: "1" }}><Separator size="sm" /></div>
          </Flex>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "24px" }}>md</span>
            <div style={{ flex: "1" }}><Separator size="md" /></div>
          </Flex>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "24px" }}>lg</span>
            <div style={{ flex: "1" }}><Separator size="lg" /></div>
          </Flex>
        </Flex>
      </Example>

      <Example
        title="Variants"
        description="Visual style variants for different emphasis levels."
        code={`<Separator variant="default" />
<Separator variant="subtle" />
<Separator variant="strong" />`}
      >
        <Flex direction="column" gap={4}>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "64px" }}>default</span>
            <div style={{ flex: "1" }}><Separator variant="default" /></div>
          </Flex>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "64px" }}>subtle</span>
            <div style={{ flex: "1" }}><Separator variant="subtle" /></div>
          </Flex>
          <Flex alignItems="center" gap={3}>
            <span class={typeRoles.meta} style={{ width: "64px" }}>strong</span>
            <div style={{ flex: "1" }}><Separator variant="strong" /></div>
          </Flex>
        </Flex>
      </Example>

      <PropsTable
        props={[
          {
            name: "orientation",
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: "Direction of the separator",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            default: "'md'",
            description: "Thickness of the separator line",
          },
          {
            name: "variant",
            type: "'default' | 'subtle' | 'strong'",
            default: "'default'",
            description: "Visual emphasis",
          },
          { name: "class", type: "string", description: "Additional CSS classes" },
        ]}
      />

      <AccessibilitySection>
        <li>
          Uses <code>role="separator"</code> for proper semantics
        </li>
        <li>
          Vertical separators include <code>aria-orientation="vertical"</code>
        </li>
        <li>
          Decorative separators can use <code>aria-hidden="true"</code>
        </li>
      </AccessibilitySection>
    </DocPage>
  );
}
