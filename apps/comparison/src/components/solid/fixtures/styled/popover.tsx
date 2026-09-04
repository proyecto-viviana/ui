import h from "solid-js/h";
import { createSignal, onCleanup, onMount } from "solid-js";
import { hc } from "../../solid-h";
import {
  Button as SolidSpectrumButton,
  DialogTrigger as SolidSpectrumDialogTrigger,
  Form as SolidSpectrumForm,
  Popover as SolidSpectrumPopover,
  Provider as SolidSpectrumProvider,
  Switch as SolidSpectrumSwitch,
  TextField as SolidSpectrumTextField,
} from "@proyecto-viviana/solid-spectrum";
import {
  isPopoverOpenControlChecked,
  normalizePopoverDemoProps,
  popoverDemoPropsFromWindow,
  serializePopoverDemoProps,
  type PopoverDemoProps,
  comparisonControlsEvent,
} from "@comparison/data/popover-demo";
import { createComparisonResolvedThemeSignal, providerShellStyle } from "../styled-shared.tsx";

function SolidSpectrumPopoverDemo() {
  const [demoProps, setDemoProps] = createSignal<PopoverDemoProps>(popoverDemoPropsFromWindow());
  const colorScheme = createComparisonResolvedThemeSignal();
  let anchorElement: HTMLDivElement | null = null;

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "popover") {
        setDemoProps(normalizePopoverDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const updateOpen = (nextOpen: boolean) => {
    setDemoProps((current) =>
      current.isOpen && !nextOpen && isPopoverOpenControlChecked()
        ? current
        : normalizePopoverDemoProps({ ...current, isOpen: nextOpen }),
    );
  };
  const popoverMaxHeight = () => (demoProps().maxHeight === "" ? undefined : demoProps().maxHeight);
  const popoverSize = () => (demoProps().size === "fit" ? undefined : demoProps().size);
  const popoverForm = () =>
    demoProps().showForm
      ? hc(SolidSpectrumForm, {}, [
          hc(SolidSpectrumTextField, {
            label: "Subject",
            placeholder: "Enter a summary",
          }),
          hc(SolidSpectrumTextField, {
            label: "Description",
            isRequired: true,
            placeholder: "Enter your feedback",
          }),
          hc(SolidSpectrumSwitch, {}, [
            "Adobe can contact me for further questions concerning this feedback",
          ]),
          hc(SolidSpectrumButton, { variant: "accent" }, ["Submit"]),
        ])
      : null;
  const popoverContent = () =>
    hc("div", { style: popoverContentStyle }, [
      hc("p", { style: popoverBodyTextStyle }, [() => demoProps().bodyText]),
      popoverForm,
    ]);
  const popoverProps = {
    get placement() {
      return demoProps().placement;
    },
    get offset() {
      return demoProps().offset;
    },
    get crossOffset() {
      return demoProps().crossOffset;
    },
    get containerPadding() {
      return demoProps().containerPadding;
    },
    get shouldFlip() {
      return demoProps().shouldFlip;
    },
    get hideArrow() {
      return demoProps().hideArrow;
    },
    get maxHeight() {
      return popoverMaxHeight();
    },
    get size() {
      return popoverSize();
    },
    get "aria-label"() {
      return demoProps().ariaLabel;
    },
  };
  const dialogTriggerContent = () =>
    hc(
      SolidSpectrumDialogTrigger,
      {
        get isOpen() {
          return demoProps().isOpen;
        },
        onOpenChange: updateOpen,
      },
      [
        hc(SolidSpectrumButton, { variant: "secondary" }, [() => demoProps().triggerLabel]),
        hc(SolidSpectrumPopover, popoverProps, [popoverContent]),
      ],
    );
  const customAnchorContent = () => [
    hc(
      SolidSpectrumButton,
      {
        variant: "secondary",
        onPress: () => updateOpen(!demoProps().isOpen),
      },
      [
        () =>
          demoProps().isOpen
            ? `Close ${demoProps().triggerLabel}`
            : `Open ${demoProps().triggerLabel}`,
      ],
    ),
    hc(
      "div",
      {
        ref: (element: HTMLDivElement) => {
          anchorElement = element;
        },
        style: popoverAnchorStyle,
      },
      ["Popover anchor"],
    ),
    hc(
      SolidSpectrumPopover,
      {
        get placement() {
          return demoProps().placement;
        },
        get offset() {
          return demoProps().offset;
        },
        get crossOffset() {
          return demoProps().crossOffset;
        },
        get containerPadding() {
          return demoProps().containerPadding;
        },
        get shouldFlip() {
          return demoProps().shouldFlip;
        },
        get hideArrow() {
          return demoProps().hideArrow;
        },
        get maxHeight() {
          return popoverMaxHeight();
        },
        get size() {
          return popoverSize();
        },
        get "aria-label"() {
          return demoProps().ariaLabel;
        },
        get isOpen() {
          return demoProps().isOpen;
        },
        onOpenChange: updateOpen,
        triggerRef: () => anchorElement,
      },
      [popoverContent],
    ),
  ];
  const routedPopoverContent = () =>
    demoProps().triggerMode === "dialogTrigger" ? dialogTriggerContent() : customAnchorContent();

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
          style: popoverFixtureStyle,
          "data-comparison-control-root": "popover",
          get "data-comparison-control-props"() {
            return serializePopoverDemoProps(demoProps());
          },
          get "data-comparison-open"() {
            return String(demoProps().isOpen);
          },
          get "data-comparison-popover-trigger-mode"() {
            return demoProps().triggerMode;
          },
        },
        [routedPopoverContent],
      ),
    ],
  );
}

const popoverFixtureStyle = {
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  gap: "16px",
  "min-height": "360px",
  width: "420px",
  padding: "12px",
};

const popoverAnchorStyle = {
  padding: "8px",
  "border-radius": "8px",
  background: "color-mix(in srgb, CanvasText 8%, Canvas)",
  font: "13px system-ui, sans-serif",
};

const popoverContentStyle = {
  width: "300px",
  padding: "12px",
};

const popoverBodyTextStyle = {
  margin: "0 0 12px",
  font: "14px system-ui, sans-serif",
};

export default () => h(SolidSpectrumPopoverDemo, {});
