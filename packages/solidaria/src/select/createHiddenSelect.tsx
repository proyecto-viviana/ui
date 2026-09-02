/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/select/HiddenSelect.tsx

/**
 * Provides a hidden native select element for form integration.
 * Ported from packages/react-aria/src/select/HiddenSelect.tsx.
 */

import { type JSX, type Accessor, For, Show, createEffect, onCleanup } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createFormValidation } from "../form/createFormValidation";
import { visuallyHiddenStyles } from "../visually-hidden/createVisuallyHidden";
import type { SelectState, Key, FormValidationState } from "@proyecto-viviana/solid-stately";

export type ValidationBehavior = "aria" | "native";

export interface AriaHiddenSelectProps<T> {
  /** The state object for the select. */
  state: SelectState<T>;
  /** The name attribute for the hidden select. */
  name?: string;
  /** Whether the select is disabled. */
  isDisabled?: boolean;
  /** Whether the select is required. */
  isRequired?: boolean;
  /** Describes the type of autocomplete functionality the select should provide. */
  autoComplete?: string;
  /** The `form` attribute to associate the select with a form by ID. */
  form?: string;
  /** Validation behavior: 'aria' for realtime, 'native' for on submit. */
  validationBehavior?: ValidationBehavior;
  /** A ref to the trigger element for focus on validation error. */
  triggerRef?: Accessor<HTMLElement | null>;
  /** Form validation state (optional, for native validation). */
  validationState?: FormValidationState;
}

export interface HiddenSelectAria {
  /** Props for the container element. */
  containerProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the hidden select element. */
  selectProps: JSX.SelectHTMLAttributes<HTMLSelectElement>;
  /** Props for the hidden input element (for form submission). */
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
}

/**
 * Provides the accessibility implementation for a hidden select.
 * This is used for native form submission and accessibility on mobile devices.
 */
export function createHiddenSelect<T>(
  props: MaybeAccessor<AriaHiddenSelectProps<T>>,
): HiddenSelectAria {
  const getProps = () => access(props);

  // Track the select element for form reset/validation
  let selectRef: HTMLSelectElement | undefined;

  // Set up form reset handler
  createEffect(() => {
    const p = getProps();
    if (!selectRef) return;

    const form = selectRef.form;
    if (!form) return;

    const handleReset = () => {
      // Reset to default selected key (first key or null)
      const defaultKey = p.state.collection().getFirstKey();
      p.state.setSelectedKey(defaultKey);
    };

    form.addEventListener("reset", handleReset);

    onCleanup(() => {
      form.removeEventListener("reset", handleReset);
    });
  });

  // Set up form validation handler for native validation
  createEffect(() => {
    const p = getProps();
    if (!selectRef || p.validationBehavior !== "native" || !p.validationState) return;

    createFormValidation(
      {
        validationBehavior: p.validationBehavior,
        focus: () => p.triggerRef?.()?.focus(),
      },
      p.validationState,
      () => selectRef,
    );
  });

  return {
    get containerProps() {
      return {
        style: {
          ...visuallyHiddenStyles,
          position: "fixed",
          top: 0,
          left: 0,
        },
        "aria-hidden": true,
        "data-a11y-ignore": "aria-hidden-focus",
        "data-react-aria-prevent-focus": true,
      } as JSX.HTMLAttributes<HTMLDivElement>;
    },
    get selectProps() {
      const p = getProps();
      const state = p.state;
      const selectedKey = state.selectedKey();
      const selectedKeys =
        typeof state.selectedKeys === "function"
          ? state.selectedKeys()
          : selectedKey != null
            ? new Set([selectedKey])
            : new Set<Key>();
      const validationBehavior = p.validationBehavior ?? "aria";
      const isMultiple =
        typeof state.selectionMode === "function" && state.selectionMode() === "multiple";
      const multipleValue =
        selectedKeys === "all"
          ? Array.from(state.collection()).map((item) => String(item.key))
          : Array.from(selectedKeys).map(String);

      return {
        ref: (el: HTMLSelectElement) => {
          selectRef = el;
        },
        tabIndex: -1,
        autoComplete: p.autoComplete,
        disabled: p.isDisabled ?? state.isDisabled,
        multiple: isMultiple || undefined,
        name: p.name,
        form: p.form,
        // Add required attribute for native form validation
        required: validationBehavior === "native" && p.isRequired,
        value: isMultiple ? multipleValue : selectedKey != null ? String(selectedKey) : "",
        onChange: (e: Event) => {
          const target = e.target as HTMLSelectElement;
          if (isMultiple) {
            if (typeof state.setSelectedKeys === "function") {
              state.setSelectedKeys(Array.from(target.selectedOptions).map((o) => o.value as Key));
            } else {
              const first = target.selectedOptions[0]?.value;
              state.setSelectedKey((first ?? null) as Key | null);
            }
          } else {
            state.setSelectedKey(target.value as Key);
          }
        },
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          "font-size": "16px", // Prevents zoom on iOS
          border: "none",
          cursor: "default",
          margin: 0,
          padding: 0,
          "pointer-events": "none",
        },
      } as JSX.SelectHTMLAttributes<HTMLSelectElement>;
    },
    get inputProps() {
      const p = getProps();
      const state = p.state;
      const selectedKey = state.selectedKey();
      const validationBehavior = p.validationBehavior ?? "aria";

      // For native validation with required, use type="text" with display:none
      // so the browser will validate it on form submit
      const useTextInput = validationBehavior === "native" && p.isRequired;

      return {
        type: useTextInput ? "text" : "hidden",
        name: p.name,
        form: p.form,
        value: selectedKey != null ? String(selectedKey) : "",
        disabled: p.isDisabled ?? state.isDisabled,
        required: useTextInput ? p.isRequired : undefined,
        style: useTextInput ? { display: "none" } : undefined,
      } as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
  };
}

