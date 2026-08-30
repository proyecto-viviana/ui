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

export type FieldSize = "sm" | "md" | "lg";

export interface FieldProps {
  /** The label for the field. */
  label?: string;
  /** A description or help text for the field. */
  description?: string;
  /** An error message for the field. */
  errorMessage?: string;
  /** Whether the field is required. */
  isRequired?: boolean;
  /** Whether the field is disabled. */
  isDisabled?: boolean;
  /** Whether the field is invalid. */
  isInvalid?: boolean;
  /** The size of the field. @default 'md' */
  size?: FieldSize;
  /** Additional CSS class name. */
  class?: string;
  /** The field content (input element). */
  children?: JSX.Element;
  /** ID for the label's htmlFor attribute. */
  htmlFor?: string;
}

// Vertical field stack. The label/help-text colors mirror S2's `fieldLabel()`
// and `helpTextStyles` (`neutral-subdued`, flipping to `negative`/`disabled`);
// sizes map sm/md/lg → the UI font's xs/sm/base steps. Routed through the
// `style()` macro so the CSS ships in the package bundle for installed consumers.
const fieldStyles = style<{ size: FieldSize }>({
  display: "flex",
  flexDirection: "column",
  gap: { default: 8, size: { sm: 4, lg: 12 } },
});

const fieldLabelStyles = style<{ size: FieldSize; isDisabled?: boolean }>({
  font: { default: "ui-sm", size: { sm: "ui-xs", lg: "ui" } },
  color: { default: "neutral-subdued", isDisabled: "disabled" },
});

const fieldTextStyles = style<{ size: FieldSize; isInvalid?: boolean; isDisabled?: boolean }>({
  font: { default: "ui-sm", size: { sm: "ui-xs" } },
  color: { default: "neutral-subdued", isInvalid: "negative", isDisabled: "disabled" },
});

const requiredStyles = style({ color: "negative", marginStart: 2 });

/**
 * A field layout component that provides label, help text, and error message
 * around a form input.
 */
export function Field(props: FieldProps): JSX.Element {
  const [local] = splitProps(props, [
    "label",
    "description",
    "errorMessage",
    "isRequired",
    "isDisabled",
    "isInvalid",
    "size",
    "class",
    "children",
    "htmlFor",
  ]);

  const size = () => local.size ?? "md";
  const showError = () => local.isInvalid && local.errorMessage;

  return (
    <div class={[fieldStyles({ size: size() }), local.class].filter(Boolean).join(" ")}>
      <Show when={local.label}>
        <label
          for={local.htmlFor}
          class={fieldLabelStyles({ size: size(), isDisabled: local.isDisabled })}
        >
          {local.label}
          <Show when={local.isRequired}>
            <span class={requiredStyles}>*</span>
          </Show>
        </label>
      </Show>

      {local.children}

      <Show when={showError()}>
        <p class={fieldTextStyles({ size: size(), isInvalid: true })} role="alert">
          {local.errorMessage}
        </p>
      </Show>

      <Show when={!showError() && local.description}>
        <p class={fieldTextStyles({ size: size(), isDisabled: local.isDisabled })}>
          {local.description}
        </p>
      </Show>
    </div>
  );
}
