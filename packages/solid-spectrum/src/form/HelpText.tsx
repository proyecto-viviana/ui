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

// Port of packages/@react-spectrum/s2/src/Field.tsx HelpText (Field.tsx:407-468).
import { type JSX, splitProps } from "solid-js";
import { FieldError, Text } from "@proyecto-viviana/solidaria-components";
import { DEFAULT_VALIDATION_RESULT } from "@proyecto-viviana/solid-stately";
import { style } from "../style" with { type: "macro" };
import { controlFont } from "../s2-internal/style-utils" with { type: "macro" };

export interface HelpTextProps {
  /** The description text. */
  description?: JSX.Element;
  /** The error message text. Prefer `children`, matching S2. */
  errorMessage?: JSX.Element;
  /** Whether the field is in an error state. */
  isInvalid?: boolean;
  /** Whether the help text is disabled (dimmed). */
  isDisabled?: boolean;
  /** Field size, matching S2 `HelpText`. @default 'M' */
  size?: "XS" | "S" | "M" | "L" | "XL";
  /** Additional CSS class name. */
  class?: string;
  /** Error message. S2 passes this as `HelpText` children. */
  children?: JSX.Element;
}

// Mirrors S2 `helpTextStyles` (Field.tsx:378-405).
const helpTextStyles = style<{
  size?: "XS" | "S" | "M" | "L" | "XL";
  isInvalid?: boolean;
  isDisabled?: boolean;
}>({
  gridArea: "helptext",
  display: "flex",
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

/**
 * Displays description or error text below a form field.
 *
 * S2 `HelpText` (`Field.tsx:407-468`) renders `<Text slot="description">` when
 * valid and `<FieldError>` (RAC `FieldError.tsx:57-72` → `<Text slot="errorMessage">`,
 * no `role="alert"`) when invalid, with no wrapper. Slot ids attach through
 * the headless `TextContext`.
 */
export function HelpText(props: HelpTextProps): JSX.Element | null {
  const [local] = splitProps(props, [
    "description",
    "errorMessage",
    "isInvalid",
    "isDisabled",
    "size",
    "class",
    "children",
  ]);

  const size = () => local.size ?? "M";
  const className = (isInvalid: boolean) =>
    [helpTextStyles({ size: size(), isInvalid, isDisabled: local.isDisabled }), local.class]
      .filter(Boolean)
      .join(" ");

  if (!local.isInvalid && local.description) {
    return (
      <Text slot="description" class={className(false)}>
        {local.description}
      </Text>
    );
  }

  if (!local.isInvalid) {
    return null;
  }

  const error = local.children ?? local.errorMessage;
  return (
    <FieldError
      class={className(true)}
      validation={{ ...DEFAULT_VALIDATION_RESULT, isInvalid: true }}
    >
      {error}
    </FieldError>
  );
}
