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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/separator/useSeparator.ts

/**
 * createSeparator - SolidJS implementation of React Aria's useSeparator
 *
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 *
 * Ported from packages/react-aria/src/separator/useSeparator.ts.
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
  /** Identifies the element(s) that describes the separator. */
  "aria-describedby"?: string;
  /** Identifies the element(s) that provide a detailed description. */
  "aria-details"?: string;
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

    if (p.elementType !== "hr") {
      return {
        ...domProps,
        role: "separator",
        "aria-orientation": ariaOrientation,
      };
    }

    return {
      ...domProps,
    };
  };

  return {
    get separatorProps() {
      return getSeparatorProps();
    },
  };
}
