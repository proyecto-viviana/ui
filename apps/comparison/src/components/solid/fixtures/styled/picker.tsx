import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ContextualHelp as SolidSpectrumContextualHelp,
  Heading as SolidSpectrumHeading,
  Picker as SolidSpectrumPicker,
  PickerItem as SolidSpectrumPickerItem,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizePickerDemoProps,
  pickerDemoLocaleFromWindow,
  pickerDemoPropsFromWindow,
  pickerItems,
  pickerSelectedKeysForMode,
  serializePickerSelectedKeys,
  serializePickerDemoProps,
  type PickerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/picker-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumPickerDemo() {
  const [demoProps, setDemoProps] = createSignal<PickerDemoProps>(pickerDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal(
    pickerSelectedKeysForMode(demoProps().selectedKey, demoProps().selectionMode),
  );
  const [loadMoreCount, setLoadMoreCount] = createSignal(0);
  const locale = pickerDemoLocaleFromWindow();
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
  const selectedKey = createMemo(() => selectedKeys()[0] ?? demoProps().selectedKey);
  const selectedItem = createMemo(() => pickerItems.find((item) => item.id === selectedKey()));
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
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(pickerSelectedKeysForMode(nextProps.selectedKey, nextProps.selectionMode));
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

  const serializedProps = createMemo(() => serializePickerDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      h("form", {
        hidden: true,
        get id() {
          return demoProps().form || "picker-external-form";
        },
      }),
      hc(
        "div",
        {
          "data-comparison-control-root": "picker",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return serializePickerSelectedKeys(selectedKeys(), demoProps().selectionMode);
          },
          get "data-comparison-load-more-count"() {
            return String(loadMoreCount());
          },
        },
        [
          hc(
            SolidSpectrumPicker,
            {
              items: pickerItems,
              getKey: (item: (typeof pickerItems)[number]) => item.id,
              getTextValue: (item: (typeof pickerItems)[number]) => item.label,
              get label() {
                return demoProps().label;
              },
              get selectedKey() {
                if (
                  demoProps().selectionSource !== "value" ||
                  demoProps().selectionMode === "multiple"
                ) {
                  return undefined;
                }
                return selectedKey();
              },
              get defaultSelectedKey() {
                if (
                  demoProps().selectionSource !== "defaultValue" ||
                  demoProps().selectionMode === "multiple"
                ) {
                  return undefined;
                }
                return demoProps().selectedKey;
              },
              get selectedKeys() {
                if (
                  demoProps().selectionSource !== "value" ||
                  demoProps().selectionMode !== "multiple"
                ) {
                  return undefined;
                }
                return selectedKeys();
              },
              get defaultSelectedKeys() {
                if (
                  demoProps().selectionSource !== "defaultValue" ||
                  demoProps().selectionMode !== "multiple"
                ) {
                  return undefined;
                }
                return pickerSelectedKeysForMode(
                  demoProps().selectedKey,
                  demoProps().selectionMode,
                );
              },
              get selectionMode() {
                return demoProps().selectionMode;
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
              get validationBehavior() {
                return demoProps().validationBehavior;
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
              get loadingState() {
                return demoProps().loadingState === "idle" ? undefined : demoProps().loadingState;
              },
              get onLoadMore() {
                return demoProps().loadingState === "idle"
                  ? undefined
                  : () => setLoadMoreCount((count) => count + 1);
              },
              get renderValue() {
                return demoProps().withRenderValue
                  ? (items: Array<(typeof pickerItems)[number]>) =>
                      h("span", { "data-comparison-render-value": "true" }, [
                        items.length > 1
                          ? `${items.map((item) => item.label).join(" + ")} plans`
                          : `${items[0]?.label ?? selectedItem()?.label ?? "Selected"} plan`,
                      ])
                  : undefined;
              },
              get disabledKeys() {
                return disabledKeys();
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onSelectionChange: (nextValue: unknown) => {
                if (demoProps().selectionMode === "multiple") {
                  return;
                }
                const nextSelectedKeys = nextValue == null ? [] : [String(nextValue)];
                if (nextSelectedKeys.length === 0) {
                  return;
                }
                const nextSelectedKey = nextSelectedKeys[0] as PickerDemoProps["selectedKey"];
                setSelectedKeys(nextSelectedKeys as Array<PickerDemoProps["selectedKey"]>);
                setDemoProps((current: PickerDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "value"
                    ? { selectedKey: nextSelectedKey as PickerDemoProps["selectedKey"] }
                    : {}),
                }));
              },
              onSelectionChangeKeys: (nextKeys: unknown) => {
                if (demoProps().selectionMode !== "multiple") {
                  return;
                }
                const nextSelectedKeys =
                  nextKeys instanceof Set
                    ? Array.from(nextKeys).map(String)
                    : nextKeys === "all"
                      ? []
                      : [];
                if (nextSelectedKeys.length === 0) {
                  return;
                }
                const nextSelectedKey = nextSelectedKeys[0] as PickerDemoProps["selectedKey"];
                setSelectedKeys(nextSelectedKeys as Array<PickerDemoProps["selectedKey"]>);
                setDemoProps((current: PickerDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "value"
                    ? { selectedKey: nextSelectedKey as PickerDemoProps["selectedKey"] }
                    : {}),
                }));
              },
            },
            renderProp((item: (typeof pickerItems)[number]) =>
              hc(
                SolidSpectrumPickerItem,
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

export default () => h(SolidSpectrumPickerDemo, {});
