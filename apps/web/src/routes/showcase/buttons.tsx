/* Panel 01 — Buttons. The exemplar panel route: every button-family component,
   every register-relevant state, composed from the shared Panel/Demo/Row
   chrome. Buttons are opaque on the mono face — glass is for surfaces. */
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import {
  ActionButton,
  ActionButtonGroup,
  Button,
  ButtonGroup,
  FileTrigger,
  LinkButton,
  ToggleButton,
  ToggleButtonGroup,
  BellIcon,
  SearchIcon,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/buttons")({
  component: ButtonsPanel,
});

const VARIANTS = [
  "primary",
  "secondary",
  "accent",
  "negative",
  "warning",
  "success",
  "create",
] as const;

function ButtonsPanel() {
  const def = panelBySlug("buttons")!;
  const [files, setFiles] = createSignal<string>("no file selected");

  return (
    <Panel def={def}>
      <Demo label="Button · fill variants — negative / warning / success are the status trio; create is yellow, never orange">
        <Row>
          <For each={VARIANTS}>
            {(variant) => (
              <Button variant={variant}>
                {variant === "create"
                  ? "+ Create"
                  : variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Button · outline">
        <Row>
          <For each={VARIANTS}>
            {(variant) => (
              <Button variant={variant} fillStyle="outline">
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Button · sizes">
        <Row>
          <Button size="S">Small</Button>
          <Button size="M">Medium</Button>
          <Button size="L">Large</Button>
          <Button size="XL">Extra large</Button>
        </Row>
      </Demo>

      <Demo label="Button · states">
        <Row>
          <Button isDisabled>Disabled</Button>
          <Button variant="accent" isPending>
            Pending
          </Button>
        </Row>
      </Demo>

      <Demo label="LinkButton">
        <Row>
          <LinkButton href="/showcase" variant="primary">
            Back to overview
          </LinkButton>
          <LinkButton
            href="https://github.com"
            target="_blank"
            variant="secondary"
            fillStyle="outline"
          >
            External
          </LinkButton>
        </Row>
      </Demo>

      <Demo label="ActionButton">
        <Row>
          <ActionButton>Action</ActionButton>
          <ActionButton isQuiet>Quiet</ActionButton>
          <ActionButton isDisabled>Disabled</ActionButton>
          <ActionButton aria-label="Notifications">
            <BellIcon />
          </ActionButton>
          <ActionButton aria-label="Search" isQuiet>
            <SearchIcon />
          </ActionButton>
        </Row>
      </Demo>

      <Demo label="ToggleButton">
        <Row>
          <ToggleButton>Toggle</ToggleButton>
          <ToggleButton defaultSelected>Selected</ToggleButton>
          <ToggleButton isEmphasized defaultSelected>
            Emphasized
          </ToggleButton>
          <ToggleButton isDisabled>Disabled</ToggleButton>
        </Row>
      </Demo>

      <Demo label="ButtonGroup">
        <ButtonGroup>
          <Button variant="secondary" fillStyle="outline">
            Cancel
          </Button>
          <Button variant="accent">Confirm</Button>
        </ButtonGroup>
      </Demo>

      <Demo label="ActionButtonGroup">
        <ActionButtonGroup>
          <ActionButton>Cut</ActionButton>
          <ActionButton>Copy</ActionButton>
          <ActionButton>Paste</ActionButton>
        </ActionButtonGroup>
      </Demo>

      <Demo label="ToggleButtonGroup">
        <ToggleButtonGroup>
          <ToggleButton id="bold">Bold</ToggleButton>
          <ToggleButton id="italic">Italic</ToggleButton>
          <ToggleButton id="underline">Underline</ToggleButton>
        </ToggleButtonGroup>
      </Demo>

      <Demo label="FileTrigger">
        <Row>
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
          <span
            style={{
              font: "var(--type-terminal)",
              "font-family": "var(--font-mono)",
              color: "var(--text-secondary)",
            }}
          >
            {files()}
          </span>
        </Row>
      </Demo>
    </Panel>
  );
}
