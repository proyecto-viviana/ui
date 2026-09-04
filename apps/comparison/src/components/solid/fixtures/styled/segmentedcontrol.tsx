import h from "solid-js/h";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  type JSX,
} from "solid-js";
import { createComponent } from "solid-js/web";
import { hc } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  SegmentedControl as SolidSpectrumSegmentedControl,
  SegmentedControlItem as SolidSpectrumSegmentedControlItem,
} from "@proyecto-viviana/solid-spectrum";
import { s2ToggleButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import {
  initialSegmentedControlSelectedKey,
  normalizeSegmentedControlDemoProps,
  segmentedControlDemoPropsFromWindow,
  segmentedControlItems,
  serializeSegmentedControlDemoProps,
  type SegmentedControlDemoProps,
  type SegmentedControlKey,
  comparisonControlsEvent,
} from "@comparison/data/segmentedcontrol-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, solidSingleButtonFamilyChildren } from "../styled-shared.tsx";

function SolidSpectrumSegmentedControlDemo() {
  const [demoProps, setDemoProps] = createSignal<SegmentedControlDemoProps>(
    segmentedControlDemoPropsFromWindow(),
  );
  const [selectedKey, setSelectedKey] = createSignal<SegmentedControlKey>(
    initialSegmentedControlSelectedKey(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let segmentedControlRoot: HTMLElement | undefined;

  createEffect(() => {
    segmentedControlRoot?.setAttribute(
      "data-comparison-control-props",
      serializeSegmentedControlDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(initialSegmentedControlSelectedKey(nextProps));
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

  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().selectionSource === "defaultSelectedKey"
        ? demoProps().defaultSelectedKey
        : demoProps().selectedKey,
      demoProps().disabledKey,
      demoProps().iconPlacement,
      demoProps().isJustified,
      demoProps().isDisabled,
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
          get "data-comparison-selected-key"() {
            return selectedKey();
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
                SolidSpectrumSegmentedControl,
                {
                  "aria-label": "View mode",
                  "data-comparison-control-root": "segmentedcontrol",
                  ref: (element: HTMLElement) => {
                    segmentedControlRoot = element;
                  },
                  "data-comparison-control-props": serializeSegmentedControlDemoProps(demoProps()),
                  isJustified: demoProps().isJustified,
                  isDisabled: demoProps().isDisabled,
                  get selectedKey() {
                    return demoProps().selectionSource === "selectedKey" ? selectedKey() : null;
                  },
                  get defaultSelectedKey() {
                    return demoProps().selectionSource === "defaultSelectedKey"
                      ? demoProps().defaultSelectedKey
                      : undefined;
                  },
                  onSelectionChange: (key: string | number) =>
                    setSelectedKey(String(key) as SegmentedControlKey),
                },
                segmentedControlItems.map((item) =>
                  hc(
                    SolidSpectrumSegmentedControlItem,
                    {
                      id: item.id,
                      get isDisabled() {
                        return demoProps().disabledKey === item.id;
                      },
                      get "aria-label"() {
                        return demoProps().iconPlacement === "only" ? item.label : undefined;
                      },
                    },
                    solidSingleButtonFamilyChildren(
                      item.label,
                      () => demoProps().iconPlacement,
                      () => s2ToggleButtonText,
                    ),
                  ),
                ),
              ) as unknown as JSX.Element,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumSegmentedControlDemo, {});
