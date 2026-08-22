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

// Port of packages/@react-spectrum/s2/src/Field.tsx.

import { type JSX, splitProps, Show } from "solid-js";
import { style } from "../style" with { type: "macro" };

export interface HelpTextProps {
  /** The description text. */
  description?: string;
  /** The error message text. */
  errorMessage?: string;
  /** Whether the field is in an error state. */
  isInvalid?: boolean;
  /** Whether the help text is disabled (dimmed). */
  isDisabled?: boolean;
  /** Additional CSS class name. */
  class?: string;
}

// Mirrors S2's `helpTextStyles` (Field.tsx): the small UI font with a
// `neutral-subdued` description color that flips to `negative` for errors and
// `disabled` when the field is disabled. Emitted via the `style()` macro so the
// CSS ships in the package bundle for installed consumers.
const helpTextStyles = style<{ isInvalid?: boolean; isDisabled?: boolean }>({
  font: "ui-sm",
  color: {
    default: "neutral-subdued",
    isInvalid: "negative",
    isDisabled: "disabled",
  },
});

/**
 * Displays description or error text below a form field.
 */
export function HelpText(props: HelpTextProps): JSX.Element {
  const [local] = splitProps(props, [
    "description",
    "errorMessage",
    "isInvalid",
    "isDisabled",
    "class",
  ]);

  const showError = () => local.isInvalid && local.errorMessage;

  return (
    <div class={local.class}>
      <Show when={showError()}>
        <p class={helpTextStyles({ isInvalid: true })} role="alert">
          {local.errorMessage}
        </p>
      </Show>
      <Show when={!showError() && local.description}>
        <p class={helpTextStyles({ isDisabled: local.isDisabled })}>{local.description}</p>
      </Show>
    </div>
  );
}
