import { type JSX, createContext, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { type ContextValue, type SlotProps, useContextProps, filterDOMProps } from "./utils";

export interface TextProps extends JSX.HTMLAttributes<HTMLElement>, SlotProps {
  /** The element type to render as. @default 'span' */
  elementType?: string;
}

/**
 * Slotted context for `Text`. A field provides description / errorMessage props
 * (each carrying the `id` its `aria-describedby` references) under named slots,
 * so a `<Text slot="description">` child picks up the right `id` without the field
 * threading it manually. Mirrors react-aria-components' `TextContext` (default
 * `{}` so an unprovided `Text` merges against an empty context and renders as-is).
 */
export const TextContext = createContext<ContextValue<TextProps, HTMLElement>>({});

/**
 * A piece of text, typically a label, description, or error message inside a
 * field. Port of react-aria-components' `Text`: it consumes its slot from
 * `TextContext` (via `useContextProps`) so a field can supply the `id` and other
 * props for the matching slot, then renders them onto the element.
 */
export function Text(props: TextProps): JSX.Element {
  const [merged] = useContextProps(props, undefined, TextContext);
  // `slot` stays a logical prop (not a DOM attribute) and `ref`/`class`/`children`
  // are rendered explicitly; everything else (notably the slotted `id`) is spread.
  const [local, domProps] = splitProps(merged, ["elementType", "class", "children", "slot", "ref"]);
  return (
    <Dynamic
      component={local.elementType ?? "span"}
      class={local.class ?? "solidaria-Text"}
      {...filterDOMProps(domProps, { global: true })}
    >
      {local.children}
    </Dynamic>
  );
}
