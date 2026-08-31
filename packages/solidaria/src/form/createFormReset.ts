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

    const form = element.form;
    if (!form) return;

    const handleReset = () => {
      onReset(defaultValue);
    };

    form.addEventListener("reset", handleReset);

    onCleanup(() => {
      form.removeEventListener("reset", handleReset);
    });
  });
}
