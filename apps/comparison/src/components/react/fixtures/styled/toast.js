import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Button as SpectrumButton,
  ButtonGroup as SpectrumButtonGroup,
  ToastContainer as SpectrumToastContainer,
  ToastQueue as SpectrumToastQueue,
} from "@react-spectrum/s2";
import {
  normalizeToastDemoProps,
  serializeToastDemoProps,
  toastDemoPropsFromWindow,
  comparisonControlsEvent,
} from "@comparison/data/toast-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function toastQueueOptions(demoProps, onAction, onClose) {
  return {
    actionLabel: demoProps.showAction ? demoProps.actionLabel : undefined,
    onAction: demoProps.showAction ? onAction : undefined,
    onClose,
    shouldCloseOnAction: demoProps.shouldCloseOnAction,
    timeout: demoProps.autoDismiss ? demoProps.timeout : undefined,
  };
}

const toastTriggerConfigs = [
  {
    variant: "neutral",
    label: "Show Neutral Toast",
    buttonVariant: "secondary",
    message: (demoProps) => demoProps.children,
  },
  {
    variant: "positive",
    label: "Show Positive Toast",
    buttonVariant: "primary",
    message: () => "Toast is done!",
  },
  {
    variant: "negative",
    label: "Show Negative Toast",
    buttonVariant: "negative",
    message: () => "Toast is burned!",
  },
  {
    variant: "info",
    label: "Show Info Toast",
    buttonVariant: "accent",
    message: () => "Toasting…",
  },
];

function ReactToastDemo() {
  const [demoProps, setDemoProps] = useState(toastDemoPropsFromWindow);
  const [actionCount, setActionCount] = useState(0);
  const [closeCount, setCloseCount] = useState(0);
  const closeRefs = useRef([]);
  const suppressCloseCountRef = useRef(false);
  const colorScheme = useComparisonResolvedTheme();
  const handleToastClose = () => {
    if (!suppressCloseCountRef.current) {
      setCloseCount((count) => count + 1);
    }
  };
  const closeExistingToasts = () => {
    suppressCloseCountRef.current = true;
    closeRefs.current.forEach((close) => close());
    closeRefs.current = [];
    suppressCloseCountRef.current = false;
  };
  const triggerToast = (variant) => {
    const config = toastTriggerConfigs.find((item) => item.variant === variant);
    if (!config || demoProps.activeSide !== "react") {
      return;
    }

    let trackedClose = () => {};
    const closeToast = SpectrumToastQueue[variant](
      config.message(demoProps),
      toastQueueOptions(
        demoProps,
        () => setActionCount((count) => count + 1),
        () => {
          closeRefs.current = closeRefs.current.filter((close) => close !== trackedClose);
          handleToastClose();
        },
      ),
    );
    trackedClose = () => closeToast();
    closeRefs.current = [...closeRefs.current, trackedClose];
  };

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toast") {
        closeExistingToasts();
        setActionCount(0);
        setCloseCount(0);
        setDemoProps(normalizeToastDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(toastDemoPropsFromWindow());
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      closeExistingToasts();
    };
  }, []);

  const isActive = demoProps.activeSide === "react";

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-toast-stage",
      style: { maxWidth: "100%", minHeight: 160, width: 420 },
      "data-comparison-control-root": "toast",
      "data-comparison-control-props": serializeToastDemoProps(demoProps),
      "data-comparison-toast-props": serializeToastDemoProps(demoProps),
      "data-comparison-toast-active-side": demoProps.activeSide,
      "data-comparison-toast-is-active": String(isActive),
      "data-comparison-toast-action-count": String(actionCount),
      "data-comparison-toast-close-count": String(closeCount),
      children: isActive
        ? jsxs(Fragment, {
            children: [
              jsx(SpectrumToastContainer, {
                placement: demoProps.placement,
                "aria-label": demoProps["aria-label"],
                PRIVATE_forceReducedMotion: true,
              }),
              jsx(SpectrumButtonGroup, {
                children: toastTriggerConfigs.map((config) =>
                  jsx(
                    SpectrumButton,
                    {
                      variant: config.buttonVariant,
                      onPress: () => triggerToast(config.variant),
                      children: config.label,
                    },
                    config.variant,
                  ),
                ),
              }),
            ],
          })
        : null,
    }),
    colorScheme,
  );
}

export default () => jsx(ReactToastDemo, {});
