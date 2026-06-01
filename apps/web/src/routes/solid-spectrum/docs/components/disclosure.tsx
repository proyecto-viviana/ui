import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import {
  Disclosure,
  DisclosureGroup,
  DisclosureTrigger,
  DisclosurePanel,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

const faqItems: FaqEntry[] = [
  {
    id: "what-is",
    question: "What is Proyecto Viviana?",
    answer:
      "Proyecto Viviana is a SolidJS port of Adobe's React Spectrum, providing accessible UI primitives with world-class accessibility support. It gives SolidJS developers a mature component library with proper ARIA patterns.",
  },
  {
    id: "accessibility",
    question: "How does it handle accessibility?",
    answer:
      "Every component follows WAI-ARIA patterns with proper roles, keyboard navigation, focus management, and screen reader support. Components are tested against ARIA Authoring Practices Guidelines.",
  },
  {
    id: "getting-started",
    question: "How do I get started?",
    answer:
      "Install the packages with npm or pnpm, wrap your app with the Provider component, and start importing components. Check the documentation for each component's API and examples.",
  },
  {
    id: "customization",
    question: "Can I customize the styling?",
    answer:
      "Yes. The headless layer (solidaria-components) provides unstyled components you can style freely. The UI layer uses Tailwind CSS and supports theming through CSS custom properties.",
  },
];

const settingsSections = [
  {
    id: "notifications",
    title: "Notification Preferences",
    content:
      "Configure email notifications, push notifications, and in-app alerts. Set quiet hours and choose notification priority levels for different event types.",
  },
  {
    id: "privacy",
    title: "Privacy Settings",
    content:
      "Manage who can see your profile, activity status, and shared content. Control data sharing preferences and third-party integrations.",
  },
  {
    id: "security",
    title: "Security Options",
    content:
      "Enable two-factor authentication, manage active sessions, set up recovery codes, and configure login alerts for unrecognized devices.",
  },
  {
    id: "appearance",
    title: "Appearance",
    content:
      "Choose your preferred color scheme (light, dark, or system), adjust font sizes, and configure layout density preferences.",
  },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/disclosure")({
  component: DisclosurePage,
});

