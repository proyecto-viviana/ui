import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";

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

export function NavHeader(props: NavHeaderProps) {
  return (
    <nav
      class={`flex items-center bg-bg-400 h-[70px] border-b-4 border-accent-500 ${props.class ?? ""}`}
    >
      <div class="pl-1 md:pl-8 flex items-center">
        <Show
          when={props.logo}
          fallback={
            <Show when={props.logoText}>
              <span class="text-[34px] font-light text-primary-700 flex items-center">
                {props.logoText}
              </span>
            </Show>
          }
        >
          <img src={props.logo} alt={props.logoAlt ?? "Logo"} class="h-[42px] w-auto" />
        </Show>
      </div>

      <div class="flex-1 flex justify-end items-center pr-1 md:pr-8">
        {props.children}
        <Show when={props.menuIcon}>
          <HeadlessButton
            class="md:hidden flex items-center justify-center"
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
