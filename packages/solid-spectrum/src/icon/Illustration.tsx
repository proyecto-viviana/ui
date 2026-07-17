import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };

export type IllustrationSize = "sm" | "md" | "lg";

export interface IllustrationProps {
  /** The size of the illustration. @default 'md' */
  size?: IllustrationSize;
  /** Additional CSS class name. */
  class?: string;
  /** The illustration content (SVG or image). */
  children?: JSX.Element;
  /** Accessibility label. */
  "aria-label"?: string;
}

// Centered container for a decorative illustration, tinted with the muted
// `gray-500` neutral. Sizes map sm/md/lg → 64/96/128px (the old w-16/24/32).
// Routed through the `style()` macro so the CSS ships in the package bundle for
// installed consumers.
const illustrationStyles = style<{ size: IllustrationSize }>({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "gray-500",
  width: { default: "[96px]", size: { sm: "[64px]", lg: "[128px]" } },
  height: { default: "[96px]", size: { sm: "[64px]", lg: "[128px]" } },
});

/**
 * A styled container for decorative illustrations.
 */
export function Illustration(props: IllustrationProps): JSX.Element {
  const [local, rest] = splitProps(props, ["size", "class", "children"]);

  return (
    <div
      {...rest}
      role={rest["aria-label"] ? "img" : "presentation"}
      class={[illustrationStyles({ size: local.size ?? "md" }), local.class]
        .filter(Boolean)
        .join(" ")}
    >
      {local.children}
    </div>
  );
}
