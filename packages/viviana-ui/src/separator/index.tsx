import { type JSX, splitProps } from "solid-js";
import {
  Separator as HeadlessSeparator,
  type SeparatorProps as HeadlessSeparatorProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

/**
 * The rule's colour weight.
 *
 * NOTE: the design register publishes exactly two neutral rule weights
 * (`--border-subtle` and `--border-default`), so this three-member union no
 * longer maps onto three distinct colours: `strong` is currently an alias for
 * `default` and renders identically to it at every size. It is kept so existing
 * call sites keep compiling; prefer `size` to make a rule read heavier. Giving
 * `strong` its own colour again requires a third rule weight in the app's token
 * layer, which is an owner decision rather than a library one.
 */
export type SeparatorVariant = "default" | "subtle" | "strong";
export type SeparatorSize = "sm" | "md" | "lg";
type SeparatorOrientation = "horizontal" | "vertical";

export interface SeparatorProps extends Omit<HeadlessSeparatorProps, "class" | "style"> {
  /** The visual style variant. Note that `strong` currently renders as `default`
   * — see {@link SeparatorVariant}. @default 'default' */
  variant?: SeparatorVariant;
  /** The size/thickness of the separator. @default 'md' */
  size?: SeparatorSize;
  /** Additional CSS class name. */
  class?: string;
}

// A rule drawn as a filled bar, mirroring Divider's S2 approach (a solid
// `backgroundColor` plus an explicit px thickness rather than a CSS border).
// Sizes sm/md/lg map to 1/2/4px — the same steps as Divider's S/M/L — and the
// variants pick one of the register's neutral rule tokens. Routed through the
// `style()` macro so the CSS ships in the package bundle for installed
// consumers; the values are baked at build time, so this needs a rebuild of
// viviana-ui before any of it reaches a browser.
const separatorStyles = style<{
  variant: SeparatorVariant;
  size: SeparatorSize;
  orientation: SeparatorOrientation;
}>({
  /* The register's two rule weights, reached as a fill because this component paints
     its rule rather than bordering it. See the `backgroundColor` map in
     style/spectrum-theme.ts, which publishes exactly `border-subtle` and
     `border-default` and states there is deliberately no third weight.
     `strong` therefore resolves to the same rule as `default` — see the note on
     SeparatorVariant above. */
  backgroundColor: {
    variant: {
      default: "border-default",
      subtle: "border-subtle",
      strong: "border-default",
    },
  },
  borderStyle: "none",
  margin: 0,
  flexShrink: 0,
  alignSelf: { orientation: { vertical: "stretch" } },
  width: {
    orientation: {
      horizontal: "full",
      vertical: { default: "[2px]", size: { sm: "[1px]", lg: "[4px]" } },
    },
  },
  height: {
    orientation: {
      horizontal: { default: "[2px]", size: { sm: "[1px]", lg: "[4px]" } },
      vertical: "full",
    },
  },
});

/**
 * A separator is a visual divider between two groups of content,
 * e.g. groups of menu items or sections of a page.
 *
 * @example
 * ```tsx
 * <Separator />
 *
 * // Vertical separator
 * <div class="flex items-center gap-4">
 *   <span>Item 1</span>
 *   <Separator orientation="vertical" />
 *   <span>Item 2</span>
 * </div>
 *
 * // A lighter rule, or a heavier one
 * <Separator variant="subtle" />
 * <Separator size="lg" />
 * ```
 */
export function Separator(props: SeparatorProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["orientation", "variant", "size", "class"]);

  const orientation = () => local.orientation ?? "horizontal";
  const variant = () => local.variant ?? "default";
  const size = () => local.size ?? "md";

  return (
    <HeadlessSeparator
      {...headlessProps}
      orientation={orientation()}
      class={[
        separatorStyles({ variant: variant(), size: size(), orientation: orientation() }),
        local.class,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
