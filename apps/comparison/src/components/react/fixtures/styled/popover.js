import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Button as SpectrumButton,
  DialogTrigger as SpectrumDialogTrigger,
  Form as SpectrumForm,
  Popover as SpectrumPopover,
  Switch as SpectrumSwitch,
  TextField as SpectrumTextField,
} from "@react-spectrum/s2";
import {
  isPopoverOpenControlChecked,
  normalizePopoverDemoProps,
  popoverDemoPropsFromWindow,
  serializePopoverDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/popover-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactPopoverDemo() {
  const [demoProps, setDemoProps] = useState(popoverDemoPropsFromWindow);
  const anchorRef = useRef(null);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "popover") {
        setDemoProps(normalizePopoverDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const updateOpen = (nextOpen) => {
    setDemoProps((current) =>
      current.isOpen && !nextOpen && isPopoverOpenControlChecked()
        ? current
        : normalizePopoverDemoProps({ ...current, isOpen: nextOpen }),
    );
  };
  const popoverProps = {
    placement: demoProps.placement,
    offset: demoProps.offset,
    crossOffset: demoProps.crossOffset,
    containerPadding: demoProps.containerPadding,
    shouldFlip: demoProps.shouldFlip,
    hideArrow: demoProps.hideArrow,
    maxHeight: demoProps.maxHeight === "" ? undefined : demoProps.maxHeight,
    size: demoProps.size === "fit" ? undefined : demoProps.size,
    "aria-label": demoProps.ariaLabel,
  };
  const popoverContent = jsxs("div", {
    style: popoverContentStyle,
    children: [
      jsx("p", {
        style: popoverBodyTextStyle,
        children: demoProps.bodyText,
      }),
      demoProps.showForm
        ? jsxs(SpectrumForm, {
            children: [
              jsx(SpectrumTextField, {
                label: "Subject",
                placeholder: "Enter a summary",
              }),
              jsx(SpectrumTextField, {
                label: "Description",
                isRequired: true,
                placeholder: "Enter your feedback",
              }),
              jsx(SpectrumSwitch, {
                children: "Adobe can contact me for further questions concerning this feedback",
              }),
              jsx(SpectrumButton, {
                variant: "accent",
                children: "Submit",
              }),
            ],
          })
        : null,
    ],
  });
  const triggerContent =
    demoProps.triggerMode === "dialogTrigger"
      ? jsx(SpectrumDialogTrigger, {
          isOpen: demoProps.isOpen,
          onOpenChange: updateOpen,
          children: [
            jsx(SpectrumButton, {
              variant: "secondary",
              children: demoProps.triggerLabel,
            }),
            jsx(SpectrumPopover, {
              ...popoverProps,
              children: popoverContent,
            }),
          ],
        })
      : jsxs(Fragment, {
          children: [
            jsx(SpectrumButton, {
              variant: "secondary",
              onPress: () => updateOpen(!demoProps.isOpen),
              children: demoProps.isOpen
                ? `Close ${demoProps.triggerLabel}`
                : `Open ${demoProps.triggerLabel}`,
            }),
            jsx("div", {
              ref: anchorRef,
              style: popoverAnchorStyle,
              children: "Popover anchor",
            }),
            jsx(SpectrumPopover, {
              ...popoverProps,
              triggerRef: anchorRef,
              isOpen: demoProps.isOpen,
              onOpenChange: updateOpen,
              children: popoverContent,
            }),
          ],
        });

  return renderReactSpectrumReference(
    jsx("div", {
      style: popoverFixtureStyle,
      "data-comparison-control-root": "popover",
      "data-comparison-control-props": serializePopoverDemoProps(demoProps),
      "data-comparison-open": String(demoProps.isOpen),
      "data-comparison-popover-trigger-mode": demoProps.triggerMode,
      children: triggerContent,
    }),
    colorScheme,
  );
}

const popoverFixtureStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  minHeight: 360,
  width: 420,
  padding: 12,
};

const popoverAnchorStyle = {
  padding: 8,
  borderRadius: 8,
  background: "color-mix(in srgb, CanvasText 8%, Canvas)",
  font: "13px system-ui, sans-serif",
};

const popoverContentStyle = {
  width: 300,
  padding: 12,
};

const popoverBodyTextStyle = {
  margin: "0 0 12px",
  font: "14px system-ui, sans-serif",
};

export default () => jsx(ReactPopoverDemo, {});
