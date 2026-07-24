/* Panel 09 — Overlays. Every demo opens from a trigger inside a Row — the
   panel is about what floats above the mono face, not the trigger itself.
   Popovers and dialogs wear the panel's glass (blur-panel, layer-1); a
   tooltip stays opaque and unblurred, since frosting a 200ms transient just
   makes it harder to read. */
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import {
  ActionButton,
  AlertDialog,
  Button,
  ButtonGroup,
  CloseButton,
  Content,
  ContextualHelp,
  ContextualHelpPopover,
  ContextualHelpTrigger,
  CustomDialog,
  Dialog,
  DialogContainer,
  DialogFooter,
  DialogTrigger,
  DropZone,
  Footer,
  FullscreenDialog,
  Header,
  Heading,
  Popover,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Tooltip,
  TooltipTrigger,
  BellIcon,
  SearchIcon,
  type DialogRenderProps,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/overlays")({
  component: Page,
});

const POPOVER_SIZES = ["S", "M", "L"] as const;
const CONTEXTUAL_HELP_VARIANTS = ["help", "info"] as const;
const ALERT_VARIANTS = ["confirmation", "information", "destructive", "error", "warning"] as const;
const FULLSCREEN_VARIANTS = ["fullscreen", "fullscreenTakeover"] as const;

function Page() {
  const def = panelBySlug("overlays")!;
  const [isContainerOpen, setIsContainerOpen] = createSignal(false);

  return (
    <Panel def={def}>
      <Demo label="PopoverTrigger · Popover — header, footer">
        <Row>
          <PopoverTrigger>
            <Button variant="secondary">Settings</Button>
            <Popover placement="bottom" size="M">
              <PopoverHeader
                title="Notification settings"
                description="Choose how you want to be notified."
              />
              <PopoverFooter>
                <Button variant="secondary" fillStyle="outline">
                  Cancel
                </Button>
                <Button variant="accent">Save</Button>
              </PopoverFooter>
            </Popover>
          </PopoverTrigger>
        </Row>
      </Demo>

      <Demo label="Popover · sizes">
        <Row>
          <For each={POPOVER_SIZES}>
            {(size) => (
              <PopoverTrigger>
                <ActionButton>{`Popover ${size}`}</ActionButton>
                <Popover size={size}>
                  <PopoverHeader title={`Size ${size}`} description="Width scales with size." />
                </Popover>
              </PopoverTrigger>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="TooltipTrigger · Tooltip — placement">
        <Row>
          <TooltipTrigger>
            <ActionButton aria-label="Notifications">
              <BellIcon />
            </ActionButton>
            <Tooltip placement="top">Notifications</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <ActionButton aria-label="Search">
              <SearchIcon />
            </ActionButton>
            <Tooltip placement="bottom">Search</Tooltip>
          </TooltipTrigger>
        </Row>
      </Demo>

      <Demo label="ContextualHelp · variant">
        <Row>
          <For each={CONTEXTUAL_HELP_VARIANTS}>
            {(variant) => (
              <ContextualHelp variant={variant}>
                <Heading slot="title">
                  {variant === "info" ? "Did you know?" : "Need help?"}
                </Heading>
                <Content>
                  {variant === "info"
                    ? "This panel reflects live register tokens."
                    : "Reach out from the support menu for anything else."}
                </Content>
              </ContextualHelp>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="ContextualHelpPopover — composed inside a popover trigger">
        <Row>
          <PopoverTrigger>
            <ActionButton aria-label="Why is this unavailable?">?</ActionButton>
            <ContextualHelpPopover>
              <Heading slot="title">Locked action</Heading>
              <Content>Ask an admin to enable this command.</Content>
            </ContextualHelpPopover>
          </PopoverTrigger>
        </Row>
      </Demo>

      <Demo label="ContextualHelpTrigger — convenience title/content">
        <Row>
          <ContextualHelpTrigger
            title="What is this?"
            content="Overlays float above the mono face on the panel surface."
          />
        </Row>
      </Demo>

      <Demo label="DialogTrigger · Dialog — composed slots">
        <Row>
          <DialogTrigger>
            <Button variant="secondary">Open settings</Button>
            <Dialog>
              {({ close }: DialogRenderProps) => (
                <>
                  <Heading slot="title">Workspace settings</Heading>
                  <Header>Manage how this workspace behaves.</Header>
                  <Content>Changes apply immediately across every panel.</Content>
                  <Footer>Last synced a moment ago.</Footer>
                  <ButtonGroup>
                    <Button variant="secondary" fillStyle="outline" onPress={close}>
                      Cancel
                    </Button>
                    <Button variant="accent" onPress={close}>
                      Save
                    </Button>
                  </ButtonGroup>
                </>
              )}
            </Dialog>
          </DialogTrigger>
        </Row>
      </Demo>

      <Demo label="AlertDialog · variant sweep">
        <Row>
          <For each={ALERT_VARIANTS}>
            {(variant) => (
              <AlertDialog
                trigger={
                  <Button variant="secondary">
                    {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  </Button>
                }
                title={`${variant.charAt(0).toUpperCase() + variant.slice(1)} example`}
                variant={variant}
                primaryActionLabel="Confirm"
                cancelLabel="Cancel"
              >
                This alert dialog demonstrates the {variant} variant.
              </AlertDialog>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="CustomDialog · CloseButton, DialogFooter">
        <Row>
          <DialogTrigger>
            <Button variant="secondary">Open custom surface</Button>
            <CustomDialog>
              <Heading slot="title">Custom surface</Heading>
              <Content>Unstyled by default — bring your own footer via DialogFooter.</Content>
              <DialogFooter>
                <Button variant="accent">Confirm</Button>
              </DialogFooter>
              <CloseButton />
            </CustomDialog>
          </DialogTrigger>
        </Row>
      </Demo>

      <Demo label="FullscreenDialog · variant">
        <Row>
          <For each={FULLSCREEN_VARIANTS}>
            {(variant) => (
              <DialogTrigger>
                <Button variant="secondary">{`Open ${variant}`}</Button>
                <FullscreenDialog variant={variant}>
                  <Heading slot="title">Fullscreen surface</Heading>
                  <Content>
                    Takes the viewport
                    {variant === "fullscreenTakeover" ? ", edge to edge" : " minus a margin"}.
                    Escape or the trigger closes it.
                  </Content>
                </FullscreenDialog>
              </DialogTrigger>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="DialogContainer — imperative open/dismiss">
        <Row>
          <Button variant="secondary" onPress={() => setIsContainerOpen(true)}>
            Open imperative dialog
          </Button>
          <DialogContainer onDismiss={() => setIsContainerOpen(false)}>
            {isContainerOpen() && (
              <Dialog isDismissible>
                <Heading slot="title">Imperative dialog</Heading>
                <Content>Opened by calling a signal setter directly, not a DialogTrigger.</Content>
              </Dialog>
            )}
          </DialogContainer>
        </Row>
      </Demo>

      <Demo label="DropZone · drop target">
        <Row>
          <DropZone>Drop files here</DropZone>
        </Row>
      </Demo>
    </Panel>
  );
}
