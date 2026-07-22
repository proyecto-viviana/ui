import { type JSX, splitProps } from "solid-js";
import { resolveGap } from "./Flex";

export interface GridProps {
  /** The number of columns, or a grid-template-columns value. */
  columns?: number | string;
  /** The number of rows, or a grid-template-rows value. */
  rows?: number | string;
  /** The gap between items. Accepts a t-shirt size, a number (spacing scale), or a raw CSS length. */
  gap?: string | number;
  /** The column gap. */
  columnGap?: string | number;
  /** The row gap. */
  rowGap?: string | number;
  /** Named grid areas (grid-template-areas). */
  areas?: string[];
  /** The alignment of items. */
  alignItems?: "start" | "center" | "end" | "stretch";
  /** The justification of items. */
  justifyItems?: "start" | "center" | "end" | "stretch";
  /** Whether the grid is inline. */
  inline?: boolean;
  /** Additional CSS class name. */
  class?: string;
  /** Additional inline styles. */
  style?: JSX.CSSProperties;
  /** The content. */
  children?: JSX.Element;
}

// Layout primitives emit inline CSS so the styling ships with the package for
// installed consumers, rather than relying on Tailwind utility strings the
// package ships no CSS for.

/**
 * A CSS Grid layout component.
 */
export function Grid(props: GridProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "columns",
    "rows",
    "gap",
    "columnGap",
    "rowGap",
    "areas",
    "alignItems",
    "justifyItems",
    "inline",
    "class",
    "style",
    "children",
  ]);

  const gridStyle = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {
      display: local.inline ? "inline-grid" : "grid",
      ...local.style,
    };

    if (local.columns !== undefined) {
      s["grid-template-columns"] =
        typeof local.columns === "number" ? `repeat(${local.columns}, 1fr)` : local.columns;
    }
    if (local.rows !== undefined) {
      s["grid-template-rows"] =
        typeof local.rows === "number" ? `repeat(${local.rows}, 1fr)` : local.rows;
    }
    if (local.areas) {
      s["grid-template-areas"] = local.areas.map((a) => `"${a}"`).join(" ");
    }
    if (local.gap !== undefined) s.gap = resolveGap(local.gap);
    if (local.columnGap !== undefined) s["column-gap"] = resolveGap(local.columnGap);
    if (local.rowGap !== undefined) s["row-gap"] = resolveGap(local.rowGap);
    if (local.alignItems) s["align-items"] = local.alignItems;
    if (local.justifyItems) s["justify-items"] = local.justifyItems;

    return s;
  };

  return (
    <div {...rest} class={local.class} style={gridStyle()}>
      {local.children}
    </div>
  );
}
