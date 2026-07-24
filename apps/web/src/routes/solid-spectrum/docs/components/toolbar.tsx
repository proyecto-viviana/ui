import { createFileRoute } from "@tanstack/solid-router";
import { Toolbar, ActionButton } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/solid-spectrum/docs/components/toolbar")({
  head: () =>
    seo({
      title: "Toolbar",
      description:
        "Toolbar groups a set of controls — buttons, toggles, and separators — into a single tab stop with arrow-key navigation between the items.",
      path: "/solid-spectrum/docs/components/toolbar",
    }),
  component: ToolbarPage,
});

function ToolbarPage() {
  return (
    <DocPage
      title="Toolbar"
      description="Toolbar groups a set of controls — buttons, toggles, and separators — into a single tab stop with arrow-key navigation between the items. It is the container that gives a cluster of actions coherent keyboard semantics."
      importCode={`import { Toolbar, ActionButton } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Horizontal"
        description="Controls laid out in a row. The toolbar is a single tab stop; arrow keys move between the buttons inside it."
        code={`<Toolbar aria-label="Text formatting">
  <ActionButton aria-label="Bold">B</ActionButton>
  <ActionButton aria-label="Italic">I</ActionButton>
  <ActionButton aria-label="Underline">U</ActionButton>
</Toolbar>`}
      >
        <Toolbar aria-label="Text formatting">
          <ActionButton aria-label="Bold">B</ActionButton>
          <ActionButton aria-label="Italic">I</ActionButton>
          <ActionButton aria-label="Underline">U</ActionButton>
        </Toolbar>
      </Example>

      <Example
        title="Vertical"
        description="Set orientation to 'vertical' to stack the controls; Up and Down arrows then drive navigation."
        code={`<Toolbar aria-label="Drawing tools" orientation="vertical">
  <ActionButton aria-label="Pen">✎</ActionButton>
  <ActionButton aria-label="Brush">🖌</ActionButton>
  <ActionButton aria-label="Eraser">⌫</ActionButton>
</Toolbar>`}
      >
        <Toolbar aria-label="Drawing tools" orientation="vertical">
          <ActionButton aria-label="Pen">✎</ActionButton>
          <ActionButton aria-label="Brush">🖌</ActionButton>
          <ActionButton aria-label="Eraser">⌫</ActionButton>
        </Toolbar>
      </Example>

      <PropsTable
        props={[
          {
            name: "orientation",
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: "Layout direction, which also selects the arrow keys used to navigate",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible name for the toolbar (or use aria-labelledby)",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The controls: ActionButtons, toggles, and separators",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          Renders with a <code>toolbar</code> role and a single tab stop
        </li>
        <li>
          Requires an <code>aria-label</code> or <code>aria-labelledby</code> to name it
        </li>
        <li>
          Left/Right arrows navigate a horizontal toolbar; Up/Down a vertical one, per{" "}
          <code>orientation</code>
        </li>
        <li>Tab moves focus out of the toolbar to the next control on the page</li>
        <li>Disabled controls are skipped during arrow navigation</li>
      </AccessibilitySection>
    </DocPage>
  );
}
