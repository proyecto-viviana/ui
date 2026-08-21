import { createContext, useContext } from "solid-js";
import type { ActionButtonProps } from "./ActionButton";
import type { ButtonProps } from "./types";
import type { LinkButtonProps } from "./LinkButton";
import type { ToggleButtonProps } from "./ToggleButton";
import type { SpectrumContextValue } from "./spectrum-context";

export const ButtonContext = createContext<SpectrumContextValue<ButtonProps>>(null);
export const LinkButtonContext = createContext<SpectrumContextValue<LinkButtonProps>>(null);
export const ActionButtonContext =
  createContext<SpectrumContextValue<ActionButtonProps & { holdAffordance?: boolean }>>(null);
export const ToggleButtonContext =
  createContext<SpectrumContextValue<ToggleButtonProps & { holdAffordance?: boolean }>>(null);

export function useButtonContext(): SpectrumContextValue<ButtonProps> {
  return useContext(ButtonContext);
}

export function useLinkButtonContext(): SpectrumContextValue<LinkButtonProps> {
  return useContext(LinkButtonContext);
}

export function useActionButtonContext(): SpectrumContextValue<
  ActionButtonProps & { holdAffordance?: boolean }
> {
  return useContext(ActionButtonContext);
}

export function useToggleButtonContext(): SpectrumContextValue<
  ToggleButtonProps & { holdAffordance?: boolean }
> {
  return useContext(ToggleButtonContext);
}
