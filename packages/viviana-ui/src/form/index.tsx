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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Form.tsx

// Port of packages/@react-spectrum/s2/src/Form.tsx.

import { type JSX, createContext, splitProps, useContext } from "solid-js";
import {
  Form as HeadlessForm,
  FieldError as HeadlessFieldError,
  type FormProps as HeadlessFormProps,
  type FieldErrorProps as HeadlessFieldErrorProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import { createIsSkeleton } from "../skeleton";
import { assignRef } from "../button/spectrum-context";

export type FormSize = "S" | "M" | "L" | "XL";
export type FormLabelPosition = "top" | "side";
export type FormLabelAlign = "start" | "end";
export type FormNecessityIndicator = "icon" | "label";

export interface FormStyleProps {
  /** The size of descendant Form elements. @default 'M' */
  size?: FormSize;
  /** The label's overall position relative to each field. @default 'top' */
  labelPosition?: FormLabelPosition;
  /** The label's horizontal alignment relative to each field. @default 'start' */
  labelAlign?: FormLabelAlign;
  /** Whether required fields show an icon or text label. @default 'icon' */
  necessityIndicator?: FormNecessityIndicator;
  /** Whether descendant Form elements are required. */
  isRequired?: boolean;
  /** Whether descendant Form elements are disabled. */
  isDisabled?: boolean;
  /** Whether descendant Form elements are rendered with emphasized styling. */
  isEmphasized?: boolean;
}

export interface FormProps
  extends Omit<HeadlessFormProps, "class" | "style" | "ref">, FormStyleProps {
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  ref?: HeadlessFormProps["ref"];
}

export interface FieldErrorProps extends Omit<HeadlessFieldErrorProps, "class"> {
  class?: string;
}

export const FormContext = createContext<FormStyleProps | null>(null);

const formStylePropKeys = [
  "size",
  "labelPosition",
  "labelAlign",
  "necessityIndicator",
  "isRequired",
  "isDisabled",
  "isEmphasized",
] as const;

export function useIsInForm(): boolean {
  return useContext(FormContext) != null;
}

export function useFormProps<T extends object>(props: T): T {
  const context = useContext(FormContext);
  const isSkeleton = createIsSkeleton();

  const getInheritedValue = (property: PropertyKey) => {
    if (property === "isDisabled" && isSkeleton()) {
      return true;
    }

    if (typeof property !== "string") {
      return undefined;
    }

    return context?.[property as keyof FormStyleProps];
  };

  return new Proxy(props, {
    get(target, property, receiver) {
      if (property === "isDisabled" && isSkeleton()) {
        return true;
      }

      const localValue = Reflect.get(target, property, receiver);
      if (localValue !== undefined) {
        return localValue;
      }

      return getInheritedValue(property);
    },
    has(target, property) {
      return Reflect.has(target, property) || getInheritedValue(property) !== undefined;
    },
    ownKeys(target) {
      const keys = new Set<ReturnType<typeof Reflect.ownKeys>[number]>(Reflect.ownKeys(target));

      for (const key of formStylePropKeys) {
        if (getInheritedValue(key) !== undefined) {
          keys.add(key);
        }
      }

      return Array.from(keys);
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === "isDisabled" && isSkeleton()) {
        return {
          enumerable: true,
          configurable: true,
          get: () => true,
        };
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor) {
        return descriptor;
      }

      if (getInheritedValue(property) !== undefined) {
        return {
          enumerable: true,
          configurable: true,
          get: () => getInheritedValue(property),
        };
      }

      return undefined;
    },
  }) as T;
}

const formStyles = style<{ labelPosition: FormLabelPosition; size: FormSize }>(
  {
    display: "grid",
    gridTemplateColumns: {
      labelPosition: {
        top: ["[field] 1fr"],
        side: ["[label] auto", "[field] 1fr"],
      },
    },
    rowGap: {
      size: {
        S: 20,
        M: 24,
        L: 32,
        XL: 40,
      },
    },
    columnGap: "text-to-control",
  },
  getAllowedOverrides(),
);

export function Form(props: FormProps): JSX.Element {
  // Leave `children` on the headless rest props so they flow through as a
  // lazy Solid getter — do not split them off and re-wrap. A forced
  // `(rp) => children` render-prop wrapper desyncs createUniqueId between SSR
  // and client (Form+Button hydration mismatch). See solid-spectrum Form.
  const [local, headlessProps] = splitProps(props, [
    "size",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "isRequired",
    "isDisabled",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);

  const size = () => local.size ?? "M";
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";

  const contextValue: FormStyleProps = {
    get size() {
      return size();
    },
    get labelPosition() {
      return labelPosition();
    },
    get labelAlign() {
      return labelAlign();
    },
    get necessityIndicator() {
      return necessityIndicator();
    },
    get isRequired() {
      return local.isRequired;
    },
    get isDisabled() {
      return local.isDisabled;
    },
    get isEmphasized() {
      return local.isEmphasized;
    },
  };

  return (
    <FormContext.Provider value={contextValue}>
      <HeadlessForm
        {...headlessProps}
        ref={(el) => assignRef(local.ref, el)}
        class={[
          local.UNSAFE_className,
          formStyles({ size: size(), labelPosition: labelPosition() }, local.styles),
        ]
          .filter(Boolean)
          .join(" ")}
        style={local.UNSAFE_style}
      />
    </FormContext.Provider>
  );
}

// Small UI font in the `negative` color, mirroring S2's help-text error state.
const fieldErrorStyles = style({ font: "ui-sm", color: "negative" });

export function FieldError(props: FieldErrorProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  return (
    <HeadlessFieldError
      {...headlessProps}
      class={[fieldErrorStyles, local.class].filter(Boolean).join(" ")}
    />
  );
}

export { Field } from "./Field";
export type { FieldProps, FieldSize } from "./Field";
export { HelpText } from "./HelpText";
export type { HelpTextProps } from "./HelpText";
