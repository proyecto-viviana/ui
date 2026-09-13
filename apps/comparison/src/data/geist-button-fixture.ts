export const GEIST_BUTTON_VARIANTS = [
  "default",
  "secondary",
  "tertiary",
  "error",
  "warning",
] as const;

export const GEIST_BUTTON_SIZES = ["tiny", "small", "medium", "large"] as const;
export const GEIST_BUTTON_SHAPES = ["rounded", "square", "circle"] as const;
export const GEIST_COLOR_MODES = ["light", "dark"] as const;

export type GeistButtonVariant = (typeof GEIST_BUTTON_VARIANTS)[number];
export type GeistButtonSize = (typeof GEIST_BUTTON_SIZES)[number];
export type GeistButtonShape = (typeof GEIST_BUTTON_SHAPES)[number];
export type GeistColorMode = (typeof GEIST_COLOR_MODES)[number];

export interface GeistButtonFixtureState {
  variant: GeistButtonVariant;
  size: GeistButtonSize;
  shape: GeistButtonShape;
  mode: GeistColorMode;
  prefix: boolean;
  svgOnly: boolean;
  loading: boolean;
  disabled: boolean;
}

export const GEIST_BUTTON_FIXTURE_DEFAULTS: GeistButtonFixtureState = {
  variant: "default",
  size: "medium",
  shape: "rounded",
  mode: "light",
  prefix: false,
  svgOnly: false,
  loading: false,
  disabled: false,
};

export const GEIST_FIXTURE_STATE_MESSAGE = "viviana:geist-button-fixture-state";
export const GEIST_FIXTURE_READY_MESSAGE = "viviana:geist-button-fixture-ready";
export const GEIST_FIXTURE_STATE_EVENT = "viviana:geist-button-fixture-state";

export function isGeistButtonFixtureState(value: unknown): value is GeistButtonFixtureState {
  if (value == null || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;

  return (
    GEIST_BUTTON_VARIANTS.includes(state.variant as GeistButtonVariant) &&
    GEIST_BUTTON_SIZES.includes(state.size as GeistButtonSize) &&
    GEIST_BUTTON_SHAPES.includes(state.shape as GeistButtonShape) &&
    GEIST_COLOR_MODES.includes(state.mode as GeistColorMode) &&
    typeof state.prefix === "boolean" &&
    typeof state.svgOnly === "boolean" &&
    typeof state.loading === "boolean" &&
    typeof state.disabled === "boolean"
  );
}
