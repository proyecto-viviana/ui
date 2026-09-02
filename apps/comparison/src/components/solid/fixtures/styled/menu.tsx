import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  Keyboard as SolidSpectrumKeyboard,
  Menu as SolidSpectrumMenu,
  MenuItem as SolidSpectrumMenuItem,
  MenuTrigger as SolidSpectrumMenuTrigger,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  defaultMenuSelectedKeys,
  menuDemoPropsFromWindow,
  menuItems,
  normalizeMenuDemoProps,
  serializeMenuDemoProps,
  serializeMenuSelectedKeys,
  type MenuDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/menu-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

function SolidSpectrumMenuDemo() {
  const [demoProps, setDemoProps] = createSignal<MenuDemoProps>(menuDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    defaultMenuSelectedKeys(menuDemoPropsFromWindow().selectionMode),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [openChangeCount, setOpenChangeCount] = createSignal(0);
  const [lastOpenState, setLastOpenState] = createSignal("false");
  const [selectionChangeCount, setSelectionChangeCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "menu") {
        const nextProps = normalizeMenuDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(defaultMenuSelectedKeys(nextProps.selectionMode));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
        setSelectionChangeCount(0);
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

  const activeSelectionMode = () =>
    demoProps().selectionMode === "none" ? undefined : demoProps().selectionMode;
  const handleSelectionChange = (keys: unknown) => {
    const nextKeys =
      keys === "all"
        ? new Set(menuItems.map((item) => item.id))
        : new Set(Array.from(keys as Iterable<unknown>).map(String));
    setSelectedKeys(nextKeys);
    setSelectionChangeCount((count) => count + 1);
  };

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
          class: "comparison-menu-row",
          "data-comparison-control-root": "menu",
          get "data-comparison-control-props"() {
            return serializeMenuDemoProps(demoProps());
          },
          get "data-comparison-menu-props"() {
            return serializeMenuDemoProps(demoProps());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-last-action"() {
            return lastAction();
          },
          get "data-comparison-open-change-count"() {
            return String(openChangeCount());
          },
          get "data-comparison-last-open-state"() {
            return lastOpenState();
          },
          get "data-comparison-selection-change-count"() {
            return String(selectionChangeCount());
          },
          get "data-comparison-selected-keys"() {
            return serializeMenuSelectedKeys(selectedKeys());
          },
        },
        [
          hc(
            SolidSpectrumMenuTrigger,
            {
              get align() {
                return demoProps().align;
              },
              get direction() {
                return demoProps().direction;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              onOpenChange: (isOpen: boolean) => {
                setOpenChangeCount((count) => count + 1);
                setLastOpenState(String(isOpen));
              },
            },
            [
              h(
                SolidSpectrumActionButton,
                {
                  get size() {
                    return demoProps().triggerSize;
                  },
                  get isDisabled() {
                    return demoProps().isDisabled;
                  },
                  "aria-label": "Layer actions",
                },
                "Layer actions",
              ),
              hc(
                SolidSpectrumMenu,
                {
                  get size() {
                    return demoProps().size;
                  },
                  "aria-label": "Layer actions",
                  get selectionMode() {
                    return activeSelectionMode();
                  },
                  get selectedKeys() {
                    return activeSelectionMode() ? selectedKeys() : undefined;
                  },
                  onSelectionChange: handleSelectionChange,
                  onAction: (key: unknown) => {
                    setActionCount((count) => count + 1);
                    setLastAction(String(key));
                  },
                },
                [
                  () =>
                    menuItems.map((item) =>
                      hc(
                        SolidSpectrumMenuItem,
                        {
                          id: item.id,
                          textValue: item.label,
                        },
                        [
                          () => [
                            h(SolidNewIcon, { "aria-hidden": "true" }),
                            h(SolidSpectrumText, { slot: "label" }, item.label),
                            h(SolidSpectrumText, { slot: "description" }, item.description),
                            h(SolidSpectrumKeyboard, {}, item.shortcut),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumMenuDemo, {});
