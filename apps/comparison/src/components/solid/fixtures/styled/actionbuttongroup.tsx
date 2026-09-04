import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  ActionButtonGroup as SolidSpectrumActionButtonGroup,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { s2ActionButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import { comparisonActionItems as actionItems } from "@comparison/data/comparison-contract";

type ActionItem = (typeof actionItems)[number];
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  actionButtonGroupDemoPropsFromWindow,
  normalizeActionButtonGroupDemoProps,
  serializeActionButtonGroupDemoProps,
  type ActionButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  solidSingleButtonFamilyChildren,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function queryParamFromWindow(name: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function selectedKeysParamFromWindow(fallback: string[]) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

function SolidSpectrumActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ActionButtonGroupDemoProps>(
    actionButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(["bold"]),
  );
  const [actionKey, setActionKey] = createSignal("");
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  const toggleKey = (key: string) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumActionButtonGroup,
      {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(props),
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
      },
      actionItems.map((item: ActionItem) =>
        hc(
          SolidSpectrumActionButton,
          {
            "aria-label": props.iconPlacement === "only" ? item.label : undefined,
            get "aria-pressed"() {
              return selectedKeys().has(item.id);
            },
            onPress: (_event: unknown) => toggleKey(item.id),
          },
          solidSingleButtonFamilyChildren(item.label, props.iconPlacement, () =>
            s2ActionButtonText({ isProgressVisible: false }),
          ),
        ),
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(groupProps().staticColor);
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(groupProps().staticColor);
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

export default () => h(SolidSpectrumActionButtonGroupDemo, {});
