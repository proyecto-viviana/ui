/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/NotificationBadge.tsx

// Port of packages/@react-spectrum/s2/src/NotificationBadge.tsx.
import { type JSX, createContext, createMemo, splitProps, useContext } from "solid-js";
import {
  mergeProps,
  createStringFormatter,
  filterDOMProps,
  useLocale,
} from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { fontRelative, style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { s2IntlStrings } from "../intl";

export interface NotificationBadgeProps {
  /** The value to display in the notification badge. */
  value?: number | null;
  /** The size of the notification badge. @default 'S' */
  size?: "S" | "M" | "L" | "XL";
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
  slot?: string | null;
  ref?: RefLike<HTMLSpanElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: `data-${string}`]: string | undefined;
}

interface NotificationBadgeContextProps extends NotificationBadgeProps {
  /** Static color inherited from a surrounding component. */
  staticColor?: "black" | "white" | "auto";
  /** Whether the owning control is disabled. */
  isDisabled?: boolean;
}

export const NotificationBadgeContext =
  createContext<SpectrumContextValue<NotificationBadgeContextProps>>(null);

const notificationBadge = style(
  {
    display: {
      default: "flex",
      isDisabled: "none",
    },
    font: "ui",
    /* The register sets a notification count in the PIXEL face, not the UI face: the
     * count on the icon-rail bell is `--font-display` 10px/700 (TerminalGlassLab.tsx
     * §01). It is the one numeral in the chrome that is meant to read as a stamp
     * rather than as text, which is exactly the role `fontFamily: "display"` carries
     * in this package. Declared after `font: "ui"` so it overrides only the family
     * and weight that shorthand established. */
    fontFamily: "display",
    fontWeight: "bold",
    color: {
      /* Fuchsia is the register's ASK colour, and a notification count is an ask —
       * DECISIONS lists NotificationBadge as the one non-`create` surface that keeps
       * it (it counts as *notification*, not a second CTA). Ink is the create pair's
       * own ink so the contrast holds in both schemes without a per-scheme value here. */
      default: "create-ink",
      isStaticColor: "auto",
      forcedColors: "ButtonText",
    },
    fontSize: {
      size: {
        /* 10px flat at S, the rung the handoff draws. The other three keep the shared
         * ui ramp rather than acquiring three invented px values. */
        S: "[10px]",
        M: "ui-xs",
        L: "ui-sm",
        XL: "ui",
      },
    },
    /* The badge rim is not a forced-colors-only affordance any more: the register
     * draws a 1px `--accent-create-border` around the fuchsia stamp so it separates
     * from whatever icon it overlaps. `boxSizing: border-box` keeps that rim inside
     * the 17px box below instead of growing it to 19px. */
    boxSizing: "border-box",
    borderStyle: "solid",
    borderWidth: "[1px]",
    borderColor: {
      default: "create-border",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "ButtonBorder",
    },
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: {
      default: "create-bg",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "ButtonFace",
    },
    height: {
      size: {
        /* 17px, the handoff's own badge box (§01 icon rail). 12px was Spectrum's S
         * rung and could not hold a 10px pixel numeral with a 1px rim. Only the drawn
         * rung moves; the indicator-only dot stays 8px. */
        S: {
          default: "[17px]",
          isIndicatorOnly: 8,
        },
        M: {
          default: "1lh",
          isIndicatorOnly: 8,
        },
        L: {
          default: 16,
          isIndicatorOnly: fontRelative(12),
        },
        XL: {
          default: 18,
          isIndicatorOnly: fontRelative(12),
        },
      },
    },
    aspectRatio: {
      isIndicatorOnly: "square",
      isSingleDigit: "square",
    },
    /* A single-digit badge is square by `aspectRatio` below, but a 10px numeral in a
     * 17px box is narrower than it is tall at the double-digit rung too — the register
     * draws `min-width: 17px` so "1" and "12" sit in the same footprint. Only the drawn
     * S rung takes it; the rest stay on `aspectRatio` alone. */
    minWidth: {
      size: {
        S: {
          default: "[17px]",
          isIndicatorOnly: 0,
        },
      },
    },
    width: "max",
    paddingX: {
      isDoubleDigit: "edge-to-text",
    },
    borderRadius: "pill",
  },
  getAllowedOverrides(),
);

export function NotificationBadge(props: NotificationBadgeProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(NotificationBadgeContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as NotificationBadgeContextProps;
  const [local] = splitProps(merged, [
    "value",
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "staticColor",
    "isDisabled",
    "slot",
    "ref",
    "aria-label",
  ]);
  const locale = useLocale();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const size = () => local.size ?? "S";
  const value = () => local.value;

  const formattedValue = createMemo(() => {
    const currentValue = value();
    if (currentValue == null) {
      return "";
    }

    if (currentValue <= 0) {
      throw new Error("Value cannot be negative or zero");
    }

    if (!Number.isInteger(currentValue)) {
      throw new Error("Value must be a positive integer");
    }

    const cappedValue = Math.min(currentValue, 99);
    const formatted = new Intl.NumberFormat(locale().locale).format(cappedValue);
    return currentValue > 99
      ? stringFormatter().format("notificationbadge.plus", { notifications: formatted })
      : formatted;
  });

  const digitCount = createMemo(() => {
    const currentValue = value();
    if (currentValue == null) {
      return 0;
    }

    return String(Math.min(currentValue, 99)).length;
  });

  const ariaLabel = () =>
    local["aria-label"] ??
    (value() == null ? stringFormatter().format("notificationbadge.indicatorOnly") : undefined);
  const mergedUnsafeClassName = () =>
    [contextProps?.UNSAFE_className, props.UNSAFE_className].filter(Boolean).join(" ") || undefined;

  return (
    <span
      {...(filterDOMProps(merged, {
        labelable: true,
      }) as JSX.HTMLAttributes<HTMLSpanElement>)}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLSpanElement> } | null)?.ref,
        props.ref,
      )}
      role={ariaLabel() ? "img" : undefined}
      aria-label={ariaLabel()}
      class={[
        mergedUnsafeClassName(),
        notificationBadge(
          {
            size: size(),
            isIndicatorOnly: value() == null,
            isSingleDigit: digitCount() === 1,
            isDoubleDigit: digitCount() === 2,
            isDisabled: local.isDisabled,
            isStaticColor: !!local.staticColor,
          },
          mergeContextStyles(contextProps?.styles, props.styles),
        ),
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style)}
    >
      {formattedValue()}
    </span>
  );
}
