import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  TextField as SolidSpectrumTextField,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
  type TextFieldDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/textfield-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumTextFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<TextFieldDemoProps>(
    textFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
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
    serializeTextFieldDemoProps({
      ...demoProps(),
      value: value(),
    }),
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
          // The control-root marker sits on the wrapper (matching React and the
          // other field fixtures) so the field grid is `${root} > div` on BOTH
          // stacks; putting it on the component would land it on the grid root
          // itself, shifting every child selector by one level vs React.
          "data-comparison-control-root": "textfield",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumTextField, {
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
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumTextFieldDemo, {});
