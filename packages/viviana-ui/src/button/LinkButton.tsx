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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Button.tsx

// Port of packages/@react-spectrum/s2/src/Button.tsx.

import {
  children as resolveChildren,
  mergeProps,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  DialogTriggerContext,
  Link as HeadlessLink,
  PopoverTriggerContext,
  type LinkProps as HeadlessLinkProps,
  type LinkRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { fontRelative, style } from "../style" with { type: "macro" };
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
import { useProviderProps } from "../provider";
import { pressScale } from "../pressScale";
import { useLinkButtonContext } from "./context";
import { s2Button, s2ButtonText } from "./s2-button-styles";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";
import type { ButtonFillStyle, ButtonSize, ButtonVariant, StaticColor } from "./types";
import { getSingleTextChild } from "./text-child";

type StyledLinkButtonBaseProps = Omit<
  HeadlessLinkProps,
  "class" | "style" | "children" | "onClick"
>;

export interface LinkButtonProps extends StyledLinkButtonBaseProps {
  /** The content to display in the LinkButton. */
  children?: JSX.Element;
  /** The visual style of the LinkButton. */
  variant?: ButtonVariant;
  /** The background style of the LinkButton. */
  fillStyle?: ButtonFillStyle;
  /** The size of the LinkButton. */
  size?: ButtonSize;
  /** The static color style to apply. Useful when the LinkButton appears over a color background. */
  staticColor?: StaticColor;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

/**
 * A LinkButton navigates like a link while using the S2 Button visual treatment.
 */
export function LinkButton(props: LinkButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useLinkButtonContext(), props.slot);
  const defaultProps: Partial<LinkButtonProps> = {
    variant: "primary",
    size: "M",
    fillStyle: "fill",
  };
  const merged = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "variant",
    "fillStyle",
    "size",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "ref",
  ]);

  const variant = (): ButtonVariant => local.variant ?? "primary";
  const fillStyle = (): ButtonFillStyle => local.fillStyle ?? "fill";
  const size = (): ButtonSize => local.size ?? "M";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);
  let linkElement: HTMLAnchorElement | undefined;
  const assignLinkRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
    props.ref,
  );
  const isOverlayTriggerOpen = () =>
    !!linkElement &&
    ((dialogTriggerContext?.triggerRef() === linkElement && dialogTriggerContext.state.isOpen()) ||
      (popoverTriggerContext?.triggerRef() === linkElement &&
        popoverTriggerContext.state.isOpen()));

  const getClassName = (renderProps: LinkRenderProps): string =>
    [
      local.UNSAFE_className,
      s2Button(
        {
          isHovered: renderProps.isHovered || isOverlayTriggerOpen(),
          isPressed: renderProps.isPressed,
          isFocused: renderProps.isFocused,
          isFocusVisible: renderProps.isFocusVisible,
          isDisabled: renderProps.isDisabled,
          isPending: false,
          variant: variant(),
          fillStyle: fillStyle(),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getStyle = (renderProps: LinkRenderProps): JSX.CSSProperties =>
    pressScale(() => linkElement, mergedUnsafeStyle())(renderProps);

  function LinkButtonContent() {
    const iconContextValue = {
      slot: "icon",
      render: centerBaseline({ slot: "icon", styles: style({ order: 0 }) }),
      styles: style({
        size: fontRelative(20),
        marginStart: "--iconMargin",
        flexShrink: 0,
      }),
    };
    const textContextValue = {
      styles: () => s2ButtonText({ isProgressVisible: false }),
      "data-rsp-slot": "text",
    };

    function ResolvedContent() {
      const resolvedChildren = resolveChildren(() => local.children);
      const content = () => resolvedChildren();
      const textChild = () => getSingleTextChild(content());

      return textChild() !== undefined ? (
        <span class={s2ButtonText({ isProgressVisible: false })} data-rsp-slot="text">
          {textChild()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <>
        <SkeletonContext.Provider value={null}>
          <TextContext.Provider value={textContextValue}>
            <IconContext.Provider value={iconContextValue}>
              <ResolvedContent />
            </IconContext.Provider>
          </TextContext.Provider>
        </SkeletonContext.Provider>
      </>
    );
  }

  return (
    <HeadlessLink
      {...headlessProps}
      class={getClassName}
      style={getStyle}
      ref={(element: HTMLElement) => {
        linkElement = element as HTMLAnchorElement;
        assignLinkRefs(element);
      }}
    >
      <LinkButtonContent />
    </HeadlessLink>
  );
}
