import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  SelectBox as SolidSpectrumSelectBox,
  SelectBoxGroup as SolidSpectrumSelectBoxGroup,
} from "@proyecto-viviana/solid-spectrum";
import {
  initialSelectBoxGroupSelectedKeys,
  normalizeSelectBoxGroupDemoProps,
  selectBoxGroupDemoPropsFromWindow,
  selectBoxGroupIllustrationItemIds,
  selectBoxGroupItems,
  selectBoxGroupKeysFromValue,
  serializeSelectBoxGroupDemoProps,
  serializeSelectBoxGroupKeys,
  type SelectBoxGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/selectboxgroup-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidPlanIllustration } from "../styled-shared.tsx";

function SolidSpectrumSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<SelectBoxGroupDemoProps>(
    selectBoxGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialSelectBoxGroupSelectedKeys(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => serializeSelectBoxGroupKeys(selectedKeys()));
  let selectBoxGroupRoot: HTMLElement | undefined;

  createEffect(() => {
    selectBoxGroupRoot?.setAttribute(
      "data-comparison-control-props",
      serializeSelectBoxGroupDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialSelectBoxGroupSelectedKeys(nextProps));
          return nextProps;
        });
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
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumSelectBoxGroup,
            {
              "aria-label": "Plans",
              "data-comparison-control-root": "selectboxgroup",
              ref: (element: HTMLElement) => {
                selectBoxGroupRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeSelectBoxGroupDemoProps(demoProps());
              },
              get orientation() {
                return demoProps().orientation;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get items() {
                return selectBoxGroupItems;
              },
              getKey: (item: (typeof selectBoxGroupItems)[number]) => item.id,
              getTextValue: (item: (typeof selectBoxGroupItems)[number]) => item.label,
              get disabledKeys() {
                return selectBoxGroupKeysFromValue(demoProps().disabledKeys, [], "multiple");
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? selectBoxGroupKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["starter"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(selectBoxGroupItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof selectBoxGroupItems)[number]) =>
              hc(
                SolidSpectrumSelectBox,
                {
                  id: item.id,
                  textValue: item.label,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                },
                [
                  ...(demoProps().withIllustrations &&
                  selectBoxGroupIllustrationItemIds.has(item.id)
                    ? [
                        hc(SolidPlanIllustration, {
                          slot: "illustration",
                          size: "S",
                          "data-rsp-slot": "illustration",
                        }),
                      ]
                    : []),
                  hc("span", { slot: "label", "data-rsp-slot": "label" }, [item.label]),
                  hc("span", { slot: "description", "data-rsp-slot": "description" }, [
                    item.description,
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumSelectBoxGroupDemo, {});
