export const imageSourceModeOptions = ["basic", "conditional", "error", "coordinator"] as const;
export const imageObjectFitOptions = ["cover", "contain"] as const;

export type ImageSourceMode = (typeof imageSourceModeOptions)[number];
export type ImageObjectFit = (typeof imageObjectFitOptions)[number];

export interface ImageDemoProps {
  alt: string;
  sourceMode: ImageSourceMode;
  objectFit: ImageObjectFit;
}

export const imageDemoDefaults: ImageDemoProps = {
  alt: "Gradient landscape",
  sourceMode: "basic",
  objectFit: "cover",
};

function svgDataUrl(primary: string, secondary: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 192"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient></defs><rect width="320" height="192" rx="18" fill="url(#g)"/><circle cx="250" cy="52" r="28" fill="rgba(255,255,255,.54)"/><path d="M0 150L72 92L124 128L178 72L320 156V192H0Z" fill="rgba(255,255,255,.42)"/><text x="24" y="42" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="rgba(255,255,255,.9)">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const imageDemoSources = {
  basic: svgDataUrl("#345bf8", "#0f172a", "Basic"),
  light: svgDataUrl("#7dd3fc", "#c084fc", "Light"),
  dark: svgDataUrl("#1e1b4b", "#0f766e", "Dark"),
  first: svgDataUrl("#0f766e", "#84cc16", "One"),
  second: svgDataUrl("#be123c", "#f97316", "Two"),
} as const;

export const imageMissingSource = "/__comparison-missing-image.png";

function isImageSourceMode(value: string | null | undefined): value is ImageSourceMode {
  return value != null && imageSourceModeOptions.includes(value as ImageSourceMode);
}

function isImageObjectFit(value: string | null | undefined): value is ImageObjectFit {
  return value != null && imageObjectFitOptions.includes(value as ImageObjectFit);
}

export function normalizeImageDemoProps(props: Partial<ImageDemoProps> = {}): ImageDemoProps {
  return {
    alt: typeof props.alt === "string" ? props.alt : imageDemoDefaults.alt,
    sourceMode: isImageSourceMode(props.sourceMode)
      ? props.sourceMode
      : imageDemoDefaults.sourceMode,
    objectFit: isImageObjectFit(props.objectFit) ? props.objectFit : imageDemoDefaults.objectFit,
  };
}

export function imageDemoPropsFromSearch(search: string): ImageDemoProps {
  const params = new URLSearchParams(search);
  const sourceMode = params.get("sourceMode");
  const objectFit = params.get("objectFit");

  return normalizeImageDemoProps({
    alt: params.get("alt") ?? imageDemoDefaults.alt,
    sourceMode: isImageSourceMode(sourceMode) ? sourceMode : imageDemoDefaults.sourceMode,
    objectFit: isImageObjectFit(objectFit) ? objectFit : imageDemoDefaults.objectFit,
  });
}

export function imageDemoPropsFromWindow(): ImageDemoProps {
  if (typeof window === "undefined") {
    return imageDemoDefaults;
  }

  return imageDemoPropsFromSearch(window.location.search);
}

export function serializeImageDemoProps(props: ImageDemoProps): string {
  return JSON.stringify(normalizeImageDemoProps(props));
}
