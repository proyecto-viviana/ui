import { createFileRoute } from "@tanstack/solid-router";
import {
  Button,
  ToastProvider,
  ToastRegion,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/toast")({
  component: ToastPage,
});

function ToastPage() {
  return (
    <DocPage
      title="Toast"
      description="Toasts display brief, temporary notifications. They appear at the edge of the screen and automatically dismiss after a timeout."
      importCode={`import {
  ToastProvider,
  ToastRegion,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <h2>Setup</h2>
      <p>
        Wrap your app with <code>ToastProvider</code> and add <code>ToastRegion</code> where you
        want toasts to appear.
      </p>
      <pre>
        <code>{`function App() {
  return (
    <ToastProvider>
      <YourApp />
      <ToastRegion placement="bottom-end" />
    </ToastProvider>
  );
}`}</code>
      </pre>

      <Example
        title="Toast Variants"
        description="Use helper functions to show different toast types."
        code={`toastSuccess('Changes saved successfully!');
toastError('Failed to save changes');
toastWarning('Your session will expire soon');
toastInfo('New update available');`}
      >
        <ToastProvider>
          <div class="flex flex-wrap gap-3">
            <Button variant="primary" onPress={() => toastSuccess("Changes saved successfully!")}>
              Success Toast
            </Button>
            <Button variant="negative" onPress={() => toastError("Failed to save changes")}>
              Error Toast
            </Button>
            <Button
              variant="secondary"
              onPress={() => toastWarning("Your session will expire soon")}
            >
              Warning Toast
            </Button>
            <Button variant="accent" onPress={() => toastInfo("New update available")}>
              Info Toast
            </Button>
          </div>
          <ToastRegion placement="bottom-end" />
        </ToastProvider>
      </Example>

      <Example
        title="Custom Duration"
        description="Control how long the toast stays visible."
        code={`toastSuccess('Quick message', { timeout: 2000 });
toastInfo('Stays longer', { timeout: 10000 });`}
      >
        <ToastProvider>
          <div class="flex gap-3">
            <Button
              variant="secondary"
              onPress={() => toastSuccess("Quick message (2s)", { timeout: 2000 })}
            >
              Quick Toast
            </Button>
            <Button
              variant="secondary"
              onPress={() => toastInfo("Stays longer (10s)", { timeout: 10000 })}
            >
              Long Toast
            </Button>
          </div>
          <ToastRegion placement="bottom-end" />
        </ToastProvider>
      </Example>

      <Example
        title="Placement Options"
        description="Toasts can appear at different edges of the screen."
        code={`<ToastRegion placement="top-end" />
<ToastRegion placement="top" />
<ToastRegion placement="bottom-start" />`}
      >
        <div class="text-sm text-bg-500">
          Placement options: top, top-start, top-end, bottom, bottom-start, bottom-end
        </div>
      </Example>

      <h2>ToastProvider Props</h2>
      <PropsTable
        props={[
          {
            name: "children",
            type: "JSX.Element",
            description: "App content",
          },
        ]}
      />

      <h2>ToastRegion Props</h2>
      <PropsTable
        props={[
          {
            name: "placement",
            type: "'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end'",
            default: "'bottom-end'",
            description: "Where toasts appear on screen",
          },
          {
            name: "aria-label",
            type: "string",
            default: "'Notifications'",
            description: "Accessible label for the region",
          },
        ]}
      />

      <h2>Toast Helper Options</h2>
      <PropsTable
        props={[
          {
            name: "timeout",
            type: "number",
            default: "5000",
            description: "Duration in milliseconds before auto-dismiss",
          },
          {
            name: "priority",
            type: "number",
            default: "0",
            description: "Higher priority toasts appear first",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="region"</code> with <code>aria-label</code>
          </li>
          <li>
            Individual toasts use <code>role="alert"</code> for screen reader announcements
          </li>
          <li>Focus pauses the auto-dismiss timer</li>
          <li>Hover pauses the auto-dismiss timer</li>
          <li>Escape key dismisses the focused toast</li>
          <li>Toasts are announced to screen readers via live regions</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
