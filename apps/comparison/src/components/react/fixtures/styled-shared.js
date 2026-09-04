import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import {
  Provider as SpectrumProvider,
  Text as SpectrumText,
  createIcon,
  createIllustration,
} from "@react-spectrum/s2";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
} from "@comparison/data/theme";

export const ReactButtonIcon = createIcon((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    ...props,
    children: [
      jsx("path", {
        d: "m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

export function explicitStaticColor(staticColor) {
  return staticColor === "black" || staticColor === "white" ? staticColor : undefined;
}

export function staticColorBackdropProps(staticColor, className = "") {
  const staticBackdrop = explicitStaticColor(staticColor);
  const classes = [className, staticBackdrop ? "comparison-static-color-backdrop" : undefined]
    .filter(Boolean)
    .join(" ");

  return {
    className: classes || undefined,
    "data-comparison-static-color": staticBackdrop,
  };
}

export const ReactPlanIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("rect", {
        x: "6",
        y: "10",
        width: "36",
        height: "28",
        rx: "7",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.16",
      }),
      jsx("path", {
        d: "M15 31V19h18v12H15Zm3-3h12v-6H18v6Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "17",
        cy: "15",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "31",
        cy: "35",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

export const ReactDropZoneIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("path", {
        d: "M24 8 12 20h7v11h10V20h7L24 8Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "M12 34h24v4H12v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.42",
      }),
      jsx("path", {
        d: "M8 28h6v4H8c-2.2 0-4-1.8-4-4V14c0-2.2 1.8-4 4-4h6v4H8v14Zm26-18h6c2.2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4h-6v-4h6V14h-6v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.18",
      }),
    ],
  }),
);

export const ReactIllustratedMessageIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("rect", {
        x: "7",
        y: "11",
        width: "34",
        height: "28",
        rx: "6",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.14",
      }),
      jsx("path", {
        d: "M16 18h16v4H16v-4Zm0 8h11v4H16v-4Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "M31 29 37 23l3 3-9 9-5-5 3-3 2 2Z",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

export function renderReactSpectrumReference(children, colorScheme = "dark", locale = void 0) {
  return jsx(SpectrumProvider, {
    colorScheme,
    locale,
    background: "base",
    UNSAFE_style: providerShellStyle,
    children,
  });
}

export function renderSingleButtonFamilyChildren(label, iconPlacement) {
  if (iconPlacement === "start") {
    return [jsx(ReactButtonIcon, {}, "icon"), jsx(SpectrumText, { children: label }, "text")];
  }

  if (iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return label;
}

export function useComparisonResolvedTheme() {
  const [colorScheme, setColorScheme] = useState(getComparisonResolvedThemeFromDocument);
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    return () => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
  }, []);
  return colorScheme;
}

export function colorToCssString(color) {
  return color?.toString?.("css") ?? "";
}

export const providerShellStyle = {
  padding: 0,
  background: "transparent",
};

export const collectionFixtureStyle = {
  width: 440,
  padding: 12,
};
