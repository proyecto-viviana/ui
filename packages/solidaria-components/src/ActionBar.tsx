/**
 * ActionBar component for solidaria-components
 *
 * Headless action bar that appears when items are selected in a collection.
 * Shows a selection count, clear button, and action buttons.
 *
 * No RAC headless equivalent — this is a thin component layer that ties
 * selection state to visibility and keyboard behavior.
 */

import {
  type JSX,
  type ParentProps,
  Show,
  createContext,
  createMemo,
  createEffect,
  splitProps,
  useContext,
} from "solid-js";
import { announce, createToolbar } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface ActionBarRenderProps {
  /** Whether the action bar is visible. */
  isOpen: boolean;
  /** The number of selected items. */
  selectedItemCount: number | "all";
}

export interface ActionBarProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "style" | "children" | "ref" | "slot">,
    SlotProps {
  /** The number of selected items. ActionBar is hidden when 0. @default 0 */
  selectedItemCount?: number | "all";
  /** Callback when the clear button is pressed. */
  onClearSelection?: () => void;
  /** Callback when an action is triggered. */
  onAction?: (key: Key) => void;
  /** The action buttons to display. */
  children?: JSX.Element;
  /** CSS class for the container. */
  class?: ClassNameOrFunction<ActionBarRenderProps>;
  /** Inline style for the container. */
  style?: StyleOrFunction<ActionBarRenderProps>;
  /** Accessible label for the action bar. @default 'Actions' */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the action bar. */
  "aria-labelledby"?: string;
  /** Optional keydown handler on the action bar element. */
  onKeyDown?: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent>;
  /** Ref for the underlying action bar element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface ActionBarContextValue {
  selectedItemCount: () => number | "all";
  onClearSelection?: () => void;
  onAction?: (key: Key) => void;
}

export const ActionBarContext = createContext<ActionBarContextValue | null>(null);

export function useActionBarContext(): ActionBarContextValue | null {
  return useContext(ActionBarContext);
}

export function ActionBar(props: ActionBarProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "selectedItemCount",
    "onClearSelection",
    "onAction",
    "children",
    "class",
    "style",
    "slot",
    "aria-label",
    "aria-labelledby",
    "onKeyDown",
    "ref",
  ]);

  const selectedItemCount = () => local.selectedItemCount ?? 0;
  const isOpen = () => selectedItemCount() !== 0;

  const { toolbarProps } = createToolbar({
    orientation: "horizontal",
    get "aria-label"() {
      return local["aria-label"] ?? (local["aria-labelledby"] ? undefined : "Actions");
    },
    get "aria-labelledby"() {
      return local["aria-labelledby"];
    },
  });

  let wasOpen = false;
  createEffect(() => {
    const open = isOpen();
    if (open && !wasOpen) {
      announce("Actions available.");
    }
    wasOpen = open;
  });

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (e) => {
    const onKeyDown = local.onKeyDown as
      | JSX.EventHandler<HTMLDivElement, KeyboardEvent>
      | undefined;
    onKeyDown?.(e);
    if (e.defaultPrevented) {
      return;
    }

    if (e.key === "Escape" && isOpen()) {
      e.preventDefault();
      e.stopPropagation();
      local.onClearSelection?.();
    }
  };

  const renderProps = useRenderProps(
    {
      children: undefined,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ActionBar",
    },
    () => ({
      isOpen: isOpen(),
      selectedItemCount: selectedItemCount(),
    }),
  );

  const filteredDOMProps = createMemo(() =>
    filterDOMProps(domProps as Record<string, unknown>, { global: true }),
  );

  const contextValue = createMemo<ActionBarContextValue>(() => ({
    selectedItemCount,
    onClearSelection: local.onClearSelection,
    onAction: local.onAction,
  }));

  return (
    <Show when={isOpen()}>
      <ActionBarContext.Provider value={contextValue()}>
        <div
          {...filteredDOMProps()}
          {...toolbarProps}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot}
          data-open={isOpen() || undefined}
          onKeyDown={handleKeyDown}
          ref={(el) => assignRef(local.ref, el)}
        >
          {local.children}
        </div>
      </ActionBarContext.Provider>
    </Show>
  );
}

export interface ActionBarContainerProps extends ParentProps {
  class?: string;
  style?: JSX.CSSProperties;
}

/**
 * Container that positions a collection and its ActionBar.
 */
export function ActionBarContainer(props: ActionBarContainerProps): JSX.Element {
  return (
    <div
      class={props.class ?? "solidaria-ActionBarContainer"}
      style={{ position: "relative", ...props.style }}
    >
      {props.children}
    </div>
  );
}

export interface ActionBarSelectionCountProps {
  class?: string;
}

/**
 * Displays the count of selected items.
 */
export function ActionBarSelectionCount(props: ActionBarSelectionCountProps): JSX.Element {
  const ctx = useActionBarContext();

  const text = () => {
    if (!ctx) return "";
    const count = ctx.selectedItemCount();
    if (count === "all") return "All selected";
    if (count === 0) return "None selected";
    return `${count} selected`;
  };

  return <span class={props.class}>{text()}</span>;
}

export interface ActionBarClearButtonProps {
  class?: string;
  children?: JSX.Element;
  "aria-label"?: string;
}

/**
 * Button to clear the current selection.
 */
export function ActionBarClearButton(props: ActionBarClearButtonProps): JSX.Element {
  const ctx = useActionBarContext();

  return (
    <button
      type="button"
      aria-label={props["aria-label"] ?? "Clear selection"}
      class={props.class}
      onClick={() => ctx?.onClearSelection?.()}
    >
      {props.children ?? "\u2715"}
    </button>
  );
}
