import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeader,
  AccordionItemTitle,
  AccordionItemPanel,
} from "@proyecto-viviana/solid-spectrum";
import { typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

const sections = [
  { id: "overview", title: "Overview", body: "What the register sets out to do and where it applies." },
  { id: "tokens", title: "Tokens", body: "The color, type, and radius atoms every component reads from." },
  { id: "components", title: "Components", body: "The panels this showcase walks, one register surface at a time." },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/accordion")({
  component: AccordionPage,
});

function AccordionPage() {
  const [keys, setKeys] = createSignal<Set<string>>(new Set(["overview"]));

  return (
    <DocPage
      title="Accordion"
      description="Accordion groups related sections of collapsible content. It is the styled Spectrum 2 wrapper over DisclosureGroup — each AccordionItem is a Disclosure composed from a header, title, and panel."
      importCode={`import {
  Accordion,
  AccordionItem,
  AccordionItemHeader,
  AccordionItemTitle,
  AccordionItemPanel
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic"
        description="A group of items where one panel starts open. Expanding an item collapses the others unless multiple expansion is allowed."
        code={`<Accordion defaultExpandedKeys={["overview"]}>
  <AccordionItem id="overview">
    <AccordionItemHeader>
      <AccordionItemTitle>Overview</AccordionItemTitle>
    </AccordionItemHeader>
    <AccordionItemPanel>Register goals and scope.</AccordionItemPanel>
  </AccordionItem>
  {/* …more items */}
</Accordion>`}
      >
        <div style={{ "max-width": "32rem" }}>
          <Accordion defaultExpandedKeys={["overview"]}>
            {sections.map((s) => (
              <AccordionItem id={s.id}>
                <AccordionItemHeader>
                  <AccordionItemTitle>{s.title}</AccordionItemTitle>
                </AccordionItemHeader>
                <AccordionItemPanel>
                  <span class={typeRoles.body}>{s.body}</span>
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Example>

      <Example
        title="Multiple expanded (controlled)"
        description="Set allowsMultipleExpanded to let several panels stay open at once, and drive the open set from state."
        code={`<Accordion
  allowsMultipleExpanded
  expandedKeys={keys()}
  onExpandedChange={(k) => setKeys(new Set([...k].map(String)))}
>
  {/* AccordionItem list */}
</Accordion>`}
      >
        <div style={{ "max-width": "32rem" }}>
          <Accordion
            allowsMultipleExpanded
            expandedKeys={keys()}
            onExpandedChange={(k) => setKeys(new Set([...k].map(String)))}
          >
            {sections.map((s) => (
              <AccordionItem id={s.id}>
                <AccordionItemHeader>
                  <AccordionItemTitle>{s.title}</AccordionItemTitle>
                </AccordionItemHeader>
                <AccordionItemPanel>
                  <span class={typeRoles.body}>{s.body}</span>
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>
          <p class={typeRoles.meta} style={{ "margin-top": "8px" }}>
            Expanded: {keys().size > 0 ? [...keys()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <h2>Accordion Props</h2>
      <PropsTable
        props={[
          {
            name: "allowsMultipleExpanded",
            type: "boolean",
            default: "false",
            description: "Whether more than one item can be expanded at a time",
          },
          {
            name: "expandedKeys",
            type: "Set<Key>",
            description: "Keys of the currently expanded items (controlled)",
          },
          {
            name: "defaultExpandedKeys",
            type: "Set<Key>",
            description: "Keys of the initially expanded items (uncontrolled)",
          },
          {
            name: "onExpandedChange",
            type: "(keys: Set<Key>) => void",
            description: "Handler called when the expanded set changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether every item in the accordion is disabled",
          },
          { name: "children", type: "JSX.Element", description: "AccordionItem elements" },
        ]}
      />

      <h2>AccordionItem Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the item, used as its expansion key",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether this item is disabled",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "AccordionItemHeader (with AccordionItemTitle) and AccordionItemPanel",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          Each item title renders a <code>button</code> carrying <code>aria-expanded</code>
        </li>
        <li>
          The panel is associated with its trigger via <code>aria-controls</code>
        </li>
        <li>Enter or Space toggles the focused item open and closed</li>
        <li>Up and Down arrows move focus between item headers</li>
        <li>Collapsed panels are removed from the accessibility tree</li>
        <li>Disabled items are skipped in keyboard navigation and marked via ARIA</li>
      </AccessibilitySection>
    </DocPage>
  );
}
