import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Button, Flex } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/viviana-ui/docs/components/button")({
  head: () =>
    seo({
      title: "Viviana UI Button",
      description:
        "Buttons allow users to perform actions with a single click or tap. They are the primary way users interact with your application.",
      path: "/viviana-ui/docs/components/button",
    }),
  component: ButtonPage,
});

function ButtonPage() {
  const [count, setCount] = createSignal(0);

  return (
    <DocPage
      title="Button"
      description="Buttons allow users to perform actions with a single click or tap. They are the primary way users interact with your application."
      importCode={`import { Button } from '@proyecto-viviana/ui';`}
    >
      <Example
        title="Fill"
        description="The register paints fill by default. Primary and accent are the variants the landing already hydrates."
        code={`<Button variant="primary">Primary</Button>
<Button variant="accent">Accent</Button>`}
      >
        <Flex wrap gap={3}>
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
        </Flex>
      </Example>

      <Example
        title="Disabled State"
        description="Disabled buttons cannot be interacted with and appear visually muted."
        code={`<Button isDisabled>Disabled</Button>`}
      >
        <Button variant="primary" isDisabled>
          Disabled
        </Button>
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

      <PropsTable
        props={[
          {
            name: "variant",
            type: "'primary' | 'secondary' | 'accent' | 'negative' | 'warning' | 'success' | 'create'",
            default: "'primary'",
            description: "Visual style variant",
          },
          {
            name: "fillStyle",
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
        ]}
      />

      <AccessibilitySection>
        <li>
          Uses native <code>&lt;button&gt;</code> element for proper semantics
        </li>
        <li>Supports keyboard activation via Enter and Space keys</li>
        <li>Focus ring visible only on keyboard navigation (not mouse clicks)</li>
        <li>
          Disabled state communicated via native <code>disabled</code> semantics
        </li>
        <li>Press events normalize mouse, touch, and keyboard interactions</li>
      </AccessibilitySection>
    </DocPage>
  );
}
