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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Text.tsx

import { type JSX, createContext, splitProps } from "solid-js";
import { ElementTag } from "./ElementTag";
import { type ContextValue, type SlotProps, useContextProps, filterDOMProps } from "./utils";

export interface TextProps extends JSX.HTMLAttributes<HTMLElement>, SlotProps {
  /** The element type to render as. @default 'span' */
  elementType?: string;
}

/**
 * Slotted context for `Text`. A field provides description / errorMessage props
 * (each carrying the `id` its `aria-describedby` references) under named slots,
 * so a `<Text slot="description">` child picks up the right `id` without the field
 * threading it manually. It matches the upstream `TextContext` (default
 * `{}` so an unprovided `Text` merges against an empty context and renders as-is).
 */
export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>({});

/**
 * A piece of text, typically a label, description, or error message inside a
 * field. It adapts the pinned `Text` component and consumes its slot from
 * `TextContext` (via `useContextProps`) so a field can supply the `id` and other
 * props for the matching slot, then renders them onto the element.
 */
export function Text(props: TextProps): JSX.Element {
  const [merged] = useContextProps(props, undefined, TextContext);
  // RAC `Text.tsx:28-31` spreads remaining props — including `slot` — onto the
  // element. `ref`/`class`/`children`/`elementType` are rendered explicitly.
  const [local, domProps] = splitProps(merged, ["elementType", "class", "children", "ref"]);
  return (
    <ElementTag
      class={local.class ?? "solidaria-Text"}
      {...filterDOMProps(domProps, { global: true })}
      slot={merged.slot}
      // last, so a stray `tag` in the spread can never redirect the element
      tag={local.elementType ?? "span"}
    >
      {local.children}
    </ElementTag>
  );
}
