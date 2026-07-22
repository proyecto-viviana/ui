import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";
import { typeRoles } from "./type-roles";

export interface KeyboardProps extends BaseContentProps<HTMLElement> {}

export const KeyboardContext = createContext<SpectrumContextValue<KeyboardProps>>(null);

export function Keyboard(props: KeyboardProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(KeyboardContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as KeyboardProps;
  const [local] = splitProps(merged, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
      /* Standalone default: the register's terminal role (mono, wells & prompts).
       * Skipped whenever a slotted context claims this <kbd> — MenuItem and other
       * hosts style their key hints through KeyboardContext, usually relying on
       * inheritance the baked role would break. See text/index.tsx for the full
       * rationale. */
      mergeContextStyles(
        contextProps == null ? typeRoles.terminal : undefined,
        mergeContextStyles(contextProps?.styles, props.styles),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <kbd
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
      dir="ltr"
    >
      {local.children}
    </kbd>
  );
}
