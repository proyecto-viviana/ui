import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { DropZone, Text } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/dropzone")({
  component: DropZonePage,
});

function DropZonePage() {
  const [status, setStatus] = createSignal("Waiting for a drop…");

  return (
    <DocPage
      title="DropZone"
      description="DropZone is a styled drag-and-drop target for files. It handles the drag-over, focus, and drop states, and renders whatever prompt you place inside it as the call to action."
      importCode={`import { DropZone } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic"
        description="Place a prompt inside the zone and handle onDrop. The zone reflects hover and drop-target states automatically."
        code={`<DropZone
  aria-label="Upload files"
  onDrop={() => setStatus("Files dropped")}
>
  <Text styles={typeRoles.label}>Drop files here</Text>
  <Text styles={typeRoles.meta}>or drag items over this area</Text>
</DropZone>`}
      >
        <div style={{ "max-width": "28rem" }}>
          <DropZone
            aria-label="Upload files drop zone"
            onDrop={() => setStatus("Files dropped")}
            UNSAFE_style={{
              "min-height": "120px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            <div style={{ "text-align": "center" }}>
              <Text styles={typeRoles.label}>Drop files here</Text>
              <Text styles={typeRoles.meta}>or drag items over this area</Text>
            </div>
          </DropZone>
          <p class={typeRoles.meta} style={{ "margin-top": "8px" }}>
            {status()}
          </p>
        </div>
      </Example>

      <Example
        title="Sizes"
        description="The size prop sets the banner scale shown while a filled zone is being replaced."
        code={`<DropZone size="S">…</DropZone>
<DropZone size="M">…</DropZone>
<DropZone size="L">…</DropZone>`}
      >
        <Flex direction="column" gap={4} style={{ "max-width": "28rem" }}>
          {(["S", "M", "L"] as const).map((size) => (
            <DropZone
              aria-label={`Drop zone size ${size}`}
              size={size}
              UNSAFE_style={{
                "min-height": "72px",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
              }}
            >
              <Text styles={typeRoles.meta}>Size {size}</Text>
            </DropZone>
          ))}
        </Flex>
      </Example>

      <PropsTable
        props={[
          {
            name: "onDrop",
            type: "(e: DropEvent) => void",
            description: "Handler called when items are dropped on the zone",
          },
          {
            name: "size",
            type: "'S' | 'M' | 'L'",
            default: "'M'",
            description: "Scale of the replace banner shown over a filled zone",
          },
          {
            name: "isFilled",
            type: "boolean",
            default: "false",
            description: "Whether the zone already holds content, enabling the replace banner",
          },
          {
            name: "replaceMessage",
            type: "string",
            description: "Text shown on the replace banner while dragging over a filled zone",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible name for the drop target",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The prompt content rendered inside the zone",
          },
        ]}
      />

      <AccessibilitySection>
        <li>The zone is focusable and exposes a button-like drop affordance to assistive tech</li>
        <li>
          It needs an <code>aria-label</code> naming what is being uploaded
        </li>
        <li>Keyboard users can trigger the drop affordance to open a file picker</li>
        <li>Drag-over, focus-visible, and drop-target states are reflected in the render props</li>
        <li>The styled S2 DropZone omits isDisabled; disable at the headless layer if needed</li>
      </AccessibilitySection>
    </DocPage>
  );
}
