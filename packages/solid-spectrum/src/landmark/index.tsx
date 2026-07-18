import { type JSX, splitProps, Show } from "solid-js";
import {
  Landmark as HeadlessLandmark,
  useLandmarkController,
  type LandmarkProps as HeadlessLandmarkProps,
  type AriaLandmarkRole,
  type LandmarkController,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export interface LandmarkProps extends Omit<HeadlessLandmarkProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
  /** Whether to show a visual indicator (for development). */
  showLabel?: boolean;
}

export type { AriaLandmarkRole, LandmarkController };

const roleLabels: Record<AriaLandmarkRole, string> = {
  main: "Main",
  navigation: "Navigation",
  search: "Search",
  banner: "Banner",
  contentinfo: "Footer",
  complementary: "Aside",
  form: "Form",
  region: "Region",
};

// Tailwind-removal: the dev-only landmark visualization (a dashed wrapper outline
// plus a floating role label) previously leaned on an invented `bg-<semantic>/10
// border-<semantic>` palette. Those map onto S2 design tokens directly — each role
// gets a translucent `-subtle` fill for the label and a numeric border step for the
// dashed wrapper — and the fixed `text-primary-200` label text becomes the neutral
// text token. Emitting through the `style()` macro means the CSS ships in the
// package bundle rather than depending on a Tailwind backfill.
const landmarkWrapper = style<{ showLabel: boolean; role: AriaLandmarkRole }>({
  position: "relative",
  borderStyle: "dashed",
  borderWidth: { default: 0, showLabel: 2 },
  borderColor: {
    role: {
      main: "accent-300",
      navigation: "blue-400",
      search: "notice-400",
      banner: "positive-400",
      contentinfo: "negative-400",
      complementary: "blue-300",
      form: "accent-200",
      region: "gray-300",
    },
  },
});

const landmarkLabel = style<{ role: AriaLandmarkRole }>({
  position: "absolute",
  top: "[-12px]",
  insetStart: 8,
  paddingX: 8,
  paddingY: 2,
  fontSize: "ui-xs",
  fontWeight: "medium",
  borderRadius: "default",
  color: "neutral",
  backgroundColor: {
    role: {
      main: "accent-subtle",
      navigation: "blue-subtle",
      search: "notice-subtle",
      banner: "positive-subtle",
      contentinfo: "negative-subtle",
      complementary: "blue-subtle",
      form: "accent-subtle",
      region: "gray-subtle",
    },
  },
});

const landmarkLabelDetail = style({ color: "neutral-subdued" });

/**
 * A landmark is a region of the page that helps screen reader users navigate.
 * Press F6 to cycle through landmarks, or Shift+F6 to go backwards.
 *
 * @example
 * ```tsx
 * // Main content area
 * <Landmark role="main" aria-label="Main content">
 *   <h1>Welcome</h1>
 *   <p>Page content here...</p>
 * </Landmark>
 *
 * // Navigation
 * <Landmark role="navigation" aria-label="Primary navigation">
 *   <nav>...</nav>
 * </Landmark>
 *
 * // With development label visible
 * <Landmark role="main" aria-label="Main content" showLabel>
 *   ...
 * </Landmark>
 * ```
 */
export function Landmark(props: LandmarkProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "showLabel"]);

  const role = (): AriaLandmarkRole => headlessProps.role;

  const wrapperClass = (): string =>
    [landmarkWrapper({ showLabel: !!local.showLabel, role: role() }), local.class]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessLandmark {...headlessProps} class={wrapperClass()}>
      <Show when={local.showLabel}>
        <div class={landmarkLabel({ role: role() })}>
          {roleLabels[role()]}
          <Show when={headlessProps["aria-label"]}>
            <span class={landmarkLabelDetail}> - {headlessProps["aria-label"]}</span>
          </Show>
        </div>
      </Show>
      {props.children}
    </HeadlessLandmark>
  );
}

export interface SkipLinkProps {
  /** The ID of the element to skip to (usually the main landmark). */
  href: string;
  /** The text to display in the skip link. */
  children?: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
}

