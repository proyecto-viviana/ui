import { createFileRoute } from "@tanstack/solid-router";
import { ActionGroup } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

const alignment = [
  { id: "left", label: "Left" },
  { id: "center", label: "Center" },
  { id: "right", label: "Right" },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/actiongroup")({
  component: ActionGroupPage,
});

function ActionGroupPage() {
  return (
    <DocPage
      title="ActionGroup"
      description="ActionGroup clusters a set of related actions into a single segmented control. It can be presented as plain buttons or, with a selectionMode, as a single- or multiple-select toggle group driven by an items collection."
      importCode={`import { ActionGroup } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Single selection"
        description="With selectionMode 'single' the group behaves like a segmented toggle — exactly one item is pressed at a time."
        code={`<ActionGroup
  aria-label="Text alignment"
  selectionMode="single"
  defaultSelectedKeys={["left"]}
  items={[
    { id: "left", label: "Left" },
    { id: "center", label: "Center" },
    { id: "right", label: "Right" },
  ]}
/>`}
      >
        <ActionGroup
          aria-label="Text alignment"
          selectionMode="single"
          defaultSelectedKeys={["left"]}
          items={alignment}
        />
      </Example>

      <Example
        title="Multiple selection"
        description="selectionMode 'multiple' lets any number of items be toggled on together."
        code={`<ActionGroup
  aria-label="Card decorations"
  selectionMode="multiple"
  defaultSelectedKeys={["center"]}
  items={items}
/>`}
      >
        <ActionGroup
          aria-label="Card decorations"
          selectionMode="multiple"
          defaultSelectedKeys={["center"]}
          items={alignment}
        />
      </Example>

      <Example
        title="Vertical and disabled"
        description="orientation stacks the items; isDisabled disables the whole group."
        code={`<ActionGroup orientation="vertical" items={items} />
<ActionGroup isDisabled items={items} />`}
      >
        <Flex gap={6} alignItems="start">
          <ActionGroup aria-label="Vertical alignment" orientation="vertical" items={alignment} />
          <div>
            <span class={typeRoles.meta}>Disabled</span>
            <ActionGroup aria-label="Disabled alignment" isDisabled items={alignment} />
          </div>
        </Flex>
      </Example>

      <PropsTable
        props={[
          {
            name: "items",
            type: "Iterable<ActionGroupItem>",
            description: "The action items, each with an id and label",
          },
          {
            name: "selectionMode",
            type: "'none' | 'single' | 'multiple'",
            default: "'none'",
            description: "Whether items can be toggled, and how many at once",
          },
          {
            name: "defaultSelectedKeys",
            type: "Iterable<Key>",
            description: "Initially selected item keys (uncontrolled)",
          },
          {
            name: "selectedKeys",
            type: "Iterable<Key>",
            description: "Selected item keys (controlled)",
          },
          {
            name: "onSelectionChange",
            type: "(keys: Selection) => void",
            description: "Handler called when the selection changes",
          },
          {
            name: "orientation",
            type: "'horizontal' | 'vertical'",
            default: "'horizontal'",
            description: "Layout direction of the items",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the entire group is disabled",
          },
          {
            name: "children",
            type: "(item, renderProps) => JSX.Element",
            description: "Optional render function for each item; defaults to item.label",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          Renders with a <code>toolbar</code> role, or a radio/checkbox group when a selectionMode is set
        </li>
        <li>
          Requires an <code>aria-label</code> or <code>aria-labelledby</code> to name the group
        </li>
        <li>Arrow keys move focus between items using a roving tabindex</li>
        <li>Enter or Space toggles selection when a selectionMode is active</li>
        <li>Selected items expose <code>aria-pressed</code> or <code>aria-checked</code></li>
        <li>Disabled items are skipped by keyboard navigation</li>
      </AccessibilitySection>
    </DocPage>
  );
}
