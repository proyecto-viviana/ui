import h from "@solidjs/h";
import { createEffect, createMemo, createSignal, onSettled, createTrackedEffect } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { ActionBar as SolidSpectrumActionBar } from "@proyecto-viviana/solid-spectrum/ActionBar";
import { ActionButton as SolidSpectrumActionButton } from "@proyecto-viviana/solid-spectrum/ActionButton";
import { ActionButtonGroup as SolidSpectrumActionButtonGroup } from "@proyecto-viviana/solid-spectrum/ActionButtonGroup";
import { ActionMenu as SolidSpectrumActionMenu } from "@proyecto-viviana/solid-spectrum/ActionMenu";
import { Content as SolidSpectrumContent } from "@proyecto-viviana/solid-spectrum/Content";
import { Heading as SolidSpectrumHeading } from "@proyecto-viviana/solid-spectrum/Heading";
import { IllustratedMessage as SolidSpectrumIllustratedMessage } from "@proyecto-viviana/solid-spectrum/IllustratedMessage";
import { MenuItem as SolidSpectrumMenuItem } from "@proyecto-viviana/solid-spectrum/Menu";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { Text as SolidSpectrumText } from "@proyecto-viviana/solid-spectrum/Text";
import {
  TreeView as SolidSpectrumTreeView,
  TreeViewItem as SolidSpectrumTreeViewItem,
  TreeViewItemContent as SolidSpectrumTreeViewItemContent,
  TreeViewLoadMoreItem as SolidSpectrumTreeViewLoadMoreItem,
} from "@proyecto-viviana/solid-spectrum/TreeView";
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
  const itemCount = createMemo(() => demoProps().itemCount);
  const selectionMode = createMemo(() => demoProps().selectionMode);
  const selectionStyle = createMemo(() => demoProps().selectionStyle);
  const selectionSource = createMemo(() => demoProps().selectionSource);
  const expandedSource = createMemo(() => demoProps().expandedSource);
  const defaultSelectedKeyValue = createMemo(() => demoProps().defaultSelectedKeys);
  const defaultExpandedKeyValue = createMemo(() => demoProps().defaultExpandedKeys);
  const disabledKeyValue = createMemo(() => demoProps().disabledKeys);
  const disabledItem = createMemo(() => demoProps().disabledItem);
  const showIcons = createMemo(() => demoProps().showIcons);
  const showActionBar = createMemo(() => demoProps().showActionBar);
  const itemActionSlot = createMemo(() => demoProps().itemActionSlot);
  const linkItem = createMemo(() => demoProps().linkItem);
  const showLoadMore = createMemo(() => demoProps().showLoadMore);
  const loadingState = createMemo(() => demoProps().loadingState);
  const items = createMemo(() => treeViewDemoItems({ itemCount: itemCount() }));
  const itemKeys = createMemo(() => treeViewVisibleKeys({ itemCount: itemCount() }));
  const disabledKeys = createMemo(() =>
    treeViewKeysFromValue(disabledKeyValue(), [], "multiple", itemKeys()),
  );
  const defaultSelectedKeys = createMemo(() =>
    treeViewKeysFromValue(
      defaultSelectedKeyValue(),
      itemKeys().includes("weekly-report") ? ["weekly-report"] : [],
      selectionMode(),
      itemKeys(),
    ),
  );
  const defaultExpandedKeys = createMemo(() =>
    treeViewExpandedKeysFromValue(
      defaultExpandedKeyValue(),
      ["documents", "project"].filter((key) => itemKeys().includes(key)),
      itemKeys(),
    ),
  );
  const selectedKeyText = createMemo(() => serializeTreeViewKeys(selectedKeys()));
  const expandedKeyText = createMemo(() => serializeTreeViewKeys(expandedKeys()));
  let treeViewRoot: HTMLElement | undefined;

  createTrackedEffect(() => {
    treeViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeTreeViewDemoProps(demoProps()),
    );
  });

  onSettled(() => {
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
    return () => window.removeEventListener(treeViewControlsEvent, handleControlsChange);
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
                return selectionMode();
              },
              get selectionStyle() {
                return selectionStyle();
              },
              get disabledKeys() {
                return disabledKeys();
              },
              get selectedKeys() {
                return selectionSource() === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return selectionSource() === "defaultSelectedKeys"
                  ? defaultSelectedKeys()
                  : undefined;
              },
              get expandedKeys() {
                return expandedSource() === "expandedKeys" ? expandedKeys() : undefined;
              },
              get defaultExpandedKeys() {
                return expandedSource() === "defaultExpandedKeys"
                  ? defaultExpandedKeys()
                  : undefined;
              },
              renderEmptyState: () =>
                hc(SolidSpectrumIllustratedMessage, {}, [
                  hc(SolidSpectrumHeading, {}, ["No files"]),
                  hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                ]),
              get renderActionBar() {
                return showActionBar()
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
            renderProp((item: TreeViewDemoItem) => {
              const isDisabled = createMemo(() => disabledItem() === item.id);
              const isLinked = createMemo(() => linkItem() === item.id);

              return [
                hc(
                  SolidSpectrumTreeViewItem,
                  {
                    id: item.id,
                    textValue: item.title,
                    get isDisabled() {
                      return isDisabled();
                    },
                    get href() {
                      return isLinked() ? `https://example.com/treeview/${item.id}` : undefined;
                    },
                    get target() {
                      return isLinked() ? "_blank" : undefined;
                    },
                  },
                  [
                    hc(SolidSpectrumTreeViewItemContent, {}, [
                      () => (showIcons() ? h(SolidNewIcon, { "aria-hidden": "true" }) : null),
                      hc(SolidSpectrumText, {}, [item.title]),
                      () => {
                        const actionSlot = itemActionSlot();
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
                          return hc(
                            SolidSpectrumActionMenu,
                            { "aria-label": `${item.title} menu` },
                            [
                              hc(
                                SolidSpectrumMenuItem,
                                {
                                  id: `${item.id}-copy`,
                                  textValue: "Copy",
                                },
                                [hc(SolidSpectrumText, {}, ["Copy"])],
                              ),
                            ],
                          );
                        }

                        return null;
                      },
                    ]),
                  ],
                ),
                () =>
                  showLoadMore() && item.id === "image-1"
                    ? hc(SolidSpectrumTreeViewLoadMoreItem, {
                        onLoadMore: () => setLoadMoreCount((count) => count + 1),
                        level: 2,
                        get loadingState() {
                          return loadingState();
                        },
                      })
                    : null,
              ];
            }),
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
