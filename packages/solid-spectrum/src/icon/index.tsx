import type { Component, JSX } from "solid-js";
import { Icon as HeadlessIcon, type IconRenderProps } from "@proyecto-viviana/solidaria-components";
import type { PressEvent } from "@proyecto-viviana/solidaria";
export { IconContext, IllustrationContext, createIcon, createIllustration } from "./spectrum-icon";
export type {
  IconContextValue,
  SpectrumIconProps,
  SpectrumIllustrationProps,
} from "./spectrum-icon";
export * from "./ui-icons";
export * as s2wfIcons from "./s2wf-icons";

export interface IconProps {
  /** The icon component to render (should accept size and color props) */
  icon: Component<{ size?: string | number; color?: string }>;
  /** Size of the icon (e.g., '24px' or 24) */
  size?: string | number;
  /** Color of the icon */
  color?: string;
  /** Whether to show the accent shadow effect (4px offset to bottom) */
  withShadow?: boolean;
  /** Additional CSS class */
  class?: string;
  /** Press handler for interactive icons. */
  onPress?: (e: PressEvent) => void;
  /** Accessible label for interactive icons. */
  "aria-label"?: string;
  /** ID of an element that labels this icon. */
  "aria-labelledby"?: string;
}

/**
 * Icon wrapper component with optional accent shadow effect.
 *
 * The shadow effect creates a 4px offset accent-colored duplicate
 * of the icon behind it for a stylized look.
 *
 * Behavior (element type, ARIA attributes) is owned by the headless Icon.
 * This component only handles styling and visual composition.
 */
export function Icon(props: IconProps): JSX.Element {
  const size = () => props.size ?? 24;
  const color = () => props.color ?? "var(--color-primary-500)";
  const IconComponent = props.icon;

  const getClassName = (_renderProps: IconRenderProps): string => {
    const classList = ["vui-icon"];
    if (props.withShadow) {
      classList.push("vui-icon--with-shadow");
    }
    if (props.onPress) {
      classList.push("vui-icon--button");
    }
    if (props.class) {
      classList.push(props.class);
    }
    return classList.join(" ");
  };

  return (
    <HeadlessIcon
      onPress={props.onPress}
      aria-label={props["aria-label"]}
      aria-labelledby={props["aria-labelledby"]}
      class={getClassName}
    >
      {props.withShadow && (
        <div class="vui-icon__shadow" aria-hidden="true">
          <IconComponent size={size()} color="var(--color-accent)" />
        </div>
      )}
      <div class="vui-icon__main">
        <IconComponent size={size()} color={color()} />
      </div>
    </HeadlessIcon>
  );
}

export { GitHubIcon } from "./icons/GitHubIcon";
export type { GitHubIconProps } from "./icons/GitHubIcon";

export { Illustration } from "./Illustration";
export type { IllustrationProps, IllustrationSize } from "./Illustration";
export { UIIcon } from "./UIIcon";
export type { UIIconProps, UIIconSize } from "./UIIcon";
