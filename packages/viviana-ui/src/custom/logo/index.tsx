import type { JSX } from "solid-js";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A clean two-word wordmark: the S2 title ramp sizes it; Silapse
// colors paint it (primary + accent). `inverted` swaps which word takes accent.
import { style } from "../../style" with { type: "macro" };

export type LogoSize = "sm" | "md" | "lg" | "xl";

export interface LogoProps {
  firstWord?: string;
  secondWord?: string;
  size?: LogoSize;
  inverted?: boolean;
  class?: string;
}

const wordmark = style<{ size: LogoSize }>({
  display: "inline-flex",
  alignItems: "baseline",
  columnGap: 8,
  whiteSpace: "nowrap",
  font: {
    size: {
      sm: "title-sm",
      md: "title",
      lg: "title-xl",
      xl: "title-3xl",
    },
  },
  fontWeight: "black",
});

const word = style<{ tone: "primary" | "accent" }>({
  color: {
    tone: {
      primary: "[var(--color-primary-100)]",
      accent: "[var(--color-accent)]",
    },
  },
});

export function Logo(props: LogoProps): JSX.Element {
  const firstWord = () => props.firstWord ?? "Proyecto";
  const secondWord = () => props.secondWord ?? "Viviana";
  const inverted = () => props.inverted ?? false;

  return (
    <span class={`${wordmark({ size: props.size ?? "md" })} ${props.class ?? ""}`}>
      <span class={word({ tone: inverted() ? "accent" : "primary" })}>{firstWord()}</span>
      <span class={word({ tone: inverted() ? "primary" : "accent" })}>{secondWord()}</span>
    </span>
  );
}
