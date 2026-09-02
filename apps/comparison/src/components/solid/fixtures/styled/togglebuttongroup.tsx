import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  ToggleButton as SolidSpectrumToggleButton,
  ToggleButtonGroup as SolidSpectrumToggleButtonGroup,
} from "@proyecto-viviana/solid-spectrum";
import { s2ToggleButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeToggleButtonGroupDemoProps,
  selectedKeysSetFromText as selectedToggleKeysSetFromText,
  serializeToggleButtonGroupDemoProps,
  toggleButtonGroupDemoPropsFromWindow,
  type ToggleButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import {
  solidSingleButtonFamilyChildren,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ToggleButtonGroupDemoProps>(
    toggleButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedToggleKeysSetFromText(groupProps().selectedKeys, ["left"], groupProps().selectionMode),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedGroup = createMemo(() => {
    // Read only the control-panel props here so this memo re-runs — rebuilding
    // the group and its ToggleButton children — ONLY on a control edit, never on
    // a selection change. Reading `selectedKeys()`/`selectedKeyText()` in this
    // creation scope would retrack the selection signal, so every toggle would
    // recompute the memo and unmount the pressed button, dropping keyboard focus
    // (the memo-rebuild anti-pattern D4 catches — see the ToggleButton unit).
    // Selection is threaded reactively instead: `selectedKeys` is passed as the
    // raw accessor (hc's `unwrapAccessorProps` turns it into a live getter, the
    // way compiled JSX binds `selectedKeys={selectedKeys()}`), and the serialized
    // control-props data attributes are getters that read the current selection
    // lazily — both update in place without rebuilding, matching React's
    // controlled reconcile.
    const props = groupProps();
    const serializeWithSelection = () =>
      serializeToggleButtonGroupDemoProps({ ...props, selectedKeys: selectedKeyText() });

    return hc(
      SolidSpectrumToggleButtonGroup,
      {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        get "data-comparison-group-props"() {
          return serializeWithSelection();
        },
        get "data-comparison-control-props"() {
          return serializeWithSelection();
        },
        selectionMode: props.selectionMode,
        disallowEmptySelection: props.disallowEmptySelection,
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
        selectedKeys: selectedKeys,
        onSelectionChange: (keys: Set<string | number>) =>
          setSelectedKeys(new Set(Array.from(keys, String))),
      },
      [
        hc(
          SolidSpectrumToggleButton,
          {
            id: "left",
            "aria-label": props.iconPlacement === "only" ? "Left" : undefined,
          },
          solidSingleButtonFamilyChildren("Left", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "center",
            "aria-label": props.iconPlacement === "only" ? "Center" : undefined,
          },
          solidSingleButtonFamilyChildren("Center", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "right",
            "aria-label": props.iconPlacement === "only" ? "Right" : undefined,
          },
          solidSingleButtonFamilyChildren("Right", props.iconPlacement, () => s2ToggleButtonText),
        ),
      ],
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
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

export default () => h(SolidSpectrumToggleButtonGroupDemo, {});
