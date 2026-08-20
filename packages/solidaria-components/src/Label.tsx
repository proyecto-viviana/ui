import { type JSX, createContext, splitProps } from "solid-js";
import { ElementTag } from "./ElementTag";
import { type ContextValue, type RefLike, type SlotProps, useContextProps } from "./utils";

export interface LabelProps
  extends Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "ref">, SlotProps {
  /** The HTML element used to render the label. @default 'label' */
  elementType?: string;
  ref?: RefLike<HTMLElement>;
}

/** Props supplied to a Label by its parent component. */
export const LabelContext = createContext<ContextValue<LabelProps, HTMLElement>>({});

/**
 * A label that receives its element type and relationship props from a parent
 * component. This is a port of react-aria-components' shared Label.
 */
export function Label(props: LabelProps): JSX.Element {
  const [merged, ref] = useContextProps(props, props.ref, LabelContext);
  const [local, domProps] = splitProps(merged, ["elementType", "class", "children", "slot", "ref"]);

  return (
    <ElementTag
      {...domProps}
      ref={ref}
      class={local.class ?? "solidaria-Label"}
      tag={local.elementType ?? "label"}
    >
      {local.children}
    </ElementTag>
  );
}
