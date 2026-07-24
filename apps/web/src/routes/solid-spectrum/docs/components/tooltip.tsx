import { createFileRoute } from "@tanstack/solid-router";
import { Tooltip, TooltipTrigger, ActionButton } from "@proyecto-viviana/solid-spectrum";
import { Flex } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/solid-spectrum/docs/components/tooltip")({
  head: () =>
    seo({
      title: "Tooltip",
      description:
        "Tooltip shows a short, contextual description of a control on hover or keyboard focus.",
      path: "/solid-spectrum/docs/components/tooltip",
    }),
  component: TooltipPage,
});

function TooltipPage() {
  return (
    <DocPage
      title="Tooltip"
      description="Tooltip shows a short, contextual description of a control on hover or keyboard focus. It is paired with its trigger through TooltipTrigger, which manages the warmup delay, positioning, and dismissal."
      importCode={`import {
  Tooltip,
  TooltipTrigger,
  ActionButton
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic"
        description="Wrap a focusable trigger and a Tooltip in a TooltipTrigger. The tooltip appears on hover after a short delay, and immediately on keyboard focus."
        code={`<TooltipTrigger>
  <ActionButton aria-label="Edit">✎</ActionButton>
  <Tooltip>Edit</Tooltip>
</TooltipTrigger>`}
      >
        <TooltipTrigger>
          <ActionButton aria-label="Edit">✎</ActionButton>
          <Tooltip>Edit</Tooltip>
        </TooltipTrigger>
      </Example>

      <Example
        title="Placement"
        description="Set placement on the trigger to control which side the tooltip prefers; it flips automatically when there is not enough room."
        code={`<TooltipTrigger placement="bottom">
  <ActionButton aria-label="Download">↓</ActionButton>
  <Tooltip>Download</Tooltip>
</TooltipTrigger>`}
      >
        <Flex gap={4}>
          <TooltipTrigger placement="top">
            <ActionButton aria-label="Copy">⧉</ActionButton>
            <Tooltip>Copy (top)</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger placement="bottom">
            <ActionButton aria-label="Download">↓</ActionButton>
            <Tooltip>Download (bottom)</Tooltip>
          </TooltipTrigger>
        </Flex>
      </Example>

      <h2>TooltipTrigger Props</h2>
      <PropsTable
        props={[
          {
            name: "placement",
            type: "'top' | 'bottom' | 'start' | 'end' | 'left' | 'right'",
            default: "'top'",
            description: "Preferred side of the trigger to render on; flips when space is tight",
          },
          {
            name: "delay",
            type: "number",
            default: "1500",
            description: "Warmup delay in milliseconds before the tooltip appears on hover",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the tooltip is suppressed entirely",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The trigger element followed by a Tooltip",
          },
        ]}
      />

      <h2>Tooltip Props</h2>
      <PropsTable
        props={[
          { name: "children", type: "JSX.Element", description: "The tooltip's text content" },
        ]}
      />

      <AccessibilitySection>
        <li>
          The tooltip renders with <code>role="tooltip"</code>
        </li>
        <li>
          The trigger references it via <code>aria-describedby</code> while it is open
        </li>
        <li>Focusing the trigger with the keyboard shows the tooltip immediately, no delay</li>
        <li>Escape dismisses the tooltip while keeping focus on the trigger</li>
        <li>Only one tooltip is visible at a time across the app</li>
      </AccessibilitySection>
    </DocPage>
  );
}
