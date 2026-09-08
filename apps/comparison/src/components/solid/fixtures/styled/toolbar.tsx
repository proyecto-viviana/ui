import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import { Toolbar as SolidSpectrumToolbar } from "@proyecto-viviana/solid-spectrum/Toolbar";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
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
function SolidSpectrumToolbarFixture() {
  const [demoProps, setDemoProps] = createSignal<ToolbarDemoProps>(toolbarDemoPropsFromWindow());

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toolbar") {
        setDemoProps(normalizeToolbarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
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

  // Owned by this fixture (inside Provider), not the Demo. createToolbar reads
  // useLocale() at setup; a Demo-owned memo would fall back to LTR.
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

  return hc("div", { class: "comparison-gridlist-row" }, [
    h("button", {}, "Before"),
    renderedToolbar,
    h("button", {}, "After"),
  ]);
}

function SolidSpectrumToolbarDemo() {
  const locale = toolbarDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
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
    [hc(SolidSpectrumToolbarFixture)],
  );
}

export default () => h(SolidSpectrumToolbarDemo, {});