export interface HiddenSelectProps<T> {
  /** The state object for the select. */
  state: SelectState<T>;
  /** The name attribute for the hidden select. */
  name?: string;
  /** Whether the select is disabled. */
  isDisabled?: boolean;
  /** Whether the select is required. */
  isRequired?: boolean;
  /** A ref to the trigger element. */
  triggerRef?: () => HTMLElement | null;
  /** Label for the select. */
  label?: string;
  /** Describes the type of autocomplete functionality the select should provide. */
  autoComplete?: string;
  /** The `form` attribute to associate the select with a form by ID. */
  form?: string;
  /** Validation behavior: 'aria' for realtime, 'native' for on submit. */
  validationBehavior?: ValidationBehavior;
  /** Form validation state (optional, for native validation). */
  validationState?: FormValidationState;
}

/**
 * A component that renders a hidden native select for form submission.
 * This is useful on mobile devices where native select behavior is preferred.
 */
export function HiddenSelect<T>(props: HiddenSelectProps<T>): JSX.Element {
  const { containerProps, selectProps, inputProps } = createHiddenSelect({
    get state() {
      return props.state;
    },
    get name() {
      return props.name;
    },
    get isDisabled() {
      return props.isDisabled;
    },
    get isRequired() {
      return props.isRequired;
    },
    get autoComplete() {
      return props.autoComplete;
    },
    get form() {
      return props.form;
    },
    get validationBehavior() {
      return props.validationBehavior;
    },
    get triggerRef() {
      return props.triggerRef;
    },
    get validationState() {
      return props.validationState;
    },
  });

  const collection = () => props.state.collection();
  const selectedKey = () => props.state.selectedKey();
  const selectedKeys = () =>
    typeof props.state.selectedKeys === "function"
      ? props.state.selectedKeys()
      : selectedKey() != null
        ? new Set([selectedKey() as Key])
        : new Set<Key>();
  const isMultiple = () =>
    typeof props.state.selectionMode === "function" && props.state.selectionMode() === "multiple";
  const collectionSize = () => collection().size;
  const hiddenInputValues = (): Array<Key | null> => {
    if (isMultiple()) {
      const keys = selectedKeys();
      if (keys === "all") {
        return Array.from(collection()).map((item) => item.key);
      }
      const listed = Array.from(keys as Set<Key>);
      return listed.length === 0 ? [null] : listed;
    }
    return [selectedKey()];
  };

  // Mirror RAC HiddenSelect.tsx:172-244: a native <select> inside a <label>
  // for collections of ≤300 items (autofill); hidden <input>s only when the
  // collection is larger AND a form name is set. Never both.
  return (
    <Show
      when={collectionSize() <= 300}
      fallback={
        <Show when={props.name}>
          <For each={hiddenInputValues()}>
            {(value) => <input {...inputProps} value={value != null ? String(value) : ""} />}
          </For>
        </Show>
      }
    >
      <div {...containerProps} data-testid="hidden-select-container">
        <label>
          {props.label}
          <select {...selectProps}>
            <option value="" label={"\u00A0"}>
              {"\u00A0"}
            </option>
            <For each={Array.from(collection())}>
              {(item) => (
                <option
                  value={String(item.key)}
                  selected={
                    isMultiple()
                      ? selectedKeys() === "all"
                        ? true
                        : (selectedKeys() as Set<Key>).has(item.key)
                      : item.key === selectedKey()
                  }
                >
                  {item.textValue}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>
    </Show>
  );
}
