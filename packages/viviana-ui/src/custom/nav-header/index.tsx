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
  // WCAG AA fix: the wordmark sits on the `--color-bg-400` bar. `--color-primary-700`
  // is a non-flipping brand fill (light blue in light mode, dark blue in dark mode) —
  // the SAME direction as the bar, so it read only 2.10:1 light / 2.92:1 dark. The
  // rendered `title-xl` measures under 24px, so WCAG scores it as normal text (4.5:1
  // floor, not the 3:1 large-text exception). `--color-primary-500` is the smallest
  // ramp step that flips with the theme (dark-on-light / light-on-dark) AND clears
  // 4.5:1, lifting the wordmark to 5.37:1 light / 7.00:1 dark while keeping a prominent
  // brand blue.
  color: "[var(--color-primary-500)]",
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
