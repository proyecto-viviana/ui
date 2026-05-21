import { type JSX, Show, splitProps } from "solid-js";
import { Label as UILabel } from "../label";
import { Text as UIText } from "../text";

export type LabeledValueOrientation = "vertical" | "horizontal";

export interface LabeledValueProps {
  /** Visible label content. */
  label: JSX.Element;
  /** Value content. Prefer this over children for clarity. */
  value?: JSX.Element;
  /** Alternate value content. */
  children?: JSX.Element;
  /** Layout orientation. @default 'vertical' */
  orientation?: LabeledValueOrientation;
  /** Additional class for root container. */
  class?: string;
  /** Additional class for label slot. */
  labelClass?: string;
  /** Additional class for value slot. */
  valueClass?: string;
}

const orientationStyles: Record<LabeledValueOrientation, string> = {
  vertical: "flex-col items-start gap-1",
  horizontal: "flex-row items-center justify-between gap-3",
};

export function LabeledValue(props: LabeledValueProps): JSX.Element {
  const [local] = splitProps(props, [
    "label",
    "value",
    "children",
    "orientation",
    "class",
    "labelClass",
    "valueClass",
  ]);

  const orientation = () => local.orientation ?? "vertical";
  const resolvedValue = () => local.value ?? local.children;

  return (
    <div class={`flex ${orientationStyles[orientation()]} ${local.class ?? ""}`}>
      <UILabel size="sm" class={`text-primary-400 ${local.labelClass ?? ""}`}>
        {local.label}
      </UILabel>
      <Show when={resolvedValue()}>
        <UIText UNSAFE_className={`text-primary-100 text-base ${local.valueClass ?? ""}`}>
          {resolvedValue()}
        </UIText>
      </Show>
    </div>
  );
}
