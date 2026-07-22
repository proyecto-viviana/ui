import { splitProps } from "solid-js";
import type { JSX } from "solid-js";
import {
  SharedElement as HeadlessSharedElement,
  SharedElementTransition as HeadlessSharedElementTransition,
  type SharedElementProps as HeadlessSharedElementProps,
  type SharedElementRenderProps,
  type SharedElementTransitionProps as HeadlessSharedElementTransitionProps,
} from "@proyecto-viviana/solidaria-components";

const mergeClassName = (custom?: string) => (_renderProps: SharedElementRenderProps) =>
  ["vui-shared-element", custom].filter(Boolean).join(" ");

export interface SharedElementProps extends Omit<HeadlessSharedElementProps, "class" | "style"> {
  class?: string;
  style?: JSX.CSSProperties;
}

export function SharedElement(props: SharedElementProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "style"]);
  return (
    <HeadlessSharedElement {...rest} class={mergeClassName(local.class)} style={local.style} />
  );
}

export function SharedElementTransition(props: HeadlessSharedElementTransitionProps): JSX.Element {
  return <HeadlessSharedElementTransition {...props} />;
}

export type SharedElementTransitionProps = HeadlessSharedElementTransitionProps;
