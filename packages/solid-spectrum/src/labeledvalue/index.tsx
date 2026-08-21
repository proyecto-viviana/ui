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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/LabeledValue.tsx

import { type JSX, Show, createMemo, splitProps } from "solid-js";
import { NumberFormatter, useLocale } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { useFormProps, useIsInForm } from "../form";

export type LabeledValueSize = "S" | "M" | "L" | "XL";
export type LabeledValueLabelPosition = "top" | "side";
export type LabeledValueLabelAlign = "start" | "end";

/** The value types LabeledValue can format. Dates are not yet supported (tracked). */
export type LabeledValueValue = string | number | readonly string[] | JSX.Element;

interface LabeledValueStyleProps {
  labelPosition?: LabeledValueLabelPosition;
  labelAlign?: LabeledValueLabelAlign;
  size?: LabeledValueSize;
  isInForm?: boolean;
  isDisabled?: boolean;
  isStaticColor?: boolean;
  isQuiet?: boolean;
}

export interface LabeledValueProps {
  /** The content to display as the label. */
  label: JSX.Element;
  /** The value to display. Numbers and string lists are formatted for the current locale. */
  value?: LabeledValueValue;
  /** Formatting options for the value (Intl.NumberFormat / Intl.ListFormat). */
  formatOptions?: Intl.NumberFormatOptions | Intl.ListFormatOptions;
  /**
   * The size of the component.
   * @default 'M'
   */
  size?: LabeledValueSize;
  /**
   * The label's position relative to the value.
   * @default 'top'
   */
  labelPosition?: LabeledValueLabelPosition;
  /**
   * The label's horizontal alignment relative to the element.
   * @default 'start'
   */
  labelAlign?: LabeledValueLabelAlign;
  /** Inline style overrides for the root. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Class name concatenated onto the root. */
  UNSAFE_className?: string;
  /** Spectrum style-macro overrides (width/height allowed). */
  styles?: StyleString;
}

// Mirrors upstream S2 `LabeledValue.tsx` `fieldStyles` — the shared field() grid, with the
// width/height style-macro overrides allowed (upstream `getAllowedOverrides()`).
const fieldStyles = style<LabeledValueStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

// Mirrors upstream `FieldLabel`'s wrapper <div> (gridArea label + text-align + top padding +
// containment). LabeledValue renders the label as a <span> (elementType="span") with no
// necessity indicator (LabeledValueBaseProps omits isRequired/necessityIndicator).
const labelWrapperStyles = style<LabeledValueStyleProps>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
    isQuiet: "none",
  },
});

// Mirrors upstream `fieldLabel()` — the label's font + neutral-subdued color.
const labelStyles = style<LabeledValueStyleProps>({
  ...fieldLabel(),
});

// Byte-identical to upstream `LabeledValue.tsx` `valueStyles`.
const valueStyles = style<LabeledValueStyleProps>({
  ...fieldInput(),
  minHeight: {
    isInForm: controlSize(),
  },
  display: "flex",
  alignItems: "center",
  font: controlFont(),
});

/**
 * A LabeledValue displays a non-editable value with a label. It formats numbers and lists
 * according to the user's locale.
 *
 * Based on packages/@react-spectrum/s2/src/LabeledValue.tsx.
 * The Solid adaptation uses the shared `field()` grid, a `FieldLabel` rendered as a
 * `<span>`, and a value `<span>` styled with `fieldInput()` + `controlFont()`.
 * `size`, `labelPosition`, and `labelAlign` are inherited from an enclosing `Form`
 * through `useFormProps` for each prop left undefined.
 */
export function LabeledValue(props: LabeledValueProps): JSX.Element {
  const merged = useFormProps(props);
  const isInForm = useIsInForm();
  const locale = useLocale();
  const [local] = splitProps(merged, [
    "label",
    "value",
    "formatOptions",
    "size",
    "labelPosition",
    "labelAlign",
    "UNSAFE_style",
    "UNSAFE_className",
    "styles",
  ]);

  const size = () => local.size ?? "M";
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";

  // Format the value the same way upstream does (useNumberFormatter / useListFormatter, both
  // Intl-backed): numbers via NumberFormatter, string lists via Intl.ListFormat, strings and
  // elements as-is. Reactive to both the value and the locale.
  const formatted = createMemo<JSX.Element>(() => {
    const value = local.value;
    if (Array.isArray(value)) {
      return new Intl.ListFormat(
        locale().locale,
        local.formatOptions as Intl.ListFormatOptions | undefined,
      ).format(value as string[]);
    }
    if (typeof value === "number") {
      return new NumberFormatter(
        locale().locale,
        local.formatOptions as Intl.NumberFormatOptions | undefined,
      ).format(value);
    }
    return value as JSX.Element;
  });

  const rootClass = () =>
    [
      local.UNSAFE_className,
      fieldStyles(
        {
          isInForm,
          labelPosition: labelPosition(),
          size: size(),
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div class={rootClass()} style={local.UNSAFE_style}>
      <Show when={local.label != null}>
        <div
          class={labelWrapperStyles({
            labelAlign: labelAlign(),
            labelPosition: labelPosition(),
          })}
        >
          <span
            class={labelStyles({
              labelPosition: labelPosition(),
              size: size(),
              isStaticColor: false,
            })}
          >
            {local.label}
          </span>
        </div>
      </Show>
      <span
        class={valueStyles({
          isInForm,
          size: size(),
          labelPosition: labelPosition(),
        })}
      >
        {formatted()}
      </span>
    </div>
  );
}
