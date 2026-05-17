import { createContext } from "solid-js";
import type { S2MenuSize } from "./s2-menu-styles";

export const MenuSizeContext = createContext<S2MenuSize>("M");
export const MenuLinkOutIconContext = createContext(false);
