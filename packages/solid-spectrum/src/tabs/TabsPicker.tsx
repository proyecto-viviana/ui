// @ts-nocheck
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  Show,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  Popover as HeadlessPopover,
  Select as HeadlessSelect,
  SelectContext as HeadlessSelectContext,
  SelectListBox as HeadlessSelectListBox,
  SelectOption as HeadlessSelectOption,
  SelectTrigger as HeadlessSelectTrigger,
  SelectValue as HeadlessSelectValue,
  type SelectOptionProps as HeadlessSelectOptionProps,
  type SelectOptionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  baseColor,
  focusRing,
  lightDark,
  setColorScheme,
  style,
} from "../style" with { type: "macro" };
import { edgeToText } from "../style/spectrum-theme" with { type: "macro" };
import { controlFont, fieldInput } from "../s2-internal/style-utils" with { type: "macro" };
import { centerBaseline } from "../icon/center-baseline";
import { IconContext } from "../icon/spectrum-icon";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import ChevronIcon from "../icon/ui-icons/Chevron";
import {
  menuItem,
  menuItemCheckmark,
  menuItemIcon,
  menuItemIconCenterWrapper,
  menuItemLabel,
} from "../menu/s2-menu-styles";
import { useTheme } from "../provider";
import { TextContext } from "../text";
import type { TabsDensity, TabsLabelBehavior } from "./index";

export interface TabsPickerItem {
  id: Key;
  textValue: string;
  label: JSX.Element;
  isDisabled?: boolean;
}

export interface TabsPickerProps {
  id: string;
  valueId: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  density: TabsDensity;
  labelBehavior: TabsLabelBehavior;
  items: TabsPickerItem[];
  disabledKeys?: Iterable<Key>;
  selectedKey?: Key | null;
  isDisabled?: boolean;
  onSelectionChange?: (key: Key | null) => void;
}

interface TabsPickerStyleState {
  density: TabsDensity;
  labelBehavior?: TabsLabelBehavior;
  isDisabled?: boolean;
  isOpen?: boolean;
  isFocusVisible?: boolean;
  colorScheme?: "light" | "dark" | "light dark";
  placement?: string;
}

const tabsPickerRoot = style({
  display: "contents",
});

const tabsPickerButton = style<TabsPickerStyleState>({
  ...focusRing(),
  ...fieldInput(),
  outlineStyle: {
    default: "none",
    isFocusVisible: "solid",
  },
  position: "relative",
  font: "ui",
  display: "flex",
  textAlign: "start",
  borderStyle: "none",
  borderRadius: "sm",
  alignItems: "center",
  transition: "default",
  columnGap: "text-to-visual",
  paddingX: 0,
  backgroundColor: "transparent",
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
  maxWidth: "max",
  disableTapHighlight: true,
  height: {
    default: 48,
    density: {
      compact: 32,
    },
  },
  boxSizing: "border-box",
});

const tabsPickerValue = style({
  flexGrow: 0,
  truncate: true,
  display: "flex",
  alignItems: "center",
  height: "full",
});

const tabsPickerValueText = style<TabsPickerStyleState>({
  display: {
    default: "block",
    labelBehavior: {
      hide: "none",
    },
  },
  flexGrow: 1,
  truncate: true,
});

