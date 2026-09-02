import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Button as SpectrumButton,
  Content as SpectrumContent,
  AlertDialog as SpectrumAlertDialog,
  Dialog as SpectrumDialog,
  DialogTrigger as SpectrumDialogTrigger,
  Heading as SpectrumHeading,
  Text as SpectrumText,
} from "@react-spectrum/s2";
import { dispatchComparisonCallback } from "@comparison/data/event-log";
import {
  dialogDemoPropsFromWindow,
  normalizeDialogDemoProps,
  serializeDialogDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/dialog-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactDialogDemo() {
  const [demoProps, setDemoProps] = useState(dialogDemoPropsFromWindow);
  const [isOpen, setIsOpen] = useState(() => demoProps.isOpen);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dialog") {
        const nextProps = normalizeDialogDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsOpen(nextProps.isOpen);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeDialogDemoProps({
    ...demoProps,
    isOpen,
  });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "dialog",
      "data-comparison-control-props": serializedProps,
      "data-comparison-open": String(isOpen),
      children: jsxs(SpectrumDialogTrigger, {
        isOpen,
        onOpenChange: (nextOpen) => {
          dispatchComparisonCallback("dialog", "onOpenChange", {
            target: document.activeElement,
            value: nextOpen,
          });
          setIsOpen(nextOpen);
          setDemoProps((current) => ({ ...current, isOpen: nextOpen }));
        },
        children: [
          jsx(SpectrumButton, { variant: "primary", children: demoProps.triggerLabel }),
          demoProps.role === "alertdialog"
            ? jsx(SpectrumAlertDialog, {
                title: demoProps.title,
                variant: demoProps.variant,
                // AlertDialog is S | M | L only; fold XL onto L.
                size: demoProps.size === "XL" ? "L" : demoProps.size,
                primaryActionLabel: demoProps.primaryActionLabel,
                secondaryActionLabel: demoProps.secondaryActionLabel || undefined,
                cancelLabel: demoProps.cancelLabel || undefined,
                children: demoProps.body,
              })
            : jsxs(SpectrumDialog, {
                isDismissible: demoProps.isDismissible,
                isKeyboardDismissDisabled: demoProps.isKeyboardDismissDisabled,
                role: demoProps.role,
                size: demoProps.size,
                children: [
                  demoProps.hasTitle
                    ? jsx(SpectrumHeading, { slot: "title", children: demoProps.title })
                    : null,
                  jsx(SpectrumContent, {
                    children: jsx(SpectrumText, {
                      children: demoProps.body,
                    }),
                  }),
                ],
              }),
        ],
      }),
    }),
    colorScheme,
  );
}

export default () => jsx(ReactDialogDemo, {});
