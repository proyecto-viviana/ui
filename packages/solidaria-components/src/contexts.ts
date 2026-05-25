/**
 * Shared contexts for overlay components.
 *
 * These are separated to avoid circular dependencies between
 * Dialog, Modal, Popover, and Button components.
 */

import { createContext, useContext } from "solid-js";
import type { OverlayTriggerState as StatelyOverlayTriggerState } from "@proyecto-viviana/solid-stately";

export interface OverlayTriggerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const OverlayTriggerStateContext = createContext<OverlayTriggerState | null>(null);

/**
 * Hook to access the overlay trigger state from context.
 */
export function useOverlayTriggerState(): OverlayTriggerState | null {
  return useContext(OverlayTriggerStateContext);
}

export interface DialogTriggerContextValue {
  state: StatelyOverlayTriggerState;
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (el: HTMLElement | null) => void;
  triggerId: string;
  triggerProps?: Record<string, unknown>;
  overlayProps?: Record<string, unknown>;
}

export const DialogTriggerContext = createContext<DialogTriggerContextValue | null>(null);

/**
 * Hook to access the dialog trigger state from context.
 */
export function useDialogTrigger(): DialogTriggerContextValue | null {
  return useContext(DialogTriggerContext);
}

export interface PopoverTriggerContextValue {
  state: {
    isOpen: () => boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
  };
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (el: HTMLElement | null) => void;
  triggerId: string;
  triggerProps?: Record<string, unknown>;
  overlayProps?: Record<string, unknown>;
  trigger: string;
}

export const PopoverTriggerContext = createContext<PopoverTriggerContextValue | null>(null);

/**
 * Hook to access the popover trigger state from context.
 */
export function usePopoverTrigger(): PopoverTriggerContextValue | null {
  return useContext(PopoverTriggerContext);
}
