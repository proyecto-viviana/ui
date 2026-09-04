import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount, Show, type JSX } from "solid-js";
import { createComponent } from "solid-js/web";
import { hc, renderProp } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  Tab as SolidSpectrumTab,
  TabList as SolidSpectrumTabList,
  TabPanel as SolidSpectrumTabPanel,
  Tabs as SolidSpectrumTabs,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import { comparisonTabItems as tabItems } from "@comparison/data/comparison-contract";
import { dispatchComparisonCallback } from "@comparison/data/event-log";
import {
  initialTabsDemoSelectedKey,
  normalizeTabsDemoProps,
  serializeTabsDemoProps,
  tabsDemoDisabledKeys,
  tabsDemoPropsFromWindow,
  type TabsDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/tabs-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

type TabItem = (typeof tabItems)[number];

function solidTabChildren(item: TabItem, props: TabsDemoProps) {
  if (props.withIcons || props.labelBehavior === "hide") {
    return [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, item.label)];
  }

  return [item.label];
}

function solidTabList(props: TabsDemoProps) {
  if (props.composition === "static") {
    return hc(
      SolidSpectrumTabList,
      {},
      tabItems.map((item) =>
        hc(
          SolidSpectrumTab,
          {
            id: item.id,
            get isDisabled() {
              return props.disabledKey === item.id;
            },
          },
          solidTabChildren(item, props),
        ),
      ),
    );
  }

  return hc(
    SolidSpectrumTabList,
    {
      get items() {
        return tabItems as unknown as TabItem[];
      },
    },
    renderProp((item: TabItem) =>
      hc(
        SolidSpectrumTab,
        {
          id: item.id,
          get isDisabled() {
            return props.disabledKey === item.id;
          },
        },
        solidTabChildren(item, props),
      ),
    ),
  );
}

function solidTabPanels(props: TabsDemoProps) {
  return tabItems.map((item) =>
    hc(
      SolidSpectrumTabPanel,
      {
        id: item.id,
        get shouldForceMount() {
          return props.shouldForceMount;
        },
      },
      [item.content],
    ),
  );
}

function SolidSpectrumTabsDemo() {
  const [demoProps, setDemoProps] = createSignal<TabsDemoProps>(tabsDemoPropsFromWindow());
  const [selectedKey, setSelectedKey] = createSignal<string>(
    initialTabsDemoSelectedKey(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tabs") {
        const nextProps = normalizeTabsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(initialTabsDemoSelectedKey(nextProps));
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
    serializeTabsDemoProps({
      ...demoProps(),
      selectedKey: selectedKey() as TabsDemoProps["selectedKey"],
    }),
  );
  // Mirrors the React fixture's renderKey: remount only on structural control
  // changes. The live `selectedKey()` signal must NOT be in the key — keying on
  // it remounted the whole Tabs subtree on every user selection, destroying the
  // focused tab node (focus fell to body, data-focus-visible lost) while the
  // React panel updated in place via the controlled prop.
  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().defaultSelectedKey,
      demoProps().composition,
      demoProps().disabledKey,
      demoProps().labelBehavior,
      String(demoProps().withIcons),
      String(demoProps().shouldForceMount),
    ].join(":"),
  );
  const tabsProps = createMemo(() => {
    const props = demoProps();
    const next: Record<string, unknown> = {
      "aria-label": props.ariaLabel,
      orientation: props.orientation,
      density: props.density,
      labelBehavior: props.labelBehavior,
      keyboardActivation: props.keyboardActivation,
      disabledKeys: tabsDemoDisabledKeys(props),
      isDisabled: props.isDisabled,
      onSelectionChange: (key: string) => {
        dispatchComparisonCallback("tabs", "onSelectionChange", {
          target: document.activeElement,
          value: key,
        });
        setSelectedKey(String(key));
      },
    };

    if (props.selectionSource === "defaultSelectedKey") {
      next.defaultSelectedKey = props.defaultSelectedKey;
    } else {
      Object.defineProperty(next, "selectedKey", {
        enumerable: true,
        get: () => selectedKey(),
      });
    }

    return next;
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
          class: "comparison-tabs-row",
          "data-comparison-control-root": "tabs",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
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
            children: ((_key: unknown) => {
              return hc(SolidSpectrumTabs, tabsProps(), [
                () => {
                  const props = demoProps();
                  return [solidTabList(props), ...solidTabPanels(props)];
                },
              ]) as unknown as JSX.Element;
            }) as (key: unknown) => JSX.Element,
          }),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumTabsDemo, {});
