/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/actionbar/ActionBarContainer.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ActionBar.tsx

/**
 * ActionBar component for solidaria-components
 *
 * Headless action bar that appears when items are selected in a collection.
 * Shows a selection count, clear button, and action buttons.
 *
 * Based on packages/@react-spectrum/s2/src/ActionBar.tsx and
 * https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/actionbar/ActionBarContainer.tsx.
 * The Solid port keeps the S2 action-bar structure and the Spectrum
 * ActionBarContainer ownership model. It exposes the selection count and clear
 * action as separate headless primitives.
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
import { announce } from "@proyecto-viviana/solidaria";
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
  /** Screen reader announcement when the action bar becomes available. */
  actionsAvailableMessage?: string;
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
    "actionsAvailableMessage",
    "ref",
  ]);

  const selectedItemCount = () => local.selectedItemCount ?? 0;
  const isOpen = () => selectedItemCount() !== 0;

  // Faithful to S2 `ActionBar` (ActionBar.tsx:192): the ROOT is a PLAIN
  // container with NO `role` — S2 spreads only `keyboardProps` (an Escape
  // handler that clears the selection) onto it. The single `toolbar` is the
  // inner `ActionButtonGroup` (styled layer), NOT this root. Applying
  // `createToolbar` here would (a) give the root a spurious `role="toolbar"`
  // S2 never renders and (b) nest the real action toolbar inside it, forcing
  // its role to downgrade to `group`. So the root deliberately carries no
  // toolbar props — `aria-label`/`aria-labelledby` are consumed by the inner
  // ActionButtonGroup at the styled layer.
  let wasOpen = false;
  createEffect(() => {
    const open = isOpen();
    const message = local.actionsAvailableMessage;
    if (open && !wasOpen && message) {
      announce(message);
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
