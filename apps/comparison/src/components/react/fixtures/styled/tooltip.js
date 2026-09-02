import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  ActionButton as SpectrumActionButton,
  Tooltip as SpectrumTooltip,
  TooltipTrigger as SpectrumTooltipTrigger,
} from "@react-spectrum/s2";
import {
  isTooltipOpenControlChecked,
  normalizeTooltipDemoProps,
  serializeTooltipDemoProps,
  tooltipDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/tooltip-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  ReactButtonIcon,
} from "../styled-shared.js";

function ReactTooltipDemo() {
  const [demoProps, setDemoProps] = useState(tooltipDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tooltip") {
        setDemoProps(normalizeTooltipDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(tooltipDemoPropsFromWindow());
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const isRenderedOpen =
    demoProps.isOpen === undefined ? undefined : demoProps.isDisabled ? false : demoProps.isOpen;
  const tooltipTriggerProps = {
    containerPadding: demoProps.containerPadding,
    crossOffset: demoProps.crossOffset,
    defaultOpen: demoProps.defaultOpen,
    delay: demoProps.delay,
    isDisabled: demoProps.isDisabled,
    onOpenChange: (nextOpen) => {
      setDemoProps((current) =>
        current.isOpen && !nextOpen && isTooltipOpenControlChecked()
          ? current
          : normalizeTooltipDemoProps({
              ...current,
              isOpen: nextOpen,
            }),
      );
    },
    placement: demoProps.placement,
    shouldCloseOnPress: demoProps.shouldCloseOnPress,
    shouldFlip: demoProps.shouldFlip,
    trigger: demoProps.trigger,
  };

  if (isRenderedOpen !== undefined) {
    tooltipTriggerProps.isOpen = isRenderedOpen;
  }

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      "data-comparison-control-root": "tooltip",
      "data-comparison-control-props": serializeTooltipDemoProps(demoProps),
      "data-comparison-tooltip-props": serializeTooltipDemoProps(demoProps),
      children: jsxs(
        SpectrumTooltipTrigger,
        {
          ...tooltipTriggerProps,
          children: [
            jsx(SpectrumActionButton, {
              "aria-label": demoProps.actionLabel,
              children: jsx(ReactButtonIcon, {}),
            }),
            jsx(SpectrumTooltip, { children: demoProps.children }),
          ],
        },
        isRenderedOpen === undefined ? "tooltip-uncontrolled" : "tooltip-controlled",
      ),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactTooltipDemo, {});
