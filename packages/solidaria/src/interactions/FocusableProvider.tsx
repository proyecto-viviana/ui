/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useFocusable.tsx

/**
 * FocusableProvider - Provides DOM props to the nearest focusable child.
 *
 * Ported from packages/react-aria/src/interactions/useFocusable.tsx.
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
