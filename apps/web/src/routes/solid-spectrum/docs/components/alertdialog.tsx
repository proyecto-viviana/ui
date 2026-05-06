import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { AlertDialog, Button } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/alertdialog")({
  component: AlertDialogPage,
});

function AlertDialogPage() {
  const [lastAction, setLastAction] = createSignal("");

  return (
    <DocPage
      title="AlertDialog"
      description="A modal dialog that interrupts the user with important information, requiring an explicit action before continuing. Ideal for destructive actions and confirmations."
      importCode={`import { AlertDialog, Button } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Destructive Action"
        description="Use variant='destructive' for irreversible actions like deleting data."
        code={`<AlertDialog
  title="Delete Item"
  variant="destructive"
  primaryActionLabel="Delete"
  cancelLabel="Cancel"
  onPrimaryAction={() => console.log('Deleted')}
  onCancel={() => console.log('Cancelled')}
  trigger={<Button variant="negative">Delete Item</Button>}
>
  Are you sure? This action cannot be undone.
</AlertDialog>`}
      >
        <div class="flex gap-4">
          <AlertDialog
            title="Delete Item"
            variant="destructive"
            primaryActionLabel="Delete"
            cancelLabel="Cancel"
            onPrimaryAction={() => setLastAction("Deleted!")}
            onCancel={() => setLastAction("Cancelled")}
            trigger={<Button variant="negative">Delete Item</Button>}
          >
            Are you sure you want to delete this item? This action cannot be undone.
          </AlertDialog>
          {lastAction() && <span class="text-sm text-primary-400 self-center">{lastAction()}</span>}
        </div>
      </Example>

      <Example
        title="Confirmation"
        description="Use variant='confirmation' for actions that need user approval."
        code={`<AlertDialog
  title="Save Changes"
  variant="confirmation"
  primaryActionLabel="Save"
  cancelLabel="Discard"
  onPrimaryAction={() => console.log('Saved')}
  trigger={<Button variant="primary">Save Changes</Button>}
>
  You have unsaved changes. Would you like to save them?
</AlertDialog>`}
      >
        <AlertDialog
          title="Save Changes"
          variant="confirmation"
          primaryActionLabel="Save"
          cancelLabel="Discard"
          onPrimaryAction={() => setLastAction("Saved!")}
          onCancel={() => setLastAction("Discarded")}
          trigger={<Button variant="primary">Save Changes</Button>}
        >
          You have unsaved changes. Would you like to save them before leaving?
        </AlertDialog>
      </Example>

      <Example
        title="Information"
        description="Use variant='information' for important messages that need acknowledgment."
        code={`<AlertDialog
  title="Session Expiring"
  variant="information"
  primaryActionLabel="Stay Logged In"
  cancelLabel="Log Out"
  trigger={<Button variant="secondary">Show Session Warning</Button>}
>
  Your session will expire in 5 minutes.
</AlertDialog>`}
      >
        <AlertDialog
          title="Session Expiring"
          variant="information"
          primaryActionLabel="Stay Logged In"
          cancelLabel="Log Out"
          onPrimaryAction={() => setLastAction("Session extended")}
          trigger={<Button variant="secondary">Show Session Warning</Button>}
        >
          Your session will expire in 5 minutes. Would you like to stay logged in?
        </AlertDialog>
      </Example>

      <PropsTable
        props={[
          { name: "title", type: "string", description: "Dialog title shown in the header" },
          {
            name: "variant",
            type: "'destructive' | 'confirmation' | 'information'",
            default: "'confirmation'",
            description: "Visual style and semantic meaning",
          },
          {
            name: "primaryActionLabel",
            type: "string",
            description: "Label for the primary (confirm) button",
          },
          {
            name: "cancelLabel",
            type: "string",
            description: "Label for the cancel/dismiss button",
          },
          {
            name: "onPrimaryAction",
            type: "() => void",
            description: "Called when the primary action is confirmed",
          },
          {
            name: "onCancel",
            type: "() => void",
            description: "Called when the dialog is cancelled or dismissed",
          },
          {
            name: "trigger",
            type: "JSX.Element",
            description: "Element that opens the dialog when pressed",
          },
          { name: "children", type: "JSX.Element", description: "The alert message body" },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="alertdialog"</code> — announced immediately when opened
          </li>
          <li>Focus is trapped inside the dialog until dismissed</li>
          <li>Escape key cancels the dialog</li>
          <li>
            The title is linked via <code>aria-labelledby</code>
          </li>
          <li>
            The body text is linked via <code>aria-describedby</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
