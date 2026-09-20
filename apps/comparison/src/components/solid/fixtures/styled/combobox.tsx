import h from "@solidjs/h";
import { Show, createMemo, createSignal, onSettled } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ComboBox as SolidSpectrumComboBox,
  ComboBoxItem as SolidSpectrumComboBoxItem,
} from "@proyecto-viviana/solid-spectrum/ComboBox";
import { ContextualHelp as SolidSpectrumContextualHelp } from "@proyecto-viviana/solid-spectrum/ContextualHelp";
import { Heading as SolidSpectrumHeading } from "@proyecto-viviana/solid-spectrum/Heading";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import {
  comboBoxDemoLocaleFromWindow,
  comboBoxDemoPropsFromWindow,
  comboBoxItemsForPreset,
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

type ComboBoxFixtureItem = {
  id: string;
  label: string;
  href?: string;
  textValue?: string;
};

function sentinelButton(kind: "before" | "after") {
  return h(
    "button",
    {
      type: "button",
      "data-comparison-sentinel": kind,
    },
    [kind],
  );
}

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
  const itemsPreset = createMemo(() => demoProps().itemsPreset);
  const itemsSource = createMemo(() => demoProps().itemsSource);
  const disableEnterprise = createMemo(() => demoProps().disableEnterprise);
  const listItems = createMemo(
    () => comboBoxItemsForPreset(itemsPreset()) as ComboBoxFixtureItem[],
  );
  const disabledKeys = createMemo(() =>
    itemsPreset() === "many" ? ["item-25"] : disableEnterprise() ? ["enterprise"] : undefined,
  );
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Plan help"]),
          h("p", {}, ["Pick the plan that matches expected usage."]),
        ])
      : undefined,
  );
  const [events, setEvents] = createSignal<{ name: string; args: unknown[] }[]>([]);
  const pushEvent = (name: string, args: unknown[]) => {
    if (!demoProps().eventLog) {
      return;
    }
    setEvents((prev) => [...prev, { name, args }]);
  };

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        if (event.detail.stack && event.detail.stack !== "solid") {
          return;
        }
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
        setEvents([]);
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
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    };
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
      demoProps().form
        ? h("form", {
            hidden: true,
            get id() {
              return demoProps().form;
            },
          })
        : null,
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
          get "data-comparison-events"() {
            return demoProps().eventLog ? JSON.stringify(events()) : undefined;
          },
        },
        [
          hc(
            Show,
            {
              get when() {
                return demoProps().sentinels;
              },
            },
            [sentinelButton("before")],
          ),
          hc(
            SolidSpectrumComboBox,
            {
              get items() {
                return itemsSource() === "defaultItems" ? undefined : listItems();
              },
              get defaultItems() {
                return itemsSource() === "defaultItems" ? listItems() : undefined;
              },
              getKey: (item: ComboBoxFixtureItem) => item.id,
              getTextValue: (item: ComboBoxFixtureItem) => item.textValue ?? item.label,
              get label() {
                return demoProps().label;
              },
              get selectedKey() {
                if (demoProps().selectionSource !== "selectedKey") {
                  return undefined;
                }
                return selectedKey() === "none" ? null : selectedKey();
              },
              get defaultSelectedKey() {
                if (demoProps().selectionSource !== "defaultSelectedKey") {
                  return undefined;
                }
                return demoProps().selectedKey === "none" ? null : demoProps().selectedKey;
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
              get loadingState() {
                return demoProps().loadingState !== "idle" ? demoProps().loadingState : undefined;
              },
              get autoFocus() {
                return demoProps().autoFocus ? true : undefined;
              },
              get shouldFocusWrap() {
                return demoProps().shouldFocusWrap ? true : undefined;
              },
              get shouldCloseOnBlur() {
                return demoProps().shouldCloseOnBlur === false ? false : undefined;
              },
              get prefix() {
                return demoProps().prefix || undefined;
              },
              onOpenChange: (...args: unknown[]) => pushEvent("onOpenChange", args),
              onFocus: () => pushEvent("onFocus", []),
              onBlur: () => pushEvent("onBlur", []),
              onFocusChange: (isFocused: boolean) => pushEvent("onFocusChange", [isFocused]),
              onAction: (key: unknown) => pushEvent("onAction", [key]),
              onSelectionChange: (nextKey: unknown) => {
                pushEvent("onSelectionChange", [nextKey]);
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
                pushEvent("onInputChange", [nextValue]);
                setInputValue(nextValue);
                setDemoProps((current: ComboBoxDemoProps) =>
                  current.inputSource === "inputValue"
                    ? { ...current, inputValue: nextValue }
                    : current,
                );
              },
            },
            renderProp((item: ComboBoxFixtureItem) =>
              hc(
                SolidSpectrumComboBoxItem,
                {
                  id: item.id,
                  get isDisabled() {
                    return (
                      (itemsPreset() === "many" && item.id === "item-25") ||
                      (item.id === "enterprise" && disableEnterprise())
                    );
                  },
                  get href() {
                    return item.href;
                  },
                  get textValue() {
                    return item.textValue;
                  },
                },
                [item.label],
              ),
            ),
          ),
          hc(
            Show,
            {
              get when() {
                return demoProps().sentinels;
              },
            },
            [sentinelButton("after")],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumComboBoxDemo, {});
