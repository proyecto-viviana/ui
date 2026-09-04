import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
  type ButtonDemoProps,
} from "@comparison/data/button-demo";
import { pressCallbackLoggers } from "@comparison/data/event-log";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import {
  SolidNewIcon,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumButtonDemo() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(buttonDemoPropsFromWindow());
  const pressLog = pressCallbackLoggers("button");
  const locale = buttonDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props as ButtonDemoProps);
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

  const renderedButton = createMemo(() => {
    const props = demoProps();
    const children =
      props.iconPlacement === "start"
        ? [
            () => h(SolidNewIcon, { "aria-hidden": "true" }),
            () =>
              h(
                "span",
                {
                  class: s2ButtonText({ isProgressVisible: props.isPending }),
                  "data-rsp-slot": "text",
                },
                props.children,
              ),
          ]
        : props.iconPlacement === "only"
          ? [() => h(SolidNewIcon, { "aria-hidden": "true" })]
          : [
              () =>
                h(
                  "span",
                  {
                    class: s2ButtonText({ isProgressVisible: props.isPending }),
                    "data-rsp-slot": "text",
                  },
                  props.children,
                ),
            ];

    return hc(
      SolidSpectrumButton,
      {
        isDisabled: props.isDisabled,
        isPending: props.isPending,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        staticColor: props.staticColor,
        ...(props.iconPlacement === "only" ? { "aria-label": props.children } : {}),
        ...pressLog,
        onPress: (event: unknown) => {
          pressLog.onPress(event as { target?: unknown; pointerType?: string });
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        },
      },
      children,
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          "data-comparison-control-root": "button",
          get "data-comparison-control-props"() {
            return serializeButtonDemoProps(demoProps());
          },
          get "data-comparison-button-props"() {
            return serializeButtonDemoProps(demoProps());
          },
        },
        [
          hc(
            "div",
            {
              get class() {
                return staticColorBackdropClass(demoProps().staticColor, "comparison-button-row");
              },
              get "data-comparison-static-color"() {
                return staticColorBackdropValue(demoProps().staticColor);
              },
            },
            [renderedButton],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumButtonDemo, {});
