/**
 * Shared SelectionIndicator primitive for selected collection items.
 */

import { type JSX, createContext, createMemo, splitProps, useContext, Show } from "solid-js";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
} from "./utils";
import { SharedElement, useHasSharedElementTransitionScope } from "./SharedElementTransition";

export interface SelectionIndicatorContextValue {
  isSelected: () => boolean;
}

export const SelectionIndicatorContext = createContext<SelectionIndicatorContextValue | null>(null);

export interface SelectionIndicatorRenderProps {
  /** Whether the parent item is selected. */
  isSelected: boolean;
}

export interface SelectionIndicatorProps
  extends SlotProps, Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "style" | "children"> {
  /** Optional controlled selected state override. */
  isSelected?: boolean;
  /** Whether to keep mounted when not selected. */
  shouldForceMount?: boolean;
  /** The children content. */
  children?: RenderChildren<SelectionIndicatorRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectionIndicatorRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectionIndicatorRenderProps>;
}

/**
 * SelectionIndicator renders when its parent item is selected.
 */
export function SelectionIndicator(props: SelectionIndicatorProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "isSelected",
    "shouldForceMount",
    "children",
    "class",
    "style",
    "slot",
  ]);

  const context = useContext(SelectionIndicatorContext);
  const hasSharedElementScope = useHasSharedElementTransitionScope();
  const isSelected = () => local.isSelected ?? context?.isSelected() ?? false;
  const isVisible = () => local.shouldForceMount || isSelected();

  const renderValues = createMemo<SelectionIndicatorRenderProps>(() => ({
    isSelected: isSelected(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SelectionIndicator",
    },
    renderValues,
  );

  const sharedElementProps = createMemo(() => {
    const { ref: _ref, ...rest } = domProps as JSX.HTMLAttributes<HTMLSpanElement> & {
      ref?: unknown;
    };
    return rest;
  });

  if (hasSharedElementScope) {
    return (
      <SharedElement
        {...sharedElementProps()}
        name="SelectionIndicator"
        isVisible={isVisible()}
        aria-hidden="true"
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={isSelected() || undefined}
      >
        {renderProps.renderChildren()}
      </SharedElement>
    );
  }

  return (
    <Show when={isVisible()}>
      <span
        {...domProps}
        aria-hidden="true"
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={isSelected() || undefined}
      >
        {renderProps.renderChildren()}
      </span>
    </Show>
  );
}
