/**
 * VisuallyHidden component for solidaria-components
 *
 * Hides content visually but keeps it accessible to screen readers.
 * Port of react-aria's VisuallyHidden.
 */

import { type JSX, type ParentProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { createVisuallyHidden, mergeProps } from "@proyecto-viviana/solidaria";

export interface VisuallyHiddenProps extends ParentProps, JSX.HTMLAttributes<HTMLElement> {
  /** The element type to render. @default 'span' */
  elementType?: keyof JSX.IntrinsicElements;
  /** Whether the element should be focusable when focused. */
  isFocusable?: boolean;
  /** Inline style object merged with visually hidden styles. */
  style?: JSX.CSSProperties;
}

/**
 * VisuallyHidden hides its children visually, while keeping content visible to screen readers.
 */
export function VisuallyHidden(props: VisuallyHiddenProps): JSX.Element {
  // Split children so the getter is not read once through `{...mergedProps()}`
  // and again during explicit rendering. Hydration code is sensitive to that.
  const [local, others] = splitProps(props, ["elementType", "isFocusable", "style", "children"]);
  const { visuallyHiddenProps } = createVisuallyHidden(() => ({
    style: local.style,
    isFocusable: local.isFocusable,
  }));

  const mergedProps = () =>
    mergeProps<Record<string, unknown>>(
      others as unknown as Record<string, unknown>,
      visuallyHiddenProps() as unknown as Record<string, unknown>,
    );

  // elementType is read once (structural, not reactive). The default `span` is
  // rendered as a static element rather than via `<Dynamic>`: a reactive
  // `<Dynamic>` desyncs Solid's hydration markers, leaving the registry dirty so
  // a later sibling re-render throws "template is not a function" in prod (and a
  // hard hydration crash under solid-refresh in dev). `<Dynamic>` is reserved for
  // an explicit custom elementType.
  const tag = local.elementType ?? "span";
  if (tag === "span") {
    return <span {...mergedProps()}>{local.children}</span>;
  }
  return (
    <Dynamic component={tag} {...mergedProps()}>
      {local.children}
    </Dynamic>
  );
}
