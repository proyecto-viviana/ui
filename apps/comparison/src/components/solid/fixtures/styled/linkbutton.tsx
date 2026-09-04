import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  LinkButton as SolidSpectrumLinkButton,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import { comparisonControlsEvent } from "@comparison/data/button-demo";
import {
  linkButtonDemoPropsFromWindow,
  normalizeLinkButtonDemoProps,
  serializeLinkButtonDemoProps,
  type LinkButtonDemoProps,
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import {
  solidSingleButtonFamilyChildren,
  providerShellStyle,
  staticColorBackdropClass,
  staticColorBackdropValue,
} from "../styled-shared.tsx";

function SolidSpectrumLinkButtonDemo() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const [demoProps, setDemoProps] = createSignal<LinkButtonDemoProps>(
    linkButtonDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "linkbutton") {
        setDemoProps(normalizeLinkButtonDemoProps(event.detail.props ?? {}));
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

  const renderedLinkButton = createMemo(() => {
    const props = demoProps();
    return hc(
      SolidSpectrumLinkButton,
      {
        "data-comparison-control-root": "linkbutton",
        "data-comparison-control-props": serializeLinkButtonDemoProps(props),
        href: props.href,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        staticColor: props.staticColor,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
      },
      solidSingleButtonFamilyChildren(props.children, props.iconPlacement, () =>
        s2ButtonText({ isProgressVisible: false }),
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
        },
        [renderedLinkButton],
      ),
    ],
  );
}

export default () => h(SolidSpectrumLinkButtonDemo, {});
