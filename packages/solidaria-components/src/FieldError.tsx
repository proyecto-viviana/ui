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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/FieldError.tsx

/**
 * FieldError primitive for solidaria-components.
 *
 * Displays validation errors for a field from context or explicit validation prop.
 * Based on packages/react-aria-components/src/FieldError.tsx.
 */

import { type JSX, Show, createContext, createMemo, splitProps, useContext } from "solid-js";
import { DEFAULT_VALIDATION_RESULT, type ValidationResult } from "@proyecto-viviana/solid-stately";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type RenderChildren,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { Text } from "./Text";

export type FieldErrorRenderProps = ValidationResult;

export interface FieldErrorContextValue {
  validation: ValidationResult | null;
  errorMessageProps?: JSX.HTMLAttributes<HTMLElement>;
}

export interface FieldErrorProps
  extends Omit<JSX.HTMLAttributes<HTMLElement>, "children" | "class" | "style">, SlotProps {
  /** Validation result. Falls back to context when omitted. */
  validation?: ValidationResult | null;
  /** The children of the component. */
  children?: RenderChildren<FieldErrorRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<FieldErrorRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<FieldErrorRenderProps>;
  /**
   * The HTML element type to render. Defaults to `'span'`.
   * Set to `'div'` when using block-level children (e.g. `<ul>`) to avoid invalid HTML.
   *
   * @default 'span'
   */
  elementType?: string;
}

export const FieldErrorContext = createContext<ValidationResult | FieldErrorContextValue | null>(
  null,
);

export function FieldError(props: FieldErrorProps): JSX.Element | null {
  const contextValue = useContext(FieldErrorContext);
  const contextValidation = () => {
    if (contextValue && "validation" in contextValue) {
      return contextValue.validation;
    }
    return contextValue;
  };
  const contextErrorMessageProps = () => {
    if (contextValue && "validation" in contextValue) {
      return contextValue.errorMessageProps ?? {};
    }
    return {};
  };
  const [local, domProps] = splitProps(props, [
    "validation",
    "children",
    "class",
    "style",
    "slot",
    "elementType",
  ]);

  const validation = createMemo<ValidationResult | null>(
    () => local.validation ?? contextValidation(),
  );

  const renderProps = useRenderProps(
    {
      children:
        local.children ?? ((currentValidation) => currentValidation.validationErrors.join(" ")),
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-FieldError",
    },
    () => validation() ?? DEFAULT_VALIDATION_RESULT,
  );

  const filteredDomProps = filterDOMProps(domProps, { global: true });
  const children = () => renderProps.renderChildren();

  return (
    <Show when={validation()?.isInvalid && children()}>
      <Text
        {...(contextErrorMessageProps() as unknown as JSX.HTMLAttributes<HTMLElement>)}
        {...(filteredDomProps as JSX.HTMLAttributes<HTMLElement>)}
        slot={local.slot ?? "errorMessage"}
        elementType={local.elementType}
        class={renderProps.class()}
        style={renderProps.style()}
      >
        {children()}
      </Text>
    </Show>
  );
}
