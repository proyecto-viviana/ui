// Virtualizer pair-comparison surface. The Virtualizer has no standalone
// styled S2 oracle (S2 keeps its Virtualizer private) — the React oracle is
// react-aria-components' own `Virtualizer` + `ListLayout` wrapping a base
// `ListBox`, diffed against our solidaria-components `Virtualizer` wrapping the
// headless `ListBox`/`ListBoxOption` port. The certifiable contract is the
// scroll-window behavior: as a fixed-height virtualized list scrolls, the same
// items become visible at the same scroll offsets, off-screen items are not all
// rendered (virtualization actually happens), and scroll height matches the full
// content extent. See comparison-manifest.ts "virtualizer" entry and
// e2e/certified/virtualizer.certified.spec.ts.

export const virtualizerSelectionModeOptions = ["single", "multiple", "none"] as const;

export type VirtualizerDemoSelectionMode = (typeof virtualizerSelectionModeOptions)[number];

/**
 * Shared scroll geometry — imported by BOTH the React and Solid fixtures so the
 * two stacks produce identical viewports and content extents. The row height is
 * forced onto each option via inline style in both fixtures (RAC positions rows
 * via `ListLayout`'s `rowSize`; our port slices + spacer-pads by `itemSize`), so
 * the strictly-visible window at any given scrollTop is geometry-determined and
 * buffer-agnostic (overscan items sit off-screen and are excluded by the driver's
 * rect-intersection test).
 */
export const virtualizerRowHeight = 40;
export const virtualizerViewportHeight = 240;
export const virtualizerItemCount = 60;

export interface VirtualizerDemoItem {
  id: string;
  label: string;
}

export const virtualizerDemoItems: VirtualizerDemoItem[] = Array.from(
  { length: virtualizerItemCount },
  (_, index) => ({ id: `item-${index}`, label: `Item ${index}` }),
);

export interface VirtualizerDemoProps {
  selectionMode: VirtualizerDemoSelectionMode;
}

export const virtualizerDemoDefaults: VirtualizerDemoProps = {
  selectionMode: "single",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeVirtualizerDemoProps(
  props: Partial<VirtualizerDemoProps> = {},
): VirtualizerDemoProps {
  return {
    selectionMode: isOneOf(props.selectionMode, virtualizerSelectionModeOptions)
      ? props.selectionMode
      : virtualizerDemoDefaults.selectionMode,
  };
}

export function virtualizerDemoPropsFromSearch(search: string): VirtualizerDemoProps {
  const params = new URLSearchParams(search);
  const selectionMode = params.get("selectionMode");

  return normalizeVirtualizerDemoProps({
    selectionMode: isOneOf(selectionMode, virtualizerSelectionModeOptions)
      ? selectionMode
      : virtualizerDemoDefaults.selectionMode,
  });
}

export function virtualizerDemoPropsFromWindow(): VirtualizerDemoProps {
  if (typeof window === "undefined") {
    return virtualizerDemoDefaults;
  }

  return virtualizerDemoPropsFromSearch(window.location.search);
}

export function serializeVirtualizerDemoProps(props: VirtualizerDemoProps): string {
  return JSON.stringify(normalizeVirtualizerDemoProps(props));
}

export { comparisonControlsEvent } from "./button-demo";
