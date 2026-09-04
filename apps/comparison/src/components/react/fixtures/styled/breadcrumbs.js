import { jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Breadcrumb as SpectrumBreadcrumb,
  Breadcrumbs as SpectrumBreadcrumbs,
} from "@react-spectrum/s2";
import {
  breadcrumbsDemoPropsFromWindow,
  breadcrumbsItemsForSet,
  normalizeBreadcrumbsDemoProps,
  serializeBreadcrumbPath,
  serializeBreadcrumbsDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/breadcrumbs-demo";
import { useComparisonResolvedTheme, renderReactSpectrumReference } from "../styled-shared.js";

function ReactBreadcrumbsDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(breadcrumbsDemoPropsFromWindow);
  const [pathItems, setPathItems] = useState(() =>
    breadcrumbsItemsForSet(breadcrumbsDemoPropsFromWindow().itemSet),
  );
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "breadcrumbs") {
        const nextProps = normalizeBreadcrumbsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setPathItems(breadcrumbsItemsForSet(nextProps.itemSet));
        setActionCount(0);
        setLastAction("");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleAction = (key) => {
    const nextKey = String(key);
    const sourceItems = breadcrumbsItemsForSet(demoProps.itemSet);
    const index = sourceItems.findIndex((item) => item.id === nextKey);
    setActionCount((count) => count + 1);
    setLastAction(nextKey);
    if (index >= 0) {
      setPathItems(sourceItems.slice(0, index + 1));
    }
  };

  const breadcrumbs =
    demoProps.itemSet === "standard"
      ? jsx(SpectrumBreadcrumbs, {
          size: demoProps.size,
          isDisabled: demoProps.isDisabled,
          UNSAFE_style: { width: "100%" },
          "aria-label": "Project location",
          onAction: handleAction,
          children: pathItems.map((item) =>
            jsx(
              SpectrumBreadcrumb,
              {
                id: item.id,
                href: item.href,
                children: item.label,
              },
              item.id,
            ),
          ),
        })
      : jsx(SpectrumBreadcrumbs, {
          items: pathItems,
          size: demoProps.size,
          isDisabled: demoProps.isDisabled,
          UNSAFE_style: { width: "100%" },
          "aria-label": "Project location",
          onAction: handleAction,
          children: (item) =>
            jsx(SpectrumBreadcrumb, {
              id: item.id,
              href: item.href,
              children: item.label,
            }),
        });

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-breadcrumbs-row",
      "data-comparison-control-root": "breadcrumbs",
      "data-comparison-control-props": serializeBreadcrumbsDemoProps(demoProps),
      "data-comparison-breadcrumbs-props": serializeBreadcrumbsDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-path": serializeBreadcrumbPath(pathItems),
      children: breadcrumbs,
    }),
    colorScheme,
  );
}

export default () => jsx(ReactBreadcrumbsDemo, {});
