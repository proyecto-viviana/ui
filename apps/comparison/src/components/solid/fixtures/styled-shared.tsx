import h from "solid-js/h";
import { createSignal, mergeProps, onCleanup, onMount, splitProps, type JSX } from "solid-js";
import { createIcon, createIllustration } from "@proyecto-viviana/solid-spectrum";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";

type SolidIllustrationSvgProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "S" | "M" | "L";
};

export const SolidNewIcon = createIcon((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const { class: className, ...rest } = props;
  return h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      ...rest,
      class: className,
    },
    h("path", {
      d: "m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z",
      fill: "var(--iconPrimary, #222)",
    }),
    h("path", {
      d: "m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z",
      fill: "var(--iconPrimary, #222)",
    }),
  )() as JSX.Element;
});

export const SolidPlanIllustration = createIllustration((props: SolidIllustrationSvgProps) => {
  const { class: className, size: _size, ...rest } = props;
  return h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 48 48",
      ...rest,
      class: className,
    },
    [
      h("rect", {
        x: "6",
        y: "10",
        width: "36",
        height: "28",
        rx: "7",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.16",
      }),
      h("path", {
        d: "M15 31V19h18v12H15Zm3-3h12v-6H18v6Z",
        fill: "var(--iconPrimary, #222)",
      }),
      h("circle", {
        cx: "17",
        cy: "15",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
      h("circle", {
        cx: "31",
        cy: "35",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  )() as JSX.Element;
});

export const SolidDropZoneIllustration = createIllustration((props: SolidIllustrationSvgProps) => {
  const [local, rest] = splitProps(props, ["class", "size"]);
  return h(
    "svg",
    mergeProps(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 48 48",
      },
      rest,
      {
        get class() {
          return local.class;
        },
      },
    ),
    [
      h("path", {
        d: "M24 8 12 20h7v11h10V20h7L24 8Z",
        fill: "var(--iconPrimary, #222)",
      }),
      h("path", {
        d: "M12 34h24v4H12v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.42",
      }),
      h("path", {
        d: "M8 28h6v4H8c-2.2 0-4-1.8-4-4V14c0-2.2 1.8-4 4-4h6v4H8v14Zm26-18h6c2.2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4h-6v-4h6V14h-6v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.18",
      }),
    ],
  )() as JSX.Element;
});

export const SolidIllustratedMessageIllustration = createIllustration(
  (props: SolidIllustrationSvgProps) => {
    const [local, rest] = splitProps(props, ["class", "size"]);
    return h(
      "svg",
      mergeProps(
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 48 48",
        },
        rest,
        {
          get class() {
            return local.class;
          },
        },
      ),
      [
        h("rect", {
          x: "7",
          y: "11",
          width: "34",
          height: "28",
          rx: "6",
          fill: "var(--iconPrimary, #222)",
          opacity: "0.14",
        }),
        h("path", {
          d: "M16 18h16v4H16v-4Zm0 8h11v4H16v-4Z",
          fill: "var(--iconPrimary, #222)",
        }),
        h("path", {
          d: "M31 29 37 23l3 3-9 9-5-5 3-3 2 2Z",
          fill: "var(--iconPrimary, #222)",
        }),
      ],
    )() as JSX.Element;
  },
);

export type SingleButtonIconPlacement = "none" | "start" | "end" | "only";

export function explicitStaticColor(staticColor: string | undefined | null) {
  return staticColor === "black" || staticColor === "white" ? staticColor : undefined;
}

export function staticColorBackdropClass(staticColor: string | undefined | null, className = "") {
  return [className, explicitStaticColor(staticColor) ? "comparison-static-color-backdrop" : ""]
    .filter(Boolean)
    .join(" ");
}

export function staticColorBackdropValue(staticColor: string | undefined | null) {
  return explicitStaticColor(staticColor);
}

export function createComparisonResolvedThemeSignal() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  onMount(() => {
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange));
  });
  return colorScheme;
}

export function solidSingleButtonFamilyChildren(
  label: string | (() => string),
  iconPlacement: SingleButtonIconPlacement | (() => SingleButtonIconPlacement),
  textClass: () => string,
) {
  const currentLabel = () => (typeof label === "function" ? label() : label);
  const currentIconPlacement = () =>
    typeof iconPlacement === "function" ? iconPlacement() : iconPlacement;

  return [
    () => {
      const text = h("span", { class: textClass(), "data-rsp-slot": "text" }, currentLabel());
      const icon = h(SolidNewIcon, { "aria-hidden": "true" });
      const placement = currentIconPlacement();

      if (placement === "start") {
        return [icon, text];
      }

      if (placement === "only") {
        return icon;
      }

      return text;
    },
  ];
}

export const providerShellStyle = {
  padding: "0",
  background: "transparent",
};

export const collectionFixtureStyle = {
  width: "440px",
  padding: "12px",
};
