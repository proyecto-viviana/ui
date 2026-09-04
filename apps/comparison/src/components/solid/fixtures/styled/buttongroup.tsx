import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  buttonGroupDemoPropsFromWindow,
  normalizeButtonGroupDemoProps,
  serializeButtonGroupDemoProps,
  type ButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import { solidSingleButtonFamilyChildren, providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ButtonGroupDemoProps>(
    buttonGroupDemoPropsFromWindow(),
  );
  const [actionKey, setActionKey] = createSignal("");

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumButtonGroup,
      {
        "aria-label": "Approval actions",
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeButtonGroupDemoProps(props),
        orientation: props.orientation,
        align: props.align,
        size: props.size,
        isDisabled: props.isDisabled,
        UNSAFE_style: props.wrapWidth ? { width: `${props.wrapWidth}px` } : undefined,
      },
      [
        hc(
          SolidSpectrumButton,
          {
            variant: "primary",
            "aria-label": props.iconPlacement === "only" ? "Save" : undefined,
            onPress: (_event: unknown) => setActionKey("save"),
          },
          solidSingleButtonFamilyChildren("Save", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
        hc(
          SolidSpectrumButton,
          {
            variant: "secondary",
            "aria-label": props.iconPlacement === "only" ? "Cancel" : undefined,
            onPress: (_event: unknown) => setActionKey("cancel"),
          },
          solidSingleButtonFamilyChildren("Cancel", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
      ],
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get "data-comparison-action-key"() {
            return actionKey();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

export default () => h(SolidSpectrumButtonGroupDemo, {});
