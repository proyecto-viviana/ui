import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  StepList as SolidSpectrumStepList,
  Provider as SolidSpectrumProvider,
} from "@proyecto-viviana/solid-spectrum";
import {
  stepListDemoItems,
  stepListDemoPropsFromWindow,
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
// hooks oracle (React panel). No locale plumbing — D10 is scoped out for
// StepList (see the certified spec).
function SolidSpectrumStepListDemo() {
  const [demoProps, setDemoProps] = createSignal<StepListDemoProps>(stepListDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
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
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedStepList = createMemo(() =>
    hc(SolidSpectrumStepList, {
      "aria-label": "Checkout steps",
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
