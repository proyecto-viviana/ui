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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/InlineAlert.tsx

// Port of packages/@react-spectrum/s2/src/InlineAlert.tsx.

import {
  type Component,
  type JSX,
  Show,
  createContext,
  mergeProps,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  createFocusRing,
  createStringFormatter,
  filterDOMProps,
  focusSafely,
} from "@proyecto-viviana/solidaria";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { IconContext, type SpectrumIconProps } from "../icon";
import { AlertDiamondIcon } from "../icon/s2wf-icons/AlertDiamondIcon";
import { AlertTriangleIcon } from "../icon/s2wf-icons/AlertTriangleIcon";
import { CheckmarkCircleIcon } from "../icon/s2wf-icons/CheckmarkCircleIcon";
import { InfoCircleIcon } from "../icon/s2wf-icons/InfoCircleIcon";
import { s2IntlStrings, type S2IntlStrings } from "../intl";
import type { StyleProps, UnsafeClassName } from "../s2-internal/style-utils";
import {
  getAllowedOverrides,
  glassSurface,
} from "../s2-internal/style-utils" with { type: "macro" };
import type { StyleString } from "../style";
import { focusRing, lightDark, style } from "../style" with { type: "macro" };
import { ContentContext, HeadingContext } from "../text";

export type InlineAlertVariant = "informative" | "positive" | "notice" | "negative" | "neutral";
/* `success` and `warning` are accepted alias names for the `positive` and
 * `notice` channels — the negative/warning/success status trio Button and Badge
 * also expose. normalizeVariant folds them onto the canonical channel before any
 * styling, icon, or intl lookup, so nothing downstream needs a success/warning
 * branch. */
export type InlineAlertVariantProp = InlineAlertVariant | "success" | "warning";
export type InlineAlertFillStyle = "border" | "subtleFill" | "boldFill";

function normalizeVariant(variant: InlineAlertVariantProp | undefined): InlineAlertVariant {
  switch (variant) {
    case "success":
      return "positive";
    case "warning":
      return "notice";
    default:
      return variant ?? "neutral";
  }
}

interface InlineAlertStyleProps {
  /** The semantic tone of an InlineAlert. @default 'neutral' */
  variant?: InlineAlertVariant;
  /** The visual style of the InlineAlert. @default 'border' */
  fillStyle?: InlineAlertFillStyle;
}

