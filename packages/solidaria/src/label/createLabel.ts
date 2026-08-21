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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/label/useLabel.ts

/**
 * Label hook for Solidaria
 *
 * Provides the accessibility implementation for labels and their associated elements.
 * Labels provide context for user inputs.
 *
 * This is a 1:1 port of @react-aria/label's useLabel hook.
 */

import { JSX } from "solid-js";
import { createId } from "../ssr";
import { createLabels } from "./createLabels";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";

export interface AriaLabelingProps {
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
  "aria-details"?: string;
}

export interface LabelableProps {
  /** The content to display as the label. */
  label?: JSX.Element;
}

export interface DOMProps {
  /** The element's unique identifier. */
  id?: string;
}

export interface LabelAriaProps extends LabelableProps, DOMProps, AriaLabelingProps {
  /**
   * The HTML element used to render the label, e.g. 'label', or 'span'.
   * @default 'label'
   */
  labelElementType?: "label" | "span" | "div";
}

export interface LabelAria {
  /** Props to apply to the label container element. */
  labelProps: JSX.LabelHTMLAttributes<HTMLLabelElement> | JSX.HTMLAttributes<HTMLSpanElement>;
  /** Props to apply to the field container element being labeled. */
  fieldProps: AriaLabelingProps & DOMProps;
}

/**
 * Provides the accessibility implementation for labels and their associated elements.
 * Labels provide context for user inputs.
 *
 * @param props - The props for labels and fields.
 */
export function createLabel(props: MaybeAccessor<LabelAriaProps>): LabelAria {
  const getProps = () => access(props);

  const id = createId(getProps().id);
  const labelId = createId();

  const getLabelProps = (): LabelAria["labelProps"] => {
    const { label, labelElementType = "label" } = getProps();

    if (!label) {
      return {};
    }

    return {
      id: labelId,
      ...(labelElementType === "label" ? { for: id } : {}),
    };
  };

  const getFieldProps = (): LabelAria["fieldProps"] => {
    const { label, "aria-labelledby": ariaLabelledby, "aria-label": ariaLabel } = getProps();

    let labelledBy = ariaLabelledby;

    if (label) {
      labelledBy = ariaLabelledby ? `${labelId} ${ariaLabelledby}` : labelId;
    } else if (!ariaLabelledby && !ariaLabel && isDevEnv()) {
      console.warn(
        "If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility",
      );
    }

    return createLabels({
      id,
      "aria-label": ariaLabel,
      "aria-labelledby": labelledBy,
    });
  };

  return {
    get labelProps() {
      return getLabelProps();
    },
    get fieldProps() {
      return getFieldProps();
    },
  };
}