function DisclosurePage() {
  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set());
  const [singleKey, setSingleKey] = createSignal<Set<string>>(new Set(["notifications"]));

  return (
    <DocPage
      title="Disclosure"
      description="Disclosure shows and hides content with an expand/collapse interaction. Use DisclosureGroup to create accordion patterns where disclosures coordinate their expanded state."
      importCode={`import {
  Disclosure,
  DisclosureGroup,
  DisclosureTrigger,
  DisclosurePanel
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Single Disclosure"
        description="A standalone disclosure panel that toggles between expanded and collapsed."
        code={`<Disclosure id="details">
  <DisclosureTrigger>Show Details</DisclosureTrigger>
  <DisclosurePanel>
    Content that can be shown or hidden...
  </DisclosurePanel>
</Disclosure>`}
      >
        <div class="max-w-lg">
          <Disclosure id="details">
            <DisclosureTrigger>
              <span class="font-medium">Show More Details</span>
            </DisclosureTrigger>
            <DisclosurePanel>
              <div class="py-3 text-sm text-bg-600 leading-relaxed">
                This content is revealed when the disclosure is expanded. It can contain any content
                including text, images, forms, or other components. Click the trigger again to
                collapse this section.
              </div>
            </DisclosurePanel>
          </Disclosure>
        </div>
      </Example>

      <Example
        title="Accordion (Single Expand)"
        description="A group of disclosures where only one can be expanded at a time, creating an accordion pattern. Expanding one panel automatically collapses the others."
        code={`<DisclosureGroup>
  <Disclosure id="faq-1">
    <DisclosureTrigger>Question 1</DisclosureTrigger>
    <DisclosurePanel>Answer 1</DisclosurePanel>
  </Disclosure>
  <Disclosure id="faq-2">
    <DisclosureTrigger>Question 2</DisclosureTrigger>
    <DisclosurePanel>Answer 2</DisclosurePanel>
  </Disclosure>
</DisclosureGroup>`}
      >
        <div class="max-w-lg">
          <DisclosureGroup
            expandedKeys={singleKey()}
            onExpandedChange={(keys) => setSingleKey(new Set([...keys].map(String)))}
          >
            {faqItems.map((faq) => (
              <Disclosure id={faq.id}>
                <DisclosureTrigger>
                  <span class="font-medium">{faq.question}</span>
                </DisclosureTrigger>
                <DisclosurePanel>
                  <div class="py-3 text-sm text-bg-600 leading-relaxed">{faq.answer}</div>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </DisclosureGroup>
          <p class="mt-2 text-xs text-bg-400">
            Expanded: {singleKey().size > 0 ? [...singleKey()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="Multiple Expand"
        description="Allow multiple disclosures to be expanded simultaneously by setting allowsMultipleExpanded."
        code={`<DisclosureGroup allowsMultipleExpanded>
  <Disclosure id="section-1">...</Disclosure>
  <Disclosure id="section-2">...</Disclosure>
  <Disclosure id="section-3">...</Disclosure>
</DisclosureGroup>`}
      >
        <div class="max-w-lg">
          <DisclosureGroup
            allowsMultipleExpanded
            expandedKeys={expandedKeys()}
            onExpandedChange={(keys) => setExpandedKeys(new Set([...keys].map(String)))}
          >
            {settingsSections.map((section) => (
              <Disclosure id={section.id}>
                <DisclosureTrigger>
                  <span class="font-medium">{section.title}</span>
                </DisclosureTrigger>
                <DisclosurePanel>
                  <div class="py-3 text-sm text-bg-600 leading-relaxed">{section.content}</div>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </DisclosureGroup>
          <div class="mt-3 flex gap-2">
            <button
              class="text-xs px-2 py-1 rounded bg-bg-100 text-bg-600 hover:bg-bg-200"
              onClick={() => setExpandedKeys(new Set(settingsSections.map((s) => s.id)))}
            >
              Expand All
            </button>
            <button
              class="text-xs px-2 py-1 rounded bg-bg-100 text-bg-600 hover:bg-bg-200"
              onClick={() => setExpandedKeys(new Set())}
            >
              Collapse All
            </button>
          </div>
        </div>
      </Example>

      <Example
        title="Variants"
        description="Disclosures can be styled with different visual variants."
        code={`<Disclosure variant="default">...</Disclosure>
<Disclosure variant="bordered">...</Disclosure>
<Disclosure variant="filled">...</Disclosure>
<Disclosure variant="ghost">...</Disclosure>`}
      >
        <div class="space-y-4 max-w-lg">
          <Disclosure id="var-default" variant="default">
            <DisclosureTrigger>
              <span class="font-medium">Default Variant</span>
            </DisclosureTrigger>
            <DisclosurePanel>
              <div class="py-2 text-sm text-bg-600">
                The default disclosure style with a subtle separator.
              </div>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure id="var-bordered" variant="bordered">
            <DisclosureTrigger>
              <span class="font-medium">Bordered Variant</span>
            </DisclosureTrigger>
            <DisclosurePanel>
              <div class="py-2 text-sm text-bg-600">
                A bordered style with visible container edges.
              </div>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure id="var-filled" variant="filled">
            <DisclosureTrigger>
              <span class="font-medium">Filled Variant</span>
            </DisclosureTrigger>
            <DisclosurePanel>
              <div class="py-2 text-sm text-bg-600">
                A filled variant with a background color on the trigger.
              </div>
            </DisclosurePanel>
          </Disclosure>

          <Disclosure id="var-ghost" variant="ghost">
            <DisclosureTrigger>
              <span class="font-medium">Ghost Variant</span>
            </DisclosureTrigger>
            <DisclosurePanel>
              <div class="py-2 text-sm text-bg-600">
                A minimal ghost style with no visible border.
              </div>
            </DisclosurePanel>
          </Disclosure>
        </div>
      </Example>

      <h2>Disclosure Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description:
              "Unique identifier for the disclosure, required when used inside a DisclosureGroup",
          },
          {
            name: "variant",
            type: "'default' | 'bordered' | 'filled' | 'ghost'",
            default: "'default'",
            description: "Visual style variant",
          },
          {
            name: "isExpanded",
            type: "boolean",
            description: "Whether the disclosure is expanded (controlled)",
          },
          {
            name: "defaultExpanded",
            type: "boolean",
            default: "false",
            description: "Whether the disclosure starts expanded (uncontrolled)",
          },
          {
            name: "onExpandedChange",
            type: "(isExpanded: boolean) => void",
            description: "Handler called when expanded state changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the disclosure is disabled",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "DisclosureTrigger and DisclosurePanel",
          },
        ]}
      />

      <h2>DisclosureGroup Props</h2>
      <PropsTable
        props={[
          {
            name: "allowsMultipleExpanded",
            type: "boolean",
            default: "false",
            description: "Whether multiple disclosures can be expanded at once",
          },
          {
            name: "expandedKeys",
            type: "Set<string>",
            description: "Keys of currently expanded disclosures (controlled)",
          },
          {
            name: "defaultExpandedKeys",
            type: "Set<string>",
            description: "Keys of initially expanded disclosures (uncontrolled)",
          },
          {
            name: "onExpandedChange",
            type: "(keys: Set<string>) => void",
            description: "Handler called when expanded state changes",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether all disclosures in the group are disabled",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Disclosure elements",
          },
        ]}
      />

      <h2>DisclosureTrigger Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "Trigger label content",
          },
        ]}
      />

      <h2>DisclosurePanel Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "Content shown when the disclosure is expanded",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Trigger uses <code>button</code> element with <code>aria-expanded</code> state
          </li>
          <li>
            Panel is linked to trigger via <code>aria-controls</code>
          </li>
          <li>Enter or Space toggles the disclosure open/closed</li>
          <li>Focus is managed properly when content is shown/hidden</li>
          <li>
            In accordion mode, <code>aria-expanded</code> correctly reflects group coordination
          </li>
          <li>Disabled state prevents interaction and is communicated via ARIA</li>
          <li>Content is hidden from screen readers when collapsed</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
