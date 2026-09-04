import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  ActionBar as SolidSpectrumActionBar,
  ActionButton as SolidSpectrumActionButton,
  ActionButtonGroup as SolidSpectrumActionButtonGroup,
  ActionMenu as SolidSpectrumActionMenu,
  Content as SolidSpectrumContent,
  Heading as SolidSpectrumHeading,
  IllustratedMessage as SolidSpectrumIllustratedMessage,
  MenuItem as SolidSpectrumMenuItem,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
  TreeView as SolidSpectrumTreeView,
  TreeViewItem as SolidSpectrumTreeViewItem,
  TreeViewItemContent as SolidSpectrumTreeViewItemContent,
  TreeViewLoadMoreItem as SolidSpectrumTreeViewLoadMoreItem,
} from "@proyecto-viviana/solid-spectrum";
import {
  comparisonControlsEvent as treeViewControlsEvent,
  initialTreeViewExpandedKeys,
  initialTreeViewSelectedKeys,
  normalizeTreeViewDemoProps,
  serializeTreeViewDemoProps,
  serializeTreeViewKeys,
  treeViewDemoItems,
  treeViewDemoPropsFromWindow,
  treeViewExpandedKeysFromValue,
  treeViewKeysFromValue,
  treeViewVisibleKeys,
  type TreeViewDemoItem,
  type TreeViewDemoProps,
} from "@comparison/data/treeview-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  collectionFixtureStyle,
  SolidNewIcon,
} from "../styled-shared.tsx";

function SolidSpectrumTreeViewDemo() {
  const [demoProps, setDemoProps] = createSignal<TreeViewDemoProps>(treeViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialTreeViewSelectedKeys(demoProps()),
  );
  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(
    initialTreeViewExpandedKeys(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const [loadMoreCount, setLoadMoreCount] = createSignal(0);
  const colorScheme = createComparisonResolvedThemeSignal();
  const items = createMemo(() => treeViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => treeViewVisibleKeys(demoProps()));
  const selectedKeyText = createMemo(() => serializeTreeViewKeys(selectedKeys()));
  const expandedKeyText = createMemo(() => serializeTreeViewKeys(expandedKeys()));
  let treeViewRoot: HTMLElement | undefined;

  createEffect(() => {
    treeViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeTreeViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "treeview") {
        setDemoProps((current) => {
          const nextProps = normalizeTreeViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialTreeViewSelectedKeys(nextProps));
          setExpandedKeys(initialTreeViewExpandedKeys(nextProps));
          setActionKey("");
          setLoadMoreCount(0);
          return nextProps;
        });
      }
    };
    window.addEventListener(treeViewControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(treeViewControlsEvent, handleControlsChange));
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
          style: collectionFixtureStyle,
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
          get "data-comparison-expanded-keys"() {
            return expandedKeyText();
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-load-more-count"() {
            return String(loadMoreCount());
          },
        },
        [
          hc("button", {}, ["Before"]),
          hc(
            SolidSpectrumTreeView,
            {
              "aria-label": "Files",
              "data-comparison-control-root": "treeview",
              ref: (element: HTMLElement) => {
                treeViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeTreeViewDemoProps(demoProps());
              },
              get items() {
                return items();
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get disabledKeys() {
                return treeViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? treeViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("weekly-report") ? ["weekly-report"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              get expandedKeys() {
                return demoProps().expandedSource === "expandedKeys" ? expandedKeys() : undefined;
              },
              get defaultExpandedKeys() {
                return demoProps().expandedSource === "defaultExpandedKeys"
                  ? treeViewExpandedKeysFromValue(
                      demoProps().defaultExpandedKeys,
                      ["documents", "project"].filter((key) => itemKeys().includes(key)),
                      itemKeys(),
                    )
                  : undefined;
              },
              renderEmptyState: () =>
                hc(SolidSpectrumIllustratedMessage, {}, [
                  hc(SolidSpectrumHeading, {}, ["No files"]),
                  hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                ]),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? itemKeys().length : keys.size,
                          "data-comparison-treeview-actionbar": "true",
                          onClearSelection: () => setSelectedKeys(new Set<string>()),
                        },
                        [
                          hc(SolidSpectrumActionButton, {}, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      )
                  : undefined;
              },
              onAction: (key: string | number) => setActionKey(String(key)),
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all" ? new Set(itemKeys()) : new Set<string>(Array.from(keys, String)),
                ),
              onExpandedChange: (keys: Set<string | number>) =>
                setExpandedKeys(new Set<string>(Array.from(keys, String))),
              UNSAFE_style: collectionTreeStyle,
            },
            renderProp((item: TreeViewDemoItem) => [
              hc(
                SolidSpectrumTreeViewItem,
                {
                  id: item.id,
                  textValue: item.title,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                  get href() {
                    return demoProps().linkItem === item.id
                      ? `https://example.com/treeview/${item.id}`
                      : undefined;
                  },
                  get target() {
                    return demoProps().linkItem === item.id ? "_blank" : undefined;
                  },
                },
                [
                  hc(SolidSpectrumTreeViewItemContent, {}, [
                    () =>
                      demoProps().showIcons ? h(SolidNewIcon, { "aria-hidden": "true" }) : null,
                    hc(SolidSpectrumText, {}, [item.title]),
                    () => {
                      const actionSlot = demoProps().itemActionSlot;
                      if (actionSlot === "buttonGroup") {
                        return hc(
                          SolidSpectrumActionButtonGroup,
                          { "aria-label": `${item.title} actions` },
                          [
                            hc(
                              SolidSpectrumActionButton,
                              { "aria-label": `Archive ${item.title}` },
                              [h(SolidNewIcon, { "aria-hidden": "true" })],
                            ),
                          ],
                        );
                      }

                      if (actionSlot === "actionMenu") {
                        return hc(SolidSpectrumActionMenu, { "aria-label": `${item.title} menu` }, [
                          hc(
                            SolidSpectrumMenuItem,
                            {
                              id: `${item.id}-copy`,
                              textValue: "Copy",
                            },
                            [hc(SolidSpectrumText, {}, ["Copy"])],
                          ),
                        ]);
                      }

                      return null;
                    },
                  ]),
                ],
              ),
              () =>
                demoProps().showLoadMore && item.id === "image-1"
                  ? hc(SolidSpectrumTreeViewLoadMoreItem, {
                      onLoadMore: () => setLoadMoreCount((count) => count + 1),
                      level: 2,
                      get loadingState() {
                        return demoProps().loadingState;
                      },
                    })
                  : null,
            ]),
          ),
          hc("button", {}, ["After"]),
        ],
      ),
    ],
  );
}

const collectionTreeStyle = {
  width: "100%",
  "max-height": "280px",
};

export default () => h(SolidSpectrumTreeViewDemo, {});
