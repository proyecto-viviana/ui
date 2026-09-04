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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Field.tsx

// Port of packages/@react-spectrum/s2/src/Field.tsx FieldLabel (contextualHelp).

import { type JSX, createEffect, createSignal, createUniqueId, Show } from "solid-js";
import { style } from "../style" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import { ContextualHelpContext, type ContextualHelpSize } from "../contextualhelp";

export type FieldContextualHelpSize = "XS" | "S" | "M" | "L" | "XL";

export interface FieldContextualHelpProps {
  /** The ContextualHelp trigger rendered next to a field label. */
  children?: JSX.Element;
  /**
   * Id of the visible field label. When omitted, the previous sibling's id
   * is used (label then help, matching S2 FieldLabel).
   */
  labelId?: string;
  /** Field size; L/XL map to ContextualHelp S, everything else XS. */
  size?: FieldContextualHelpSize;
}

const noWrap = style({
  whiteSpace: "nowrap",
});

const helpBaseline = style({
  display: "inline-flex",
  height: 0,
});

function helpButtonSize(size: FieldContextualHelpSize | undefined): ContextualHelpSize {
  return size === "L" || size === "XL" ? "S" : "XS";
}

/**
 * Wraps a field's `contextualHelp` the way S2 FieldLabel does: a stable
 * ContextualHelpContext id + aria-labelledby so the trigger does not remount
 * on field updates and Chromium names it "{Label} Help".
 */
export function FieldContextualHelp(props: FieldContextualHelpProps): JSX.Element {
  const helpId = createUniqueId();
  const [host, setHost] = createSignal<HTMLSpanElement | undefined>();

  createEffect(() => {
    const element = host();
    if (!element) {
      return;
    }
    const labelId = props.labelId ?? element.previousElementSibling?.id;
    const button = element.querySelector("button");
    if (!button) {
      return;
    }
    // Pre-created `<ContextualHelp>` runs under the field caller, so context
    // never reaches it. Stamp the S2 FieldLabel id + labelledby onto the
    // trigger after it mounts (Solid ownership vs React render-in-provider).
    button.id = helpId;
    const names = labelId ? `${labelId} ${helpId}` : undefined;
    if (names) {
      button.setAttribute("aria-labelledby", names);
    } else {
      button.removeAttribute("aria-labelledby");
    }
  });

  return (
    <Show when={Boolean(props.children)}>
      <span data-slot="contextualHelp" class={noWrap} ref={(element) => setHost(element)}>
        &nbsp;
        <CenterBaseline styles={helpBaseline}>
          <ContextualHelpContext.Provider
            value={{
              id: helpId,
              get "aria-labelledby"() {
                const labelId = props.labelId ?? host()?.previousElementSibling?.id;
                return labelId ? `${labelId} ${helpId}` : undefined;
              },
              get size() {
                return helpButtonSize(props.size);
              },
            }}
          >
            {props.children}
          </ContextualHelpContext.Provider>
        </CenterBaseline>
      </span>
    </Show>
  );
}
