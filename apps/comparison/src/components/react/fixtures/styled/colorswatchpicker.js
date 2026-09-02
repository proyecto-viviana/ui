import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useState } from "react";
import {
  ColorSwatchPicker as SpectrumColorSwatchPicker,
  ColorSwatch as SpectrumPickerColorSwatch,
} from "@react-spectrum/s2/ColorSwatchPicker";
import { buttonDemoLocaleFromWindow } from "@comparison/data/button-demo";
import { comparisonControlsEvent as colorSwatchControlsEvent } from "@comparison/data/colorswatch-demo";
import {
  colorSwatchPickerDemoPropsFromWindow,
  colorSwatchPickerPalette,
  initialColorSwatchPickerDemoValue,
  normalizeColorSwatchPickerDemoProps,
  serializeColorSwatchPickerDemoProps,
} from "@comparison/data/colorswatchpicker-demo";
import {
  useComparisonResolvedTheme,
  renderReactSpectrumReference,
  colorToCssString,
} from "../styled-shared.js";

function colorSwatchPickerToCssString(color) {
  return colorToCssString(color).replace(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(?:1|1\.0+)\)$/i,
    "rgb($1, $2, $3)",
  );
}

function ReactColorSwatchPickerDemo() {
  const [demoProps, setDemoProps] = useState(colorSwatchPickerDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialColorSwatchPickerDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatchpicker") {
        const nextProps = normalizeColorSwatchPickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialColorSwatchPickerDemoValue(nextProps));
      }
    };
    window.addEventListener(colorSwatchControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSwatchControlsEvent, handleControlsChange);
  }, []);

  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "value" ? demoProps.value : demoProps.defaultValue,
    demoProps.density,
    demoProps.size,
    demoProps.rounding,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
  ].join("|");

  const pickerProps = {
    density: demoProps.density,
    size: demoProps.size,
    rounding: demoProps.rounding,
    "aria-label": demoProps.ariaLabel || undefined,
    "aria-labelledby": demoProps.ariaLabelledBy || undefined,
    "aria-describedby": demoProps.ariaDescribedBy || undefined,
    "aria-details": demoProps.ariaDetails || undefined,
    id: demoProps.id || undefined,
    slot: demoProps.slot || undefined,
    onChange: (nextValue) => {
      const nextString = colorSwatchPickerToCssString(nextValue);
      setValue(nextString);
      setDemoProps((current) =>
        current.valueSource === "value" ? { ...current, value: nextString } : current,
      );
    },
  };

  if (demoProps.valueSource === "value") {
    pickerProps.value = demoProps.value;
  } else {
    pickerProps.defaultValue = demoProps.defaultValue;
  }

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorswatchpicker",
      "data-comparison-control-props": serializeColorSwatchPickerDemoProps(demoProps),
      "data-comparison-value": value,
      // Boundary buttons flank the picker so the certified D5 walk enters the grid through a
      // real Tab keypress (the faithful roving entry) rather than a synthetic container
      // `.focus()`. They sit outside the `role="listbox"` roving scope.
      children: jsxs(Fragment, {
        children: [
          jsx("button", { children: "Before" }),
          jsx(
            SpectrumColorSwatchPicker,
            {
              ...pickerProps,
              children: colorSwatchPickerPalette.map((item) =>
                jsx(
                  SpectrumPickerColorSwatch,
                  {
                    color: item.color,
                    colorName: item.colorName,
                  },
                  item.color,
                ),
              ),
            },
            renderKey,
          ),
          jsx("button", { children: "After" }),
        ],
      }),
    }),
    colorScheme,
    locale,
  );
}

export default () => jsx(ReactColorSwatchPickerDemo, {});
