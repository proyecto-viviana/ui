import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Toolbar as SolidSpectrumToolbar,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  toolbarDemoItems,
  toolbarNestedGroups,
  toolbarDemoPropsFromWindow,
  toolbarDemoLocaleFromWindow,
  normalizeToolbarDemoProps,
  serializeToolbarDemoProps,
  type ToolbarDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/toolbar-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

// Solid Toolbar: solid-spectrum's Toolbar is a bare passthrough over the base
// solidaria-components Toolbar (mirroring S2's `<RACToolbar {...props} />`), so
// this fixture drives the base `createToolbar` port directly. "flat" places a
// native Size text input among the buttons (the D5 text-input-guard probe);
// "nested" wraps controls in child toolbars that downgrade to role=group.
function SolidSpectrumToolbarDemo() {
  const [demoProps, setDemoProps] = createSignal<ToolbarDemoProps>(toolbarDemoPropsFromWindow());
  const locale = toolbarDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toolbar") {
        setDemoProps(normalizeToolbarDemoProps(event.detail.props ?? {}));
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

  const toolbarChildren = (content: ToolbarDemoProps["content"]) => {
    if (content === "nested") {
      return toolbarNestedGroups.map((grp) =>
        hc(
          SolidSpectrumToolbar,
          { "aria-label": grp.id },
          grp.items.map((item) => h("button", {}, item.label)),
        ),
      );
    }
    return toolbarDemoItems.map((item) =>
      item.id === "size"
        ? h("input", { type: "text", "aria-label": item.label })
        : h("button", {}, item.label),
    );
  };

  const renderedToolbar = createMemo(() => {
    const props = demoProps();
    return hc(
      SolidSpectrumToolbar,
      {
        "aria-label": "Text formatting",
        orientation: props.orientation,
        "data-comparison-control-root": "toolbar",
        "data-comparison-control-props": serializeToolbarDemoProps(props),
      },
      toolbarChildren(props.content),
    );
  });

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
      hc("div", { class: "comparison-gridlist-row" }, [
        h("button", {}, "Before"),
        renderedToolbar,
        h("button", {}, "After"),
      ]),
    ],
  );
}

export default () => h(SolidSpectrumToolbarDemo, {});
