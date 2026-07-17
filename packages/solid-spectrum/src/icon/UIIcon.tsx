import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };

export type UIIconSize = "xs" | "sm" | "md" | "lg";

export interface UIIconProps {
  /** The size of the icon. @default 'md' */
  size?: UIIconSize;
  /** Additional CSS class name. */
  class?: string;
  /** The SVG content or icon element. */
  children?: JSX.Element;
  /** Accessibility label. */
  "aria-label"?: string;
  /** Whether the icon is hidden from screen readers. @default true */
  "aria-hidden"?: boolean;
}

// A fixed-size inline box for internal UI glyphs. Sized through the S2 macro so
// the CSS ships in the package bundle for installed consumers.
const iconStyles = style<{ size: UIIconSize }>({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  width: { size: { xs: 12, sm: 16, md: 20, lg: 24 } },
  height: { size: { xs: 12, sm: 16, md: 20, lg: 24 } },
});

/**
 * A utility icon wrapper for internal UI icons.
 */
export function UIIcon(props: UIIconProps): JSX.Element {
  const [local, rest] = splitProps(props, ["size", "class", "children"]);

  return (
    <span
      {...rest}
      role={rest["aria-label"] ? "img" : undefined}
      aria-hidden={rest["aria-hidden"] ?? !rest["aria-label"]}
      class={[iconStyles({ size: local.size ?? "md" }), local.class].filter(Boolean).join(" ")}
    >
      {local.children}
    </span>
  );
}
