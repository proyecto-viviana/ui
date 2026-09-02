import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Switch as SpectrumSwitch } from "@react-spectrum/s2";
import {
  normalizeSwitchDemoProps,
  serializeSwitchDemoProps,
  switchDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/switch-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactSwitchDemo() {
  const [demoProps, setDemoProps] = useState(switchDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => demoProps.isSelected);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "switch") {
        const nextProps = normalizeSwitchDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected": String(isSelected),
      "data-comparison-control-root": "switch",
      "data-comparison-control-props": serializeSwitchDemoProps({
        ...demoProps,
        isSelected,
      }),
      children: jsx(SpectrumSwitch, {
        size: demoProps.size,
        isSelected,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        onChange: (nextSelected) => {
          setIsSelected(nextSelected);
          setDemoProps((current) => ({ ...current, isSelected: nextSelected }));
        },
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactSwitchDemo, {});
