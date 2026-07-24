import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import type { JSX } from "solid-js";
import { createPress } from "@proyecto-viviana/solidaria";
import { Flex, Well, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/hooks/create-press")({
  component: CreatePressPage,
});

function CreatePressPage() {
  const [pressCount, setPressCount] = createSignal(0);
  const [lastPointerType, setLastPointerType] = createSignal("none");

  const { pressProps, isPressed } = createPress({
    onPress: (e) => {
      setPressCount((c) => c + 1);
      setLastPointerType(e.pointerType);
    },
  });

  return (
    <DocPage
      title="createPress"
      description="Handles press interactions across mouse, touch, keyboard, and virtual clicks. This is the foundation for createButton and other interactive components."
      importCode={`import { createPress } from '@proyecto-viviana/solidaria';`}
    >
      <h2>Usage</h2>
      <pre>
        <code>{`const { pressProps, isPressed } = createPress({
  onPress: () => setStatus('pressed'),
  onPressStart: () => setStatus('press started'),
  onPressEnd: () => setStatus('press ended'),
});

return (
  <div {...pressProps} tabIndex={0} role="button">
    Press me
  </div>
);`}</code>
      </pre>

      <Example
        title="Interactive Card"
        description="Make any element pressable while normalizing all input types."
        code={`const { pressProps, isPressed } = createPress({
  onPress: (e) => setLastInput(e.pointerType),
});

<div
  {...pressProps}
  tabIndex={0}
  role="button"
  class={isPressed() ? 'scale-95' : ''}
>
  Click, touch, or press Enter/Space
</div>`}
      >
        <div
          {...(pressProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
          tabIndex={0}
          role="button"
          class={`cursor-pointer select-none rounded-xl border-2 p-6 transition-all ${
            isPressed()
              ? "border-primary-500 bg-primary-50 scale-[0.98]"
              : "border-bg-200 bg-white hover:border-bg-300"
          }`}
        >
          <p class={typeRoles.headline}>Press count: {pressCount()}</p>
          <p class={typeRoles.meta}>Last input: {lastPointerType()}</p>
          <p class={typeRoles.meta} style={{ "margin-top": "8px" }}>Try clicking, touching, or pressing Enter/Space</p>
        </div>
      </Example>

      <Example
        title="Press State Tracking"
        description="Track press start and end separately for visual feedback."
        code={`const { pressProps, isPressed } = createPress({
  onPressStart: (e) => setStatus('pressing...'),
  onPressEnd: (e) => setStatus('released'),
  onPress: (e) => setStatus('completed!'),
});`}
      >
        <PressStateDemo />
      </Example>

      <h2>Parameters</h2>
      <PropsTable
        props={[
          {
            name: "onPress",
            type: "(e: PressEvent) => void",
            description: "Handler called when a press is completed (pointer up within element)",
          },
          {
            name: "onPressStart",
            type: "(e: PressEvent) => void",
            description: "Handler called when a press starts",
          },
          {
            name: "onPressEnd",
            type: "(e: PressEvent) => void",
            description: "Handler called when a press ends (either completed or cancelled)",
          },
          {
            name: "onPressChange",
            type: "(isPressed: boolean) => void",
            description: "Handler called when the pressed state changes",
          },
          {
            name: "onPressUp",
            type: "(e: PressEvent) => void",
            description: "Handler called when pointer is released over the element",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether press events are disabled",
          },
          {
            name: "isPressed",
            type: "boolean",
            description: "Whether the element is pressed (controlled)",
          },
          {
            name: "preventFocusOnPress",
            type: "boolean",
            default: "false",
            description: "Prevent focus when pressing with mouse/touch",
          },
          {
            name: "shouldCancelOnPointerExit",
            type: "boolean",
            default: "false",
            description: "Cancel press when pointer leaves element",
          },
          {
            name: "allowTextSelectionOnPress",
            type: "boolean",
            default: "false",
            description: "Allow text selection during press",
          },
        ]}
      />

      <h2>Return Value</h2>
      <PropsTable
        props={[
          {
            name: "pressProps",
            type: "JSX.HTMLAttributes",
            description: "Props to spread on the target element",
          },
          {
            name: "isPressed",
            type: "Accessor<boolean>",
            description: "Signal indicating if element is currently pressed",
          },
        ]}
      />

      <h2>PressEvent Object</h2>
      <PropsTable
        props={[
          {
            name: "type",
            type: "'pressstart' | 'pressend' | 'pressup' | 'press'",
            description: "The type of press event",
          },
          {
            name: "pointerType",
            type: "'mouse' | 'pen' | 'touch' | 'keyboard' | 'virtual'",
            description: "The type of pointer that triggered the event",
          },
          {
            name: "target",
            type: "HTMLElement",
            description: "The element that was pressed",
          },
          {
            name: "shiftKey",
            type: "boolean",
            description: "Whether shift key was held",
          },
          {
            name: "ctrlKey",
            type: "boolean",
            description: "Whether ctrl key was held",
          },
          {
            name: "metaKey",
            type: "boolean",
            description: "Whether meta/cmd key was held",
          },
          {
            name: "altKey",
            type: "boolean",
            description: "Whether alt key was held",
          },
        ]}
      />

      <h2>Pointer Type Handling</h2>
      <p>The hook normalizes interactions across different input methods:</p>
      <ul
        style={{
          margin: "16px 0",
          "padding-left": "1.5rem",
          "list-style": "disc",
          display: "flex",
          "flex-direction": "column",
          gap: "0.5rem",
        }}
      >
        <li>
          <strong>mouse</strong> - Desktop mouse clicks
        </li>
        <li>
          <strong>touch</strong> - Mobile/tablet touch events
        </li>
        <li>
          <strong>pen</strong> - Stylus interactions
        </li>
        <li>
          <strong>keyboard</strong> - Enter or Space key presses
        </li>
        <li>
          <strong>virtual</strong> - Programmatic triggers (e.g., <code>element.click()</code>)
        </li>
      </ul>

      <AccessibilitySection>
        <li>Supports keyboard activation via Enter and Space keys</li>
        <li>Works with screen reader virtual clicks</li>
        <li>
          Remember to add <code>role="button"</code> and <code>tabIndex={0}</code> for non-button
          elements
        </li>
        <li>Press is cancelled if pointer exits element (prevents accidental activation)</li>
        <li>Prevents text selection during press for better UX</li>
      </AccessibilitySection>
    </DocPage>
  );
}

/** The press target: a plain box whose whole job is to show the pressed state. */
const target = {
  padding: "16px",
  "border-radius": "var(--radius-lg)",
  "border-width": "2px",
  "border-style": "solid",
  cursor: "pointer",
  "user-select": "none",
  transition: "background-color 150ms ease, border-color 150ms ease, transform 150ms ease",
} as const;

function PressStateDemo() {
  const [events, setEvents] = createSignal<string[]>([]);

  const addEvent = (event: string) => {
    setEvents((prev) => [...prev.slice(-4), event]);
  };

  const { pressProps, isPressed } = createPress({
    onPressStart: (e) => addEvent(`pressStart (${e.pointerType})`),
    onPressEnd: () => addEvent("pressEnd"),
    onPress: (e) => addEvent(`press completed (${e.pointerType})`),
  });

  return (
    <Flex alignItems="start" gap={6}>
      <div
        {...(pressProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
        tabIndex={0}
        role="button"
        style={{
          ...target,
          "border-color": isPressed() ? "var(--color-accent)" : "var(--color-bg-400)",
          background: isPressed() ? "var(--color-accent-dim)" : "transparent",
          transform: isPressed() ? "scale(0.98)" : "none",
        }}
      >
        <p class={typeRoles.label}>Press and hold me</p>
        <p class={typeRoles.meta} style={{ "margin-top": "4px" }}>Watch the events log →</p>
      </div>
      <Well class={typeRoles.terminal} style={{ flex: "1" }}>
        <p class={typeRoles.meta} style={{ "margin-bottom": "8px" }}>Event Log:</p>
        {events().length === 0 ? (
          <p>No events yet...</p>
        ) : (
          events().map((event) => <p>{event}</p>)
        )}
      </Well>
    </Flex>
  );
}
