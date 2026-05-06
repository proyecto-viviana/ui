import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Link } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/link")({
  component: LinkPage,
});

function LinkPage() {
  const [lastAction, setLastAction] = createSignal("");

  return (
    <DocPage
      title="Link"
      description="An accessible link component that supports both navigation and press-event patterns. Normalizes mouse, touch, and keyboard interactions."
      importCode={`import { Link } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="Standard navigation link."
        code={`<Link href="https://example.com" target="_blank">External Link</Link>`}
      >
        <div class="flex flex-wrap gap-4">
          <Link href="https://github.com/proyecto-viviana" target="_blank">
            GitHub Repository
          </Link>
        </div>
      </Example>

      <Example
        title="Variants"
        description="Three visual variants for different contexts."
        code={`<Link variant="default">Default</Link>
<Link variant="secondary">Secondary</Link>
<Link variant="subtle">Subtle</Link>`}
      >
        <div
          class="flex flex-wrap gap-4"
          onClick={(e) => {
            const t = (e.target as HTMLElement).textContent;
            if (t) setLastAction(t.trim() + " pressed");
          }}
        >
          <Link variant="primary" onPress={() => setLastAction("Default pressed")}>
            Default
          </Link>
          <Link variant="secondary" onPress={() => setLastAction("Secondary pressed")}>
            Secondary
          </Link>
          <Link variant="subtle" onPress={() => setLastAction("Subtle pressed")}>
            Subtle
          </Link>
          {lastAction() && <span class="text-sm text-primary-400">{lastAction()}</span>}
        </div>
      </Example>

      <Example
        title="With onPress"
        description="Use onPress for client-side navigation or actions without an href."
        code={`<Link onPress={() => console.log('Link pressed')}>
  Client-side Action
</Link>`}
      >
        <Link onPress={() => setLastAction("Action link pressed!")}>Client-side Action</Link>
      </Example>

      <Example
        title="Disabled"
        description="Disabled links cannot be activated."
        code={`<Link isDisabled>Disabled Link</Link>`}
      >
        <div class="flex flex-wrap gap-4">
          <Link isDisabled>Disabled Link</Link>
          <Link href="https://example.com" isDisabled>
            Disabled Href Link
          </Link>
        </div>
      </Example>

      <Example
        title="Current Page"
        description="Mark the current page link for navigation landmarks."
        code={`<Link href="/current" aria-current="page">Current Page</Link>`}
      >
        <nav class="flex gap-4">
          <Link onPress={() => {}}>Home</Link>
          <Link onPress={() => {}} aria-current="page">
            Components
          </Link>
          <Link onPress={() => {}}>Guide</Link>
        </nav>
      </Example>

      <PropsTable
        props={[
          { name: "href", type: "string", description: "URL to navigate to (renders as <a>)" },
          { name: "target", type: "string", description: "Link target (_blank, _self, etc.)" },
          {
            name: "variant",
            type: "'primary' | 'secondary' | 'subtle'",
            default: "'primary'",
            description: "Visual style",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Prevents activation",
          },
          {
            name: "onPress",
            type: "(e: PressEvent) => void",
            description: "Press handler (normalizes mouse/touch/keyboard)",
          },
          { name: "aria-current", type: "string", description: "Marks current page/step/location" },
          { name: "children", type: "JSX.Element", description: "Link content" },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Renders as native <code>&lt;a&gt;</code> when href is provided
          </li>
          <li>Enter key activates links in all cases</li>
          <li>
            Disabled state uses <code>aria-disabled</code> (not HTML disabled, which removes it from
            focus order)
          </li>
          <li>Press events normalized across mouse, touch, and keyboard interactions</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
