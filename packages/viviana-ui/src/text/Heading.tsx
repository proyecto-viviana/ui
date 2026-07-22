import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { ElementTag } from "@proyecto-viviana/solidaria-components";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";

export interface HeadingProps extends BaseContentProps<HTMLHeadingElement> {
  level?: number;
}

/* Heading carried NO styles of its own: `className()` below composes context styles and
 * UNSAFE_className only, so a bare <Heading> rendered at whatever type the host page
 * happened to set on h1-h4. Any heading face it appeared to have came from the consuming
 * app's own stylesheet; an installed consumer without one got nothing. This gives the
 * component a real default type role.
 *
 * The FACE comes for free: font() routes `heading` to the `display` family
 * (spectrum-theme.ts, fontFamily ternary), so every rung below resolves to the register's
 * display face instead of whatever was inherited.
 *
 * The SIZE has to vary with `level`, and previously did not. One module-level constant was
 * shared by every level, so the register's three pixel tiers — display, title, headline —
 * arrived as three identical lines and the top of the type ladder collapsed. `level` chose
 * the tag and nothing else. The three rungs below are the closest steps on the ramp to the
 * register's declared sizes (--type-display 28px, --type-title 20px, --type-headline 15px
 * in the handoff stylesheet):
 *
 *   h1  heading-lg   heading-size-l   -> font-size-700, index 6  -> 28.4px  (spec 28)
 *   h2  heading-sm   heading-size-s   -> font-size-400, index 3  -> 19.9px  (spec 20)
 *   h3  heading-2xs  heading-size-xxs -> font-size-100, index 0  -> 14.0px  (spec 15)
 *
 * Sizes are base(14) * 1.125^index. h1 and h2 land within half a pixel. h3 is the one
 * compromise: the heading ramp's next rung up (heading-xs, 17.7px) is 2.7px past the mark
 * where 14px is 1px short, so the nearer rung wins. Closing that last pixel would mean
 * re-pointing heading-size-xxs itself, which every other heading-2xs consumer would feel —
 * a wider change than this gap warrants.
 *
 * h4+ deliberately share the h3 rung: the register declares three pixel tiers, not six,
 * and inventing rungs below the floor would extend a ladder the design does not have.
 *
 * `style()` is a build-time macro, so these must be three precomputed constants selected at
 * runtime — the class list cannot be composed from `level` inside the macro call.
 *
 * Each is passed as the FIRST argument to mergeContextStyles below so it stays the base
 * layer: mergeStyles(a, b) resolves later-wins (style/runtime.ts), so Dialog/Popover/
 * ContextualHelp context styles and any local `styles` prop still override it.
 *
 * Not carried: the register's heading tracking, and its inverted weight ladder (the spec
 * gets lighter as it gets bigger — 500/600/700). The theme declares no `letterSpacing`
 * property at all (zero hits across style/), and font() derives weight from the type
 * keyword, so neither can be expressed today; both are separate, additive theme changes. */
const headingStyles = {
  1: style({ font: "heading-lg" }),
  2: style({ font: "heading-sm" }),
  3: style({ font: "heading-2xs" }),
} as const;

function headingStyleForLevel(level: number): StyleString {
  return headingStyles[level === 1 ? 1 : level === 2 ? 2 : 3];
}

export const HeadingContext = createContext<SpectrumContextValue<HeadingProps>>(null);

export function Heading(props: HeadingProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeadingContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as HeadingProps;
  const [local] = splitProps(merged, [
    "children",
    "level",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const level = () => local.level ?? 3;
  const tag = () => `h${level()}` as keyof JSX.IntrinsicElements;
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      mergeContextStyles(
        headingStyleForLevel(level()),
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
    <ElementTag
      tag={tag()}
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </ElementTag>
  );
}
