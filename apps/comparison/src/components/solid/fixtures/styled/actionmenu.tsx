import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionMenu as SolidSpectrumActionMenu,
  Keyboard as SolidSpectrumKeyboard,
  MenuItem as SolidSpectrumMenuItem,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  actionMenuDemoPropsFromWindow,
  actionMenuItems,
  normalizeActionMenuDemoProps,
  serializeActionMenuDemoProps,
  type ActionMenuDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actionmenu-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle, SolidNewIcon } from "../styled-shared.tsx";

function SolidSpectrumActionMenuDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionMenuDemoProps>(
    actionMenuDemoPropsFromWindow(),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [openChangeCount, setOpenChangeCount] = createSignal(0);
  const [lastOpenState, setLastOpenState] = createSignal("false");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionmenu") {
        setDemoProps(normalizeActionMenuDemoProps(event.detail.props ?? {}));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
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
          class: "comparison-actionmenu-row",
          "data-comparison-control-root": "actionmenu",
          get "data-comparison-control-props"() {
            return serializeActionMenuDemoProps(demoProps());
          },
          get "data-comparison-actionmenu-props"() {
            return serializeActionMenuDemoProps(demoProps());
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
        },
        [
          hc(
            SolidSpectrumActionMenu,
            {
              get size() {
                return demoProps().size;
              },
              get menuSize() {
                return demoProps().menuSize;
              },
              get align() {
                return demoProps().align;
              },
              get direction() {
                return demoProps().direction;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              onAction: (key: unknown) => {
                setActionCount((count) => count + 1);
                setLastAction(String(key));
              },
              onOpenChange: (isOpen: boolean) => {
                setOpenChangeCount((count) => count + 1);
                setLastOpenState(String(isOpen));
              },
            },
            [
              () =>
                actionMenuItems.map((item) =>
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
  );
}

export default () => h(SolidSpectrumActionMenuDemo, {});
