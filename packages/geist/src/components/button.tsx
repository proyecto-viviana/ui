/*
 * Public API names follow the documented Geist Button at
 * https://vercel.com/geist/button. Visual rest values were sampled from that
 * public page on 2026-09-10. This is not a copy of @vercel/geistcn.
 */

import { Show, createMemo, splitProps, type JSX } from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
} from "@proyecto-viviana/solidaria-components";

export type GeistButtonVariant = "default" | "error" | "warning" | "secondary" | "tertiary";
export type GeistButtonSize = "tiny" | "small" | "medium" | "large";
export type GeistButtonShape = "square" | "circle" | "rounded";

type NativeButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "class" | "classList" | "className" | "disabled" | "ref" | "style" | "type"
>;

type ButtonBaseProps = NativeButtonProps & {
  /** The content in the button. */
  children?: JSX.Element;
  /** Additional CSS classes. */
  className?: string;
  /** Disable the button. */
  disabled?: boolean;
  /** Show a spinner and keep the button focusable. */
  loading?: boolean;
  /** Content before the label. */
  prefix?: JSX.Element;
  /** Content after the label. */
  suffix?: JSX.Element;
  /** Marketing shadow, usually with shape="rounded". */
  shadow?: boolean;
  /** Get the button element with a Solid callback ref. */
  ref?: (element: HTMLButtonElement) => void;
  /** Set inline styles. */
  style?: JSX.CSSProperties;
  /** Set the native button type. */
  type?: "button" | "submit" | "reset";
  size?: GeistButtonSize;
  variant?: GeistButtonVariant;
  shape?: GeistButtonShape;
};

type SvgOnlyButtonProps = ButtonBaseProps & {
  svgOnly: true;
  "aria-label": string;
};

type ButtonWithTextProps = ButtonBaseProps & {
  svgOnly?: false;
};

/**
 * Props for the experimental Solid Geist Button.
 *
 * An svgOnly button requires aria-label.
 */
export type ButtonProps = ButtonWithTextProps | SvgOnlyButtonProps;

/**
 * Render an experimental Geist-shaped button for Solid.
 *
 * This component uses solidaria-components for button behavior.
 */
export function Button(props: ButtonProps): JSX.Element {
  const [local, nativeProps] = splitProps(props, [
    "children",
    "className",
    "disabled",
    "loading",
    "prefix",
    "suffix",
    "shadow",
    "ref",
    "shape",
    "size",
    "style",
    "svgOnly",
    "variant",
  ]);

  const variant = (): GeistButtonVariant => local.variant ?? "default";
  const size = (): GeistButtonSize => local.size ?? "medium";
  const className = () =>
    [
      "pv-geist-Button",
      `pv-geist-Button--variant-${variant()}`,
      `pv-geist-Button--size-${size()}`,
      local.shape ? `pv-geist-Button--shape-${local.shape}` : undefined,
      local.svgOnly ? "pv-geist-Button--svgOnly" : undefined,
      local.shadow ? "pv-geist-Button--shadow" : undefined,
      local.className,
    ]
      .filter(Boolean)
      .join(" ");
  const labelContent = createMemo(() => local.children);
  const content = () => (
    <>
      <Show when={local.loading}>
        <span class="pv-geist-Button__spinner" role="status" aria-label="Loading" />
      </Show>
      <Show when={local.prefix && !local.svgOnly}>
        <span class="pv-geist-Button__prefix">{local.prefix}</span>
      </Show>
      <Show when={labelContent() != null}>
        <span class="pv-geist-Button__label">{labelContent()}</span>
      </Show>
      <Show when={local.suffix && !local.svgOnly}>
        <span class="pv-geist-Button__suffix">{local.suffix}</span>
      </Show>
    </>
  );

  return (
    <HeadlessButton
      {...(nativeProps as HeadlessButtonProps)}
      type={nativeProps.type ?? "button"}
      isDisabled={!!local.disabled}
      isPending={!!local.loading}
      class={className()}
      style={local.style}
      ref={local.ref}
      render={(rootProps) => (
        <button {...rootProps} data-geist-component="Button">
          {rootProps.children}
        </button>
      )}
    >
      {content()}
    </HeadlessButton>
  );
}