const tabsPickerChevron = style({
  flexShrink: 0,
  rotate: 90,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const tabsPickerMenu = style({
  outlineStyle: "none",
  display: "grid",
  gridTemplateColumns: [
    edgeToText(32),
    "auto",
    "auto",
    "minmax(0, 1fr)",
    "auto",
    "auto",
    "auto",
    edgeToText(32),
  ],
  boxSizing: "border-box",
  width: "full",
  maxHeight: "[inherit]",
  overflow: "auto",
  padding: 8,
  fontFamily: "sans",
  fontSize: controlFont(),
  margin: 0,
  listStyleType: "none",
});

const tabsPickerPopover = style<TabsPickerStyleState>({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "layer-2",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  boxShadow: "elevated",
  borderRadius: "lg",
  display: "flex",
  padding: 0,
  minHeight: 0,
  overflow: "visible",
  boxSizing: "border-box",
  isolation: "isolate",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
});

const tabsPickerFrame = style({
  display: "flex",
  width: "full",
  height: "full",
});

const tabsPickerLine = style<{ isDisabled?: boolean }>({
  backgroundColor: {
    default: "neutral",
    isDisabled: "disabled",
    forcedColors: {
      default: "Highlight",
      isDisabled: "GrayText",
    },
  },
  height: "[2px]",
  borderStyle: "none",
  borderRadius: "full",
  marginTop: "[-2px]",
  transitionDuration: 130,
  transitionTimingFunction: "in-out",
});

const tabsPickerIconCenterWrapper = style<TabsPickerStyleState>({
  display: "flex",
  gridArea: "icon",
  paddingStart: {
    labelBehavior: {
      hide: "[6px]",
    },
  },
});

function selectedText(item: TabsPickerItem | undefined) {
  return item?.textValue ?? "";
}

function TabsPickerPopover(props: { children: JSX.Element }) {
  const theme = useTheme();
  const selectContext = useContext(HeadlessSelectContext) as {
    state?: { close?: () => void };
    isOpen?: () => boolean;
    triggerRef?: () => HTMLElement | null;
    rootRef?: () => HTMLElement | null;
  } | null;
  const triggerRef = () =>
    selectContext?.triggerRef?.() ??
    selectContext?.rootRef?.()?.querySelector<HTMLElement>("button[aria-haspopup='listbox']") ??
    null;
  const [triggerWidth, setTriggerWidth] = createSignal<string | undefined>();

  const updateTriggerWidth = () => {
    const trigger = triggerRef();
    setTriggerWidth(trigger ? `${trigger.getBoundingClientRect().width}px` : undefined);
  };

  createEffect(() => {
    const trigger = triggerRef();
    if (!trigger) {
      setTriggerWidth(undefined);
      return;
    }

    updateTriggerWidth();
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateTriggerWidth);
    observer.observe(trigger);
    onCleanup(() => observer.disconnect());
  });

  const width = () => (triggerWidth() ? `calc(${triggerWidth()} - 24px)` : undefined);

  return (
    <HeadlessPopover
      trigger="Select"
      triggerRef={triggerRef}
      isOpen={selectContext?.isOpen?.() ?? false}
      onOpenChange={(open) => {
        if (!open) {
          selectContext?.state?.close?.();
        }
      }}
      placement="bottom start"
      offset={6}
      crossOffset={-12}
      shouldFlip
      autoFocus={false}
      class={(renderProps) =>
        tabsPickerPopover({
          ...renderProps,
          colorScheme: theme.colorScheme,
          isArrowShown: false,
          isSubmenu: false,
        })
      }
      style={() => ({
        minWidth: "192px",
        width: width(),
      })}
    >
      <div class={tabsPickerFrame}>{props.children}</div>
    </HeadlessPopover>
  );
}

function TabsPickerOption(props: HeadlessSelectOptionProps<TabsPickerItem>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["children"]);
  const iconContextValue = {
    slot: "icon",
    render: centerBaseline({ slot: "icon", styles: tabsPickerIconCenterWrapper({}) }),
    styles: menuItemIcon,
  };
  const textContextValue = {
    styles: menuItemLabel({ size: "M" }),
    "data-rsp-slot": "text",
  };
  const optionClass = (renderProps: SelectOptionRenderProps) =>
    menuItem({
      ...renderProps,
      size: "M",
      isLink: false,
    });

  return (
    <HeadlessSelectOption {...headlessProps} class={optionClass}>
      {(renderProps) => (
        <IconContext.Provider value={iconContextValue}>
          <TextContext.Provider value={textContextValue}>
            <CheckmarkIcon
              size="M"
              styles={menuItemCheckmark({
                isSelected: renderProps.isSelected,
                isDisabled: renderProps.isDisabled,
              })}
              aria-hidden="true"
            />
            <Show
              when={typeof local.children === "string" || typeof local.children === "number"}
              fallback={local.children}
            >
              <span class={menuItemLabel({ size: "M" })} data-rsp-slot="text">
                {local.children}
              </span>
            </Show>
          </TextContext.Provider>
        </IconContext.Provider>
      )}
    </HeadlessSelectOption>
  );
}

export function TabsPicker(props: TabsPickerProps): JSX.Element {
  const disabledKeys = createMemo(() => {
    const result = new Set<Key>(props.disabledKeys ?? []);
    for (const item of props.items) {
      if (item.isDisabled) {
        result.add(item.id);
      }
    }
    return result;
  });
  const selectedItem = createMemo(() => props.items.find((item) => item.id === props.selectedKey));
  const labelledBy = () =>
    [props.labelBehavior === "hide" ? props.valueId : undefined, props["aria-labelledby"]]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <HeadlessSelect
        id={props.id}
        items={props.items}
        getKey={(item) => item.id}
        getTextValue={(item) => item.textValue}
        getDisabled={(item) => item.isDisabled ?? false}
        disabledKeys={disabledKeys()}
        selectedKey={props.selectedKey ?? null}
        onSelectionChange={props.onSelectionChange}
        isDisabled={props.isDisabled}
        aria-label={props["aria-label"]}
        aria-labelledby={labelledBy()}
        aria-describedby={props["aria-describedby"]}
        aria-details={props["aria-details"]}
        class={tabsPickerRoot}
      >
        {() => (
          <>
            <HeadlessSelectTrigger
              class={(triggerProps) =>
                tabsPickerButton({
                  ...triggerProps,
                  density: props.density,
                  isOpen: triggerProps.isOpen,
                })
              }
            >
              {(triggerProps) => (
                <>
                  <HeadlessSelectValue class={tabsPickerValue}>
                    {() => (
                      <span
                        class={tabsPickerValueText({ labelBehavior: props.labelBehavior })}
                        data-rsp-slot="text"
                      >
                        {selectedText(selectedItem())}
                      </span>
                    )}
                  </HeadlessSelectValue>
                  <ChevronIcon
                    size="M"
                    styles={tabsPickerChevron}
                    aria-hidden="true"
                    data-open={triggerProps.isOpen ? "true" : undefined}
                  />
                </>
              )}
            </HeadlessSelectTrigger>
            <TabsPickerPopover>
              <HeadlessSelectListBox isInPopover class={tabsPickerMenu}>
                {(item: TabsPickerItem) => (
                  <TabsPickerOption id={item.id} item={item} textValue={item.textValue}>
                    {item.label}
                  </TabsPickerOption>
                )}
              </HeadlessSelectListBox>
            </TabsPickerPopover>
          </>
        )}
      </HeadlessSelect>
      <div class={tabsPickerLine({ isDisabled: props.isDisabled })} />
    </div>
  );
}
