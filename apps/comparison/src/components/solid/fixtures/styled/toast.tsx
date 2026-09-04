import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Provider as SolidSpectrumProvider,
  ToastContainer as SolidSpectrumToastContainer,
  ToastQueue as SolidSpectrumToastQueue,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeToastDemoProps,
  serializeToastDemoProps,
  toastDemoPropsFromWindow,
  type ToastDemoVariant,
  type ToastDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/toast-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function solidToastQueueOptions(
  demoProps: ToastDemoProps,
  onAction: () => void,
  onClose: () => void,
) {
  return {
    actionLabel: demoProps.showAction ? demoProps.actionLabel : undefined,
    onAction: demoProps.showAction ? onAction : undefined,
    onClose,
    shouldCloseOnAction: demoProps.shouldCloseOnAction,
    timeout: demoProps.autoDismiss ? demoProps.timeout : undefined,
  };
}

const solidToastTriggerConfigs = [
  {
    variant: "neutral",
    label: "Show Neutral Toast",
    buttonVariant: "secondary",
    message: (demoProps: ToastDemoProps) => demoProps.children,
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
] as const satisfies ReadonlyArray<{
  variant: ToastDemoVariant;
  label: string;
  buttonVariant: "secondary" | "primary" | "negative" | "accent";
  message: (demoProps: ToastDemoProps) => string;
}>;

function SolidSpectrumToastDemo() {
  const [demoProps, setDemoProps] = createSignal<ToastDemoProps>(toastDemoPropsFromWindow());
  const [actionCount, setActionCount] = createSignal(0);
  const [closeCount, setCloseCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let closeToasts: Array<() => void> = [];
  let suppressCloseCount = false;
  const closeExistingToasts = () => {
    suppressCloseCount = true;
    closeToasts.forEach((close) => close());
    closeToasts = [];
    suppressCloseCount = false;
  };
  const handleToastClose = () => {
    if (!suppressCloseCount) {
      setCloseCount((count) => count + 1);
    }
  };
  const triggerToast = (variant: ToastDemoVariant) => {
    const currentProps = demoProps();
    const config = solidToastTriggerConfigs.find((item) => item.variant === variant);
    if (!config || currentProps.activeSide !== "solid") {
      return;
    }

    let trackedClose = () => {};
    const closeToast = SolidSpectrumToastQueue[variant](
      config.message(currentProps),
      solidToastQueueOptions(
        currentProps,
        () => setActionCount((count) => count + 1),
        () => {
          closeToasts = closeToasts.filter((close) => close !== trackedClose);
          handleToastClose();
        },
      ),
    );
    trackedClose = () => closeToast();
    closeToasts = [...closeToasts, trackedClose];
  };
  const solidToastTriggers = () =>
    hc(
      SolidSpectrumButtonGroup,
      {},
      solidToastTriggerConfigs.map((config) =>
        hc(
          SolidSpectrumButton,
          {
            variant: config.buttonVariant,
            onPress: () => triggerToast(config.variant),
          },
          [config.label],
        ),
      ),
    );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toast") {
        closeExistingToasts();
        setActionCount(0);
        setCloseCount(0);
        setDemoProps(normalizeToastDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(toastDemoPropsFromWindow());
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
      closeExistingToasts();
    });
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
          class: "comparison-toast-stage",
          style: { "max-width": "100%", "min-height": "160px", width: "420px" },
          "data-comparison-control-root": "toast",
          get "data-comparison-control-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-active-side"() {
            return demoProps().activeSide;
          },
          get "data-comparison-toast-is-active"() {
            return String(demoProps().activeSide === "solid");
          },
          get "data-comparison-toast-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-toast-close-count"() {
            return String(closeCount());
          },
        },
        [
          // ToastContainer owns global queue subscriptions; only the trigger surface is inactive.
          hc(SolidSpectrumToastContainer, {
            get placement() {
              return demoProps().placement;
            },
            get "aria-label"() {
              return demoProps()["aria-label"];
            },
            PRIVATE_forceReducedMotion: true,
          }),
          hc(
            "div",
            {
              get hidden() {
                return demoProps().activeSide !== "solid" ? true : undefined;
              },
            },
            [solidToastTriggers()],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumToastDemo, {});