// The skip link is visually hidden above the viewport and slides into view on
// focus. The reveal rides a raw `:focus` transform condition (the anchor is a
// plain DOM node with no render-prop state to key on), while the focus ring uses
// the standard `focus-ring` outline token on `:focus-visible` so it only shows for
// keyboard users.
const skipLink = style({
  position: "absolute",
  top: 0,
  insetStart: 0,
  zIndex: 50,
  paddingX: 16,
  paddingY: 8,
  backgroundColor: "accent",
  color: "white",
  fontWeight: "medium",
  borderRadius: "lg",
  transition: "default",
  transform: { default: "translateY(-100%)", ":focus": "translateY(0)" },
  outlineStyle: { default: "none", ":focus-visible": "solid" },
  outlineColor: "focus-ring",
  outlineWidth: 2,
  outlineOffset: 2,
});

/**
 * A skip link allows keyboard users to bypass repetitive navigation and jump directly to main content.
 * The link is visually hidden until focused.
 *
 * @example
 * ```tsx
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 *
 * <Landmark role="navigation">...</Landmark>
 *
 * <Landmark role="main" id="main-content">
 *   ...
 * </Landmark>
 * ```
 */
export function SkipLink(props: SkipLinkProps): JSX.Element {
  return (
    <a href={props.href} class={[skipLink, props.class].filter(Boolean).join(" ")}>
      {props.children ?? "Skip to main content"}
    </a>
  );
}

export interface LandmarkNavigatorProps {
  /** Additional CSS class name. */
  class?: string;
  /** Whether to show the navigator (for development/accessibility testing). */
  isVisible?: boolean;
}

// The floating landmark navigator is a dev/accessibility affordance. It reads as an
// elevated `gray-50` panel (a real fill, not the container-only `layer-*` var) with a
// hairline border and elevated shadow; neutral buttons darken on `:hover`, and the
// "Main" button uses the accent fill with white text like the rest of the S2 set.
const navPanel = style({
  position: "fixed",
  bottom: 16,
  insetEnd: 16,
  zIndex: 50,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  padding: 12,
  backgroundColor: "gray-50",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  borderRadius: "lg",
  boxShadow: "elevated",
});

const navHeading = style({
  fontSize: "ui-xs",
  fontWeight: "medium",
  color: "neutral-subdued",
  textTransform: "uppercase",
});

const navRow = style({ display: "flex", gap: 4 });

const navButton = style({
  paddingX: 8,
  paddingY: 4,
  fontSize: "ui-sm",
  color: "neutral",
  backgroundColor: { default: "gray-100", ":hover": "gray-200" },
  borderStyle: "none",
  borderRadius: "default",
  cursor: "pointer",
  transition: "default",
});

const navButtonAccent = style({
  paddingX: 12,
  paddingY: 4,
  fontSize: "ui-sm",
  color: "white",
  backgroundColor: { default: "accent", ":hover": "accent-1000" },
  borderStyle: "none",
  borderRadius: "default",
  cursor: "pointer",
  transition: "default",
});

/**
 * A floating navigator for landmarks, useful for development and accessibility testing.
 * Provides buttons to navigate between landmarks programmatically.
 *
 * @example
 * ```tsx
 * // Show in development only
 * <LandmarkNavigator isVisible={import.meta.env.DEV} />
 * ```
 */
export function LandmarkNavigator(props: LandmarkNavigatorProps): JSX.Element {
  const controller = useLandmarkController();

  return (
    <Show when={props.isVisible}>
      <div class={[navPanel, props.class].filter(Boolean).join(" ")}>
        <span class={navHeading}>Landmarks (F6)</span>
        <div class={navRow}>
          <button
            type="button"
            onClick={() => controller.focusPrevious()}
            class={navButton}
            title="Previous landmark (Shift+F6)"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => controller.focusMain()}
            class={navButtonAccent}
            title="Go to main content"
          >
            Main
          </button>
          <button
            type="button"
            onClick={() => controller.focusNext()}
            class={navButton}
            title="Next landmark (F6)"
          >
            →
          </button>
        </div>
      </div>
    </Show>
  );
}

export { useLandmarkController };
