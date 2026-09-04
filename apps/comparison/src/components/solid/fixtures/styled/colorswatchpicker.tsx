import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  ColorSwatch as SolidSpectrumColorSwatch,
  ColorSwatchPicker as SolidSpectrumColorSwatchPicker,
  Provider as SolidSpectrumProvider,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import {
  colorSwatchPickerDemoPropsFromWindow,
  colorSwatchPickerPalette,
  initialColorSwatchPickerDemoValue,
  normalizeColorSwatchPickerDemoProps,
  serializeColorSwatchPickerDemoProps,
  type ColorSwatchPickerDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/colorswatchpicker-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function solidColorSwatchPickerToCssString(
  color: ReturnType<typeof parseSolidSpectrumColor> | null | undefined,
) {
  return (color?.toString("css") ?? "").replace(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(?:1|1\.0+)\)$/i,
    "rgb($1, $2, $3)",
  );
}

function SolidSpectrumColorSwatchPickerDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSwatchPickerDemoProps>(
    colorSwatchPickerDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(initialColorSwatchPickerDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatchpicker") {
        const nextProps = normalizeColorSwatchPickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialColorSwatchPickerDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeColorSwatchPickerDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "colorswatchpicker",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          // Boundary buttons flank the picker so the certified D5 walk enters the grid via
          // a real Tab keypress (the faithful roving entry) instead of a synthetic
          // container `.focus()`: the latter navigates `focusedKey` but does not pull DOM
          // focus onto the selected swatch in Solid (createFocusWithin's onFocus is
          // non-bubbling), so it diverges from React's synchronous delegate. They sit
          // outside the `role="listbox"` roving scope.
          h("button", {}, "Before"),
          hc(
            SolidSpectrumColorSwatchPicker,
            {
              get value() {
                return demoProps().valueSource === "value" ? demoProps().value : undefined;
              },
              get defaultValue() {
                return demoProps().valueSource === "defaultValue"
                  ? demoProps().defaultValue
                  : undefined;
              },
              get density() {
                return demoProps().density;
              },
              get size() {
                return demoProps().size;
              },
              get rounding() {
                return demoProps().rounding;
              },
              get "aria-label"() {
                return demoProps().ariaLabel || undefined;
              },
              get "aria-labelledby"() {
                return demoProps().ariaLabelledBy || undefined;
              },
              get "aria-describedby"() {
                return demoProps().ariaDescribedBy || undefined;
              },
              get "aria-details"() {
                return demoProps().ariaDetails || undefined;
              },
              get id() {
                return demoProps().id || undefined;
              },
              get slot() {
                return demoProps().slot || undefined;
              },
              onChange: (nextValue: ReturnType<typeof parseSolidSpectrumColor>) => {
                const nextString = solidColorSwatchPickerToCssString(nextValue);
                setValue(nextString);
                setDemoProps((current: ColorSwatchPickerDemoProps) =>
                  current.valueSource === "value" ? { ...current, value: nextString } : current,
                );
              },
            },
            colorSwatchPickerPalette.map((item) =>
              hc(SolidSpectrumColorSwatch, {
                color: item.color,
                colorName: item.colorName,
              }),
            ),
          ),
          h("button", {}, "After"),
        ],
      ),
    ],
  );
}

export default () => h(SolidSpectrumColorSwatchPickerDemo, {});
