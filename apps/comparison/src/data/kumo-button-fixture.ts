export const KUMO_BUTTON_VARIANTS = [
  "primary",
  "secondary",
  "ghost",
  "destructive",
  "secondary-destructive",
  "outline",
] as const;

export const KUMO_BUTTON_SIZES = ["xs", "sm", "base", "lg"] as const;
export const KUMO_BUTTON_SHAPES = ["base", "square", "circle"] as const;
export const KUMO_COLOR_MODES = ["light", "dark"] as const;

export type KumoButtonVariant = (typeof KUMO_BUTTON_VARIANTS)[number];
export type KumoButtonSize = (typeof KUMO_BUTTON_SIZES)[number];
export type KumoButtonShape = (typeof KUMO_BUTTON_SHAPES)[number];
export type KumoColorMode = (typeof KUMO_COLOR_MODES)[number];

export interface KumoButtonFixtureState {
  variant: KumoButtonVariant;
  size: KumoButtonSize;
  shape: KumoButtonShape;
  mode: KumoColorMode;
  withIcon: boolean;
  loading: boolean;
  disabled: boolean;
}

export const KUMO_BUTTON_FIXTURE_DEFAULTS: KumoButtonFixtureState = {
  variant: "primary",
  size: "base",
  shape: "base",
  mode: "light",
  withIcon: true,
  loading: false,
  disabled: false,
};

export const KUMO_FIXTURE_STATE_MESSAGE = "viviana:kumo-button-fixture-state";
export const KUMO_FIXTURE_READY_MESSAGE = "viviana:kumo-button-fixture-ready";
export const KUMO_FIXTURE_STATE_EVENT = "viviana:kumo-button-fixture-state";

export function isKumoButtonFixtureState(value: unknown): value is KumoButtonFixtureState {
  if (value == null || typeof value !== "object") return false;
  const state = value as Record<string, unknown>;

  return (
    KUMO_BUTTON_VARIANTS.includes(state.variant as KumoButtonVariant) &&
    KUMO_BUTTON_SIZES.includes(state.size as KumoButtonSize) &&
    KUMO_BUTTON_SHAPES.includes(state.shape as KumoButtonShape) &&
    KUMO_COLOR_MODES.includes(state.mode as KumoColorMode) &&
    typeof state.withIcon === "boolean" &&
    typeof state.loading === "boolean" &&
    typeof state.disabled === "boolean"
  );
}
