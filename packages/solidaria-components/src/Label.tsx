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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Label.tsx

import { type JSX, createContext, splitProps } from "solid-js";
import { ElementTag } from "./ElementTag";
import { type ContextValue, type RefLike, type SlotProps, useContextProps } from "./utils";

export interface LabelProps
  extends Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "ref">, SlotProps {
  /** The HTML element used to render the label. @default 'label' */
  elementType?: string;
  ref?: RefLike<HTMLElement>;
}

/** Props supplied to a Label by its parent component. */
export const LabelContext = createContext<ContextValue<LabelProps, HTMLElement>>({});

/**
 * A label that receives its element type and relationship props from a parent.
 * This is a Solid adaptation of the pinned Label component.
 */
export function Label(props: LabelProps): JSX.Element {
  const [merged, ref] = useContextProps(props, props.ref, LabelContext);
  const [local, domProps] = splitProps(merged, ["elementType", "class", "children", "slot", "ref"]);

  return (
    <ElementTag
      {...domProps}
      ref={ref}
      class={local.class ?? "solidaria-Label"}
      tag={local.elementType ?? "label"}
    >
      {local.children}
    </ElementTag>
  );
}
