/**
 * Shared field `prefix` slot.
 *
 * Port of the `prefix` slot on upstream S2's `FieldGroup`
 * (`@react-spectrum/s2/src/Field.tsx`). Upstream centralizes the prefix in a
 * single shared `FieldGroup`; we compose a field group per component, so the
 * prefix is threaded into each field (TextField, ColorField, NumberField,
 * ComboBox) through these shared primitives instead.
 *
 * Two pieces, matching upstream:
 *  - `FieldPrefix` renders the prefix node (text or icon) before the input with
 *    the upstream styling (`gray-600`, `flex-shrink: 0`, `margin-end:
 *    text-to-visual`, icon sized to `fontRelative(20)`).
 *  - `PrefixInputProvider` associates the prefix with the input by appending the
 *    prefix's id to the input's `aria-labelledby`, mirroring upstream's
 *    `InputContext.Provider value={{...ctx, 'aria-labelledby': ...}}`.
 */
import { type Context, type JSX, useContext } from "solid-js";
import { CenterBaseline } from "../icon/center-baseline";
import { IconContext, type IconContextValue } from "../icon";
import { fontRelative, style } from "../style" with { type: "macro" };

const prefixStyles = style({
  color: "gray-600",
  flexShrink: 0,
  marginEnd: "text-to-visual",
});

const prefixIconStyles = style({
  size: fontRelative(20),
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const prefixIconContext: IconContextValue = { styles: prefixIconStyles };

/** Renders a field prefix node (text or icon) with the upstream prefix styling. */
export function FieldPrefix(props: { id: string; children: JSX.Element }): JSX.Element {
  return (
    <IconContext.Provider value={prefixIconContext}>
      <CenterBaseline id={props.id} styles={prefixStyles}>
        {props.children}
      </CenterBaseline>
    </IconContext.Provider>
  );
}

function appendLabelledBy(
  inputProps: Record<string, unknown> | undefined,
  prefixId: string,
): Record<string, unknown> {
  const base = inputProps?.["aria-labelledby"];
  const labelledBy =
    typeof base === "string" && base.length > 0 ? `${base} ${prefixId}` : prefixId;
  return { ...inputProps, "aria-labelledby": labelledBy };
}

/**
 * Returns a proxy over a field context that delegates every property to the
 * original value and overrides only `inputProps`, appending `prefixId` to its
 * `aria-labelledby`. The delegation keeps the underlying getters live, so the
 * input stays reactive. `inputPropsIsFunction` handles ComboBox's function-form
 * `inputProps` (Text/Color/NumberField expose it as an object).
 */
export function withPrefixLabelledBy<T extends object>(
  context: T | null,
  prefixId: string,
  inputPropsIsFunction = false,
): T | null {
  if (!context) {
    return context;
  }
  return new Proxy(context, {
    get(target, property, receiver) {
      if (property === "inputProps") {
        if (inputPropsIsFunction) {
          return () => {
            const inputProps = (
              Reflect.get(target, property, target) as () => Record<string, unknown>
            )();
            return appendLabelledBy(inputProps, prefixId);
          };
        }
        const inputProps = Reflect.get(target, property, target) as
          | Record<string, unknown>
          | undefined;
        return appendLabelledBy(inputProps, prefixId);
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

/**
 * Wraps a field input so its `aria-labelledby` is extended to include the prefix
 * id. Reads the nearest field context, augments only `inputProps`, and re-provides
 * the augmented value to the input.
 */
export function PrefixInputProvider<T extends object>(props: {
  context: Context<T | null>;
  prefixId: string;
  inputPropsIsFunction?: boolean;
  children: JSX.Element;
}): JSX.Element {
  const context = useContext(props.context);
  const value = withPrefixLabelledBy(context, props.prefixId, props.inputPropsIsFunction);
  return <props.context.Provider value={value}>{props.children}</props.context.Provider>;
}
