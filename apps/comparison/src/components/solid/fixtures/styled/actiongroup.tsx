import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionGroup as SolidSpectrumActionGroup,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  actionGroupDemoItems,
  actionGroupDemoPropsFromWindow,
  actionGroupDemoLocaleFromWindow,
  actionGroupKeysFromValue,
  normalizeActionGroupDemoProps,
  serializeActionGroupDemoProps,
  type ActionGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actiongroup-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumActionGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionGroupDemoProps>(
    actionGroupDemoPropsFromWindow(),
  );
  const locale = actionGroupDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actiongroup") {
        setDemoProps(normalizeActionGroupDemoProps(event.detail.props ?? {}));
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

  const renderedActionGroup = createMemo(() =>
    hc(SolidSpectrumActionGroup, {
      "aria-label": "Text style",
      get selectionMode() {
        return demoProps().selectionMode;
      },
      get orientation() {
        return demoProps().orientation;
      },
      get defaultSelectedKeys() {
        return actionGroupKeysFromValue(demoProps().defaultSelectedKeys);
      },
      get disabledKeys() {
        return actionGroupKeysFromValue(demoProps().disabledKeys);
      },
      "data-comparison-control-root": "actiongroup",
      get "data-comparison-control-props"() {
        return serializeActionGroupDemoProps(demoProps());
      },
      items: actionGroupDemoItems,
    }),
  );

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
      hc(
        "div",
        {
          class: "comparison-gridlist-row",
        },
        [h("button", {}, "Before"), renderedActionGroup, h("button", {}, "After")],
      ),
    ],
  );
}

export default () => h(SolidSpectrumActionGroupDemo, {});
