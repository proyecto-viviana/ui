import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Button, Link } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/button")({
  component: ButtonPage,
});

function ButtonPage() {
  const [count, setCount] = createSignal(0);

  return (
    <DocPage
      title="Button"
      description="Buttons allow users to perform actions with a single click or tap. They are the primary way users interact with your application."
      importCode={`import { Button, Link } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Variants"
        description="Buttons come in four semantic variants to convey different levels of importance."
        code={`<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="negative">Negative</Button>`}
      >
        <div class="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="negative">Negative</Button>
        </div>
      </Example>

      <Example
        title="Styles"
        description="Each variant can be rendered in fill (default) or outline style."
        code={`<Button variant="primary" buttonStyle="fill">Fill</Button>
<Button variant="primary" buttonStyle="outline">Outline</Button>`}
      >
        <div class="flex flex-wrap gap-3">
          <Button variant="primary" buttonStyle="fill">
            Fill
          </Button>
          <Button variant="primary" buttonStyle="outline">
            Outline
          </Button>
          <Button variant="secondary" buttonStyle="fill">
            Fill
          </Button>
          <Button variant="secondary" buttonStyle="outline">
            Outline
          </Button>
        </div>
      </Example>

      <Example
        title="Disabled State"
        description="Disabled buttons cannot be interacted with and appear visually muted."
        code={`<Button isDisabled>Disabled</Button>`}
      >
        <div class="flex flex-wrap gap-3">
          <Button variant="primary" isDisabled>
            Disabled
          </Button>
          <Button variant="secondary" isDisabled>
            Disabled
          </Button>
        </div>
      </Example>

      <Example
        title="Press Events"
        description="Use onPress for click handling. It normalizes mouse, touch, and keyboard interactions."
        code={`<Button onPress={() => setCount(c => c + 1)}>
  Clicked {count()} times
</Button>`}
      >
        <Button variant="primary" onPress={() => setCount((c) => c + 1)}>
          Clicked {count()} times
        </Button>
      </Example>

      <Example
        title="Navigation"
        description="Use Link for navigation semantics and Button for actions."
        code={`<Link href="https://github.com/proyecto-viviana" target="_blank" rel="noopener noreferrer">
  View on GitHub
</Link>`}
      >
        <Link href="https://github.com/proyecto-viviana" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </Link>
      </Example>

      <PropsTable
        props={[
          {
            name: "variant",
            type: "'primary' | 'secondary' | 'accent' | 'negative'",
            default: "'primary'",
            description: "Visual style variant",
          },
          {
            name: "buttonStyle",
            type: "'fill' | 'outline'",
            default: "'fill'",
            description: "Background fill style",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the button is disabled",
          },
          {
            name: "onPress",
            type: "(e: PressEvent) => void",
            description: "Handler called when the button is pressed",
          },
          {
            name: "onPressStart",
            type: "(e: PressEvent) => void",
            description: "Handler called when press starts",
          },
          {
            name: "onPressEnd",
            type: "(e: PressEvent) => void",
            description: "Handler called when press ends",
          },
          {
            name: "type",
            type: "'button' | 'submit' | 'reset'",
            default: "'button'",
            description: "Button type for forms",
          },
          {
            name: "isPending",
            type: "boolean",
            default: "false",
            description: "Whether the button is in a pending/loading state",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Button content",
          },
          {
            name: "class",
            type: "string",
            description: "Additional CSS classes",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses native <code>&lt;button&gt;</code> element for proper semantics
          </li>
          <li>Supports keyboard activation via Enter and Space keys</li>
          <li>Focus ring visible only on keyboard navigation (not mouse clicks)</li>
          <li>
            Disabled state communicated via native <code>disabled</code> semantics
          </li>
          <li>Press events normalize mouse, touch, and keyboard interactions</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
