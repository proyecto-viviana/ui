/*
 * The public API, variant values, visual values, and loader structure in this
 * file are derived from @cloudflare/kumo@2.11.0 (MIT; Button is unchanged from 2.10.0).
 * See ../../LICENSE-CLOUDFLARE and the package README for the current evidence gap.
 */

import { Show, splitProps, type Component, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from "@proyecto-viviana/solidaria-components";

export type KumoButtonShape = "base" | "square" | "circle";
export type KumoButtonSize = "xs" | "sm" | "base" | "lg";
export type KumoButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "secondary-destructive"
  | "outline";

type NativeButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "class" | "classList" | "className" | "disabled" | "ref" | "style" | "title" | "type"
>;

type ButtonIcon = Component | JSX.Element;

type ButtonBaseProps = NativeButtonProps & {
  /** The content in the button. */
  children?: JSX.Element;
  /** Additional CSS classes. */
  className?: string;
  /** Disable the button. */
  disabled?: boolean;
  /** An icon component or a Solid element. */
  icon?: ButtonIcon;
  /** Show a loading indicator and disable the button. */
  loading?: boolean;
  /** Get the button element with a Solid callback ref. */
  ref?: (element: HTMLButtonElement) => void;
  /** Set inline styles. */
  style?: JSX.CSSProperties;
  /** Set the native button type. */
  type?: "button" | "submit" | "reset";
};

type ButtonWithTextProps = ButtonBaseProps & {
  shape?: "base";
  size?: KumoButtonSize;
  variant?: KumoButtonVariant;
};

type IconOnlyButtonAccessibleNameProps =
  | {
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      "aria-label"?: string;
      "aria-labelledby": string;
    };

type IconOnlyButtonProps = ButtonBaseProps &
  IconOnlyButtonAccessibleNameProps & {
    shape: "square" | "circle";
    size?: KumoButtonSize;
    variant?: KumoButtonVariant;
  };

/**
 * Props for the experimental Solid Kumo Button.
 *
 * A square or circle button requires an accessible name.
 */
export type ButtonProps = ButtonWithTextProps | IconOnlyButtonProps;

type ResolvedButtonProps = ButtonBaseProps & {
  shape?: KumoButtonShape;
  size?: KumoButtonSize;
  variant?: KumoButtonVariant;
};

type EmphasisStyle = JSX.CSSProperties & {
  "--kumo-button-emphasis-ring": string;
  "--kumo-button-emphasis-bg": string;
  "--kumo-button-emphasis-gradient-start": string;
  "--kumo-button-emphasis-gradient-end": string;
};

function getEmphasisToken(variant: KumoButtonVariant): string | undefined {
  if (variant === "primary") return "var(--color-kumo-brand)";
  if (variant === "destructive") return "var(--color-kumo-danger)";
  return undefined;
}

function getEmphasisStyle(variant: KumoButtonVariant): EmphasisStyle | undefined {
  const token = getEmphasisToken(variant);
  if (!token) return undefined;

  return {
    "--kumo-button-emphasis-ring": `color-mix(in oklch, ${token}, black 10%)`,
    "--kumo-button-emphasis-bg": `color-mix(in oklch, ${token}, white 30%)`,
    "--kumo-button-emphasis-gradient-start": `color-mix(in oklch, ${token}, white 15%)`,
    "--kumo-button-emphasis-gradient-end": token,
  };
}

function Loader(props: { size: number }): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      style={{ height: `${props.size}px`, width: `${props.size}px` }}
      role="status"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="9.5" fill="none" stroke-width="2" stroke-linecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0 150;42 150;42 150"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16;-59"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        opacity="0.1"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
}

function Icon(props: { value: ButtonIcon }): JSX.Element {
  return typeof props.value === "function" ? (
    <Dynamic component={props.value as Component} />
  ) : (
    props.value
  );
}

/**
 * Render an experimental Kumo-shaped button for Solid.
 *
 * This component uses solidaria-components for button behavior.
 */
export function Button(props: ButtonProps): JSX.Element {
  const [local, nativeProps] = splitProps(props as ResolvedButtonProps, [
    "children",
    "className",
    "disabled",
    "icon",
    "loading",
    "ref",
    "shape",
    "size",
    "style",
    "variant",
  ]);

  const shape = (): KumoButtonShape => local.shape ?? "base";
  const size = (): KumoButtonSize => local.size ?? "base";
  const variant = (): KumoButtonVariant => local.variant ?? "secondary";
  const isDisabled = () => !!local.disabled || !!local.loading;
  const isEmphasis = () => getEmphasisToken(variant()) !== undefined;
  const className = () =>
    [
      "pv-kumo-Button",
      `pv-kumo-Button--variant-${variant()}`,
      `pv-kumo-Button--size-${size()}`,
      shape() === "base" ? undefined : `pv-kumo-Button--shape-${shape()}`,
      local.disabled ? "pv-kumo-Button--explicitly-disabled" : undefined,
      local.className,
    ]
      .filter(Boolean)
      .join(" ");
  const style = (): JSX.CSSProperties | undefined => {
    const emphasisStyle = getEmphasisStyle(variant());
    if (!emphasisStyle) return local.style;
    return { ...emphasisStyle, ...local.style };
  };
  const icon = () =>
    local.loading ? (
      <Loader size={size() === "lg" ? 16 : 14} />
    ) : local.icon ? (
      <Icon value={local.icon} />
    ) : null;
  const label = () =>
    local.children == null ? null : <span class="pv-kumo-Button__label">{local.children}</span>;
  const content = () => (
    <Show
      when={isEmphasis()}
      fallback={
        <>
          {icon()}
          {label()}
        </>
      }
    >
      <span aria-hidden="true" class="pv-kumo-Button__emphasis" />
      <span class="pv-kumo-Button__content">
        {icon()}
        {label()}
      </span>
    </Show>
  );

  return (
    <HeadlessButton
      {...(nativeProps as HeadlessButtonProps)}
      type={nativeProps.type ?? "button"}
      isDisabled={isDisabled}
      class={className()}
      style={style()}
      ref={local.ref}
      render={(rootProps) => (
        <button {...rootProps} data-kumo-component="Button">
          {rootProps.children}
        </button>
      )}
    >
      {content()}
    </HeadlessButton>
  );
}
