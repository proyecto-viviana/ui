import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { createIsSkeleton, useInertAttribute, useSkeletonText } from "../skeleton";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";
import { typeRoles } from "./type-roles";

/* Standalone type-role defaults (Glasselated register, mirror panel 09):
 * Text, Content and Keyboard were pure slot markers — bare elements with an
 * empty class that inherit whatever encloses them — so the register's body,
 * meta and terminal roles had no reachable carrier: an app could not ask for
 * "prose" or "mono" and get it. Each now bakes its role, but ONLY when no
 * slotted context has claimed the element (contextProps == null): inside a
 * Button, MenuItem, Card or any other composing parent, the parent's context
 * IS the styling contract — often deliberately partial so the child inherits
 * the parent's font — and a baked size there would override the host instead
 * of the page. Standalone mapping, per the register's ladder: Content → body
 * (block prose), Text → meta (inline secondary), Keyboard → terminal (mono).
 * When a context exists the default is skipped entirely, so composed
 * behavior is byte-identical to before. */

export interface TextProps extends BaseContentProps<HTMLSpanElement> {}

export const TextContext = createContext<SpectrumContextValue<TextProps>>(null);

export interface HeaderProps extends BaseContentProps<HTMLElement> {}

export const HeaderContext = createContext<SpectrumContextValue<HeaderProps>>(null);

export interface ContentProps extends BaseContentProps<HTMLDivElement> {}

export const ContentContext = createContext<SpectrumContextValue<ContentProps>>(null);

export interface FooterProps extends BaseContentProps<HTMLElement> {}

export const FooterContext = createContext<SpectrumContextValue<FooterProps>>(null);

export function Text(props: TextProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(TextContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as TextProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const isSkeleton = createIsSkeleton();
  const inertRef = useInertAttribute(isSkeleton);
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const id = () => props.id ?? contextProps?.id;
  const [children, skeletonStyle] = useSkeletonText(() => local.children, unsafeStyle);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(
        contextProps == null ? typeRoles.meta : undefined,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <span
      {...getContentDomProps(merged)}
      id={id()}
      ref={mergeContextRefs(contextProps?.ref, props.ref, inertRef)}
      class={className()}
      style={skeletonStyle()}
      slot={local.slot || undefined}
      data-rsp-slot="text"
    >
      {children()}
    </span>
  );
}

export function Header(props: HeaderProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeaderContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as HeaderProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <header
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </header>
  );
}

export function Content(props: ContentProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ContentContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as ContentProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(
        contextProps == null ? typeRoles.body : undefined,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <div
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </div>
  );
}

export function Footer(props: FooterProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(FooterContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as FooterProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <footer
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </footer>
  );
}

export { Heading, HeadingContext } from "./Heading";
export type { HeadingProps } from "./Heading";
export { Keyboard, KeyboardContext } from "./Keyboard";
export type { KeyboardProps } from "./Keyboard";
export { typeRoles } from "./type-roles";
export type { TypeRole } from "./type-roles";
