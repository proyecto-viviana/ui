import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  TimeField as SolidSpectrumTimeField,
} from "@proyecto-viviana/solid-spectrum";
import {
  timeFieldMaxValue,
  timeFieldMinValue,
  timeFieldDemoPropsFromWindow,
  timeFieldValueFromDemo,
  normalizeTimeFieldDemoProps,
  serializeTimeFieldDemoProps,
  serializeTimeFieldValue,
  type TimeFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/timefield-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumTimeFieldDemo() {
  const initialDemoProps = timeFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<TimeFieldDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(timeFieldValueFromDemo(initialDemoProps));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "timefield") {
        const nextProps = normalizeTimeFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(() => timeFieldValueFromDemo(nextProps));
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

  const serializedProps = createMemo(() => serializeTimeFieldDemoProps(demoProps()));
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Time help"]),
          hc(SolidSpectrumContent, {}, ["Choose a start time in your schedule."]),
        ])
      : undefined,
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      get locale() {
        return demoProps().locale || undefined;
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "timefield",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-value"() {
            return serializeTimeFieldValue(value());
          },
        },
        [
          hc(SolidSpectrumTimeField, {
            class: "comparison-timefield-root",
            get label() {
              return demoProps().label;
            },
            get size() {
              return demoProps().size;
            },
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get necessityIndicator() {
              return demoProps().necessityIndicator;
            },
            get contextualHelp() {
              return contextualHelp();
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get shouldForceLeadingZeros() {
              return demoProps().shouldForceLeadingZeros;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get minValue() {
              return demoProps().constrainRange ? timeFieldMinValue() : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? timeFieldMaxValue() : undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onChange: setValue,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumTimeFieldDemo, {});
