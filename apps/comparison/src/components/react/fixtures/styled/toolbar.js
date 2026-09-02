import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import { Toolbar as AriaToolbar } from "react-aria-components";
import {
  toolbarDemoItems,
  toolbarNestedGroups,
  toolbarDemoPropsFromWindow,
  toolbarDemoLocaleFromWindow,
  normalizeToolbarDemoProps,
  serializeToolbarDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/toolbar-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

// Toolbar oracle: the real react-aria-components `Toolbar` (S2 1.5.1's Toolbar is
// a bare `<RACToolbar {...props} />` passthrough), a thin wrapper over
// react-aria 3.50 `useToolbar`. "flat" content places Bold / Italic / a native
// Size text input / Underline directly in the toolbar; the input is the D5
// probe — upstream `useToolbar` has NO text-input guard, so an arrow key with
// the input focused moves focus to the next/prev control. "nested" wraps the
// controls in child toolbars (role=group) that still carry `aria-orientation`.
function renderToolbarChildren(content) {
  if (content === "nested") {
    return toolbarNestedGroups.map((grp) =>
      jsx(
        AriaToolbar,
        {
          "aria-label": grp.id,
          children: grp.items.map((item) => jsx("button", { children: item.label }, item.id)),
        },
        grp.id,
      ),
    );
  }
  return toolbarDemoItems.map((item) =>
    item.id === "size"
      ? jsx("input", { type: "text", "aria-label": item.label, defaultValue: "" }, item.id)
      : jsx("button", { children: item.label }, item.id),
  );
}

function ReactToolbarDemo() {
  const [demoProps, setDemoProps] = useState(toolbarDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  // Real RAC component: its `useToolbar` reads the shared `@react-aria/i18n`
  // context the S2 `Provider` populates, so the D10 locale reaches it through
  // `renderReactSpectrumReference` — no separate I18nProvider wrap (unlike the
  // private-subpath ActionGroup hooks).
  const locale = toolbarDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toolbar") {
        setDemoProps(normalizeToolbarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        jsx("button", { children: "Before" }),
        jsx(AriaToolbar, {
          "aria-label": "Text formatting",
          orientation: demoProps.orientation,
          "data-comparison-control-root": "toolbar",
          "data-comparison-control-props": serializeToolbarDemoProps(demoProps),
          children: renderToolbarChildren(demoProps.content),
        }),
        jsx("button", { children: "After" }),
      ],
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactToolbarDemo, {});
