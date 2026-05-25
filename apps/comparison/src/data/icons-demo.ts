export interface IconsDemoProps {
  ariaLabel: string;
  ariaHidden: boolean;
  slot: string;
  showDecorative: boolean;
  showSkeleton: boolean;
  showButtonContext: boolean;
  buttonLabel: string;
}

export const iconsDemoDefaults: IconsDemoProps = {
  ariaLabel: "Create item",
  ariaHidden: false,
  slot: "",
  showDecorative: true,
  showSkeleton: true,
  showButtonContext: true,
  buttonLabel: "Create",
};

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

function textProp(value: string | null | undefined, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function normalizeIconsDemoProps(props: Partial<IconsDemoProps> = {}): IconsDemoProps {
  return {
    ariaLabel: textProp(props.ariaLabel, iconsDemoDefaults.ariaLabel),
    ariaHidden: props.ariaHidden ?? iconsDemoDefaults.ariaHidden,
    slot: typeof props.slot === "string" ? props.slot : iconsDemoDefaults.slot,
    showDecorative: props.showDecorative ?? iconsDemoDefaults.showDecorative,
    showSkeleton: props.showSkeleton ?? iconsDemoDefaults.showSkeleton,
    showButtonContext: props.showButtonContext ?? iconsDemoDefaults.showButtonContext,
    buttonLabel: textProp(props.buttonLabel, iconsDemoDefaults.buttonLabel),
  };
}

export function iconsDemoPropsFromSearch(search: string): IconsDemoProps {
  const params = new URLSearchParams(search);

  return normalizeIconsDemoProps({
    ariaLabel: params.get("ariaLabel") || iconsDemoDefaults.ariaLabel,
    ariaHidden: params.has("ariaHidden")
      ? booleanParam(params.get("ariaHidden"))
      : iconsDemoDefaults.ariaHidden,
    slot: params.get("slot") ?? iconsDemoDefaults.slot,
    showDecorative: params.has("showDecorative")
      ? booleanParam(params.get("showDecorative"))
      : iconsDemoDefaults.showDecorative,
    showSkeleton: params.has("showSkeleton")
      ? booleanParam(params.get("showSkeleton"))
      : iconsDemoDefaults.showSkeleton,
    showButtonContext: params.has("showButtonContext")
      ? booleanParam(params.get("showButtonContext"))
      : iconsDemoDefaults.showButtonContext,
    buttonLabel: params.get("buttonLabel") || iconsDemoDefaults.buttonLabel,
  });
}

export function iconsDemoPropsFromWindow(): IconsDemoProps {
  if (typeof window === "undefined") {
    return iconsDemoDefaults;
  }

  return iconsDemoPropsFromSearch(window.location.search);
}

export function serializeIconsDemoProps(props: IconsDemoProps): string {
  return JSON.stringify(normalizeIconsDemoProps(props));
}
