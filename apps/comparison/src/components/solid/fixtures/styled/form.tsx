import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  Form as SolidSpectrumForm,
  Provider as SolidSpectrumProvider,
  TextField as SolidSpectrumTextField,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import {
  formDemoPropsFromWindow,
  normalizeFormDemoProps,
  serializeFormDemoProps,
  type FormDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/form-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumFormDemo() {
  const [demoProps, setDemoProps] = createSignal<FormDemoProps>(formDemoPropsFromWindow());
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "form") {
        const nextProps = normalizeFormDemoProps(event.detail.props ?? {});
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
    serializeFormDemoProps({
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
          class: "comparison-form-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [
          hc(
            SolidSpectrumForm,
            {
              "data-comparison-control-root": "form",
              get "data-comparison-control-props"() {
                return serializedProps();
              },
              get "data-comparison-value"() {
                return value();
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
              get validationBehavior() {
                return demoProps().validationBehavior;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              onSubmit: (event: SubmitEvent) => event.preventDefault(),
            },
            [
              hc(SolidSpectrumTextField, {
                "data-comparison-form-field": "name",
                get label() {
                  return demoProps().label;
                },
                name: "name",
                get value() {
                  return value();
                },
                description: "Inherited from the parent form.",
                onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
                  const nextValue = event.currentTarget.value;
                  setValue(nextValue);
                  setDemoProps((current: FormDemoProps) => ({
                    ...current,
                    value: nextValue,
                  }));
                },
                onChange: (nextValue: string) => {
                  setValue(nextValue);
                  setDemoProps((current: FormDemoProps) => ({
                    ...current,
                    value: nextValue,
                  }));
                },
              }),
              hc(
                SolidSpectrumButton,
                {
                  "data-comparison-form-submit": "true",
                  type: "submit",
                },
                [
                  () =>
                    h(
                      "span",
                      {
                        class: s2ButtonText({ isProgressVisible: false }),
                        "data-rsp-slot": "text",
                      },
                      demoProps().actionLabel,
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumFormDemo, {});
