import type { JSX } from "solid-js";
import { Show } from "solid-js";
import { Button as HeadlessButton } from "@proyecto-viviana/solidaria-components";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). S2 named tokens carry the shape (mirrors Badge's size-S
// control: minHeight 24, 2px border, ui-sm font, pill radius); Silapse colors
// ride in as arbitrary `[var(--color-*)]` values.
import { style } from "../../style" with { type: "macro" };

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

const chip = style<{ variant: ChipVariant }>({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  columnGap: "text-to-visual",
  minHeight: 24,
  width: "fit",
  paddingX: 12,
  borderRadius: "full",
  borderStyle: "solid",
  borderWidth: 2,
  font: "ui-sm",
  borderColor: {
    default: "transparent",
    variant: { outline: "[var(--color-primary-600)]" },
  },
  backgroundColor: {
    variant: {
      primary: "[var(--color-primary-700)]",
      secondary: "[var(--color-bg-100)]",
      accent: "[var(--color-accent)]",
      outline: "transparent",
    },
  },
  color: {
    variant: {
      primary: "[var(--color-primary-100)]",
      secondary: "[var(--color-primary-200)]",
      accent: "[var(--color-bg-400)]",
      outline: "[var(--color-primary-200)]",
    },
  },
});

export function Chip(props: ChipProps) {
  const renderIcon = () => {
    const icon = props.icon;
    if (!icon) return null;
    if (typeof icon === "string") return icon;
    return icon();
  };

  return (
    <HeadlessButton
      class={`${chip({ variant: props.variant ?? "primary" })} ${props.class ?? ""}`}
      onPress={() => props.onClick?.()}
    >
      <Show when={props.icon}>
        <span>{renderIcon()}</span>
      </Show>
      {props.text}
    </HeadlessButton>
  );
}
