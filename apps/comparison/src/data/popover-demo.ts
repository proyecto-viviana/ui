import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const popoverTriggerModeOptions = ["dialogTrigger", "customAnchor"] as const;
export const popoverPlacementOptions = [
  "bottom",
  "bottom start",
  "bottom end",
  "top",
  "top start",
  "top end",
  "right",
  "left",
] as const;
export const popoverSizeOptions = ["fit", "S", "M", "L"] as const;

export type PopoverDemoTriggerMode = (typeof popoverTriggerModeOptions)[number];
export type PopoverDemoPlacement = (typeof popoverPlacementOptions)[number];
export type PopoverDemoSize = (typeof popoverSizeOptions)[number];
export type PopoverDemoMaxHeight = number | "";

export interface PopoverDemoProps {
  triggerMode: PopoverDemoTriggerMode;
  triggerLabel: string;
  ariaLabel: string;
  bodyText: string;
  placement: PopoverDemoPlacement;
  size: PopoverDemoSize;
  offset: number;
  crossOffset: number;
  containerPadding: number;
  maxHeight: PopoverDemoMaxHeight;
  isOpen: boolean;
  shouldFlip: boolean;
  hideArrow: boolean;
  showForm: boolean;
}

export const popoverDemoDefaults: PopoverDemoProps = {
  triggerMode: "dialogTrigger",
  triggerLabel: "Feedback",
  ariaLabel: "Feedback",
  bodyText: "How are we doing? Share your feedback here.",
  placement: "bottom start",
  size: "fit",
  offset: 8,
  crossOffset: 0,
  containerPadding: 12,
  maxHeight: "",
  isOpen: false,
  shouldFlip: true,
  hideArrow: false,
  showForm: true,
};

const popoverSearchParamKeys = [
  "triggerMode",
  "triggerLabel",
  "ariaLabel",
  "bodyText",
  "placement",
  "size",
  "offset",
  "crossOffset",
  "containerPadding",
  "maxHeight",
  "isOpen",
  "shouldFlip",
  "hideArrow",
  "showForm",
] as const satisfies readonly (keyof PopoverDemoProps)[];

function hasPopoverSearchParams(search: string) {
  const params = new URLSearchParams(search);
  return popoverSearchParamKeys.some((key) => params.has(key));
}

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | boolean | number | null | undefined) {
  return value === true || value === "true" || value === "on" || value === "1" || value === 1;
}

