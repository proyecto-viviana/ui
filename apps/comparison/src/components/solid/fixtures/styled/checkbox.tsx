import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { createComponent } from "solid-js/web";
import { hc } from "../../solid-h";
import {
  Checkbox as SolidSpectrumCheckbox,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  checkboxDemoPropsFromWindow,
  initialCheckboxDemoSelected,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
  type CheckboxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/checkbox-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumCheckboxDemo() {
  const [demoProps, setDemoProps] = createSignal(checkboxDemoPropsFromWindow());
  const [isSelected, setIsSelected] = createSignal(initialCheckboxDemoSelected(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(initialCheckboxDemoSelected(nextProps));
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

  const serializedProps = createMemo(() => serializeCheckboxDemoProps(demoProps()));
  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().selectionSource === "defaultSelected"
        ? demoProps().defaultSelected
        : "controlled",
      demoProps().name,
      demoProps().value,
      demoProps().form,
      demoProps().validationBehavior,
      demoProps().isRequired,
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
          get "data-comparison-checked"() {
            return String(isSelected());
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
                SolidSpectrumCheckbox,
                {
                  "data-comparison-control-root": "checkbox",
                  get "data-comparison-control-props"() {
                    return serializedProps();
                  },
                  get size() {
                    return demoProps().size;
                  },
                  get isSelected() {
                    return demoProps().selectionSource === "isSelected" ? isSelected() : undefined;
                  },
                  get defaultSelected() {
                    return demoProps().selectionSource === "defaultSelected"
                      ? demoProps().defaultSelected
                      : undefined;
                  },
                  get isIndeterminate() {
                    return demoProps().isIndeterminate;
                  },
                  get isEmphasized() {
                    return demoProps().isEmphasized;
                  },
                  get name() {
                    return demoProps().name || undefined;
                  },
                  get value() {
                    return demoProps().value || undefined;
                  },
                  get form() {
                    return demoProps().form || undefined;
                  },
                  get validationBehavior() {
                    return demoProps().validationBehavior || undefined;
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
                  onChange: (nextSelected: boolean) => {
                    setIsSelected(nextSelected);
                    setDemoProps((current: CheckboxDemoProps) =>
                      current.selectionSource === "isSelected"
                        ? { ...current, isSelected: nextSelected }
                        : current,
                    );
                  },
                },
                [() => demoProps().children],
              ) as unknown as JSX.Element,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumCheckboxDemo, {});
