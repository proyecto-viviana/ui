/**
 * createSeparator - SolidJS implementation of React Aria's useSeparator
 *
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 */

import type { JSX } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { filterDOMProps } from "../utils";

export type Orientation = "horizontal" | "vertical";

export interface AriaSeparatorProps {
  /**
   * The orientation of the separator.
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /**
   * The HTML element type that will be used to render the separator.
   * @default 'hr'
   */
  elementType?: string;
  /** An accessibility label for the separator. */
  "aria-label"?: string;
  /** Identifies the element(s) that labels the separator. */
  "aria-labelledby"?: string;
  /** The element's unique identifier. */
  id?: string;
}

export interface SeparatorAria {
  /** Props for the separator element. */
  separatorProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides the accessibility implementation for a separator.
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 */
export function createSeparator(props: MaybeAccessor<AriaSeparatorProps> = {}): SeparatorAria {
  const getSeparatorProps = (): JSX.HTMLAttributes<HTMLElement> => {
    const p = access(props);
    const domProps = filterDOMProps(p as Record<string, unknown>, { labelable: true });

    // if orientation is horizontal, aria-orientation default is horizontal, so we leave it undefined
    // if it's vertical, we need to specify it
    let ariaOrientation: "vertical" | undefined;
    if (p.orientation === "vertical") {
      ariaOrientation = "vertical";
    }

    // React Aria Components emits an explicit separator role even for hr.
    // Keep horizontal aria-orientation implicit, but do not rely on the native role alone.
    if (p.elementType !== "hr") {
      return {
        ...domProps,
        role: "separator",
        "aria-orientation": ariaOrientation,
      };
    }

    return {
      ...domProps,
      role: "separator",
    };
  };

  return {
    get separatorProps() {
      return getSeparatorProps();
    },
  };
}
