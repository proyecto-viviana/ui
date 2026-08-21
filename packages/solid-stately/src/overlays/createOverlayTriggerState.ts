/**
 * Manages state for an overlay trigger.
 * Based on @react-stately/overlays useOverlayTriggerState.
 */

import { createSignal, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";

export interface OverlayTriggerProps {
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Whether the overlay is open (controlled). */
  isOpen?: boolean;
  /** Handler that is called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface OverlayTriggerState {
  /** Whether the overlay is currently open. */
  readonly isOpen: Accessor<boolean>;
  /** Sets whether the overlay is open. */
  setOpen(isOpen: boolean): void;
  /** Opens the overlay. */
  open(): void;
  /** Closes the overlay. */
  close(): void;
  /** Toggles the overlay's visibility. */
  toggle(): void;
  /** Cursor position relative to the window viewport. */
  readonly point: Accessor<{ x: number; y: number } | null>;
  /** Sets the cursor position relative to the window viewport. */
  setPoint(point: { x: number; y: number }): void;
}

/**
 * Manages state for an overlay trigger. Tracks whether the overlay is open, and provides
 * methods to toggle this state.
 */
export function createOverlayTriggerState(
  props: MaybeAccessor<OverlayTriggerProps> = {},
): OverlayTriggerState {
  const propsAccessor = () => access(props);

  const [internalOpen, setInternalOpen] = createSignal(propsAccessor().defaultOpen ?? false);
  const [point, setPoint] = createSignal<{ x: number; y: number } | null>(null);

  const isOpen: Accessor<boolean> = () => {
    const p = propsAccessor();
    return p.isOpen !== undefined ? p.isOpen : internalOpen();
  };

  const setOpen = (open: boolean) => {
    const p = propsAccessor();
    if (p.isOpen === undefined) {
      setInternalOpen(open);
    }
    p.onOpenChange?.(open);
  };

  const open = () => setOpen(true);
  const close = () => setOpen(false);
  const toggle = () => setOpen(!isOpen());

  return {
    isOpen,
    setOpen,
    open,
    close,
    toggle,
    point,
    setPoint,
  };
}
