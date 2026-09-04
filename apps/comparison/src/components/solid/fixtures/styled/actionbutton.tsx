import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  Provider as SolidSpectrumProvider,
  Text as SolidSpectrumText,
} from "@proyecto-viviana/solid-spectrum";
import {
  actionButtonDemoPropsFromWindow,
  serializeActionButtonDemoProps,
  type ActionButtonDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/actionbutton-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import {
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
  SolidNewIcon,
  type SingleButtonIconPlacement,
} from "../styled-shared.tsx";

/**
 * ActionButton children, mirroring the React fixture's
 * `renderSingleButtonFamilyChildren` shape exactly (bare string for the
 * text-only case, `SpectrumText` for the icon-start case). Unlike the plain
 * button/toggle helper above, ActionButton must NOT hand-build a `<span>` with
 * a pre-computed text visibility class: `isPending` swaps the label for a
 * ProgressCircle on a deliberate 1s delay, and only the component owns that
 * delayed `isProgressVisible` signal. Passing a bare string lets the port's
 * `getSingleTextChild` re-wrap it in the component's own delayed
 * `s2ActionButtonText({isProgressVisible})` span, and passing `SolidSpectrumText`
 * lets it read the component's `TextContext` — the same way React lets S2's
 * `Text`/`TextContext` own the delayed visibility. Hard-coding `props.isPending`
 * in the fixture instead would hide the label immediately (defeating the 1s
 * delay) and drop the accessible name before the spinner mounts.
 */
function solidActionButtonFamilyChildren(
  label: () => string,
  iconPlacement: () => SingleButtonIconPlacement,
) {
  return [
    () => {
      const placement = iconPlacement();

      if (placement === "start") {
        return [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, label())];
      }

      if (placement === "only") {
        return h(SolidNewIcon, { "aria-hidden": "true" });
      }

      return label();
    },
  ];
}

function SolidSpectrumActionButtonDemo() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(actionButtonDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbutton") {
        setDemoProps(event.detail.props as ActionButtonDemoProps);
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

  const renderedActionButton = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumActionButton,
      {
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isDisabled: props.isDisabled,
        isPending: props.isPending,
        ...(props.iconPlacement === "only" ? { "aria-label": props.children } : {}),
        onPress: (_event: unknown) => {
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        },
      },
      solidActionButtonFamilyChildren(
        () => props.children,
        () => props.iconPlacement,
      ),
    );
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
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-button-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          "data-comparison-control-root": "actionbutton",
          get "data-comparison-control-props"() {
            return serializeActionButtonDemoProps(demoProps());
          },
          get "data-comparison-actionbutton-props"() {
            return serializeActionButtonDemoProps(demoProps());
          },
          get "data-comparison-actionbutton-pending"() {
            return demoProps().isPending ? "true" : undefined;
          },
        },
        [renderedActionButton],
      ),
    ],
  );
}

export default () => h(SolidSpectrumActionButtonDemo, {});
