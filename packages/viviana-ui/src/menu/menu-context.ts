import { createContext } from "solid-js";
import type { S2MenuSize } from "./s2-menu-styles";

export type MenuAlign = "start" | "end";
export type MenuDirection = "top" | "bottom" | "start" | "end" | "left" | "right";

export interface MenuTriggerOptionsContextValue {
  align: () => MenuAlign | undefined;
  direction: () => MenuDirection | undefined;
  shouldFlip: () => boolean | undefined;
}

export const MenuSizeContext = createContext<S2MenuSize>("M");
export const MenuLinkOutIconContext = createContext(false);
export const MenuTriggerOptionsContext = createContext<MenuTriggerOptionsContextValue | null>(null);
