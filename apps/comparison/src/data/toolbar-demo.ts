export const toolbarOrientationOptions = ["horizontal", "vertical"] as const;
// "flat" = the toolbar holds its controls directly (Bold / Italic / a Size text
// input / Underline). The text input is deliberate: upstream `useToolbar`
// (react-aria 3.50) has NO text-input guard, so an Arrow key pressed while the
// input has focus moves focus to the NEXT toolbar control (and preventDefaults
// the caret) — the flat walk passes through the input to certify the port
// dropped its invented guard. "nested" = the controls sit inside a child
// Toolbar, which upstream downgrades to `role="group"` while STILL emitting
// `aria-orientation` — the D6 case that certifies the nested-orientation fix.
export const toolbarContentOptions = ["flat", "nested"] as const;
// ar-AE is the D10 (RTL/i18n) driver's pinned locale (see certification.md). The
// Toolbar fixture routes `?locale` into the S2 `Provider` (React) /
// SolidSpectrumProvider (Solid) so the D10 RTL driver can re-run the horizontal
// D5 walk mirrored, certifying `useToolbar`'s `shouldReverse = rtl && horizontal`
// ArrowLeft/ArrowRight flip.
export const toolbarDemoLocaleOptions = ["en-US", "ar-AE"] as const;

export type ToolbarDemoOrientation = (typeof toolbarOrientationOptions)[number];
export type ToolbarDemoContent = (typeof toolbarContentOptions)[number];
export type ToolbarDemoLocale = (typeof toolbarDemoLocaleOptions)[number];

export interface ToolbarDemoItem {
  id: string;
  label: string;
}

/** The flat controls, in DOM order. "size" is a native text input; the rest are
 *  buttons. Order is load-bearing for the focus-trail walk. */
export const toolbarDemoItems: ToolbarDemoItem[] = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "size", label: "Size" },
  { id: "underline", label: "Underline" },
];

/** The nested grouping: each inner array is one child Toolbar (role=group). */
export const toolbarNestedGroups: { id: string; items: ToolbarDemoItem[] }[] = [
  {
    id: "style",
    items: [
      { id: "bold", label: "Bold" },
      { id: "italic", label: "Italic" },
    ],
  },
  {
    id: "decoration",
    items: [{ id: "underline", label: "Underline" }],
  },
];

export interface ToolbarDemoProps {
  orientation: ToolbarDemoOrientation;
  content: ToolbarDemoContent;
}

export const toolbarDemoDefaults: ToolbarDemoProps = {
  orientation: "horizontal",
  content: "flat",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeToolbarDemoProps(props: Partial<ToolbarDemoProps> = {}): ToolbarDemoProps {
  return {
    orientation: isOneOf(props.orientation, toolbarOrientationOptions)
      ? props.orientation
      : toolbarDemoDefaults.orientation,
    content: isOneOf(props.content, toolbarContentOptions)
      ? props.content
      : toolbarDemoDefaults.content,
  };
}

export function toolbarDemoPropsFromSearch(search: string): ToolbarDemoProps {
  const params = new URLSearchParams(search);
  const orientation = params.get("orientation");
  const content = params.get("content");
  return normalizeToolbarDemoProps({
    orientation: isOneOf(orientation, toolbarOrientationOptions) ? orientation : undefined,
    content: isOneOf(content, toolbarContentOptions) ? content : undefined,
  });
}

export function toolbarDemoPropsFromWindow(): ToolbarDemoProps {
  if (typeof window === "undefined") {
    return toolbarDemoDefaults;
  }
  return toolbarDemoPropsFromSearch(window.location.search);
}

export function serializeToolbarDemoProps(props: ToolbarDemoProps): string {
  return JSON.stringify(normalizeToolbarDemoProps(props));
}

// Locale is threaded separately from the demo props: the D10 (RTL/i18n) driver
// re-mounts the fixture with `?locale=ar-AE` so the Provider computes an rtl
// direction, certifying the RTL-flipped ArrowLeft/ArrowRight nav.
export function toolbarDemoLocaleFromSearch(search: string): ToolbarDemoLocale | undefined {
  const locale = new URLSearchParams(search).get("locale");
  return isOneOf(locale, toolbarDemoLocaleOptions) ? locale : undefined;
}

export function toolbarDemoLocaleFromWindow(): ToolbarDemoLocale | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return toolbarDemoLocaleFromSearch(window.location.search);
}

export { comparisonControlsEvent } from "./button-demo";
