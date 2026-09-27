import h from "@solidjs/h";
import { createMemo, createSignal, onSettled } from "solid-js";
import { hc } from "../../solid-h";
import { StepList as SolidSpectrumStepList } from "@proyecto-viviana/solid-spectrum/StepList";
import { Provider as SolidSpectrumProvider } from "@proyecto-viviana/solid-spectrum/Provider";
import {
  stepListDemoItems,
  stepListDemoPropsFromWindow,
  stepListDemoLocaleFromWindow,
  stepListKeysFromValue,
  normalizeStepListDemoProps,
  serializeStepListDemoProps,
  type StepListDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/steplist-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

// Solid StepList: the solid-spectrum styled StepList over the base
// `createStepList` / `createStepListState` port. The fixed four-step wizard +
// prop-driven completion/selection state pair-diffs against the hand-wired v3
// hooks oracle (React panel). Localized state prefixes and default container
// label certified across locales under D6 AX.
function SolidSpectrumStepListDemo() {
  const [demoProps, setDemoProps] = createSignal<StepListDemoProps>(stepListDemoPropsFromWindow());
  const locale = stepListDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onSettled(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "steplist") {
        setDemoProps(normalizeStepListDemoProps(event.detail.props ?? {}));
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

  const renderedStepList = createMemo(() =>
    hc(SolidSpectrumStepList, {
      get "aria-label"() {
        return demoProps().ariaLabel !== undefined
          ? demoProps().ariaLabel || undefined
          : "Checkout steps";
      },
      items: stepListDemoItems,
      get defaultSelectedKey() {
        return demoProps().defaultSelectedKey || undefined;
      },
      get defaultLastCompletedStep() {
        return demoProps().defaultLastCompletedStep || undefined;
      },
      get disabledKeys() {
        return stepListKeysFromValue(demoProps().disabledKeys);
      },
      get isDisabled() {
        return demoProps().isDisabled;
      },
      get isReadOnly() {
        return demoProps().isReadOnly;
      },
      "data-comparison-control-root": "steplist",
      get "data-comparison-control-props"() {
        return serializeStepListDemoProps(demoProps());
      },
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale: locale || undefined,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc("div", { class: "comparison-gridlist-row" }, [
        h("button", {}, "Before"),
        renderedStepList,
        h("button", {}, "After"),
      ]),
    ],
  );
}

export default () => h(SolidSpectrumStepListDemo, {});
