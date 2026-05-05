import h from "solid-js/h";
import { createMemo, createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { hc, renderProp } from "../solid-h";
import {
  ActionButton as SolidSpectrumActionButton,
  ActionButtonGroup as SolidSpectrumActionButtonGroup,
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Card as SolidSpectrumCard,
  CardView as SolidSpectrumCardView,
  LinkButton as SolidSpectrumLinkButton,
  Provider as SolidSpectrumProvider,
  SegmentedControl as SolidSpectrumSegmentedControl,
  SegmentedControlItem as SolidSpectrumSegmentedControlItem,
  SelectBox as SolidSpectrumSelectBox,
  SelectBoxGroup as SolidSpectrumSelectBoxGroup,
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

function numberParamFromWindow(name: string) {
  const value = queryParamFromWindow(name);
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function selectedKeysParamFromWindow(fallback: string[]) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

function iconPlacementFromWindow(): SingleButtonIconPlacement {
  if (typeof window === "undefined") {
    return "none";
  }

  const value = new URLSearchParams(window.location.search).get("iconPlacement");
  return value === "start" || value === "end" || value === "only" ? value : "none";
}

function solidSingleButtonFamilyChildren(
  label: string,
  iconPlacement: SingleButtonIconPlacement,
  textClass: () => string,
) {
  if (iconPlacement === "start") {
    return [
      () => h(SolidNewIcon, { "aria-hidden": "true" }),
      () => h("span", { class: textClass(), "data-rsp-slot": "text" }, label),
    ];
  }

  if (iconPlacement === "end") {
    return [
      () => h("span", { class: textClass(), "data-rsp-slot": "text" }, label),
      () => h(SolidNewIcon, { "aria-hidden": "true" }),
    ];
  }

  if (iconPlacement === "only") {
    return [() => h(SolidNewIcon, { "aria-hidden": "true" })];
  }

  return [() => h("span", { class: textClass(), "data-rsp-slot": "text" }, label)];
}

export const solidStyledFixtures: Partial<Record<ComparisonSlug, SolidStyledFixture>> = {
  provider: renderProviderDemo,
  button: () => h(SolidSpectrumButtonDemo, {}),
  actionbutton: () => h(SolidSpectrumActionButtonDemo, {}),
  actionbuttongroup: () => h(SolidSpectrumActionButtonGroupDemo, {}),
  buttongroup: () => h(SolidSpectrumButtonGroupDemo, {}),
  linkbutton: () => h(SolidSpectrumLinkButtonDemo, {}),
  cardview: () => h(SolidSpectrumCardViewDemo, {}),
  segmentedcontrol: () => h(SolidSpectrumSegmentedControlDemo, {}),
  selectboxgroup: () => h(SolidSpectrumSelectBoxGroupDemo, {}),
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
        : props.iconPlacement === "end"
          ? [
              () =>
                h(
                  "span",
                  {
                    class: s2ButtonText({ isProgressVisible: props.isPending }),
                    "data-rsp-slot": "text",
                  },
                  props.children,
                ),
              () => h(SolidNewIcon, { "aria-hidden": "true" }),
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
          get "data-comparison-button-props"() {
            return serializeButtonDemoProps(demoProps());
          },
        },
        [hc("div", { class: "comparison-button-row" }, [renderedButton])],
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
  const iconPlacement = iconPlacementFromWindow();
  const groupProps = {
    size: stringParamFromWindow("size", ["XS", "S", "M", "L", "XL"] as const, "M"),
    density: stringParamFromWindow("density", ["regular", "compact"] as const, "regular"),
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    isQuiet: booleanParamFromWindow("isQuiet"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    staticColor: stringParamFromWindow(
      "staticColor",
      ["white", "black", "auto"] as const,
      undefined,
    ),
  };
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(["bold"]),
  );
  const [actionKey, setActionKey] = createSignal("");
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  const toggleKey = (key: string) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };

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
        [
          hc(
            SolidSpectrumActionButtonGroup,
            {
              "aria-label": "Formatting actions",
              "data-comparison-group-root": "actionbuttongroup",
              "data-comparison-group-props": JSON.stringify({ ...groupProps, iconPlacement }),
              size: groupProps.size,
              density: groupProps.density,
              orientation: groupProps.orientation,
              isQuiet: groupProps.isQuiet,
              isJustified: groupProps.isJustified,
              isDisabled: groupProps.isDisabled,
              staticColor: groupProps.staticColor,
            },
            actionItems.map((item: ActionItem) =>
              hc(
                SolidSpectrumActionButton,
                {
                  ...(iconPlacement === "only" ? { "aria-label": item.label } : {}),
                  get "aria-pressed"() {
                    return selectedKeys().has(item.id);
                  },
                  onPress: (_event: unknown) => toggleKey(item.id),
                },
                solidSingleButtonFamilyChildren(item.label, iconPlacement, () =>
                  s2ActionButtonText({ isProgressVisible: false }),
                ),
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumButtonGroupDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const wrapWidth = numberParamFromWindow("wrapWidth");
  const groupProps = {
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    align: stringParamFromWindow("align", ["start", "end", "center"] as const, "start"),
    size: stringParamFromWindow("size", ["S", "M", "L", "XL"] as const, "M"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    wrapWidth,
  };
  const [actionKey, setActionKey] = createSignal("");

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
        [
          hc(
            SolidSpectrumButtonGroup,
            {
              "aria-label": "Approval actions",
              "data-comparison-group-root": "buttongroup",
              "data-comparison-group-props": JSON.stringify({ ...groupProps, iconPlacement }),
              orientation: groupProps.orientation,
              align: groupProps.align,
              size: groupProps.size,
              isDisabled: groupProps.isDisabled,
              UNSAFE_style: wrapWidth ? { width: `${wrapWidth}px` } : undefined,
            },
            [
              hc(
                SolidSpectrumButton,
                {
                  variant: "primary",
                  ...(iconPlacement === "only" ? { "aria-label": "Save" } : {}),
                  onPress: (_event: unknown) => setActionKey("save"),
                },
                solidSingleButtonFamilyChildren("Save", iconPlacement, () =>
                  s2ButtonText({ isProgressVisible: false }),
                ),
              ),
              hc(
                SolidSpectrumButton,
                {
                  variant: "secondary",
                  ...(iconPlacement === "only" ? { "aria-label": "Cancel" } : {}),
                  onPress: (_event: unknown) => setActionKey("cancel"),
                },
                solidSingleButtonFamilyChildren("Cancel", iconPlacement, () =>
                  s2ButtonText({ isProgressVisible: false }),
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumLinkButtonDemo() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const iconPlacement = iconPlacementFromWindow();

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
          class: "comparison-button-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [
          hc(
            SolidSpectrumLinkButton,
            {
              href: "https://example.com/docs",
              variant: "primary",
              fillStyle: "fill",
              ...(iconPlacement === "only" ? { "aria-label": "Open docs" } : {}),
            },
            solidSingleButtonFamilyChildren("Open docs", iconPlacement, () =>
              s2ButtonText({ isProgressVisible: false }),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const [selected, setSelected] = createSignal(booleanParamFromWindow("isSelected"));

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
        [
          hc(
            SolidSpectrumToggleButton,
            {
              ...(iconPlacement === "only" ? { "aria-label": "Pin" } : {}),
              get isSelected() {
                return selected();
              },
              onChange: setSelected,
            },
            solidSingleButtonFamilyChildren("Pin", iconPlacement, () => s2ToggleButtonText),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonGroupDemo() {
  const iconPlacement = iconPlacementFromWindow();
  const groupProps = {
    size: stringParamFromWindow("size", ["XS", "S", "M", "L", "XL"] as const, "M"),
    density: stringParamFromWindow("density", ["regular", "compact"] as const, "regular"),
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    isQuiet: booleanParamFromWindow("isQuiet"),
    isEmphasized: booleanParamFromWindow("isEmphasized"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
    staticColor: stringParamFromWindow(
      "staticColor",
      ["white", "black", "auto"] as const,
      undefined,
    ),
  };
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(["left"]),
  );
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
            SolidSpectrumToggleButtonGroup,
            {
              "aria-label": "Text alignment",
              "data-comparison-group-root": "togglebuttongroup",
              "data-comparison-group-props": JSON.stringify({ ...groupProps, iconPlacement }),
              selectionMode: "single",
              size: groupProps.size,
              density: groupProps.density,
              orientation: groupProps.orientation,
              isQuiet: groupProps.isQuiet,
              isEmphasized: groupProps.isEmphasized,
              isJustified: groupProps.isJustified,
              isDisabled: groupProps.isDisabled,
              staticColor: groupProps.staticColor,
              get selectedKeys() {
                return selectedKeys();
              },
              onSelectionChange: (keys: Set<string | number>) =>
                setSelectedKeys(new Set(Array.from(keys, String))),
            },
            [
              hc(
                SolidSpectrumToggleButton,
                {
                  id: "left",
                  ...(iconPlacement === "only" ? { "aria-label": "Left" } : {}),
                },
                solidSingleButtonFamilyChildren("Left", iconPlacement, () => s2ToggleButtonText),
              ),
              hc(
                SolidSpectrumToggleButton,
                {
                  id: "center",
                  ...(iconPlacement === "only" ? { "aria-label": "Center" } : {}),
                },
                solidSingleButtonFamilyChildren("Center", iconPlacement, () => s2ToggleButtonText),
              ),
              hc(
                SolidSpectrumToggleButton,
                {
                  id: "right",
                  ...(iconPlacement === "only" ? { "aria-label": "Right" } : {}),
                },
                solidSingleButtonFamilyChildren("Right", iconPlacement, () => s2ToggleButtonText),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumSegmentedControlDemo() {
  const demoProps = {
    selectedKey: stringParamFromWindow("selectedKey", ["list", "grid", "board"] as const, "list"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
  const [selectedKey, setSelectedKey] = createSignal(demoProps.selectedKey);
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
              "data-comparison-control-props": JSON.stringify(demoProps),
              isJustified: demoProps.isJustified,
              isDisabled: demoProps.isDisabled,
              get selectedKey() {
                return selectedKey();
              },
              onSelectionChange: (key: string | number) => setSelectedKey(String(key)),
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
  const demoProps = {
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    selectionMode: stringParamFromWindow(
      "selectionMode",
      ["single", "multiple"] as const,
      "single",
    ),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(
      demoProps.selectionMode === "multiple" ? ["starter", "pro"] : ["starter"],
    ),
  );
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
            SolidSpectrumSelectBoxGroup,
            {
              "aria-label": "Plans",
              "data-comparison-control-root": "selectboxgroup",
              "data-comparison-control-props": JSON.stringify(demoProps),
              orientation: demoProps.orientation,
              selectionMode: demoProps.selectionMode,
              isDisabled: demoProps.isDisabled,
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