export interface InlineAlertProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "ref" | "slot"
> {
  /** The contents of the InlineAlert. */
  children?: JSX.Element;
  /** Whether to automatically focus the InlineAlert when it first renders. */
  autoFocus?: boolean;
  /** The semantic tone of an InlineAlert. `success`/`warning` alias `positive`/`notice`. @default 'neutral' */
  variant?: InlineAlertVariantProp;
  /** The visual style of the InlineAlert. @default 'border' */
  fillStyle?: InlineAlertFillStyle;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleProps["styles"] | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Slotted context key. */
  slot?: string | null;
  /** Ref for the root alert element. */
  ref?: RefLike<HTMLDivElement>;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export const InlineAlertContext = createContext<SpectrumContextValue<InlineAlertProps>>(null);

const inlineAlert = style<InlineAlertStyleProps & { isFocusVisible?: boolean }>(
  {
    ...focusRing(),
    /* Glasselated: with fillStyle="border" an InlineAlert is the handoff's glass card,
     * so it takes the card surface whole rather than just the card radius. It already
     * wore the radius and the 1px edge and none of the rest, which left it neither
     * glass nor matte: the old `gray-25` fill resolves to #0c0d10 in dark
     * (glasselated-ramps.ts, gray stop 25), byte-identical to `--surface-app`
     * (viviana-tokens.css:196), so the alert punched an opaque hole through the scene
     * instead of frosting it.
     *
     * This spread supplies the radius, the 1px solid edge and the surface defaults;
     * the borderColor / backgroundColor / backdropFilter / boxShadow maps below are
     * declared AFTER it and replace those four properties outright, because all four
     * have to stay conditional on variant and fillStyle. */
    ...glassSurface("card"),
    display: "inline-block",
    position: "relative",
    boxSizing: "border-box",
    /* The register's message-block rhythm: its largest padding anywhere is 20/24, and
     * every container-scale padding it draws is vertical < horizontal. A square 24px
     * box is on no rung of that ladder. */
    paddingY: 20,
    paddingX: 24,
    borderColor: {
      fillStyle: {
        border: {
          variant: {
            /* With fillStyle="border" the 1px edge is the only carrier of variant
             * identity, so it has to clear 3:1 in both schemes, and stops 700/800 do
             * not: the amber and blue light columns stay bright that far up (amber only
             * reaches a dark value at 900, #af6400), putting notice and positive under
             * 2:1 on the light card. The 900/1000 pair lands every channel at ~4.3-4.5
             * light / ~5.9-6.8 dark and follows the lightDark() pair idiom the outline
             * Badge already uses. It also retires the unexplained 700-vs-800 split.
             *
             * LADDER NOTE: badge/index.tsx still spells the lower lightDark("-800",
             * "-900") pair on these same four ramps, including for its outline border,
             * where it has the same weak light column. 900/1000 is intended as the new
             * status-BORDER ladder and Badge should converge on it rather than the
             * library carrying two. Not changed here — different file. Meter's pair is
             * a background fill under white ink, a different constraint; it is not part
             * of this ladder and should not be moved to match. */
            informative: lightDark("informative-900", "informative-1000"),
            positive: lightDark("positive-900", "positive-1000"),
            notice: lightDark("notice-900", "notice-1000"),
            negative: lightDark("negative-900", "negative-1000"),
            /* Was gray-700, which measures roughly double every status border once
             * those move to 900/1000 — the neutral alert would be the loudest of the
             * five. gray-500 (#63748b / #97a1ab) sits in the same band as the rest. */
            neutral: "gray-500",
          },
        },
        subtleFill: "transparent",
        boldFill: "transparent",
      },
    },
    /* This literal replaces the spread's `backgroundColor` outright rather than merging
     * with it, and a condition map with no matching branch emits no declaration at all
     * — so the `border` branch has to name the glass surface explicitly. `layer-2` is
     * `var(--surface-card)`; the two tinted fill styles keep their semantic surfaces. */
    backgroundColor: {
      variant: {
        informative: {
          fillStyle: {
            border: "layer-2",
            subtleFill: "informative-subtle",
            boldFill: "informative",
          },
        },
        positive: {
          fillStyle: {
            border: "layer-2",
            subtleFill: "positive-subtle",
            boldFill: "positive",
          },
        },
        notice: {
          fillStyle: {
            border: "layer-2",
            subtleFill: "notice-subtle",
            boldFill: "notice",
          },
        },
        negative: {
          fillStyle: {
            border: "layer-2",
            subtleFill: "negative-subtle",
            boldFill: "negative",
          },
        },
        neutral: {
          fillStyle: {
            border: "layer-2",
            subtleFill: "neutral-subtle",
            boldFill: "neutral-subdued",
          },
        },
      },
    },
    /* Blur and rim are scoped to the glass fill style, not inherited from the spread.
     * A backdrop blur under the opaque subtleFill/boldFill surfaces is a no-op, and the
     * rim is not: in light `--edge-glass` is a 90%-white top edge plus a 35%-white inner
     * ring (viviana-tokens.css:509), which over boldFill's saturated fills would paint a
     * gloss those variants never asked for. Both tinted styles also set borderColor
     * transparent above — they are deliberately edgeless, and an inset rim is an edge by
     * another name. Same shape card/index.tsx uses to opt its non-glass variants out. */
    backdropFilter: {
      default: "none",
      fillStyle: {
        border: "var(--blur-card)",
      },
    },
    boxShadow: {
      default: "none",
      fillStyle: {
        border: "edge-glass",
      },
    },
  },
  getAllowedOverrides(),
);

const icon = style<InlineAlertStyleProps>({
  float: "inline-end",
  "--iconPrimary": {
    type: "fill",
    value: {
      fillStyle: {
        border: {
          variant: {
            informative: "informative",
            positive: "positive",
            notice: "notice",
            negative: "negative",
            neutral: "neutral",
          },
        },
        subtleFill: {
          variant: {
            informative: "informative",
            positive: "positive",
            notice: "negative",
            negative: "negative",
            neutral: "neutral",
          },
        },
        boldFill: {
          default: "white",
          variant: {
            notice: "black",
          },
        },
      },
    },
  },
});

const heading = style<InlineAlertStyleProps>({
  marginTop: 0,
  font: "title-sm",
  color: {
    default: "title",
    fillStyle: {
      boldFill: {
        default: "white",
        variant: {
          notice: "black",
        },
      },
    },
  },
});

const content = style<InlineAlertStyleProps>({
  font: "body-sm",
  color: {
    default: "body",
    fillStyle: {
      boldFill: {
        default: "white",
        variant: {
          notice: "black",
        },
      },
    },
  },
});

const alertIcons: Record<InlineAlertVariant, Component<SpectrumIconProps> | undefined> = {
  informative: InfoCircleIcon,
  positive: CheckmarkCircleIcon,
  notice: AlertDiamondIcon,
  negative: AlertTriangleIcon,
  neutral: undefined,
};

/**
 * Inline alerts display a non-modal message associated with objects in a view.
 */
export function InlineAlert(props: InlineAlertProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(InlineAlertContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "autoFocus",
    "variant",
    "fillStyle",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "class",
  ]);
  const formatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const variant = () => normalizeVariant(local.variant);
  const fillStyle = () => local.fillStyle ?? "border";
  const autoFocus = () => !!local.autoFocus;
  const { isFocusVisible, focusProps } = createFocusRing({ autoFocus: autoFocus() });
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const Icon = () => alertIcons[variant()];
  const iconLabel = () => formatter().format(`inlinealert.${variant()}` as keyof S2IntlStrings);
  let rootElement: HTMLDivElement | undefined;

  onMount(() => {
    if (autoFocus() && rootElement) {
      focusSafely(rootElement);
    }
  });

  const setRootRef = (element: HTMLDivElement) => {
    rootElement = element;
    mergeContextRefs(
      (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
      props.ref,
    )(element);
  };

  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      inlineAlert(
        {
          variant: variant(),
          fillStyle: fillStyle(),
          isFocusVisible: isFocusVisible(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div
      {...filterDOMProps(domProps as Record<string, unknown>)}
      onFocus={focusProps.onFocus}
      onBlur={focusProps.onBlur}
      ref={setRootRef}
      tabIndex={autoFocus() ? -1 : undefined}
      autofocus={autoFocus() || undefined}
      role="alert"
      class={className()}
      style={mergedUnsafeStyle()}
    >
      <HeadingContext.Provider value={{ styles: () => heading({ fillStyle: fillStyle() }) }}>
        <ContentContext.Provider value={{ styles: () => content({ fillStyle: fillStyle() }) }}>
          <IconContext.Provider
            value={{ styles: () => icon({ variant: variant(), fillStyle: fillStyle() }) }}
          >
            <Show when={Icon()}>
              {(AlertIcon) => (
                <Dynamic component={AlertIcon()} UNSAFE_suppressDataSlot aria-label={iconLabel()} />
              )}
            </Show>
            {local.children}
          </IconContext.Provider>
        </ContentContext.Provider>
      </HeadingContext.Provider>
    </div>
  );
}
