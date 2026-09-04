import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { createComponent } from "solid-js/web";
import { hc } from "../../solid-h";
import {
  Checkbox as SolidSpectrumCheckbox,
  CheckboxGroup as SolidSpectrumCheckboxGroup,
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  checkboxGroupDemoPropsFromWindow,
  initialCheckboxGroupDemoValue,
  normalizeCheckboxGroupDemoProps,
  serializeCheckboxGroupDemoProps,
  type CheckboxGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/checkboxgroup-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

const checkboxGroupItems = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

function SolidSpectrumCheckboxGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<CheckboxGroupDemoProps>(
    checkboxGroupDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal<string[]>(initialCheckboxGroupDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialCheckboxGroupDemoValue(nextProps));
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

  const selectedValues = createMemo(() => value().join(","));
  const serializedProps = createMemo(() => serializeCheckboxGroupDemoProps(demoProps()));
  const renderKey = createMemo(() =>
    [
      demoProps().valueSource,
      demoProps().valueSource === "defaultValue" ? demoProps().defaultValue : "controlled",
      demoProps().name,
      demoProps().form,
      demoProps().validationBehavior,
    ].join("|"),
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
          get "data-comparison-selected-values"() {
            return selectedValues();
          },
          "data-comparison-control-root": "checkboxgroup",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          createComponent(Show, {
            get when() {
              return renderKey();
            },
            keyed: true,
            children: () =>
              hc(
                SolidSpectrumCheckboxGroup,
                {
                  get label() {
                    return demoProps().label;
                  },
                  get value() {
                    return demoProps().valueSource === "value" ? value() : undefined;
                  },
                  get defaultValue() {
                    return demoProps().valueSource === "defaultValue"
                      ? initialCheckboxGroupDemoValue(demoProps())
                      : undefined;
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
                    return demoProps().withContextualHelp
                      ? hc(SolidSpectrumContextualHelp, {}, [
                          hc(SolidSpectrumHeading, { slot: "title" }, ["Notification help"]),
                          hc(SolidSpectrumText, {}, [
                            "Choose every channel that should alert you.",
                          ]),
                        ])
                      : undefined;
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
                  onChange: (nextValue: string[]) => {
                    const nextSelectedValues = nextValue.map(String);
                    setValue(nextSelectedValues);
                    setDemoProps((current: CheckboxGroupDemoProps) =>
                      current.valueSource === "value"
                        ? { ...current, selectedValues: nextSelectedValues.join(",") }
                        : current,
                    );
                  },
                },
                checkboxGroupItems.map((item) =>
                  hc(SolidSpectrumCheckbox, { value: item.value }, [item.label]),
                ),
              ) as unknown as JSX.Element,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumCheckboxGroupDemo, {});
