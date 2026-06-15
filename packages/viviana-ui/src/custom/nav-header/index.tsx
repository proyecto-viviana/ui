import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A nav bar with an accent bottom rule, a logo/wordmark slot,
// and trailing actions, on the S2 ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface NavHeaderProps {
  logo?: string;
  logoAlt?: string;
  logoText?: string;
  children?: JSX.Element;
  menuIcon?: JSX.Element;
  onMenuClick?: () => void;
  menuAriaLabel?: string;
  class?: string;
}

const bar = style({
  display: "flex",
  alignItems: "center",
  height: 70,
  backgroundColor: "[var(--color-bg-400)]",
  borderBottomWidth: 4,
  borderStyle: "solid",
  borderColor: "[var(--color-accent)]",
});

const lead = style({
  display: "flex",
  alignItems: "center",
  paddingStart: 32,
});

const logoText = style({
  display: "flex",
  alignItems: "center",
  font: "title-xl",
  fontWeight: "normal",
  color: "[var(--color-primary-700)]",
});

const logoImage = style({
  height: 42,
  width: "auto",
});

const trail = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "end",
  flexGrow: 1,
  gap: 12,
  paddingEnd: 32,
});

const menuButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backgroundColor: "transparent",
  borderStyle: "none",
  color: "[var(--color-primary-200)]",
});

export function NavHeader(props: NavHeaderProps) {
  return (
    <nav class={`${bar} ${props.class ?? ""}`}>
      <div class={lead}>
        <Show
          when={props.logo}
          fallback={
            <Show when={props.logoText}>
              <span class={logoText}>{props.logoText}</span>
            </Show>
          }
        >
          <img class={logoImage} src={props.logo} alt={props.logoAlt ?? "Logo"} />
        </Show>
      </div>

      <div class={trail}>
        {props.children}
        <Show when={props.menuIcon}>
          <HeadlessButton
            class={menuButton}
            onPress={() => props.onMenuClick?.()}
            aria-label={props.menuAriaLabel ?? "Open menu"}
          >
            {props.menuIcon}
          </HeadlessButton>
        </Show>
      </div>
    </nav>
  );
}
