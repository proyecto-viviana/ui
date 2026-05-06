import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import {
  Dialog,
  DialogTrigger,
  DialogFooter,
  Button,
  TextField,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/dialog")({
  component: DialogPage,
});

function DialogPage() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <DocPage
      title="Dialog"
      description="Dialogs are modal windows that appear over the main content. They're used for important messages, confirmations, or collecting user input."
      importCode={`import { Dialog, DialogTrigger, DialogFooter } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Dialog"
        description="A simple dialog with a title and content."
        code={`<DialogTrigger
  trigger={<Button>Open Dialog</Button>}
  content={(close) => (
    <Dialog title="Welcome" onClose={close}>
      <p>This is a basic dialog with some content.</p>
    </Dialog>
  )}
/>`}
      >
        <DialogTrigger
          trigger={<Button>Open Dialog</Button>}
          content={(close) => (
            <Dialog title="Welcome" onClose={close}>
              <p class="text-bg-600">
                This is a basic dialog with some content. Click outside or press Escape to close.
              </p>
            </Dialog>
          )}
        />
      </Example>

      <Example
        title="Confirmation Dialog"
        description="Dialogs commonly used to confirm destructive actions."
        code={`<DialogTrigger
  trigger={<Button variant="negative">Delete Item</Button>}
  content={(close) => (
    <Dialog title="Confirm Delete" onClose={close}>
      <p>Are you sure you want to delete this item?</p>
      <DialogFooter>
        <Button variant="secondary" onPress={close}>Cancel</Button>
        <Button variant="negative" onPress={close}>Delete</Button>
      </DialogFooter>
    </Dialog>
  )}
/>`}
      >
        <DialogTrigger
          trigger={<Button variant="negative">Delete Item</Button>}
          content={(close) => (
            <Dialog title="Confirm Delete" onClose={close}>
              <p class="text-bg-600">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <DialogFooter>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button variant="negative" onPress={close}>
                  Delete
                </Button>
              </DialogFooter>
            </Dialog>
          )}
        />
      </Example>

      <Example
        title="Form Dialog"
        description="Collect user input within a dialog."
        code={`<DialogTrigger
  trigger={<Button>Edit Profile</Button>}
  content={(close) => (
    <Dialog title="Edit Profile" onClose={close}>
      <TextField label="Name" defaultValue="John Doe" />
      <TextField label="Email" defaultValue="john@example.com" />
      <DialogFooter>
        <Button variant="secondary" onPress={close}>Cancel</Button>
        <Button variant="primary" onPress={close}>Save</Button>
      </DialogFooter>
    </Dialog>
  )}
/>`}
      >
        <DialogTrigger
          trigger={<Button>Edit Profile</Button>}
          content={(close) => (
            <Dialog title="Edit Profile" onClose={close}>
              <div class="space-y-4">
                <TextField label="Name" defaultValue="John Doe" />
                <TextField label="Email" defaultValue="john@example.com" />
              </div>
              <DialogFooter>
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button variant="primary" onPress={close}>
                  Save
                </Button>
              </DialogFooter>
            </Dialog>
          )}
        />
      </Example>

      <Example
        title="Controlled Dialog"
        description="Control the dialog's open state programmatically."
        code={`const [isOpen, setIsOpen] = createSignal(false);

<DialogTrigger
  isOpen={isOpen()}
  onOpenChange={setIsOpen}
  trigger={<Button>Open</Button>}
  content={(close) => (
    <Dialog title="Controlled Dialog" onClose={close}>...</Dialog>
  )}
/>`}
      >
        <div class="flex gap-3">
          <Button onPress={() => setIsOpen(true)}>Open Controlled Dialog</Button>
          <DialogTrigger
            isOpen={isOpen()}
            onOpenChange={setIsOpen}
            trigger={<span />}
            content={(close) => (
              <Dialog title="Controlled Dialog" onClose={close}>
                <p class="text-bg-600">This dialog is controlled by state.</p>
                <DialogFooter>
                  <Button variant="primary" onPress={close}>
                    Close
                  </Button>
                </DialogFooter>
              </Dialog>
            )}
          />
        </div>
      </Example>

      <Example
        title="Sizes"
        description="Dialogs come in different sizes to fit various content needs."
        code={`<Dialog title="Small Dialog" size="sm">...</Dialog>
<Dialog title="Medium Dialog" size="md">...</Dialog>
<Dialog title="Large Dialog" size="lg">...</Dialog>`}
      >
        <div class="flex gap-3">
          <DialogTrigger
            trigger={<Button variant="secondary">Small</Button>}
            content={(close) => (
              <Dialog title="Small Dialog" size="sm" onClose={close}>
                <p class="text-bg-600">A compact dialog for simple messages.</p>
              </Dialog>
            )}
          />
          <DialogTrigger
            trigger={<Button variant="secondary">Medium</Button>}
            content={(close) => (
              <Dialog title="Medium Dialog" size="md" onClose={close}>
                <p class="text-bg-600">The default size for most use cases.</p>
              </Dialog>
            )}
          />
          <DialogTrigger
            trigger={<Button variant="secondary">Large</Button>}
            content={(close) => (
              <Dialog title="Large Dialog" size="lg" onClose={close}>
                <p class="text-bg-600">A larger dialog for complex content or forms.</p>
              </Dialog>
            )}
          />
        </div>
      </Example>

      <h2>DialogTrigger Props</h2>
      <PropsTable
        props={[
          {
            name: "trigger",
            type: "JSX.Element",
            description: "Element that opens the dialog",
          },
          {
            name: "content",
            type: "(close: () => void) => JSX.Element",
            description: "Render function that receives a close callback",
          },
          {
            name: "isOpen",
            type: "boolean",
            description: "Whether the dialog is open (controlled)",
          },
          {
            name: "onOpenChange",
            type: "(isOpen: boolean) => void",
            description: "Handler called when open state changes",
          },
        ]}
      />

      <h2>Dialog Props</h2>
      <PropsTable
        props={[
          {
            name: "title",
            type: "string",
            description: "Dialog title (recommended for accessibility)",
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg' | 'fullscreen'",
            default: "'md'",
            description: "Dialog width",
          },
          {
            name: "isDismissable",
            type: "boolean",
            default: "true",
            description: "Whether close affordance is shown",
          },
          {
            name: "onClose",
            type: "() => void",
            description: "Handler called when dialog should close",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Dialog content",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>Uses modal dialog semantics with keyboard dismissal (Escape)</li>
          <li>Focus remains contained while the dialog is open</li>
          <li>Focus is restored to the trigger when closed</li>
          <li>Includes outside-click dismissal support (configurable)</li>
          <li>Document scrolling is prevented while open</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
