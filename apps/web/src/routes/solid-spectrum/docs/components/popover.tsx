import { createFileRoute } from "@tanstack/solid-router";
import {
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverFooter,
  Button,
  ActionButton,
} from "@proyecto-viviana/solid-spectrum";
import { Flex } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/popover")({
  component: PopoverPage,
});

function PopoverPage() {
  return (
    <DocPage
      title="Popover"
      description="Popover displays contextual content anchored to a trigger, without leaving the current view. PopoverTrigger pairs a focusable trigger with the Popover, and PopoverHeader / PopoverFooter give it the standard title-and-actions layout."
      importCode={`import {
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverFooter
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Header and footer"
        description="A trigger followed by a Popover. The header takes a title and optional description; the footer holds the actions."
        code={`<PopoverTrigger>
  <Button variant="secondary">Settings</Button>
  <Popover placement="bottom" size="M">
    <PopoverHeader
      title="Notifications"
      description="Choose how you'd like to be reached."
    />
    <PopoverFooter>
      <Button variant="secondary" fillStyle="outline">Cancel</Button>
      <Button variant="accent">Save</Button>
    </PopoverFooter>
  </Popover>
</PopoverTrigger>`}
      >
        <PopoverTrigger>
          <Button variant="secondary">Settings</Button>
          <Popover placement="bottom" size="M">
            <PopoverHeader
              title="Notifications"
              description="Choose how you'd like to be reached."
            />
            <PopoverFooter>
              <Button variant="secondary" fillStyle="outline">
                Cancel
              </Button>
              <Button variant="accent">Save</Button>
            </PopoverFooter>
          </Popover>
        </PopoverTrigger>
      </Example>

      <Example
        title="Sizes"
        description="The size prop scales the popover's width. Each of S, M, and L widens the surface a step."
        code={`<Popover size="S">…</Popover>
<Popover size="M">…</Popover>
<Popover size="L">…</Popover>`}
      >
        <Flex gap={4}>
          {(["S", "M", "L"] as const).map((size) => (
            <PopoverTrigger>
              <ActionButton>{`Popover ${size}`}</ActionButton>
              <Popover size={size}>
                <PopoverHeader title={`Size ${size}`} description="Width scales with size." />
              </Popover>
            </PopoverTrigger>
          ))}
        </Flex>
      </Example>

      <h2>PopoverTrigger Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "The trigger element followed by a Popover",
          },
        ]}
      />

      <h2>Popover Props</h2>
      <PropsTable
        props={[
          {
            name: "placement",
            type: "'top' | 'bottom' | 'start' | 'end' | …",
            default: "'bottom'",
            description: "Preferred side of the trigger; flips when space is tight",
          },
          {
            name: "size",
            type: "'S' | 'M' | 'L'",
            default: "'M'",
            description: "Width of the popover surface",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The popover body, usually a PopoverHeader and PopoverFooter",
          },
        ]}
      />

      <h2>PopoverHeader Props</h2>
      <PropsTable
        props={[
          { name: "title", type: "string", description: "The popover's heading" },
          {
            name: "description",
            type: "string",
            description: "Optional supporting text under the title",
          },
        ]}
      />

      <h2>PopoverFooter Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "Footer content, typically buttons",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          The trigger exposes <code>aria-haspopup</code> and <code>aria-expanded</code>
        </li>
        <li>
          The popover renders with <code>role="dialog"</code> and moves focus inside on open
        </li>
        <li>Focus is trapped within the popover while it is open</li>
        <li>Escape or an outside click dismisses it and restores focus to the trigger</li>
        <li>The header title names the dialog for assistive technology</li>
      </AccessibilitySection>
    </DocPage>
  );
}
