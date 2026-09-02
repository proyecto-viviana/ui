import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc, renderProp } from "../../solid-h";
import {
  Provider as SolidSpectrumProvider,
  Tag as SolidSpectrumTag,
  TagGroup as SolidSpectrumTagGroup,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  disabledTagGroupKeys,
  initialTagGroupSelectedKeys,
  normalizeTagGroupDemoProps,
  serializeTagGroupDemoProps,
  serializeTagGroupKeys,
  tagGroupDemoLocaleFromWindow,
  tagGroupDemoPropsFromWindow,
  tagGroupInitialItems,
  tagGroupItems,
  tagGroupKeysFromValue,
  type TagGroupDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/taggroup-demo";
import {
  createComparisonResolvedThemeSignal,
  providerShellStyle,
  collectionFixtureStyle,
  SolidNewIcon,
} from "../styled-shared.tsx";

function SolidSpectrumTagGroupDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const locale = tagGroupDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = createSignal<TagGroupDemoProps>(tagGroupDemoPropsFromWindow());
  const [tags, setTags] = createSignal(tagGroupInitialItems(demoProps()));
  const [selectedKeys, setSelectedKeys] = createSignal(initialTagGroupSelectedKeys(demoProps()));
  const [actionCount, setActionCount] = createSignal(0);
  const serializedProps = createMemo(() => serializeTagGroupDemoProps(demoProps()));
  const selectedValue = createMemo(() => serializeTagGroupKeys(selectedKeys()));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "taggroup") {
        const nextProps = normalizeTagGroupDemoProps({
          ...demoProps(),
          ...event.detail.props,
        });
        setDemoProps(nextProps);
        setTags(tagGroupInitialItems(nextProps));
        setSelectedKeys(initialTagGroupSelectedKeys(nextProps));
        setActionCount(0);
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
      // Threaded so the D10 RTL driver's `?locale=ar-AE` gives the Provider
      // `direction: 'rtl'` and `createTag` flips its inline-axis nav.
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      // Boundary buttons flank the grid so the D5 walk can Tab into the group and
      // Shift+Tab into it from after — exercising entry-direction in both ways.
      h("button", {}, "Before"),
      hc(
        "div",
        {
          style: collectionFixtureStyle,
          "data-comparison-control-root": "taggroup",
          "data-comparison-control-props": serializedProps,
          "data-comparison-selected-keys": selectedValue,
          get "data-comparison-tag-count"() {
            return String(tags().length);
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
        },
        [
          hc(
            SolidSpectrumTagGroup,
            {
              get label() {
                return demoProps().label;
              },
              get items() {
                return tags();
              },
              get size() {
                return demoProps().size;
              },
              get labelPosition() {
                return demoProps().labelPosition;
              },
              get labelAlign() {
                return demoProps().labelAlign;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionBehavior() {
                return demoProps().selectionBehavior;
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? tagGroupKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["landscape"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              get disabledKeys() {
                return disabledTagGroupKeys(demoProps());
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get description() {
                return demoProps().showDescription
                  ? "Use tags to organize photo metadata."
                  : undefined;
              },
              get errorMessage() {
                return demoProps().isInvalid && demoProps().showErrorMessage
                  ? "Choose at least one usable tag."
                  : undefined;
              },
              renderEmptyState: () => "No categories",
              UNSAFE_style: collectionTagGroupStyle,
              get groupActionLabel() {
                return demoProps().withGroupAction ? "Add tag" : undefined;
              },
              onGroupAction: () => setActionCount((count) => count + 1),
              onAction: () => setActionCount((count) => count + 1),
              onSelectionChange: (keys: Set<string | number> | "all") =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(tagGroupItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
              get onRemove() {
                if (!demoProps().allowsRemoving) {
                  return undefined;
                }

                return (keys: Set<string | number>) => {
                  setTags((currentTags) => currentTags.filter((item) => !keys.has(item.id)));
                  setSelectedKeys((currentKeys) => {
                    const nextKeys = new Set(currentKeys);
                    for (const key of keys) {
                      nextKeys.delete(String(key));
                    }
                    return nextKeys;
                  });
                };
              },
            },
            renderProp((item: (typeof tagGroupItems)[number]) =>
              hc(
                SolidSpectrumTag,
                { id: item.id },
                demoProps().contentMode === "icon"
                  ? [
                      h(SolidNewIcon, { "aria-hidden": "true" }),
                      h(SolidSpectrumText, {}, item.name),
                    ]
                  : [item.name],
              ),
            ),
          ),
        ],
      ),
      h("button", {}, "After"),
    ],
  );
}

const collectionTagGroupStyle = {
  "max-width": "320px",
};

export default () => h(SolidSpectrumTagGroupDemo, {});
