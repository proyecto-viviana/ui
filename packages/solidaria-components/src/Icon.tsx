/**
 * Icon component for solidaria-components
 *
 * Minimal headless Icon that owns ARIA semantics:
 * - Decorative (no label): aria-hidden="true"
 * - Informative (aria-label): role="img" + aria-label
 * - Interactive (onPress): wraps content in headless Button
 *
 * The UI layer consumes this for styling/composition only.
 *
 * This is a local Solid component. The pinned React Aria Components source
 * has no Icon counterpart.
 */

import { type JSX, createContext, createMemo, Show, splitProps } from "solid-js";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { Button } from "./Button";
import type { PressEvent } from "@proyecto-viviana/solidaria";

export interface IconRenderProps {
  /** Whether the icon is purely decorative (no label). */
  isDecorative: boolean;
  /** Whether the icon is interactive (has onPress). */
  isInteractive: boolean;
}

export interface IconProps extends SlotProps {
  /** Handler called when the icon is pressed (makes it interactive). */
  onPress?: (e: PressEvent) => void;
  /** Accessible label for the icon. When provided, the icon is informative (role="img"). */
  "aria-label"?: string;
  /** ID of an element that labels this icon. */
  "aria-labelledby"?: string;
  /** The children of the component. A function may be provided to receive render props. */
  children?: RenderChildren<IconRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<IconRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<IconRenderProps>;
  /** The id of the element. */
  id?: string;
}

export const IconContext = createContext<IconProps | null>(null);

/**
 * An icon wrapper that provides correct ARIA semantics.
 *
 * - **Decorative** (no `aria-label`): renders `<span aria-hidden="true">`
 * - **Informative** (`aria-label` provided): renders `<span role="img" aria-label="...">`
 * - **Interactive** (`onPress` provided): wraps in headless `Button`
 *
 * @example
 * ```tsx
 * // Decorative
 * <Icon><SearchSvg /></Icon>
 *
 * // Informative
 * <Icon aria-label="Search"><SearchSvg /></Icon>
 *
 * // Interactive
 * <Icon onPress={handleSearch} aria-label="Search"><SearchSvg /></Icon>
 * ```
 */
export function Icon(props: IconProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "style",
    "slot",
    "onPress",
    "aria-label",
    "aria-labelledby",
  ]);

  const hasLabel = () => !!(local["aria-label"] || local["aria-labelledby"]);
  const isInteractive = () => !!local.onPress;
  const isDecorative = () => !hasLabel();

  const renderValues = createMemo<IconRenderProps>(() => ({
    isDecorative: isDecorative(),
    isInteractive: isInteractive(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Icon",
    },
    renderValues,
  );

  const domProps = createMemo(() => filterDOMProps(rest, { global: true }));

  return (
    <Show
      when={isInteractive()}
      fallback={
        <span
          {...domProps()}
          role={hasLabel() ? "img" : undefined}
          aria-hidden={isDecorative() ? "true" : undefined}
          aria-label={local["aria-label"]}
          aria-labelledby={local["aria-labelledby"]}
          class={renderProps.class()}
          style={renderProps.style()}
          data-interactive={undefined}
          data-decorative={isDecorative() || undefined}
        >
          {renderProps.renderChildren()}
        </span>
      }
    >
      <Button
        {...domProps()}
        onPress={local.onPress}
        aria-label={local["aria-label"]}
        aria-labelledby={local["aria-labelledby"]}
        class={renderProps.class()}
        style={renderProps.style()}
        data-interactive=""
      >
        {renderProps.renderChildren()}
      </Button>
    </Show>
  );
}
