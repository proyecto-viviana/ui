import { type JSX, splitProps } from "solid-js";
import {
  ToggleButton as HeadlessToggleButton,
  type ToggleButtonProps as HeadlessToggleButtonProps,
  type ToggleButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { useProviderProps } from "../provider";
import { style, focusRing } from "../style" with { type: "macro" };

export interface LogicButtonProps extends Omit<
  HeadlessToggleButtonProps,
  "class" | "style" | "children"
> {
  /** Additional CSS class name. */
  class?: string;
}

// A compact AND/OR toggle: an accent fill with white text when selected, a
// bordered neutral chip when not, plus the S2 focus ring. Selection/disabled are
// driven by the render-prop conditions fed to the style() macro so the CSS ships
// in the package bundle for installed consumers.
const logicButtonStyles = style<{
  isSelected?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
}>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  paddingX: 8,
  paddingY: 2,
  minWidth: 48,
  font: "ui-xs",
  fontWeight: "bold",
  borderRadius: "sm",
  borderStyle: "solid",
  borderWidth: 1,
  cursor: "default",
  transition: "default",
  backgroundColor: {
    default: "gray-100",
    isSelected: "accent-900",
    isDisabled: "gray-100",
  },
  borderColor: {
    default: "gray-300",
    isSelected: "transparent",
    isDisabled: "transparent",
  },
  color: {
    default: "neutral-subdued",
    isSelected: "white",
    isDisabled: "disabled",
  },
});

/**
 * An AND/OR logic toggle button. Displays "AND" when selected (default), "OR" when not.
 */
export function LogicButton(props: LogicButtonProps): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, ["class"]);

  const getClassName = (renderProps: ToggleButtonRenderProps): string =>
    [
      logicButtonStyles({
        isSelected: renderProps.isSelected,
        isDisabled: renderProps.isDisabled,
        isFocusVisible: renderProps.isFocusVisible,
      }),
      local.class,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessToggleButton {...headlessProps} class={getClassName}>
      {(renderProps: ToggleButtonRenderProps) => (
        <span>{renderProps.isSelected ? "AND" : "OR"}</span>
      )}
    </HeadlessToggleButton>
  );
}
