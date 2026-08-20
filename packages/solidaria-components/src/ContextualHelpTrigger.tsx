/**
 * ContextualHelpTrigger headless component
 *
 * A button trigger that opens contextual help in a popover or dialog.
 * Uses existing overlay infrastructure.
 */

import { type JSX, createSignal, splitProps, Show, createEffect, createUniqueId } from "solid-js";
import { createInteractOutside } from "@proyecto-viviana/solidaria";

export interface ContextualHelpTriggerProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "children"
> {
  /** Whether the trigger is currently unavailable (shows different styling). */
  isUnavailable?: boolean;
  /**
   * Two children: [trigger element, help content].
   * The trigger renders as a button, the content opens in a popover.
   */
  children?: [JSX.Element, JSX.Element];
  /** CSS class name. */
  class?: string;
  /** Whether the trigger is disabled. */
  isDisabled?: boolean;
}

export interface ContextualHelpTriggerRenderProps {
  isOpen: boolean;
  isUnavailable: boolean;
  isDisabled: boolean;
}

/**
 * A trigger that opens contextual help content.
 *
 * @example
 * ```tsx
 * <ContextualHelpTrigger>
 *   {[
 *     <span>What is this?</span>,
 *     <div>Help content goes here...</div>
 *   ]}
 * </ContextualHelpTrigger>
 * ```
 */
export function ContextualHelpTrigger(props: ContextualHelpTriggerProps): JSX.Element {
  const [local, triggerProps] = splitProps(props, [
    "isUnavailable",
    "children",
    "class",
    "isDisabled",
  ]);
  const [isOpen, setIsOpen] = createSignal(false);
  const triggerId = createUniqueId();
  const contentId = createUniqueId();
  // Signal refs, not `let` refs: the jsx-preserving package build DCE's reads of
  // `let` refs as always-undefined (JSX `ref={el}` is not a JS write), which
  // deleted the outside-dismiss `close()` and the focus restores.
  const [rootEl, setRootEl] = createSignal<HTMLDivElement | null>(null);
  const [triggerEl, setTriggerEl] = createSignal<HTMLButtonElement | null>(null);
  const [contentEl, setContentEl] = createSignal<HTMLDivElement | null>(null);

  const isUnavailable = () => local.isUnavailable ?? false;
  const isDisabled = () => local.isDisabled ?? false;

  const toggle = () => {
    if (!isDisabled()) {
      setIsOpen(!isOpen());
    }
  };

  const close = () => setIsOpen(false);

  const callHandler = <E extends Event>(
    handler: JSX.EventHandlerUnion<HTMLButtonElement, E> | undefined,
    event: E,
  ) => {
    if (!handler) return;
    if (Array.isArray(handler)) {
      handler[1].call(handler[0], event);
      return;
    }
    if (typeof handler === "function") {
      (handler as (evt: E) => void)(event);
      return;
    }
    if (
      typeof handler === "object" &&
      "handleEvent" in handler &&
      typeof handler.handleEvent === "function"
    ) {
      (handler.handleEvent as (evt: E) => void)(event);
    }
  };

  const handleTriggerClick = (e: MouseEvent) => {
    callHandler(triggerProps.onClick, e);
    if (e.defaultPrevented) return;
    toggle();
  };

  const handleTriggerKeyDown = (e: KeyboardEvent) => {
    callHandler(triggerProps.onKeyDown, e);
    if (e.defaultPrevented) return;
    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      e.stopPropagation();
      close();
      triggerEl()?.focus();
    }
  };

  // Root wraps trigger + dialog, so a trigger click is not an outside
  // interaction (otherwise pointerdown-close + click-toggle would reopen).
  createInteractOutside({
    ref: rootEl,
    onInteractOutside: () => {
      close();
    },
    get isDisabled() {
      return !isOpen();
    },
  });

  createEffect(() => {
    if (!isOpen()) return;
    contentEl()?.focus();
  });

  const children = () => local.children ?? ([null, null] as [JSX.Element, JSX.Element]);
  const trigger = () => children()[0];
  const content = () => children()[1];

  return (
    <div
      ref={setRootEl}
      class={`solidaria-ContextualHelpTrigger ${local.class ?? ""}`}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        {...triggerProps}
        type="button"
        id={triggerId}
        ref={setTriggerEl}
        aria-haspopup="dialog"
        aria-expanded={isOpen()}
        aria-controls={isOpen() ? contentId : undefined}
        data-unavailable={isUnavailable() || undefined}
        data-disabled={isDisabled() || undefined}
        disabled={isDisabled()}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        class="solidaria-ContextualHelpTrigger-trigger"
      >
        {trigger()}
      </button>

      <Show when={isOpen()}>
        <div
          id={contentId}
          ref={setContentEl}
          role="dialog"
          aria-labelledby={triggerId}
          tabIndex={-1}
          class="solidaria-ContextualHelpTrigger-content"
          style={{ position: "absolute", "z-index": "50" }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              e.stopPropagation();
              close();
              triggerEl()?.focus();
            }
          }}
        >
          {content()}
        </div>
      </Show>
    </div>
  );
}
