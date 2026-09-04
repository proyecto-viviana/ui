import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Button as SpectrumButton, Text as SpectrumText } from "@react-spectrum/s2";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
} from "@comparison/data/button-demo";
import { pressCallbackLoggers } from "@comparison/data/event-log";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  staticColorBackdropProps,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();
  const pressLog = pressCallbackLoggers("button");
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "button",
      "data-comparison-control-props": serializeButtonDemoProps(demoProps),
      "data-comparison-button-props": serializeButtonDemoProps(demoProps),
      children: jsx("div", {
        ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
        children: jsx(SpectrumButton, {
          variant: demoProps.variant,
          fillStyle: demoProps.fillStyle,
          size: demoProps.size,
          staticColor: demoProps.staticColor,
          isDisabled: demoProps.isDisabled,
          isPending: demoProps.isPending,
          "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
          ...pressLog,
          onPress: (event) => {
            pressLog.onPress(event);
            setActionCount((count) => count + 1);
          },
          children: renderButtonChildren(demoProps),
        }),
      }),
    }),
    colorScheme,
    locale,
  );
}

function renderButtonChildren(demoProps) {
  if (demoProps.iconPlacement === "start") {
    return [
      jsx(ReactButtonIcon, {}, "icon"),
      jsx(SpectrumText, { children: demoProps.children }, "text"),
    ];
  }

  if (demoProps.iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return demoProps.children;
}

function useButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(buttonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

export default () => jsx(ReactButtonDemo, {});
