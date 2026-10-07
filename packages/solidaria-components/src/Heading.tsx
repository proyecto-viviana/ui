/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Heading.tsx

import { createContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ElementTag } from "./ElementTag";
import {
  type ContextValue,
  type RefLike,
  type SlotProps,
  useContextProps,
  filterDOMProps,
} from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

export interface HeadingProps
  extends Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "ref">, SlotProps {
  /** The CSS className for the element. @default 'solidaria-Heading' */
  class?: string;
  /** The heading level. @default 3 */
  level?: 1 | 2 | 3 | 4 | 5 | 6 | number;
  ref?: RefLike<HTMLHeadingElement>;
}

export const HeadingContext = createContext<ContextValue<HeadingProps, HTMLHeadingElement>>({});

/**
 * A heading element displays a title for a section or component.
 */
export function Heading(props: HeadingProps): JSX.Element {
  const [merged, ref] = useContextProps(props, props.ref, HeadingContext);
  const [local, domProps] = splitProps(merged, ["children", "class", "level", "ref", "slot"]);

  const level = () => local.level ?? 3;
  const tag = () => `h${level()}`;

  return (
    <ElementTag
      {...filterDOMProps(domProps, { global: true })}
      ref={ref}
      class={local.class ?? "solidaria-Heading"}
      slot={local.slot || undefined}
      tag={tag()}
    >
      {local.children}
    </ElementTag>
  );
}
