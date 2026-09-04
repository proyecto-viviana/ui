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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/StatusLight.tsx

// Port of packages/@react-spectrum/s2/src/StatusLight.tsx.
import { type JSX, createContext, createMemo, mergeProps, splitProps, useContext } from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
import { CenterBaseline } from "../icon/center-baseline";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { useIsSkeleton } from "../skeleton";
import { Text, TextContext } from "../text";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

type StatusLightVariant =
  | "informative"
  | "neutral"
  | "positive"
  | "notice"
  | "negative"
  | "yellow"
  | "chartreuse"
  | "celery"
  | "seafoam"
  | "cyan"
  | "indigo"
  | "purple"
  | "fuchsia"
  | "magenta"
  | "pink"
  | "turquoise"
  | "brown"
  | "cinnamon"
  | "silver";
type StatusLightSize = "S" | "M" | "L" | "XL";

export interface StatusLightProps {
  /** The content to display as the label. */
  children?: JSX.Element;
  /**
   * The variant changes the color of the status light.
   * @default 'neutral'
   */
  variant?: StatusLightVariant;
  /** The size of the status light. @default 'M' */
  size?: StatusLightSize;
  /**
   * An accessibility role for the status light.
   * Should be set when the status can change at runtime.
   */
  role?: "status";
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: `data-${string}`]: string | undefined;
}

export const StatusLightContext = createContext<SpectrumContextValue<StatusLightProps>>(null);

const wrapperStyles = style<{
  size: StatusLightSize;
  variant: StatusLightVariant;
}>(
  {
    display: "flex",
    gap: "text-to-visual",
    alignItems: "baseline",
    width: "fit",
    font: controlFont(),
    color: {
      default: "neutral",
      variant: {
        neutral: "gray-600",
      },
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const lightStyles = style<{
  size: StatusLightSize;
  variant: StatusLightVariant;
  isSkeleton: boolean;
}>({
  size: {
    size: {
      S: 8,
      M: 10,
      L: 12,
      XL: 14,
    },
  },
  fill: {
    variant: {
      informative: "informative",
      neutral: "neutral",
      positive: "positive",
      notice: "notice",
      negative: "negative",
      celery: "celery",
      chartreuse: "chartreuse",
      cyan: "cyan",
      fuchsia: "fuchsia",
      purple: "purple",
      magenta: "magenta",
      indigo: "indigo",
      seafoam: "seafoam",
      yellow: "yellow",
      pink: "pink",
      turquoise: "turquoise",
      cinnamon: "cinnamon",
      brown: "brown",
      silver: "silver",
    },
    isSkeleton: "gray-200",
  },
  overflow: "visible",
});

function mergeUnsafeClassName(
  contextClassName?: UnsafeClassName | string,
  localClassName?: UnsafeClassName | string,
): string | undefined {
  return [contextClassName, localClassName].filter(Boolean).join(" ") || undefined;
}

export function StatusLight(props: StatusLightProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(StatusLightContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as StatusLightProps;
  const [local] = splitProps(merged, [
    "children",
    "variant",
    "size",
    "role",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "slot",
    "ref",
  ]);
  const isSkeleton = useIsSkeleton();
  const size = () => local.size ?? "M";
  const variant = () => local.variant ?? "neutral";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const mergedUnsafeClassName = () =>
    mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className);
  const nodeEnv = (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV;

  // One tracked read of the children getter. Reading it per use creates the
  // child DOM once per read and desynchronizes hydration keys; an untracked
  // setup-time read freezes a direct signal child such as `{label()}`.
  const content = createMemo(() => local.children);
  if (!content() && !local["aria-label"] && nodeEnv !== "production") {
    console.warn("If no children are provided, an aria-label must be specified");
  }

  if (
    !local.role &&
    (local["aria-label"] || local["aria-labelledby"]) &&
    nodeEnv !== "production"
  ) {
    console.warn("A labelled StatusLight must have a role.");
  }

  return (
    <TextContext.Provider value={{}}>
      <div
        {...(filterDOMProps(merged, {
          labelable: !!local.role,
        }) as JSX.HTMLAttributes<HTMLDivElement>)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        role={local.role}
        class={[
          mergedUnsafeClassName(),
          wrapperStyles({ size: size(), variant: variant() }, mergedStyles()),
        ]
          .filter(Boolean)
          .join(" ")}
        style={mergedUnsafeStyle()}
      >
        <CenterBaseline>
          <svg
            class={lightStyles({ size: size(), variant: variant(), isSkeleton: isSkeleton() })}
            aria-hidden="true"
          >
            <circle r="50%" cx="50%" cy="50%" />
          </svg>
        </CenterBaseline>
        <Text>{content()}</Text>
      </div>
    </TextContext.Provider>
  );
}
