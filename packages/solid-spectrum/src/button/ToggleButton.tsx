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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ToggleButton.tsx

// Port of packages/@react-spectrum/s2/src/ToggleButton.tsx.
import {
  children as resolveChildren,
  createEffect,
  createSignal,
  type JSX,
  mergeProps,
  onCleanup,
  splitProps,
  useContext,
} from "solid-js";
import {
  ToggleButton as HeadlessToggleButton,
  MenuTriggerContext,
  PopoverTriggerContext,
  type ToggleButtonProps as HeadlessToggleButtonProps,
  type ToggleButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { useProviderProps } from "../provider";
import type { StaticColor } from "./types";
import type { StyleString } from "../style";
import { fontRelative, space, style } from "../style" with { type: "macro" };
import { mergeProps as mergeAriaProps, useLocale } from "@proyecto-viviana/solidaria";
import { mergeStyles } from "../style/runtime";
import { centerBaseline } from "../icon/center-baseline";
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
import {
  s2ActionButton,
  s2ActionButtonStaticColor,
  s2ToggleButtonText,
  type S2ActionButtonRenderState,
} from "./s2-action-button-styles";
import {
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  useToggleButtonGroupContext,
} from "./group-context";
import { IconContext } from "../icon/spectrum-icon";
import { pressScale } from "../pressScale";
import { useToggleButtonContext } from "./context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";
import { getSingleTextChild } from "./text-child";
import CornerTriangle from "../icon/ui-icons/CornerTriangle";

export type ToggleButtonSize = ActionButtonSize;

type StyledToggleButtonBaseProps = Omit<
  HeadlessToggleButtonProps,
  | "class"
  | "style"
  | "children"
  | "onClick"
  | "elementType"
  | "href"
  | "target"
  | "rel"
  | "allowFocusWhenDisabled"
  | "form"
  | "formAction"
  | "formEncType"
  | "formMethod"
  | "formNoValidate"
  | "formTarget"
  | "name"
  | "type"
  | "value"
>;

export interface ToggleButtonProps extends StyledToggleButtonBaseProps {
  /** The content to display in the button. */
  children?: JSX.Element;
  /** The size of the button. @default 'M' */
  size?: ToggleButtonSize;
  /** The static color style to apply. Useful when the ToggleButton appears over a color background. */
  staticColor?: StaticColor;
  /** Whether the button should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the selected ToggleButton should be emphasized. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

type RuntimeToggleButtonProps = ToggleButtonProps & { holdAffordance?: boolean };

/**
 * ToggleButtons allow users to toggle a selection on or off.
 */
export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  const runtimeProps = props as RuntimeToggleButtonProps;
  const providerProps = useProviderProps(runtimeProps);
  const contextProps = getSlottedContextProps(useToggleButtonContext(), runtimeProps.slot);
  const groupContext = getSlottedContextProps(useToggleButtonGroupContext(), undefined);
  const defaultProps: Partial<ToggleButtonProps> = {
    size: "M",
  };
  const standaloneProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const groupProps: Partial<ToggleButtonProps> & {
    density?: ActionButtonDensity;
    orientation?: ActionButtonOrientation;
    isJustified?: boolean;
  } = {
    get size() {
      return groupContext?.size ?? standaloneProps.size;
    },
    get staticColor() {
      return groupContext?.staticColor ?? standaloneProps.staticColor;
    },
    get isQuiet() {
      return groupContext?.isQuiet ?? standaloneProps.isQuiet;
    },
    get isEmphasized() {
      return groupContext?.isEmphasized ?? standaloneProps.isEmphasized;
    },
    get isDisabled() {
      return groupContext?.isDisabled ?? standaloneProps.isDisabled;
    },
    get density() {
      return groupContext?.density;
    },
    get orientation() {
      return groupContext?.orientation;
    },
    get isJustified() {
      return groupContext?.isJustified;
    },
  };

  const mergedProps = mergeProps(standaloneProps, groupProps);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "staticColor",
    "isQuiet",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "holdAffordance",
    "ref",
    "density",
    "orientation",
    "isJustified",
  ]);
  let buttonElement: HTMLButtonElement | undefined;
  const [resolvedButtonElement, setResolvedButtonElement] = createSignal<HTMLButtonElement | null>(
    null,
  );
  const menuTriggerContext = useContext(MenuTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);
  const assignButtonRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLButtonElement> } | null)?.ref,
    props.ref,
  );

  const size = (): ToggleButtonSize => local.size ?? "M";
  const cornerTriangleSize = (): "S" | "M" | "L" | "XL" => {
    const currentSize = size();
    return currentSize === "XS" ? "S" : currentSize;
  };
  const locale = useLocale();
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const getS2State = (renderProps: ToggleButtonRenderProps): S2ActionButtonRenderState => ({
    isHovered: renderProps.isHovered,
    isPressed: renderProps.isPressed,
    isFocused: renderProps.isFocused,
    isFocusVisible: renderProps.isFocusVisible,
    isDisabled: renderProps.isDisabled,
    isSelected: renderProps.isSelected,
  });

  const getClassName = (renderProps: ToggleButtonRenderProps): string =>
    [
      local.UNSAFE_className,
      mergeStyles(
        s2ActionButton({
          ...getS2State(renderProps),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
          isQuiet: local.isQuiet,
          isEmphasized: local.isEmphasized,
          density: density(),
          orientation: orientation(),
          isJustified: local.isJustified,
          isInGroup: !!groupContext,
        }),
        local.staticColor
          ? s2ActionButtonStaticColor({
              ...getS2State(renderProps),
              size: size(),
              staticColor: local.staticColor,
              isStaticColor: true,
              isQuiet: local.isQuiet,
              isEmphasized: local.isEmphasized,
              density: density(),
              orientation: orientation(),
              isJustified: local.isJustified,
              isInGroup: !!groupContext,
            })
          : undefined,
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getPressScaleStyle = (renderProps: ToggleButtonRenderProps): JSX.CSSProperties =>
    pressScale(() => buttonElement, mergedUnsafeStyle())(renderProps);
  const menuTriggerButtonProps = (): Partial<HeadlessToggleButtonProps> => {
    if (!menuTriggerContext) {
      return {};
    }

    const { onKeyDown: _onKeyDown, ...triggerProps } = menuTriggerContext.triggerProps;
    return mergeAriaProps(
      triggerProps as Partial<HeadlessToggleButtonProps>,
      {
        get isDisabled() {
          return menuTriggerContext.isDisabled?.();
        },
        onPressStart: menuTriggerContext.onPressStart,
      } as Partial<HeadlessToggleButtonProps>,
    );
  };
  const syncMenuTriggerAttribute = (element: HTMLButtonElement, name: string, value: unknown) => {
    if (value == null) {
      element.removeAttribute(name);
      return;
    }
    element.setAttribute(name, String(value));
  };

  createEffect(() => {
    const element = resolvedButtonElement();
    if (!element || !menuTriggerContext || menuTriggerContext.triggerRef?.() !== element) {
      return;
    }

    const triggerProps = menuTriggerContext.triggerProps as Record<string, unknown>;
    syncMenuTriggerAttribute(element, "aria-haspopup", triggerProps["aria-haspopup"]);
    syncMenuTriggerAttribute(element, "aria-expanded", triggerProps["aria-expanded"]);
    syncMenuTriggerAttribute(element, "aria-controls", triggerProps["aria-controls"]);
    syncMenuTriggerAttribute(element, "aria-disabled", triggerProps["aria-disabled"]);
  });
  createEffect(() => {
    const element = resolvedButtonElement();
    if (!element || !menuTriggerContext || menuTriggerContext.triggerRef?.() !== element) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      (menuTriggerContext.triggerProps as { onKeyDown?: (e: KeyboardEvent) => void }).onKeyDown?.(
        event,
      );
    };

    element.addEventListener("keydown", onKeyDown);
    onCleanup(() => element.removeEventListener("keydown", onKeyDown));
  });

  function ToggleButtonContent() {
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
      styles: s2ToggleButtonText,
      "data-rsp-slot": "text",
    };

    function ResolvedContent() {
      const resolvedChildren = resolveChildren(() => local.children);
      const content = () => resolvedChildren();
      const textChild = () => getSingleTextChild(content());

      return textChild() !== undefined ? (
        <span class={`${s2ToggleButtonText} ${style({ order: 1 })}`} data-rsp-slot="text">
          {textChild()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <SkeletonContext.Provider value={null}>
        <TextContext.Provider value={textContextValue}>
          <IconContext.Provider value={iconContextValue}>
            <ResolvedContent />
            {local.holdAffordance ? (
              <CornerTriangle
                size={cornerTriangleSize()}
                class={style({
                  position: "absolute",
                  insetEnd: {
                    size: {
                      XS: space(3),
                      S: space(3),
                      M: 4,
                      L: space(5),
                      XL: space(6),
                    },
                  },
                  bottom: {
                    size: {
                      XS: space(3),
                      S: space(3),
                      M: 4,
                      L: space(5),
                      XL: space(6),
                    },
                  },
                  scaleX: {
                    direction: {
                      rtl: -1,
                    },
                  },
                })({ direction: locale().direction, size: size() })}
              />
            ) : null}
          </IconContext.Provider>
        </TextContext.Provider>
      </SkeletonContext.Provider>
    );
  }

  return (
    <HeadlessToggleButton
      {...headlessProps}
      {...menuTriggerButtonProps()}
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
        setResolvedButtonElement(element);
        popoverTriggerContext?.setTriggerRef(element);
        menuTriggerContext?.setTriggerRef?.(element);
        assignButtonRefs(element);
      }}
      class={getClassName}
      style={getPressScaleStyle}
    >
      <ToggleButtonContent />
    </HeadlessToggleButton>
  );
}
