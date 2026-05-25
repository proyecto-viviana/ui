import { type JSX, Show, splitProps } from "solid-js";
import { Button, type ButtonVariant } from "../button";
import { ButtonGroup } from "../buttongroup";
import AlertDiamondIcon from "../icon/s2wf-icons/AlertDiamondIcon";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import { Content, Heading } from "../text";
import { style } from "../style";
import { Dialog, DialogTrigger, type DialogRenderProps, type DialogSize } from "./Dialog";

export type AlertDialogVariant =
  | "confirmation"
  | "information"
  | "destructive"
  | "error"
  | "warning";

export interface AlertDialogProps {
  /** The title of the alert dialog. */
  title: string;
  /** The content/message of the alert dialog. */
  children: JSX.Element;
  /** The trigger element that opens the dialog. */
  trigger?: JSX.Element;
  /** The variant of the alert dialog. @default 'confirmation' */
  variant?: AlertDialogVariant;
  /** Label for the primary action button. */
  primaryActionLabel?: string;
  /** Label for the secondary action button. */
  secondaryActionLabel?: string;
  /** Label for the cancel button. */
  cancelLabel?: string;
  /** Handler called when the primary action is triggered. */
  onPrimaryAction?: () => void;
  /** Handler called when the secondary action is triggered. */
  onSecondaryAction?: () => void;
  /** Handler called when canceled. */
  onCancel?: () => void;
  /** Whether the primary action button is disabled. */
  isPrimaryActionDisabled?: boolean;
  /** Whether the secondary action button is disabled. */
  isSecondaryActionDisabled?: boolean;
  /** Whether the cancel button is disabled. */
  isCancelDisabled?: boolean;
  /** Which action button should receive initial focus. */
  autoFocusButton?: "primary" | "secondary" | "cancel";
  /** The size of the alert dialog. */
  size?: Exclude<DialogSize, "XL" | "sm" | "md" | "lg" | "fullscreen">;
  /** Whether the dialog is open. */
  isOpen?: boolean;
  /** Whether the dialog is open by default. */
  defaultOpen?: boolean;
  /** Handler called when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether the dialog is dismissible. Alert dialogs default to false. */
  isDismissible?: boolean;
  /** Alias for isDismissible, retained for older Solid Spectrum examples. */
  isDismissable?: boolean;
  /** Additional CSS class name. */
  class?: string;
}

const alertDialogHeading = style({
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
});

const alertDialogIcon = style({
  flexShrink: 0,
});

function primaryVariant(variant: AlertDialogVariant): ButtonVariant {
  if (variant === "confirmation") {
    return "accent";
  }

  if (variant === "destructive") {
    return "negative";
  }

  return "primary";
}

function runAction(close: () => void, action: (() => void) | undefined) {
  close();
  action?.();
}

/**
 * A dialog that requires user acknowledgement before proceeding.
 */
export function AlertDialog(props: AlertDialogProps): JSX.Element {
  const [local] = splitProps(props, [
    "title",
    "children",
    "trigger",
    "variant",
    "primaryActionLabel",
    "secondaryActionLabel",
    "cancelLabel",
    "onPrimaryAction",
    "onSecondaryAction",
    "onCancel",
    "isPrimaryActionDisabled",
    "isSecondaryActionDisabled",
    "isCancelDisabled",
    "autoFocusButton",
    "size",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDismissible",
    "isDismissable",
    "class",
  ]);

  const variant = () => local.variant ?? "confirmation";
  const isDismissible = () => local.isDismissible ?? local.isDismissable ?? false;
  const primaryActionLabel = () => local.primaryActionLabel ?? "Confirm";

  const dialog = () => (
    <Dialog
      role="alertdialog"
      size={local.size ?? "M"}
      isDismissible={isDismissible()}
      class={local.class}
    >
      {({ close }: DialogRenderProps) => (
        <>
          <Heading slot="title" UNSAFE_className={alertDialogHeading}>
            <Show when={variant() === "error"}>
              <AlertDiamondIcon class={alertDialogIcon} />
            </Show>
            <Show when={variant() === "warning"}>
              <AlertTriangleIcon class={alertDialogIcon} />
            </Show>
            {local.title}
          </Heading>
          <Content>{local.children}</Content>
          <ButtonGroup>
            <Show when={local.cancelLabel !== undefined || local.onCancel}>
              <Button
                variant="secondary"
                fillStyle="outline"
                isDisabled={local.isCancelDisabled}
                autoFocus={local.autoFocusButton === "cancel"}
                onPress={() => runAction(close, local.onCancel)}
              >
                {local.cancelLabel ?? "Cancel"}
              </Button>
            </Show>
            <Show when={local.secondaryActionLabel}>
              <Button
                variant="secondary"
                fillStyle="outline"
                isDisabled={local.isSecondaryActionDisabled}
                autoFocus={local.autoFocusButton === "secondary"}
                onPress={() => runAction(close, local.onSecondaryAction)}
              >
                {local.secondaryActionLabel}
              </Button>
            </Show>
            <Button
              variant={primaryVariant(variant())}
              isDisabled={local.isPrimaryActionDisabled}
              autoFocus={local.autoFocusButton === "primary"}
              onPress={() => runAction(close, local.onPrimaryAction)}
            >
              {primaryActionLabel()}
            </Button>
          </ButtonGroup>
        </>
      )}
    </Dialog>
  );

  if (
    local.trigger !== undefined ||
    local.isOpen !== undefined ||
    local.defaultOpen !== undefined
  ) {
    return (
      <DialogTrigger
        trigger={local.trigger}
        isOpen={local.isOpen}
        defaultOpen={local.defaultOpen}
        onOpenChange={local.onOpenChange}
      >
        {local.trigger}
        {dialog()}
      </DialogTrigger>
    );
  }

  return dialog();
}
