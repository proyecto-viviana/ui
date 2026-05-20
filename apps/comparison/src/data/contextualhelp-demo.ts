import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const contextualHelpVariantOptions = ["help", "info"] as const;
export const contextualHelpSizeOptions = ["XS", "S"] as const;
export const contextualHelpPlacementOptions = [
  "bottom start",
  "bottom end",
  "top start",
  "top end",
  "right",
  "left",
] as const;

export type ContextualHelpDemoVariant = (typeof contextualHelpVariantOptions)[number];
export type ContextualHelpDemoSize = (typeof contextualHelpSizeOptions)[number];
export type ContextualHelpDemoPlacement = (typeof contextualHelpPlacementOptions)[number];

export interface ContextualHelpDemoProps {
  triggerLabel: string;
  heading: string;
  content: string;
  variant: ContextualHelpDemoVariant;
  size: ContextualHelpDemoSize;
  placement: ContextualHelpDemoPlacement;
  offset: number;
  crossOffset: number;
  containerPadding: number;
  isOpen: boolean;
  shouldFlip: boolean;
}

export const contextualHelpDemoDefaults: ContextualHelpDemoProps = {
  triggerLabel: "Contextual help",
  heading: "Permission required",
  content: "Your admin must grant permission before this action is available.",
  variant: "help",
  size: "XS",
  placement: "bottom start",
  offset: 8,
  crossOffset: 0,
  containerPadding: 12,
  isOpen: false,
  shouldFlip: true,
};

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

export function normalizeContextualHelpDemoProps(
  props: Partial<Record<keyof ContextualHelpDemoProps, unknown>>,
): ContextualHelpDemoProps {
  const variant = String(props.variant ?? "");
  const size = String(props.size ?? "");
  const placement = String(props.placement ?? "");

  return {
    triggerLabel:
      typeof props.triggerLabel === "string" && props.triggerLabel.trim()
        ? props.triggerLabel
        : contextualHelpDemoDefaults.triggerLabel,
    heading:
      typeof props.heading === "string" && props.heading.trim()
        ? props.heading
        : contextualHelpDemoDefaults.heading,
    content:
      typeof props.content === "string" && props.content.trim()
        ? props.content
        : contextualHelpDemoDefaults.content,
    variant: isOneOf(variant, contextualHelpVariantOptions)
      ? variant
      : contextualHelpDemoDefaults.variant,
    size: isOneOf(size, contextualHelpSizeOptions) ? size : contextualHelpDemoDefaults.size,
    placement: isOneOf(placement, contextualHelpPlacementOptions)
      ? placement
      : contextualHelpDemoDefaults.placement,
    offset: numberParam(
      props.offset as string | number | null | undefined,
      contextualHelpDemoDefaults.offset,
    ),
    crossOffset: numberParam(
      props.crossOffset as string | number | null | undefined,
      contextualHelpDemoDefaults.crossOffset,
    ),
    containerPadding: numberParam(
      props.containerPadding as string | number | null | undefined,
      contextualHelpDemoDefaults.containerPadding,
    ),
    isOpen: booleanParam(props.isOpen as string | boolean | number | null | undefined),
    shouldFlip:
      props.shouldFlip == null
        ? contextualHelpDemoDefaults.shouldFlip
        : booleanParam(props.shouldFlip as string | boolean | number | null | undefined),
  };
}

export function contextualHelpDemoPropsFromSearch(search: string): ContextualHelpDemoProps {
  const params = new URLSearchParams(search);

  return normalizeContextualHelpDemoProps({
    triggerLabel: params.get("triggerLabel") ?? undefined,
    heading: params.get("heading") ?? undefined,
    content: params.get("content") ?? undefined,
    variant: params.get("variant") ?? undefined,
    size: params.get("size") ?? undefined,
    placement: params.get("placement") ?? undefined,
    offset: params.get("offset") ?? undefined,
    crossOffset: params.get("crossOffset") ?? undefined,
    containerPadding: params.get("containerPadding") ?? undefined,
    isOpen: params.get("isOpen") ?? undefined,
    shouldFlip: params.has("shouldFlip")
      ? params.get("shouldFlip")
      : contextualHelpDemoDefaults.shouldFlip,
  });
}

export function contextualHelpDemoPropsFromDocument(): ContextualHelpDemoProps | null {
  if (typeof document === "undefined") {
    return null;
  }

  const form = document.querySelector<HTMLFormElement>(
    '[data-comparison-controls="contextualhelp"]',
  );
  if (!form) {
    return null;
  }

  const data = new FormData(form);
  return normalizeContextualHelpDemoProps({
    triggerLabel: data.get("triggerLabel") ?? contextualHelpDemoDefaults.triggerLabel,
    heading: data.get("heading") ?? contextualHelpDemoDefaults.heading,
    content: data.get("content") ?? contextualHelpDemoDefaults.content,
    variant: data.get("variant") ?? contextualHelpDemoDefaults.variant,
    size: data.get("size") ?? contextualHelpDemoDefaults.size,
    placement: data.get("placement") ?? contextualHelpDemoDefaults.placement,
    offset: data.get("offset") ?? contextualHelpDemoDefaults.offset,
    crossOffset: data.get("crossOffset") ?? contextualHelpDemoDefaults.crossOffset,
    containerPadding: data.get("containerPadding") ?? contextualHelpDemoDefaults.containerPadding,
    isOpen: data.get("isOpen") === "on",
    shouldFlip: data.get("shouldFlip") === "on",
  });
}

export function isContextualHelpOpenControlChecked() {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    document.querySelector<HTMLInputElement>(
      '[data-comparison-controls="contextualhelp"] input[name="isOpen"]',
    )?.checked === true
  );
}

export function contextualHelpDemoPropsFromWindow(): ContextualHelpDemoProps {
  if (typeof window === "undefined") {
    return contextualHelpDemoDefaults;
  }

  const formProps = contextualHelpDemoPropsFromDocument();
  if (formProps) {
    return formProps;
  }

  return contextualHelpDemoPropsFromSearch(window.location.search);
}

export function serializeContextualHelpDemoProps(props: ContextualHelpDemoProps) {
  return JSON.stringify({
    triggerLabel: props.triggerLabel,
    heading: props.heading,
    content: props.content,
    variant: props.variant,
    size: props.size,
    placement: props.placement,
    offset: props.offset,
    crossOffset: props.crossOffset,
    containerPadding: props.containerPadding,
    isOpen: props.isOpen,
    shouldFlip: props.shouldFlip,
  });
}
