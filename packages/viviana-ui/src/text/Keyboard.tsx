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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Content.tsx

// Port of packages/@react-spectrum/s2/src/Content.tsx.

import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";
import { typeRoles } from "./type-roles";

export interface KeyboardProps extends BaseContentProps<HTMLElement> {}

export const KeyboardContext = createContext<SpectrumContextValue<KeyboardProps>>(null);

export function Keyboard(props: KeyboardProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(KeyboardContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as KeyboardProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      /* Standalone default: the register's terminal role (mono, wells & prompts).
       * Skipped whenever a slotted context claims this <kbd> — MenuItem and other
       * hosts style their key hints through KeyboardContext, usually relying on
       * inheritance the baked role would break. See text/index.tsx for the full
       * rationale. */
      mergeContextStyles(
        contextProps == null ? typeRoles.terminal : undefined,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <kbd
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
      dir="ltr"
    >
      {local.children}
    </kbd>
  );
}
