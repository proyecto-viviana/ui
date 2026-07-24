import { createFileRoute } from "@tanstack/solid-router";
import { Provider, Button } from "@proyecto-viviana/solid-spectrum";
import { Flex, Well, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/solid-spectrum/docs/components/provider")({
  head: () =>
    seo({
      title: "Provider / Theme",
      description: "The Provider component is the root-level context wrapper for Proyecto Viviana.",
      path: "/solid-spectrum/docs/components/provider",
    }),
  component: ProviderPage,
});

function ProviderPage() {
  return (
    <DocPage
      title="Provider / Theme"
      description="The Provider component is the root-level context wrapper for Proyecto Viviana. It supplies color scheme (light/dark), scale, and locale context to all descendant components."
      importCode={`import { Provider } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Setup"
        description="Wrap your application with Provider at the root level."
        code={`// In your app entry point:
import { Provider } from '@proyecto-viviana/solid-spectrum';
import '@proyecto-viviana/solid-spectrum/styles.css';

function App() {
  return (
    <Provider>
      <YourApp />
    </Provider>
  );
}`}
      >
        <Well class={typeRoles.body}>
          <p>Provider is typically used at the root of your app — not rendered inline.</p>
          <p style={{ "margin-top": "8px" }}>
            It establishes the theme context consumed by all Proyecto Viviana components.
          </p>
        </Well>
      </Example>

      <Example
        title="Color Scheme"
        description="Control whether components render in light or dark mode."
        code={`<Provider colorScheme="dark">
  <Button variant="primary">Dark Theme Button</Button>
</Provider>

<Provider colorScheme="light">
  <Button variant="primary">Light Theme Button</Button>
</Provider>`}
      >
        <Flex direction="column" gap={4}>
          <Well>
            <p class={typeRoles.meta} style={{ "margin-bottom": "8px" }}>
              Default (`light`)
            </p>
            <Button variant="primary">Default Theme</Button>
          </Well>
        </Flex>
      </Example>

      <Example
        title="Scale"
        description="Control the interface density. 'medium' is standard, 'large' increases touch target sizes for mobile."
        code={`<Provider scale="medium">
  <Button>Medium Scale</Button>
</Provider>

<Provider scale="large">
  <Button>Large Scale (mobile-friendly)</Button>
</Provider>`}
      >
        <Flex direction="column" gap={3}>
          <Well>
            <p class={typeRoles.meta} style={{ "margin-bottom": "8px" }}>
              scale: "medium" (default)
            </p>
            <Button variant="secondary" size="M">
              Medium Scale
            </Button>
          </Well>
          <Well>
            <p class={typeRoles.meta} style={{ "margin-bottom": "8px" }}>
              scale: "large" (touch-optimized)
            </p>
            <Button variant="secondary" size="L">
              Large Scale
            </Button>
          </Well>
        </Flex>
      </Example>

      <Example
        title="Using useTheme"
        description="Access the current theme context in any descendant component."
        code={`import { useTheme } from '@proyecto-viviana/solid-spectrum';

function MyComponent() {
  const theme = useTheme();
  return <p>Color scheme: {theme.colorScheme}</p>;
}`}
      >
        <Well class={typeRoles.terminal}>
          <p>{"// Import the hook"}</p>
          <p>{"import { useTheme } from '@proyecto-viviana/solid-spectrum';"}</p>
          <br />
          <p>{"// Inside any descendant component:"}</p>
          <p>{"const theme = useTheme();"}</p>
          <p>{"// theme.colorScheme → 'light' | 'dark'"}</p>
          <p>{"// theme.scale → 'medium' | 'large'"}</p>
        </Well>
      </Example>

      <PropsTable
        props={[
          {
            name: "colorScheme",
            type: "'light' | 'dark'",
            default: "'light'",
            description: "Color scheme selection for built-in themes",
          },
          {
            name: "scale",
            type: "'medium' | 'large'",
            default: "'medium'",
            description: "Interface density scale",
          },
          {
            name: "locale",
            type: "string",
            description: "BCP 47 locale string for date/number formatting (e.g. 'en-US')",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Application tree to provide context to",
          },
        ]}
      />

      <AccessibilitySection>
        <li>
          Respects system color scheme preference via <code>prefers-color-scheme</code> when not
          explicitly set
        </li>
        <li>
          The <code>scale</code> prop increases touch target sizes for WCAG 2.5.5 compliance
        </li>
        <li>Locale affects date/number formatting and text direction for RTL languages</li>
      </AccessibilitySection>
    </DocPage>
  );
}
