import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  SearchField as SolidSpectrumSearchField,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
  type SearchFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/searchfield-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumSearchFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<SearchFieldDemoProps>(
    searchFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [clearCount, setClearCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
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
    serializeSearchFieldDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, {}, ["Search syntax"]),
          hc(SolidSpectrumContent, {}, [
            hc("p", {}, ["Use project names, owners, or status keywords."]),
          ]),
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
          get "data-comparison-value"() {
            return value();
          },
          get "data-comparison-clear-count"() {
            return String(clearCount());
          },
        },
        [
          hc(SolidSpectrumSearchField, {
            "data-comparison-control-root": "searchfield",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
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
            get name() {
              return demoProps().name;
            },
            get form() {
              return demoProps().form;
            },
            get validationBehavior() {
              return demoProps().validationBehavior;
            },
            get type() {
              return demoProps().type;
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
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onClear: () => {
              setValue("");
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: "",
              }));
              setClearCount((count) => count + 1);
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumSearchFieldDemo, {});
