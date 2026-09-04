import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  ToggleButton as SolidSpectrumToggleButton,
} from "@proyecto-viviana/solid-spectrum";
import { s2ToggleButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import { buttonDemoLocaleFromWindow, comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeToggleButtonDemoProps,
  serializeToggleButtonDemoProps,
  toggleButtonDemoPropsFromWindow,
  type ToggleButtonDemoProps,
} from "@comparison/data/button-family-demo";
import {
  solidSingleButtonFamilyChildren,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumToggleButtonDemo() {
  const [demoProps, setDemoProps] = createSignal<ToggleButtonDemoProps>(
    toggleButtonDemoPropsFromWindow(),
  );
  const [selected, setSelected] = createSignal(demoProps().isSelected);
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedToggleButton = createMemo(() => {
    const props = demoProps();
    // Pass `isSelected` as the reactive `selected` accessor (hc unwraps a
    // zero-arg function prop into a reactive getter) rather than reading
    // `selected()` here. Reading it inside this memo would retrack it, so every
    // toggle would recompute the memo and rebuild the whole element — unmounting
    // the live <button> and dropping keyboard focus to <body>. Deferring the
    // read keeps the same instance and updates `isSelected` in place, matching
    // compiled JSX `isSelected={selected()}` and React's controlled reconcile.
    return hc(
      SolidSpectrumToggleButton,
      {
        "data-comparison-control-root": "togglebutton",
        get "data-comparison-control-props"() {
          return serializeToggleButtonDemoProps({ ...props, isSelected: selected() });
        },
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
        isSelected: selected,
        onChange: setSelected,
      },
      solidSingleButtonFamilyChildren(
        props.children,
        props.iconPlacement,
        () => s2ToggleButtonText,
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", locale, background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor);
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-selected"() {
            return String(selected());
          },
        },
        [renderedToggleButton],
      ),
    ],
  );
}

export default () => h(SolidSpectrumToggleButtonDemo, {});
