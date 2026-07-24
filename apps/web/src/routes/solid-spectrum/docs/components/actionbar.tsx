import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { ActionBar, ActionBarContainer, ActionButton } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/actionbar")({
  component: ActionBarPage,
});

function ActionBarPage() {
  const [count, setCount] = createSignal(2);

  return (
    <DocPage
      title="ActionBar"
      description="ActionBar surfaces bulk actions for a selection inside a collection. It sits in an ActionBarContainer alongside the collection, showing the number of selected items and the actions that apply to them, and clears the selection on demand."
      importCode={`import {
  ActionBar,
  ActionBarContainer,
  ActionButton
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Selection actions"
        description="The container overlays the ActionBar once items are selected. It reports the count and exposes an onClearSelection handler wired to the clear affordance."
        code={`<ActionBarContainer>
  {/* your collection */}
  <ActionBar
    selectedItemCount={count()}
    onClearSelection={() => setCount(0)}
  >
    <ActionButton>Edit</ActionButton>
    <ActionButton>Duplicate</ActionButton>
    <ActionButton>Delete</ActionButton>
  </ActionBar>
</ActionBarContainer>`}
      >
        <div style={{ "max-width": "36rem" }}>
          <ActionBarContainer>
            <Flex direction="column" gap={2} style={{ padding: "12px 0" }}>
              <span class={typeRoles.body}>Project Aurora</span>
              <span class={typeRoles.body}>Project Borealis</span>
              <span class={typeRoles.body}>Project Cascade</span>
            </Flex>
            <ActionBar selectedItemCount={count()} onClearSelection={() => setCount(0)}>
              <ActionButton>Edit</ActionButton>
              <ActionButton>Duplicate</ActionButton>
              <ActionButton>Delete</ActionButton>
            </ActionBar>
          </ActionBarContainer>
          <button
            type="button"
            class={typeRoles.meta}
            style={{ "margin-top": "8px", cursor: "pointer" }}
            onClick={() => setCount((c) => (c > 0 ? 0 : 2))}
          >
            Toggle selection ({count()} selected)
          </button>
        </div>
      </Example>

      <h2>ActionBarContainer Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "The collection and the ActionBar it applies to",
          },
        ]}
      />

      <h2>ActionBar Props</h2>
      <PropsTable
        props={[
          {
            name: "selectedItemCount",
            type: "number | 'all'",
            description: "How many items are selected; the bar is hidden when 0",
          },
          {
            name: "onClearSelection",
            type: "() => void",
            description: "Handler for the clear-selection affordance",
          },
          {
            name: "isEmphasized",
            type: "boolean",
            default: "false",
            description: "Whether the bar uses the emphasized (accent) treatment",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "ActionButton elements representing the bulk actions",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          The bar exposes a <code>toolbar</code> role grouping its actions
        </li>
        <li>The selected-item count is announced when the bar appears</li>
        <li>Escape triggers onClearSelection and returns focus to the collection</li>
        <li>Arrow keys move between the actions with a roving tabindex</li>
        <li>The clear affordance is a labelled button reachable by keyboard</li>
      </AccessibilitySection>
    </DocPage>
  );
}
