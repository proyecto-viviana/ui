import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { createComponent } from "solid-js/web";
import {
  Provider as SolidSpectrumProvider,
  Switch as SolidSpectrumSwitch,
} from "@proyecto-viviana/solid-spectrum";
import {
  normalizeSwitchDemoProps,
  serializeSwitchDemoProps,
  switchDemoPropsFromWindow,
  type SwitchDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/switch-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";
import { providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumSwitchDemo() {
  const [demoProps, setDemoProps] = createSignal<SwitchDemoProps>(switchDemoPropsFromWindow());
  const [isSelected, setIsSelected] = createSignal(demoProps().isSelected);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "switch") {
        const nextProps = normalizeSwitchDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
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
    serializeSwitchDemoProps({
      ...demoProps(),
      isSelected: isSelected(),
    }),
  );

  return createComponent(SolidSpectrumProvider, {
    get colorScheme() {
      return colorScheme();
    },
    background: "base",
    style: providerShellStyle,
    get children(): JSX.Element {
      return h(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected"() {
            return String(isSelected());
          },
          "data-comparison-control-root": "switch",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          createComponent(SolidSpectrumSwitch, {
            get size() {
              return demoProps().size;
            },
            get isSelected() {
              return isSelected();
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            onChange: (nextSelected: boolean) => {
              setIsSelected(nextSelected);
              setDemoProps((current: SwitchDemoProps) => ({
                ...current,
                isSelected: nextSelected,
              }));
            },
            get children() {
              return demoProps().children;
            },
          }),
        ],
      ) as unknown as JSX.Element;
    },
  });
}

export default () => h(SolidSpectrumSwitchDemo, {});
