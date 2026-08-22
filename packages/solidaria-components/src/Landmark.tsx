/**
 * Landmark component for solidaria-components
 *
 * Pre-wired headless landmark component that combines aria hooks.
 * Enables F6 keyboard navigation between major page sections.
 *
 * This is a local Solid component. The pinned React Aria Components source
 * has no Landmark counterpart; Solidaria owns the underlying ARIA behavior.
 */

import { type JSX, createContext, createMemo, createSignal, splitProps } from "solid-js";
import { ElementTag } from "./ElementTag";
import {
  createLandmark,
  getLandmarkController,
  type AriaLandmarkProps,
  type AriaLandmarkRole,
  type LandmarkController,
} from "@proyecto-viviana/solidaria";
import { type SlotProps, filterDOMProps } from "./utils";

export interface LandmarkRenderProps {
  /** The ARIA landmark role. */
  role: AriaLandmarkRole;
}

export interface LandmarkProps extends AriaLandmarkProps, SlotProps {
  /**
   * The HTML element type to render.
   * @default 'div' (or semantic element based on role)
   */
  elementType?: keyof JSX.IntrinsicElements;
  /** The CSS className for the element. A function may be provided to receive render props. */
  class?: string | ((renderProps: LandmarkRenderProps) => string);
  /** The inline style for the element. A function may be provided to receive render props. */
  style?: JSX.CSSProperties | ((renderProps: LandmarkRenderProps) => JSX.CSSProperties);
  /** Children content. */
  children?: JSX.Element;
}

export type { AriaLandmarkRole, LandmarkController };

export const LandmarkContext = createContext<LandmarkProps | null>(null);

/**
 * Maps ARIA landmark roles to their semantic HTML elements.
 * Using semantic elements is preferred when possible.
 */
const roleToSemanticElement: Partial<Record<AriaLandmarkRole, keyof JSX.IntrinsicElements>> = {
  main: "main",
  navigation: "nav",
  search: "search", // HTML5.3 <search> element
  banner: "header",
  contentinfo: "footer",
  complementary: "aside",
  form: "form",
  region: "section",
};

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
 * // Search
 * <Landmark role="search" aria-label="Site search">
 *   <form>...</form>
 * </Landmark>
 *
 * // Custom element type
 * <Landmark role="region" aria-label="Featured content" elementType="div">
 *   ...
 * </Landmark>
 * ```
 */
export function Landmark(props: LandmarkProps): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "children",
    "elementType",
  ]);

  // Element ref
  const [ref, setRef] = createSignal<HTMLElement>();

  // Determine the element type - use semantic element for the role if not specified
  const elementType = createMemo(() => {
    if (local.elementType) {
      return local.elementType;
    }
    return roleToSemanticElement[ariaProps.role] ?? "div";
  });

  // Create landmark aria props
  const landmarkAria = createLandmark(
    {
      get role() {
        return ariaProps.role;
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
      get id() {
        return ariaProps.id;
      },
      get focus() {
        return ariaProps.focus;
      },
    },
    ref,
  );

  const renderValues = createMemo<LandmarkRenderProps>(() => ({
    role: ariaProps.role,
  }));

  const resolvedClass = createMemo(() => {
    const cls = local.class;
    if (typeof cls === "function") {
      return cls(renderValues());
    }
    return cls ?? `solidaria-Landmark solidaria-Landmark--${ariaProps.role}`;
  });

  const resolvedStyle = createMemo(() => {
    const style = local.style;
    if (typeof style === "function") {
      return style(renderValues());
    }
    return style;
  });

  const domProps = createMemo(() => filterDOMProps(ariaProps, { global: true }));

  return (
    <ElementTag
      tag={elementType()}
      ref={setRef}
      {...domProps()}
      {...landmarkAria.landmarkProps}
      class={resolvedClass()}
      style={resolvedStyle()}
      slot={local.slot}
    >
      {props.children}
    </ElementTag>
  );
}

/**
 * Returns a controller for programmatic landmark navigation.
 *
 * @example
 * ```tsx
 * const controller = useLandmarkController();
 *
 * <button onClick={() => controller.focusMain()}>Skip to main content</button>
 * <button onClick={() => controller.focusNext()}>Next landmark</button>
 * ```
 */
export function useLandmarkController(): LandmarkController {
  return getLandmarkController();
}
