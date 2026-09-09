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
  NotificationBadge,
  BellIcon,
  SearchIcon,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/buttons")({
  head: () => panelSeo("buttons"),
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
  "terminal",
] as const;

function ButtonsPanel() {
  const def = panelBySlug("buttons")!;
  const [files, setFiles] = createSignal<string>("no file selected");

  return (
    <Panel def={def}>
      <Demo label="Button · fill variants — negative / warning / success are the status trio; create is the ask fuchsia, and only create is">
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

      <Demo label="Button · terminal (RUN) — the console affordance: matte well, well rim, blue ink, tracked out">
        <Row>
          <Button variant="terminal">[ F5 ] RUN</Button>
          <Button variant="terminal" size="S">
            [ F5 ] RUN
          </Button>
          <Button variant="terminal" isDisabled>
            [ F5 ] RUN
          </Button>
        </Row>
      </Demo>

      <Demo label="Button · outlined CTA — variant=create + fillStyle=outline; the ask without the fill">
        <Row>
          <Button variant="create" fillStyle="outline">
            + Create
          </Button>
          <Button variant="create">+ Create</Button>
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

      <Demo label="ActionButton · icon rail — size L icon-only is a 40x40 circle, with the count badge">
        <Row>
          <ActionButton size="L" aria-label="Notifications">
            <BellIcon />
            <NotificationBadge value={3} />
          </ActionButton>
          <ActionButton size="L" aria-label="Search" isQuiet>
            <SearchIcon />
          </ActionButton>
          <ActionButton size="L" aria-label="Notifications, 128 unread">
            <BellIcon />
            <NotificationBadge value={128} />
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
