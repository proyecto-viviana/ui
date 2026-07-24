import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { FileTrigger, Button } from "@proyecto-viviana/solid-spectrum";
import { Flex, typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

export const Route = createFileRoute("/solid-spectrum/docs/components/filetrigger")({
  head: () =>
    seo({
      title: "FileTrigger",
      description:
        "FileTrigger opens the native file picker from any custom trigger and forwards the chosen files to your code.",
      path: "/solid-spectrum/docs/components/filetrigger",
    }),
  component: FileTriggerPage,
});

function FileTriggerPage() {
  const [files, setFiles] = createSignal("no file selected");

  return (
    <DocPage
      title="FileTrigger"
      description="FileTrigger opens the native file picker from any custom trigger and forwards the chosen files to your code. It wraps a Button (or any pressable) and reports the selection through onSelect — no styling of the OS dialog required."
      importCode={`import { FileTrigger, Button } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic"
        description="Wrap a trigger and handle onSelect. The callback receives a FileList (or null if the dialog was dismissed)."
        code={`<FileTrigger
  onSelect={(list: FileList | null) =>
    setFiles(
      list && list.length > 0
        ? Array.from(list).map((f) => f.name).join(", ")
        : "no file selected"
    )
  }
>
  <Button variant="secondary">Choose file…</Button>
</FileTrigger>`}
      >
        <Flex alignItems="center" gap={4}>
          <FileTrigger
            onSelect={(list: FileList | null) =>
              setFiles(
                list && list.length > 0
                  ? Array.from(list)
                      .map((f) => f.name)
                      .join(", ")
                  : "no file selected",
              )
            }
          >
            <Button variant="secondary">Choose file…</Button>
          </FileTrigger>
          <span class={typeRoles.terminal} style={{ color: "var(--text-secondary)" }}>
            {files()}
          </span>
        </Flex>
      </Example>

      <Example
        title="Filtered and multiple"
        description="Restrict the picker with acceptedFileTypes and allow more than one file with allowsMultiple."
        code={`<FileTrigger
  acceptedFileTypes={["image/png", "image/jpeg"]}
  allowsMultiple
  onSelect={(list) => { /* … */ }}
>
  <Button variant="secondary">Upload images</Button>
</FileTrigger>`}
      >
        <FileTrigger
          acceptedFileTypes={["image/png", "image/jpeg"]}
          allowsMultiple
          onSelect={(list) =>
            setFiles(
              list && list.length > 0 ? `${list.length} image(s) selected` : "no file selected",
            )
          }
        >
          <Button variant="secondary">Upload images</Button>
        </FileTrigger>
      </Example>

      <PropsTable
        props={[
          {
            name: "onSelect",
            type: "(files: FileList | null) => void",
            description:
              "Handler called with the chosen files, or null if the dialog was cancelled",
          },
          {
            name: "acceptedFileTypes",
            type: "ReadonlyArray<string>",
            description: "MIME types or extensions the picker restricts selection to",
          },
          {
            name: "allowsMultiple",
            type: "boolean",
            default: "false",
            description: "Whether more than one file can be selected",
          },
          {
            name: "acceptDirectory",
            type: "boolean",
            default: "false",
            description: "Whether whole directories can be selected instead of files",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "The trigger element that opens the file picker",
          },
        ]}
      />

      <AccessibilitySection>
        <li>The trigger keeps its own semantics — a Button remains a button in the tab order</li>
        <li>The native file input is visually hidden but reachable through the trigger</li>
        <li>Activating the trigger with Enter or Space opens the OS file dialog</li>
        <li>File-type and multiple-selection constraints are enforced by the browser dialog</li>
      </AccessibilitySection>
    </DocPage>
  );
}
