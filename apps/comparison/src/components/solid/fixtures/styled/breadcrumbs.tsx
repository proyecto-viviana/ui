import h from "@solidjs/h";
import { createComponent } from "@solidjs/web";
import { createMemo, createSignal, onSettled } from "solid-js";
import { hc, Keyed, renderProp } from "../../solid-h";
import {
  Breadcrumb as SolidSpectrumBreadcrumb,
  Breadcrumbs as SolidSpectrumBreadcrumbs,
} from "@proyecto-viviana/solid-spectrum/Breadcrumbs";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import {
  breadcrumbsDemoPropsFromWindow,
  breadcrumbsItemsForSet,
  normalizeBreadcrumbsDemoProps,
  serializeBreadcrumbPath,
  serializeBreadcrumbsDemoProps,
  type BreadcrumbsDemoProps,
  type BreadcrumbsItem,
  comparisonControlsEvent,
} from "@comparison/data/breadcrumbs-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumBreadcrumbsDemo() {
  const [demoProps, setDemoProps] = createSignal<BreadcrumbsDemoProps>(
    breadcrumbsDemoPropsFromWindow(),
  );
  const [pathItems, setPathItems] = createSignal<BreadcrumbsItem[]>(
    breadcrumbsItemsForSet(breadcrumbsDemoPropsFromWindow().itemSet),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const breadcrumbsStructure = createMemo(
    () => `${demoProps().itemSet}:${serializeBreadcrumbPath(pathItems())}`,
  );

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "breadcrumbs") {
        const nextProps = normalizeBreadcrumbsDemoProps(event.detail.props ?? {});
        const itemSetChanged = demoProps().itemSet !== nextProps.itemSet;
        setDemoProps(nextProps);
        if (itemSetChanged) {
          setPathItems(breadcrumbsItemsForSet(nextProps.itemSet));
          setActionCount(0);
          setLastAction("");
        }
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

  const handleAction = (key: string | number) => {
    const nextKey = String(key);
    const sourceItems = breadcrumbsItemsForSet(demoProps().itemSet);
    const index = sourceItems.findIndex((item) => item.id === nextKey);
    setActionCount((count) => count + 1);
    setLastAction(nextKey);
    if (index >= 0) {
      setPathItems(sourceItems.slice(0, index + 1));
    }
  };
  const directChildBreadcrumbs = () =>
    hc(
      SolidSpectrumBreadcrumbs,
      {
        get size() {
          return demoProps().size;
        },
        get isDisabled() {
          return demoProps().isDisabled;
        },
        UNSAFE_style: { width: "100%" },
        "aria-label": "Project location",
        onAction: handleAction,
      },
      [
        () =>
          pathItems().map((item) =>
            h(
              SolidSpectrumBreadcrumb,
              {
                id: item.id,
                href: item.href,
              },
              item.label,
            ),
          ),
      ],
    );
  const itemBreadcrumbs = () =>
    hc(
      SolidSpectrumBreadcrumbs,
      {
        get items() {
          return pathItems();
        },
        getKey: (item: BreadcrumbsItem) => item.id,
        get size() {
          return demoProps().size;
        },
        get isDisabled() {
          return demoProps().isDisabled;
        },
        UNSAFE_style: { width: "100%" },
        "aria-label": "Project location",
        onAction: handleAction,
      },
      renderProp((item: BreadcrumbsItem) =>
        h(
          SolidSpectrumBreadcrumb,
          {
            id: item.id,
            href: item.href,
          },
          item.label,
        ),
      ),
    );
  // A thunk, so Keyed runs under the Provider's owner (see popover.tsx): the
  // collapsed menu portals and reads its theme from context.
  const renderedBreadcrumbs = () =>
    createComponent(Keyed, {
      get when() {
        return breadcrumbsStructure();
      },
      children: (structure) =>
        structure.startsWith("standard:") ? directChildBreadcrumbs()() : itemBreadcrumbs()(),
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
          class: "comparison-breadcrumbs-row",
          "data-comparison-control-root": "breadcrumbs",
          get "data-comparison-control-props"() {
            return serializeBreadcrumbsDemoProps(demoProps());
          },
          get "data-comparison-breadcrumbs-props"() {
            return serializeBreadcrumbsDemoProps(demoProps());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-last-action"() {
            return lastAction();
          },
          get "data-comparison-path"() {
            return serializeBreadcrumbPath(pathItems());
          },
        },
        [renderedBreadcrumbs],
      ),
    ],
  );
}

export default () => h(SolidSpectrumBreadcrumbsDemo, {});
