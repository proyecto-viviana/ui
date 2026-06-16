import type { JSX } from "solid-js";
import { Show, For } from "solid-js";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A sidebar nav (sections with an accent rail + links) on the
// S2 spacing/type ramps in Silapse colors.
import { style } from "../../style" with { type: "macro" };

export interface NavItemProps {
  title: string;
  children?: JSX.Element;
  class?: string;
}

const item = style({
  display: "flex",
  alignItems: "center",
  font: "heading-sm",
  color: "[var(--color-primary-200)]",
});

export function NavItem(props: NavItemProps) {
  return (
    <li class={`${item} ${props.class ?? ""}`}>
      <span>{props.title}</span>
      {props.children}
    </li>
  );
}

export interface NavLinkProps {
  href: string;
  children: JSX.Element;
  active?: boolean;
  class?: string;
}

const link = style<{ isActive: boolean }>({
  font: "ui",
  textDecoration: { default: "none", isActive: "underline" },
  fontWeight: { default: "normal", isActive: "medium" },
  color: {
    default: "[var(--color-text-secondary)]",
    isActive: "[var(--color-primary-300)]",
  },
});

export function NavLink(props: NavLinkProps) {
  return (
    <a href={props.href} class={`${link({ isActive: props.active ?? false })} ${props.class ?? ""}`}>
      {props.children}
    </a>
  );
}

export interface NavSectionProps {
  title: string;
  links?: { href: string; label: string; active?: boolean }[];
  children?: JSX.Element;
  class?: string;
}

const sectionRow = style({
  display: "flex",
});

const accentRail = style({
  flexShrink: 0,
  width: 4,
  height: 20,
  backgroundColor: "[var(--color-accent-300)]",
});

const list = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  gap: 4,
  paddingStart: 16,
});

export function NavSection(props: NavSectionProps) {
  return (
    <div class={props.class ?? ""}>
      <NavItem title={props.title} />
      <div class={sectionRow}>
        <div class={accentRail} />
        <ul class={list}>
          <Show when={props.links}>
            <For each={props.links}>
              {(navLink) => (
                <li>
                  <NavLink href={navLink.href} active={navLink.active}>
                    {navLink.label}
                  </NavLink>
                </li>
              )}
            </For>
          </Show>
          {props.children}
        </ul>
      </div>
    </div>
  );
}

export interface LateralNavProps {
  transparent?: boolean;
  children?: JSX.Element;
  class?: string;
}

const nav = style<{ isTransparent: boolean }>({
  width: 300,
  margin: 0,
  padding: 12,
  borderEndWidth: 1,
  borderStyle: "solid",
  borderColor: "[var(--color-primary-600)]",
  backgroundColor: {
    default: "[var(--color-bg-200)]",
    isTransparent: "transparent",
  },
});

export function LateralNav(props: LateralNavProps) {
  return (
    <div class={`${nav({ isTransparent: props.transparent ?? false })} ${props.class ?? ""}`}>
      {props.children}
    </div>
  );
}
