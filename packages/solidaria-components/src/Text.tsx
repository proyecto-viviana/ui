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

import { createContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import { ElementTag } from "./ElementTag";
import { joinSlotClass, useSlotValue } from "./slots";
import { type ContextValue, type SlotProps, useContextProps, filterDOMProps } from "./utils";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

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

function readDataRspSlot(props: object): string | undefined {
  const descriptor = Object.getOwnPropertyDescriptor(props, "data-rsp-slot");
  if (!descriptor) return undefined;
  const value = descriptor.get ? descriptor.get.call(props) : descriptor.value;
  return typeof value === "string" ? value : undefined;
}

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
  const slotValue = useSlotValue(() => (typeof merged.slot === "string" ? merged.slot : undefined));
  const slotName = () => slotValue()["data-rsp-slot"];
  // SlotContext names the slot when it has one. An authored `data-rsp-slot`
  // stays otherwise: writing `undefined` here would strip it. Upstream S2
  // `Text` always renders `data-rsp-slot="text"`; RAC `Text` spreads the prop.
  const dataRspSlot = () => slotName() ?? readDataRspSlot(domProps);
  return (
    <ElementTag
      class={joinSlotClass(local.class ?? "solidaria-Text", slotValue().class)}
      {...filterDOMProps(domProps, { global: true })}
      slot={merged.slot}
      data-rsp-slot={dataRspSlot()}
      // last, so a stray `tag` in the spread can never redirect the element
      tag={local.elementType ?? "span"}
    >
      {local.children}
    </ElementTag>
  );
}
