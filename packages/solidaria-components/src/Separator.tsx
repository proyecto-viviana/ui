/**
 * Separator component for solidaria-components
 *
 * Pre-wired headless separator component that combines aria hooks.
 * Port of react-aria-components/src/Separator.tsx
 */

import { type JSX, createContext, createMemo, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  createSeparator,
  type AriaSeparatorProps,
  type Orientation,
} from "@proyecto-viviana/solidaria";
import { type SlotProps, filterDOMProps } from "./utils";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface SeparatorRenderProps {
  /** The orientation of the separator. */
  orientation: Orientation;
}

export interface SeparatorProps extends AriaSeparatorProps, SlotProps {
  /** The CSS className for the element. A function may be provided to receive render props. */
  class?: string | ((renderProps: SeparatorRenderProps) => string);
  /** The inline style for the element. A function may be provided to receive render props. */
  style?: JSX.CSSProperties | ((renderProps: SeparatorRenderProps) => JSX.CSSProperties);
  /** Ref for the underlying separator element. */
  ref?: RefLike<HTMLElement>;
}

export const SeparatorContext = createContext<SeparatorProps | null>(null);

/**
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 *
 * @example
 * ```tsx
 * <Separator />
 *
 * // Vertical separator
 * <Separator orientation="vertical" />
 *
 * // Custom element type
 * <Separator elementType="div" />
 * ```
 */
export function Separator(props: SeparatorProps): JSX.Element {
  const [local, ariaProps] = splitProps(props, ["class", "style", "ref", "slot"]);

  const elementType = createMemo(() => {
    let element = ariaProps.elementType || "hr";
    // If vertical and using hr, switch to div since hr is inherently horizontal
    if (element === "hr" && ariaProps.orientation === "vertical") {
      element = "div";
    }
    return element;
  });

  const separatorAria = createSeparator({
    get orientation() {
      return ariaProps.orientation;
    },
    get elementType() {
      return ariaProps.elementType;
    },
    get "aria-label"() {
      return ariaProps["aria-label"];
    },
    get "aria-labelledby"() {
      return ariaProps["aria-labelledby"];
    },
    get "aria-describedby"() {
      return ariaProps["aria-describedby"];
    },
    get "aria-details"() {
      return ariaProps["aria-details"];
    },
    get id() {
      return ariaProps.id;
    },
  });

  const renderValues = createMemo<SeparatorRenderProps>(() => ({
    orientation: ariaProps.orientation ?? "horizontal",
  }));

  const resolvedClass = createMemo(() => {
    const cls = local.class;
    if (typeof cls === "function") {
      return cls(renderValues());
    }
    return cls ?? "solidaria-Separator";
  });

  const resolvedStyle = createMemo(() => {
    const style = local.style;
    if (typeof style === "function") {
      return style(renderValues());
    }
    return style;
  });

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  return (
    <Dynamic
      component={elementType()}
      {...domProps()}
      {...separatorAria.separatorProps}
      ref={(el: HTMLElement) => assignRef(local.ref, el)}
      class={resolvedClass()}
      style={resolvedStyle()}
      slot={local.slot}
    />
  );
}
