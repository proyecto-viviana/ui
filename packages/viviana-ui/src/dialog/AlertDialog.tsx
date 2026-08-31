/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/AlertDialog.tsx

// Port of packages/@react-spectrum/s2/src/AlertDialog.tsx.
import { type JSX, Show, splitProps } from "solid-js";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import { Button, type ButtonVariant } from "../button";
import { ButtonGroup } from "../buttongroup";
import { IconContext } from "../icon";
import { CenterBaseline } from "../icon/center-baseline";
import { AlertDiamondIcon } from "../icon/s2wf-icons/AlertDiamondIcon";
import { AlertTriangleIcon } from "../icon/s2wf-icons/AlertTriangleIcon";
import { s2IntlStrings } from "../intl";
import { Content, Heading } from "../text";
import { style } from "../style" with { type: "macro" };
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

const icon = style<{ variant?: AlertDialogVariant }>({
  marginEnd: 8,
  "--iconPrimary": {
    type: "fill",
    value: {
      variant: {
        error: "negative",
        warning: "notice",
      },
    },
  },
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
    "autoFocusButton",
    "size",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDismissible",
    "isDismissable",
    "class",
  ]);

  const formatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
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
          <IconContext.Provider value={{ styles: () => icon({ variant: variant() }) }}>
            <Heading slot="title">
              <CenterBaseline>
                <Show when={variant() === "error"}>
                  <AlertTriangleIcon
                    UNSAFE_suppressDataSlot
                    aria-label={formatter().format("dialog.alert")}
                  />
                </Show>
                <Show when={variant() === "warning"}>
                  <AlertDiamondIcon
                    UNSAFE_suppressDataSlot
                    aria-label={formatter().format("dialog.alert")}
                  />
                </Show>
                {local.title}
              </CenterBaseline>
            </Heading>
          </IconContext.Provider>
          <Content>{local.children}</Content>
          <ButtonGroup>
            <Show when={local.cancelLabel}>
              <Button
                variant="secondary"
                fillStyle="outline"
                autoFocus={local.autoFocusButton === "cancel"}
                onPress={() => runAction(close, local.onCancel)}
              >
                {local.cancelLabel}
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
