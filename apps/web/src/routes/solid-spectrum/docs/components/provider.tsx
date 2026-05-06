import { createFileRoute } from "@tanstack/solid-router";
import { Provider, Button } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/provider")({
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
        <div class="rounded-lg bg-bg-300 p-4 text-sm text-primary-300">
          <p>Provider is typically used at the root of your app — not rendered inline.</p>
          <p class="mt-2">
            It establishes the theme context consumed by all Proyecto Viviana components.
          </p>
        </div>
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
        <div class="space-y-4">
          <div class="p-4 rounded-lg bg-bg-200">
            <p class="text-xs text-primary-400 mb-2">Default (`light`)</p>
            <Button variant="primary">Default Theme</Button>
          </div>
        </div>
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
        <div class="space-y-3">
          <div class="p-3 rounded border border-primary-700/30">
            <p class="text-xs text-primary-500 mb-2">scale: "medium" (default)</p>
            <Button variant="secondary" size="md">
              Medium Scale
            </Button>
          </div>
          <div class="p-3 rounded border border-primary-700/30">
            <p class="text-xs text-primary-500 mb-2">scale: "large" (touch-optimized)</p>
            <Button variant="secondary" size="lg">
              Large Scale
            </Button>
          </div>
        </div>
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
        <div class="rounded-lg bg-bg-300 p-4 font-mono text-sm text-primary-300">
          <p>{"// Import the hook"}</p>
          <p>{"import { useTheme } from '@proyecto-viviana/solid-spectrum';"}</p>
          <br />
          <p>{"// Inside any descendant component:"}</p>
          <p>{"const theme = useTheme();"}</p>
          <p>{"// theme.colorScheme → 'light' | 'dark'"}</p>
          <p>{"// theme.scale → 'medium' | 'large'"}</p>
        </div>
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
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Respects system color scheme preference via <code>prefers-color-scheme</code> when not
            explicitly set
          </li>
          <li>
            The <code>scale</code> prop increases touch target sizes for WCAG 2.5.5 compliance
          </li>
          <li>Locale affects date/number formatting and text direction for RTL languages</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
