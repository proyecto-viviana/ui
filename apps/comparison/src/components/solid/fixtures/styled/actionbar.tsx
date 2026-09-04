import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ActionBar as SolidSpectrumActionBar,
  ActionButton as SolidSpectrumActionButton,
  ListView as SolidSpectrumListView,
  ListViewItem as SolidSpectrumListViewItem,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  actionBarCollectionItems,
  actionBarDemoPropsFromWindow,
  actionBarSelectedKeysFromCount,
  normalizeActionBarDemoProps,
  serializeActionBarDemoProps,
  serializeActionBarSelectedKeys,
  type ActionBarDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actionbar-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { SolidNewIcon, providerShellStyle } from "../styled-shared.tsx";

const actionBarItems = [
  { id: "edit", label: "Edit" },
  { id: "copy", label: "Copy" },
  { id: "delete", label: "Delete" },
];

function SolidSpectrumActionBarDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionBarDemoProps>(
    actionBarDemoPropsFromWindow(),
  );
  const [collectionSelectedKeys, setCollectionSelectedKeys] = createSignal<Set<string>>(
    actionBarSelectedKeysFromCount(actionBarDemoPropsFromWindow().selectedItemCount),
  );
  const [isCleared, setIsCleared] = createSignal(false);
  const [clearCount, setClearCount] = createSignal(0);
  const [actionCount, setActionCount] = createSignal(0);
  const scrollRef: { current: HTMLElement | null } = { current: null };
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const directSelectedItemCount = () => (isCleared() ? 0 : demoProps().selectedItemCount);
  const collectionSelectedCount = () => collectionSelectedKeys().size;
  const selectedItemCount = () =>
    demoProps().useCollection ? collectionSelectedCount() : directSelectedItemCount();
  const actionBarChildren = () =>
    actionBarItems.map((item) =>
      hc(
        SolidSpectrumActionButton,
        {
          onPress: () => setActionCount((count) => count + 1),
        },
        [() => [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, item.label)]],
      ),
    );
  const actionBar = () =>
    hc(
      SolidSpectrumActionBar,
      {
        get selectedItemCount() {
          return selectedItemCount();
        },
        get isEmphasized() {
          return demoProps().isEmphasized;
        },
        get scrollRef() {
          return demoProps().useScrollRef ? scrollRef : undefined;
        },
        "data-comparison-actionbar-root": "true",
        onClearSelection: () => {
          setClearCount((count) => count + 1);
          setIsCleared(true);
        },
      },
      actionBarChildren(),
    );
  const collection = () =>
    hc(
      "div",
      {
        class: "comparison-actionbar-collection-shell",
        "data-comparison-actionbar-collection-shell": "true",
        ref: (element: HTMLElement) => {
          scrollRef.current = element;
        },
      },
      [
        hc(
          SolidSpectrumListView,
          {
            "aria-label": "Documents",
            selectionMode: "multiple",
            class: "comparison-actionbar-collection-list",
            items: actionBarCollectionItems,
            getKey: (item: (typeof actionBarCollectionItems)[number]) => item.id,
            getTextValue: (item: (typeof actionBarCollectionItems)[number]) => item.label,
            get selectedKeys() {
              return collectionSelectedKeys();
            },
            onSelectionChange: (keys: "all" | Set<string | number>) =>
              setCollectionSelectedKeys(
                keys === "all"
                  ? actionBarSelectedKeysFromCount("all")
                  : new Set<string>(Array.from(keys, String)),
              ),
          },
          renderProp((item: (typeof actionBarCollectionItems)[number]) =>
            hc(SolidSpectrumListViewItem, { id: item.id, description: item.description }, [
              item.label,
            ]),
          ),
        ),
        hc(
          SolidSpectrumActionBar,
          {
            get selectedItemCount() {
              return collectionSelectedCount();
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            "data-comparison-actionbar-root": "true",
            scrollRef,
            onClearSelection: () => setCollectionSelectedKeys(new Set<string>()),
          },
          actionBarChildren(),
        ),
      ],
    );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbar") {
        const nextProps = normalizeActionBarDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setCollectionSelectedKeys(actionBarSelectedKeysFromCount(nextProps.selectedItemCount));
        setIsCleared(false);
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
          class: "comparison-actionbar-row",
          "data-comparison-control-root": "actionbar",
          get "data-comparison-control-props"() {
            return serializeActionBarDemoProps(demoProps());
          },
          get "data-comparison-actionbar-props"() {
            return serializeActionBarDemoProps(demoProps());
          },
          get "data-comparison-selected-count"() {
            return String(selectedItemCount());
          },
          get "data-comparison-clear-count"() {
            return String(clearCount());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-actionbar-scroll-ref"() {
            return String(demoProps().useScrollRef);
          },
          get "data-comparison-actionbar-collection"() {
            return String(demoProps().useCollection);
          },
          get "data-comparison-selected-keys"() {
            return demoProps().useCollection
              ? serializeActionBarSelectedKeys(collectionSelectedKeys())
              : "";
          },
        },
        [
          () =>
            demoProps().useCollection
              ? collection()
              : demoProps().useScrollRef
                ? hc(
                    "div",
                    {
                      class: "comparison-actionbar-scroll-shell",
                      "data-comparison-actionbar-scroll-shell": "true",
                      ref: (element: HTMLElement) => {
                        scrollRef.current = element;
                      },
                    },
                    [
                      h(
                        "div",
                        { class: "comparison-actionbar-scroll-content" },
                        actionBarItems.map((item) => h("span", {}, item.label)),
                      ),
                      actionBar(),
                    ],
                  )
                : actionBar(),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumActionBarDemo, {});
