import { createFileRoute } from "@tanstack/solid-router";
import { Separator } from "@proyecto-viviana/solid-spectrum";
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
        <div class="space-y-4 text-sm text-primary-300">
          <p>Content above the separator.</p>
          <Separator />
          <p>Content below the separator.</p>
        </div>
      </Example>

      <Example
        title="Vertical"
        description="Use orientation='vertical' to divide content horizontally."
        code={`<div class="flex items-center gap-4 h-8">
  <span>Item 1</span>
  <Separator orientation="vertical" />
  <span>Item 2</span>
  <Separator orientation="vertical" />
  <span>Item 3</span>
</div>`}
      >
        <div class="flex items-center gap-4 h-8 text-sm text-primary-200">
          <span>Item 1</span>
          <Separator orientation="vertical" />
          <span>Item 2</span>
          <Separator orientation="vertical" />
          <span>Item 3</span>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Controls the thickness of the separator line."
        code={`<Separator size="sm" />
<Separator size="md" />
<Separator size="lg" />`}
      >
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-6">sm</span>
            <Separator size="sm" class="flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-6">md</span>
            <Separator size="md" class="flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-6">lg</span>
            <Separator size="lg" class="flex-1" />
          </div>
        </div>
      </Example>

      <Example
        title="Variants"
        description="Visual style variants for different emphasis levels."
        code={`<Separator variant="default" />
<Separator variant="subtle" />
<Separator variant="strong" />`}
      >
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-16">default</span>
            <Separator variant="default" class="flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-16">subtle</span>
            <Separator variant="subtle" class="flex-1" />
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs text-primary-400 w-16">strong</span>
            <Separator variant="strong" class="flex-1" />
          </div>
        </div>
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
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="separator"</code> for proper semantics
          </li>
          <li>
            Vertical separators include <code>aria-orientation="vertical"</code>
          </li>
          <li>
            Decorative separators can use <code>aria-hidden="true"</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