function numberParam(value: string | number | null | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function optionalNumberParam(
  value: string | number | null | undefined,
  fallback: PopoverDemoMaxHeight,
): PopoverDemoMaxHeight {
  if (value == null || value === "") {
    return fallback;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizePopoverDemoProps(
  props: Partial<Record<keyof PopoverDemoProps, unknown>>,
): PopoverDemoProps {
  const triggerMode = String(props.triggerMode ?? "");
  const placement = String(props.placement ?? "");
  const size = String(props.size ?? "");

  return {
    triggerMode: isOneOf(triggerMode, popoverTriggerModeOptions)
      ? triggerMode
      : popoverDemoDefaults.triggerMode,
    triggerLabel:
      typeof props.triggerLabel === "string" && props.triggerLabel.trim()
        ? props.triggerLabel
        : popoverDemoDefaults.triggerLabel,
    ariaLabel:
      typeof props.ariaLabel === "string" && props.ariaLabel.trim()
        ? props.ariaLabel
        : popoverDemoDefaults.ariaLabel,
    bodyText:
      typeof props.bodyText === "string" && props.bodyText.trim()
        ? props.bodyText
        : popoverDemoDefaults.bodyText,
    placement: isOneOf(placement, popoverPlacementOptions)
      ? placement
      : popoverDemoDefaults.placement,
    size: isOneOf(size, popoverSizeOptions) ? size : popoverDemoDefaults.size,
    offset: numberParam(
      props.offset as string | number | null | undefined,
      popoverDemoDefaults.offset,
    ),
    crossOffset: numberParam(
      props.crossOffset as string | number | null | undefined,
      popoverDemoDefaults.crossOffset,
    ),
    containerPadding: numberParam(
      props.containerPadding as string | number | null | undefined,
      popoverDemoDefaults.containerPadding,
    ),
    maxHeight: optionalNumberParam(
      props.maxHeight as string | number | null | undefined,
      popoverDemoDefaults.maxHeight,
    ),
    isOpen:
      props.isOpen == null
        ? popoverDemoDefaults.isOpen
        : booleanParam(props.isOpen as string | boolean | number | null | undefined),
    shouldFlip:
      props.shouldFlip == null
        ? popoverDemoDefaults.shouldFlip
        : booleanParam(props.shouldFlip as string | boolean | number | null | undefined),
    hideArrow: booleanParam(props.hideArrow as string | boolean | number | null | undefined),
    showForm:
      props.showForm == null
        ? popoverDemoDefaults.showForm
        : booleanParam(props.showForm as string | boolean | number | null | undefined),
  };
}

export function popoverDemoPropsFromSearch(search: string): PopoverDemoProps {
  const params = new URLSearchParams(search);

  return normalizePopoverDemoProps({
    triggerMode: params.get("triggerMode") ?? undefined,
    triggerLabel: params.get("triggerLabel") ?? undefined,
    ariaLabel: params.get("ariaLabel") ?? undefined,
    bodyText: params.get("bodyText") ?? undefined,
    placement: params.get("placement") ?? undefined,
    size: params.get("size") ?? undefined,
    offset: params.get("offset") ?? undefined,
    crossOffset: params.get("crossOffset") ?? undefined,
    containerPadding: params.get("containerPadding") ?? undefined,
    maxHeight: params.get("maxHeight") ?? undefined,
    isOpen: params.get("isOpen") ?? undefined,
    shouldFlip: params.has("shouldFlip")
      ? params.get("shouldFlip")
      : popoverDemoDefaults.shouldFlip,
    hideArrow: params.get("hideArrow") ?? undefined,
    showForm: params.has("showForm") ? params.get("showForm") : popoverDemoDefaults.showForm,
  });
}

export function popoverDemoPropsFromDocument(): PopoverDemoProps | null {
  if (typeof document === "undefined") {
    return null;
  }

  const form = document.querySelector<HTMLFormElement>('[data-comparison-controls="popover"]');
  if (!form) {
    return null;
  }

  const data = new FormData(form);
  return normalizePopoverDemoProps({
    triggerMode: data.get("triggerMode") ?? popoverDemoDefaults.triggerMode,
    triggerLabel: data.get("triggerLabel") ?? popoverDemoDefaults.triggerLabel,
    ariaLabel: data.get("ariaLabel") ?? popoverDemoDefaults.ariaLabel,
    bodyText: data.get("bodyText") ?? popoverDemoDefaults.bodyText,
    placement: data.get("placement") ?? popoverDemoDefaults.placement,
    size: data.get("size") ?? popoverDemoDefaults.size,
    offset: data.get("offset") ?? popoverDemoDefaults.offset,
    crossOffset: data.get("crossOffset") ?? popoverDemoDefaults.crossOffset,
    containerPadding: data.get("containerPadding") ?? popoverDemoDefaults.containerPadding,
    maxHeight: data.get("maxHeight") ?? popoverDemoDefaults.maxHeight,
    isOpen: data.get("isOpen") === "on",
    shouldFlip: data.get("shouldFlip") === "on",
    hideArrow: data.get("hideArrow") === "on",
    showForm: data.get("showForm") === "on",
  });
}

export function isPopoverOpenControlChecked() {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.querySelector<HTMLInputElement>(
      '[data-comparison-controls="popover"] input[name="isOpen"]',
    )?.checked === true
  );
}

export function popoverDemoPropsFromWindow(): PopoverDemoProps {
  if (typeof window === "undefined") {
    return popoverDemoDefaults;
  }

  const formProps = popoverDemoPropsFromDocument();
  if (formProps) {
    return formProps;
  }

  if (hasPopoverSearchParams(window.location.search)) {
    return popoverDemoPropsFromSearch(window.location.search);
  }

  return popoverDemoDefaults;
}

export function serializePopoverDemoProps(props: PopoverDemoProps) {
  return JSON.stringify({
    triggerMode: props.triggerMode,
    triggerLabel: props.triggerLabel,
    ariaLabel: props.ariaLabel,
    bodyText: props.bodyText,
    placement: props.placement,
    size: props.size,
    offset: props.offset,
    crossOffset: props.crossOffset,
    containerPadding: props.containerPadding,
    maxHeight: props.maxHeight,
    isOpen: props.isOpen,
    shouldFlip: props.shouldFlip,
    hideArrow: props.hideArrow,
    showForm: props.showForm,
  });
}
