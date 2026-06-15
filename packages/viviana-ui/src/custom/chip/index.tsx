import { type JSX, Show } from "solid-js";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";

export type ChipVariant = "primary" | "secondary" | "accent" | "outline";

export interface ChipProps {
  text: string;
  variant?: ChipVariant;
  onClick?: () => void;
  /**
   * Icon to display before the text.
   * Use a function returning JSX for SSR compatibility: `icon={() => <MyIcon />}`
   * Or pass a simple string for text-based icons: `icon="★"`
   */
  icon?: string | (() => JSX.Element);
  class?: string;
}

const variantStyles: Record<ChipVariant, string> = {
  primary: "bg-primary-700 text-primary-100 shadow-primary-chip",
  secondary: "bg-primary-700 text-primary-100 hover:bg-primary-600",
  accent: "bg-accent text-bg-400",
  outline: "bg-transparent border border-primary-500 text-primary-300",
};

export function Chip(props: ChipProps) {
  const variant = () => props.variant ?? "primary";

  const renderIcon = () => {
    const icon = props.icon;
    if (!icon) return null;
    if (typeof icon === "string") return icon;
    return icon();
  };

  return (
    <HeadlessButton
      class={`flex justify-center items-center h-6 w-auto rounded-full px-4 py-1 font-medium text-sm tracking-wide transition-colors ${variantStyles[variant()]} ${props.class ?? ""}`}
      onPress={() => props.onClick?.()}
    >
      <Show when={props.icon}>
        <span class="mr-1.5">{renderIcon()}</span>
      </Show>
      <span>{props.text}</span>
    </HeadlessButton>
  );
}
