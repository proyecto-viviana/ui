/**
 * createColorSwatch hook.
 *
 * Provides ARIA attributes for a color swatch display.
 */

import { createMemo, type Accessor } from "solid-js";
import { normalizeColor } from "@proyecto-viviana/solid-stately";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { filterDOMProps } from "../utils/filterDOMProps";
import type { AriaColorSwatchOptions, ColorSwatchAria } from "./types";

/**
 * Creates ARIA props for a color swatch.
 */
export function createColorSwatch(props: Accessor<AriaColorSwatchOptions>): ColorSwatchAria {
  const getProps = () => props();
  const locale = useLocale();
  const generatedId = createId();
  const id = () => getProps().id ?? generatedId;

  const color = createMemo(() => normalizeColor(getProps().color ?? "#fff0"));

  const colorName = createMemo(() => {
    const p = getProps();
    if (p.colorName) return p.colorName;

    const resolvedColor = color();
    if (resolvedColor.getChannelValue("alpha") === 0) {
      return "transparent";
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
      "aria-roledescription": "color swatch",
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
