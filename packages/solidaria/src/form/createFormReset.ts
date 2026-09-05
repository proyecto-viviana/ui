/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useFormReset.ts

/**
 * createFormReset - Handles form reset events for form fields.
 *
 * Resets the field value to its default when the containing form is reset.
 * Port of @react-aria/utils useFormReset.
 */

import { type Accessor, createEffect, onCleanup } from "solid-js";

export interface FormResetOptions<T> {
  /** The default value to reset to. */
  defaultValue: T;
  /** Function to set the current value. */
  onReset: (value: T) => void;
}

/**
 * Listens for form reset events and resets the field value to its default.
 *
 * @example
 * ```tsx
 * createFormReset(
 *   () => inputRef,
 *   { label: 'Default' },
 *   (value) => state.setSelectedKey(value.key)
 * );
 * ```
 */
export function createFormReset<T>(
  ref: Accessor<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined>,
  defaultValue: T,
  onReset: (value: T) => void,
): void {
  createEffect(() => {
    const element = ref();
    if (!element) return;

    const handleReset = (e: Event) => {
      if (e.defaultPrevented) return;
      // RAC useFormReset binds the form captured at effect time
      // (`useFormReset.ts:29`). A `form` attribute associated after mount
      // (D14's injected probe form) leaves that capture null. Read the live
      // association when reset fires — same class of fix as #466.
      if (element.form && e.target === element.form) {
        onReset(defaultValue);
      }
    };

    // Reset bubbles. Listening on document covers late `form=""` without
    // capturing a null form at effect setup.
    document.addEventListener("reset", handleReset);
    onCleanup(() => {
      document.removeEventListener("reset", handleReset);
    });
  });
}
