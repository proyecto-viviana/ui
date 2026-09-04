import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  Provider as SolidSpectrumProvider,
  Tooltip as SolidSpectrumTooltip,
  TooltipTrigger as SolidSpectrumTooltipTrigger,
} from "@proyecto-viviana/solid-spectrum";
import {
  isTooltipOpenControlChecked,
  normalizeTooltipDemoProps,
  serializeTooltipDemoProps,
  tooltipDemoPropsFromWindow,
  type TooltipDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/tooltip-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

function SolidSpectrumTooltipDemo() {
  const [demoProps, setDemoProps] = createSignal<TooltipDemoProps>(tooltipDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tooltip") {
        setDemoProps(normalizeTooltipDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(tooltipDemoPropsFromWindow());
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const isRenderedOpen = createMemo(() => !demoProps().isDisabled && demoProps().isOpen);

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
          class: "comparison-button-row",
          "data-comparison-control-root": "tooltip",
          get "data-comparison-control-props"() {
            return serializeTooltipDemoProps(demoProps());
          },
          get "data-comparison-tooltip-props"() {
            return serializeTooltipDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumTooltipTrigger,
            {
              get containerPadding() {
                return demoProps().containerPadding;
              },
              get crossOffset() {
                return demoProps().crossOffset;
              },
              get defaultOpen() {
                return demoProps().defaultOpen;
              },
              get delay() {
                return demoProps().delay;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isOpen() {
                return isRenderedOpen();
              },
              onOpenChange: (nextOpen: boolean) => {
                setDemoProps((current: TooltipDemoProps) =>
                  current.isOpen && !nextOpen && isTooltipOpenControlChecked()
                    ? current
                    : normalizeTooltipDemoProps({
                        ...current,
                        isOpen: nextOpen,
                      }),
                );
              },
              get placement() {
                return demoProps().placement;
              },
              get shouldCloseOnPress() {
                return demoProps().shouldCloseOnPress;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get trigger() {
                return demoProps().trigger;
              },
            },
            [
              hc(
                SolidSpectrumActionButton,
                {
                  get "aria-label"() {
                    return demoProps().actionLabel;
                  },
                },
                [h(SolidNewIcon, { "aria-hidden": "true" })],
              ),
              hc(SolidSpectrumTooltip, {}, [() => demoProps().children]),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumTooltipDemo, {});
