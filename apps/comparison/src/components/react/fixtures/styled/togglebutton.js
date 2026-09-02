import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ToggleButton as SpectrumToggleButton } from "@react-spectrum/s2";
import { buttonDemoLocaleFromWindow, comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  normalizeToggleButtonDemoProps,
  serializeToggleButtonDemoProps,
  toggleButtonDemoPropsFromWindow,
} from "@comparison/data/button-family-demo";
import {
  renderReactSpectrumReference,
  staticColorBackdropProps,
  renderSingleButtonFamilyChildren,
} from "../styled-shared.js";

function ReactToggleButtonDemo() {
  const [demoProps, setDemoProps] = useState(toggleButtonDemoPropsFromWindow);
  const [selected, setSelected] = useState(demoProps.isSelected);
  const locale = buttonDemoLocaleFromWindow();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor),
      "data-comparison-selected": String(selected),
      children: jsx(SpectrumToggleButton, {
        "data-comparison-control-root": "togglebutton",
        "data-comparison-control-props": serializeToggleButtonDemoProps({
          ...demoProps,
          isSelected: selected,
        }),
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isSelected: selected,
        onChange: setSelected,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    undefined,
    locale,
  );
}

export default () => jsx(ReactToggleButtonDemo, {});
