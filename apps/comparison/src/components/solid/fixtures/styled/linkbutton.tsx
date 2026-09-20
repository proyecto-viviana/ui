import h from "@solidjs/h";
import { createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { LinkButton as SolidSpectrumLinkButton } from "@proyecto-viviana/solid-spectrum/LinkButton";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
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

  onSettled(() => {
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
    return () => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    };
  });

  const renderedLinkButton = hc(SolidSpectrumLinkButton, {
    "data-comparison-control-root": "linkbutton",
    get "data-comparison-control-props"() {
      return serializeLinkButtonDemoProps(demoProps());
    },
    get href() {
      return demoProps().href;
    },
    get variant() {
      return demoProps().variant;
    },
    get fillStyle() {
      return demoProps().fillStyle;
    },
    get size() {
      return demoProps().size;
    },
    get staticColor() {
      return demoProps().staticColor;
    },
    get isDisabled() {
      return demoProps().isDisabled;
    },
    get "aria-label"() {
      return demoProps().iconPlacement === "only" ? demoProps().children : undefined;
    },
    get children() {
      const props = demoProps();
      return solidSingleButtonFamilyChildren(props.children, props.iconPlacement, () =>
        s2ButtonText({ isProgressVisible: false }),
      );
    },
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
