/**
 * FocusableProvider - Provides DOM props to the nearest focusable child.
 *
 * This is a 1-1 port of React-Aria's FocusableProvider adapted for SolidJS.
 */

import { JSX, mergeProps, ParentComponent, splitProps } from "solid-js";
import { FocusableContext, FocusableContextValue, FocusableProviderProps } from "./createFocusable";

/**
 * Provides DOM props to the nearest focusable child.
 * Used to pass focus-related props through component boundaries.
 *
 * @example
 * ```tsx
 * import { FocusableProvider } from 'solidaria';
 *
 * function MyComponent() {
 *   return (
 *     <FocusableProvider onFocus={() => console.log('focused!')}>
 *       <NestedFocusableComponent />
 *     </FocusableProvider>
 *   );
 * }
 * ```
 */
export const FocusableProvider: ParentComponent<
  FocusableProviderProps & JSX.HTMLAttributes<HTMLElement>
> = (props) => {
  // Don't destructure: `const { children, ...otherProps } = props` evaluates the
  // `children` getter immediately (2nd statement of the body), instantiating the
  // nested subtree BEFORE this provider mounts — so a child that reads
  // FocusableContext during its own setup would miss us. splitProps keeps
  // otherProps a reactive proxy; children is read lazily inside the JSX, under
  // the mounted provider. Same pattern as solidaria-components' useRenderProps.
  const [, otherProps] = splitProps(props, ["children"]);

  const context = mergeProps(otherProps, {
    ref: (_el: HTMLElement) => {
      // Store ref if needed by parent
    },
  }) as FocusableContextValue;

  return <FocusableContext.Provider value={context}>{props.children}</FocusableContext.Provider>;
};
