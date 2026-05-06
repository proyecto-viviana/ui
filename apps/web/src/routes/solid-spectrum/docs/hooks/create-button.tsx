import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { createButton } from "@proyecto-viviana/solidaria";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/hooks/create-button")({
  component: CreateButtonPage,
});

function CreateButtonPage() {
  const [status, setStatus] = createSignal("Not pressed yet");

  return (
    <DocPage
      title="createButton"
      description="Provides the behavior and accessibility implementation for a button component. Use this hook when you need full control over the button's appearance while maintaining proper accessibility."
      importCode={`import { createButton } from '@proyecto-viviana/solidaria';`}
    >
      <h2>Usage</h2>
      <pre>
        <code>{`function CustomButton(props) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
    isDisabled: props.isDisabled,
  });

  return (
    <button
      {...buttonProps}
      class={isPressed() ? 'pressed' : ''}
    >
      {props.children}
    </button>
  );
}`}</code>
      </pre>

      <Example
        title="Custom Styled Button"
        description="Build a button with custom styling while maintaining accessibility."
        code={`function GradientButton(props) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
  });

  return (
    <button
      {...buttonProps}
      class={\`gradient-btn \${isPressed() ? 'scale-95' : ''}\`}
    >
      {props.children}
    </button>
  );
}`}
      >
        <GradientButton
          onPress={() => {
            setStatus("Pressed");
          }}
        >
          Custom Gradient Button
        </GradientButton>
        <p class="mt-3 text-sm text-bg-500">Status: {status()}</p>
      </Example>

      <Example
        title="Button as Link"
        description="Create an accessible link that looks like a button."
        code={`function ButtonLink(props) {
  const { buttonProps } = createButton({
    elementType: 'a',
  });

  return (
    <a {...buttonProps} href={props.href}>
      {props.children}
    </a>
  );
}`}
      >
        <ButtonLink href="https://github.com/proyecto-viviana">View on GitHub →</ButtonLink>
      </Example>

      <h2>Parameters</h2>
      <PropsTable
        props={[
          {
            name: "onPress",
            type: "(e: PressEvent) => void",
            description: "Handler called when the button is pressed",
          },
          {
            name: "onPressStart",
            type: "(e: PressEvent) => void",
            description: "Handler called when press starts",
          },
          {
            name: "onPressEnd",
            type: "(e: PressEvent) => void",
            description: "Handler called when press ends",
          },
          {
            name: "onPressChange",
            type: "(isPressed: boolean) => void",
            description: "Handler called when pressed state changes",
          },
          {
            name: "onPressUp",
            type: "(e: PressEvent) => void",
            description: "Handler called when pointer is released",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the button is disabled",
          },
          {
            name: "elementType",
            type: "'button' | 'a' | 'div' | 'span'",
            default: "'button'",
            description: "The HTML element to render as",
          },
          {
            name: "type",
            type: "'button' | 'submit' | 'reset'",
            default: "'button'",
            description: "The button type (for form submission)",
          },
          {
            name: "href",
            type: "string",
            description: "URL for link buttons",
          },
          {
            name: "target",
            type: "string",
            description: "Link target (_blank, _self, etc.)",
          },
          {
            name: "excludeFromTabOrder",
            type: "boolean",
            default: "false",
            description: "Remove from tab order",
          },
        ]}
      />

      <h2>Return Value</h2>
      <PropsTable
        props={[
          {
            name: "buttonProps",
            type: "JSX.HTMLAttributes",
            description: "Props to spread on the button element",
          },
          {
            name: "isPressed",
            type: "Accessor<boolean>",
            description: "Signal indicating if button is currently pressed",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Handles <code>role="button"</code> when using non-button elements
          </li>
          <li>
            Manages <code>tabIndex</code> for keyboard accessibility
          </li>
          <li>Handles Enter and Space key presses</li>
          <li>
            Sets <code>aria-disabled</code> for disabled state
          </li>
          <li>Normalizes press events across mouse, touch, and keyboard</li>
          <li>Prevents default behavior for non-native buttons</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}

function GradientButton(props: { onPress?: () => void; children: string }) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
  });

  return (
    <button
      {...buttonProps}
      class={`rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg ${
        isPressed() ? "scale-[0.98] shadow-sm" : ""
      }`}
    >
      {props.children}
    </button>
  );
}

function ButtonLink(props: { href: string; children: string }) {
  const { buttonProps } = createButton({
    elementType: "a",
  });

  return (
    <a
      {...buttonProps}
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-lg bg-bg-800 px-5 py-2.5 font-medium text-white transition-colors hover:bg-bg-700"
    >
      {props.children}
    </a>
  );
}
