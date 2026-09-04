import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount, Show } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import { ActionBar as SolidSpectrumActionBar } from "@proyecto-viviana/solid-spectrum/ActionBar";
import { ActionButton as SolidSpectrumActionButton } from "@proyecto-viviana/solid-spectrum/ActionButton";
import { ActionButtonGroup as SolidSpectrumActionButtonGroup } from "@proyecto-viviana/solid-spectrum/ActionButtonGroup";
import { ActionMenu as SolidSpectrumActionMenu } from "@proyecto-viviana/solid-spectrum/ActionMenu";
import { Content as SolidSpectrumContent } from "@proyecto-viviana/solid-spectrum/Content";
import { Heading as SolidSpectrumHeading } from "@proyecto-viviana/solid-spectrum/Heading";
import { IllustratedMessage as SolidSpectrumIllustratedMessage } from "@proyecto-viviana/solid-spectrum/IllustratedMessage";
import {
  ListView as SolidSpectrumListView,
  ListViewItem as SolidSpectrumListViewItem,
} from "@proyecto-viviana/solid-spectrum/ListView";
import { MenuItem as SolidSpectrumMenuItem } from "@proyecto-viviana/solid-spectrum/Menu";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import { Text as SolidSpectrumText } from "@proyecto-viviana/solid-spectrum/Text";
import {
  listViewDemoItems,
  initialListViewSelectedKeys,
  listViewDemoPropsFromWindow,
  listViewKeysFromValue,
  normalizeListViewDemoProps,
  serializeListViewDemoProps,
  serializeListViewKeys,
  type ListViewDemoItem,
  type ListViewDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/listview-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  collectionFixtureStyle,
  SolidNewIcon,
} from "../styled-shared.tsx";

function SolidSpectrumListViewDemo() {
  const [demoProps, setDemoProps] = createSignal<ListViewDemoProps>(listViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialListViewSelectedKeys(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const colorScheme = createComparisonResolvedThemeSignal();
  const items = createMemo(() => listViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => items().map((item) => item.id));
  const selectedKeyText = createMemo(() => serializeListViewKeys(selectedKeys()));
  let listViewRoot: HTMLElement | undefined;

  createEffect(() => {
    listViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeListViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listview") {
        setDemoProps((current) => {
          const nextProps = normalizeListViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialListViewSelectedKeys(nextProps));
          setActionKey("");
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
          get "data-comparison-action-key"() {
            return actionKey();
          },
        },
        [
          hc(
            SolidSpectrumListView,
            {
              "aria-label": "Documents",
              "data-comparison-control-root": "listview",
              ref: (element: HTMLElement) => {
                listViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeListViewDemoProps(demoProps());
              },
              get items() {
                return items();
              },
              getKey: (item: ListViewDemoItem) => item.id,
              getTextValue: (item: ListViewDemoItem) => item.name,
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get overflowMode() {
                return demoProps().overflowMode;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get hideLinkOutIcon() {
                return demoProps().hideLinkOutIcon;
              },
              get disabledKeys() {
                return listViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? listViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("project-brief") ? ["project-brief"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              renderEmptyState: () =>
                hc(SolidSpectrumIllustratedMessage, {}, [
                  hc(SolidSpectrumHeading, {}, ["No documents"]),
                  hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                ]),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? items().length : keys.size,
                          "data-comparison-listview-actionbar": "true",
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
                  keys === "all"
                    ? new Set(items().map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
              UNSAFE_style: collectionListStyle,
            },
            renderProp((item: ListViewDemoItem) =>
              hc(
                SolidSpectrumListViewItem,
                {
                  id: item.id,
                  textValue: item.name,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                  get href() {
                    return demoProps().trailingIcon === "linkOut" && item.id === "project-brief"
                      ? "https://example.com/project-brief"
                      : undefined;
                  },
                  get target() {
                    return demoProps().trailingIcon === "linkOut" && item.id === "project-brief"
                      ? "_blank"
                      : undefined;
                  },
                  get hasChildItems() {
                    return demoProps().trailingIcon === "child" && item.id === "project-brief"
                      ? true
                      : undefined;
                  },
                },
                [
                  () => (demoProps().showIcons ? h(SolidNewIcon, { "aria-hidden": "true" }) : null),
                  hc(SolidSpectrumText, { slot: "label" }, [item.name]),
                  hc(
                    Show,
                    {
                      get when() {
                        return demoProps().showDescriptions;
                      },
                    },
                    [hc(SolidSpectrumText, { slot: "description" }, [item.description])],
                  ),
                  () => {
                    const actionSlot = demoProps().itemActionSlot;
                    if (actionSlot === "buttonGroup") {
                      return hc(
                        SolidSpectrumActionButtonGroup,
                        { "aria-label": `${item.name} actions` },
                        [
                          hc(SolidSpectrumActionButton, { "aria-label": `Archive ${item.name}` }, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      );
                    }

                    if (actionSlot === "actionMenu") {
                      return hc(SolidSpectrumActionMenu, { "aria-label": `${item.name} menu` }, [
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
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

const collectionListStyle = {
  width: "100%",
  height: "220px",
};

export default () => h(SolidSpectrumListViewDemo, {});
