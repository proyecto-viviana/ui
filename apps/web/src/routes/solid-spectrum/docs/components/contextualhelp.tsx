import { createFileRoute } from "@tanstack/solid-router";
import { ContextualHelp, Heading, Content } from "@proyecto-viviana/solid-spectrum";
import { Flex } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/contextualhelp")({
  component: ContextualHelpPage,
});

function ContextualHelpPage() {
  return (
    <DocPage
      title="ContextualHelp"
      description="ContextualHelp attaches an unobtrusive help or info affordance next to a control. Pressing it opens a small popover with a title and explanatory content — the 'help' variant for guidance, 'info' for supplementary facts."
      importCode={`import {
  ContextualHelp,
  Heading,
  Content
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Variants"
        description="The variant selects the icon and its accessible label. Compose the popover body from a Heading (slot 'title') and Content."
        code={`<ContextualHelp variant="help">
  <Heading slot="title">Need help?</Heading>
  <Content>
    Your workspace name is shown across every panel and in shared links.
  </Content>
</ContextualHelp>`}
      >
        <Flex gap={4} alignItems="center">
          {(["help", "info"] as const).map((variant) => (
            <ContextualHelp variant={variant}>
              <Heading slot="title">{variant === "info" ? "Did you know?" : "Need help?"}</Heading>
              <Content>
                {variant === "info"
                  ? "This value is derived automatically and cannot be edited."
                  : "Your workspace name is shown across every panel and in shared links."}
              </Content>
            </ContextualHelp>
          ))}
        </Flex>
      </Example>

      <h2>ContextualHelp Props</h2>
      <PropsTable
        props={[
          {
            name: "variant",
            type: "'help' | 'info'",
            default: "'help'",
            description: "Selects the trigger icon and its default accessible label",
          },
          {
            name: "size",
            type: "'XS' | 'S'",
            default: "'S'",
            description: "Size of the trigger button",
          },
          {
            name: "placement",
            type: "string",
            default: "'bottom start'",
            description: "Preferred placement of the help popover",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "A Heading with slot='title' and a Content block",
          },
        ]}
      />

      <AccessibilitySection>
        <li>The trigger is a labelled icon button carrying the variant's accessible name</li>
        <li>
          Opening it reveals a <code>dialog</code> named by the <code>Heading slot="title"</code>
        </li>
        <li>Focus moves into the popover on open and returns to the trigger on close</li>
        <li>Escape or an outside click dismisses the popover</li>
        <li>The help affordance does not interrupt the tab order of the control it annotates</li>
      </AccessibilitySection>
    </DocPage>
  );
}
