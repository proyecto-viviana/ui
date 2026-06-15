import type { JSX } from "solid-js";
import { Show, For } from "solid-js";

export interface NavItemProps {
  title: string;
  children?: JSX.Element;
  class?: string;
}

export function NavItem(props: NavItemProps) {
  return (
    <li class={`flex items-center ${props.class ?? ""}`}>
      <span class="text-lg font-bold text-primary-200">{props.title}</span>
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

export function NavLink(props: NavLinkProps) {
  const activeStyles = "font-medium text-primary-300 underline underline-offset-4";
  const inactiveStyles =
    "font-normal text-gray-200 underline-offset-4 hover:text-gray-100 hover:underline";

  return (
    <a
      href={props.href}
      class={`${props.active ? activeStyles : inactiveStyles} ${props.class ?? ""}`}
    >
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

export function NavSection(props: NavSectionProps) {
  return (
    <div class={props.class ?? ""}>
      <NavItem title={props.title} />
      <div class="flex h-full">
        <div class="h-5 w-1 bg-accent-300" />
        <ul class="flex h-full flex-1 flex-col gap-1 pl-4">
          <Show when={props.links}>
            <For each={props.links}>
              {(link) => (
                <li>
                  <NavLink href={link.href} active={link.active}>
                    {link.label}
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

export function LateralNav(props: LateralNavProps) {
  const bgColor = () => (props.transparent ? "" : "bg-bg-200");

  return (
    <div
      class={`hidden w-[300px] md:block ${bgColor()} m-0 border-r border-primary-600 p-3 ${props.class ?? ""}`}
    >
      {props.children}
    </div>
  );
}
