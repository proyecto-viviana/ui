import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  Content as SolidSpectrumContent,
  AlertDialog as SolidSpectrumAlertDialog,
  Dialog as SolidSpectrumDialog,
  DialogTrigger as SolidSpectrumDialogTrigger,
  Heading as SolidSpectrumHeading,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import { dispatchComparisonCallback } from "@comparison/data/event-log";
import {
  dialogDemoPropsFromWindow,
  normalizeDialogDemoProps,
  serializeDialogDemoProps,
  type DialogDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/dialog-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumDialogDemo() {
  const [demoProps, setDemoProps] = createSignal<DialogDemoProps>(dialogDemoPropsFromWindow());
  const [isOpen, setIsOpen] = createSignal(demoProps().isOpen);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dialog") {
        const nextProps = normalizeDialogDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsOpen(nextProps.isOpen);
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

  const serializedProps = createMemo(() =>
    serializeDialogDemoProps({
      ...demoProps(),
      isOpen: isOpen(),
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    dispatchComparisonCallback("dialog", "onOpenChange", {
      target: document.activeElement,
      value: nextOpen,
    });
    // Track open state in its own signal only. Folding `isOpen` back into
    // `demoProps` is redundant — `serializedProps` already overlays `isOpen()`
    // — and harmful in Solid: the role-conditional child below reads
    // `demoProps()`, so perturbing it on every open/close re-runs that thunk and
    // recreates the whole Dialog subtree (tearing the focused section's portal
    // out mid-gesture, before `keyup`). React reconciles the same conditional by
    // type and keeps it mounted; decoupling `isOpen` here matches that so the D4
    // event-sequence oracle isolates dismiss/focus behavior, not fixture churn.
    setIsOpen(nextOpen);
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
          "data-comparison-control-root": "dialog",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
        },
        [
          hc(
            SolidSpectrumDialogTrigger,
            {
              get isOpen() {
                return isOpen();
              },
              onOpenChange: handleOpenChange,
            },
            [
              () =>
                hc(
                  SolidSpectrumButton,
                  {
                    variant: "primary",
                  },
                  [() => demoProps().triggerLabel],
                ),
              () =>
                demoProps().role === "alertdialog"
                  ? hc(
                      SolidSpectrumAlertDialog,
                      {
                        get title() {
                          return demoProps().title;
                        },
                        get variant() {
                          return demoProps().variant;
                        },
                        get size() {
                          // AlertDialog is S | M | L only; fold XL onto L.
                          return demoProps().size === "XL" ? "L" : demoProps().size;
                        },
                        get primaryActionLabel() {
                          return demoProps().primaryActionLabel;
                        },
                        get secondaryActionLabel() {
                          return demoProps().secondaryActionLabel || undefined;
                        },
                        get cancelLabel() {
                          return demoProps().cancelLabel || undefined;
                        },
                      },
                      [() => demoProps().body],
                    )
                  : hc(
                      SolidSpectrumDialog,
                      {
                        get size() {
                          return demoProps().size;
                        },
                        get role() {
                          return demoProps().role;
                        },
                        get isDismissible() {
                          return demoProps().isDismissible;
                        },
                        get isKeyboardDismissDisabled() {
                          return demoProps().isKeyboardDismissDisabled;
                        },
                      },
                      [
                        () => [
                          demoProps().hasTitle
                            ? hc(
                                SolidSpectrumHeading,
                                {
                                  slot: "title",
                                },
                                [() => demoProps().title],
                              )
                            : null,
                          hc(SolidSpectrumContent, {}, [
                            () => hc(SolidSpectrumText, {}, [() => demoProps().body]),
                          ]),
                        ],
                      ],
                    ),
            ],
          ),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumDialogDemo, {});
