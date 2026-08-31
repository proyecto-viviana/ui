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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/color/useColorSwatch.ts

/**
 * createColorSwatch hook.
 *
 * Provides ARIA attributes for a color swatch display.
 *
 * Ported from packages/react-aria/src/color/useColorSwatch.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import { normalizeColor } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { filterDOMProps } from "../utils/filterDOMProps";
import { createColorStringFormatter } from "./intl";
import type { AriaColorSwatchOptions, ColorSwatchAria } from "./types";

/**
 * Creates ARIA props for a color swatch.
 */
export function createColorSwatch(props: Accessor<AriaColorSwatchOptions>): ColorSwatchAria {
  const getProps = () => props();
  const locale = useLocale();
  const stringFormatter = createColorStringFormatter();
  const generatedId = createId();
  const id = () => getProps().id ?? generatedId;

  const color = createMemo(() => normalizeColor(getProps().color ?? "#fff0"));

  const colorName = createMemo(() => {
    const p = getProps();
    if (p.colorName) return p.colorName;

    const resolvedColor = color();
    if (resolvedColor.getChannelValue("alpha") === 0) {
      return stringFormatter().format("transparent");
    }

    return resolvedColor.getColorName(locale().locale);
  });

  const swatchProps = createMemo(() => {
    const p = getProps();
    const domProps = filterDOMProps(p as Record<string, unknown>, { labelable: true });
    const ariaLabel = [colorName(), p["aria-label"] || ""].filter(Boolean).join(", ");

    return {
      ...domProps,
      id: id(),
      slot: p.slot,
      role: "img" as const,
      "aria-roledescription": stringFormatter().format("colorSwatch"),
      "aria-label": ariaLabel,
      "aria-labelledby": p["aria-labelledby"] ? `${id()} ${p["aria-labelledby"]}` : undefined,
      style: {
        "background-color": color().toString("css"),
        "forced-color-adjust": "none" as const,
      },
    };
  });

  return {
    get swatchProps() {
      return swatchProps();
    },
    get color() {
      return color();
    },
  };
}
