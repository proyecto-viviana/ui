import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ComboBox as SolidSpectrumComboBox,
  ComboBoxItem as SolidSpectrumComboBoxItem,
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  comboBoxDemoLocaleFromWindow,
  comboBoxDemoPropsFromWindow,
  comboBoxItems,
  comboBoxLabelForKey,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
  type ComboBoxDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/combobox-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumComboBoxDemo() {
  const locale = comboBoxDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = createSignal<ComboBoxDemoProps>(comboBoxDemoPropsFromWindow());
  const [selectedKey, setSelectedKey] = createSignal(demoProps().selectedKey);
  const [inputValue, setInputValue] = createSignal(demoProps().inputValue);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const menuWidth = createMemo(() => {
    const parsed = Number.parseInt(demoProps().menuWidth, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  });
  const disabledKeys = createMemo(() =>
    demoProps().disableEnterprise ? ["enterprise"] : undefined,
  );
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Plan help"]),
          h("p", {}, ["Pick the plan that matches expected usage."]),
        ])
      : undefined,
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
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

  const serializedProps = createMemo(() => serializeComboBoxDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      // Threaded so the D10 RTL driver's `?locale=ar-AE` gives the Provider
      // `direction: 'rtl'` and the portaled listbox popover inherits `dir="rtl"`.
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      h("form", {
        hidden: true,
        get id() {
          return demoProps().form || "combobox-external-form";
        },
      }),
      hc(
        "div",
        {
          "data-comparison-control-root": "combobox",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return selectedKey();
          },
          get "data-comparison-input-value"() {
            return inputValue();
          },
        },
        [
          hc(
            SolidSpectrumComboBox,
            {
              items: comboBoxItems,
              getKey: (item: (typeof comboBoxItems)[number]) => item.id,
              getTextValue: (item: (typeof comboBoxItems)[number]) => item.label,
              get label() {
                return demoProps().label;
              },
              get selectedKey() {
                return demoProps().selectionSource === "selectedKey" ? selectedKey() : undefined;
              },
              get defaultSelectedKey() {
                return demoProps().selectionSource === "defaultSelectedKey"
                  ? demoProps().selectedKey
                  : undefined;
              },
              get inputValue() {
                return demoProps().inputSource === "inputValue" ? inputValue() : undefined;
              },
              get defaultInputValue() {
                return demoProps().inputSource === "defaultInputValue"
                  ? demoProps().inputValue
                  : undefined;
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
              get description() {
                return demoProps().description;
              },
              get errorMessage() {
                return demoProps().errorMessage;
              },
              get name() {
                return demoProps().name || undefined;
              },
              get form() {
                return demoProps().form || undefined;
              },
              get formValue() {
                return demoProps().formValue;
              },
              get validationBehavior() {
                return demoProps().validationBehavior;
              },
              get menuTrigger() {
                return demoProps().menuTrigger;
              },
              get direction() {
                return demoProps().direction;
              },
              get align() {
                return demoProps().align;
              },
              get menuWidth() {
                return menuWidth();
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get disabledKeys() {
                return disabledKeys();
              },
              get allowsCustomValue() {
                return demoProps().allowsCustomValue;
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
              onSelectionChange: (nextKey: unknown) => {
                if (nextKey == null) {
                  return;
                }
                const nextSelectedKey = String(nextKey);
                const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
                setSelectedKey(nextSelectedKey as ComboBoxDemoProps["selectedKey"]);
                setInputValue(nextInputValue);
                setDemoProps((current: ComboBoxDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "selectedKey"
                    ? { selectedKey: nextSelectedKey as ComboBoxDemoProps["selectedKey"] }
                    : {}),
                  ...(current.inputSource === "inputValue" ? { inputValue: nextInputValue } : {}),
                }));
              },
              onInputChange: (nextValue: string) => {
                setInputValue(nextValue);
                setDemoProps((current: ComboBoxDemoProps) =>
                  current.inputSource === "inputValue"
                    ? { ...current, inputValue: nextValue }
                    : current,
                );
              },
            },
            renderProp((item: (typeof comboBoxItems)[number]) =>
              hc(
                SolidSpectrumComboBoxItem,
                {
                  id: item.id,
                  get isDisabled() {
                    return item.id === "enterprise" && demoProps().disableEnterprise;
                  },
                },
                [item.label],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumComboBoxDemo, {});
