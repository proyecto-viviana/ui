import h from "solid-js/h";
import { createEffect, createMemo, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { hc, renderProp } from "../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  ActionButtonGroup as SolidSpectrumActionButtonGroup,
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Card as SolidSpectrumCard,
  CardView as SolidSpectrumCardView,
  Checkbox as SolidSpectrumCheckbox,
  LinkButton as SolidSpectrumLinkButton,
  Provider as SolidSpectrumProvider,
  SearchField as SolidSpectrumSearchField,
  SegmentedControl as SolidSpectrumSegmentedControl,
  SegmentedControlItem as SolidSpectrumSegmentedControlItem,
  SelectBox as SolidSpectrumSelectBox,
  SelectBoxGroup as SolidSpectrumSelectBoxGroup,
  TextArea as SolidSpectrumTextArea,
  TextField as SolidSpectrumTextField,
  ToggleButton as SolidSpectrumToggleButton,
  ToggleButtonGroup as SolidSpectrumToggleButtonGroup,
  createIcon,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import {
  s2ActionButtonText,
  s2ToggleButtonText,
} from "../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import type { ComparisonSlug } from "@comparison/data/comparison-manifest";
import { comparisonActionItems as actionItems } from "@comparison/data/comparison-contract";
import {
  actionButtonDemoPropsFromWindow,
  serializeActionButtonDemoProps,
  type ActionButtonDemoProps,
} from "@comparison/data/actionbutton-demo";
import {
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
  type ButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  checkboxDemoPropsFromWindow,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
  type CheckboxDemoProps,
} from "@comparison/data/checkbox-demo";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
  type TextFieldDemoProps,
} from "@comparison/data/textfield-demo";
import {
  normalizeTextAreaDemoProps,
  serializeTextAreaDemoProps,
  textAreaDemoPropsFromWindow,
  type TextAreaDemoProps,
} from "@comparison/data/textarea-demo";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
  type SearchFieldDemoProps,
} from "@comparison/data/searchfield-demo";
import {
  actionButtonGroupDemoPropsFromWindow,
  buttonGroupDemoPropsFromWindow,
  linkButtonDemoPropsFromWindow,
  normalizeActionButtonGroupDemoProps,
  normalizeButtonGroupDemoProps,
  normalizeLinkButtonDemoProps,
  normalizeToggleButtonDemoProps,
  normalizeToggleButtonGroupDemoProps,
  selectedKeysSetFromText as selectedToggleKeysSetFromText,
  serializeActionButtonGroupDemoProps,
  serializeButtonGroupDemoProps,
  serializeLinkButtonDemoProps,
  serializeToggleButtonDemoProps,
  serializeToggleButtonGroupDemoProps,
  toggleButtonDemoPropsFromWindow,
  toggleButtonGroupDemoPropsFromWindow,
  type ActionButtonGroupDemoProps,
  type ButtonGroupDemoProps,
  type LinkButtonDemoProps,
  type ToggleButtonDemoProps,
  type ToggleButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";

type ActionItem = (typeof actionItems)[number];
type SolidStyledFixture = () => ReturnType<typeof h>;

const SolidNewIcon = createIcon((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
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

const selectBoxItems = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

const cardItems = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

type SingleButtonIconPlacement = "none" | "start" | "end" | "only";

function booleanParamFromWindow(name: string) {
  if (typeof window === "undefined") {
    return false;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  return value === "true" || value === "on" || value === "1";
}

function queryParamFromWindow(name: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T,
): T;
function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T | undefined,
): T | undefined;
function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T | undefined,
) {
  const value = queryParamFromWindow(name);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function selectedKeysParamFromWindow(fallback: string[]) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

const segmentedControlKeys = ["list", "grid", "board"] as const;
type SegmentedControlKey = (typeof segmentedControlKeys)[number];

interface SegmentedControlDemoProps {
  selectedKey: SegmentedControlKey;
  isJustified: boolean;
  isDisabled: boolean;
}

function segmentedControlDemoPropsFromWindow(): SegmentedControlDemoProps {
  return {
    selectedKey: stringParamFromWindow("selectedKey", segmentedControlKeys, "list"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
}

function normalizeSegmentedControlDemoProps(props: Partial<SegmentedControlDemoProps>) {
  return {
    selectedKey: segmentedControlKeys.includes(props.selectedKey as SegmentedControlKey)
      ? (props.selectedKey as SegmentedControlKey)
      : "list",
    isJustified: props.isJustified === true,
    isDisabled: props.isDisabled === true,
  };
}

type SelectBoxSelectionMode = "single" | "multiple";

interface SelectBoxGroupDemoProps {
  orientation: "horizontal" | "vertical";
  selectionMode: SelectBoxSelectionMode;
  selectedKeys: string;
  isDisabled: boolean;
}

function selectedKeysSetFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: SelectBoxSelectionMode,
) {
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

function selectBoxGroupDemoPropsFromWindow(): SelectBoxGroupDemoProps {
  const selectionMode = stringParamFromWindow(
    "selectionMode",
    ["single", "multiple"] as const,
    "single",
  );
  return {
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    selectionMode,
    selectedKeys: Array.from(
      selectedKeysParamFromWindow(selectionMode === "multiple" ? ["starter", "pro"] : ["starter"]),
    ).join(","),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
}

function normalizeSelectBoxGroupDemoProps(
  props: Partial<SelectBoxGroupDemoProps>,
): SelectBoxGroupDemoProps {
  const selectionMode = props.selectionMode === "multiple" ? "multiple" : "single";
  return {
    orientation: props.orientation === "vertical" ? "vertical" : "horizontal",
    selectionMode,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? props.selectedKeys
        : selectionMode === "multiple"
          ? "starter,pro"
          : "starter",
    isDisabled: props.isDisabled === true,
  };
}

function solidSingleButtonFamilyChildren(
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

export const solidStyledFixtures: Partial<Record<ComparisonSlug, SolidStyledFixture>> = {
  provider: renderProviderDemo,
  button: () => h(SolidSpectrumButtonDemo, {}),
  actionbutton: () => h(SolidSpectrumActionButtonDemo, {}),
  actionbuttongroup: () => h(SolidSpectrumActionButtonGroupDemo, {}),
  buttongroup: () => h(SolidSpectrumButtonGroupDemo, {}),
  checkbox: () => h(SolidSpectrumCheckboxDemo, {}),
  linkbutton: () => h(SolidSpectrumLinkButtonDemo, {}),
  cardview: () => h(SolidSpectrumCardViewDemo, {}),
  segmentedcontrol: () => h(SolidSpectrumSegmentedControlDemo, {}),
  selectboxgroup: () => h(SolidSpectrumSelectBoxGroupDemo, {}),
  searchfield: () => h(SolidSpectrumSearchFieldDemo, {}),
  textarea: () => h(SolidSpectrumTextAreaDemo, {}),
  textfield: () => h(SolidSpectrumTextFieldDemo, {}),
  togglebutton: () => h(SolidSpectrumToggleButtonDemo, {}),
  togglebuttongroup: () => h(SolidSpectrumToggleButtonGroupDemo, {}),
};

function renderProviderDemo() {
  return h(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    h(
      "div",
      { class: "comparison-provider-stack" },
      h("div", { class: "comparison-provider-caption" }, "Outer provider: dark / medium scale"),
      h(SolidSpectrumButton, { variant: "primary" }, "Inherited Action"),
      h(
        SolidSpectrumProvider,
        { colorScheme: "light", background: "base", style: nestedProviderStyle },
        h("div", { class: "comparison-provider-caption" }, "Nested provider: local light override"),
        h(SolidSpectrumButton, { variant: "accent" }, "Nested Override"),
      ),
    ),
  );
}

function SolidSpectrumButtonDemo() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(buttonDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props as ButtonDemoProps);
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

  const renderedButton = createMemo(() => {
    const props = demoProps();
    const children =
      props.iconPlacement === "start"
        ? [
            () => h(SolidNewIcon, { "aria-hidden": "true" }),
            () =>
              h(
                "span",
                {
                  class: s2ButtonText({ isProgressVisible: props.isPending }),
                  "data-rsp-slot": "text",
                },
                props.children,
              ),
          ]
        : props.iconPlacement === "only"
          ? [() => h(SolidNewIcon, { "aria-hidden": "true" })]
          : [
              () =>
                h(
                  "span",
                  {
                    class: s2ButtonText({ isProgressVisible: props.isPending }),
                    "data-rsp-slot": "text",
                  },
                  props.children,
                ),
            ];

    return hc(
      SolidSpectrumButton,
      {
        isDisabled: props.isDisabled,
        isPending: props.isPending,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        staticColor: props.staticColor,
        ...(props.iconPlacement === "only" ? { "aria-label": props.children } : {}),
        onPress: (_event: unknown) => {
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        },
      },
      children,
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          "data-comparison-control-root": "button",
          get "data-comparison-control-props"() {
            return serializeButtonDemoProps(demoProps());
          },
          get "data-comparison-button-props"() {
            return serializeButtonDemoProps(demoProps());
          },
        },
        [hc("div", { class: "comparison-button-row" }, [renderedButton])],
      ),
    ],
  );
}

function SolidSpectrumCheckboxDemo() {
  const [demoProps, setDemoProps] = createSignal(checkboxDemoPropsFromWindow());
  const [isSelected, setIsSelected] = createSignal(demoProps().isSelected);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props ?? {});
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
    serializeCheckboxDemoProps({
      ...demoProps(),
      isSelected: isSelected(),
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
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-checked"() {
            return String(isSelected());
          },
        },
        [
          hc(
            SolidSpectrumCheckbox,
            {
              "data-comparison-control-root": "checkbox",
              get "data-comparison-control-props"() {
                return serializedProps();
              },
              get size() {
                return demoProps().size;
              },
              get isSelected() {
                return isSelected();
              },
              get isIndeterminate() {
                return demoProps().isIndeterminate;
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
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onChange: (nextSelected: boolean) => {
                setIsSelected(nextSelected);
                setDemoProps((current: CheckboxDemoProps) => ({
                  ...current,
                  isSelected: nextSelected,
                }));
              },
            },
            [() => demoProps().children],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTextFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<TextFieldDemoProps>(
    textFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
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
    serializeTextFieldDemoProps({
      ...demoProps(),
      value: value(),
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
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(SolidSpectrumTextField, {
            "data-comparison-control-root": "textfield",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumTextAreaDemo() {
  const [demoProps, setDemoProps] = createSignal<TextAreaDemoProps>(textAreaDemoPropsFromWindow());
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textarea") {
        const nextProps = normalizeTextAreaDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
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
    serializeTextAreaDemoProps({
      ...demoProps(),
      value: value(),
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
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(SolidSpectrumTextArea, {
            "data-comparison-control-root": "textarea",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: TextAreaDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: TextAreaDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumSearchFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<SearchFieldDemoProps>(
    searchFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [clearCount, setClearCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
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
    serializeSearchFieldDemoProps({
      ...demoProps(),
      value: value(),
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
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
          get "data-comparison-clear-count"() {
            return String(clearCount());
          },
        },
        [
          hc(SolidSpectrumSearchField, {
            "data-comparison-control-root": "searchfield",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onClear: () => {
              setValue("");
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: "",
              }));
              setClearCount((count) => count + 1);
            },
          }),
        ],
      ),
    ],
  );
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
      solidSingleButtonFamilyChildren(props.children, props.iconPlacement, () =>
        s2ActionButtonText({ isProgressVisible: props.isPending }),
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
          class: "comparison-button-row",
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

function SolidSpectrumActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ActionButtonGroupDemoProps>(
    actionButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(["bold"]),
  );
  const [actionKey, setActionKey] = createSignal("");
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  const toggleKey = (key: string) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumActionButtonGroup,
      {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(props),
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
      },
      actionItems.map((item: ActionItem) =>
        hc(
          SolidSpectrumActionButton,
          {
            "aria-label": props.iconPlacement === "only" ? item.label : undefined,
            get "aria-pressed"() {
              return selectedKeys().has(item.id);
            },
            onPress: (_event: unknown) => toggleKey(item.id),
          },
          solidSingleButtonFamilyChildren(item.label, props.iconPlacement, () =>
            s2ActionButtonText({ isProgressVisible: false }),
          ),
        ),
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

function SolidSpectrumButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ButtonGroupDemoProps>(
    buttonGroupDemoPropsFromWindow(),
  );
  const [actionKey, setActionKey] = createSignal("");

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumButtonGroup,
      {
        "aria-label": "Approval actions",
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeButtonGroupDemoProps(props),
        orientation: props.orientation,
        align: props.align,
        size: props.size,
        isDisabled: props.isDisabled,
        UNSAFE_style: props.wrapWidth ? { width: `${props.wrapWidth}px` } : undefined,
      },
      [
        hc(
          SolidSpectrumButton,
          {
            variant: "primary",
            "aria-label": props.iconPlacement === "only" ? "Save" : undefined,
            onPress: (_event: unknown) => setActionKey("save"),
          },
          solidSingleButtonFamilyChildren("Save", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
        hc(
          SolidSpectrumButton,
          {
            variant: "secondary",
            "aria-label": props.iconPlacement === "only" ? "Cancel" : undefined,
            onPress: (_event: unknown) => setActionKey("cancel"),
          },
          solidSingleButtonFamilyChildren("Cancel", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
      ],
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get "data-comparison-action-key"() {
            return actionKey();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

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
          class: "comparison-button-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedLinkButton],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonDemo() {
  const [demoProps, setDemoProps] = createSignal<ToggleButtonDemoProps>(
    toggleButtonDemoPropsFromWindow(),
  );
  const [selected, setSelected] = createSignal(demoProps().isSelected);

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedToggleButton = createMemo(() => {
    const props = demoProps();
    const isSelected = selected();
    return hc(
      SolidSpectrumToggleButton,
      {
        "data-comparison-control-root": "togglebutton",
        "data-comparison-control-props": serializeToggleButtonDemoProps({
          ...props,
          isSelected,
        }),
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
        isSelected,
        onChange: setSelected,
      },
      solidSingleButtonFamilyChildren(
        props.children,
        props.iconPlacement,
        () => s2ToggleButtonText,
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get "data-comparison-selected"() {
            return String(selected());
          },
        },
        [renderedToggleButton],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ToggleButtonGroupDemoProps>(
    toggleButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedToggleKeysSetFromText(groupProps().selectedKeys, ["left"], groupProps().selectionMode),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
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

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    const selectedText = selectedKeyText();
    const serializedProps = serializeToggleButtonGroupDemoProps({
      ...props,
      selectedKeys: selectedText,
    });

    return hc(
      SolidSpectrumToggleButtonGroup,
      {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        "data-comparison-group-props": serializedProps,
        "data-comparison-control-props": serializedProps,
        selectionMode: props.selectionMode,
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
        selectedKeys: selectedKeys(),
        onSelectionChange: (keys: Set<string | number>) =>
          setSelectedKeys(new Set(Array.from(keys, String))),
      },
      [
        hc(
          SolidSpectrumToggleButton,
          {
            id: "left",
            "aria-label": props.iconPlacement === "only" ? "Left" : undefined,
          },
          solidSingleButtonFamilyChildren("Left", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "center",
            "aria-label": props.iconPlacement === "only" ? "Center" : undefined,
          },
          solidSingleButtonFamilyChildren("Center", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "right",
            "aria-label": props.iconPlacement === "only" ? "Right" : undefined,
          },
          solidSingleButtonFamilyChildren("Right", props.iconPlacement, () => s2ToggleButtonText),
        ),
      ],
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

function SolidSpectrumSegmentedControlDemo() {
  const [demoProps, setDemoProps] = createSignal<SegmentedControlDemoProps>(
    segmentedControlDemoPropsFromWindow(),
  );
  const [selectedKey, setSelectedKey] = createSignal(demoProps().selectedKey);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let segmentedControlRoot: HTMLElement | undefined;

  createEffect(() => {
    segmentedControlRoot?.setAttribute(
      "data-comparison-control-props",
      JSON.stringify(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-key"() {
            return selectedKey();
          },
        },
        [
          hc(
            SolidSpectrumSegmentedControl,
            {
              "aria-label": "View mode",
              "data-comparison-control-root": "segmentedcontrol",
              ref: (element: HTMLElement) => {
                segmentedControlRoot = element;
              },
              get "data-comparison-control-props"() {
                return JSON.stringify(demoProps());
              },
              get isJustified() {
                return demoProps().isJustified;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get selectedKey() {
                return selectedKey();
              },
              onSelectionChange: (key: string | number) =>
                setSelectedKey(String(key) as SegmentedControlKey),
            },
            [
              hc(SolidSpectrumSegmentedControlItem, { id: "list" }, ["List"]),
              hc(SolidSpectrumSegmentedControlItem, { id: "grid" }, ["Grid"]),
              hc(SolidSpectrumSegmentedControlItem, { id: "board" }, ["Board"]),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<SelectBoxGroupDemoProps>(
    selectBoxGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysSetFromValue(demoProps().selectedKeys, ["starter"], demoProps().selectionMode),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  let selectBoxGroupRoot: HTMLElement | undefined;

  createEffect(() => {
    selectBoxGroupRoot?.setAttribute("data-comparison-control-props", JSON.stringify(demoProps()));
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        const nextProps = normalizeSelectBoxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(
          selectedKeysSetFromValue(nextProps.selectedKeys, ["starter"], nextProps.selectionMode),
        );
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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumSelectBoxGroup,
            {
              "aria-label": "Plans",
              "data-comparison-control-root": "selectboxgroup",
              ref: (element: HTMLElement) => {
                selectBoxGroupRoot = element;
              },
              get "data-comparison-control-props"() {
                return JSON.stringify(demoProps());
              },
              get orientation() {
                return demoProps().orientation;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              items: selectBoxItems,
              getKey: (item: (typeof selectBoxItems)[number]) => item.id,
              getTextValue: (item: (typeof selectBoxItems)[number]) => item.label,
              get selectedKeys() {
                return selectedKeys();
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all" ? new Set<string>() : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof selectBoxItems)[number]) =>
              hc(SolidSpectrumSelectBox, { id: item.id, textValue: item.label }, [
                hc("span", { slot: "label", "data-rsp-slot": "label" }, [item.label]),
                hc("span", { slot: "description", "data-rsp-slot": "description" }, [
                  item.description,
                ]),
              ]),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumCardViewDemo() {
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["apollo"]));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));

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
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumCardView,
            {
              "aria-label": "Projects",
              items: cardItems,
              getKey: (item: (typeof cardItems)[number]) => item.id,
              getTextValue: (item: (typeof cardItems)[number]) => item.title,
              size: "S",
              density: "compact",
              variant: "secondary",
              selectionMode: "single",
              selectionStyle: "highlight",
              UNSAFE_style: cardViewDemoStyle,
              get selectedKeys() {
                return selectedKeys();
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all" ? new Set<string>() : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof cardItems)[number]) =>
              hc(SolidSpectrumCard, {}, [
                hc("strong", {}, [item.title]),
                " ",
                hc("span", {}, [item.status]),
              ]),
            ),
          ),
        ],
      ),
    ],
  );
}

const providerShellStyle = {
  padding: 0,
  background: "transparent",
};

const cardViewDemoStyle = {
  width: "360px",
  height: "180px",
};

const nestedProviderStyle = {
  padding: "16px",
  margin: "16px 0 0",
  "border-radius": "16px",
};
