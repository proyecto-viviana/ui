import type { JSX } from "solid-js";
import { Logo, type LogoProps } from "../logo";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A top app-bar: centered max-width row with a logo group and
// a nav slot, on the S2 ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface HeaderProps {
  logoImage?: JSX.Element;
  /** Props to pass to the Logo component (firstWord, secondWord, size, inverted). Pass null to hide the text logo. */
  logoProps?: LogoProps | null;
  logo?: JSX.Element;
  children?: JSX.Element;
  class?: string;
}

const bar = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "full",
  backgroundColor: "[var(--color-header-bg)]",
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "[var(--color-border)]",
});

const inner = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "full",
  maxWidth: 1152,
  paddingX: 24,
  paddingY: 12,
});

const logoGroup = style({
  display: "flex",
  alignItems: "center",
  gap: 12,
});

const nav = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
});

export function Header(props: HeaderProps) {
  const showTextLogo = () => props.logo !== undefined || props.logoProps !== null;

  return (
    <header class={`${bar} ${props.class ?? ""}`}>
      <div class={inner}>
        <div class={logoGroup}>
          {props.logoImage}
          {showTextLogo() && (props.logo ?? <Logo size="lg" {...(props.logoProps ?? {})} />)}
        </div>
        <nav class={nav}>{props.children}</nav>
      </div>
    </header>
  );
}
