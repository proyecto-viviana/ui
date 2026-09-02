import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  Radio as SolidSpectrumRadio,
  RadioGroup as SolidSpectrumRadioGroup,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
  type RadioGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/radiogroup-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

const radioGroupItems = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

function SolidSpectrumRadioGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<RadioGroupDemoProps>(
    radioGroupDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().selectedValue);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "radiogroup") {
        const nextProps = normalizeRadioGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.selectedValue);
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

  const serializedProps = createMemo(() =>
    serializeRadioGroupDemoProps({
      ...demoProps(),
      selectedValue: value(),
    }),
  );
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Plan help"]),
          hc(SolidSpectrumContent, {}, ["Choose the plan that matches this workspace."]),
        ])
      : undefined,
  );

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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-value"() {
            return value();
          },
          "data-comparison-control-root": "radiogroup",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(
            SolidSpectrumRadioGroup,
            {
              get label() {
                return demoProps().label;
              },
              get value() {
                return value();
              },
              get size() {
                return demoProps().size;
              },
              get orientation() {
                return demoProps().orientation;
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
              get contextualHelp() {
                return contextualHelp();
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
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
              onChange: (nextValue: string) => {
                setValue(nextValue);
                setDemoProps((current: RadioGroupDemoProps) => ({
                  ...current,
                  selectedValue: nextValue,
                }));
              },
            },
            radioGroupItems.map((item) =>
              hc(SolidSpectrumRadio, { value: item.value }, [item.label]),
            ),
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumRadioGroupDemo, {});
